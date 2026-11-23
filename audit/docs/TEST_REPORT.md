# SSAT Test & Verification Report

This report records the verification commands actually executed against the Scholarship Security Audit Toolkit (`nspa/audit/`), using **synthetic data only** (`Example Scholarship Foundation (FICTIONAL)`). Automated test passes do **not** constitute regulatory compliance, legal approval, or an independent cryptographic audit.

## Roadmap and native desktop verification

The current interface uses a six-step roadmap, five starting questions, editable suggested actions, and the hero navy/blue/gold palette. The full catalog and `.ssat` format remain unchanged. The tables below retain prior legacy-adapter evidence; cross-compilation of the old loopback binary is not native desktop qualification.

| Scope | Method | Result and limits |
|---|---|---|
| Shared scoring, evidence proof rule, crypto, redaction, CSV, XSS, migration | `npm test --prefix audit/web` | PASS: eight unit groups; synthetic fixtures only |
| Web UI, beginner unknowns/progress, action creation/editing, offline encrypted save/reopen, mobile reflow, axe scans | `npm run test:browser --prefix audit/web` | PASS: five Playwright tests, including simulated native save/open cancellation and disk errors |
| Legacy Go catalog/crypto/server behavior | `go test ./...` in `audit/go` | PASS; existing browser-to-Go fixture compatibility retained after upgrading the legacy module to golang.org/x/crypto v0.57.0 |
| Native file boundaries | `go test -tags webkit2_41 ./...` in `audit/go/desktop`, Linux build container | PASS: two tests; encrypted round trip, plaintext/executable/oversize rejection, basename confinement, busy guard, failed write preservation |
| Real native offline essential task | Built Wails 2.17.1 executable in `docker run --network none` with GTK 3.24.38 / WebKitGTK 2.50.6, Xvfb and D-Bus | PASS: shared roadmap/questions, WebKit encryption, Go disk save/read, JS decryption, plaintext rejection, redacted HTML export. Explicit `--smoke-test` auto-selects only a synthetic output directory; this does not test user picker gestures. |
| Visual inspection | Chromium screenshots at 1360px and 390px | PASS for welcome, roadmap, starting question; no page overflow at 390px. Automated screenshots do not qualify screen readers. |
| Site links and public staging | `python3 scripts/check_site.py`, `python3 scripts/build_site.py`, `git diff --check` | PASS locally; live deployment is verified separately after publication |
| Windows/Mac native artifacts | Native OS release matrix | Build and archive verification only; physical device execution, clean offline runtime installation, picker gestures and assistive technology NOT_RUN locally |

Evidence gates: task/design PASS for the tested browser and Linux synthetic paths, with screen-reader gaps; privacy PASS for the observed network-disabled synthetic task; security PASS for the bounded bridge tests, not an independent security audit; delivery CONDITIONAL for unsigned preview packages with documented runtime and physical-device limits. Neither source nor build success constitutes regulatory certification.

## Debian installer verification

The preferred Linux download is now `ssat-desktop_1.1.5-1_amd64.deb` (Debian package `ssat-desktop`, version `1.1.5-1`), alongside the original portable archive. The Debian package and portable archive use the same 1.1.5 Linux executable; encrypted audit format remains unchanged.

- PASS: `dpkg-deb --info`, inventory inspection, executable SHA-256 comparison, and `desktop-file-validate`.
- PASS: package-manager dependency simulation on the Debian 13 host, including the GTK/GLib t64 alternatives; no host installation was performed.
- PASS: actual APT installation in an isolated Debian 12 container with networking disabled and runtime libraries already present.
- PASS: installed `ssat` launcher, ordinary-user synthetic roadmap/question/encrypted save/reopen/report task under Xvfb with networking disabled.
- PASS: package removal deleted the launcher and desktop entry while retaining the synthetic user's saved audit and document.
- Not claimed: clean offline provisioning of missing OS libraries, every Ubuntu/Debian release, or screen-reader/real picker gestures. Installation can require internet when declared libraries are absent; audit work remains offline after installation.

## Desktop quit regression

The Linux 1.1.4 quit guard compared a custom dialog label with GTK's stock response strings, blocking accepted closes. Version 1.1.5 replaces the native message dialog with one in-app confirmation shared by the header Quit button and window close hook, and leaves browser beforeunload warnings only in the web edition. File operations still block quit until they finish; accepted quit blocks subsequent file operations.

- PASS: Go close-policy tests cover clean/unsaved sessions, cancellation, active file operations, accepted quit, late unsaved notifications, and rejected late file operations.
- PASS: browser regression covers Keep working, Escape, Close anyway, preserved form input, and no second desktop beforeunload blocker.
- PASS: `test-native-quit.py` drives actual X11 pointer/keyboard events and WM_DELETE_WINDOW against the normal Linux executable, without `--smoke-test`, and requires exit code 0 after confirmation.
- PASS (expected regression failure): the 1.1.4 released binary fails the same native test with “process remained running after Close anyway”; 1.1.5 exits normally.
- PASS: isolated, network-disabled Debian installation upgraded 1.1.4-1 to 1.1.5-1, preserved an existing synthetic encrypted audit byte for byte, ran the normal installed app as an ordinary user through both close paths, and completed the encrypted save/reopen/report task.

## Environment

- **OS:** Linux x86_64
- **Node / npm:** Node v20.19.2 · npm 9.2.0
- **Go:** go1.27.4 linux/amd64
- **Browser Engine:** Local Chromium via Playwright (`@playwright/test` + `@axe-core/playwright`)

## Executed Test Matrix

| Test ID | Scope | Command / Method | Observed Result |
|---|---|---|---|
| **T-01** | 10 domains, 30 unique controls, 5 simulations, 10 lessons, glossary, CSV template parity | `npm test` (`web/tests/unit.test.ts`), `go test ./internal/catalog` | **PASS** — 10 domains, 30 controls, 5 simulations, 10 lessons, 10 glossary terms, CSV template byte parity verified |
| **T-02** | Mixed 0/1/2/Unassessed/N/A scoring math & TS/Go parity | `npm test`, `go test ./internal/catalog` | **PASS** — Identical results in TypeScript and Go (12/30 assessed = 40.0% coverage, 66.7% provisional readiness, 5 Critical gaps, 1 stale evidence, 5 open High/Critical findings; N/A denominator adjustment verified) |
| **T-03** | Proof Rule blocking Score 2 without reviewed evidence/method/date & policy-only check | `npm test`, `npm run test:browser` (`DATA-03` live UI block) | **PASS** — Blocked unsubstantiated Score 2 both in unit logic and live Guided Audit UI |
| **T-04** | Malformed/hostile-KDF `.ssat`, malformed JSON, oversized bounds | `npm test`, `go test ./internal/crypto`, `go test ./internal/localserver` | **PASS** — Rejects malformed envelopes, tampered headers, and hostile Argon2id memory requests before KDF allocation |
| **T-05** | Browser <-> Go `.ssat` v1 Argon2id + AES-256-GCM interoperability | Generated `fixtures/crypto_interop/golden_v1.ssat` in TypeScript; decrypted in both TS (`npm test`) and Go (`TestDecryptTypeScriptGoldenVector`); Go round-trip & tamper tests | **PASS** — Browser-encrypted golden bundle decrypted cleanly by Go; AAD/header tamper rejected |
| **T-06** | Wrong passphrase & safe error handling | `npm test`, `go test ./internal/crypto` | **PASS** — Wrong passphrase fails safely with informative message without corrupting state |
| **T-07** | Network privacy monitor (zero external requests) | `npm run test:browser` request listener across Welcome, Dashboard, Guided Audit, Reports | **PASS** — `externalRequests = []` (zero third-party calls) |
| **T-08** | Report redaction (Executive/Redacted default vs Restricted/Internal) | `npm test`, `npm run test:browser` | **PASS** — `internal://sharepoint-sec` paths and personal names omitted in Executive/Redacted reports and visible only in Restricted mode |
| **T-09** | CSV formula neutralization (`=`, `+`, `-`, `@`, space-prefixed) + PII pattern warning | `npm test`, `go test ./internal/catalog` | **PASS** — Both TypeScript and Go neutralize risky leading characters with `'` |
| **T-10 / T-18** | XSS & synthetic AI prompt-injection safety | `npm test`, `npm run test:browser` live DOM injection test | **PASS** — `<img onerror>` and `<script>` escaped in DOM and reports; `window.__xss === undefined`; injection text cannot modify scores |
| **T-11** | Go loopback server (`127.0.0.1:0`, Host DNS-rebinding, Origin/Sec-Fetch-Site, single-claim HttpOnly cookie, CSRF header, path traversal) | `go test -v ./internal/localserver` | **PASS** — Spoofed Host (403), cross-site (403), unauthenticated API (401), missing CSRF (403), traversal `../escape.ssat` (400), and plaintext save (400) all rejected; authorized save/open passed |
| **T-12** | Accessibility (axe-core WCAG 2.1/2.2 AA rules), hero image loading, interactive Risk Matrix & mobile 390px reflow | `npm run test:browser` across Welcome, Dashboard (incl. 3×3 Risk Matrix), Guided Audit, Reports at 1280px & 390px | **PASS** — Zero axe violations (including WCAG 2.5.3 label-content-name match on Risk Matrix cells); hero graphic loads cleanly; zero horizontal overflow at 390px |
| **T-14** | Cross-version migration (`1.0.0-draft` -> `1.0.0`) & unsupported version rejection | `npm test` | **PASS** — Legacy draft migrated with preserved scores; unsupported `9.9.9` rejected explicitly |
| **T-15** | Clean build, Go cross-compilation, NSPA site link check & staging | `npm run build`, `go build` (`linux/amd64`, `darwin/arm64`, `windows/amd64`), `python3 scripts/check_site.py`, `python3 scripts/build_site.py` | **PASS** — Legacy web bundle built, all 3 Go binaries compiled with `CGO_ENABLED=0`, NSPA site staged cleanly |
| **T-16** | Atomic save preserving prior valid `.ssat` file on rejected/corrupt write | `go test -v ./internal/localserver` | **PASS** — Original valid `.ssat` bytes preserved after rejected overwrite attempts |
| **T-17** | End-to-end fictional audit flow | `npm run test:browser` | **PASS** — Practice audit loaded, Critical gaps verified above score, Proof Rule verified, Reports & Landscape Rubric rendered |

## Limitations & Items Requiring Human Review Before Real-Data Use

- **Assistive technology testing:** Automated axe-core checks and keyboard/focus inspection ran cleanly, but manual testing with real screen readers (NVDA, VoiceOver, JAWS) has not yet been performed on physical target machines.
- **Physical OS smoke tests:** Windows and macOS Go binaries were cross-compiled cleanly on Linux (`CGO_ENABLED=0`), but physical Windows/macOS execution and code-signing/OS Gatekeeper warnings were not tested on those operating systems (`NOT_RUN`).
- **Real organizational data:** Remains out of scope until an organization approves deployment and completes its own privacy, security, and legal review.
- **Release status (per VCC `edu-compliance` & `go-app-builder`):** `READY FOR TECHNICAL PILOT WITH SYNTHETIC DATA`.
