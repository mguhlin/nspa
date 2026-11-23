import type { Store } from '../audit/state';
import { CATALOG } from '../audit/catalog';
import { esc } from '../a11y/helpers';
import { hasLocalEncryptedCopy } from '../storage/localAutosave';

export interface SettingsActions {
  onSaveSsat: () => void;
  onOpenSsat: () => void;
  onEnableAutosave: (passphrase: string) => Promise<void>;
  onDisableAutosave: () => void;
  onClearLocalCopy: () => void;
  onLockSession: () => void;
  onClearSession: () => void;
  onResetDemo: () => void;
  onStopGoServer: () => void;
}

export function renderSettingsAbout(store: Store): string {
  const state = store.get();
  const hasLocal = hasLocalEncryptedCopy();

  return `
    <div class="page-head">
      <div>
        <p class="eyebrow">Privacy, Encryption &amp; Disclosures</p>
        <h1>Settings, Encrypted Backups &amp; About SSAT</h1>
        <p class="muted">Control encrypted storage, lock or clear your session, and review exact technical and legal boundaries.</p>
      </div>
    </div>

    <div class="two-col-grid">
      <section class="card">
        <h2>Encrypted Audit File (.ssat v1)</h2>
        <p>Audit files use <strong>Argon2id</strong> key derivation (32 MiB, 3 iterations) and <strong>AES-256-GCM</strong> authenticated encryption with canonical header AAD. The exact same <code>.ssat</code> file opens in both the browser and standalone Go editions.</p>
        <div class="btn-row" style="margin-top:12px">
          <button type="button" class="btn btn-primary" data-set="save-ssat" ${!state.doc ? 'disabled' : ''}>Save Encrypted .ssat Audit</button>
          <button type="button" class="btn btn-secondary" data-set="open-ssat">Open Encrypted .ssat Audit</button>
        </div>
        <div class="btn-row" style="margin-top:10px">
          <button type="button" class="btn btn-outline" data-set="lock" ${!state.doc ? 'disabled' : ''}>Lock Session</button>
          <button type="button" class="btn btn-outline" data-set="clear-session" ${!state.doc ? 'disabled' : ''}>Clear Session from Memory</button>
          ${state.doc?.is_demo ? '<button type="button" class="btn btn-outline" data-set="reset-demo">Reset Practice Audit</button>' : ''}
        </div>
        ${
          state.goServerMode
            ? `<div class="callout callout-info" style="margin-top:14px">
                 <strong>Standalone Go Edition active (127.0.0.1 loopback only · v${esc(state.goVersion || '1.0.0')})</strong>
                 <p style="margin:6px 0">Files save atomically to your local disk with <code>0600</code> permissions. Stop the local server when finished.</p>
                 <button type="button" class="btn btn-sm btn-danger" data-set="stop-go">Stop Local Go Server</button>
               </div>`
            : ''
        }
      </section>

      <section class="card">
        <h2>Opt-In Encrypted Local Browser Autosave</h2>
        <p class="callout callout-warn">
          <strong>Shared-device warning:</strong> Disabled by default. Do <strong>not</strong> enable browser autosave on shared, borrowed, or public computers. Even when encrypted, exported files, browser caches, and OS downloads remain subject to device security.
        </p>
        ${
          state.autosaveEnabled
            ? `<p class="text-ok"><strong>Encrypted local autosave is ON for this session.</strong></p>
               <div class="btn-row" style="margin-top:10px">
                 <button type="button" class="btn btn-outline" data-set="disable-autosave">Turn Off Autosave</button>
                 <button type="button" class="btn btn-danger" data-set="clear-local">Clear Local Encrypted Copy</button>
               </div>`
            : `<form id="autosave-optin-form" style="margin-top:10px">
                 <label>
                   <span>Passphrase for encrypted local copy (min 10 characters; never saved in plaintext)</span>
                   <input type="password" name="autosave_pass" minlength="10" required autocomplete="new-password" />
                 </label>
                 <div class="btn-row" style="margin-top:10px">
                   <button type="submit" class="btn btn-secondary" ${!state.doc ? 'disabled' : ''}>Enable Encrypted Local Autosave</button>
                   ${hasLocal ? '<button type="button" class="btn btn-outline" data-set="clear-local">Clear Existing Local Copy</button>' : ''}
                 </div>
               </form>
               <div id="autosave-err" class="callout callout-danger" hidden role="alert" style="margin-top:8px"></div>`
        }
      </section>
    </div>

    <section class="card" style="margin-top:16px">
      <h2>Privacy, Security &amp; Legal Boundary Statement</h2>
      <ul>
        <li><strong>No telemetry or cloud accounts:</strong> SSAT makes zero outbound calls to external analytics, font CDNs, tracking scripts, or third-party AI APIs.</li>
        <li><strong>Hosting disclosure:</strong> When accessed via GitHub Pages, audit contents stay in your browser and are not intentionally uploaded, though GitHub's web servers still receive standard HTTP request metadata (IP address, requested static file path, user-agent).</li>
        <li><strong>Offline app shell:</strong> The optional service worker caches static app code only — never audit records, passphrases, or exports.</li>
        <li><strong>Not legal advice or certification:</strong> SSAT is a practical self-assessment assistant informed by NIST CSF 2.0, NIST Small Business Cybersecurity Corner, NIST AI RMF, OWASP ASVS, and W3C WCAG 2.2. Any legal applicability question (FERPA, PCI DSS, state privacy/breach laws, retention schedules, ADA/accessibility duties) requires qualified counsel or authorized institutional review.</li>
        <li><strong>Catalog &amp; Schema:</strong> Control Catalog v${esc(CATALOG.catalog_version)} · Schema v1.0.0 · <code>.ssat</code> Envelope v1 (Argon2id + AES-256-GCM).</li>
      </ul>
    </section>

    <section class="card" style="margin-top:16px">
      <h2>Plain-Language Security Glossary</h2>
      <dl class="glossary-dl">
        ${CATALOG.glossary.map((g) => `<dt>${esc(g.term)}</dt><dd>${esc(g.plain_definition)}</dd>`).join('')}
      </dl>
    </section>
  `;
}

export function bindSettingsEvents(container: HTMLElement, actions: SettingsActions): void {
  container.querySelector('[data-set="save-ssat"]')?.addEventListener('click', actions.onSaveSsat);
  container.querySelector('[data-set="open-ssat"]')?.addEventListener('click', actions.onOpenSsat);
  container.querySelector('[data-set="lock"]')?.addEventListener('click', actions.onLockSession);
  container.querySelector('[data-set="clear-session"]')?.addEventListener('click', () => {
    if (window.confirm('Clear the active audit from browser memory? Unexported edits will be lost.')) {
      actions.onClearSession();
    }
  });
  container.querySelector('[data-set="reset-demo"]')?.addEventListener('click', () => {
    if (window.confirm('Reset the fictional Practice Audit back to its original synthetic baseline?')) {
      actions.onResetDemo();
    }
  });
  container.querySelector('[data-set="disable-autosave"]')?.addEventListener('click', actions.onDisableAutosave);
  container.querySelector('[data-set="clear-local"]')?.addEventListener('click', actions.onClearLocalCopy);
  container.querySelector('[data-set="stop-go"]')?.addEventListener('click', actions.onStopGoServer);

  const form = container.querySelector<HTMLFormElement>('#autosave-optin-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = container.querySelector<HTMLElement>('#autosave-err');
    const fd = new FormData(form);
    const pass = String(fd.get('autosave_pass') || '');
    try {
      if (errEl) errEl.hidden = true;
      await actions.onEnableAutosave(pass);
    } catch (err) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = err instanceof Error ? err.message : 'Unable to enable encrypted autosave.';
      }
    }
  });
}
