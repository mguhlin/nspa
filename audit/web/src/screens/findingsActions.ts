import type { Store } from '../audit/state';
import type { CostEffortBand, FindingSeverity, FindingStatus, PlanHorizon } from '../types';
import { CATALOG } from '../audit/catalog';
import { effectivePriority } from '../audit/scoring';
import { esc, nextId } from '../a11y/helpers';

export interface FindingsFilter {
  severity: string;
  status: string;
  horizon: string;
}

const FINDING_STATUSES: readonly FindingStatus[] = [
  'Open',
  'Planned',
  'In Progress',
  'Implemented / Pending Verification',
  'Verified Closed',
  'Accepted by Authorized Owner'
];

export function renderFindingsActions(store: Store, filter: FindingsFilter): string {
  const doc = store.get().doc;
  if (!doc) return '<p>Start or open an audit first.</p>';

  const filtered = doc.findings.filter((f) => {
    if (filter.severity && f.severity !== filter.severity) return false;
    if (filter.status && f.status !== filter.status) return false;
    if (filter.horizon && f.horizon !== filter.horizon) return false;
    return true;
  });

  const horizons: readonly PlanHorizon[] = ['Immediate', '30-Day', '60-Day', '90-Day'];
  const horizonHtml = horizons
    .map((h) => {
      const items = doc.findings.filter(
        (f) => f.horizon === h && f.status !== 'Verified Closed' && f.status !== 'Accepted by Authorized Owner'
      );
      return `
        <article class="card horizon-card">
          <div class="horizon-head">
            <h3>${esc(h)} Window</h3>
            <span class="badge ${h === 'Immediate' ? 'badge-danger' : 'badge-info'}">${items.length}</span>
          </div>
          ${
            items.length === 0
              ? '<p class="muted">No open items in this window.</p>'
              : `<ul class="compact-list">${items
                  .map(
                    (f) =>
                      `<li><strong>${esc(f.finding_id)}</strong> (${esc(f.control_id)}): ${esc(f.title)} <small class="muted">— ${esc(f.owner_role || 'Unassigned')}</small></li>`
                  )
                  .join('')}</ul>`
          }
        </article>`;
    })
    .join('');

  const rowsHtml = filtered
    .map((f) => {
      const tone =
        f.severity === 'Immediate / Critical'
          ? 'danger'
          : f.severity === 'High'
            ? 'warn'
            : 'info';
      return `
        <tr>
          <td>
            <strong>${esc(f.finding_id)}</strong><br>
            <span class="badge badge-${tone}">${esc(f.severity)}</span><br>
            <small class="mono">${esc(f.control_id)} · ${esc(f.horizon)}</small>
          </td>
          <td>
            <strong>${esc(f.title)}</strong><br>
            <small>${esc(f.proposed_action)}</small><br>
            <small class="muted"><strong>Verify:</strong> ${esc(f.verification_steps || 'Define verification test')}</small>
          </td>
          <td>${esc(f.owner_role || 'Unassigned')}<br><small class="muted">Due: ${esc(f.target_date || 'TBD')} · Effort: ${esc(f.cost_effort_band)}</small></td>
          <td>
            <select class="select-sm" data-f-status="${esc(f.finding_id)}" aria-label="Status for ${esc(f.finding_id)}">
              ${FINDING_STATUSES.map((st) => `<option value="${esc(st)}" ${f.status === st ? 'selected' : ''}>${esc(st)}</option>`).join('')}
            </select>
            ${
              f.status === 'Implemented / Pending Verification'
                ? '<small class="text-warn" style="display:block;margin-top:4px">Pending verification — not closed until tested.</small>'
                : ''
            }
          </td>
          <td><button type="button" class="btn btn-sm btn-outline" data-del-finding="${esc(f.finding_id)}">Delete</button></td>
        </tr>`;
    })
    .join('');

  return `
    <div class="page-head">
      <div>
        <p class="eyebrow">Step 5 &amp; 6 · Risk Register &amp; 30 / 60 / 90-Day Roadmap</p>
        <h1>Findings &amp; Remediation Actions (${doc.findings.length})</h1>
        <p class="muted">A low control score indicates a gap to remediate, not automatically an active breach. Escalate suspected active exposures to your incident/legal lead.</p>
      </div>
      <div class="btn-row">
        <button type="button" class="btn btn-primary" data-action="generate-plan">Generate Actions from Unresolved Controls</button>
      </div>
    </div>

    <section class="horizon-grid" aria-label="Immediate and 30/60/90 day remediation windows">
      ${horizonHtml}
    </section>

    <section class="card" style="margin-top:16px" aria-labelledby="findings-table-heading">
      <div class="section-header-row">
        <h2 id="findings-table-heading">Risk Register (${filtered.length} shown)</h2>
        <div class="filter-bar">
          <label><span>Severity</span>
            <select id="f-sev">
              <option value="">All severities</option>
              ${['Immediate / Critical', 'High', 'Medium', 'Low / Improvement']
                .map((s) => `<option value="${esc(s)}" ${filter.severity === s ? 'selected' : ''}>${esc(s)}</option>`)
                .join('')}
            </select>
          </label>
          <label><span>Window</span>
            <select id="f-horizon">
              <option value="">All windows</option>
              ${horizons.map((h) => `<option value="${h}" ${filter.horizon === h ? 'selected' : ''}>${h}</option>`).join('')}
            </select>
          </label>
          <label><span>Status</span>
            <select id="f-status">
              <option value="">All statuses</option>
              ${FINDING_STATUSES.map((st) => `<option value="${esc(st)}" ${filter.status === st ? 'selected' : ''}>${esc(st)}</option>`).join('')}
            </select>
          </label>
        </div>
      </div>
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th>ID &amp; Triage</th><th>Finding, Action &amp; Verification</th><th>Owner &amp; Target</th><th>Workflow Status</th><th>Remove</th></tr></thead>
          <tbody>${rowsHtml || '<tr><td colspan="5">No findings match the filter. Add a finding below or generate actions from unresolved controls.</td></tr>'}</tbody>
        </table>
      </div>
    </section>

    <form id="add-finding-form" class="card form-section" style="margin-top:16px">
      <h2>Add Risk Finding &amp; Remediation Action</h2>
      <div class="form-grid">
        <label><span>Control ID *</span>
          <select name="control_id">
            ${CATALOG.controls.map((c) => `<option value="${esc(c.control_id)}">${esc(c.control_id)} — ${esc(c.title)}</option>`).join('')}
          </select>
        </label>
        <label><span>Affected process / system *</span><input type="text" name="affected_process_system" required placeholder="e.g., Review / Shared Drive" maxlength="200" /></label>
        <label><span>Finding title *</span><input type="text" name="title" required placeholder="Clear plain-language risk statement" maxlength="240" /></label>
        <label><span>Triage severity *</span>
          <select name="severity">
            <option value="Immediate / Critical">Immediate / Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low / Improvement">Low / Improvement</option>
          </select>
        </label>
        <label><span>Planning window *</span>
          <select name="horizon">
            <option value="Immediate">Immediate</option>
            <option value="30-Day" selected>30-Day</option>
            <option value="60-Day">60-Day</option>
            <option value="90-Day">90-Day</option>
          </select>
        </label>
        <label><span>Accountable owner role *</span><input type="text" name="owner_role" required placeholder="e.g., Program Director" maxlength="120" /></label>
        <label><span>Target date</span><input type="date" name="target_date" /></label>
        <label><span>Cost / effort band</span>
          <select name="cost_effort_band">
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
            <option value="Unknown">Unknown</option>
          </select>
        </label>
      </div>
      <div class="form-grid" style="margin-top:10px">
        <label><span>Proposed corrective action *</span><textarea name="proposed_action" rows="2" required maxlength="1500"></textarea></label>
        <label><span>Measurable verification step (how closure will be proven) *</span><textarea name="verification_steps" rows="2" required maxlength="1000"></textarea></label>
        <label><span>Impact on applicants / donors / operations</span><textarea name="impact" rows="2" maxlength="1000"></textarea></label>
        <label><span>Severity override rationale / existing mitigations</span><textarea name="severity_override_rationale" rows="2" maxlength="500"></textarea></label>
      </div>
      <div class="btn-row" style="margin-top:14px">
        <button type="submit" class="btn btn-primary">Add Finding to Register</button>
      </div>
    </form>
  `;
}

export function bindFindingsActionsEvents(
  container: HTMLElement,
  store: Store,
  filter: FindingsFilter,
  onFilterChange: (next: FindingsFilter) => void
): void {
  const bindSel = (id: string, key: keyof FindingsFilter) => {
    const el = container.querySelector<HTMLSelectElement>(id);
    el?.addEventListener('change', () => onFilterChange({ ...filter, [key]: el.value }));
  };
  bindSel('#f-sev', 'severity');
  bindSel('#f-horizon', 'horizon');
  bindSel('#f-status', 'status');

  container.querySelector('[data-action="generate-plan"]')?.addEventListener('click', () => {
    let added = 0;
    store.updateDoc((draft) => {
      const existingControls = new Set(
        draft.findings
          .filter((f) => f.status !== 'Verified Closed' && f.status !== 'Accepted by Authorized Owner')
          .map((f) => f.control_id)
      );
      for (const ctrl of CATALOG.controls) {
        const a = draft.assessments[ctrl.control_id];
        if (!a || a.status !== 'assessed' || (a.score !== 0 && a.score !== 1)) continue;
        if (existingControls.has(ctrl.control_id)) continue;
        const pri = effectivePriority(ctrl, a);
        const sev: FindingSeverity =
          pri === 'Critical' && a.score === 0
            ? 'Immediate / Critical'
            : pri === 'Critical'
              ? 'High'
              : a.score === 0
                ? 'High'
                : 'Medium';
        const horizon: PlanHorizon =
          sev === 'Immediate / Critical' ? 'Immediate' : sev === 'High' ? '30-Day' : '60-Day';
        const fid = nextId('F', draft.findings.map((x) => x.finding_id));
        draft.findings.push({
          finding_id: fid,
          control_id: ctrl.control_id,
          affected_process_system: ctrl.domain_id,
          title: `${ctrl.control_id} (Score ${a.score}): ${ctrl.title}`,
          description: a.assessment_notes || ctrl.plain_language_question,
          evidence_observation: a.evidence_ids.length
            ? `Linked evidence: ${a.evidence_ids.join(', ')}`
            : 'No verified evidence linked.',
          evidence_ids: [...a.evidence_ids],
          impact: ctrl.why_it_matters,
          likelihood_rationale: `Assessed at Score ${a.score} (${pri} control).`,
          severity: sev,
          severity_override_rationale: '',
          existing_mitigations: '',
          proposed_action: ctrl.what_to_do_next,
          owner_role: ctrl.suggested_owner,
          target_date: '',
          horizon,
          dependencies: '',
          cost_effort_band: 'Low',
          verification_steps: ctrl.verification_steps,
          residual_risk: 'Open pending verification',
          approval_signoff: '',
          status: 'Open',
          acceptance_rationale: '',
          acceptance_review_date: ''
        });
        added += 1;
      }
    }, added > 0 ? `Generated ${added} prioritized remediation finding(s) from unresolved controls.` : 'All assessed Score 0/1 controls already have open findings.');
  });

  container.querySelectorAll<HTMLSelectElement>('[data-f-status]').forEach((sel) => {
    sel.addEventListener('change', () => {
      const fid = sel.dataset.fStatus || '';
      const nextStatus = sel.value as FindingStatus;
      store.updateDoc((draft) => {
        const f = draft.findings.find((x) => x.finding_id === fid);
        if (f) f.status = nextStatus;
      }, `Updated ${fid} status to "${nextStatus}".`);
    });
  });

  container.querySelectorAll<HTMLButtonElement>('[data-del-finding]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const fid = btn.dataset.delFinding || '';
      store.updateDoc((draft) => {
        draft.findings = draft.findings.filter((x) => x.finding_id !== fid);
      }, `Removed finding ${fid}.`);
    });
  });

  const form = container.querySelector<HTMLFormElement>('#add-finding-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const title = String(fd.get('title') || '').trim();
    if (!title) return;
    store.updateDoc((draft) => {
      const fid = nextId('F', draft.findings.map((x) => x.finding_id));
      draft.findings.push({
        finding_id: fid,
        control_id: String(fd.get('control_id') || 'DATA-01'),
        affected_process_system: String(fd.get('affected_process_system') || '').trim(),
        title,
        description: String(fd.get('impact') || '').trim(),
        evidence_observation: '',
        evidence_ids: [],
        impact: String(fd.get('impact') || '').trim(),
        likelihood_rationale: '',
        severity: String(fd.get('severity') || 'High') as FindingSeverity,
        severity_override_rationale: String(fd.get('severity_override_rationale') || '').trim(),
        existing_mitigations: '',
        proposed_action: String(fd.get('proposed_action') || '').trim(),
        owner_role: String(fd.get('owner_role') || '').trim(),
        target_date: String(fd.get('target_date') || '').trim(),
        horizon: String(fd.get('horizon') || '30-Day') as PlanHorizon,
        dependencies: '',
        cost_effort_band: String(fd.get('cost_effort_band') || 'Low') as CostEffortBand,
        verification_steps: String(fd.get('verification_steps') || '').trim(),
        residual_risk: 'Open',
        approval_signoff: '',
        status: 'Open',
        acceptance_rationale: '',
        acceptance_review_date: ''
      });
    }, `Added finding "${title}" to risk register.`);
  });
}
