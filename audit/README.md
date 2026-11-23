# Scholarship Security Audit Toolkit (SSAT)

An interactive, evidence-first technology and security audit assistant for independent scholarship providers, community foundations, nonprofit program staff, finance leads, reviewer coordinators, and authorized auditors.

> **Important boundary:** SSAT is an **audit assistant**, not a vulnerability scanner, penetration-testing tool, legal opinion, or compliance certification. Completing this assessment does not certify an organization as NIST compliant, FERPA compliant, PCI DSS compliant, or secure.

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

## Two delivery modes from one shared codebase

1. **GitHub Pages (static browser edition):** Hosted at `https://mguhlin.github.io/nspa/audit/`. Runs completely client-side with zero external CDN assets, analytics, or server storage.
2. **Standalone Go edition (`go/`):** Single local executable embedding the exact built web UI and versioned catalog via `//go:embed`. Serves strictly on `127.0.0.1` with random loopback port, Host/Origin/CSRF protections, atomic encrypted saves, and no plaintext temporary files. Portable binaries and `SHA256SUMS.txt` are published on [GitHub Releases (`ssat-v1.0.0`)](https://github.com/mguhlin/nspa/releases/tag/ssat-v1.0.0).

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

### Standalone Go edition (`go/`)

Requires Go 1.24+.

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
