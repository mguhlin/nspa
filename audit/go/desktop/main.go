package main

import (
	"context"
	"flag"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/mguhlin/nspa/audit/go/internal/ui"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	wruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

const version = "1.1.1"

type Desktop struct {
	ctx         context.Context
	mu          sync.Mutex
	dirty       bool
	busy        bool
	smokeDir    string
	smokeFailed bool
}

func (d *Desktop) startup(ctx context.Context) { d.ctx = ctx }
func (d *Desktop) Info() map[string]string {
	return map[string]string{"mode": "go-local", "version": version, "csrf_token": "native-desktop", "default_dir": "Native file picker"}
}
func (d *Desktop) SetUnsaved(dirty bool) { d.mu.Lock(); d.dirty = dirty; d.mu.Unlock() }
func (d *Desktop) beforeClose(ctx context.Context) bool {
	d.mu.Lock()
	dirty, busy := d.dirty, d.busy
	d.mu.Unlock()
	if busy {
		return true
	}
	if !dirty || d.smokeDir != "" {
		return false
	}
	answer, err := wruntime.MessageDialog(ctx, wruntime.MessageDialogOptions{Type: wruntime.QuestionDialog, Title: "Unsaved audit", Message: "Your latest changes have not been saved to an audit file. Close and discard those changes?", Buttons: []string{"Keep working", "Discard changes"}, DefaultButton: "Keep working", CancelButton: "Keep working"})
	return err != nil || answer != "Discard changes"
}
func (d *Desktop) Quit() { wruntime.Quit(d.ctx) }

// Test hooks require an explicit launch flag. They never accept renderer paths.
func (d *Desktop) SmokeEnabled() bool { return d.smokeDir != "" }
func (d *Desktop) CompleteSmoke(passed bool, report string) error {
	if d.smokeDir == "" || len(report) > 100000 {
		return fmt.Errorf("smoke test disabled or invalid report")
	}
	d.smokeFailed = !passed
	if err := os.WriteFile(filepath.Join(d.smokeDir, "native-smoke.json"), []byte(report), 0600); err != nil {
		d.smokeFailed = true
		return err
	}
	d.SetUnsaved(false)
	go func() { time.Sleep(200 * time.Millisecond); wruntime.Quit(d.ctx) }()
	return nil
}

func security(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'")
		w.Header().Set("Cache-Control", "no-store")
		w.Header().Set("Referrer-Policy", "no-referrer")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		next.ServeHTTP(w, r)
	})
}
func main() {
	showVersion := flag.Bool("version", false, "Print version and exit")
	smoke := flag.String("smoke-test", "", "Run synthetic native test in this output folder")
	flag.Parse()
	if *showVersion {
		fmt.Println("SSAT Desktop " + version)
		return
	}
	assets, err := ui.DistFS()
	if err != nil {
		log.Fatal(err)
	}
	app := &Desktop{}
	if *smoke != "" {
		app.smokeDir, err = filepath.Abs(*smoke)
		if err != nil {
			log.Fatal(err)
		}
		if err = os.MkdirAll(app.smokeDir, 0700); err != nil {
			log.Fatal(err)
		}
	}
	icon, _ := fs.ReadFile(assets, "nspa-logo.png")
	err = wails.Run(&options.App{
		Title: "Scholarship Security Audit Toolkit", Width: 1360, Height: 900, MinWidth: 700, MinHeight: 600,
		BackgroundColour: options.NewRGB(245, 247, 252),
		AssetServer:      &assetserver.Options{Assets: assets, Middleware: security},
		OnStartup:        app.startup, OnBeforeClose: app.beforeClose, Bind: []interface{}{app},
		DragAndDrop: &options.DragAndDrop{EnableFileDrop: false, DisableWebViewDrop: true},
		Linux:       &linux.Options{Icon: icon, ProgramName: "ssat", WebviewGpuPolicy: linux.WebviewGpuPolicyNever},
		Mac:         &mac.Options{About: &mac.AboutInfo{Title: "SSAT Desktop", Message: "Offline scholarship security roadmap by Miguel Guhlin", Icon: icon}},
	})
	if err != nil {
		log.Fatal(err)
	}
	if app.smokeFailed {
		os.Exit(1)
	}
}
