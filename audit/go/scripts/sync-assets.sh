#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WEB_DIST="$ROOT/web/dist"
GO_ASSETS="$ROOT/go/internal/ui/assets"
GO_CATALOG="$ROOT/go/internal/catalog/controls.v1.json"

if [ ! -f "$WEB_DIST/index.html" ]; then
  echo "ERROR: Build the web UI first: (cd web && npm run build)" >&2
  exit 1
fi

rm -rf "$GO_ASSETS"
mkdir -p "$GO_ASSETS"
cp -R "$WEB_DIST"/. "$GO_ASSETS"/
touch "$GO_ASSETS/.gitkeep"
cp "$ROOT/catalog/controls.v1.json" "$GO_CATALOG"
echo "Synced web/dist and catalog/controls.v1.json into Go module for //go:embed."
