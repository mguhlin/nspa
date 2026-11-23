import type {
  AuditDocument,
  ControlAssessment,
  ControlDefinition,
  EvidenceRecord,
  Priority
} from '../types';
import { CATALOG } from './catalog';

export interface ProofRuleCheck {
  allowed: boolean;
  reasons: string[];
  qualifyingEvidenceIds: string[];
}

export interface NAValidationCheck {
  valid: boolean;
  reasons: string[];
}

export interface DomainMetrics {
  domain_id: string;
  name: string;
  default_priority: Priority;
  total_controls: number;
  applicable_controls: number;
  assessed_controls: number;
  not_assessed_controls: number;
  na_controls: number;
  score_0: number;
  score_1: number;
  score_2: number;
  critical_gaps: number;
  readiness_percent: number | null;
  coverage_percent: number;
  is_provisional: boolean;
}

export interface DashboardMetrics {
  total_controls: number;
  applicable_controls: number;
  assessed_controls: number;
  not_assessed_controls: number;
  na_controls: number;
  score_0: number;
  score_1: number;
  score_2: number;
  score_sum: number;
  readiness_percent: number | null;
  coverage_percent: number;
  is_provisional: boolean;
  critical_gaps: number;
  critical_gap_control_ids: string[];
  stale_evidence_count: number;
  stale_evidence_ids: string[];
  open_high_critical_findings: number;
  total_open_findings: number;
  domains: DomainMetrics[];
}

/**
 * Effective priority: organizations may raise a control to Critical,
 * but cannot silently lower a Critical control.
 */
export function effectivePriority(control: ControlDefinition, assessment?: ControlAssessment): Priority {
  if (control.priority === 'Critical') return 'Critical';
  if (assessment?.priority_override === 'Critical') return 'Critical';
  return control.priority;
}

/**
 * Determine whether an evidence record is stale based on its explicit status,
 * next_review_date, or artifact_date + freshness_days.
 */
export function isEvidenceStale(ev: EvidenceRecord, referenceDate = new Date()): boolean {
  if (ev.review_status === 'stale') return true;
  if (ev.next_review_date) {
    const nextD = Date.parse(ev.next_review_date);
    if (!Number.isNaN(nextD) && nextD < referenceDate.getTime()) {
      return true;
    }
  }
  if (ev.artifact_date && ev.freshness_days > 0) {
    const artD = Date.parse(ev.artifact_date);
    if (!Number.isNaN(artD)) {
      const ageDays = (referenceDate.getTime() - artD) / (1000 * 60 * 60 * 24);
      if (ageDays > ev.freshness_days) return true;
    }
  }
  return false;
}

/**
 * Proof rule (Plan Section 4.2):
 * Score 2 ("Verified and tested") requires:
 *  - at least one linked evidence artifact whose review_status is 'reviewed' or 'verified',
 *    and whose result is 'supports' (not 'contradicts' or 'not_relevant'), and is not stale;
 *  - a suitable review_method (not empty / not 'not_reviewed');
 *  - a recorded review_date.
 * A policy alone does not prove operational practice unless verified by observation/test/sampling.
 */
export function checkProofRuleForScoreTwo(
  assessment: ControlAssessment,
  evidenceList: EvidenceRecord[],
  referenceDate = new Date()
): ProofRuleCheck {
  const reasons: string[] = [];
  const evidenceMap = new Map(evidenceList.map((e) => [e.evidence_id, e]));
  const linked = (assessment.evidence_ids || [])
    .map((id) => evidenceMap.get(id))
    .filter((e): e is EvidenceRecord => Boolean(e));

  const qualifying = linked.filter((e) => {
    const goodStatus = e.review_status === 'reviewed' || e.review_status === 'verified';
    const goodResult = e.result === 'supports' || e.result === 'partially_supports';
    const notStale = !isEvidenceStale(e, referenceDate);
    return goodStatus && goodResult && notStale;
  });

  if (qualifying.length === 0) {
    reasons.push(
      'Link at least one current, non-stale evidence record marked "Reviewed" or "Verified" that supports this control.'
    );
  }

  const method = (assessment.review_method || '').trim();
  if (!method || method === 'not_reviewed') {
    reasons.push('Record a verification method (inspected document, observed configuration, sampled transactions, or controlled test).');
  }

  if (!(assessment.review_date || '').trim()) {
    reasons.push('Record the review/verification date.');
  }

  if (qualifying.length > 0 && qualifying.every((e) => e.evidence_origin === 'policy' || e.evidence_origin === 'vendor_statement')) {
    if (method === 'inspected_document') {
      reasons.push(
        'A policy or vendor statement alone proves intent, not live operation. Add a dated system artifact, configuration observation, transaction sample, or controlled test.'
      );
    }
  }

  return {
    allowed: reasons.length === 0,
    reasons,
    qualifyingEvidenceIds: qualifying.map((e) => e.evidence_id)
  };
}

/**
 * N/A rule (Plan Section 4.2):
 * Requires a written reason, scope, reviewer role, and date.
 */
export function validateNotApplicable(assessment: ControlAssessment): NAValidationCheck {
  const reasons: string[] = [];
  if (!assessment.not_applicable_reason.trim()) reasons.push('Written rationale explaining why the control is not applicable.');
  if (!assessment.not_applicable_scope.trim()) reasons.push('Explicit scope excluded from this control.');
  if (!assessment.reviewer_role.trim()) reasons.push('Reviewer name or role approving N/A.');
  if (!assessment.review_date.trim()) reasons.push('Approval date.');
  return { valid: reasons.length === 0, reasons };
}

export function roundOne(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Exact Section 4.2 Dashboard math.
 */
export function computeMetrics(doc: AuditDocument, referenceDate = new Date()): DashboardMetrics {
  const staleEvidence = doc.evidence.filter((e) => isEvidenceStale(e, referenceDate));
  const openFindings = doc.findings.filter(
    (f) => f.status !== 'Verified Closed' && f.status !== 'Accepted by Authorized Owner'
  );
  const openHighCritical = openFindings.filter(
    (f) => f.severity === 'Immediate / Critical' || f.severity === 'High'
  );

  let totalAssessed = 0;
  let totalNA = 0;
  let totalScoreSum = 0;
  let score0 = 0;
  let score1 = 0;
  let score2 = 0;
  const criticalGapIds: string[] = [];

  const domainMetrics: DomainMetrics[] = CATALOG.domains.map((domain) => {
    const controls = CATALOG.controls.filter((c) => c.domain_id === domain.domain_id);
    let dAssessed = 0;
    let dNA = 0;
    let dSum = 0;
    let d0 = 0;
    let d1 = 0;
    let d2 = 0;
    let dCritGaps = 0;

    for (const ctrl of controls) {
      const a = doc.assessments[ctrl.control_id];
      const pri = effectivePriority(ctrl, a);
      if (a && a.status === 'not_applicable' && validateNotApplicable(a).valid) {
        dNA += 1;
      } else if (a && a.status === 'assessed' && (a.score === 0 || a.score === 1 || a.score === 2)) {
        dAssessed += 1;
        dSum += a.score;
        if (a.score === 0) d0 += 1;
        if (a.score === 1) d1 += 1;
        if (a.score === 2) d2 += 1;
        if (pri === 'Critical' && (a.score === 0 || a.score === 1)) {
          dCritGaps += 1;
          criticalGapIds.push(ctrl.control_id);
        }
      }
    }

    const dTotal = controls.length;
    const dApplicable = dTotal - dNA;
    const dNotAssessed = dApplicable - dAssessed;
    const dReadiness = dAssessed > 0 ? roundOne((dSum / (2 * dAssessed)) * 100) : null;
    const dCoverage = dApplicable > 0 ? roundOne((dAssessed / dApplicable) * 100) : 0;

    totalAssessed += dAssessed;
    totalNA += dNA;
    totalScoreSum += dSum;
    score0 += d0;
    score1 += d1;
    score2 += d2;

    return {
      domain_id: domain.domain_id,
      name: domain.name,
      default_priority: domain.default_priority,
      total_controls: dTotal,
      applicable_controls: dApplicable,
      assessed_controls: dAssessed,
      not_assessed_controls: dNotAssessed,
      na_controls: dNA,
      score_0: d0,
      score_1: d1,
      score_2: d2,
      critical_gaps: dCritGaps,
      readiness_percent: dReadiness,
      coverage_percent: dCoverage,
      is_provisional: dAssessed < dApplicable
    };
  });

  const totalControls = CATALOG.controls.length;
  const applicableControls = totalControls - totalNA;
  const notAssessedControls = applicableControls - totalAssessed;
  const readinessPercent =
    totalAssessed > 0 ? roundOne((totalScoreSum / (2 * totalAssessed)) * 100) : null;
  const coveragePercent =
    applicableControls > 0 ? roundOne((totalAssessed / applicableControls) * 100) : 0;

  return {
    total_controls: totalControls,
    applicable_controls: applicableControls,
    assessed_controls: totalAssessed,
    not_assessed_controls: notAssessedControls,
    na_controls: totalNA,
    score_0: score0,
    score_1: score1,
    score_2: score2,
    score_sum: totalScoreSum,
    readiness_percent: readinessPercent,
    coverage_percent: coveragePercent,
    is_provisional: totalAssessed < applicableControls,
    critical_gaps: criticalGapIds.length,
    critical_gap_control_ids: criticalGapIds,
    stale_evidence_count: staleEvidence.length,
    stale_evidence_ids: staleEvidence.map((e) => e.evidence_id),
    open_high_critical_findings: openHighCritical.length,
    total_open_findings: openFindings.length,
    domains: domainMetrics
  };
}

export function scoreLabel(status: ControlAssessment['status'] | undefined, score: ControlAssessment['score'] | undefined): string {
  if (status === 'not_applicable') return 'N/A (Approved)';
  if (status !== 'assessed' || score === null || score === undefined) return 'Not assessed';
  if (score === 0) return '0 — Not in place / verified failure';
  if (score === 1) return '1 — Partial / unverified';
  return '2 — Verified and tested';
}

export function scoreShortBadge(status: ControlAssessment['status'] | undefined, score: ControlAssessment['score'] | undefined): {
  text: string;
  tone: 'neutral' | 'danger' | 'warn' | 'ok';
} {
  if (status === 'not_applicable') return { text: 'N/A', tone: 'neutral' };
  if (status !== 'assessed' || score === null || score === undefined) return { text: 'Unassessed', tone: 'neutral' };
  if (score === 0) return { text: 'Score 0 · Fail', tone: 'danger' };
  if (score === 1) return { text: 'Score 1 · Partial', tone: 'warn' };
  return { text: 'Score 2 · Verified', tone: 'ok' };
}
