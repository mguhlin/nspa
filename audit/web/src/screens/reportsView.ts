import { desktopBridge } from '../storage/desktop';
import type { Store } from '../audit/state';
import {
  buildRedactedJsonExport,
  exportEvidenceTrackerCsv,
  exportFindingsCsv,
  generateReport,
  wrapStandaloneHtmlReport,
  type PrivacyMode,
  type ReportType
} from '../reports/generator';
import { esc, triggerDownload } from '../a11y/helpers';

export interface ReportsUiState {
  reportType: ReportType;
  privacyMode: PrivacyMode;
}

const REPORT_TABS: ReadonlyArray<{ type: ReportType; label: string; audience: string }> = [
  { type: 'executive', label: 'Executive Risk Brief', audience: 'Director / Board (1–2 pages)' },
  { type: 'rubric', label: 'Landscape Audit Rubric', audience: 'Printable 10-Domain Scorecard' },
  { type: 'remediation', label: 'Remediation Roadmap', audience: 'Managers & Owners' },
  { type: 'evidence_tracker', label: 'Evidence Request Tracker', audience: 'Coordinator & Vendors' },
  { type: 'technical', label: 'Detailed Technical Audit', audience: 'IT / Security Lead' },
  { type: 'continuity', label: 'Continuity Plan Summary', audience: 'Operations & No-Fail Windows' },
  { type: 'comparison', label: 'Cycle Comparison', audience: 'Year-over-Year Deltas' }
];

export function renderReportsView(store: Store, ui: ReportsUiState): string {
  const doc = store.get().doc;
  if (!doc) return '<p>Start or open an audit to generate reports.</p>';

  const report = generateReport(doc, ui.reportType, ui.privacyMode);

  const tabsHtml = REPORT_TABS.map(
    (t) => `
      <button type="button" class="report-tab ${ui.reportType === t.type ? 'active' : ''}" data-report-type="${t.type}" aria-pressed="${ui.reportType === t.type}">
        <strong>${esc(t.label)}</strong>
        <small>${esc(t.audience)}</small>
      </button>`
  ).join('');

  return `
    <div class="page-head no-print">
      <div>
        <p class="eyebrow">Step 7 · Redacted &amp; Printable Outputs</p>
        <h1>Reports &amp; Exports</h1>
        <p class="muted">Executive summaries default to Redacted mode (omitting local storage paths, URLs, and personal names). Print or save as PDF directly from your browser.</p>
      </div>
    </div>

    <div class="callout callout-warn no-print" role="note">
      <strong>Pre-export confidentiality warning:</strong> This report may contain confidential assessment details. Review the preview below and redact sensitive references before sharing outside authorized leadership. Remember: JSON report exports are <strong>not</strong> encrypted <code>.ssat</code> backups.
    </div>

    <section class="report-controls card no-print" style="margin-top:14px">
      <div class="report-tab-grid" role="group" aria-label="Choose report template">${tabsHtml}</div>

      <div class="report-toolbar">
        <fieldset class="privacy-switch">
          <legend>Privacy &amp; Redaction Level</legend>
          <label class="radio-inline">
            <input type="radio" name="privacy_mode" value="redacted" ${ui.privacyMode === 'redacted' ? 'checked' : ''} />
            <span><strong>Executive / Redacted (Default)</strong> — strips storage paths, URLs, and emails</span>
          </label>
          <label class="radio-inline">
            <input type="radio" name="privacy_mode" value="restricted" ${ui.privacyMode === 'restricted' ? 'checked' : ''} />
            <span><strong>Restricted / Internal</strong> — includes full internal references for authorized IT/audit review</span>
          </label>
        </fieldset>

        <div class="btn-row">
          <button type="button" class="btn btn-primary" data-export="print">${desktopBridge() ? 'Save printable report (HTML)' : 'Print / Save as PDF'}</button>
          <button type="button" class="btn btn-secondary" data-export="html">Download Self-Contained HTML</button>
          <button type="button" class="btn btn-outline" data-export="md">Download Markdown (.md)</button>
          <button type="button" class="btn btn-outline" data-export="csv-findings">Findings CSV (Safe)</button>
          <button type="button" class="btn btn-outline" data-export="csv-evidence">Evidence Tracker CSV</button>
          <button type="button" class="btn btn-outline" data-export="json">Redacted Report JSON</button>
        </div>
      </div>
    </section>

    <section class="report-preview card ${report.isLandscape ? 'report-landscape' : ''}" id="report-preview-root" aria-label="Report preview">
      ${report.htmlBody}
    </section>
  `;
}

export function bindReportsEvents(
  container: HTMLElement,
  store: Store,
  ui: ReportsUiState,
  onChange: (next: ReportsUiState) => void
): void {
  const doc = store.get().doc;
  if (!doc) return;

  container.querySelectorAll<HTMLButtonElement>('[data-report-type]').forEach((btn) => {
    btn.addEventListener('click', () => {
      onChange({ ...ui, reportType: btn.dataset.reportType as ReportType });
    });
  });

  container.querySelectorAll<HTMLInputElement>('input[name="privacy_mode"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      onChange({ ...ui, privacyMode: radio.value as PrivacyMode });
    });
  });

  const report = generateReport(doc, ui.reportType, ui.privacyMode);
  const org = doc.organization_profile.display_name || 'ssat-audit';
  const slug = `ssat-${ui.reportType}-${ui.privacyMode}`;

  container.querySelector('[data-export="print"]')?.addEventListener('click', async () => {
    if (desktopBridge()) {
      try { await triggerDownload(`${slug}.html`, wrapStandaloneHtmlReport(report, org), 'text/html;charset=utf-8'); store.setStatus('Printable HTML saved. Open it in a browser or document viewer to print or save a PDF.', 'ok'); }
      catch (err) { store.setStatus(String(err), 'warn'); }
      return;
    }
    document.body.classList.toggle('print-landscape', report.isLandscape);
    window.print();
  });

  container.querySelector('[data-export="html"]')?.addEventListener('click', async () => {
    try {
    const html = wrapStandaloneHtmlReport(report, org);
    await triggerDownload(`${slug}.html`, html, 'text/html;charset=utf-8');
    store.setStatus(`Exported standalone HTML report (${slug}.html). Review before sharing.`, 'ok');
    } catch (err) { store.setStatus(String(err), 'warn'); }
  });

  container.querySelector('[data-export="md"]')?.addEventListener('click', async () => {
    try {
    await triggerDownload(`${slug}.md`, report.markdown, 'text/markdown;charset=utf-8');
    store.setStatus(`Exported Markdown report (${slug}.md).`, 'ok');
    } catch (err) { store.setStatus(String(err), 'warn'); }
  });

  container.querySelector('[data-export="csv-findings"]')?.addEventListener('click', async () => {
    try {
    const csv = exportFindingsCsv(doc, ui.privacyMode);
    await triggerDownload(`ssat-findings-${ui.privacyMode}.csv`, csv, 'text/csv;charset=utf-8');
    store.setStatus('Exported formula-safe Findings & Remediation CSV.', 'ok');
    } catch (err) { store.setStatus(String(err), 'warn'); }
  });

  container.querySelector('[data-export="csv-evidence"]')?.addEventListener('click', async () => {
    try {
    const csv = exportEvidenceTrackerCsv(doc, ui.privacyMode);
    await triggerDownload(`ssat-evidence-tracker-${ui.privacyMode}.csv`, csv, 'text/csv;charset=utf-8');
    store.setStatus('Exported formula-safe Evidence Request Tracker CSV.', 'ok');
    } catch (err) { store.setStatus(String(err), 'warn'); }
  });

  container.querySelector('[data-export="json"]')?.addEventListener('click', async () => {
    try {
    const payload = buildRedactedJsonExport(doc, ui.privacyMode);
    await triggerDownload(`${slug}-report.json`, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
    store.setStatus('Exported structured report JSON (not an encrypted .ssat backup).', 'ok');
    } catch (err) { store.setStatus(String(err), 'warn'); }
  });
}
