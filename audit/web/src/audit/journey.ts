import type { Store } from './state';
import { ensureControlAssessment } from './validation';
import { effectivePriority } from './scoring';
import { nextId } from '../a11y/helpers';
import { CATALOG } from './catalog';
import type { AuditDocument } from '../types';

// A starting conversation, never a substitute for the full 30-question assessment.
export const STARTER_CHECKS = [
  { id: 'IAM-01', title: 'Protect your accounts', question: 'Do staff and reviewers need a second sign-in check, such as an authenticator app, for accounts that access sensitive information?', help: 'Ask the person who manages your email and scholarship portal. A password alone is one sign-in check.', action: 'Ask your account administrator to check and enforce multi-factor authentication for sensitive accounts.' },
  { id: 'CONT-02', title: 'Recover your records', question: 'Has someone restored a backup and checked that the scholarship records can actually be used?', help: 'A “backup successful” email does not show that recovery works. Ask for a record of a restore test.', action: 'Arrange a safe restore test with your technology support person and record what worked.' },
  { id: 'FIN-01', title: 'Check payment changes', question: 'Before changing payment details, do you contact the recipient using a phone number or contact method you already trust?', help: 'Use the number already in your records. A number supplied in the change request could belong to a scammer.', action: 'Require an independent callback and approval before changing payment instructions.' },
  { id: 'DATA-01', title: 'Know where information goes', question: 'Can your team list where applicant information is collected, shared, stored, backed up, and eventually deleted?', help: 'Start with your portal, email, shared drives, spreadsheets, and vendors. List types of information; do not enter applicant records.', action: 'List the places applicant information goes and assign someone to confirm each part of its lifecycle.' },
  { id: 'RESP-02', title: 'Know whom to call', question: 'If a suspected breach or major outage happened today, would staff know whom to contact and who can make decisions?', help: 'Keep a primary and backup contact, with a way to reach them if your usual email is unavailable.', action: 'Confirm primary and backup incident contacts and who can authorize urgent decisions.' }
] as const;

export function starterProgress(doc: AuditDocument): number {
  return STARTER_CHECKS.filter(c => doc.assessments[c.id]?.status !== 'not_assessed' && doc.assessments[c.id]).length;
}

export function actionCandidates(doc: AuditDocument) {
  return CATALOG.controls.filter(c => {
    const a = doc.assessments[c.control_id];
    return a?.status === 'assessed' && (a.score === 0 || a.score === 1) && !doc.findings.some(f => f.control_id === c.control_id);
  }).sort((a, b) => (a.priority === 'Critical' ? 0 : 1) - (b.priority === 'Critical' ? 0 : 1));
}

export function createSuggestedActions(store: Store): void {
  const doc = store.get().doc;
  if (!doc) return;
  const candidates = actionCandidates(doc);
  if (!candidates.length) { store.navigate('findings'); return; }
  store.updateDoc(draft => {
    for (const c of candidates) {
      const fid = nextId('F', draft.findings.map(f => f.finding_id));
      const assessment = ensureControlAssessment(draft, c.control_id);
      assessment.finding_ids.push(fid);
      const priority = effectivePriority(c, assessment);
      const severity = priority === 'Critical' && assessment.score === 0 ? 'Immediate / Critical' : priority === 'Critical' || assessment.score === 0 ? 'High' : 'Medium';
      draft.findings.push({ finding_id: fid, control_id: c.control_id,
        title: c.title, severity, severity_override_rationale: '', affected_process_system: c.domain_id, description: draft.assessments[c.control_id]?.assessment_notes || c.plain_language_question, evidence_observation: 'Answer indicates a gap or incomplete verification. Confirm with the team.', evidence_ids: [...assessment.evidence_ids], impact: c.why_it_matters, likelihood_rationale: 'Suggested priority; confirm with the team.', existing_mitigations: '',
        proposed_action: STARTER_CHECKS.find(s => s.id === c.control_id)?.action || c.what_to_do_next,
        owner_role: '', target_date: '', horizon: severity === 'Immediate / Critical' ? 'Immediate' : severity === 'High' ? '30-Day' : '60-Day', cost_effort_band: 'Unknown',
        dependencies: '', verification_steps: c.verification_steps, residual_risk: 'Open pending verification', approval_signoff: '', status: 'Open', acceptance_rationale: '', acceptance_review_date: '' });
    }
  }, 'Suggested actions created. Confirm the priorities, assign owners, and choose deadlines.');
  store.navigate('findings');
}
