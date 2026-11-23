# SSAT Project Safety & Continuity Instructions

This folder holds the **Scholarship Security Audit Toolkit (SSAT)** inside the NSPA repository.

## Core boundaries

1. **Audit assistant, not certification.** Never state or imply that completing this toolkit achieves NIST certification, FERPA compliance, PCI DSS compliance, ADA/WCAG certification, or complete security.
2. **Synthetic data only.** All fixtures, examples, tests, screenshots, and repository files must use clearly labeled synthetic/fictional organizations and records. Never commit real applicant, student, donor, banking, credential, or audit files.
3. **Single shared catalog and UI.** `catalog/controls.v1.json` is the single versioned source for both the browser application (`web/`) and the standalone Go executable (`go/`). Sync `web/dist/` into `go/internal/ui/assets/` via `go/scripts/sync-assets.sh`; never maintain a second manually edited UI copy.
4. **Interoperable authenticated encryption.** `.ssat` v1 files use Argon2id (`@noble/hashes` in browser, `golang.org/x/crypto/argon2` in Go) and AES-256-GCM with canonical header AAD. Never weaken KDF parameters silently, never fall back to plaintext, and always test browser <-> Go round-trip fixtures after any crypto change.
5. **No silent networking or telemetry.** Keep the app 100% static/local-first with zero external CDN fonts, scripts, analytics, or AI vendor uploads.
6. **NSPA visual identity.** Match the NSPA editorial palette (`#2E4F66` ink, `#007681` teal, `#E4F4F4` pale aqua, `#FFFEFA` warm paper, `#FFCD34` gold, `#FF7233` coral, `#9E2A2B` risk red paired with text labels) and Georgia/Arial typography.
7. **No public maintenance timestamps.** Follow the parent `AGENTS.md` rule: omit maintenance dates ("last updated", "generated on", etc.) from public docs and UI chrome while preserving substantive audit dates and citations.
