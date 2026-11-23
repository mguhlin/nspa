import type { Store } from '../audit/state';
import { CATALOG } from '../audit/catalog';
import { computeMetrics, effectivePriority, scoreShortBadge } from '../audit/scoring';
import { esc, formatLocalDate } from '../a11y/helpers';

export interface DashboardFilterState {
  domain: string;
  priority: string;
  status: string;
  nist: string;
}

export function renderDashboard(store: Store, filter: DashboardFilterState): string {
  const state = store.get();
  const doc = state.doc;
  if (!doc) return '<p>Start or open an audit to view the dashboard.</p>';

  const m = computeMetrics(doc);
  const readinessDisplay =
    m.readiness_percent === null
      ? 'Not yet scored'
      : `${m.readiness_percent}%`;

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

    <section class="summary-bar card" aria-label="Coverage and provisional readiness summary">
      <div class="summary-metric">
        <span class="kpi-label">Assessment Coverage</span>
        <strong>${m.coverage_percent}% (${m.assessed_controls} / ${m.applicable_controls} applicable)</strong>
        <small>${m.na_controls > 0 ? `${m.na_controls} approved N/A control(s)` : 'All 30 controls applicable'}</small>
      </div>
      <div class="summary-metric">
        <span class="kpi-label">Readiness Score ${m.is_provisional ? '(PROVISIONAL)' : ''}</span>
        <strong>${esc(readinessDisplay)} ${m.is_provisional && m.readiness_percent !== null ? '<span class="badge badge-warn">Provisional</span>' : ''}</strong>
        <small>Planning aid only — high percentages never hide Critical failures above.</small>
      </div>
      <div class="summary-metric">
        <span class="kpi-label">0 / 1 / 2 Distribution</span>
        <strong>2: ${m.score_2} · 1: ${m.score_1} · 0: ${m.score_0}</strong>
        <small>${doc.evidence.length} evidence items · ${doc.simulations.length} simulation logs</small>
      </div>
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
  onFilterChange: (next: DashboardFilterState) => void
): void {
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
