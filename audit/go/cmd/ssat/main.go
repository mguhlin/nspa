package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"runtime"
	"syscall"
	"time"

	"github.com/mguhlin/nspa/audit/go/internal/localserver"
	"github.com/mguhlin/nspa/audit/go/internal/storage"
	"github.com/mguhlin/nspa/audit/go/internal/ui"
)

func defaultAuditDir() string {
	home, err := os.UserHomeDir()
	if err != nil || home == "" {
		return "./ssat-audits"
	}
	return filepath.Join(home, "SSAT-Audits")
}

func openBrowser(url string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "darwin":
		cmd = exec.Command("open", url)
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	default:
		cmd = exec.Command("xdg-open", url)
	}
	_ = cmd.Start()
}

func main() {
	auditDir := flag.String("dir", defaultAuditDir(), "Local folder for encrypted .ssat audit files")
	noBrowser := flag.Bool("no-browser", false, "Do not automatically launch the default web browser")
	showVersion := flag.Bool("version", false, "Print version information and exit")
	flag.Parse()

	if *showVersion {
		fmt.Printf("SSAT Standalone Local Edition v%s (%s/%s)\n", localserver.AppVersion, runtime.GOOS, runtime.GOARCH)
		return
	}

	vault, err := storage.NewVault(*auditDir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error initializing local audit folder: %v\n", err)
		os.Exit(1)
	}

	distFS, err := ui.DistFS()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error loading embedded web assets: %v\n", err)
		os.Exit(1)
	}

	srv, err := localserver.New(vault, distFS)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error starting local server: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("Scholarship Security Audit Toolkit (SSAT) — Standalone Local Edition")
	fmt.Printf("Local URL (loopback 127.0.0.1 only): %s\n", srv.URL())
	fmt.Printf("Encrypted .ssat folder:              %s\n", vault.BaseDir)
	fmt.Println("No data leaves your computer. Press Ctrl+C or click 'Stop Server' in the browser to exit.")

	if !*noBrowser {
		go func() {
			time.Sleep(250 * time.Millisecond)
			openBrowser(srv.URL())
		}()
	}

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)

	errCh := make(chan error, 1)
	go func() {
		errCh <- srv.Serve()
	}()

	select {
	case <-sigCh:
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()
		_ = srv.Close(ctx)
	case <-srv.ShutdownChan():
	case err := <-errCh:
		if err != nil {
			fmt.Fprintf(os.Stderr, "Server error: %v\n", err)
			os.Exit(1)
		}
	}
}
