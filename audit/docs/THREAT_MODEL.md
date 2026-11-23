# SSAT Threat Model & Security Boundaries

## 1. Trust boundaries

1. **Untrusted input -> Application state:** Imported `.ssat` files, CSV data inventories, JSON fixtures, user-entered notes, and synthetic AI prompt-injection payloads.
2. **Application state -> Browser DOM & Exports:** Rendering user notes into HTML, printable views, Markdown, JSON, and spreadsheet-compatible CSV files.
3. **Browser UI -> Local Storage / Downloads:** Session RAM vs opt-in encrypted `localStorage` vs downloaded files on potentially shared devices.
4. **Browser tab -> Go Loopback Server (`127.0.0.1`):** Other local processes, malicious web pages attempting DNS rebinding or cross-site requests to localhost, and path traversal on file save/open.

## 2. Threat analysis and implemented controls

| Threat | Attack vector | Mitigation in SSAT | Verification |
|---|---|---|---|
| **XSS / HTML injection** | Malicious HTML or `<script>` in control notes, evidence titles, imported CSVs, or synthetic AI injection text | Strict HTML escaping (`escapeHtml`) across all dynamic rendering; zero `eval`, `new Function`, or untrusted `innerHTML`; restrictive CSP (`default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'`) | T-10, T-18 |
| **CSV Formula Injection** | Cells starting with `=`, `+`, `-`, `@`, `\t`, or `\r` exported to Excel/Sheets | Prefix neutralization (`'` prepended) on every risky cell in both TS (`csv.ts`) and Go (`export/csv.go`) | T-09 |
| **Confidential data leakage in reports** | Exporting executive summaries that accidentally reveal local file paths, internal URLs, or personal names | Default **Executive / Redacted** mode strips storage references, personal identifiers, and technical details; visible preview + pre-export confidentiality warning | T-08 |
| **Unauthorized remote transmission** | Third-party fonts, CDN scripts, analytics, or AI calls receiving audit contents | 100% bundled local assets; zero remote calls; verified by Playwright network monitor | T-07 |
| **Tampered or forged `.ssat` files** | Modifying ciphertext, KDF parameters, version, or salt | AES-256-GCM authenticated tag over ciphertext + canonical header AAD; strict schema validation after decrypt | T-04, T-05 |
| **KDF resource-exhaustion DoS** | Crafting a `.ssat` header with `m = 4GB` or `t = 10000` | Strict KDF parameter allowlist (`m <= 131072 KiB`, `t <= 10`, `p <= 4`) and 10 MiB max file size checked before KDF execution | T-04 |
| **Localhost DNS rebinding / CSRF (Go)** | A malicious website in another browser tab sends requests to `http://127.0.0.1:<port>/api/...` | Bind strictly to `127.0.0.1:0`; exact `Host` header match; `Origin` & `Sec-Fetch-Site` validation; single-claim `HttpOnly; SameSite=Strict` session cookie + `X-SSAT-CSRF` header; auth token never placed in URLs | T-11 |
| **Path traversal / partial file corruption (Go)** | Requesting `../../etc/passwd` or crashing mid-save | Canonical path checks, rejection of `..`, null bytes, and symlinks, restricted `.ssat` extension for saves, atomic temp-file write (`0600`) + fsync + rename preserving previous valid file on failure | T-11, T-16 |
| **Silent persistence on shared devices** | Leaving unencrypted audit state in browser storage | Session RAM only by default; opt-in encrypted local copy requires passphrase + displays shared-device warning; explicit **Lock Session**, **Clear Session**, and **Clear Local Encrypted Copy**; service worker caches static assets only | T-06, T-13 |
| **False compliance assurance** | High overall percentage masking Critical failures or unverified claims | Proof rule blocks Score `2` without reviewed evidence; Critical failures, unassessed controls, and stale items displayed above aggregate score; every report includes self-assessment disclaimer | T-02, T-03 |

## 3. Residual risks (communicated honestly to users)

- **Host OS compromise / same-user local processes:** Any malware or another program running under the same OS user account can inspect local files or memory; SSAT cannot defeat a compromised workstation.
- **Managed runtime memory:** JavaScript and Go garbage collectors do not guarantee immediate cryptographic erasure of decrypted strings from RAM.
- **Exported artifacts:** Once saved as PDF, HTML, CSV, or Markdown outside SSAT, protection depends on the organization's own file controls.
- **Static hosting metadata:** GitHub Pages logs ordinary HTTP access metadata (IP address, path, user-agent) when serving the static web app files.

## Native desktop adapter boundary

The Wails desktop module uses the same untrusted imported-document and report-rendering boundaries as the browser UI. Its bridge adds picker-selected local files; it does not accept renderer-supplied paths, shell commands, or native drop paths. It validates envelope sizes and structure before saving audits, bounds reads from selected regular files, and stages outputs beside OS-selected destinations. Direct export attempts for executable extensions or plaintext `.ssat` files are rejected. OS/filesystem replacement guarantees and app-private report staging are documented. A renderer compromise could request a visible picker or export misleading content; it has no silent arbitrary-path file API. Full renderer isolation, OS compromise, other local users, runtime servicing, backups, and forensic erasure are not claimed to be solved. Real picker provenance/gestures, platform assistive technology, and Windows/Mac physical installation remain manual qualification gates.
