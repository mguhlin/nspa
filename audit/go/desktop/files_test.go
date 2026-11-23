package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestNativeEncryptedFilesAndAuthority(t *testing.T) {
	d := &Desktop{smokeDir: t.TempDir()}
	golden, err := os.ReadFile("../../fixtures/crypto_interop/golden_v1.ssat")
	if err != nil {
		t.Fatal(err)
	}
	path, err := d.SaveAudit("../../native-fictional.ssat", string(golden))
	if err != nil {
		t.Fatal(err)
	}
	if filepath.Dir(path) != d.smokeDir {
		t.Fatal("renderer path escaped selected destination")
	}
	opened, err := d.OpenAudit()
	if err != nil || opened["encrypted_ssat"] != string(golden) {
		t.Fatalf("round trip: %v", err)
	}
	if _, err = d.SaveAudit("native-fictional.ssat", `{"plaintext":true}`); err == nil {
		t.Fatal("accepted plaintext")
	}
	after, _ := os.ReadFile(path)
	if string(after) != string(golden) {
		t.Fatal("rejected save changed original")
	}
	if _, err = d.ExportFile("unsafe.exe", "test"); err == nil {
		t.Fatal("accepted executable export")
	}
	if _, err = d.ExportFile("audit.ssat", "plaintext"); err == nil {
		t.Fatal("accepted plaintext audit export")
	}
	if _, err = d.ExportFile("summary.html", "<h1>FICTIONAL</h1>"); err != nil {
		t.Fatal(err)
	}
	if _, err = d.ExportFile("huge.txt", strings.Repeat("x", 16*1024*1024+1)); err == nil {
		t.Fatal("accepted oversized export")
	}
	d.busy = true
	if _, err = d.SaveAudit("other.ssat", string(golden)); err == nil {
		t.Fatal("accepted concurrent save")
	}
}

func TestReadSelectedRejectsInvalidAndWriteFailurePreservesOriginal(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "original.ssat")
	if err := os.WriteFile(p, []byte("invalid"), 0600); err != nil {
		t.Fatal(err)
	}
	if _, err := readSelected(p); err == nil {
		t.Fatal("accepted malformed envelope")
	}
	if err := writeSelected(dir, []byte("replacement")); err == nil {
		t.Fatal("replaced directory")
	}
}
