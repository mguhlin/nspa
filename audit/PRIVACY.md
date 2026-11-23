# Privacy Statement — Scholarship Security Audit Toolkit (SSAT)

## What this tool processes and where it stays

SSAT is designed to operate **locally on your device** without requiring an account, login, or cloud server.

### GitHub Pages (browser edition)

- **Audit contents:** Your organization profile, scope, control scores, notes, data inventory, evidence references, simulation logs, findings, and reports are processed in browser memory and are **not intentionally uploaded** by this application.
- **No third-party trackers or external assets:** SSAT makes no calls to external CDNs, font hosts, analytics services, advertising networks, or third-party AI APIs.
- **Standard web-host metadata:** When your browser loads the static HTML, CSS, and JavaScript files from GitHub Pages, GitHub's web servers receive ordinary HTTP request metadata (such as your IP address, requested file path, and browser user-agent).
- **Local storage (opt-in only):** By default, assessment data stays only in browser memory and clears when you close the tab or choose **Clear Session**. If you explicitly turn on **Encrypted Local Autosave**, SSAT stores an Argon2id + AES-256-GCM encrypted copy in your browser's `localStorage`. You can remove it at any time with **Clear Local Encrypted Copy**. Do not use local autosave on shared devices.
- **Offline cache:** The optional service worker caches only static application code and assets. It never caches audit contents, passphrases, or exported reports.

### Standalone Go edition

- **Local execution:** The Go executable serves the identical web interface strictly on `127.0.0.1` (your own computer) and makes no outbound network connections.
- **Encrypted local files:** Saved `.ssat` files are written atomically to the path you choose using authenticated encryption (Argon2id + AES-256-GCM). Passphrases are never written to disk, URLs, or logs.

### User-controlled exports and safe handling

- Once you download a `.ssat` bundle, print a PDF, or export HTML, Markdown, CSV, or JSON reports, those files reside on your device or wherever you share them.
- **Do not enter raw sensitive personal data** (such as Social Security numbers, bank account numbers, applicant essays, donor financial details, or live API tokens) into SSAT. Record safe metadata references instead.
- Executive reports default to **Redacted** mode to omit personal names, storage paths, and sensitive references. Always inspect exports before sharing.
- This toolkit helps collect facts for authorized review. It does not determine legal applicability under FERPA, PCI DSS, state privacy laws, or institutional contracts; consult qualified counsel or your authorized compliance reviewer.
