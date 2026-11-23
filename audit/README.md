# Scholarship Security Audit Toolkit (SSAT)

An interactive, evidence-first technology and security audit assistant for independent scholarship providers, community foundations, nonprofit program staff, finance leads, reviewer coordinators, and authorized auditors.

> **Important boundary:** SSAT is an **audit assistant**, not a vulnerability scanner, penetration-testing tool, legal opinion, or compliance certification. Completing this assessment does not certify an organization as NIST compliant, FERPA compliant, PCI DSS compliant, or secure.

## Start small

Choose **Start New Audit**, enter an audit name and your role, and follow **My roadmap**. Begin with five everyday questions about account protection, backup recovery, payment changes, applicant information, and emergency contacts. Missing and partial safeguards can become editable tasks with owners and deadlines. “Not sure yet” remains unknown. Save audit creates a password-protected `.ssat` file; the passphrase cannot be reset.

The full 30-question review, risk dashboard, evidence notes, information inventory, exercises, and history live under **All tools**. The starter questions use five existing controls; they do not create a second score or replace the full review. A verified score still requires current reviewed evidence, a method, and a date. The navy, blue, and gold palette matches the supplied hero image.

## What SSAT includes

- **10 evaluation domains and 30 scholarship-specific controls** (`DATA`, `IAM`, `VEND`, `CONT`, `FIN`, `AWARD`, `AI`, `RESP`, `TECH`, `SUST`) mapped to NIST CSF 2.0 functions.
- **Evidence-first proof rules:** Score `2` (Verified and tested) is blocked unless at least one reviewed evidence reference, verification method, and review date are recorded. Unknown (`Not assessed`), stale evidence, and Critical failures remain visible above overall scores.
- **Guided teaching on every control:** Plain-language explanations, scholarship examples, Good vs. Insufficient evidence comparison cards, downloadable blank templates, and an accessible security glossary.
- **“What good evidence looks like” mini-course:** Ten practical fictional examples explaining why artifacts earn `0`, `1`, or `2`.
- **Data Inventory Builder (`DATA-01`):** All 18 lifecycle columns, metadata-only CSV import with PII warning, formula-safe CSV export, gap detector, and lifecycle flow view.
- **Five practical simulations:** Trace an applicant record, remove former-reviewer access, deadline-day outage tabletop, payment-change fraud exercise, and AI permissions/prompt-injection check — each with structured verification logs.
- **Findings, triage, and 30/60/90-day remediation roadmap:** Owner assignment by role, severity triage with rationale override, and verified-closure statuses.
- **Seven printable and exportable reports:** Executive Risk Brief (redacted default), Detailed Technical Audit, Evidence Request Tracker, Remediation Roadmap, Scholarship Continuity Plan, Cycle Comparison, and Landscape Audit Rubric (HTML, print/PDF, Markdown, formula-safe CSV, redacted JSON).
- **Interoperable encrypted `.ssat` v1 storage:** Browser and standalone Go editions both encrypt and decrypt the same `.ssat` bundle using Argon2id and AES-256-GCM.
- **Fictional Practice Audit:** Pre-loaded with the synthetic **Example Scholarship Foundation (FICTIONAL)** dataset so teams can explore safely and reset at any time.

## Web and offline desktop editions

- **Web:** [Open SSAT](https://mguhlin.github.io/nspa/audit/). Static, browser-local processing; the first visit requires internet. Audit contents stay in memory unless explicitly saved. The web host receives normal HTTP request metadata.
- **Desktop:** [Download SSAT 1.1](https://github.com/mguhlin/nspa/releases/tag/ssat-v1.1.4). `go/desktop/` opens the same embedded interface in its own Wails window, with native file dialogs and no external browser or internet needed for audit work. Windows x64 includes Microsoft's full offline WebView2 installer. Mac uses system WKWebView; Linux x64 now has a [.deb installer](https://github.com/mguhlin/nspa/releases/download/ssat-v1.1.4/ssat-desktop-linux-amd64.deb) with an application-menu entry and declared GTK 3/WebKitGTK 4.1 dependencies; the portable tar.gz is also available. See [desktop setup and limits](go/desktop/START-HERE.txt). These are unsigned preview packages; physical Windows/Mac, clean-install, screen-reader, signing, and notarization qualification remain outstanding.
- **Legacy local browser app:** `go/cmd/ssat/` and the [1.0 release](https://github.com/mguhlin/nspa/releases/tag/ssat-v1.0.0) remain available for environments that prefer the original loopback browser edition. They are distinct from the desktop app.

All editions share the catalog and `.ssat` v1 format. Desktop reports save as HTML/CSV/Markdown/JSON using native dialogs. Print/PDF uses the exported HTML in an external viewer; the embedded desktop window does not promise native PDF printing.

## Install on Debian or Ubuntu

Download `ssat-desktop-linux-amd64.deb`, then open it in your package installer or run from its download folder:

```sh
sudo apt install ./ssat-desktop-linux-amd64.deb
```

Open **SSAT Security Audit** from the applications menu, or run `ssat`. The installer may need internet to obtain missing system libraries; audit work runs offline after installation. Removing the app with `sudo apt remove ssat-desktop` keeps saved audit files. The package uses the original release executable without changing its bytes.

Build a Debian package from an already-built Linux executable with `python3 audit/go/scripts/build-deb.py --binary /path/to/SSAT --support-dir /path/to/release-support-files --output /path/to/ssat-desktop-linux-amd64.deb`. The support directory contains `build-info.txt`, `modules.txt`, and `THIRD-PARTY-LICENSES.txt`. `START-HERE.txt`, the desktop launcher, icon, and other notices come from the source tree. Future release builds include both `.deb` and `.tar.gz`.

## Develop, test, and build

### Web edition (`web/`)

Requires Node 20+ and npm.

```sh
cd web
npm ci
npm run typecheck
npm test
npm run build
npm run test:browser
```

### Legacy loopback Go edition (`go/`)

Requires Go 1.26+ (release toolchain 1.27.4).

```sh
# Sync the built web UI and catalog into go/internal/ui/assets
./go/scripts/sync-assets.sh

# Run Go unit, crypto interoperability, storage, and localhost security tests
cd go
go test -v ./...

# Build local executable
go build -o bin/ssat ./cmd/ssat
./bin/ssat
```

Cross-compile portable binaries (standard-library + pure Go `golang.org/x/crypto`, `CGO_ENABLED=0`):

```sh
cd go
CGO_ENABLED=0 GOOS=linux   GOARCH=amd64 go build -trimpath -o bin/ssat-linux-amd64 ./cmd/ssat
CGO_ENABLED=0 GOOS=darwin  GOARCH=arm64 go build -trimpath -o bin/ssat-darwin-arm64 ./cmd/ssat
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -trimpath -o bin/ssat-windows-amd64.exe ./cmd/ssat
```

### Native desktop (`go/desktop/`)

Requires Go 1.26+ (release toolchain 1.27.4), Wails 2.17.1, and native platform build libraries. Build the shared UI and run the sync script above first. On Linux, install GTK 3 and WebKitGTK 4.1 development libraries, then:

```sh
cd go/desktop
go test -tags webkit2_41 ./...
go run github.com/wailsapp/wails/v2/cmd/wails@v2.17.1 build -clean -skipbindings -tags webkit2_41
./build/bin/SSAT
```

On Windows/macOS omit `-tags webkit2_41`. CI builds each package on its target operating system; native GUI apps are not produced by the legacy `CGO_ENABLED=0` cross-build commands. `.github/workflows/release-ssat-desktop.yml` packages release tags `ssat-v1.1.*`; the legacy workflow covers only `ssat-v1.0.*`.

The explicit `--smoke-test /path/to/synthetic-output` option runs a fictional native workflow and exits with a JSON result. It bypasses user file-picker gestures only in that explicit test mode. Test a built Linux artifact in a network-disabled container with the matching GUI libraries and a virtual display to verify offline runtime behavior. Normal builds never create test outputs without that flag.

## Documentation

- [docs/SPEC.md](docs/SPEC.md) — Requirements traceability matrix and implementation decisions
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — `.ssat` v1 crypto ADR, shared catalog, and Go embed architecture
- [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md) — Trust boundaries, browser-local risks, and Go localhost security
- [docs/EVIDENCE_GUIDE.md](docs/EVIDENCE_GUIDE.md) — Evidence quality ladder and 10-domain guide
- [docs/REPORT_EXAMPLES.md](docs/REPORT_EXAMPLES.md) — Redacted executive vs. internal report comparisons
- [docs/TEST_REPORT.md](docs/TEST_REPORT.md) — Executed automated, browser, accessibility, and Go interoperability checks
- [PRIVACY.md](PRIVACY.md) and [SECURITY.md](SECURITY.md)

## Attribution and licensing

- NSPA visual identity and resource collection by **Miguel Guhlin**.
- Development workflow informed by the **VCC Agent Guide** and its `vcc-web-design`, `securevcc`, `edu-compliance`, and `go-app-builder` skills by Miguel Guhlin ([VCC](https://mguhlin.github.io/vcc/), CC BY 4.0 / MIT).
- Cryptographic libraries: `@noble/hashes` (MIT) and `golang.org/x/crypto` (BSD-3-Clause).
- Practical control wording adapts concepts from NIST CSF 2.0, NIST Small Business Cybersecurity Corner, NIST AI RMF, OWASP ASVS, and W3C WCAG 2.2 without claiming formal certification.
