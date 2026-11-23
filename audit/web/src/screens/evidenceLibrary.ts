import type { Store } from '../audit/state';
import type { EvidenceOrigin, EvidenceResult, EvidenceReviewStatus, EvidenceSensitivity, RedactionStatus, ReviewMethod } from '../types';
import { CATALOG, EVIDENCE_TEMPLATES, getTemplateByKey } from '../audit/catalog';
import { isEvidenceStale } from '../audit/scoring';
import { esc, nextId, todayISO, downloadForUser } from '../a11y/helpers';

export function renderEvidenceLibrary(store: Store): string {
  const doc = store.get().doc;
  if (!doc) return '<p>Start or open an audit first.</p>';

  const rowsHtml = doc.evidence
    .map((e) => {
      const stale = isEvidenceStale(e);
      const statusTone =
        stale || e.review_status === 'rejected'
          ? 'danger'
          : e.review_status === 'verified' || e.review_status === 'reviewed'
            ? 'ok'
            : 'warn';
      return `
        <tr>
          <td><strong>${esc(e.evidence_id)}</strong><br><span class="badge badge-${statusTone}">${esc(stale ? 'Stale — Re-verify' : e.review_status)}</span></td>
          <td>
            <strong>${esc(e.title)}</strong><br>
            <small class="muted">${esc(e.artifact_type)} · ${esc(e.evidence_origin)} · ${esc(e.data_sensitivity)}</small><br>
            <small class="mono">${esc(e.storage_reference || 'No storage ref')}</small>
          </td>
          <td>${esc(e.linked_controls.join(', ') || 'None')}</td>
          <td>${esc(e.review_method)}<br><small class="muted">Result: ${esc(e.result)}</small></td>
          <td>${esc(e.artifact_date || '—')}<br><small class="muted">Freshness: ${e.freshness_days}d · Next: ${esc(e.next_review_date || '—')}</small></td>
          <td>
            <div class="btn-col">
              <select class="select-sm" data-ev-status="${esc(e.evidence_id)}" aria-label="Change review status for ${esc(e.evidence_id)}">
                ${(['not_requested', 'requested', 'received', 'reviewed', 'verified', 'rejected', 'stale'] as const)
                  .map((st) => `<option value="${st}" ${e.review_status === st ? 'selected' : ''}>${st}</option>`)
                  .join('')}
              </select>
              <button type="button" class="btn btn-sm btn-outline" data-del-ev="${esc(e.evidence_id)}">Delete</button>
            </div>
          </td>
        </tr>`;
    })
    .join('');

  const templatesHtml = EVIDENCE_TEMPLATES.map(
    (t) => `
      <article class="template-chip">
        <strong>${esc(t.label)}</strong>
        <small>${esc(t.description)}</small>
        <button type="button" class="btn btn-sm btn-outline" data-dl-tpl="${esc(t.key)}">Download CSV</button>
      </article>`
  ).join('');

  return `
    <div class="page-head">
      <div>
        <p class="eyebrow">Evidence Standards &amp; Artifact Register</p>
        <h1>Evidence Library (${doc.evidence.length} records)</h1>
        <p class="muted">Record metadata references only — never upload or paste raw SSNs, essays, donor financial details, or live credentials.</p>
      </div>
    </div>

    <section class="card ladder-card" aria-labelledby="ladder-heading">
      <h2 id="ladder-heading">Evidence Quality Ladder</h2>
      <ol class="ladder-list">
        <li><strong>1. Unverified claim:</strong> “Our vendor encrypts everything.” <em>Insufficient for Score 2.</em></li>
        <li><strong>2. Written assertion:</strong> Policy, vendor webpage, or interview. <em>Helpful starting point, does not prove live settings.</em></li>
        <li><strong>3. Relevant dated artifact:</strong> Current permission export, contract clause, audit log, configuration screen, or restore log.</li>
        <li><strong>4. Observed test with result:</strong> Authorized admin demonstrates enforced MFA, offboarding check, backup restore, or bank callback.</li>
      </ol>
    </section>

    <section class="card" style="margin-top:16px" aria-labelledby="templates-heading">
      <h2 id="templates-heading">Blank Evidence Templates (Offline CSV)</h2>
      <div class="template-grid">${templatesHtml}</div>
    </section>

    <section class="card" style="margin-top:16px" aria-labelledby="ev-register-heading">
      <h2 id="ev-register-heading">Recorded Evidence References</h2>
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th>ID &amp; State</th><th>Artifact &amp; Reference</th><th>Controls</th><th>Method &amp; Result</th><th>Dates &amp; Freshness</th><th>Update</th></tr></thead>
          <tbody>${rowsHtml || '<tr><td colspan="6">No evidence recorded yet. Add your first reference below.</td></tr>'}</tbody>
        </table>
      </div>
    </section>

    <form id="add-evidence-form" class="card form-section" style="margin-top:16px">
      <h2>Add Evidence Reference (All 15 Standard Fields)</h2>
      <p class="callout callout-warn"><strong>Redaction safeguard:</strong> Redact names, account IDs, addresses, taxpayer IDs, and donor details in source artifacts. Store only safe internal references here.</p>
      <div class="form-grid">
        <label><span>Title *</span><input type="text" name="title" required placeholder="e.g., Fall 2026 Admin MFA Coverage Export" maxlength="200" /></label>
        <label><span>Artifact type *</span><input type="text" name="artifact_type" required placeholder="e.g., Admin Access Export" maxlength="120" /></label>
        <label><span>Linked control *</span>
          <select name="linked_control">
            ${CATALOG.controls.map((c) => `<option value="${esc(c.control_id)}">${esc(c.control_id)} — ${esc(c.title)}</option>`).join('')}
          </select>
        </label>
        <label><span>Artifact date</span><input type="date" name="artifact_date" value="${esc(todayISO())}" /></label>
        <label><span>Period covered</span><input type="text" name="period_covered" value="${esc(doc.organization_profile.primary_cycle)}" maxlength="120" /></label>
        <label><span>Produced by (role preferred)</span><input type="text" name="produced_by" placeholder="e.g., IT Lead" maxlength="160" /></label>
        <label><span>Safe storage reference (no public secret URLs)</span><input type="text" name="storage_reference" placeholder="internal/audit-2026/mfa-export.csv" maxlength="400" /></label>
        <label><span>Evidence origin</span>
          <select name="evidence_origin">
            <option value="system_generated">System-generated</option>
            <option value="sampled_test">Sampled / controlled test</option>
            <option value="contract">Contract</option>
            <option value="vendor_statement">Vendor statement</option>
            <option value="screenshot">Redacted screenshot</option>
            <option value="policy">Policy</option>
            <option value="interview">Interview</option>
          </select>
        </label>
        <label><span>Review method</span>
          <select name="review_method">
            <option value="observed_configuration">Observed configuration</option>
            <option value="inspected_document">Inspected document</option>
            <option value="sampled_transactions">Sampled transactions</option>
            <option value="executed_controlled_test">Executed controlled test</option>
            <option value="not_reviewed">Not reviewed yet</option>
          </select>
        </label>
        <label><span>Reviewer role</span><input type="text" name="reviewer_role" value="${esc(doc.organization_profile.auditor_role)}" maxlength="120" /></label>
        <label><span>Review date</span><input type="date" name="review_date" value="${esc(todayISO())}" /></label>
        <label><span>Result</span>
          <select name="result">
            <option value="supports">Supports</option>
            <option value="partially_supports">Partially supports</option>
            <option value="contradicts">Contradicts</option>
            <option value="not_relevant">Not relevant</option>
            <option value="pending">Pending</option>
          </select>
        </label>
        <label><span>Evidence state</span>
          <select name="review_status">
            <option value="reviewed">Reviewed</option>
            <option value="verified">Verified</option>
            <option value="received">Received</option>
            <option value="requested">Requested</option>
            <option value="not_requested">Not requested</option>
            <option value="rejected">Rejected</option>
            <option value="stale">Stale</option>
          </select>
        </label>
        <label><span>Data sensitivity</span>
          <select name="data_sensitivity">
            <option value="Internal">Internal</option>
            <option value="Confidential">Confidential</option>
            <option value="Restricted">Restricted</option>
            <option value="Public">Public</option>
          </select>
        </label>
        <label><span>Freshness review interval (days)</span><input type="number" name="freshness_days" min="1" max="3650" value="180" /></label>
        <label><span>Next review date</span><input type="date" name="next_review_date" /></label>
        <label><span>Redaction status</span>
          <select name="redaction_status">
            <option value="metadata_only">Metadata only (recommended)</option>
            <option value="redacted_excerpt">Redacted excerpt reference</option>
            <option value="approved_reference">Explicitly approved reference</option>
          </select>
        </label>
      </div>
      <div class="form-grid" style="margin-top:10px">
        <label><span>Scope / sampling</span><input type="text" name="scope_sampling" placeholder="e.g., 100% of admin accounts; 5 departed reviewers" maxlength="400" /></label>
        <label><span>Exceptions noted</span><input type="text" name="exceptions" placeholder="e.g., 1 legacy account pending hardware key" maxlength="1000" /></label>
      </div>
      <div class="btn-row" style="margin-top:14px">
        <button type="submit" class="btn btn-primary">Record Evidence Reference</button>
      </div>
    </form>
  `;
}

export function bindEvidenceLibraryEvents(container: HTMLElement, store: Store): void {
  container.querySelectorAll<HTMLButtonElement>('[data-dl-tpl]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tpl = getTemplateByKey(btn.dataset.dlTpl || 'data_inventory');
      downloadForUser(store, tpl.filename, tpl.content, 'text/csv;charset=utf-8');
    });
  });

  container.querySelectorAll<HTMLSelectElement>('[data-ev-status]').forEach((sel) => {
    sel.addEventListener('change', () => {
      const evId = sel.dataset.evStatus || '';
      const nextStatus = sel.value as EvidenceReviewStatus;
      store.updateDoc((draft) => {
        const item = draft.evidence.find((e) => e.evidence_id === evId);
        if (item) {
          item.review_status = nextStatus;
          if ((nextStatus === 'reviewed' || nextStatus === 'verified') && !item.review_date) {
            item.review_date = todayISO();
          }
        }
      }, `Updated ${evId} state to ${nextStatus}.`);
    });
  });

  container.querySelectorAll<HTMLButtonElement>('[data-del-ev]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const evId = btn.dataset.delEv || '';
      store.updateDoc((draft) => {
        draft.evidence = draft.evidence.filter((e) => e.evidence_id !== evId);
        for (const a of Object.values(draft.assessments)) {
          a.evidence_ids = a.evidence_ids.filter((id) => id !== evId);
        }
      }, `Removed evidence reference ${evId}.`);
    });
  });

  const form = container.querySelector<HTMLFormElement>('#add-evidence-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const title = String(fd.get('title') || '').trim();
    const controlId = String(fd.get('linked_control') || 'DATA-01');
    const domainPrefix = controlId.split('-')[0] || 'GEN';
    if (!title) return;

    store.updateDoc((draft) => {
      const evId = nextId(`EV-${domainPrefix}`, draft.evidence.map((x) => x.evidence_id));
      draft.evidence.push({
        evidence_id: evId,
        title,
        artifact_type: String(fd.get('artifact_type') || '').trim(),
        linked_controls: [controlId],
        linked_systems: [],
        artifact_date: String(fd.get('artifact_date') || '').trim(),
        period_covered: String(fd.get('period_covered') || '').trim(),
        produced_by: String(fd.get('produced_by') || '').trim(),
        storage_reference: String(fd.get('storage_reference') || '').trim(),
        evidence_origin: String(fd.get('evidence_origin') || 'system_generated') as EvidenceOrigin,
        review_method: String(fd.get('review_method') || 'observed_configuration') as ReviewMethod,
        reviewer_role: String(fd.get('reviewer_role') || '').trim(),
        review_date: String(fd.get('review_date') || '').trim(),
        scope_sampling: String(fd.get('scope_sampling') || '').trim(),
        result: String(fd.get('result') || 'supports') as EvidenceResult,
        review_status: String(fd.get('review_status') || 'reviewed') as EvidenceReviewStatus,
        exceptions: String(fd.get('exceptions') || '').trim(),
        data_sensitivity: String(fd.get('data_sensitivity') || 'Internal') as EvidenceSensitivity,
        freshness_days: Math.max(1, Math.min(3650, Number(fd.get('freshness_days') || 180))),
        next_review_date: String(fd.get('next_review_date') || '').trim(),
        redaction_status: String(fd.get('redaction_status') || 'metadata_only') as RedactionStatus,
        optional_hash: ''
      });
    }, `Added evidence artifact for ${controlId}.`);
  });
}
