import type { AuditDocument, ControlAssessment } from '../types';
import { CATALOG } from './catalog';
import { nowISO } from '../a11y/helpers';

export const MAX_AUDIT_JSON_BYTES = 10 * 1024 * 1024; // 10 MiB hard limit
export const SUPPORTED_SCHEMA_VERSION = '1.0.0';

export function createEmptyAudit(orgName = ''): AuditDocument {
  const now = nowISO();
  const id = `audit-${Math.random().toString(36).slice(2, 10)}`;
  return {
    schema_version: SUPPORTED_SCHEMA_VERSION,
    audit_id: id,
    catalog_version: CATALOG.catalog_version,
    is_demo: false,
    created_at: now,
    updated_at: now,
    assessment_status: 'draft',
    organization_profile: {
      display_name: orgName,
      organization_type: '',
      size_band: '',
      primary_cycle: '',
      geography: '',
      auditor_role: '',
      legal_context_flag: 'Requires Counsel / Authorized Review',
      legal_notes: ''
    },
    scope: {
      scholarship_stages: ['Application intake', 'Committee review', 'Award approval & notifications', 'Disbursement & reconciliation'],
      data_categories: [],
      audit_boundaries: '',
      obligations: [],
      exclusions: '',
      unknowns: ''
    },
    systems: [],
    inventory: [],
    assessments: {},
    evidence: [],
    simulations: [],
    findings: [],
    actions: [],
    snapshots: []
  };
}

export function ensureControlAssessment(doc: AuditDocument, controlId: string): ControlAssessment {
  const existing = doc.assessments[controlId];
  if (existing) return existing;
  return {
    control_id: controlId,
    status: 'not_assessed',
    score: null,
    priority_override: null,
    assessment_notes: '',
    evidence_ids: [],
    review_method: '',
    reviewer_role: doc.organization_profile.auditor_role || '',
    review_date: '',
    last_test_date: '',
    next_review_date: '',
    not_applicable_reason: '',
    not_applicable_scope: '',
    self_attestation_claim: false,
    finding_ids: [],
    test_ids: []
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  document?: AuditDocument;
}

export function validateAndMigrateAudit(raw: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { valid: false, errors: ['Audit payload must be a JSON object.'], warnings };
  }

  const obj = raw as Record<string, unknown>;

  if (typeof obj.schema_version !== 'string') {
    errors.push('Missing or invalid schema_version.');
  } else if (obj.schema_version === '1.0.0-draft') {
    warnings.push('Migrated legacy 1.0.0-draft snapshot to schema_version 1.0.0 without altering recorded control scores.');
    obj.schema_version = SUPPORTED_SCHEMA_VERSION;
  } else if (obj.schema_version !== SUPPORTED_SCHEMA_VERSION) {
    errors.push(
      `Unsupported schema_version "${obj.schema_version}". This edition supports schema_version ${SUPPORTED_SCHEMA_VERSION}.`
    );
  }

  if (typeof obj.audit_id !== 'string' || !obj.audit_id.trim() || obj.audit_id.length > 120) {
    errors.push('Missing or invalid audit_id.');
  }

  if (typeof obj.catalog_version !== 'string' || !obj.catalog_version.trim()) {
    warnings.push(`Missing catalog_version; defaulting reference to ${CATALOG.catalog_version}.`);
    obj.catalog_version = CATALOG.catalog_version;
  } else if (obj.catalog_version !== CATALOG.catalog_version) {
    warnings.push(
      `Audit was created under catalog version ${obj.catalog_version} (current app catalog is ${CATALOG.catalog_version}). Original recorded scores are preserved without silent modification.`
    );
  }

  const arrayBounds: Array<[string, number]> = [
    ['systems', 200],
    ['inventory', 500],
    ['evidence', 500],
    ['simulations', 200],
    ['findings', 500],
    ['actions', 500],
    ['snapshots', 100]
  ];

  for (const [field, max] of arrayBounds) {
    if (obj[field] === undefined) {
      obj[field] = [];
    } else if (!Array.isArray(obj[field])) {
      errors.push(`Field "${field}" must be an array.`);
    } else if ((obj[field] as unknown[]).length > max) {
      errors.push(`Field "${field}" exceeds maximum allowed items (${max}).`);
    }
  }

  if (!obj.organization_profile || typeof obj.organization_profile !== 'object') {
    errors.push('Missing organization_profile object.');
  }

  if (!obj.scope || typeof obj.scope !== 'object') {
    errors.push('Missing scope object.');
  }

  if (obj.assessments === undefined) {
    obj.assessments = {};
  } else if (typeof obj.assessments !== 'object' || Array.isArray(obj.assessments) || obj.assessments === null) {
    errors.push('Field "assessments" must be a map keyed by control_id.');
  } else {
    const assessments = obj.assessments as Record<string, Record<string, unknown>>;
    for (const [cid, entry] of Object.entries(assessments)) {
      if (!entry || typeof entry !== 'object') {
        errors.push(`Assessment entry "${cid}" must be an object.`);
        continue;
      }
      if (entry.score !== null && entry.score !== undefined && ![0, 1, 2].includes(entry.score as number)) {
        errors.push(`Assessment "${cid}" has invalid score value.`);
      }
      if (entry.status && !['not_assessed', 'assessed', 'not_applicable'].includes(String(entry.status))) {
        errors.push(`Assessment "${cid}" has invalid status.`);
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  // Normalize missing optional subfields safely without mutating scores
  const base = createEmptyAudit();
  const profile = obj.organization_profile as Record<string, unknown>;
  const scope = obj.scope as Record<string, unknown>;

  const normalized: AuditDocument = {
    schema_version: SUPPORTED_SCHEMA_VERSION,
    audit_id: String(obj.audit_id),
    catalog_version: String(obj.catalog_version),
    is_demo: Boolean(obj.is_demo),
    created_at: typeof obj.created_at === 'string' ? obj.created_at : base.created_at,
    updated_at: typeof obj.updated_at === 'string' ? obj.updated_at : base.updated_at,
    assessment_status:
      obj.assessment_status === 'draft' ||
      obj.assessment_status === 'in_progress' ||
      obj.assessment_status === 'under_review' ||
      obj.assessment_status === 'cycle_complete'
        ? obj.assessment_status
        : 'in_progress',
    organization_profile: {
      ...base.organization_profile,
      ...profile
    } as AuditDocument['organization_profile'],
    scope: {
      ...base.scope,
      ...scope,
      scholarship_stages: Array.isArray(scope.scholarship_stages) ? scope.scholarship_stages.map(String) : [],
      data_categories: Array.isArray(scope.data_categories) ? scope.data_categories.map(String) : [],
      obligations: Array.isArray(scope.obligations) ? scope.obligations.map(String) : []
    },
    systems: obj.systems as AuditDocument['systems'],
    inventory: obj.inventory as AuditDocument['inventory'],
    assessments: obj.assessments as AuditDocument['assessments'],
    evidence: obj.evidence as AuditDocument['evidence'],
    simulations: obj.simulations as AuditDocument['simulations'],
    findings: obj.findings as AuditDocument['findings'],
    actions: obj.actions as AuditDocument['actions'],
    snapshots: obj.snapshots as AuditDocument['snapshots']
  };

  return { valid: true, errors: [], warnings, document: normalized };
}
