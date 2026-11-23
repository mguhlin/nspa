# SSAT Test & Verification Report

This report records the verification commands actually executed against the Scholarship Security Audit Toolkit (`nspa/audit/`), using **synthetic data only** (`Example Scholarship Foundation (FICTIONAL)`). Automated test passes do **not** constitute regulatory compliance, legal approval, or an independent cryptographic audit.

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
| **T-12** | Accessibility (axe-core WCAG 2.1/2.2 AA rules) & mobile 390px reflow | `npm run test:browser` across Welcome, Dashboard, Guided Audit, Reports at 1280px & 390px | **PASS** — Zero axe violations; zero horizontal overflow at 390px after wrapping landscape rubric table in `.table-scroll` |
| **T-14** | Cross-version migration (`1.0.0-draft` -> `1.0.0`) & unsupported version rejection | `npm test` | **PASS** — Legacy draft migrated with preserved scores; unsupported `9.9.9` rejected explicitly |
| **T-15** | Clean build, Go cross-compilation, NSPA site link check & staging | `npm run build`, `go build` (`linux/amd64`, `darwin/arm64`, `windows/amd64`), `python3 scripts/check_site.py`, `python3 scripts/build_site.py` | **PASS** — Web bundle built (83.85 kB gzipped), all 3 Go binaries compiled with `CGO_ENABLED=0`, NSPA site staged cleanly |
| **T-16** | Atomic save preserving prior valid `.ssat` file on rejected/corrupt write | `go test -v ./internal/localserver` | **PASS** — Original valid `.ssat` bytes preserved after rejected overwrite attempts |
| **T-17** | End-to-end fictional audit flow | `npm run test:browser` | **PASS** — Practice audit loaded, Critical gaps verified above score, Proof Rule verified, Reports & Landscape Rubric rendered |

## Limitations & Items Requiring Human Review Before Real-Data Use

- **Assistive technology testing:** Automated axe-core checks and keyboard/focus inspection ran cleanly, but manual testing with real screen readers (NVDA, VoiceOver, JAWS) has not yet been performed on physical target machines.
- **Physical OS smoke tests:** Windows and macOS Go binaries were cross-compiled cleanly on Linux (`CGO_ENABLED=0`), but physical Windows/macOS execution and code-signing/OS Gatekeeper warnings were not tested on those operating systems (`NOT_RUN`).
- **Real organizational data:** Remains out of scope until an organization approves deployment and completes its own privacy, security, and legal review.
- **Release status (per VCC `edu-compliance` & `go-app-builder`):** `READY FOR TECHNICAL PILOT WITH SYNTHETIC DATA`.
