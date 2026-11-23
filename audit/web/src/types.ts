export type Priority = 'Critical' | 'High';
export type SystemCriticality = 'Critical' | 'High' | 'Medium' | 'Low' | 'Unknown';
export type Sensitivity = 'Public' | 'Internal' | 'Confidential' | 'Restricted' | 'Unknown';
export type EvidenceSensitivity = 'Public' | 'Internal' | 'Confidential' | 'Restricted';
export type AssessmentStatus = 'not_assessed' | 'assessed' | 'not_applicable';
export type ControlScore = 0 | 1 | 2 | null;
export type AuditLifecycleStatus = 'draft' | 'in_progress' | 'under_review' | 'cycle_complete';

export type EvidenceOrigin =
  | 'system_generated'
  | 'sampled_test'
  | 'contract'
  | 'vendor_statement'
  | 'screenshot'
  | 'policy'
  | 'interview';

export type ReviewMethod =
  | 'inspected_document'
  | 'observed_configuration'
  | 'sampled_transactions'
  | 'executed_controlled_test'
  | 'not_reviewed';

export type EvidenceResult = 'supports' | 'partially_supports' | 'contradicts' | 'not_relevant' | 'pending';

export type EvidenceReviewStatus =
  | 'not_requested'
  | 'requested'
  | 'received'
  | 'reviewed'
  | 'verified'
  | 'rejected'
  | 'stale';

export type RedactionStatus = 'metadata_only' | 'redacted_excerpt' | 'approved_reference';
export type SimulationOutcome = 'not_run' | 'pass' | 'partial' | 'fail';
export type FindingSeverity = 'Immediate / Critical' | 'High' | 'Medium' | 'Low / Improvement';
export type PlanHorizon = 'Immediate' | '30-Day' | '60-Day' | '90-Day';
export type CostEffortBand = 'Low' | 'Moderate' | 'High' | 'Unknown';
export type FindingStatus =
  | 'Open'
  | 'Planned'
  | 'In Progress'
  | 'Implemented / Pending Verification'
  | 'Verified Closed'
  | 'Accepted by Authorized Owner';

export interface DomainDefinition {
  domain_id: string;
  name: string;
  core_question: string;
  default_priority: Priority;
  nist_csf_functions: string[];
}

export interface ControlDefinition {
  control_id: string;
  domain_id: string;
  title: string;
  plain_language_question: string;
  why_it_matters: string;
  scholarship_example: string;
  required_evidence: string;
  acceptable_evidence: string;
  insufficient_evidence: string;
  verification_steps: string;
  expected_result: string;
  suggested_owner: string;
  priority: Priority;
  nist_csf_tags: string[];
  recommended_review_days: number;
  template_key: string;
  what_to_do_next: string;
}

export interface SimulationDefinition {
  simulation_key: string;
  title: string;
  linked_control_ids: string[];
  purpose: string;
  prerequisites: string[];
  fictional_dataset: string;
  role_checklist: string[];
  steps: string[];
  expected_result: string;
  artifacts_to_create: string[];
}

export interface OnboardingLesson {
  id: string;
  domain_id: string;
  title: string;
  good_example: string;
  weak_example: string;
  why_score: string;
}

export interface GlossaryEntry {
  term: string;
  plain_definition: string;
}

export interface ControlCatalog {
  catalog_version: string;
  title: string;
  disclaimer: string;
  domains: DomainDefinition[];
  controls: ControlDefinition[];
  simulations: SimulationDefinition[];
  onboarding_lessons: OnboardingLesson[];
  glossary: GlossaryEntry[];
}

export interface OrganizationProfile {
  display_name: string;
  organization_type: string;
  size_band: string;
  primary_cycle: string;
  geography: string;
  auditor_role: string;
  legal_context_flag: string;
  legal_notes: string;
}

export interface AuditScope {
  scholarship_stages: string[];
  data_categories: string[];
  audit_boundaries: string;
  obligations: string[];
  exclusions: string;
  unknowns: string;
}

export interface SystemRecord {
  system_id: string;
  name: string;
  processes: string[];
  owner_role: string;
  vendor_or_host: string;
  data_categories: string[];
  criticality: SystemCriticality;
  notes: string;
}

export interface InventoryItem {
  asset_id: string;
  process_stage: string;
  system_name: string;
  business_owner_role: string;
  technical_owner_role: string;
  data_categories: string;
  sensitivity: Sensitivity;
  data_origin: string;
  purpose: string;
  authorized_roles: string;
  systems_receiving_copies: string;
  storage_location: string;
  retention_trigger: string;
  retention_rule: string;
  disposal_method: string;
  control_evidence: string;
  last_verified: string;
  known_gaps: string;
}

export interface ControlAssessment {
  control_id: string;
  status: AssessmentStatus;
  score: ControlScore;
  priority_override: Priority | null;
  assessment_notes: string;
  evidence_ids: string[];
  review_method: string;
  reviewer_role: string;
  review_date: string;
  last_test_date: string;
  next_review_date: string;
  not_applicable_reason: string;
  not_applicable_scope: string;
  self_attestation_claim: boolean;
  finding_ids: string[];
  test_ids: string[];
}

export interface EvidenceRecord {
  evidence_id: string;
  title: string;
  artifact_type: string;
  linked_controls: string[];
  linked_systems: string[];
  artifact_date: string;
  period_covered: string;
  produced_by: string;
  storage_reference: string;
  evidence_origin: EvidenceOrigin;
  review_method: ReviewMethod;
  reviewer_role: string;
  review_date: string;
  scope_sampling: string;
  result: EvidenceResult;
  review_status: EvidenceReviewStatus;
  exceptions: string;
  data_sensitivity: EvidenceSensitivity;
  freshness_days: number;
  next_review_date: string;
  redaction_status: RedactionStatus;
  optional_hash: string;
}

export interface TestRun {
  test_id: string;
  simulation_key: string;
  linked_control_ids: string[];
  scenario: string;
  authorized_by_role: string;
  test_environment: string;
  synthetic_data_used: string;
  date: string;
  steps_completed: string[];
  actual_observation: string;
  expected_result: string;
  pass_partial_fail: SimulationOutcome;
  evidence_id: string;
  limitations: string;
  owner: string;
  retest_date: string;
}

export interface FindingRecord {
  finding_id: string;
  control_id: string;
  affected_process_system: string;
  title: string;
  description: string;
  evidence_observation: string;
  evidence_ids: string[];
  impact: string;
  likelihood_rationale: string;
  severity: FindingSeverity;
  severity_override_rationale: string;
  existing_mitigations: string;
  proposed_action: string;
  owner_role: string;
  target_date: string;
  horizon: PlanHorizon;
  dependencies: string;
  cost_effort_band: CostEffortBand;
  verification_steps: string;
  residual_risk: string;
  approval_signoff: string;
  status: FindingStatus;
  acceptance_rationale: string;
  acceptance_review_date: string;
}

export interface ActionRecord {
  action_id: string;
  finding_id: string;
  action: string;
  owner_role: string;
  due_date: string;
  verification_step: string;
  status: FindingStatus;
  test_reference: string;
}

export interface SnapshotSummary {
  assessed_controls: number;
  applicable_controls: number;
  readiness_percent: number | null;
  coverage_percent: number;
  critical_gaps: number;
  open_high_critical_findings: number;
  stale_evidence_count: number;
}

export interface AuditSnapshot {
  snapshot_id: string;
  label: string;
  cycle_name: string;
  captured_at: string;
  change_note: string;
  schema_version: string;
  catalog_version: string;
  summary: SnapshotSummary;
  control_scores: Record<string, ControlScore | 'NA'>;
  evidence_refs: string[];
  vendor_names: string[];
}

export interface AuditDocument {
  schema_version: '1.0.0';
  audit_id: string;
  catalog_version: string;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
  assessment_status: AuditLifecycleStatus;
  organization_profile: OrganizationProfile;
  scope: AuditScope;
  systems: SystemRecord[];
  inventory: InventoryItem[];
  assessments: Record<string, ControlAssessment>;
  evidence: EvidenceRecord[];
  simulations: TestRun[];
  findings: FindingRecord[];
  actions: ActionRecord[];
  snapshots: AuditSnapshot[];
}

export type SaveTruthState =
  | 'memory_only'
  | 'encrypted_local_synced'
  | 'export_needed'
  | 'file_saved';

export type ScreenId =
  | 'roadmap'
  | 'quick'
  | 'welcome'
  | 'profile'
  | 'dashboard'
  | 'audit'
  | 'evidence'
  | 'inventory'
  | 'simulations'
  | 'findings'
  | 'reports'
  | 'history'
  | 'settings';
