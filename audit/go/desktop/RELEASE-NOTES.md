SSAT 1.1.4 starts with a six-step roadmap and five everyday security questions. Known gaps can become editable tasks with owners and deadlines. The full 30-question review, evidence notes, inventory, exercises, and reports remain available under All tools. The palette matches the navy, blue, and gold hero illustration.

The new Go desktop edition opens in its own Wails application window, with bundled assets and native open/save dialogs. No user browser, internet connection, account, or cloud service is needed for the audit. Existing .ssat v1 files remain compatible. Printable reports export to HTML for an external browser/viewer to print or save as PDF.

Downloads: Windows x64 ZIP (includes Microsoft's full offline WebView2 runtime installer), Mac Apple Silicon/Intel ZIPs, and Linux x64 .deb installer (preferred) and portable tar.gz. Read START-HERE.txt for OS prerequisites and limitations. Linux still requires preinstalled GTK 3/WebKitGTK 4.1 libraries. Windows/Mac packages are build outputs; clean installation, physical-device operation, screen readers, code signing, and notarization remain unqualified. These are unsigned preview builds.

Native Linux WebKit testing with networking disabled covers roadmap/questions rendering, encryption, native-adapter disk save/open, decryption, plaintext rejection, and report export. Test mode selects a synthetic directory automatically; real user picker gestures remain a separate manual check. Browser tests cover the simplified workflow, unknowns, task editing, encrypted offline reopen, accessibility scans, and existing scoring/redaction protections. No regulatory certification is claimed.

Check the included SHA256SUMS.txt before running. The earlier browser-launching Go 1.0 edition remains a separate legacy release.

The legacy Go module now uses the same current crypto dependency as the desktop module. Release inputs enforce LF line endings for CSV templates so Windows builds retain template parity.

Redistribution notices are collected as UTF-8 on every build platform, including Windows.

Mac packages use the SSAT.app bundle name and declare macOS 13 as their minimum runtime, matching the Go toolchain. Bundle metadata, CPU architecture, and extracted executable are verified during packaging.

The Debian/Ubuntu package adds an applications-menu launcher and declares its OS-library dependencies. Install with `sudo apt install ./ssat-desktop-linux-amd64.deb`. Missing libraries may require internet during installation; audit work then runs offline. This package reuses the original 1.1.4 Linux executable unchanged.
