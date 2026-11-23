package main

import (
	"errors"
	"io"
	"os"
	"path/filepath"
	"strings"

	ssatcrypto "github.com/mguhlin/nspa/audit/go/internal/crypto"
	wruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

func (d *Desktop) begin() error {
	d.mu.Lock()
	defer d.mu.Unlock()
	if d.busy {
		return errors.New("finish the current file operation first")
	}
	if d.quitAccepted {
		return errors.New("the app is closing; no new file operation can start")
	}
	d.busy = true
	return nil
}
func (d *Desktop) end() { d.mu.Lock(); d.busy = false; d.mu.Unlock() }

func safeName(name, ext string) string {
	name = filepath.Base(strings.ReplaceAll(name, `\`, `/`))
	if name == "." || name == "" {
		name = "scholarship-audit" + ext
	}
	if !strings.HasSuffix(strings.ToLower(name), ext) {
		name += ext
	}
	return name
}

// Only the OS picker issues a destination. Renderer-supplied paths are never used.
func (d *Desktop) pickSave(name, ext string) (string, error) {
	name = safeName(name, ext)
	if d.smokeDir != "" {
		return filepath.Join(d.smokeDir, name), nil
	}
	return wruntime.SaveFileDialog(d.ctx, wruntime.SaveDialogOptions{Title: "Save a local file", DefaultFilename: name, CanCreateDirectories: true, Filters: []wruntime.FileFilter{{DisplayName: "SSAT output (" + ext + ")", Pattern: "*" + ext}}})
}

// Stage privately next to the chosen file; failed writes leave the original intact.
// Rename replacement/durability guarantees depend on the operating system/filesystem.
func writeSelected(path string, content []byte) error {
	if info, err := os.Lstat(path); err == nil && (!info.Mode().IsRegular() || info.Mode()&os.ModeSymlink != 0) {
		return errors.New("choose a regular file, not a link or special file")
	}
	f, err := os.CreateTemp(filepath.Dir(path), ".ssat-output-*")
	if err != nil {
		return err
	}
	defer os.Remove(f.Name())
	if err = f.Chmod(0600); err != nil {
		f.Close()
		return err
	}
	if _, err = f.Write(content); err != nil {
		f.Close()
		return err
	}
	if err = f.Sync(); err != nil {
		f.Close()
		return err
	}
	if err = f.Close(); err != nil {
		return err
	}
	return os.Rename(f.Name(), path)
}

func (d *Desktop) SaveAudit(name, encrypted string) (string, error) {
	if int64(len(encrypted)) > ssatcrypto.MaxEnvelopeBytes {
		return "", errors.New("audit file is too large")
	}
	if _, _, _, _, err := ssatcrypto.ValidateEnvelopeStructure([]byte(encrypted)); err != nil {
		return "", errors.New("only encrypted .ssat files can be saved as audits")
	}
	if err := d.begin(); err != nil {
		return "", err
	}
	defer d.end()
	path, err := d.pickSave(name, ".ssat")
	if err != nil || path == "" {
		return "", err
	}
	if err = writeSelected(path, []byte(encrypted)); err != nil {
		return "", err
	}
	return path, nil
}

func (d *Desktop) OpenAudit() (map[string]string, error) {
	if err := d.begin(); err != nil {
		return nil, err
	}
	defer d.end()
	var path string
	var err error
	if d.smokeDir != "" {
		path = filepath.Join(d.smokeDir, "native-fictional.ssat")
	} else {
		path, err = wruntime.OpenFileDialog(d.ctx, wruntime.OpenDialogOptions{Title: "Open an encrypted audit", Filters: []wruntime.FileFilter{{DisplayName: "Encrypted SSAT audit", Pattern: "*.ssat"}}})
	}
	if err != nil || path == "" {
		return nil, err
	}
	data, err := readSelected(path)
	if err != nil {
		return nil, err
	}
	return map[string]string{"path": path, "encrypted_ssat": string(data)}, nil
}
func readSelected(path string) ([]byte, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	info, err := f.Stat()
	if err != nil {
		return nil, err
	}
	if !info.Mode().IsRegular() || info.Size() > ssatcrypto.MaxEnvelopeBytes {
		return nil, errors.New("choose a regular .ssat file within the size limit")
	}
	data, err := io.ReadAll(io.LimitReader(f, ssatcrypto.MaxEnvelopeBytes+1))
	if err != nil {
		return nil, err
	}
	if int64(len(data)) > ssatcrypto.MaxEnvelopeBytes {
		return nil, errors.New("audit file exceeds size limit")
	}
	if _, _, _, _, err = ssatcrypto.ValidateEnvelopeStructure(data); err != nil {
		return nil, err
	}
	return data, nil
}

func (d *Desktop) ExportFile(name, content string) (string, error) {
	if len(content) > 16*1024*1024 {
		return "", errors.New("report is too large")
	}
	ext := strings.ToLower(filepath.Ext(name))
	switch ext {
	case ".html", ".md", ".csv", ".json", ".txt":
	default:
		return "", errors.New("unsupported report type")
	}
	if err := d.begin(); err != nil {
		return "", err
	}
	defer d.end()
	path, err := d.pickSave(name, ext)
	if err != nil || path == "" {
		return "", err
	}
	if err = writeSelected(path, []byte(content)); err != nil {
		return "", err
	}
	return path, nil
}
