import type { Store } from '../audit/state';
import type { Sensitivity } from '../types';
import { getTemplateByKey } from '../audit/catalog';
import { exportInventoryToCsv, previewInventoryCsv, type CsvInventoryPreview } from '../storage/csv';
import { esc, nextId, todayISO, triggerDownload } from '../a11y/helpers';

export function detectInventoryGaps(store: Store): string[] {
  const doc = store.get().doc;
  if (!doc) return [];
  const gaps: string[] = [];
  if (doc.inventory.length === 0) {
    gaps.push('No scholarship data inventory rows exist yet. Map Intake, Review, Award, Payment, Donor, and Archive stages.');
    return gaps;
  }
  const stages = new Set(doc.inventory.map((i) => i.process_stage.toLowerCase()));
  for (const required of ['intake', 'review', 'payment', 'donor']) {
    if (![...stages].some((s) => s.includes(required))) {
      gaps.push(`Missing lifecycle stage: "${required}" has no inventoried system or copy path.`);
    }
  }
  for (const item of doc.inventory) {
    if (!item.business_owner_role.trim()) gaps.push(`${item.asset_id} (${item.system_name}): missing accountable business owner role.`);
    if (!item.disposal_method.trim()) gaps.push(`${item.asset_id} (${item.system_name}): missing disposal method.`);
    if (!item.retention_rule.trim()) gaps.push(`${item.asset_id} (${item.system_name}): missing retention rule.`);
    if (item.known_gaps.trim()) gaps.push(`${item.asset_id} (${item.system_name}): ${item.known_gaps.trim()}`);
  }
  return gaps;
}

export function renderDataInventory(store: Store, pendingCsv: CsvInventoryPreview | null): string {
  const doc = store.get().doc;
  if (!doc) return '<p>Start or open an audit first.</p>';

  const gaps = detectInventoryGaps(store);
  const stagesOrdered = ['Intake', 'Review', 'Award', 'Payment', 'Donor', 'Archive'];
  const flowHtml = stagesOrdered
    .map((stage) => {
      const items = doc.inventory.filter((i) => i.process_stage.toLowerCase().includes(stage.toLowerCase()));
      return `
        <div class="flow-stage">
          <strong>${esc(stage)}</strong>
          <span>${items.length} asset${items.length === 1 ? '' : 's'}</span>
          <small>${items.length ? esc(items.map((x) => x.system_name).join(', ')) : 'Not yet mapped'}</small>
        </div>`;
    })
    .join('');

  const rowsHtml = doc.inventory
    .map(
      (i) => `
      <tr>
        <td><strong>${esc(i.asset_id)}</strong><br><span class="badge badge-info">${esc(i.process_stage)}</span></td>
        <td><strong>${esc(i.system_name)}</strong><br><small class="muted">${esc(i.storage_location || 'Location unknown')}</small></td>
        <td>${esc(i.data_categories)}<br><span class="badge badge-neutral">${esc(i.sensitivity)}</span></td>
        <td>Biz: ${esc(i.business_owner_role || '—')}<br>Tech: ${esc(i.technical_owner_role || '—')}<br><small class="muted">Roles: ${esc(i.authorized_roles || '—')}</small></td>
        <td>${esc(i.systems_receiving_copies || 'None listed')}</td>
        <td>${esc(i.retention_trigger || '—')}<br><small>${esc(i.retention_rule || '—')}</small><br><small class="muted">Disposal: ${esc(i.disposal_method || '—')}</small></td>
        <td>${esc(i.known_gaps || 'None noted')}<br><small class="muted">Verified: ${esc(i.last_verified || '—')}</small></td>
        <td><button type="button" class="btn btn-sm btn-outline" data-del-inv="${esc(i.asset_id)}">Remove</button></td>
      </tr>`
    )
    .join('');

  return `
    <div class="page-head">
      <div>
        <p class="eyebrow">DATA-01 · Lifecycle Data Mapping</p>
        <h1>Data Inventory Builder (${doc.inventory.length} assets)</h1>
        <p class="muted">Map data categories, owners, copy paths, and disposal across all 18 DATA-01 columns. Never paste raw student or donor personal data.</p>
      </div>
      <div class="btn-row">
        <button type="button" class="btn btn-outline" data-action="dl-inv-tpl">Blank 18-Column CSV Template</button>
        <button type="button" class="btn btn-secondary" data-action="export-inv-csv">Export Safe CSV</button>
      </div>
    </div>

    <section class="card" aria-labelledby="flow-heading">
      <h2 id="flow-heading">Scholarship Lifecycle Data Flow</h2>
      <div class="flow-strip">${flowHtml}</div>
    </section>

    <section class="card ${gaps.length ? 'callout-warn' : ''}" style="margin-top:16px" aria-labelledby="gap-heading">
      <h2 id="gap-heading">Missing Data Locations &amp; Gap Detector (${gaps.length})</h2>
      ${
        gaps.length === 0
          ? '<p>No obvious structural gaps detected in current inventory rows.</p>'
          : `<ul class="compact-list">${gaps.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>`
      }
    </section>

    <section class="card" style="margin-top:16px" aria-labelledby="csv-import-heading">
      <h2 id="csv-import-heading">Import Metadata-Only Inventory CSV</h2>
      <p class="muted">Imports column metadata only (max 2 MiB, 500 rows). SSAT scans for accidental email/SSN patterns before merging.</p>
      <div class="btn-row">
        <label class="file-btn">
          <span>Choose Metadata CSV File</span>
          <input type="file" id="inv-csv-file" accept=".csv,text/csv" />
        </label>
      </div>
      <div id="inv-csv-error" class="callout callout-danger" hidden role="alert" style="margin-top:10px"></div>
      ${
        pendingCsv
          ? `<div class="callout callout-info" style="margin-top:12px">
               <strong>Previewing ${pendingCsv.items.length} row(s)</strong> (columns detected: ${esc(pendingCsv.headers.slice(0, 8).join(', '))}${pendingCsv.headers.length > 8 ? '…' : ''}).
               ${
                 pendingCsv.piiWarnings.length > 0
                   ? `<div class="callout callout-danger" style="margin-top:8px"><strong>Possible PII Warning — Review before importing:</strong><ul>${pendingCsv.piiWarnings.map((w) => `<li>${esc(w)}</li>`).join('')}</ul></div>`
                   : ''
               }
               <div class="btn-row" style="margin-top:10px">
                 <button type="button" class="btn btn-sm btn-primary" data-action="confirm-csv-merge">Append ${pendingCsv.items.length} Row(s) to Inventory</button>
                 <button type="button" class="btn btn-sm btn-outline" data-action="cancel-csv">Cancel</button>
               </div>
             </div>`
          : ''
      }
    </section>

    <section class="card" style="margin-top:16px" aria-labelledby="inv-table-heading">
      <h2 id="inv-table-heading">Inventory Register</h2>
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Asset &amp; Stage</th>
              <th>System &amp; Storage</th>
              <th>Data Categories</th>
              <th>Owners &amp; Access</th>
              <th>Downstream Copies</th>
              <th>Retention &amp; Disposal</th>
              <th>Known Gaps</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>${rowsHtml || '<tr><td colspan="8">No data inventory items yet. Add one below or import a metadata CSV.</td></tr>'}</tbody>
        </table>
      </div>
    </section>

    <form id="add-inv-form" class="card form-section" style="margin-top:16px">
      <h2>Add Data Inventory Asset (18 DATA-01 Columns)</h2>
      <div class="form-grid">
        <label><span>Process stage *</span>
          <select name="process_stage">
            <option value="Intake">Intake</option>
            <option value="Review">Review</option>
            <option value="Award">Award</option>
            <option value="Payment">Payment</option>
            <option value="Donor">Donor</option>
            <option value="Archive">Archive</option>
          </select>
        </label>
        <label><span>System name *</span><input type="text" name="system_name" required placeholder="e.g., Example Scholarship Portal" maxlength="160" /></label>
        <label><span>Business owner role</span><input type="text" name="business_owner_role" placeholder="e.g., Program Director" maxlength="120" /></label>
        <label><span>Technical owner role</span><input type="text" name="technical_owner_role" placeholder="e.g., IT Lead" maxlength="120" /></label>
        <label><span>Data categories (types only)</span><input type="text" name="data_categories" placeholder="Contact details; essays; grades" maxlength="400" /></label>
        <label><span>Sensitivity</span>
          <select name="sensitivity">
            <option value="Confidential">Confidential</option>
            <option value="Restricted">Restricted</option>
            <option value="Internal">Internal</option>
            <option value="Public">Public</option>
            <option value="Unknown">Unknown</option>
          </select>
        </label>
        <label><span>Data origin</span><input type="text" name="data_origin" placeholder="Applicant upload / manual export" maxlength="200" /></label>
        <label><span>Purpose</span><input type="text" name="purpose" placeholder="Determine scholarship eligibility" maxlength="300" /></label>
        <label><span>Authorized roles</span><input type="text" name="authorized_roles" placeholder="Intake staff; assigned reviewers" maxlength="300" /></label>
        <label><span>Systems receiving copies</span><input type="text" name="systems_receiving_copies" placeholder="Backup provider; shared drive" maxlength="300" /></label>
        <label><span>Storage location</span><input type="text" name="storage_location" placeholder="Vendor cloud (confirm region)" maxlength="200" /></label>
        <label><span>Retention trigger</span><input type="text" name="retention_trigger" placeholder="Cycle close" maxlength="200" /></label>
        <label><span>Retention rule (note if legal review needed)</span><input type="text" name="retention_rule" placeholder="Per schedule RS-03 — Requires Counsel Review" maxlength="300" /></label>
        <label><span>Disposal method</span><input type="text" name="disposal_method" placeholder="Vendor purge + shared-drive check" maxlength="300" /></label>
        <label><span>Control evidence reference</span><input type="text" name="control_evidence" placeholder="EV-DATA-001" maxlength="200" /></label>
        <label><span>Last verified date</span><input type="date" name="last_verified" value="${esc(todayISO())}" /></label>
      </div>
      <label style="margin-top:10px"><span>Known gaps / duplicate copies</span><input type="text" name="known_gaps" placeholder="e.g., Reviewer CSV downloads unverified" maxlength="500" /></label>
      <div class="btn-row" style="margin-top:14px">
        <button type="submit" class="btn btn-primary">Add Inventory Row</button>
      </div>
    </form>
  `;
}

export function bindDataInventoryEvents(
  container: HTMLElement,
  store: Store,
  pendingCsv: CsvInventoryPreview | null,
  setPendingCsv: (next: CsvInventoryPreview | null) => void
): void {
  const doc = store.get().doc;
  if (!doc) return;

  container.querySelector('[data-action="dl-inv-tpl"]')?.addEventListener('click', () => {
    const tpl = getTemplateByKey('data_inventory');
    triggerDownload(tpl.filename, tpl.content, 'text/csv;charset=utf-8');
    store.setStatus(`Downloaded ${tpl.filename}.`, 'ok');
  });

  container.querySelector('[data-action="export-inv-csv"]')?.addEventListener('click', () => {
    const csv = exportInventoryToCsv(doc.inventory);
    triggerDownload('ssat-data-inventory.csv', csv, 'text/csv;charset=utf-8');
    store.setStatus('Exported formula-safe Data Inventory CSV.', 'ok');
  });

  const fileInput = container.querySelector<HTMLInputElement>('#inv-csv-file');
  fileInput?.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const errEl = container.querySelector<HTMLElement>('#inv-csv-error');
    try {
      const text = await file.text();
      const preview = previewInventoryCsv(text);
      if (errEl) errEl.hidden = true;
      setPendingCsv(preview);
    } catch (err) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = err instanceof Error ? err.message : 'Unable to parse CSV file.';
      }
      setPendingCsv(null);
    }
  });

  container.querySelector('[data-action="confirm-csv-merge"]')?.addEventListener('click', () => {
    if (!pendingCsv) return;
    store.updateDoc((draft) => {
      for (const item of pendingCsv.items) {
        const exists = draft.inventory.some((x) => x.asset_id === item.asset_id);
        const assetId = exists ? nextId('INV', draft.inventory.map((x) => x.asset_id)) : item.asset_id;
        draft.inventory.push({ ...item, asset_id: assetId });
      }
    }, `Imported ${pendingCsv.items.length} metadata inventory row(s).`);
    setPendingCsv(null);
  });

  container.querySelector('[data-action="cancel-csv"]')?.addEventListener('click', () => {
    setPendingCsv(null);
  });

  container.querySelectorAll<HTMLButtonElement>('[data-del-inv]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.delInv || '';
      store.updateDoc((draft) => {
        draft.inventory = draft.inventory.filter((x) => x.asset_id !== id);
      }, `Removed inventory row ${id}.`);
    });
  });

  const addForm = container.querySelector<HTMLFormElement>('#add-inv-form');
  addForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(addForm);
    const sysName = String(fd.get('system_name') || '').trim();
    if (!sysName) return;
    store.updateDoc((draft) => {
      const asset_id = nextId('INV', draft.inventory.map((x) => x.asset_id));
      draft.inventory.push({
        asset_id,
        process_stage: String(fd.get('process_stage') || 'Intake'),
        system_name: sysName,
        business_owner_role: String(fd.get('business_owner_role') || '').trim(),
        technical_owner_role: String(fd.get('technical_owner_role') || '').trim(),
        data_categories: String(fd.get('data_categories') || '').trim(),
        sensitivity: String(fd.get('sensitivity') || 'Confidential') as Sensitivity,
        data_origin: String(fd.get('data_origin') || '').trim(),
        purpose: String(fd.get('purpose') || '').trim(),
        authorized_roles: String(fd.get('authorized_roles') || '').trim(),
        systems_receiving_copies: String(fd.get('systems_receiving_copies') || '').trim(),
        storage_location: String(fd.get('storage_location') || '').trim(),
        retention_trigger: String(fd.get('retention_trigger') || '').trim(),
        retention_rule: String(fd.get('retention_rule') || '').trim(),
        disposal_method: String(fd.get('disposal_method') || '').trim(),
        control_evidence: String(fd.get('control_evidence') || '').trim(),
        last_verified: String(fd.get('last_verified') || '').trim(),
        known_gaps: String(fd.get('known_gaps') || '').trim()
      });
    }, `Added ${sysName} to Data Inventory.`);
  });
}
