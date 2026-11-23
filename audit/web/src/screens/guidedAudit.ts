import type { Store } from '../audit/state';
import { CATALOG, CONTROL_MAP, DOMAIN_MAP, getTemplateByKey } from '../audit/catalog';
import { ensureControlAssessment } from '../audit/validation';
import {
  checkProofRuleForScoreTwo,
  effectivePriority,
  isEvidenceStale,
  scoreShortBadge,
  validateNotApplicable
} from '../audit/scoring';
import { esc, nextId, todayISO, triggerDownload } from '../a11y/helpers';

export function renderGuidedAudit(store: Store): string {
  const state = store.get();
  const doc = state.doc;
  if (!doc) return '<p>Start or open an audit to evaluate controls.</p>';

  const control = CONTROL_MAP.get(state.selectedControlId) || CATALOG.controls[0];
  const domain = DOMAIN_MAP.get(control.domain_id) || CATALOG.domains[0];
  const assessment = ensureControlAssessment(doc, control.control_id);
  const pri = effectivePriority(control, assessment);
  const proofCheck = checkProofRuleForScoreTwo(assessment, doc.evidence);
  const naCheck = validateNotApplicable(assessment);
  const template = getTemplateByKey(control.template_key);

  const ctrlIndex = CATALOG.controls.findIndex((c) => c.control_id === control.control_id);
  const prevCtrl = ctrlIndex > 0 ? CATALOG.controls[ctrlIndex - 1] : null;
  const nextCtrl = ctrlIndex < CATALOG.controls.length - 1 ? CATALOG.controls[ctrlIndex + 1] : null;

  // Left rail: 10 domains + 30 controls
  const leftNavHtml = CATALOG.domains
    .map((dom) => {
      const domCtrls = CATALOG.controls.filter((c) => c.domain_id === dom.domain_id);
      const doneCount = domCtrls.filter((c) => {
        const a = doc.assessments[c.control_id];
        return a && (a.status === 'assessed' || a.status === 'not_applicable');
      }).length;
      const isCurrentDomain = dom.domain_id === control.domain_id;
      return `
        <details class="domain-nav-group" ${isCurrentDomain ? 'open' : ''}>
          <summary>
            <span><strong>${esc(dom.domain_id)}</strong> ${esc(dom.name)}</span>
            <span class="nav-count">${doneCount}/${domCtrls.length}</span>
          </summary>
          <ul class="ctrl-nav-list">
            ${domCtrls
              .map((c) => {
                const a = doc.assessments[c.control_id];
                const badge = scoreShortBadge(a?.status, a?.score);
                const active = c.control_id === control.control_id;
                return `
                  <li>
                    <button type="button" class="ctrl-nav-btn ${active ? 'active' : ''}" data-select-control="${esc(c.control_id)}" ${active ? 'aria-current="page"' : ''}>
                      <span class="ctrl-nav-id">${esc(c.control_id)}</span>
                      <span class="ctrl-nav-title">${esc(c.title)}</span>
                      <span class="badge badge-${badge.tone} badge-xs">${esc(badge.text)}</span>
                    </button>
                  </li>`;
              })
              .join('')}
          </ul>
        </details>
      `;
    })
    .join('');

  const matchingEvidence = doc.evidence.filter(
    (e) => e.linked_controls.includes(control.control_id) || assessment.evidence_ids.includes(e.evidence_id)
  );
  const otherEvidence = doc.evidence.filter((e) => !matchingEvidence.some((m) => m.evidence_id === e.evidence_id));

  const evidencePickerHtml = [...matchingEvidence, ...otherEvidence]
    .map((e) => {
      const checked = assessment.evidence_ids.includes(e.evidence_id);
      const stale = isEvidenceStale(e);
      return `
        <label class="ev-check-row">
          <input type="checkbox" name="evidence_id" value="${esc(e.evidence_id)}" ${checked ? 'checked' : ''} />
          <span>
            <strong>${esc(e.evidence_id)}</strong> — ${esc(e.title)}
            <small class="muted">(${esc(stale ? 'STALE' : e.review_status)} · ${esc(e.result)} · ${esc(e.artifact_date || 'no date')})</small>
          </span>
        </label>
      `;
    })
    .join('');

  const glossaryHtml = CATALOG.glossary
    .map(
      (g) => `
      <details class="glossary-mini">
        <summary>${esc(g.term)}</summary>
        <p>${esc(g.plain_definition)}</p>
      </details>`
    )
    .join('');

  return `
    <div class="guided-layout">
      <aside class="guided-left card" aria-label="Domain and control navigation">
        <div class="rail-head">
          <h2>10 Domains · 30 Controls</h2>
          <p class="muted">Control ${ctrlIndex + 1} of ${CATALOG.controls.length}</p>
        </div>
        ${leftNavHtml}
      </aside>

      <section class="guided-center card" aria-labelledby="ctrl-heading">
        <div class="ctrl-header-meta">
          <span class="badge ${pri === 'Critical' ? 'badge-danger' : 'badge-info'}">${esc(pri)} Priority</span>
          <span class="badge badge-neutral">${esc(domain.domain_id)}: ${esc(domain.name)}</span>
          <span class="badge badge-neutral">NIST CSF: ${esc(control.nist_csf_tags.join(', '))}</span>
        </div>

        <h1 id="ctrl-heading">${esc(control.control_id)} — ${esc(control.title)}</h1>
        <p class="audit-question">${esc(control.plain_language_question)}</p>

        <div class="teaching-grid">
          <div class="teaching-panel">
            <h3>Why this matters</h3>
            <p>${esc(control.why_it_matters)}</p>
          </div>
          <div class="teaching-panel">
            <h3>Scholarship example</h3>
            <p>${esc(control.scholarship_example)}</p>
          </div>
          <div class="teaching-panel">
            <h3>Try this test</h3>
            <p>${esc(control.verification_steps)}</p>
            <p class="muted" style="margin-top:6px"><strong>Expected result:</strong> ${esc(control.expected_result)}</p>
          </div>
        </div>

        <form id="control-assessment-form" class="assessment-form">
          <h2>Record Evaluation &amp; Score</h2>

          <fieldset class="score-fieldset">
            <legend>Assessment status and score</legend>
            <div class="score-options">
              <label class="score-option ${assessment.status === 'not_assessed' ? 'selected' : ''}">
                <input type="radio" name="score_choice" value="not_assessed" ${assessment.status === 'not_assessed' ? 'checked' : ''} />
                <span><strong>Not assessed</strong><small>No conclusion yet (shown as coverage gap)</small></span>
              </label>
              <label class="score-option ${assessment.status === 'assessed' && assessment.score === 0 ? 'selected' : ''}">
                <input type="radio" name="score_choice" value="0" ${assessment.status === 'assessed' && assessment.score === 0 ? 'checked' : ''} />
                <span><strong>0 — Not in place / verified failure</strong><small>Safeguard missing or test failed</small></span>
              </label>
              <label class="score-option ${assessment.status === 'assessed' && assessment.score === 1 ? 'selected' : ''}">
                <input type="radio" name="score_choice" value="1" ${assessment.status === 'assessed' && assessment.score === 1 ? 'checked' : ''} />
                <span><strong>1 — Partial, self-attested, or unverified</strong><small>Exists partially or lacks current reviewed proof</small></span>
              </label>
              <label class="score-option ${assessment.status === 'assessed' && assessment.score === 2 ? 'selected' : ''} ${!proofCheck.allowed ? 'score-locked' : ''}">
                <input type="radio" name="score_choice" value="2" ${assessment.status === 'assessed' && assessment.score === 2 ? 'checked' : ''} />
                <span>
                  <strong>2 — Verified and tested ${!proofCheck.allowed ? '(Proof required)' : ''}</strong>
                  <small>Current reviewed evidence + verification method + date</small>
                </span>
              </label>
              <label class="score-option ${assessment.status === 'not_applicable' ? 'selected' : ''}">
                <input type="radio" name="score_choice" value="not_applicable" ${assessment.status === 'not_applicable' ? 'checked' : ''} />
                <span><strong>Not applicable (N/A)</strong><small>Requires written reason, scope, reviewer, and date</small></span>
              </label>
            </div>
          </fieldset>

          ${
            !proofCheck.allowed
              ? `<div class="callout callout-warn" role="note" id="proof-rule-callout">
                   <strong>Proof rule for Score 2 (Verified):</strong>
                   <p style="margin:4px 0">To prevent unverified checklists from inflating readiness, Score 2 requires:</p>
                   <ul>${proofCheck.reasons.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
                 </div>`
              : `<div class="callout callout-ok" role="note">
                   <strong>Proof rule met:</strong> Linked verified/reviewed evidence (${esc(proofCheck.qualifyingEvidenceIds.join(', '))}) + verification method and date support Score 2.
                 </div>`
          }

          <label class="check-inline" style="margin:12px 0">
            <input type="checkbox" name="self_attestation_claim" ${assessment.self_attestation_claim ? 'checked' : ''} />
            <span>Self-attestation only (“I think this is in place, pending direct verification” — stays Score 1 until verified)</span>
          </label>

          <div class="form-grid">
            <label>
              <span>Verification method</span>
              <select name="review_method">
                <option value="" ${!assessment.review_method ? 'selected' : ''}>Not reviewed yet</option>
                <option value="inspected_document" ${assessment.review_method === 'inspected_document' ? 'selected' : ''}>Inspected document</option>
                <option value="observed_configuration" ${assessment.review_method === 'observed_configuration' ? 'selected' : ''}>Observed live configuration</option>
                <option value="sampled_transactions" ${assessment.review_method === 'sampled_transactions' ? 'selected' : ''}>Sampled records / transactions</option>
                <option value="executed_controlled_test" ${assessment.review_method === 'executed_controlled_test' ? 'selected' : ''}>Executed controlled test</option>
              </select>
            </label>
            <label>
              <span>Reviewer role</span>
              <input type="text" name="reviewer_role" value="${esc(assessment.reviewer_role)}" placeholder="${esc(control.suggested_owner)}" maxlength="120" />
            </label>
            <label>
              <span>Review / verification date</span>
              <input type="date" name="review_date" value="${esc(assessment.review_date)}" />
            </label>
            <label>
              <span>Last operational test date</span>
              <input type="date" name="last_test_date" value="${esc(assessment.last_test_date)}" />
            </label>
            <label>
              <span>Next review date (recommended every ${control.recommended_review_days} days)</span>
              <input type="date" name="next_review_date" value="${esc(assessment.next_review_date)}" />
            </label>
            ${
              control.priority !== 'Critical'
                ? `<label>
                     <span>Raise local priority? (Critical controls cannot be lowered)</span>
                     <select name="priority_override">
                       <option value="" ${!assessment.priority_override ? 'selected' : ''}>Default (${esc(control.priority)})</option>
                       <option value="Critical" ${assessment.priority_override === 'Critical' ? 'selected' : ''}>Raise to Critical</option>
                     </select>
                   </label>`
                : `<div><span class="field-label">Priority lock</span><p class="muted" style="margin:6px 0 0">Critical (cannot be silently lowered)</p></div>`
            }
          </div>

          <label style="margin-top:12px">
            <span>Assessment notes, observations, and exceptions (do not paste real applicant/donor PII)</span>
            <textarea name="assessment_notes" rows="4" maxlength="4000">${esc(assessment.assessment_notes)}</textarea>
          </label>

          <fieldset class="na-box" id="na-fields">
            <legend>Not Applicable (N/A) documentation — required only if marking N/A</legend>
            ${
              assessment.status === 'not_applicable' && !naCheck.valid
                ? `<div class="callout callout-danger"><strong>Incomplete N/A justification:</strong> ${esc(naCheck.reasons.join(' '))}</div>`
                : ''
            }
            <div class="form-grid">
              <label>
                <span>Written N/A rationale (cannot be used just to raise score)</span>
                <input type="text" name="not_applicable_reason" value="${esc(assessment.not_applicable_reason)}" maxlength="1000" />
              </label>
              <label>
                <span>Scope excluded</span>
                <input type="text" name="not_applicable_scope" value="${esc(assessment.not_applicable_scope)}" maxlength="500" />
              </label>
            </div>
          </fieldset>

          <fieldset class="evidence-link-box">
            <legend>Linked evidence records (${assessment.evidence_ids.length} selected)</legend>
            ${
              evidencePickerHtml ||
              '<p class="muted">No evidence records exist yet. Add one in the right panel or Evidence Library.</p>'
            }
          </fieldset>

          <div id="ctrl-form-error" class="callout callout-danger" hidden role="alert"></div>

          <div class="btn-row ctrl-actions-bar">
            <button type="submit" class="btn btn-primary">Save Control Assessment</button>
            <button type="button" class="btn btn-secondary" data-action="create-finding">Save This as a Finding</button>
            <div class="spacer"></div>
            ${prevCtrl ? `<button type="button" class="btn btn-outline" data-select-control="${esc(prevCtrl.control_id)}">← ${esc(prevCtrl.control_id)}</button>` : ''}
            ${nextCtrl ? `<button type="button" class="btn btn-outline" data-select-control="${esc(nextCtrl.control_id)}">${esc(nextCtrl.control_id)} →</button>` : ''}
          </div>
        </form>
      </section>

      <aside class="guided-right" aria-label="Evidence guidance, templates, and glossary">
        <div class="card">
          <h2>What evidence looks like</h2>
          <p><strong>Required artifact:</strong> ${esc(control.required_evidence)}</p>
          <p class="muted" style="margin-top:6px"><strong>Suggested owner:</strong> ${esc(control.suggested_owner)} · <strong>Freshness cycle:</strong> ~${control.recommended_review_days} days</p>
          <div class="btn-row" style="margin-top:10px">
            <button type="button" class="btn btn-sm btn-outline" data-download-template="${esc(template.key)}">Download Blank ${esc(template.label)} CSV</button>
          </div>
          <div class="compare-stack" style="margin-top:12px">
            <details class="compare-card compare-good" open>
              <summary><strong>Show a good example (Score 2)</strong></summary>
              <p>${esc(control.acceptable_evidence)}</p>
            </details>
            <details class="compare-card compare-weak" open>
              <summary><strong>Show insufficient evidence</strong></summary>
              <p>${esc(control.insufficient_evidence)}</p>
            </details>
          </div>
        </div>

        <div class="card" style="margin-top:14px">
          <h3>Quick-log evidence for ${esc(control.control_id)}</h3>
          <form id="quick-evidence-form" class="compact-form">
            <label>
              <span>Artifact title *</span>
              <input type="text" name="ev_title" required placeholder="e.g., Q4 Portal MFA Export (Redacted)" maxlength="200" />
            </label>
            <label>
              <span>Evidence origin</span>
              <select name="ev_origin">
                <option value="system_generated">System-generated export</option>
                <option value="sampled_test">Sampled / controlled test</option>
                <option value="contract">Contract / vendor clause</option>
                <option value="screenshot">Redacted config screenshot</option>
                <option value="policy">Written policy</option>
                <option value="vendor_statement">Vendor statement</option>
                <option value="interview">Staff interview</option>
              </select>
            </label>
            <label>
              <span>Review status</span>
              <select name="ev_status">
                <option value="reviewed">Reviewed</option>
                <option value="verified">Verified</option>
                <option value="received">Received (not yet reviewed)</option>
                <option value="requested">Requested</option>
              </select>
            </label>
            <label>
              <span>Safe internal reference (no public secret URLs)</span>
              <input type="text" name="ev_ref" placeholder="internal/audit-folder/artifact-ref" maxlength="300" />
            </label>
            <button type="submit" class="btn btn-sm btn-secondary">Add &amp; Link Evidence</button>
          </form>
        </div>

        <div class="card" style="margin-top:14px">
          <h3>What to do next</h3>
          <p>${esc(control.what_to_do_next)}</p>
        </div>

        <div class="card" style="margin-top:14px">
          <h3>What does this term mean?</h3>
          <div class="glossary-list">${glossaryHtml}</div>
        </div>
      </aside>
    </div>
  `;
}

export function bindGuidedAuditEvents(container: HTMLElement, store: Store): void {
  const doc = store.get().doc;
  if (!doc) return;
  const control = CONTROL_MAP.get(store.get().selectedControlId) || CATALOG.controls[0];
  const domain = DOMAIN_MAP.get(control.domain_id) || CATALOG.domains[0];

  container.querySelectorAll<HTMLButtonElement>('[data-select-control]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cid = btn.dataset.selectControl || 'DATA-01';
      const target = CONTROL_MAP.get(cid);
      store.navigate('audit', { controlId: cid, domainId: target?.domain_id || 'DATA' });
    });
  });

  container.querySelectorAll<HTMLButtonElement>('[data-download-template]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tpl = getTemplateByKey(btn.dataset.downloadTemplate || 'data_inventory');
      triggerDownload(tpl.filename, tpl.content, 'text/csv;charset=utf-8');
      store.setStatus(`Downloaded blank template ${tpl.filename}.`, 'ok');
    });
  });

  const form = container.querySelector<HTMLFormElement>('#control-assessment-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const errBox = container.querySelector<HTMLElement>('#ctrl-form-error');
    const fd = new FormData(form);
    const choice = String(fd.get('score_choice') || 'not_assessed');
    const selectedEvidenceIds = fd.getAll('evidence_id').map(String);
    const selfAttest = fd.get('self_attestation_claim') === 'on';

    const candidate = {
      ...ensureControlAssessment(doc, control.control_id),
      status: (choice === 'not_assessed' ? 'not_assessed' : choice === 'not_applicable' ? 'not_applicable' : 'assessed') as
        | 'not_assessed'
        | 'assessed'
        | 'not_applicable',
      score: (choice === '0' ? 0 : choice === '1' ? 1 : choice === '2' ? 2 : null) as 0 | 1 | 2 | null,
      priority_override:
        control.priority !== 'Critical' && String(fd.get('priority_override') || '') === 'Critical'
          ? ('Critical' as const)
          : null,
      assessment_notes: String(fd.get('assessment_notes') || '').trim(),
      evidence_ids: selectedEvidenceIds,
      review_method: String(fd.get('review_method') || '').trim(),
      reviewer_role: String(fd.get('reviewer_role') || '').trim(),
      review_date: String(fd.get('review_date') || '').trim(),
      last_test_date: String(fd.get('last_test_date') || '').trim(),
      next_review_date: String(fd.get('next_review_date') || '').trim(),
      not_applicable_reason: String(fd.get('not_applicable_reason') || '').trim(),
      not_applicable_scope: String(fd.get('not_applicable_scope') || '').trim(),
      self_attestation_claim: selfAttest
    };

    // Enforce Proof Rule strictly on Score 2
    if (candidate.status === 'assessed' && candidate.score === 2) {
      if (selfAttest) {
        if (errBox) {
          errBox.hidden = false;
          errBox.textContent =
            'Self-attestation cannot earn Score 2 (Verified). Uncheck self-attestation only after direct verification, or record Score 1 (Partial / self-attested).';
        }
        return;
      }
      const check = checkProofRuleForScoreTwo(candidate, doc.evidence);
      if (!check.allowed) {
        if (errBox) {
          errBox.hidden = false;
          errBox.textContent = `Score 2 blocked by Proof Rule: ${check.reasons.join(' ')}`;
        }
        return;
      }
    }

    // Enforce N/A documentation rule
    if (candidate.status === 'not_applicable') {
      const na = validateNotApplicable(candidate);
      if (!na.valid) {
        if (errBox) {
          errBox.hidden = false;
          errBox.textContent = `Not Applicable (N/A) requires: ${na.reasons.join(' ')}`;
        }
        return;
      }
    }

    if (errBox) errBox.hidden = true;
    store.updateDoc((draft) => {
      draft.assessments[control.control_id] = candidate;
      if (draft.assessment_status === 'draft') draft.assessment_status = 'in_progress';
    }, `Saved assessment for ${control.control_id}.`);
  });

  // Quick-add & link evidence
  const evForm = container.querySelector<HTMLFormElement>('#quick-evidence-form');
  evForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(evForm);
    const title = String(fd.get('ev_title') || '').trim();
    if (!title) return;
    store.updateDoc((draft) => {
      const prefix = `EV-${control.domain_id}`;
      const newEvId = nextId(prefix, draft.evidence.map((x) => x.evidence_id));
      const today = todayISO();
      const status = String(fd.get('ev_status') || 'reviewed') as 'reviewed' | 'verified' | 'received' | 'requested';
      draft.evidence.push({
        evidence_id: newEvId,
        title,
        artifact_type: 'Control Verification Artifact',
        linked_controls: [control.control_id],
        linked_systems: [],
        artifact_date: today,
        period_covered: draft.organization_profile.primary_cycle || 'Current Cycle',
        produced_by: draft.organization_profile.auditor_role || control.suggested_owner,
        storage_reference: String(fd.get('ev_ref') || '').trim() || `internal/evidence/${newEvId} (reference only)`,
        evidence_origin: String(fd.get('ev_origin') || 'system_generated') as
          | 'system_generated'
          | 'sampled_test'
          | 'contract'
          | 'screenshot'
          | 'policy'
          | 'vendor_statement'
          | 'interview',
        review_method: status === 'reviewed' || status === 'verified' ? 'observed_configuration' : 'not_reviewed',
        reviewer_role: draft.organization_profile.auditor_role || control.suggested_owner,
        review_date: status === 'reviewed' || status === 'verified' ? today : '',
        scope_sampling: 'Scoped to current scholarship cycle',
        result: status === 'reviewed' || status === 'verified' ? 'supports' : 'pending',
        review_status: status,
        exceptions: '',
        data_sensitivity: 'Internal',
        freshness_days: control.recommended_review_days,
        next_review_date: '',
        redaction_status: 'metadata_only',
        optional_hash: ''
      });
      const current = ensureControlAssessment(draft, control.control_id);
      if (!current.evidence_ids.includes(newEvId)) current.evidence_ids.push(newEvId);
      if (!current.review_date && (status === 'reviewed' || status === 'verified')) current.review_date = today;
      if (!current.review_method && (status === 'reviewed' || status === 'verified')) {
        current.review_method = 'observed_configuration';
      }
      draft.assessments[control.control_id] = current;
    }, `Added and linked new evidence artifact to ${control.control_id}.`);
  });

  // Save this control as a finding
  container.querySelector('[data-action="create-finding"]')?.addEventListener('click', () => {
    const a = ensureControlAssessment(doc, control.control_id);
    const pri = effectivePriority(control, a);
    store.updateDoc((draft) => {
      const fid = nextId('F', draft.findings.map((x) => x.finding_id));
      draft.findings.push({
        finding_id: fid,
        control_id: control.control_id,
        affected_process_system: domain.name,
        title: `${control.control_id}: ${control.title} — remediation required`,
        description: a.assessment_notes || control.plain_language_question,
        evidence_observation: a.evidence_ids.length
          ? `Linked evidence: ${a.evidence_ids.join(', ')}`
          : 'No verified evidence linked yet.',
        evidence_ids: [...a.evidence_ids],
        impact: control.why_it_matters,
        likelihood_rationale: 'Identified during self-assessment review.',
        severity: pri === 'Critical' ? 'Immediate / Critical' : 'High',
        severity_override_rationale: '',
        existing_mitigations: '',
        proposed_action: control.what_to_do_next,
        owner_role: control.suggested_owner,
        target_date: '',
        horizon: pri === 'Critical' ? '30-Day' : '60-Day',
        dependencies: '',
        cost_effort_band: 'Low',
        verification_steps: control.verification_steps,
        residual_risk: 'Open pending verification',
        approval_signoff: '',
        status: 'Open',
        acceptance_rationale: '',
        acceptance_review_date: ''
      });
      const cur = ensureControlAssessment(draft, control.control_id);
      cur.finding_ids.push(fid);
      draft.assessments[control.control_id] = cur;
    }, `Created finding for ${control.control_id}. Open Findings & Actions to assign due date and details.`);
  });
}
