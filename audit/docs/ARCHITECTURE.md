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
