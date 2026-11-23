# SSAT Architecture & ADR-001: Interoperable `.ssat` v1 Format

## 1. High-level architecture: One shared model, two delivery modes

SSAT maintains **one authoritative control catalog** (`catalog/controls.v1.json`), **one JSON Schema** (`catalog/schema/audit.v1.schema.json`), and **one TypeScript UI** (`web/`):

1. **GitHub Pages Edition:** `web/dist/` is staged into `_site/audit/` by `nspa/scripts/build_site.py`. Runs entirely in browser memory with optional encrypted `localStorage` autosave (off by default) and encrypted `.ssat` file download/import.
2. **Standalone Go Edition:** `go/scripts/sync-assets.sh` copies `web/dist/` into `go/internal/ui/assets/` and `catalog/controls.v1.json` into `go/internal/catalog/controls.v1.json`. Both are embedded at compile time with `//go:embed`. Go serves the UI strictly on `127.0.0.1:0` and exposes authenticated local endpoints for atomic `.ssat` save/open and server shutdown.

## 2. ADR-001: `.ssat` v1 Encrypted Audit Bundle Specification

### Context
Both the static browser edition (TypeScript / Web Crypto API) and standalone Go executable must encrypt and decrypt identical `.ssat` files without external servers, without `unsafe-eval` / `wasm-unsafe-eval` in CSP, and without inventing custom cryptography.

### Decision
Use a versioned JSON envelope wrapping an **Argon2id** key derivation and **AES-256-GCM** authenticated ciphertext:

- **Browser KDF:** `@noble/hashes` (`argon2idAsync`) — pure TypeScript/JS, Cure53-audited, zero transitive dependencies, MIT license.
- **Go KDF:** `golang.org/x/crypto/argon2` (`argon2.IDKey`) — official Go team cryptography module, BSD-3-Clause license.
- **Cipher:** AES-256-GCM (Web Crypto `SubtleCrypto` in browser; `crypto/aes` + `crypto/cipher.NewGCM` in Go).

### Wire format (`*.ssat` UTF-8 JSON, max 10 MiB)

```json
{
  "format": "ssat-encrypted-v1",
  "version": 1,
  "kdf": "argon2id",
  "kdf_params": {
    "t": 3,
    "m": 32768,
    "p": 1,
    "dkLen": 32
  },
  "cipher": "aes-256-gcm",
  "salt_b64": "<16-byte CSPRNG salt, standard base64>",
  "nonce_b64": "<12-byte CSPRNG nonce, standard base64>",
  "ciphertext_b64": "<AES-256-GCM ciphertext || 16-byte auth tag, standard base64>"
}
```

### Canonical Additional Authenticated Data (AAD)
To prevent header tampering or downgrade attacks, both implementations construct identical canonical UTF-8 AAD bytes before AES-GCM seal/open:

```text
ssat-encrypted-v1|v=1|kdf=argon2id|t=<t>|m=<m>|p=<p>|dkLen=32|cipher=aes-256-gcm|salt=<salt_b64>|nonce=<nonce_b64>
```

Any modification to KDF parameters, version, salt, nonce, or ciphertext causes GCM tag verification to fail and rejects the file cleanly without exposing partial plaintext.

### Parameter bounds (defense against silent weakening & DoS)
- **Default creation profile:** `t = 3`, `m = 32768` (32 MiB), `p = 1`, `dkLen = 32`. Chosen after benchmarking pure-JS Argon2id performance so both modern laptops and lower-power school/nonprofit devices encrypt/decrypt comfortably within ~0.3–1.5 seconds while resisting offline guessing.
- **Accepted decryption bounds:**
  - `t`: `2 <= t <= 10`
  - `m`: `16384 <= m <= 131072` (16 MiB to 128 MiB)
  - `p`: `1 <= p <= 4`
  - `dkLen`: must equal `32`
  - `salt`: must decode to exact 16 bytes; `nonce`: must decode to exact 12 bytes
  - Minimum passphrase length enforced on creation: 10 characters (with strength guidance).
- **No silent fallback:** Unsupported `format`, `version`, `kdf`, `cipher`, or out-of-bounds KDF parameters are rejected immediately with a clear error before allocating KDF memory.

### Consequence
- 100% deterministic browser <-> Go round-trip interoperability verified in CI against `fixtures/crypto_interop/golden_v1.ssat`.
- Strictly bounded memory and CPU allocation on untrusted `.ssat` inputs.
- No custom cryptographic primitives.

## 3. Scoring engine parity

Both `web/src/audit/scoring.ts` and `go/internal/catalog/scoring.go` implement identical pure functions for:
- `assessed_controls`, `applicable_controls`, `readiness_percent` (marked provisional whenever `coverage_percent < 100`), `coverage_percent`
- Proof rule: Score `2` requires at least one linked evidence record whose `review_status` is `reviewed` or `verified`, plus non-empty `review_method` and `review_date`
- Critical failure count (Critical controls with score `0` or `1`), unassessed count, stale evidence count, and open High/Critical finding count

## Offline desktop adapter

The nested `go/desktop/` module pins Wails 2.17.1. Its own window displays `ui.DistFS()` from the parent Go module, after the shared sync script. No user browser or SSAT loopback server is launched. Wails uses OS webview infrastructure; it is not an independently rendered native-widget UI. Encryption, validation, catalog semantics, and report generation remain the shared TypeScript implementation. Go owns native file dialogs and bounded/staged disk operations. The bridge never receives a destination or source path from renderer arguments. OS-selected files authorize only that operation; file drops are disabled. A per-operation busy guard prevents overlapping picker/file operations and application close during a write. BeforeClose asks about unsaved work using a native dialog; no audit contents or passphrases are sent to Go for that decision.

Desktop CSP constrains connections and resource loads to bundled resources. Website navigation is blocked in the desktop interface. Passphrases stay in renderer memory. Audit saves validate the encrypted envelope before opening a native destination picker; reports use separate explicit exports. Staging uses private files next to the chosen destination and checks write/sync/close. OS rename replacement/durability and user-selected path races remain OS/filesystem constraints; this is not a forensic-erasure guarantee. The old localserver is a separate legacy adapter.

| Task | Desktop support | Limits / evidence |
|---|---|---|
| Roadmap, five starting questions, full 30 controls | SUPPORTED | Shared UI; native Linux WebKit render and browser end-to-end evidence |
| Encrypted save/open | SUPPORTED | Native picker in normal use; synthetic tests auto-select a test directory; real WebKit encrypt/decrypt and Go disk round trip |
| Interchange with web edition | SUPPORTED | Same `.ssat` schema/encryption; existing cross-implementation golden fixtures retained |
| HTML/CSV/Markdown/JSON reports and templates | SUPPORTED | Picker-selected export; bounded content; native printable HTML export smoke |
| Print / PDF inside app window | DEGRADED | Save printable HTML and use an external browser/viewer; no in-window PDF claim |
| No internet for audit work | SUPPORTED on provisioned runtimes | Network-disabled Linux native smoke; all assets bundled |
| Clean offline installation | UNKNOWN on Windows; prerequisite-dependent Linux | Windows includes full runtime installer; clean device installation not tested. Linux libraries are not included. Mac uses system webview. |
| Real picker gestures / screen readers / physical Windows and Mac | UNKNOWN | Separate manual/device qualification; build success is not this evidence |

Beginner answers map only to existing controls and scores 0/1/unknown. Existing verified or approved N/A answers are changed through full review. Unknowns never create failed-control findings or count as assessed. Suggested actions skip controls with existing findings and leave owner/date unassigned for the team to choose. No synthetic proof or verified score is generated by the shortcut.
