package crypto

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestDecryptTypeScriptGoldenVector(t *testing.T) {
	goldenPath := filepath.Join("..", "..", "..", "fixtures", "crypto_interop", "golden_v1.ssat")
	raw, err := os.ReadFile(goldenPath)
	if err != nil {
		t.Fatalf("failed to read golden_v1.ssat: %v", err)
	}

	plaintext, err := Decrypt(raw, "synthetic-interop-pass-2026")
	if err != nil {
		t.Fatalf("Go failed to decrypt TypeScript-encrypted golden_v1.ssat: %v", err)
	}

	var doc map[string]any
	if err := json.Unmarshal(plaintext, &doc); err != nil {
		t.Fatalf("decrypted JSON invalid: %v", err)
	}
	if doc["audit_id"] != "demo-audit-001" {
		t.Fatalf("expected audit_id demo-audit-001, got %v", doc["audit_id"])
	}
	if doc["schema_version"] != "1.0.0" {
		t.Fatalf("expected schema_version 1.0.0, got %v", doc["schema_version"])
	}
}

func TestRoundTripWrongPassphraseAndTamperDetection(t *testing.T) {
	sample := []byte(`{"schema_version":"1.0.0","audit_id":"go-test-01","catalog_version":"1.0.0"}`)
	sealed, err := Encrypt(sample, "synthetic-go-passphrase-2026", DefaultKDFParams())
	if err != nil {
		t.Fatalf("Encrypt failed: %v", err)
	}

	// Valid decrypt
	out, err := Decrypt(sealed, "synthetic-go-passphrase-2026")
	if err != nil {
		t.Fatalf("Decrypt failed: %v", err)
	}
	if string(out) != string(sample) {
		t.Fatalf("round-trip mismatch: got %s", string(out))
	}

	// Wrong passphrase fails cleanly
	if _, err := Decrypt(sealed, "wrong-passphrase-2026"); err == nil {
		t.Fatal("expected error for wrong passphrase")
	}

	// Tampered AAD header (changing kdf_params.t without re-encrypting) must fail GCM tag
	var env Envelope
	if err := json.Unmarshal(sealed, &env); err != nil {
		t.Fatalf("unmarshal failed: %v", err)
	}
	env.KDFParams.T = 4
	tamperedHeader, _ := json.Marshal(env)
	if _, err := Decrypt(tamperedHeader, "synthetic-go-passphrase-2026"); err == nil {
		t.Fatal("expected tampered AAD header to fail decryption")
	}

	// Hostile DoS KDF parameter (m = 4GB) rejected before allocation
	env.KDFParams.M = 4 * 1024 * 1024
	dosHeader, _ := json.Marshal(env)
	if _, err := Decrypt(dosHeader, "synthetic-go-passphrase-2026"); err == nil || !strings.Contains(err.Error(), "memory") {
		t.Fatalf("expected hostile KDF memory bound rejection, got: %v", err)
	}
}
