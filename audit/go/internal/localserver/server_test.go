package localserver

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"testing/fstest"
	"time"

	ssatcrypto "github.com/mguhlin/nspa/audit/go/internal/crypto"
	"github.com/mguhlin/nspa/audit/go/internal/storage"
)

func TestLocalServerSecurityAndAtomicSave(t *testing.T) {
	dir := t.TempDir()
	vault, err := storage.NewVault(dir)
	if err != nil {
		t.Fatalf("NewVault failed: %v", err)
	}

	fakeFS := fstest.MapFS{
		"index.html": {Data: []byte("<!doctype html><title>SSAT</title>")},
	}

	srv, err := New(vault, fakeFS)
	if err != nil {
		t.Fatalf("New server failed: %v", err)
	}
	go func() { _ = srv.Serve() }()
	defer func() {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		_ = srv.Close(ctx)
	}()

	if !strings.HasPrefix(srv.URL(), "http://127.0.0.1:") {
		t.Fatalf("expected loopback 127.0.0.1 URL, got %s", srv.URL())
	}

	client := &http.Client{Timeout: 5 * time.Second}

	// 1. DNS rebinding defense: spoofed Host header must be rejected with 403
	reqBadHost, _ := http.NewRequest(http.MethodGet, srv.URL(), nil)
	reqBadHost.Host = "evil.example:1234"
	resp, err := client.Do(reqBadHost)
	if err != nil {
		t.Fatalf("bad host request failed: %v", err)
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusForbidden {
		t.Fatalf("expected 403 for spoofed Host header, got %d", resp.StatusCode)
	}

	// 2. Cross-site request must be rejected with 403
	reqCross, _ := http.NewRequest(http.MethodGet, srv.URL(), nil)
	reqCross.Header.Set("Sec-Fetch-Site", "cross-site")
	resp, err = client.Do(reqCross)
	if err != nil {
		t.Fatalf("cross-site request failed: %v", err)
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusForbidden {
		t.Fatalf("expected 403 for cross-site request, got %d", resp.StatusCode)
	}

	// 3. Unauthenticated /api/session must fail with 401
	resp, err = client.Get(srv.URL() + "api/session")
	if err != nil {
		t.Fatalf("unauth session check failed: %v", err)
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected 401 without session cookie, got %d", resp.StatusCode)
	}

	// 4. Legitimate initial GET / issues HttpOnly SameSite=Strict cookie (no token in URL!)
	resp, err = client.Get(srv.URL())
	if err != nil {
		t.Fatalf("GET / failed: %v", err)
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 on GET /, got %d", resp.StatusCode)
	}
	var sessionCookie *http.Cookie
	for _, c := range resp.Cookies() {
		if c.Name == SessionCookieName {
			sessionCookie = c
		}
	}
	if sessionCookie == nil || !sessionCookie.HttpOnly || sessionCookie.SameSite != http.SameSiteStrictMode {
		t.Fatalf("expected HttpOnly SameSite=Strict session cookie, got %+v", sessionCookie)
	}

	// Second claim attempt without cookie must NOT receive a cookie
	resp2, _ := client.Get(srv.URL())
	resp2.Body.Close()
	if len(resp2.Cookies()) != 0 {
		t.Fatal("expected single-claim session cookie not to be reissued to second unauthenticated client")
	}

	// 5. Fetch CSRF token using valid session cookie
	reqSess, _ := http.NewRequest(http.MethodGet, srv.URL()+"api/session", nil)
	reqSess.AddCookie(sessionCookie)
	resp, err = client.Do(reqSess)
	if err != nil {
		t.Fatalf("GET /api/session failed: %v", err)
	}
	var sessInfo struct {
		Mode      string `json:"mode"`
		CSRFToken string `json:"csrf_token"`
	}
	_ = json.NewDecoder(resp.Body).Decode(&sessInfo)
	resp.Body.Close()
	if sessInfo.Mode != "go-local" || sessInfo.CSRFToken == "" {
		t.Fatalf("unexpected session payload: %+v", sessInfo)
	}

	// 6. POST /api/save without CSRF header must fail with 403
	sealed, err := ssatcrypto.Encrypt([]byte(`{"schema_version":"1.0.0","audit_id":"t1"}`), "synthetic-passphrase-2026", ssatcrypto.DefaultKDFParams())
	if err != nil {
		t.Fatalf("Encrypt failed: %v", err)
	}
	saveBody, _ := json.Marshal(map[string]string{
		"filename":       "test-audit.ssat",
		"encrypted_ssat": string(sealed),
	})
	reqNoCsrf, _ := http.NewRequest(http.MethodPost, srv.URL()+"api/save", bytes.NewReader(saveBody))
	reqNoCsrf.AddCookie(sessionCookie)
	resp, _ = client.Do(reqNoCsrf)
	resp.Body.Close()
	if resp.StatusCode != http.StatusForbidden {
		t.Fatalf("expected 403 without CSRF header, got %d", resp.StatusCode)
	}

	// 7. POST /api/save with valid cookie + CSRF succeeds atomically
	reqSave, _ := http.NewRequest(http.MethodPost, srv.URL()+"api/save", bytes.NewReader(saveBody))
	reqSave.AddCookie(sessionCookie)
	reqSave.Header.Set(CSRFHeaderName, sessInfo.CSRFToken)
	resp, err = client.Do(reqSave)
	if err != nil {
		t.Fatalf("POST /api/save failed: %v", err)
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 on valid save, got %d", resp.StatusCode)
	}

	// 8. Path traversal & plaintext save must be rejected AND preserve previous valid file
	badBodies := []map[string]string{
		{"filename": "../escape.ssat", "encrypted_ssat": string(sealed)},
		{"filename": "test-audit.ssat", "encrypted_ssat": `{"plaintext":"not-encrypted"}`},
	}
	for _, bad := range badBodies {
		b, _ := json.Marshal(bad)
		reqBad, _ := http.NewRequest(http.MethodPost, srv.URL()+"api/save", bytes.NewReader(b))
		reqBad.AddCookie(sessionCookie)
		reqBad.Header.Set(CSRFHeaderName, sessInfo.CSRFToken)
		rBad, _ := client.Do(reqBad)
		rBad.Body.Close()
		if rBad.StatusCode != http.StatusBadRequest {
			t.Fatalf("expected 400 for unsafe save %v, got %d", bad["filename"], rBad.StatusCode)
		}
	}

	// Confirm original valid file was preserved unmodified (T-16)
	onDisk, err := os.ReadFile(filepath.Join(dir, "test-audit.ssat"))
	if err != nil || string(onDisk) != string(sealed) {
		t.Fatal("previous valid encrypted file was not preserved after rejected save")
	}

	// 9. Open saved file via /api/open
	openBody, _ := json.Marshal(map[string]string{"filename": "test-audit.ssat"})
	reqOpen, _ := http.NewRequest(http.MethodPost, srv.URL()+"api/open", bytes.NewReader(openBody))
	reqOpen.AddCookie(sessionCookie)
	reqOpen.Header.Set(CSRFHeaderName, sessInfo.CSRFToken)
	resp, err = client.Do(reqOpen)
	if err != nil {
		t.Fatalf("POST /api/open failed: %v", err)
	}
	var opened struct {
		EncryptedSsat string `json:"encrypted_ssat"`
	}
	_ = json.NewDecoder(resp.Body).Decode(&opened)
	resp.Body.Close()
	if opened.EncryptedSsat != string(sealed) {
		t.Fatal("opened .ssat bytes do not match saved bytes")
	}
}
