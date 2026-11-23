import type { Store } from '../audit/state';
import { CATALOG } from '../audit/catalog';
import { computeMetrics, effectivePriority, scoreShortBadge } from '../audit/scoring';
import {
  buildRiskMatrix,
  MATRIX_LEVELS_ASC,
  MATRIX_LEVELS_DESC,
  type MatrixLevel
} from '../audit/riskMatrix';
import { exportEvidenceTrackerCsv, exportFindingsCsv } from '../reports/generator';
import { esc, formatLocalDate, downloadForUser } from '../a11y/helpers';

export interface DashboardFilterState {
  domain: string;
  priority: string;
  status: string;
  nist: string;
  matrixCell: string; // e.g. "High:High" or ""
}

export interface DashboardQuickActions {
  onOpenReport: (reportType: 'executive' | 'rubric') => void;
  onSaveSsat: () => void;
}

export function renderDashboard(store: Store, filter: DashboardFilterState): string {
  const state = store.get();
  const doc = state.doc;
  if (!doc) return '<p>Start or open an audit to view the dashboard.</p>';

  const m = computeMetrics(doc);
  const matrix = buildRiskMatrix(doc);
  const readinessDisplay = m.readiness_percent === null ? '—' : `${m.readiness_percent}%`;
  const ringPct = m.readiness_percent === null ? 0 : Math.max(0, Math.min(100, m.readiness_percent));
  const ringDash = `${ringPct} ${100 - ringPct}`;

  // Checklist snapshot grouping key scholarship operations (inspired by hero visual)
  const checklistGroups = [
    { label: 'Applicant & donor data protection', domains: ['DATA'] },
    { label: 'Access & permissions control', domains: ['IAM'] },
    { label: 'Vendors, cloud & technical safeguards', domains: ['VEND', 'TECH'] },
    { label: 'Decision & financial integrity', domains: ['FIN', 'AWARD'] },
    { label: 'AI governance & sustainability', domains: ['AI', 'SUST'] },
    { label: 'Continuity & incident response', domains: ['CONT', 'RESP'] }
  ].map((g) => {
    const sub = m.domains.filter((d) => g.domains.includes(d.domain_id));
    const assessed = sub.reduce((acc, d) => acc + d.assessed_controls, 0);
    const applicable = sub.reduce((acc, d) => acc + d.applicable_controls, 0);
    const crits = sub.reduce((acc, d) => acc + d.critical_gaps, 0);
    const complete = applicable > 0 && assessed === applicable && crits === 0;
    return { ...g, assessed, applicable, crits, complete, firstDomain: g.domains[0] };
  });

  // Build interactive 3x3 Risk Matrix grid
  const matrixRowsHtml = MATRIX_LEVELS_DESC.map((likelihood) => {
    const cellsHtml = MATRIX_LEVELS_ASC.map((impact) => {
      const cell = matrix.getCell(likelihood, impact);
      const key = `${likelihood}:${impact}`;
      const selected = filter.matrixCell === key;
      const bandClass = `rm-band-${cell.band.toLowerCase()}`;
      return `
        <td>
          <button
            type="button"
            class="rm-cell ${bandClass} ${selected ? 'rm-selected' : ''}"
            data-matrix-cell="${key}"
            aria-pressed="${selected}"
          >
            <strong class="rm-count">${cell.items.length}</strong>
            <span class="rm-label">${esc(cell.band)}</span>
            <span class="sr-only"> (${likelihood} likelihood, ${impact} impact)</span>
          </button>
        </td>`;
    }).join('');
    return `<tr><th scope="row" class="rm-axis-y">${esc(likelihood)}</th>${cellsHtml}</tr>`;
  }).join('');

  let selectedMatrixDetailHtml = '';
  if (filter.matrixCell) {
    const [selL, selI] = filter.matrixCell.split(':') as [MatrixLevel, MatrixLevel];
    const cell = matrix.getCell(selL, selI);
    selectedMatrixDetailHtml = `
      <div class="callout callout-info" style="margin-top:12px">
        <div class="section-header-row" style="margin-bottom:6px">
          <strong>Risk Matrix Selection: ${esc(selL)} Likelihood × ${esc(selI)} Impact (${esc(cell.band)} · ${cell.items.length} item${cell.items.length === 1 ? '' : 's'})</strong>
          <button type="button" class="btn btn-sm btn-outline" data-matrix-cell="">Clear Selection</button>
        </div>
        ${
          cell.items.length === 0
            ? '<p class="muted" style="margin:0">No open findings or Score 0/1 controls currently fall in this zone.</p>'
            : `<ul class="compact-list">${cell.items
                .map(
                  (it) =>
                    `<li><strong>${esc(it.id)}</strong> (${esc(it.control_id)}): ${esc(it.title)} — <small class="muted">Owner: ${esc(it.owner)}</small> <button type="button" class="link-btn" data-open-control="${esc(it.control_id)}">Inspect control</button></li>`
                )
                .join('')}</ul>`
        }
      </div>`;
  }

  const domainCards = m.domains
    .map((d) => {
      const readyText = d.readiness_percent === null ? '—' : `${d.readiness_percent}%${d.is_provisional ? ' prov.' : ''}`;
      return `
        <article class="domain-card">
          <div class="domain-card-top">
            <div>
              <span class="badge ${d.default_priority === 'Critical' ? 'badge-danger' : 'badge-info'}">${esc(d.default_priority)}</span>
              <span class="mono">${esc(d.domain_id)}</span>
            </div>
            ${d.critical_gaps > 0 ? `<span class="badge badge-danger">${d.critical_gaps} Critical gap${d.critical_gaps > 1 ? 's' : ''}</span>` : ''}
          </div>
          <h3>${esc(d.name)}</h3>
          <div class="domain-stats">
            <span>Coverage: <strong>${d.assessed_controls}/${d.applicable_controls}</strong> (${d.coverage_percent}%)</span>
            <span>Readiness: <strong>${esc(readyText)}</strong></span>
          </div>
          <div class="meter" role="img" aria-label="${esc(d.name)} coverage ${d.coverage_percent}%">
            <div class="meter-fill" style="width:${d.coverage_percent}%"></div>
          </div>
          <p class="score-breakdown">
            <span>Score 2: <strong>${d.score_2}</strong></span> ·
            <span>Score 1: <strong>${d.score_1}</strong></span> ·
            <span>Score 0: <strong>${d.score_0}</strong></span> ·
            <span>Unassessed: <strong>${d.not_assessed_controls}</strong></span>
          </p>
          <button type="button" class="btn btn-sm btn-outline" data-open-domain="${esc(d.domain_id)}">Assess ${esc(d.domain_id)} Controls →</button>
        </article>
      `;
    })
    .join('');

  const filteredControls = CATALOG.controls.filter((c) => {
    const a = doc.assessments[c.control_id];
    const pri = effectivePriority(c, a);
    if (filter.domain && c.domain_id !== filter.domain) return false;
    if (filter.priority && pri !== filter.priority) return false;
    if (filter.nist && !c.nist_csf_tags.some((t) => t.startsWith(filter.nist))) return false;
    if (filter.status === 'critical_gap') {
      return pri === 'Critical' && a?.status === 'assessed' && (a.score === 0 || a.score === 1);
    }
    if (filter.status === 'unassessed') {
      return !a || a.status === 'not_assessed';
    }
    if (filter.status === 'verified') {
      return a?.status === 'assessed' && a.score === 2;
    }
    if (filter.status === 'needs_work') {
      return !a || a.status === 'not_assessed' || (a.status === 'assessed' && (a.score === 0 || a.score === 1));
    }
    return true;
  });

  const nextActionRows = filteredControls
    .slice(0, 15)
    .map((c) => {
      const a = doc.assessments[c.control_id];
      const pri = effectivePriority(c, a);
      const badge = scoreShortBadge(a?.status, a?.score);
      return `
        <tr>
          <td><strong>${esc(c.control_id)}</strong><br><span class="badge ${pri === 'Critical' ? 'badge-danger' : 'badge-info'}">${esc(pri)}</span></td>
          <td><strong>${esc(c.title)}</strong><br><small class="muted">${esc(c.what_to_do_next)}</small></td>
          <td><span class="badge badge-${badge.tone}">${esc(badge.text)}</span></td>
          <td>${esc(c.suggested_owner)}</td>
          <td><button type="button" class="btn btn-sm btn-primary" data-open-control="${esc(c.control_id)}">Open</button></td>
        </tr>
      `;
    })
    .join('');

  return `
    <div class="page-head">
      <div>
        <p class="eyebrow">
          ${doc.is_demo ? 'FICTIONAL PRACTICE AUDIT · ' : ''}${esc(doc.organization_profile.primary_cycle || 'Current Cycle')} · Catalog v${esc(doc.catalog_version)}
        </p>
        <h1>${esc(doc.organization_profile.display_name || 'Scholarship Security Audit Dashboard')}</h1>
        <p class="muted">Updated ${esc(formatLocalDate(doc.updated_at))} · Self-assessment planning view (not a compliance verdict).</p>
      </div>
      <div class="btn-row">
        <button type="button" class="btn btn-primary" data-nav="audit">Continue Guided Audit</button>
        <button type="button" class="btn btn-secondary" data-nav="reports">Preview Reports</button>
      </div>
    </div>

    <section class="priority-alert-grid" aria-label="Critical risk and coverage indicators displayed above aggregate scores">
      <article class="kpi-alert ${m.critical_gaps > 0 ? 'kpi-danger' : 'kpi-ok'}">
        <span class="kpi-label">Critical Controls Scoring 0 or 1</span>
        <strong class="kpi-value">${m.critical_gaps}</strong>
        <small>${m.critical_gaps > 0 ? esc(m.critical_gap_control_ids.join(', ')) : 'No assessed Critical failures'}</small>
      </article>
      <article class="kpi-alert ${m.not_assessed_controls > 0 ? 'kpi-warn' : 'kpi-ok'}">
        <span class="kpi-label">Controls Not Yet Assessed</span>
        <strong class="kpi-value">${m.not_assessed_controls}</strong>
        <small>Coverage gaps shown explicitly — never treated as passing</small>
      </article>
      <article class="kpi-alert ${m.stale_evidence_count > 0 ? 'kpi-warn' : 'kpi-ok'}">
        <span class="kpi-label">Stale Evidence Artifacts</span>
        <strong class="kpi-value">${m.stale_evidence_count}</strong>
        <small>${m.stale_evidence_count > 0 ? esc(m.stale_evidence_ids.join(', ')) : 'All linked artifacts within freshness window'}</small>
      </article>
      <article class="kpi-alert ${m.open_high_critical_findings > 0 ? 'kpi-danger' : 'kpi-ok'}">
        <span class="kpi-label">Open High / Critical Findings</span>
        <strong class="kpi-value">${m.open_high_critical_findings}</strong>
        <small>${m.total_open_findings} total open remediation finding(s)</small>
      </article>
    </section>

    <section class="visual-ops-grid summary-bar-wrap" aria-label="Audit checklist, readiness ring, interactive Risk Matrix, and quick exports">
      <article class="card ops-panel">
        <div class="ops-head">
          <h2>Audit Checklist</h2>
          <span class="badge badge-info">${m.assessed_controls} / ${m.applicable_controls} assessed</span>
        </div>
        <ul class="checklist-summary">
          ${checklistGroups
            .map(
              (g) => `
              <li>
                <button type="button" class="checklist-row-btn" data-open-domain="${esc(g.firstDomain)}">
                  <span class="chk-mark ${g.complete ? 'chk-done' : g.crits > 0 ? 'chk-risk' : 'chk-open'}" aria-hidden="true">${g.complete ? '✓' : g.crits > 0 ? '!' : '○'}</span>
                  <span class="chk-text">
                    <strong>${esc(g.label)}</strong>
                    <small>${g.assessed}/${g.applicable} assessed${g.crits > 0 ? ` · ${g.crits} Critical gap(s)` : ''}</small>
                  </span>
                </button>
              </li>`
            )
            .join('')}
        </ul>
      </article>

      <article class="card ops-panel summary-bar">
        <div class="ops-head">
          <h2>Readiness &amp; Risk Matrix</h2>
          ${m.is_provisional ? '<span class="badge badge-warn">Provisional</span>' : '<span class="badge badge-ok">Full coverage</span>'}
        </div>

        <div class="ring-row">
          <svg class="score-ring" viewBox="0 0 42 42" width="84" height="84" role="img" aria-label="Readiness ${esc(readinessDisplay)}, Coverage ${m.coverage_percent}%">
            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#e4f4f4" stroke-width="5"></circle>
            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="${m.critical_gaps > 0 ? '#c27b00' : '#007681'}" stroke-width="5" stroke-dasharray="${ringDash}" stroke-dashoffset="25"></circle>
            <text x="21" y="23.5" text-anchor="middle" font-size="9" font-weight="700" fill="#1b3446">${esc(readinessDisplay)}</text>
          </svg>
          <div class="ring-meta">
            <div><strong>Coverage:</strong> ${m.coverage_percent}% (${m.assessed_controls}/${m.applicable_controls})</div>
            <div><strong>Scores:</strong> 2: ${m.score_2} · 1: ${m.score_1} · 0: ${m.score_0}${m.na_controls ? ` · N/A: ${m.na_controls}` : ''}</div>
            <small class="muted">Planning visual only — Critical gaps above take priority.</small>
          </div>
        </div>

        <div class="rm-container">
          <div class="rm-caption">
            <strong>Risk Matrix (Likelihood × Impact)</strong>
            <small class="muted">${matrix.totalItems} open item(s) plotted — select any cell to inspect</small>
          </div>
          <div class="table-scroll">
            <table class="rm-table" aria-label="Likelihood by Impact 3 by 3 Risk Matrix">
              <thead>
                <tr>
                  <th scope="col" class="rm-corner">Likelihood ↓ / Impact →</th>
                  <th scope="col">Low</th>
                  <th scope="col">Medium</th>
                  <th scope="col">High</th>
                </tr>
              </thead>
              <tbody>
                ${matrixRowsHtml}
              </tbody>
            </table>
          </div>
        </div>
        ${selectedMatrixDetailHtml}
      </article>

      <article class="card ops-panel">
        <div class="ops-head">
          <h2>Report &amp; Export</h2>
          <span class="badge badge-neutral">Local only</span>
        </div>
        <p class="muted" style="font-size:0.86rem">Executive exports default to Redacted mode. Review before sharing.</p>
        <div class="export-stack">
          <button type="button" class="btn btn-primary" data-quick-report="executive">Generate Executive Brief (Print / PDF)</button>
          <button type="button" class="btn btn-secondary" data-quick-report="rubric">Open Landscape Audit Rubric</button>
          <button type="button" class="btn btn-outline" data-quick-export="findings-csv">Export Findings CSV (Safe)</button>
          <button type="button" class="btn btn-outline" data-quick-export="evidence-csv">Export Evidence Tracker CSV</button>
          <button type="button" class="btn btn-accent" data-quick-export="save-ssat">Save Encrypted .ssat Backup</button>
        </div>
        <p class="muted" style="margin-top:10px;font-size:0.82rem">
          ${doc.evidence.length} evidence references · ${doc.simulations.length} simulation logs · ${doc.snapshots.length} snapshot(s)
        </p>
      </article>
    </section>

    <section class="section-block" aria-labelledby="domains-heading">
      <h2 id="domains-heading">Ten Evaluation Domains</h2>
      <div class="domain-grid">${domainCards}</div>
    </section>

    <section class="section-block card" aria-labelledby="next-actions-heading">
      <div class="section-header-row">
        <div>
          <h2 id="next-actions-heading">Prioritized Next Controls (${filteredControls.length} matching)</h2>
          <p class="muted">Filter by domain, priority, assessment status, or NIST CSF 2.0 function.</p>
        </div>
        <div class="filter-bar">
          <label><span>Domain</span>
            <select id="dash-f-domain">
              <option value="">All 10 domains</option>
              ${CATALOG.domains.map((d) => `<option value="${esc(d.domain_id)}" ${filter.domain === d.domain_id ? 'selected' : ''}>${esc(d.domain_id)} — ${esc(d.name)}</option>`).join('')}
            </select>
          </label>
          <label><span>Priority</span>
            <select id="dash-f-priority">
              <option value="">All priorities</option>
              <option value="Critical" ${filter.priority === 'Critical' ? 'selected' : ''}>Critical</option>
              <option value="High" ${filter.priority === 'High' ? 'selected' : ''}>High</option>
            </select>
          </label>
          <label><span>Status</span>
            <select id="dash-f-status">
              <option value="needs_work" ${filter.status === 'needs_work' ? 'selected' : ''}>Needs work (0, 1, Unassessed)</option>
              <option value="" ${filter.status === '' ? 'selected' : ''}>All controls</option>
              <option value="critical_gap" ${filter.status === 'critical_gap' ? 'selected' : ''}>Critical gaps (0 or 1)</option>
              <option value="unassessed" ${filter.status === 'unassessed' ? 'selected' : ''}>Unassessed only</option>
              <option value="verified" ${filter.status === 'verified' ? 'selected' : ''}>Score 2 Verified only</option>
            </select>
          </label>
          <label><span>NIST CSF</span>
            <select id="dash-f-nist">
              <option value="">All functions</option>
              ${['GV', 'ID', 'PR', 'DE', 'RS', 'RC'].map((fn) => `<option value="${fn}" ${filter.nist === fn ? 'selected' : ''}>${fn}</option>`).join('')}
            </select>
          </label>
        </div>
      </div>
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th>Control</th><th>Title &amp; Suggested Next Step</th><th>Status</th><th>Suggested Owner</th><th>Action</th></tr></thead>
          <tbody>${nextActionRows || '<tr><td colspan="5">No controls match the selected filters.</td></tr>'}</tbody>
        </table>
      </div>
    </section>
  `;
}

export function bindDashboardEvents(
  container: HTMLElement,
  store: Store,
  filter: DashboardFilterState,
  onFilterChange: (next: DashboardFilterState) => void,
  quickActions: DashboardQuickActions
): void {
  const doc = store.get().doc;
  container.querySelectorAll<HTMLButtonElement>('[data-nav]').forEach((b) => {
    b.addEventListener('click', () => store.navigate(b.dataset.nav as 'audit' | 'reports'));
  });
  container.querySelectorAll<HTMLButtonElement>('[data-open-domain]').forEach((b) => {
    b.addEventListener('click', () => {
      const domId = b.dataset.openDomain || 'DATA';
      const first = CATALOG.controls.find((c) => c.domain_id === domId);
      store.navigate('audit', { domainId: domId, controlId: first?.control_id || 'DATA-01' });
    });
  });
  container.querySelectorAll<HTMLButtonElement>('[data-open-control]').forEach((b) => {
    b.addEventListener('click', () => {
      const cid = b.dataset.openControl || 'DATA-01';
      const ctrl = CATALOG.controls.find((c) => c.control_id === cid);
      store.navigate('audit', { controlId: cid, domainId: ctrl?.domain_id || 'DATA' });
    });
  });
  container.querySelectorAll<HTMLButtonElement>('[data-matrix-cell]').forEach((b) => {
    b.addEventListener('click', () => {
      const cellKey = b.dataset.matrixCell || '';
      onFilterChange({ ...filter, matrixCell: filter.matrixCell === cellKey ? '' : cellKey });
    });
  });
  container.querySelectorAll<HTMLButtonElement>('[data-quick-report]').forEach((b) => {
    b.addEventListener('click', () => {
      quickActions.onOpenReport(b.dataset.quickReport as 'executive' | 'rubric');
    });
  });
  container.querySelectorAll<HTMLButtonElement>('[data-quick-export]').forEach((b) => {
    b.addEventListener('click', () => {
      if (!doc) return;
      const act = b.dataset.quickExport;
      if (act === 'findings-csv') {
        downloadForUser(store, 'ssat-findings-redacted.csv', exportFindingsCsv(doc, 'redacted'), 'text/csv;charset=utf-8');
      } else if (act === 'evidence-csv') {
        downloadForUser(store, 'ssat-evidence-tracker-redacted.csv', exportEvidenceTrackerCsv(doc, 'redacted'), 'text/csv;charset=utf-8');
      } else if (act === 'save-ssat') {
        quickActions.onSaveSsat();
      }
    });
  });

  const bindSelect = (id: string, key: keyof DashboardFilterState) => {
    const el = container.querySelector<HTMLSelectElement>(id);
    el?.addEventListener('change', () => {
      onFilterChange({ ...filter, [key]: el.value });
    });
  };
  bindSelect('#dash-f-domain', 'domain');
  bindSelect('#dash-f-priority', 'priority');
  bindSelect('#dash-f-status', 'status');
  bindSelect('#dash-f-nist', 'nist');
}
