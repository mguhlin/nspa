# SSAT Specification & Requirements Traceability Matrix

This document records the approved v1 implementation decisions and traces every requirement from `Scholarship_Provider_Interactive_Security_Audit_Plan.md` to code, artifacts, and verification tests.

## 1. Resolved v1 product decisions

| Open decision from plan | v1 implementation decision | Rationale |
|---|---|---|
| Product name & destination | **Scholarship Security Audit Toolkit (SSAT)** under `nspa/audit/` (`/nspa/audit/`) | Matches user authorization and NSPA repository architecture |
| Visual identity | **NSPA website style** (`#2E4F66` ink, `#007681` teal, `#E4F4F4` pale aqua, `#FFFEFA` warm paper, `#FFCD34` gold, `#FF7233` coral, `#9E2A2B` risk red with text labels; Georgia headings / Arial UI) | Explicitly requested to match the NSPA site while meeting WCAG 2.2 AA contrast |
| Evidence attachments in v1 | **References and metadata only** (no raw file uploads) | Prevents accidental embedding of SSNs, essays, transcripts, or bank numbers |
| Opt-in encrypted browser autosave | **Implemented, disabled by default** | Requires explicit opt-in with shared-device warnings, passphrase encryption, and Clear Local Encrypted Copy |
| Multi-user cloud backend | **Out of scope** (local-first browser & standalone Go only) | Preserves zero-server privacy posture |
| Legal/regulatory overlays | **Educational flags marked “Requires Counsel / Authorized Review”** | Never asserts legal compliance verdicts |
| Standalone Go UI delivery | **Loopback HTTP server (`127.0.0.1:0`) with `//go:embed` shared web UI** | Smallest auditable dependency set, zero divergent UI copies, works across Linux/macOS/Windows |
| Interoperable `.ssat` crypto | **Argon2id (`@noble/hashes` + `golang.org/x/crypto/argon2`) + AES-256-GCM** | Audited zero-subdependency JS implementation + official Go library; zero `wasm-unsafe-eval` needed in CSP |

## 2. VCC Web Design Fingerprint

```text
Product/job: Scholarship Security Audit Toolkit (SSAT) — evidence-based security audit, data inventory, simulations, remediation planning, and redacted reporting for scholarship providers.
Audience and reading level: Nonprofit scholarship program directors, IT/security leads, finance officers, reviewer coordinators, executives/boards, and auditors; plain-English professional reading level.
Primary action and navigation shape: Workspace application with persistent NSPA masthead, horizontal section bar + 3-column desktop / stacked mobile guided control screen.
Chosen visual direction / reference: NSPA editorial conference identity (assets/site.css, assets/resource-theme.css — verified locally in repository).
Why it fits: Preserves immediate visual continuity with the NSPA workshop ecosystem while providing calm, high-legibility analytical clarity for complex audit evidence.
Palette: Ink/slate #2E4F66, primary teal #007681, pale aqua #E4F4F4, warm paper #FFFEFA, hairline border #CCDDDD, muted slate #526674, NSPA gold #FFCD34, NSPA coral #FF7233, risk red #9E2A2B (risk only), verified green #146B53 (always paired with text/numeric labels).
Typography: Georgia / Times New Roman display headings; Arial / Helvetica body UI; system monospace for control/evidence IDs. Zero external fonts.
Spacing and layout grid: 1280px max wrapper; 3-column guided control workspace (260px domain rail / fluid center / 340px evidence rail) collapsing cleanly to single column below 1024px.
Components and interaction conventions: Semantic forms, native <details>/<dialog>, accessible status banners, explicit undo/lock/clear controls, truthful storage-state pill.
Icon/illustration policy: Restraint-first inline SVG icons with aria-hidden="true"; zero text baked into images; bundled local NSPA logo.
Motion policy and reduced-motion behavior: Minimal state transitions only; respects prefers-reduced-motion: reduce.
Responsive strategy: Content-first reflow from 360px phone to 1440px+ desktop, 200%/400% zoom friendly, landscape print stylesheet for rubric.
Localization and accessibility requirements: WCAG 2.2 AA engineering target (4.5:1 text contrast, keyboard-only navigation, focus management, ARIA live announcements, grayscale-safe print); plain English with structured strings ready for future localization.
Privacy/security tier: Tier 1 (Local-only interactive with authenticated encrypted file export and strict loopback Go server).
Distinctive structural choice: Evidence-first 3-column control workspace + Risk-First Dashboard placing Critical/unverified gaps above any aggregate percentage.
```

## 3. Requirements Traceability Matrix

| Requirement | Plan Section | Implementation | Verification |
|---|---|---|---|
| 10 domains, 30 controls, full teaching content | §4.1, §6 | `catalog/controls.v1.json`, `web/src/screens/guidedAudit.ts` | T-01, unit & browser tests |
| Exact scoring math, provisional readiness, coverage, Critical gaps above score | §4.2 | `web/src/audit/scoring.ts`, `go/internal/catalog/scoring.go`, `web/src/screens/dashboard.ts` | T-02, Go/TS parity tests |
| Proof rule blocking Score 2 without reviewed evidence + method + date | §4.2 | `web/src/audit/scoring.ts`, `web/src/screens/guidedAudit.ts` | T-03 |
| N/A workflow requiring reason, scope, reviewer, date | §4.2 | `web/src/screens/guidedAudit.ts`, `web/src/audit/validation.ts` | T-02 |
| 15-field Evidence Library, Quality Ladder, states, freshness | §5 | `web/src/screens/evidenceLibrary.ts`, `catalog/evidence_templates/` | T-03, T-17 |
| 18-column Data Inventory Builder, metadata CSV import/export, gap detector | §6 DATA-01, §8.2 | `web/src/screens/dataInventory.ts`, `web/src/storage/csv.ts` | T-04, T-09, T-17 |
| 5 Guided Simulations + Verification Logs | §7 | `web/src/screens/simulations.ts`, `catalog/controls.v1.json` | T-17 |
| 12 Required Views + 3-column desktop / stacked mobile guided view | §8.2, §8.3 | `web/src/screens/*.ts`, `web/src/style.css` | T-12, T-17 |
| Good vs Weak cards, 10-lesson mini-course, Glossary, Undo, Truthful save indicator | §8.4, §15 | `web/src/screens/welcome.ts`, `guidedAudit.ts`, `state.ts`, `main.ts` | T-06, T-12 |
| Versioned JSON Schema + Migration + Synthetic Fixtures | §9 | `catalog/schema/audit.v1.schema.json`, `web/src/audit/validation.ts`, `fixtures/` | T-04, T-14 |
| Findings triage, statuses, 30/60/90-day generator | §10 | `web/src/screens/findingsActions.ts` | T-17 |
| 7 Reports, Executive Redacted default vs Restricted, HTML/Print/MD/CSV/JSON | §11 | `web/src/reports/generator.ts`, `markdown.ts`, `reportsView.ts` | T-08, T-09 |
| Interoperable `.ssat` v1 Argon2id + AES-256-GCM (Browser <-> Go) | §3.3 | `web/src/crypto/ssat.ts`, `go/internal/crypto/ssat.go`, `fixtures/crypto_interop/` | T-05, T-06 |
| Standalone Go executable (`//go:embed`, `127.0.0.1:0`, Host/Origin/CSRF, atomic save) | §3.2 | `go/cmd/ssat/`, `go/internal/localserver/`, `go/internal/storage/` | T-05, T-11, T-16 |
| Zero external network calls, CSP, XSS escaping, CSV formula neutralization | §3.1, §13.1 | `web/index.html`, `web/src/a11y/helpers.ts`, `web/src/storage/csv.ts` | T-07, T-09, T-10, T-18 |
| Offline static asset service worker (never caches audit data) | §3.1 | `web/public/sw.js` | T-13 |
