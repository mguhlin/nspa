import { desktopBridge } from './storage/desktop';
import './style.css';
import { Store, saveTruthLabel } from './audit/state';
import type { ScreenId } from './types';
import { announce, esc, focusMainHeading, registerLiveRegion } from './a11y/helpers';
import { decryptSsatToAudit } from './crypto/ssat';
import {
  detectGoServer,
  listGoAuditFiles,
  openAuditGoLocal,
  saveAuditBrowser,
  saveAuditGoLocal,
  shutdownGoServer
} from './storage/fileIO';
import {
  clearLocalEncryptedCopy,
  loadLocalEncryptedCopy,
  saveLocalEncryptedCopy
} from './storage/localAutosave';
import type { CsvInventoryPreview } from './storage/csv';
import { bindWelcomeEvents, renderWelcome } from './screens/welcome';
import { bindProfileScopeEvents, renderProfileScope } from './screens/profileScope';
import { bindDashboardEvents, renderDashboard, type DashboardFilterState } from './screens/dashboard';
import { bindGuidedAuditEvents, renderGuidedAudit } from './screens/guidedAudit';
import { bindEvidenceLibraryEvents, renderEvidenceLibrary } from './screens/evidenceLibrary';
import { bindDataInventoryEvents, renderDataInventory } from './screens/dataInventory';
import { bindSimulationsEvents, renderSimulations } from './screens/simulations';
import { bindFindingsActionsEvents, renderFindingsActions, type FindingsFilter } from './screens/findingsActions';
import { bindReportsEvents, renderReportsView, type ReportsUiState } from './screens/reportsView';
import { bindHistoryEvents, renderHistoryView } from './screens/historyView';
import { bindSettingsEvents, renderSettingsAbout } from './screens/settingsAbout';

import { bindRoadmapEvents, renderRoadmap } from './screens/roadmap';
import { bindQuickCheckEvents, renderQuickCheck } from './screens/quickCheck';

const store = new Store();

let dashFilter: DashboardFilterState = { domain: '', priority: '', status: 'needs_work', nist: '', matrixCell: '' };
let findingsFilter: FindingsFilter = { severity: '', status: '', horizon: '' };
let reportsUi: ReportsUiState = { reportType: 'executive', privacyMode: 'redacted' };
let pendingCsvPreview: CsvInventoryPreview | null = null;
let lastRenderedScreen: ScreenId | null = null;
let autosaveTimer: number | null = null;

const NAV_ITEMS: ReadonlyArray<{ id: ScreenId; label: string; requiresDoc: boolean }> = [
  { id: 'welcome', label: 'Welcome', requiresDoc: false },
  { id: 'roadmap', label: 'My roadmap', requiresDoc: true },
  { id: 'quick', label: 'Five starting questions', requiresDoc: true },
  { id: 'findings', label: 'Action plan', requiresDoc: true },
  { id: 'reports', label: 'Reports', requiresDoc: true }
];
const TOOLS: ReadonlyArray<{ id: ScreenId; label: string }> = [
  { id: 'profile', label: 'Audit details' }, { id: 'audit', label: 'Full review (30 questions)' },
  { id: 'dashboard', label: 'Risk dashboard' }, { id: 'evidence', label: 'Evidence notes' },
  { id: 'inventory', label: 'Information inventory' }, { id: 'simulations', label: 'Practice exercises' },
  { id: 'history', label: 'Audit history' }, { id: 'settings', label: 'Settings & About' }
];

function scheduleEncryptedAutosave(): void {
  const st = store.get();
  if (!st.autosaveEnabled || !st.autosavePassphrase || !st.doc || !st.dirty) return;
  if (autosaveTimer !== null) window.clearTimeout(autosaveTimer);
  autosaveTimer = window.setTimeout(async () => {
    const cur = store.get();
    if (!cur.autosaveEnabled || !cur.autosavePassphrase || !cur.doc) return;
    try {
      await saveLocalEncryptedCopy(cur.doc, cur.autosavePassphrase);
      store.markEncryptedAutosaveSynced();
    } catch (err) {
      store.setStatus(err instanceof Error ? err.message : 'Encrypted local autosave failed.', 'warn');
    }
  }, 900);
}

function openSaveDialog(): void {
  const st = store.get();
  if (!st.doc) return;
  const dlg = document.querySelector<HTMLDialogElement>('#dlg-save');
  if (!dlg) return;
  const errEl = dlg.querySelector<HTMLElement>('.dlg-error');
  const goWrap = dlg.querySelector<HTMLElement>('#save-go-filename-wrap');
  const fnInput = dlg.querySelector<HTMLInputElement>('input[name="go_filename"]');
  const form = dlg.querySelector<HTMLFormElement>('form');
  form?.reset();
  if (errEl) errEl.hidden = true;
  if (goWrap) goWrap.hidden = !st.goServerMode || Boolean(desktopBridge());
  if (fnInput) {
    const defaultName =
      st.lastSavedPath?.split(/[\\/]/).pop() ||
      `${(st.doc.organization_profile.display_name || st.doc.audit_id || 'scholarship-audit')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40) || 'scholarship-audit'}.ssat`;
    fnInput.value = defaultName;
  }
  dlg.showModal();
}

async function openLoadDialog(): Promise<void> {
  const st = store.get();
  const dlg = document.querySelector<HTMLDialogElement>('#dlg-open');
  if (!dlg) return;
  const errEl = dlg.querySelector<HTMLElement>('.dlg-error');
  const goBox = dlg.querySelector<HTMLElement>('#open-go-files-wrap');
  const goSelect = dlg.querySelector<HTMLSelectElement>('select[name="go_open_file"]');
  const form = dlg.querySelector<HTMLFormElement>('form');
  form?.reset();
  if (errEl) errEl.hidden = true;
  if (goBox) goBox.hidden = !st.goServerMode || Boolean(desktopBridge());

  if (st.goServerMode && st.goCsrfToken && goSelect) {
    const files = await listGoAuditFiles(st.goCsrfToken);
    goSelect.innerHTML =
      files.length > 0
        ? `<option value="">— Choose a local .ssat file —</option>${files
            .map((f) => `<option value="${esc(f)}">${esc(f)}</option>`)
            .join('')}`
        : '<option value="">No .ssat files in default local folder yet (use file picker below)</option>';
  }
  dlg.showModal();
}

function openUnlockLocalDialog(): void {
  const dlg = document.querySelector<HTMLDialogElement>('#dlg-unlock-local');
  if (!dlg) return;
  const errEl = dlg.querySelector<HTMLElement>('.dlg-error');
  const form = dlg.querySelector<HTMLFormElement>('form');
  form?.reset();
  if (errEl) errEl.hidden = true;
  dlg.showModal();
}

function renderActiveScreen(): string {
  const st = store.get();
  switch (st.screen) {
    case 'roadmap': return renderRoadmap(store);
    case 'quick': return renderQuickCheck(store);
    case 'welcome':
      return renderWelcome(store);
    case 'profile':
      return renderProfileScope(store);
    case 'dashboard':
      return renderDashboard(store, dashFilter);
    case 'audit':
      return renderGuidedAudit(store);
    case 'evidence':
      return renderEvidenceLibrary(store);
    case 'inventory':
      return renderDataInventory(store, pendingCsvPreview);
    case 'simulations':
      return renderSimulations(store);
    case 'findings':
      return renderFindingsActions(store, findingsFilter);
    case 'reports':
      return renderReportsView(store, reportsUi);
    case 'history':
      return renderHistoryView(store);
    case 'settings':
      return renderSettingsAbout(store);
  }
}

function renderShell(): void {
  const root = document.querySelector<HTMLElement>('#app');
  if (!root) return;
  const st = store.get();
  const truth = saveTruthLabel(st);
  const screenChanged = lastRenderedScreen !== st.screen;

  const navHtml = NAV_ITEMS.map((item) => {
    const active = st.screen === item.id;
    return `<button type="button" class="nav-tab ${active ? 'active' : ''}" data-screen="${item.id}" data-needs-doc="${item.requiresDoc ? '1' : '0'}" ${active ? 'aria-current="page"' : ''}>${esc(item.label)}</button>`;
  }).join('');

  root.innerHTML = `
    <div class="sr-only" id="a11y-live" aria-live="polite" aria-atomic="true"></div>
    <header class="masthead wrap no-print">
      <div class="brand">
        <a class="brand-home" href="${st.goServerMode ? './' : '../'}" aria-label="NSPA Scholarship Resources">
          <img class="nspa-logo" src="./nspa-logo.png" alt="NSPA" width="110" height="70" />
        </a>
        <div class="brand-caption">
          <strong>Scholarship Security Audit Toolkit</strong>
          <span>${desktopBridge() ? 'Offline desktop edition · No internet needed' : st.goServerMode ? 'Local browser edition' : 'A practical security roadmap for scholarship teams'}</span>
        </div>
      </div>
      <div class="header-actions">
        <span class="save-pill save-pill-${truth.tone}" id="save-state-pill">${esc(truth.text)}</span>
        <button type="button" class="btn btn-sm btn-outline" id="btn-undo" ${st.undoStack.length === 0 ? 'disabled' : ''} title="Undo last change">Undo (${st.undoStack.length})</button>
        <button type="button" class="btn btn-sm btn-primary" id="btn-save-ssat" ${!st.doc ? 'disabled' : ''}>Save audit</button>
        <button type="button" class="btn btn-sm btn-outline" id="btn-lock" ${!st.doc ? 'disabled' : ''}>Lock</button>
        ${!st.goServerMode ? '<a class="back-link" href="../">NSPA Home</a>' : `<button type="button" class="btn btn-sm btn-outline" id="btn-stop-go">${desktopBridge() ? 'Quit app' : 'Stop server'}</button>`}
      </div>
    </header>

    <nav class="workspace-nav no-print" aria-label="Audit sections">
      <div class="wrap workspace-nav-inner">${navHtml}<details class="tools-menu" ${TOOLS.some(t => t.id === st.screen) ? 'open' : ''}><summary>All tools</summary><div class="tools-panel">${TOOLS.map(t => `<button class="nav-tab ${st.screen === t.id ? 'active' : ''}" data-screen="${t.id}" data-needs-doc="${t.id === 'settings' ? '0' : '1'}" ${st.screen === t.id ? 'aria-current="page"' : ''}>${t.label}</button>`).join('')}</div></details></div>
    </nav>

    ${
      st.statusMessage
        ? `<div class="wrap no-print">
             <div class="status-banner status-${st.statusTone}" role="status">
               <span>${esc(st.statusMessage)}</span>
               <button type="button" class="btn-close-banner" id="dismiss-status" aria-label="Dismiss notification">×</button>
             </div>
           </div>`
        : ''
    }

    <main id="main" class="wrap main-workspace">
      ${renderActiveScreen()}
    </main>

    <footer class="wrap site-footer no-print">
      <p>
        <strong>Scholarship Security Audit Toolkit (SSAT)</strong> · Local-first self-assessment assistant for scholarship providers.
        Not a compliance certification or legal opinion.
      </p>
      <p class="muted">
        NSPA resource collection by <a href="https://mguhlin.org" rel="noopener noreferrer">Miguel Guhlin</a> · Catalog v1.0.0 · Zero telemetry
      </p>
    </footer>

    <dialog id="dlg-save" aria-labelledby="dlg-save-title">
      <form method="dialog" id="form-save-ssat">
        <div class="dlg-head">
          <h2 id="dlg-save-title">Save your audit safely</h2>
          <button type="button" class="btn btn-sm btn-outline" data-close-dlg="dlg-save">Close</button>
        </div>
        <p class="muted">Creates a password-protected .ssat file on your device. You will need the same passphrase to reopen it. There is no password reset.</p>
        <div id="save-go-filename-wrap" hidden>
          <label>
            <span>Local filename inside SSAT folder (.ssat)</span>
            <input type="text" name="go_filename" maxlength="120" />
          </label>
        </div>
        <label style="margin-top:10px">
          <span>Passphrase (minimum 10 characters) *</span>
          <input type="password" name="pass1" minlength="10" required autocomplete="new-password" />
        </label>
        <label style="margin-top:10px">
          <span>Confirm passphrase *</span>
          <input type="password" name="pass2" minlength="10" required autocomplete="new-password" />
        </label>
        <div class="dlg-error callout callout-danger" hidden role="alert" style="margin-top:10px"></div>
        <div class="btn-row" style="margin-top:14px">
          <button type="submit" class="btn btn-primary" id="btn-confirm-save">Encrypt &amp; Save audit</button>
          <button type="button" class="btn btn-outline" data-close-dlg="dlg-save">Cancel</button>
        </div>
      </form>
    </dialog>

    <dialog id="dlg-open" aria-labelledby="dlg-open-title">
      <form method="dialog" id="form-open-ssat">
        <div class="dlg-head">
          <h2 id="dlg-open-title">Open a saved audit</h2>
          <button type="button" class="btn btn-sm btn-outline" data-close-dlg="dlg-open">Close</button>
        </div>
        <p class="muted">Select an encrypted <code>.ssat</code> bundle created by either the browser or standalone Go edition.</p>
        <div id="open-go-files-wrap" hidden style="margin-bottom:10px">
          <label>
            <span>Local .ssat file (Go local folder)</span>
            <select name="go_open_file"></select>
          </label>
        </div>
        <label>
          <span>Choose .ssat file from device</span>
          ${desktopBridge() ? '<span>Use Open to choose a saved audit in the system file picker.</span>' : '<input type="file" name="ssat_file" accept=".ssat,application/json,application/octet-stream" />'}
        </label>
        <label style="margin-top:10px">
          <span>Passphrase *</span>
          <input type="password" name="open_pass" required autocomplete="current-password" />
        </label>
        <div class="dlg-error callout callout-danger" hidden role="alert" style="margin-top:10px"></div>
        <div class="btn-row" style="margin-top:14px">
          <button type="submit" class="btn btn-primary" id="btn-confirm-open">Decrypt &amp; Open</button>
          <button type="button" class="btn btn-outline" data-close-dlg="dlg-open">Cancel</button>
        </div>
      </form>
    </dialog>

    <dialog id="dlg-unlock-local" aria-labelledby="dlg-unlock-title">
      <form method="dialog" id="form-unlock-local">
        <div class="dlg-head">
          <h2 id="dlg-unlock-title">Unlock Encrypted Local Browser Copy</h2>
          <button type="button" class="btn btn-sm btn-outline" data-close-dlg="dlg-unlock-local">Close</button>
        </div>
        <label>
          <span>Passphrase *</span>
          <input type="password" name="local_pass" required autocomplete="current-password" />
        </label>
        <div class="dlg-error callout callout-danger" hidden role="alert" style="margin-top:10px"></div>
        <div class="btn-row" style="margin-top:14px">
          <button type="submit" class="btn btn-primary">Unlock Local Copy</button>
          <button type="button" class="btn btn-outline" data-close-dlg="dlg-unlock-local">Cancel</button>
        </div>
      </form>
    </dialog>
  `;

  registerLiveRegion(root.querySelector('#a11y-live'));
  if (st.statusMessage) announce(st.statusMessage);

  // Header & Nav bindings
  root.querySelectorAll<HTMLButtonElement>('[data-screen]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.screen as ScreenId;
      const needsDoc = btn.dataset.needsDoc === '1';
      if (needsDoc) {
        store.ensureActiveAuditAndNavigate(target);
      } else {
        store.navigate(target);
      }
    });
  });

  root.querySelector('#btn-undo')?.addEventListener('click', () => {
    store.undo();
  });
  root.querySelector('#btn-save-ssat')?.addEventListener('click', () => openSaveDialog());
  root.querySelector('#btn-lock')?.addEventListener('click', () => {
    if (store.get().dirty && !window.confirm('Lock and discard unsaved changes? Save audit first to keep them.')) return;
    store.lockSession();
  });
  root.querySelector('#dismiss-status')?.addEventListener('click', () => store.setStatus(''));
  root.querySelector('#btn-stop-go')?.addEventListener('click', handleStopGoServer);

  // Dialog close buttons
  root.querySelectorAll<HTMLButtonElement>('[data-close-dlg]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dlg = root.querySelector<HTMLDialogElement>(`#${btn.dataset.closeDlg}`);
      dlg?.close();
    });
  });

  // Save .ssat submit
  const saveForm = root.querySelector<HTMLFormElement>('#form-save-ssat');
  saveForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cur = store.get();
    if (!cur.doc) return;
    const dlg = root.querySelector<HTMLDialogElement>('#dlg-save');
    const errEl = dlg?.querySelector<HTMLElement>('.dlg-error');
    const btn = dlg?.querySelector<HTMLButtonElement>('#btn-confirm-save');
    const fd = new FormData(saveForm);
    const p1 = String(fd.get('pass1') || '');
    const p2 = String(fd.get('pass2') || '');

    if (p1.length < 10) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Passphrase must be at least 10 characters.';
      }
      return;
    }
    if (p1 !== p2) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Passphrases do not match.';
      }
      return;
    }

    try {
      if (errEl) errEl.hidden = true;
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Encrypting (Argon2id)…';
      }
      if (cur.goServerMode && cur.goCsrfToken) {
        const fn = String(fd.get('go_filename') || 'scholarship-audit.ssat').trim();
        const savedPath = await saveAuditGoLocal(cur.doc, p1, fn, cur.goCsrfToken);
        dlg?.close();
        if (store.get().doc === cur.doc) store.markFileSaved(savedPath);
        else store.setStatus('Saved the earlier version. Save again to include your latest changes.', 'warn');
      } else {
        const filename = await saveAuditBrowser(cur.doc, p1);
        dlg?.close();
        if (store.get().doc === cur.doc) store.markFileSaved(filename);
        else store.setStatus('Exported the earlier version. Save again to include your latest changes.', 'warn');
      }
    } catch (err) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = err instanceof Error ? err.message : 'Encryption or save failed.';
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Encrypt & Save audit';
      }
    }
  });

  // Open .ssat submit
  const openForm = root.querySelector<HTMLFormElement>('#form-open-ssat');
  openForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cur = store.get();
    const dlg = root.querySelector<HTMLDialogElement>('#dlg-open');
    const errEl = dlg?.querySelector<HTMLElement>('.dlg-error');
    const btn = dlg?.querySelector<HTMLButtonElement>('#btn-confirm-open');
    const fd = new FormData(openForm);
    const pass = String(fd.get('open_pass') || '');
    const goFile = String(fd.get('go_open_file') || '').trim();
    const fileInput = openForm.querySelector<HTMLInputElement>('input[name="ssat_file"]');
    const pickedFile = fileInput?.files?.[0];

    try {
      if (errEl) errEl.hidden = true;
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Decrypting…';
      }

      const native = desktopBridge();
      if (native) {
        const picked = await native.OpenAudit();
        if (!picked) throw new Error('Open cancelled. Your current audit is unchanged.');
        const res = await decryptSsatToAudit(picked.encrypted_ssat, pass);
        if (store.get().doc !== cur.doc) throw new Error('The current audit changed. Open the file again when ready.');
        dlg?.close();
        store.openLoadedAudit(res.document, picked.path, res.warnings);
      } else if (pickedFile) {
        const text = await pickedFile.text();
        const res = await decryptSsatToAudit(text, pass);
        dlg?.close();
        store.openLoadedAudit(res.document, pickedFile.name, res.warnings);
      } else if (cur.goServerMode && cur.goCsrfToken && goFile) {
        const res = await openAuditGoLocal(goFile, pass, cur.goCsrfToken);
        dlg?.close();
        store.openLoadedAudit(res.document, res.path, res.warnings);
      } else {
        throw new Error('Choose a .ssat file to open.');
      }
    } catch (err) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = err instanceof Error ? err.message : 'Unable to decrypt .ssat file.';
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Decrypt & Open';
      }
    }
  });

  // Unlock local copy submit
  const localForm = root.querySelector<HTMLFormElement>('#form-unlock-local');
  localForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const dlg = root.querySelector<HTMLDialogElement>('#dlg-unlock-local');
    const errEl = dlg?.querySelector<HTMLElement>('.dlg-error');
    const fd = new FormData(localForm);
    const pass = String(fd.get('local_pass') || '');
    try {
      const res = await loadLocalEncryptedCopy(pass);
      dlg?.close();
      store.openLoadedAudit(res.document, null, res.warnings);
      store.configureAutosave(true, pass);
    } catch (err) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = err instanceof Error ? err.message : 'Unable to unlock local encrypted copy.';
      }
    }
  });

  // Bind screen-specific events
  const mainEl = root.querySelector<HTMLElement>('#main');
  if (mainEl) {
    switch (st.screen) {
      case 'roadmap': bindRoadmapEvents(mainEl, store); break;
      case 'quick': bindQuickCheckEvents(mainEl, store); break;
      case 'welcome':
        bindWelcomeEvents(mainEl, store, {
          onOpenSsatModal: () => void openLoadDialog(),
          onUnlockLocalCopy: () => openUnlockLocalDialog(),
          onClearLocalCopy: () => {
            clearLocalEncryptedCopy();
            store.configureAutosave(false, null);
            store.setStatus('Cleared encrypted local browser copy.', 'ok');
          }
        });
        break;
      case 'profile':
        bindProfileScopeEvents(mainEl, store);
        break;
      case 'dashboard':
        bindDashboardEvents(
          mainEl,
          store,
          dashFilter,
          (next) => {
            dashFilter = next;
            renderShell();
          },
          {
            onOpenReport: (reportType) => {
              reportsUi = { ...reportsUi, reportType };
              store.navigate('reports');
            },
            onSaveSsat: () => openSaveDialog()
          }
        );
        break;
      case 'audit':
        bindGuidedAuditEvents(mainEl, store);
        break;
      case 'evidence':
        bindEvidenceLibraryEvents(mainEl, store);
        break;
      case 'inventory':
        bindDataInventoryEvents(mainEl, store, pendingCsvPreview, (next) => {
          pendingCsvPreview = next;
          renderShell();
        });
        break;
      case 'simulations':
        bindSimulationsEvents(mainEl, store);
        break;
      case 'findings':
        bindFindingsActionsEvents(mainEl, store, findingsFilter, (next) => {
          findingsFilter = next;
          renderShell();
        });
        break;
      case 'reports':
        bindReportsEvents(mainEl, store, reportsUi, (next) => {
          reportsUi = next;
          renderShell();
        });
        break;
      case 'history':
        bindHistoryEvents(mainEl, store, () => {
          reportsUi = { ...reportsUi, reportType: 'comparison' };
          store.navigate('reports');
        });
        break;
      case 'settings':
        bindSettingsEvents(mainEl, {
          onSaveSsat: () => openSaveDialog(),
          onOpenSsat: () => void openLoadDialog(),
          onEnableAutosave: async (pass) => {
            const doc = store.get().doc;
            if (!doc) throw new Error('Start or open an audit first.');
            await saveLocalEncryptedCopy(doc, pass);
            store.configureAutosave(true, pass);
            store.setStatus('Opt-in encrypted local browser autosave enabled.', 'ok');
          },
          onDisableAutosave: () => {
            store.configureAutosave(false, null);
            store.setStatus('Encrypted local browser autosave disabled.', 'info');
          },
          onClearLocalCopy: () => {
            clearLocalEncryptedCopy();
            store.configureAutosave(false, null);
            store.setStatus('Cleared encrypted local browser copy.', 'ok');
          },
          onLockSession: () => store.lockSession(),
          onClearSession: () => store.clearSession(),
          onResetDemo: () => store.startDemoAudit(),
          onStopGoServer: handleStopGoServer
        });
        break;
    }
  }

  lastRenderedScreen = st.screen;
  if (screenChanged) focusMainHeading();
}

async function handleStopGoServer(): Promise<void> {
  const st = store.get();
  if (!st.goServerMode || !st.goCsrfToken) return;
  if (desktopBridge()) { await desktopBridge()!.Quit(); return; }
  if (!window.confirm('Stop the local SSAT Go server? Make sure you have saved your encrypted .ssat file first.')) {
    return;
  }
  try {
    await shutdownGoServer(st.goCsrfToken);
    store.lockSession();
    store.setStatus('Local Go server stopped safely. You may now close this browser tab.', 'ok');
  } catch (err) {
    store.setStatus(err instanceof Error ? err.message : 'Unable to stop local server.', 'danger');
  }
}

store.subscribe(() => {
  renderShell();
  scheduleEncryptedAutosave();
  void desktopBridge()?.SetUnsaved(Boolean(store.get().doc && (store.get().dirty || !store.get().lastSavedPath)));
});

window.addEventListener('beforeunload', (event) => {
  const st = store.get();
  if (st.doc && st.dirty && st.saveTruth !== 'file_saved') {
    event.preventDefault();
    event.returnValue = '';
  }
});

// Initialize: detect standalone Go local server, register optional app-shell SW on static hosting
async function bootstrap(): Promise<void> {
  renderShell();
  if (desktopBridge()) {
    document.addEventListener('click', event => {
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
      if (link && !link.getAttribute('href')?.startsWith('#')) {
        event.preventDefault();
        store.setStatus('This desktop app works offline. Website links are available in the web edition.', 'info');
      }
    });
  }
  const goInfo = await detectGoServer();
  if (goInfo) {
    store.setGoRuntime(true, goInfo.csrf_token, goInfo.version);
    if (await desktopBridge()?.SmokeEnabled()) {
      const { runNativeSmoke } = await import('./nativeSmoke');
      await runNativeSmoke(store);
    }
  } else if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    navigator.serviceWorker.register('./sw.js').catch(() => undefined);
  }
}

void bootstrap();
