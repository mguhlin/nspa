import type { Store } from '../audit/state';
import { computeMetrics, isEvidenceStale } from '../audit/scoring';
import { esc, formatLocalDate } from '../a11y/helpers';

export function renderHistoryView(store: Store): string {
  const doc = store.get().doc;
  if (!doc) return '<p>Start or open an audit first.</p>';

  const m = computeMetrics(doc);
  const staleList = doc.evidence.filter((e) => isEvidenceStale(e));

  const snapsHtml = doc.snapshots
    .map(
      (s) => `
      <tr>
        <td><strong>${esc(s.label)}</strong><br><small class="mono">${esc(s.snapshot_id)} · ${esc(formatLocalDate(s.captured_at))}</small></td>
        <td>${esc(s.cycle_name)}<br><small class="muted">Catalog v${esc(s.catalog_version)}</small></td>
        <td>${s.summary.assessed_controls}/${s.summary.applicable_controls} (${s.summary.coverage_percent}%)</td>
        <td>${s.summary.readiness_percent === null ? '—' : s.summary.readiness_percent + '%'}</td>
        <td>Critical gaps: ${s.summary.critical_gaps} · Findings: ${s.summary.open_high_critical_findings} · Stale: ${s.summary.stale_evidence_count}</td>
        <td>${esc(s.change_note || '—')}</td>
      </tr>`
    )
    .join('');

  return `
    <div class="page-head">
      <div>
        <p class="eyebrow">Step 8 &amp; 9 · Repeat Assessments &amp; Provenance</p>
        <h1>History, Snapshots &amp; Next Cycle</h1>
        <p class="muted">Freeze immutable cycle snapshots, monitor evidence expiration warnings, and roll over cleanly into your next scholarship cycle.</p>
      </div>
      <div class="btn-row">
        <button type="button" class="btn btn-outline" data-go-compare="1">Open Cycle Comparison Report</button>
      </div>
    </div>

    <div class="two-col-grid">
      <form id="snapshot-form" class="card form-section">
        <h2>Capture Immutable Snapshot</h2>
        <p class="muted">Preserves current control scores (${m.assessed_controls}/${m.applicable_controls} assessed), coverage, findings count, and evidence references for later comparison.</p>
        <label><span>Snapshot label *</span><input type="text" name="label" required placeholder="e.g., Pre-Opening Audit Checkpoint" maxlength="140" /></label>
        <label style="margin-top:10px"><span>Change note</span><textarea name="change_note" rows="2" placeholder="What changed since the previous review?" maxlength="500"></textarea></label>
        <div class="btn-row" style="margin-top:12px">
          <button type="submit" class="btn btn-primary">Capture Snapshot</button>
        </div>
      </form>

      <form id="next-cycle-form" class="card form-section">
        <h2>Start Next Scholarship Cycle</h2>
        <p class="muted">Freezes a snapshot of the current cycle, updates the active cycle label, retains all evidence dates, flags expired/stale artifacts, and marks stale Score 2 controls for fresh re-verification.</p>
        <label><span>Next scholarship cycle name *</span><input type="text" name="next_cycle" required placeholder="e.g., Spring 2027 Cycle" maxlength="120" /></label>
        <div class="btn-row" style="margin-top:12px">
          <button type="submit" class="btn btn-secondary">Snapshot &amp; Start Next Cycle</button>
        </div>
      </form>
    </div>

    <section class="card ${staleList.length ? 'callout-warn' : ''}" style="margin-top:16px" aria-labelledby="stale-heading">
      <h2 id="stale-heading">Evidence Freshness Warnings (${staleList.length})</h2>
      ${
        staleList.length === 0
          ? '<p>All tracked evidence artifacts are currently within their configured review freshness windows.</p>'
          : `<ul class="compact-list">${staleList
              .map(
                (e) =>
                  `<li><strong>${esc(e.evidence_id)}</strong> — ${esc(e.title)} (Artifact date: ${esc(e.artifact_date || 'unknown')}; Next review: ${esc(e.next_review_date || 'overdue')}; Controls: ${esc(e.linked_controls.join(', '))})</li>`
              )
              .join('')}</ul>`
      }
    </section>

    <section class="card" style="margin-top:16px" aria-labelledby="snap-table-heading">
      <h2 id="snap-table-heading">Saved Cycle Snapshots (${doc.snapshots.length})</h2>
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th>Snapshot</th><th>Cycle &amp; Catalog</th><th>Coverage</th><th>Readiness</th><th>Risk Summary</th><th>Change Note</th></tr></thead>
          <tbody>${snapsHtml || '<tr><td colspan="6">No snapshots recorded yet. Capture a baseline snapshot above.</td></tr>'}</tbody>
        </table>
      </div>
    </section>
  `;
}

export function bindHistoryEvents(container: HTMLElement, store: Store, onOpenComparisonReport: () => void): void {
  container.querySelector('[data-go-compare]')?.addEventListener('click', () => {
    onOpenComparisonReport();
  });

  const snapForm = container.querySelector<HTMLFormElement>('#snapshot-form');
  snapForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(snapForm);
    store.createSnapshot(String(fd.get('label') || ''), String(fd.get('change_note') || ''));
  });

  const cycleForm = container.querySelector<HTMLFormElement>('#next-cycle-form');
  cycleForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(cycleForm);
    const nextName = String(fd.get('next_cycle') || '').trim();
    if (!nextName) return;
    store.startNextCycle(nextName);
  });
}
