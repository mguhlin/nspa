package ui

import (
	"embed"
	"io/fs"
)

//go:embed all:assets
var rawAssets embed.FS

// DistFS returns the embedded production web UI rooted at assets/.
func DistFS() (fs.FS, error) {
	return fs.Sub(rawAssets, "assets")
}
