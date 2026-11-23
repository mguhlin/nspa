# Security Policy — Scholarship Security Audit Toolkit (SSAT)

## Security boundaries and non-goals

SSAT is a **local-first audit assistant** for scholarship providers. It is **not** a vulnerability scanner, penetration-testing tool, compliance certification platform, or cloud database.

- **No backend or cloud accounts:** The GitHub Pages edition runs strictly in the user's browser. The Go edition runs strictly on loopback (`127.0.0.1`) with an OS-assigned ephemeral port.
- **No external network calls:** All scripts, styles, icons, and the 30-control catalog are bundled locally. No external fonts, CDN scripts, analytics, or AI APIs are loaded.
- **Authenticated encrypted saves (`.ssat` v1):** Audit files are encrypted using **Argon2id** key derivation and **AES-256-GCM** authenticated encryption with a fresh 96-bit random nonce per save and canonical JSON header metadata bound as Additional Authenticated Data (AAD).
- **Evidence references by default:** SSAT stores safe metadata references to evidence rather than embedding raw SSNs, transcripts, bank numbers, donor lists, or live credentials.
- **Loopback server hardening (Go edition):**
  - Binds exclusively to `127.0.0.1:0` (never `0.0.0.0`).
  - Rejects non-matching `Host` headers (DNS-rebinding defense) and cross-origin `Origin` / `Sec-Fetch-Site` requests.
  - Keeps authentication tokens out of URLs; uses single-claim `HttpOnly; SameSite=Strict` session cookies paired with an explicit `X-SSAT-CSRF` header for mutations.
  - Enforces strict size limits, path-traversal prevention, `0600` file permissions, and atomic temp-file writes.
  - Never writes unencrypted plaintext audit files to disk by default.
- **Safe rendering & exports:** All user-entered and imported fields are rendered via safe text escaping (never unescaped `innerHTML`). CSV exports neutralize spreadsheet formula prefixes (`=`, `+`, `-`, `@`, tab, carriage return). Executive reports default to **Redacted** mode, omitting local paths, evidence URLs, and personal names.

## Known limitations

- **Browser memory and downloads:** Managed JavaScript runtimes cannot guarantee forensic zeroization of RAM. Downloaded `.ssat` files, printed PDFs, and exported reports are controlled by the user's operating system and device security.
- **Shared devices:** Opt-in encrypted browser autosave uses `localStorage` encrypted with the user's passphrase; it is disabled by default and includes an explicit **Clear Local Encrypted Copy** control. Do not enable local autosave on shared or public computers.
- **Hosting metadata:** Static GitHub Pages hosting still receives standard HTTP request metadata (such as IP address and browser user-agent) when serving the static app files, even though audit content itself is never transmitted.

## Reporting a security issue

Please do not run unauthorized live testing against third-party services or publish real audit records in public issue trackers. Report suspected security defects in SSAT through the `mguhlin/nspa` repository security contact or privately to the maintainer before public disclosure, using synthetic reproduction fixtures only.
