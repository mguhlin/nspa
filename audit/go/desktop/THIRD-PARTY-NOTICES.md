# SSAT desktop components

SSAT interface and resource collection by Miguel Guhlin. Development guidance: [VCC Go App Builder](https://mguhlin.github.io/vcc/skills/go-app-builder/), Miguel Guhlin, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Modified application implementation uses a native Wails window with picker-scoped file access and the existing shared audit UI.

- Wails v2.17.1: MIT; https://github.com/wailsapp/wails/blob/v2.17.1/LICENSE
- Go: BSD-3-Clause; https://go.dev/LICENSE
- @noble/hashes: MIT; https://github.com/paulmillr/noble-hashes/blob/main/LICENSE
- golang.org/x/crypto: BSD-3-Clause; https://cs.opensource.google/go/x/crypto/+/master:LICENSE
- Other pinned Go components and versions: see the included modules.txt and source go.sum. Their upstream licenses apply; the module list is a component inventory, not a complete SPDX SBOM.
- Windows packages also contain Microsoft's unmodified, publisher-signed WebView2 Evergreen Standalone Installer. Microsoft WebView2 redistribution/license terms apply: https://developer.microsoft.com/en-us/microsoft-edge/webview2/ . Installing/servicing the runtime follows Microsoft and organization policies.
- Linux GTK/WebKitGTK libraries and macOS WKWebView are OS-provided prerequisites, not bundled third-party binaries.

SSAT binaries are unsigned preview artifacts. Checksums establish matching download bytes, not publisher signing or device qualification. No code-signing keys are included.
