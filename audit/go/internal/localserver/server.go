package localserver

import (
	"context"
	"crypto/rand"
	"crypto/subtle"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	ssatcrypto "github.com/mguhlin/nspa/audit/go/internal/crypto"
	"github.com/mguhlin/nspa/audit/go/internal/storage"
)

const (
	SessionCookieName = "ssat_local_session"
	CSRFHeaderName    = "X-SSAT-CSRF"
	AppVersion        = "1.0.0"
)

type Server struct {
	vault        *storage.Vault
	assetsFS     fs.FS
	expectedHost string
	originURL    string
	sessionToken string
	csrfToken    string
	mu           sync.Mutex
	claimed      bool
	httpServer   *http.Server
	listener     net.Listener
	shutdownCh   chan struct{}
	shutdownOnce sync.Once
}

func randomHex(bytesLen int) (string, error) {
	b := make([]byte, bytesLen)
	if _, err := io.ReadFull(rand.Reader, b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// New binds strictly to 127.0.0.1:0 (never 0.0.0.0) and prepares the authenticated local HTTP server.
func New(vault *storage.Vault, assetsFS fs.FS) (*Server, error) {
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return nil, fmt.Errorf("failed to bind loopback listener: %w", err)
	}
	sessionTok, err := randomHex(32)
	if err != nil {
		_ = ln.Close()
		return nil, err
	}
	csrfTok, err := randomHex(32)
	if err != nil {
		_ = ln.Close()
		return nil, err
	}

	addr := ln.Addr().String()
	s := &Server{
		vault:        vault,
		assetsFS:     assetsFS,
		expectedHost: addr,
		originURL:    "http://" + addr,
		sessionToken: sessionTok,
		csrfToken:    csrfTok,
		listener:     ln,
		shutdownCh:   make(chan struct{}),
	}

	s.httpServer = &http.Server{
		Handler:           s.routes(),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
	}
	return s, nil
}

func (s *Server) URL() string {
	return s.originURL + "/"
}

func (s *Server) ShutdownChan() <-chan struct{} {
	return s.shutdownCh
}

func (s *Server) Serve() error {
	err := s.httpServer.Serve(s.listener)
	if errors.Is(err, http.ErrServerClosed) {
		return nil
	}
	return err
}

func (s *Server) Close(ctx context.Context) error {
	s.shutdownOnce.Do(func() { close(s.shutdownCh) })
	return s.httpServer.Shutdown(ctx)
}

func (s *Server) routes() http.Handler {
	mux := http.NewServeMux()
	fileServer := http.FileServer(http.FS(s.assetsFS))

	mux.HandleFunc("/api/session", s.handleSession)
	mux.HandleFunc("/api/files", s.handleListFiles)
	mux.HandleFunc("/api/save", s.handleSave)
	mux.HandleFunc("/api/open", s.handleOpen)
	mux.HandleFunc("/api/shutdown", s.handleShutdown)

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		// On initial root navigation (non-cross-site), issue single-claim HttpOnly SameSite=Strict cookie
		// so authentication tokens are NEVER placed in URLs.
		if r.URL.Path == "/" || r.URL.Path == "/index.html" {
			secSite := r.Header.Get("Sec-Fetch-Site")
			if secSite != "cross-site" {
				s.maybeIssueSessionCookie(w, r)
			}
		}
		fileServer.ServeHTTP(w, r)
	})

	return s.securityMiddleware(mux)
}

func (s *Server) securityMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Strict Host header validation defeats DNS rebinding attacks against 127.0.0.1
		if r.Host != s.expectedHost {
			http.Error(w, "forbidden host header", http.StatusForbidden)
			return
		}

		// Reject cross-site browser requests outright
		secSite := r.Header.Get("Sec-Fetch-Site")
		if secSite == "cross-site" {
			http.Error(w, "cross-site requests are forbidden", http.StatusForbidden)
			return
		}

		if origin := r.Header.Get("Origin"); origin != "" && origin != s.originURL {
			http.Error(w, "forbidden origin", http.StatusForbidden)
			return
		}

		// Security headers on every response
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "no-referrer")
		w.Header().Set(
			"Content-Security-Policy",
			"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self';",
		)
		next.ServeHTTP(w, r)
	})
}

func (s *Server) maybeIssueSessionCookie(w http.ResponseWriter, r *http.Request) {
	if s.hasValidCookie(r) {
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.claimed {
		return
	}
	s.claimed = true
	http.SetCookie(w, &http.Cookie{
		Name:     SessionCookieName,
		Value:    s.sessionToken,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
	})
}

func (s *Server) hasValidCookie(r *http.Request) bool {
	c, err := r.Cookie(SessionCookieName)
	if err != nil {
		return false
	}
	return subtle.ConstantTimeCompare([]byte(c.Value), []byte(s.sessionToken)) == 1
}

func (s *Server) hasValidCSRF(r *http.Request) bool {
	hdr := r.Header.Get(CSRFHeaderName)
	if hdr == "" {
		return false
	}
	return subtle.ConstantTimeCompare([]byte(hdr), []byte(s.csrfToken)) == 1
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func (s *Server) handleSession(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	if !s.hasValidCookie(r) {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "session cookie required; open the local URL directly"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{
		"mode":        "go-local",
		"csrf_token":  s.csrfToken,
		"version":     AppVersion,
		"default_dir": s.vault.BaseDir,
	})
}

func (s *Server) requireAuthAndCSRF(w http.ResponseWriter, r *http.Request, method string) bool {
	if r.Method != method {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return false
	}
	if !s.hasValidCookie(r) {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized local session"})
		return false
	}
	if !s.hasValidCSRF(r) {
		writeJSON(w, http.StatusForbidden, map[string]string{"error": "missing or invalid CSRF header"})
		return false
	}
	if method == http.MethodPost {
		origin := r.Header.Get("Origin")
		if origin != "" && origin != s.originURL {
			writeJSON(w, http.StatusForbidden, map[string]string{"error": "invalid origin"})
			return false
		}
	}
	return true
}

func (s *Server) handleListFiles(w http.ResponseWriter, r *http.Request) {
	if !s.requireAuthAndCSRF(w, r, http.MethodGet) {
		return
	}
	files, err := s.vault.ListFiles()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "unable to list local .ssat files"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"files": files})
}

func (s *Server) handleSave(w http.ResponseWriter, r *http.Request) {
	if !s.requireAuthAndCSRF(w, r, http.MethodPost) {
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, ssatcrypto.MaxEnvelopeBytes+4096)
	var req struct {
		Filename      string `json:"filename"`
		EncryptedSsat string `json:"encrypted_ssat"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request payload"})
		return
	}
	if strings.TrimSpace(req.Filename) == "" || strings.TrimSpace(req.EncryptedSsat) == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "filename and encrypted_ssat are required"})
		return
	}
	savedPath, err := s.vault.SaveEncrypted(req.Filename, []byte(req.EncryptedSsat))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"saved_path": savedPath})
}

func (s *Server) handleOpen(w http.ResponseWriter, r *http.Request) {
	if !s.requireAuthAndCSRF(w, r, http.MethodPost) {
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, 4096)
	var req struct {
		Filename string `json:"filename"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request payload"})
		return
	}
	fullPath, raw, err := s.vault.ReadEncrypted(req.Filename)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{
		"path":           fullPath,
		"encrypted_ssat": string(raw),
	})
}

func (s *Server) handleShutdown(w http.ResponseWriter, r *http.Request) {
	if !s.requireAuthAndCSRF(w, r, http.MethodPost) {
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "stopping"})
	go func() {
		time.Sleep(150 * time.Millisecond)
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()
		_ = s.Close(ctx)
	}()
}
