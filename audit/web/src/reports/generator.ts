import type { AuditDocument, FindingRecord } from '../types';
import { CATALOG, CONTROL_MAP } from '../audit/catalog';
import { computeMetrics, effectivePriority, isEvidenceStale, scoreLabel } from '../audit/scoring';
import { esc } from '../a11y/helpers';
import { buildSafeCsv } from '../storage/csv';

export type ReportType =
  | 'executive'
  | 'technical'
  | 'evidence_tracker'
  | 'remediation'
  | 'continuity'
  | 'comparison'
  | 'rubric';

export type PrivacyMode = 'redacted' | 'restricted';

export interface ReportFilter {
  domain?: string;
  priority?: string;
  owner?: string;
  nist?: string;
}

export interface GeneratedReport {
  type: ReportType;
  title: string;
  privacyMode: PrivacyMode;
  htmlBody: string;
  markdown: string;
  isLandscape: boolean;
}

const SELF_ASSESSMENT_NOTICE =
  'Self-assessment; not a compliance certification. This report summarizes evidence collected in the Scholarship Security Audit Toolkit (SSAT). It is not a penetration test, legal opinion, or certification of NIST, FERPA, PCI DSS, or ADA/WCAG compliance.';

/**
 * Redacts local file paths, internal URLs, email addresses, and parenthetical personal names
 * when generating Executive / Redacted summaries (Test T-08).
 */
export function redactSensitiveText(input: string): string {
  if (!input) return '';
  return input
    .replace(/[a-zA-Z]+:\/\/[^\s)]+/g, '[REDACTED-REFERENCE]')
    .replace(/(?:[A-Za-z]:\\|\/(?:Users|home|var|etc|mnt|media|opt|srv|internal)\/)[^\s,;)]+/g, '[REDACTED-PATH]')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[REDACTED-EMAIL]')
    .replace(/\((?:[^()]*?-\s*Fictional|[^()]*?@[a-z0-9.-]+)\)/gi, '(Role only — redacted)');
}

function maybeRedact(text: string, mode: PrivacyMode): string {
  return mode === 'redacted' ? redactSensitiveText(text) : text;
}

function severityRank(sev: FindingRecord['severity']): number {
  if (sev === 'Immediate / Critical') return 0;
  if (sev === 'High') return 1;
  if (sev === 'Medium') return 2;
  return 3;
}

export function buildRedactedJsonExport(doc: AuditDocument, mode: PrivacyMode): Record<string, unknown> {
  const m = computeMetrics(doc);
  return {
    export_notice: SELF_ASSESSMENT_NOTICE,
    privacy_mode: mode === 'redacted' ? 'Executive / Redacted Summary' : 'Restricted / Internal',
    note_not_backup: 'This is a structured report export, NOT an encrypted .ssat backup.',
    schema_version: doc.schema_version,
    catalog_version: doc.catalog_version,
    organization: {
      display_name: doc.organization_profile.display_name || 'Unnamed Organization',
      organization_type: doc.organization_profile.organization_type,
      primary_cycle: doc.organization_profile.primary_cycle,
      legal_context_flag: doc.organization_profile.legal_context_flag
    },
    metrics: {
      assessed_controls: m.assessed_controls,
      applicable_controls: m.applicable_controls,
      coverage_percent: m.coverage_percent,
      readiness_percent: m.readiness_percent,
      is_provisional: m.is_provisional,
      critical_gaps: m.critical_gaps,
      not_assessed_controls: m.not_assessed_controls,
      stale_evidence_count: m.stale_evidence_count,
      open_high_critical_findings: m.open_high_critical_findings
    },
    domains: m.domains,
    findings: doc.findings.map((f) => ({
      finding_id: f.finding_id,
      control_id: f.control_id,
      severity: f.severity,
      title: maybeRedact(f.title, mode),
      proposed_action: maybeRedact(f.proposed_action, mode),
      owner_role: f.owner_role,
      horizon: f.horizon,
      target_date: f.target_date,
      status: f.status,
      verification_steps: maybeRedact(f.verification_steps, mode)
    })),
    evidence_summary: doc.evidence.map((e) => ({
      evidence_id: e.evidence_id,
      title: maybeRedact(e.title, mode),
      artifact_type: e.artifact_type,
      review_status: isEvidenceStale(e) ? 'stale' : e.review_status,
      artifact_date: e.artifact_date,
      linked_controls: e.linked_controls,
      storage_reference: mode === 'redacted' ? '[OMITTED IN REDACTED EXPORT]' : e.storage_reference
    }))
  };
}

export function generateReport(
  doc: AuditDocument,
  type: ReportType,
  mode: PrivacyMode = 'redacted',
  filter: ReportFilter = {}
): GeneratedReport {
  const m = computeMetrics(doc);
  const org = doc.organization_profile.display_name || 'Scholarship Provider (Unnamed)';
  const cycle = doc.organization_profile.primary_cycle || 'Unspecified Cycle';
  const privacyLabel = mode === 'redacted' ? 'Executive / Redacted' : 'Restricted / Internal — Confidential';

  const filteredControls = CATALOG.controls.filter((c) => {
    const a = doc.assessments[c.control_id];
    const pri = effectivePriority(c, a);
    if (filter.domain && c.domain_id !== filter.domain) return false;
    if (filter.priority && pri !== filter.priority) return false;
    if (filter.owner && !c.suggested_owner.toLowerCase().includes(filter.owner.toLowerCase())) return false;
    if (filter.nist && !c.nist_csf_tags.some((t) => t.toLowerCase().includes(filter.nist!.toLowerCase()))) return false;
    return true;
  });

  const sortedFindings = [...doc.findings].sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
  const readinessText =
    m.readiness_percent === null
      ? 'Not yet scored'
      : `${m.readiness_percent}%${m.is_provisional ? ' (Provisional — incomplete coverage)' : ''}`;

  const headerHtml = `
    <div class="report-banner">
      <div class="report-banner-meta">
        <span class="badge ${mode === 'redacted' ? 'badge-info' : 'badge-danger'}">${esc(privacyLabel)}</span>
        <span class="badge badge-neutral">Catalog v${esc(doc.catalog_version)}</span>
        ${doc.is_demo ? '<span class="badge badge-warn">FICTIONAL PRACTICE AUDIT</span>' : ''}
      </div>
      <p class="report-disclaimer"><strong>${esc(SELF_ASSESSMENT_NOTICE)}</strong></p>
      <dl class="report-meta-grid">
        <div><dt>Organization</dt><dd>${esc(org)}</dd></div>
        <div><dt>Scholarship Cycle</dt><dd>${esc(cycle)}</dd></div>
        <div><dt>Coverage</dt><dd>${m.assessed_controls} / ${m.applicable_controls} applicable controls (${m.coverage_percent}%)${m.na_controls ? ` · ${m.na_controls} N/A` : ''}</dd></div>
        <div><dt>Readiness</dt><dd>${esc(readinessText)}</dd></div>
      </dl>
      <div class="report-alert-strip">
        <span><strong>Critical gaps (0/1):</strong> ${m.critical_gaps}</span>
        <span><strong>Not assessed:</strong> ${m.not_assessed_controls}</span>
        <span><strong>Stale evidence:</strong> ${m.stale_evidence_count}</span>
        <span><strong>Open High/Critical findings:</strong> ${m.open_high_critical_findings}</span>
      </div>
    </div>
  `;

  const headerMd = [
    `> **${SELF_ASSESSMENT_NOTICE}**`,
    `> **Privacy level:** ${privacyLabel} | **Catalog:** v${doc.catalog_version}${doc.is_demo ? ' | **FICTIONAL PRACTICE DATA**' : ''}`,
    '',
    `- **Organization:** ${org}`,
    `- **Scholarship Cycle:** ${cycle}`,
    `- **Scope:** ${maybeRedact(doc.scope.audit_boundaries || 'Not specified', mode)}`,
    `- **Legal / Regulatory Note:** ${doc.organization_profile.legal_context_flag || 'Requires Counsel / Authorized Review'}`,
    `- **Critical gaps (Score 0/1):** ${m.critical_gaps} | **Unassessed controls:** ${m.not_assessed_controls} | **Stale evidence:** ${m.stale_evidence_count} | **Open High/Critical findings:** ${m.open_high_critical_findings}`,
    `- **Coverage:** ${m.assessed_controls}/${m.applicable_controls} (${m.coverage_percent}%) | **Readiness:** ${readinessText}`,
    ''
  ].join('\n');

  if (type === 'executive') {
    const topFive = sortedFindings.slice(0, 5);
    const htmlBody = `
      <h2>Executive Risk Brief</h2>
      ${headerHtml}
      <section class="report-section">
        <h3>Three Protection Priorities</h3>
        <ol>
          <li><strong>Protect student and donor information</strong> — inventory every copy, minimize sensitive intake fields, and enforce MFA &amp; least privilege.</li>
          <li><strong>Preserve award and payment integrity</strong> — enforce independent bank-change callbacks, financial separation of duties, and traceable score logs.</li>
          <li><strong>Keep scholarship cycles resilient</strong> — prove backups actually restore and practice deadline-day outage decisions.</li>
        </ol>
      </section>
      <section class="report-section">
        <h3>Score Distribution &amp; Evidence Provenance</h3>
        <p>Verified (Score 2): <strong>${m.score_2}</strong> · Partial / Unverified (Score 1): <strong>${m.score_1}</strong> · Not in place / Failed (Score 0): <strong>${m.score_0}</strong> · Not assessed: <strong>${m.not_assessed_controls}</strong> · Approved N/A: <strong>${m.na_controls}</strong>.</p>
        <p>Evidence artifacts tracked: <strong>${doc.evidence.length}</strong> (${doc.evidence.filter((e) => e.review_status === 'verified' || e.review_status === 'reviewed').length} reviewed/verified, ${m.stale_evidence_count} stale).</p>
        <p class="muted"><strong>Scope limitations &amp; unknowns:</strong> ${esc(maybeRedact(doc.scope.unknowns || 'Review unassessed domains before finalizing cycle conclusions.', mode))}</p>
      </section>
      <section class="report-section">
        <h3>Top Priority Issues (Up to 5)</h3>
        ${
          topFive.length === 0
            ? '<p>No open findings recorded yet. Review unassessed controls and Critical gaps first.</p>'
            : topFive
                .map(
                  (f) => `
              <article class="finding-brief">
                <h4><span class="badge ${f.severity === 'Immediate / Critical' ? 'badge-danger' : 'badge-warn'}">${esc(f.severity)}</span> ${esc(f.finding_id)}: ${esc(maybeRedact(f.title, mode))}</h4>
                <p><strong>Why it matters:</strong> ${esc(maybeRedact(f.impact || f.description, mode))}</p>
                <p><strong>Control &amp; Evidence:</strong> ${esc(f.control_id)} · ${f.evidence_ids.length ? esc(f.evidence_ids.join(', ')) : 'No supporting artifact linked'}${mode === 'redacted' ? ' <em>(internal paths omitted)</em>' : ''}</p>
                <p><strong>Action (${esc(f.horizon)}):</strong> ${esc(maybeRedact(f.proposed_action, mode))}</p>
                <p><strong>Owner role:</strong> ${esc(f.owner_role || 'Unassigned')} · <strong>Target:</strong> ${esc(f.target_date || 'TBD')} · <strong>Status:</strong> ${esc(f.status)}</p>
                <p><strong>Verification criterion:</strong> ${esc(maybeRedact(f.verification_steps || 'Define observable retest criterion.', mode))}</p>
              </article>
            `
                )
                .join('')
        }
      </section>
      <section class="report-section">
        <h3>30 / 60 / 90-Day Action Summary</h3>
        <div class="table-scroll"><table class="data-table">
          <thead><tr><th>Window</th><th>Finding</th><th>Action</th><th>Owner Role</th><th>Status</th></tr></thead>
          <tbody>
            ${
              sortedFindings.length === 0
                ? '<tr><td colspan="5">No remediation actions entered yet.</td></tr>'
                : sortedFindings
                    .map(
                      (f) =>
                        `<tr><td>${esc(f.horizon)}</td><td>${esc(f.finding_id)} (${esc(f.control_id)})</td><td>${esc(maybeRedact(f.proposed_action, mode))}</td><td>${esc(f.owner_role)}</td><td>${esc(f.status)}</td></tr>`
                    )
                    .join('')
            }
          </tbody>
        </table></div>
      </section>
    `;

    const markdown = [
      `# Executive Risk Brief — ${org}`,
      '',
      headerMd,
      '## Score Distribution',
      `- Score 2 (Verified): ${m.score_2}`,
      `- Score 1 (Partial / Unverified): ${m.score_1}`,
      `- Score 0 (Not in place / Failed): ${m.score_0}`,
      `- Not assessed: ${m.not_assessed_controls} | Approved N/A: ${m.na_controls}`,
      '',
      '## Top Issues',
      ...topFive.map(
        (f) =>
          `### ${f.finding_id} [${f.severity}] — ${maybeRedact(f.title, mode)}\n- **Control:** ${f.control_id}\n- **Why it matters:** ${maybeRedact(f.impact || f.description, mode)}\n- **Action (${f.horizon}):** ${maybeRedact(f.proposed_action, mode)}\n- **Owner role:** ${f.owner_role} | **Target:** ${f.target_date || 'TBD'} | **Status:** ${f.status}\n- **Verification:** ${maybeRedact(f.verification_steps, mode)}\n`
      )
    ].join('\n');

    return { type, title: 'Executive Risk Brief', privacyMode: mode, htmlBody, markdown, isLandscape: false };
  }

  if (type === 'technical') {
    const rowsHtml = filteredControls
      .map((c) => {
        const a = doc.assessments[c.control_id];
        const pri = effectivePriority(c, a);
        const evList = (a?.evidence_ids || [])
          .map((id) => {
            const e = doc.evidence.find((x) => x.evidence_id === id);
            if (!e) return id;
            const ref = mode === 'redacted' ? '[path redacted]' : e.storage_reference || 'no path';
            return `${e.evidence_id} (${e.review_status}, ${ref})`;
          })
          .join('; ');
        return `<tr>
          <td><strong>${esc(c.control_id)}</strong><br><small>${esc(pri)}</small></td>
          <td>${esc(c.title)}<br><small>NIST: ${esc(c.nist_csf_tags.join(', '))}</small></td>
          <td>${esc(scoreLabel(a?.status, a?.score))}</td>
          <td>${esc(evList || 'None linked')}</td>
          <td>${esc(maybeRedact(a?.assessment_notes || a?.not_applicable_reason || 'No notes recorded.', mode))}</td>
          <td>${esc(a?.review_method || '—')}<br><small>${esc(a?.review_date || '—')}</small></td>
        </tr>`;
      })
      .join('');

    const htmlBody = `
      <h2>Detailed Technical &amp; Evidence Audit</h2>
      ${headerHtml}
      <section class="report-section">
        <h3>Scope &amp; Boundaries</h3>
        <p>${esc(maybeRedact(doc.scope.audit_boundaries || 'Not specified.', mode))}</p>
        <p><strong>Exclusions:</strong> ${esc(maybeRedact(doc.scope.exclusions || 'None listed.', mode))}</p>
        <p><strong>Unknowns:</strong> ${esc(maybeRedact(doc.scope.unknowns || 'None listed.', mode))}</p>
      </section>
      <section class="report-section">
        <h3>Control-by-Control Evaluation (${filteredControls.length} shown)</h3>
        <table class="data-table">
          <thead><tr><th>Control</th><th>Title &amp; NIST</th><th>Score / State</th><th>Linked Evidence</th><th>Notes / Exceptions</th><th>Method &amp; Date</th></tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </section>
      <section class="report-section">
        <h3>Guided Simulation Verification Logs (${doc.simulations.length})</h3>
        ${
          doc.simulations.length === 0
            ? '<p>No simulation verification logs recorded yet.</p>'
            : `<table class="data-table">
                <thead><tr><th>Test ID</th><th>Scenario</th><th>Outcome</th><th>Date &amp; Environment</th><th>Observation &amp; Limitations</th></tr></thead>
                <tbody>${doc.simulations
                  .map(
                    (s) =>
                      `<tr><td>${esc(s.test_id)}</td><td>${esc(s.scenario)}</td><td>${esc(s.pass_partial_fail.toUpperCase())}</td><td>${esc(s.date)} · ${esc(maybeRedact(s.test_environment, mode))}</td><td>${esc(maybeRedact(s.actual_observation, mode))}<br><small>Limits: ${esc(maybeRedact(s.limitations, mode))}</small></td></tr>`
                  )
                  .join('')}</tbody>
              </table>`
        }
      </section>
    `;

    const markdown = [
      `# Detailed Technical Audit — ${org}`,
      '',
      headerMd,
      '## Controls',
      '| Control | Priority | Score | Evidence | Method / Date | Notes |',
      '|---|---|---|---|---|---|',
      ...filteredControls.map((c) => {
        const a = doc.assessments[c.control_id];
        return `| ${c.control_id} | ${effectivePriority(c, a)} | ${scoreLabel(a?.status, a?.score)} | ${(a?.evidence_ids || []).join(', ') || 'None'} | ${a?.review_method || '—'} ${a?.review_date || ''} | ${maybeRedact(a?.assessment_notes || '', mode).replace(/\|/g, '/')} |`;
      })
    ].join('\n');

    return { type, title: 'Detailed Technical Audit', privacyMode: mode, htmlBody, markdown, isLandscape: false };
  }

  if (type === 'evidence_tracker') {
    const rowsHtml = doc.evidence
      .map((e) => {
        const stale = isEvidenceStale(e);
        return `<tr>
          <td><strong>${esc(e.evidence_id)}</strong></td>
          <td>${esc(maybeRedact(e.title, mode))}<br><small>${esc(e.artifact_type)} · ${esc(e.data_sensitivity)}</small></td>
          <td>${esc(e.linked_controls.join(', '))}</td>
          <td>${esc(maybeRedact(e.produced_by, mode))}</td>
          <td>${esc(stale ? 'STALE — Re-verify' : e.review_status)}</td>
          <td>${esc(e.artifact_date || '—')} / Next: ${esc(e.next_review_date || '—')}</td>
          <td>${mode === 'redacted' ? '<em>Omitted in redacted view</em>' : esc(e.storage_reference || '—')}</td>
        </tr>`;
      })
      .join('');

    const htmlBody = `
      <h2>Evidence Request &amp; Freshness Tracker</h2>
      ${headerHtml}
      <section class="report-section">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Artifact</th><th>Controls</th><th>Owner / Producer</th><th>State</th><th>Dates</th><th>Storage Reference</th></tr></thead>
          <tbody>${rowsHtml || '<tr><td colspan="7">No evidence records logged yet.</td></tr>'}</tbody>
        </table>
      </section>
    `;

    const markdown = [
      `# Evidence Request Tracker — ${org}`,
      '',
      headerMd,
      '| ID | Title | Controls | State | Artifact Date | Next Review |',
      '|---|---|---|---|---|---|',
      ...doc.evidence.map(
        (e) =>
          `| ${e.evidence_id} | ${maybeRedact(e.title, mode)} | ${e.linked_controls.join(', ')} | ${isEvidenceStale(e) ? 'STALE' : e.review_status} | ${e.artifact_date} | ${e.next_review_date} |`
      )
    ].join('\n');

    return { type, title: 'Evidence Request Tracker', privacyMode: mode, htmlBody, markdown, isLandscape: false };
  }

  if (type === 'remediation') {
    const htmlBody = `
      <h2>Remediation Roadmap</h2>
      ${headerHtml}
      <section class="report-section">
        <table class="data-table">
          <thead><tr><th>Priority &amp; Window</th><th>ID / Control</th><th>Proposed Action</th><th>Owner Role</th><th>Target &amp; Cost</th><th>Verification Step</th><th>Status</th></tr></thead>
          <tbody>
            ${
              sortedFindings.length === 0
                ? '<tr><td colspan="7">No remediation findings recorded.</td></tr>'
                : sortedFindings
                    .map(
                      (f) => `<tr>
                        <td><strong>${esc(f.severity)}</strong><br><small>${esc(f.horizon)}</small></td>
                        <td>${esc(f.finding_id)}<br><small>${esc(f.control_id)}</small></td>
                        <td>${esc(maybeRedact(f.proposed_action, mode))}</td>
                        <td>${esc(f.owner_role || 'Unassigned')}</td>
                        <td>${esc(f.target_date || 'TBD')}<br><small>Effort: ${esc(f.cost_effort_band)}</small></td>
                        <td>${esc(maybeRedact(f.verification_steps, mode))}</td>
                        <td>${esc(f.status)}</td>
                      </tr>`
                    )
                    .join('')
            }
          </tbody>
        </table>
      </section>
    `;

    const markdown = [
      `# Remediation Roadmap — ${org}`,
      '',
      headerMd,
      '| Severity | Window | ID | Action | Owner | Due | Status |',
      '|---|---|---|---|---|---|---|',
      ...sortedFindings.map(
        (f) =>
          `| ${f.severity} | ${f.horizon} | ${f.finding_id} (${f.control_id}) | ${maybeRedact(f.proposed_action, mode).replace(/\|/g, '/')} | ${f.owner_role} | ${f.target_date || 'TBD'} | ${f.status} |`
      )
    ].join('\n');

    return { type, title: 'Remediation Roadmap', privacyMode: mode, htmlBody, markdown, isLandscape: false };
  }

  if (type === 'continuity') {
    const contControls = CATALOG.controls.filter((c) => c.domain_id === 'CONT' || c.domain_id === 'RESP');
    const contSims = doc.simulations.filter((s) => s.simulation_key === 'SIM-03' || s.linked_control_ids.some((id) => id.startsWith('CONT') || id.startsWith('RESP')));
    const htmlBody = `
      <h2>Scholarship Continuity &amp; Incident Readiness Plan Summary</h2>
      ${headerHtml}
      <section class="report-section">
        <h3>Critical Systems &amp; Scholarship Processes</h3>
        <table class="data-table">
          <thead><tr><th>System</th><th>Criticality</th><th>Processes</th><th>Owner Role</th><th>Vendor / Host</th></tr></thead>
          <tbody>
            ${
              doc.systems.length === 0
                ? '<tr><td colspan="5">No systems recorded in Scope &amp; Systems yet.</td></tr>'
                : doc.systems
                    .map(
                      (s) =>
                        `<tr><td>${esc(s.name)}</td><td>${esc(s.criticality)}</td><td>${esc(s.processes.join(', '))}</td><td>${esc(s.owner_role)}</td><td>${esc(maybeRedact(s.vendor_or_host, mode))}</td></tr>`
                    )
                    .join('')
            }
          </tbody>
        </table>
      </section>
      <section class="report-section">
        <h3>Continuity &amp; Response Control Status</h3>
        <table class="data-table">
          <thead><tr><th>Control</th><th>Title</th><th>Status / Score</th><th>Notes</th></tr></thead>
          <tbody>
            ${contControls
              .map((c) => {
                const a = doc.assessments[c.control_id];
                return `<tr><td>${esc(c.control_id)}</td><td>${esc(c.title)}</td><td>${esc(scoreLabel(a?.status, a?.score))}</td><td>${esc(maybeRedact(a?.assessment_notes || 'Not yet documented.', mode))}</td></tr>`;
              })
              .join('')}
          </tbody>
        </table>
      </section>
      <section class="report-section">
        <h3>Tabletop &amp; Continuity Exercise Record</h3>
        ${
          contSims.length === 0
            ? '<p>No continuity tabletop exercise logged yet. Run Simulation 3 (Deadline-day outage tabletop).</p>'
            : contSims
                .map(
                  (s) => `<div class="finding-brief"><strong>${esc(s.test_id)} — ${esc(s.scenario)} (${esc(s.pass_partial_fail.toUpperCase())})</strong><p>${esc(maybeRedact(s.actual_observation, mode))}</p></div>`
                )
                .join('')
        }
      </section>
    `;

    const markdown = [
      `# Scholarship Continuity Plan Summary — ${org}`,
      '',
      headerMd,
      '## Critical Systems',
      ...doc.systems.map((s) => `- **${s.name}** (${s.criticality}) — Processes: ${s.processes.join(', ')} — Owner: ${s.owner_role}`),
      '',
      '## Continuity & Response Controls',
      ...contControls.map((c) => {
        const a = doc.assessments[c.control_id];
        return `- **${c.control_id} (${c.title}):** ${scoreLabel(a?.status, a?.score)} — ${maybeRedact(a?.assessment_notes || 'Unassessed', mode)}`;
      })
    ].join('\n');

    return { type, title: 'Scholarship Continuity Plan', privacyMode: mode, htmlBody, markdown, isLandscape: false };
  }

  if (type === 'comparison') {
    const prev = doc.snapshots[0];
    if (!prev) {
      const htmlBody = `
        <h2>Year-over-Year / Cycle Comparison</h2>
        ${headerHtml}
        <p class="callout">No previous snapshot exists yet. Capture a snapshot in the <strong>History</strong> screen at the end of a cycle to compare score, coverage, vendor, and risk deltas over time.</p>
      `;
      return {
        type,
        title: 'Cycle Comparison',
        privacyMode: mode,
        htmlBody,
        markdown: `# Cycle Comparison — ${org}\n\n${headerMd}\nNo prior snapshot recorded yet.\n`,
        isLandscape: false
      };
    }

    const deltas = CATALOG.controls
      .map((c) => {
        const oldVal = prev.control_scores[c.control_id];
        const currA = doc.assessments[c.control_id];
        const newVal = currA?.status === 'not_applicable' ? 'NA' : currA?.status === 'assessed' ? currA.score : null;
        if (oldVal === newVal) return null;
        return { control_id: c.control_id, title: c.title, oldVal, newVal };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));

    const currentVendors = new Set(doc.systems.map((s) => s.vendor_or_host || s.name).filter(Boolean));
    const priorVendors = new Set(prev.vendor_names || []);
    const newVendors = [...currentVendors].filter((v) => !priorVendors.has(v));

    const htmlBody = `
      <h2>Year-over-Year / Cycle Comparison</h2>
      ${headerHtml}
      <section class="report-section">
        <h3>Comparing "${esc(prev.label)}" vs Current Cycle ("${esc(cycle)}")</h3>
        <table class="data-table">
          <thead><tr><th>Metric</th><th>Prior Snapshot (${esc(prev.cycle_name)})</th><th>Current Assessment</th></tr></thead>
          <tbody>
            <tr><td>Coverage</td><td>${prev.summary.assessed_controls}/${prev.summary.applicable_controls} (${prev.summary.coverage_percent}%)</td><td>${m.assessed_controls}/${m.applicable_controls} (${m.coverage_percent}%)</td></tr>
            <tr><td>Readiness</td><td>${prev.summary.readiness_percent ?? '—'}%</td><td>${esc(readinessText)}</td></tr>
            <tr><td>Critical Gaps (0/1)</td><td>${prev.summary.critical_gaps}</td><td>${m.critical_gaps}</td></tr>
            <tr><td>Open High/Critical Findings</td><td>${prev.summary.open_high_critical_findings}</td><td>${m.open_high_critical_findings}</td></tr>
            <tr><td>Stale Evidence Items</td><td>${prev.summary.stale_evidence_count}</td><td>${m.stale_evidence_count}</td></tr>
          </tbody>
        </table>
        <p><strong>New systems / vendors since baseline:</strong> ${newVendors.length ? esc(newVendors.join(', ')) : 'None recorded'}</p>
      </section>
      <section class="report-section">
        <h3>Control Score Changes (${deltas.length})</h3>
        <table class="data-table">
          <thead><tr><th>Control</th><th>Title</th><th>Prior</th><th>Current</th></tr></thead>
          <tbody>
            ${
              deltas.length === 0
                ? '<tr><td colspan="4">No control score changes since the last snapshot.</td></tr>'
                : deltas
                    .map(
                      (d) =>
                        `<tr><td>${esc(d.control_id)}</td><td>${esc(d.title)}</td><td>${esc(d.oldVal ?? 'Unassessed')}</td><td>${esc(d.newVal ?? 'Unassessed')}</td></tr>`
                    )
                    .join('')
            }
          </tbody>
        </table>
      </section>
    `;

    const markdown = [
      `# Cycle Comparison — ${org}`,
      '',
      headerMd,
      `Comparing **${prev.label}** (${prev.cycle_name}) vs **${cycle}**:`,
      `- Coverage: ${prev.summary.coverage_percent}% -> ${m.coverage_percent}%`,
      `- Critical gaps: ${prev.summary.critical_gaps} -> ${m.critical_gaps}`,
      `- Open High/Critical findings: ${prev.summary.open_high_critical_findings} -> ${m.open_high_critical_findings}`,
      `- New systems/vendors: ${newVendors.join(', ') || 'None'}`,
      ''
    ].join('\n');

    return { type, title: 'Cycle Comparison', privacyMode: mode, htmlBody, markdown, isLandscape: false };
  }

  // Landscape Audit Rubric (10 domains, priority, evidence summary, score per control, key action)
  const rubricRows = m.domains
    .map((d) => {
      const ctrls = CATALOG.controls.filter((c) => c.domain_id === d.domain_id);
      const ctrlSummary = ctrls
        .map((c) => {
          const a = doc.assessments[c.control_id];
          const val = a?.status === 'not_applicable' ? 'N/A' : a?.status === 'assessed' ? String(a.score) : '—';
          return `${c.control_id}: ${val}`;
        })
        .join(' · ');
      const topFinding = sortedFindings.find((f) => {
        const c = CONTROL_MAP.get(f.control_id);
        return c?.domain_id === d.domain_id;
      });
      const evCount = doc.evidence.filter((e) => e.linked_controls.some((cid) => cid.startsWith(d.domain_id + '-'))).length;
      return `<tr>
        <td><strong>${esc(d.domain_id)}</strong><br>${esc(d.name)}</td>
        <td><span class="badge ${d.default_priority === 'Critical' ? 'badge-danger' : 'badge-info'}">${esc(d.default_priority)}</span></td>
        <td>${esc(ctrlSummary)}</td>
        <td>${d.assessed_controls}/${d.applicable_controls} (${d.coverage_percent}%) · ${d.readiness_percent === null ? '—' : d.readiness_percent + '%'}</td>
        <td>${evCount} artifact(s)</td>
        <td>${esc(topFinding ? maybeRedact(topFinding.proposed_action, mode) : 'Complete remaining controls & verify evidence')}</td>
      </tr>`;
    })
    .join('');

  const htmlBody = `
    <h2>Landscape Audit Rubric (Printable Scorecard)</h2>
    ${headerHtml}
    <div class="table-scroll"><table class="data-table rubric-table">
      <thead>
        <tr>
          <th>Domain</th>
          <th>Priority</th>
          <th>Control Scores (0 / 1 / 2 / —)</th>
          <th>Coverage &amp; Readiness</th>
          <th>Evidence</th>
          <th>Key Next Action</th>
        </tr>
      </thead>
      <tbody>${rubricRows}</tbody>
    </table></div>
  `;

  const markdown = [
    `# Landscape Audit Rubric — ${org}`,
    '',
    headerMd,
    '| Domain | Priority | Coverage | Readiness | Critical Gaps |',
    '|---|---|---|---|---|',
    ...m.domains.map(
      (d) => `| ${d.domain_id}: ${d.name} | ${d.default_priority} | ${d.assessed_controls}/${d.applicable_controls} (${d.coverage_percent}%) | ${d.readiness_percent ?? '—'}% | ${d.critical_gaps} |`
    )
  ].join('\n');

  return { type: 'rubric', title: 'Landscape Audit Rubric', privacyMode: mode, htmlBody, markdown, isLandscape: true };
}

export function exportFindingsCsv(doc: AuditDocument, mode: PrivacyMode): string {
  return buildSafeCsv(
    ['finding_id', 'control_id', 'severity', 'horizon', 'title', 'proposed_action', 'owner_role', 'target_date', 'cost_effort_band', 'verification_steps', 'status'],
    doc.findings.map((f) => [
      f.finding_id,
      f.control_id,
      f.severity,
      f.horizon,
      maybeRedact(f.title, mode),
      maybeRedact(f.proposed_action, mode),
      f.owner_role,
      f.target_date,
      f.cost_effort_band,
      maybeRedact(f.verification_steps, mode),
      f.status
    ])
  );
}

export function exportEvidenceTrackerCsv(doc: AuditDocument, mode: PrivacyMode): string {
  return buildSafeCsv(
    ['evidence_id', 'title', 'artifact_type', 'linked_controls', 'review_status', 'result', 'artifact_date', 'next_review_date', 'produced_by', 'storage_reference'],
    doc.evidence.map((e) => [
      e.evidence_id,
      maybeRedact(e.title, mode),
      e.artifact_type,
      e.linked_controls.join('; '),
      isEvidenceStale(e) ? 'stale' : e.review_status,
      e.result,
      e.artifact_date,
      e.next_review_date,
      maybeRedact(e.produced_by, mode),
      mode === 'redacted' ? '[OMITTED IN REDACTED EXPORT]' : e.storage_reference
    ])
  );
}

export function wrapStandaloneHtmlReport(report: GeneratedReport, orgName: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(report.title)} — ${esc(orgName || 'SSAT')}</title>
<style>
  @page { size: ${report.isLandscape ? 'landscape' : 'portrait'}; margin: 0.6in; }
  body { font-family: Arial, Helvetica, sans-serif; color: #2E4F66; background: #FFFEFA; max-width: 1100px; margin: 0 auto; padding: 24px; line-height: 1.5; }
  h1, h2, h3 { font-family: Georgia, 'Times New Roman', serif; color: #2E4F66; }
  .report-banner { background: #E4F4F4; border: 1px solid #CCDDDD; border-left: 5px solid #007681; padding: 16px; border-radius: 6px; margin-bottom: 20px; }
  .report-banner-meta { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
  .report-meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 12px 0; }
  .report-meta-grid dt { font-size: 12px; font-weight: 700; color: #526674; }
  .report-meta-grid dd { margin: 2px 0 0; font-weight: 700; }
  .report-alert-strip { display: flex; gap: 18px; flex-wrap: wrap; padding-top: 10px; border-top: 1px solid #CCDDDD; font-size: 14px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 700; border: 1px solid #2E4F66; }
  .badge-danger { background: #FCE8E8; color: #8A1F20; border-color: #8A1F20; }
  .badge-warn { background: #FFF4D6; color: #6E4700; border-color: #B7791F; }
  .badge-info { background: #E4F4F4; color: #005A63; border-color: #007681; }
  .badge-neutral { background: #F1F5F7; color: #2E4F66; border-color: #9BB0BC; }
  table.data-table { width: 100%; border-collapse: collapse; margin: 12px 0 22px; font-size: 13px; }
  table.data-table th { background: #2E4F66; color: #fff; text-align: left; padding: 8px 10px; }
  table.data-table td { border: 1px solid #CCDDDD; padding: 8px 10px; vertical-align: top; }
  .finding-brief { border: 1px solid #CCDDDD; border-left: 4px solid #007681; padding: 12px 14px; border-radius: 4px; margin-bottom: 12px; background: #fff; break-inside: avoid; }
  .finding-brief h4 { margin: 0 0 8px; }
  .finding-brief p { margin: 4px 0; font-size: 14px; }
  @media print { body { padding: 0; max-width: none; background: #fff; } .report-banner { break-inside: avoid; } }
</style>
</head>
<body>
${report.htmlBody}
</body>
</html>`;
}
