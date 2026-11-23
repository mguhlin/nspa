package storage

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"

	ssatcrypto "github.com/mguhlin/nspa/audit/go/internal/crypto"
)

var safeFilenameRe = regexp.MustCompile(`^[A-Za-z0-9][A-Za-z0-9._-]{0,110}\.ssat$`)

// Vault manages encrypted .ssat files inside a dedicated local directory.
type Vault struct {
	BaseDir string
}

func NewVault(dir string) (*Vault, error) {
	abs, err := filepath.Abs(dir)
	if err != nil {
		return nil, err
	}
	if err := os.MkdirAll(abs, 0o700); err != nil {
		return nil, fmt.Errorf("cannot initialize local vault directory: %w", err)
	}
	resolved, err := filepath.EvalSymlinks(abs)
	if err != nil {
		return nil, err
	}
	return &Vault{BaseDir: resolved}, nil
}

// SafePath validates that filename is a simple .ssat name with no path traversal or symlink escape.
func (v *Vault) SafePath(filename string) (string, error) {
	trimmed := strings.TrimSpace(filename)
	if strings.ContainsAny(trimmed, `/\:`+"\x00") || strings.Contains(trimmed, "..") {
		return "", errors.New("invalid filename: path separators and traversal are not allowed")
	}
	if !strings.HasSuffix(strings.ToLower(trimmed), ".ssat") {
		trimmed += ".ssat"
	}
	if !safeFilenameRe.MatchString(trimmed) {
		return "", errors.New("filename may contain only letters, digits, dots, underscores, and hyphens ending in .ssat")
	}
	target := filepath.Join(v.BaseDir, trimmed)
	rel, err := filepath.Rel(v.BaseDir, target)
	if err != nil || strings.HasPrefix(rel, "..") || filepath.IsAbs(rel) {
		return "", errors.New("resolved path escapes local audit folder")
	}
	// If file exists, verify it is not a symlink
	if info, err := os.Lstat(target); err == nil {
		if info.Mode()&os.ModeSymlink != 0 {
			return "", errors.New("refusing to read or overwrite a symbolic link")
		}
		if info.IsDir() {
			return "", errors.New("target path is a directory")
		}
	}
	return target, nil
}

// SaveEncrypted validates that data is a well-formed .ssat v1 encrypted envelope
// (never allowing plaintext saves) and writes it atomically with 0600 permissions.
func (v *Vault) SaveEncrypted(filename string, rawSsat []byte) (string, error) {
	if _, _, _, _, err := ssatcrypto.ValidateEnvelopeStructure(rawSsat); err != nil {
		return "", fmt.Errorf("refusing to save unencrypted or malformed audit: %w", err)
	}
	target, err := v.SafePath(filename)
	if err != nil {
		return "", err
	}

	tmp, err := os.CreateTemp(v.BaseDir, ".ssat-save-*.tmp")
	if err != nil {
		return "", errors.New("failed to create temporary save file")
	}
	tmpPath := tmp.Name()
	cleanup := true
	defer func() {
		if cleanup {
			_ = os.Remove(tmpPath)
		}
	}()

	if err := tmp.Chmod(0o600); err != nil {
		_ = tmp.Close()
		return "", errors.New("failed to set private permissions on save file")
	}
	if _, err := tmp.Write(rawSsat); err != nil {
		_ = tmp.Close()
		return "", errors.New("failed to write encrypted audit bytes")
	}
	if err := tmp.Sync(); err != nil {
		_ = tmp.Close()
		return "", errors.New("failed to flush encrypted audit file to disk")
	}
	if err := tmp.Close(); err != nil {
		return "", errors.New("failed to close encrypted audit file")
	}
	if err := os.Rename(tmpPath, target); err != nil {
		return "", errors.New("failed to commit encrypted audit file atomically")
	}
	cleanup = false
	return target, nil
}

// ReadEncrypted reads a bounded .ssat file from the vault directory.
func (v *Vault) ReadEncrypted(filename string) (string, []byte, error) {
	target, err := v.SafePath(filename)
	if err != nil {
		return "", nil, err
	}
	info, err := os.Lstat(target)
	if err != nil {
		return "", nil, errors.New("requested .ssat file not found")
	}
	if info.Mode()&os.ModeSymlink != 0 || info.IsDir() {
		return "", nil, errors.New("refusing to open non-regular file")
	}
	if info.Size() > ssatcrypto.MaxEnvelopeBytes {
		return "", nil, errors.New("audit file exceeds maximum allowed size")
	}
	data, err := os.ReadFile(target)
	if err != nil {
		return "", nil, errors.New("unable to read audit file")
	}
	if _, _, _, _, err := ssatcrypto.ValidateEnvelopeStructure(data); err != nil {
		return "", nil, err
	}
	return target, data, nil
}

// ListFiles returns sorted safe .ssat filenames in the vault directory.
func (v *Vault) ListFiles() ([]string, error) {
	entries, err := os.ReadDir(v.BaseDir)
	if err != nil {
		return nil, err
	}
	var out []string
	for _, e := range entries {
		if e.IsDir() || e.Type()&os.ModeSymlink != 0 {
			continue
		}
		if safeFilenameRe.MatchString(e.Name()) {
			out = append(out, e.Name())
		}
	}
	sort.Strings(out)
	return out, nil
}
