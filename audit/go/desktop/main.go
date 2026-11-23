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

const version = "1.1.5"

type Desktop struct {
	ctx          context.Context
	mu           sync.Mutex
	dirty        bool
	busy         bool
	quitAccepted bool
	smokeDir     string
	smokeFailed  bool
}

func (d *Desktop) startup(ctx context.Context) { d.ctx = ctx }
func (d *Desktop) Info() map[string]string {
	return map[string]string{"mode": "go-local", "version": version, "csrf_token": "native-desktop", "default_dir": "Native file picker"}
}
func (d *Desktop) SetUnsaved(dirty bool) { d.mu.Lock(); d.dirty = dirty; d.mu.Unlock() }

// Native close and the Quit app button share one confirmation in the app UI.
// GTK's standard message dialog does not preserve custom button labels.
func (d *Desktop) closeDecision() (prevent bool, requestConfirmation bool) {
	d.mu.Lock()
	defer d.mu.Unlock()
	if d.busy {
		return true, false
	}
	if d.quitAccepted || !d.dirty {
		return false, false
	}
	return true, true
}
func (d *Desktop) beforeClose(ctx context.Context) bool {
	prevent, requestConfirmation := d.closeDecision()
	if requestConfirmation {
		wruntime.EventsEmit(ctx, "ssat:close-requested")
	}
	return prevent
}
func (d *Desktop) Quit() error {
	d.mu.Lock()
	busy := d.busy
	d.mu.Unlock()
	if busy {
		return fmt.Errorf("finish the current file operation before closing")
	}
	wruntime.Quit(d.ctx)
	return nil
}
func (d *Desktop) acceptQuit() error {
	d.mu.Lock()
	defer d.mu.Unlock()
	if d.busy {
		return fmt.Errorf("finish the current file operation before closing")
	}
	d.quitAccepted = true
	return nil
}

// ConfirmQuit is called only after the app's Close anyway confirmation.
// Busy file operations must finish before the application can exit.
func (d *Desktop) ConfirmQuit() error {
	if err := d.acceptQuit(); err != nil {
		return err
	}
	wruntime.Quit(d.ctx)
	return nil
}

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
