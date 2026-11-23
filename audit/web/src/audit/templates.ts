export interface TemplateFile {
  key: string;
  label: string;
  filename: string;
  description: string;
  content: string;
}

export const EVIDENCE_TEMPLATES: readonly TemplateFile[] = [
  {
    key: 'data_inventory',
    label: 'Data Inventory (18 columns)',
    filename: 'ssat-data-inventory-template.csv',
    description: 'Blank DATA-01 scholarship lifecycle inventory spreadsheet.',
    content:
      'asset_id,process_stage,system_name,business_owner_role,technical_owner_role,data_categories,sensitivity,data_origin,purpose,authorized_roles,systems_receiving_copies,storage_location,retention_trigger,retention_rule,disposal_method,control_evidence,last_verified,known_gaps\n' +
      'INV-001,Intake,,Program Director,IT Lead,,Confidential,,,,,Vendor cloud (confirm region),Cycle close,Pending approved schedule — Requires Counsel/Authorized Review,,,,\n'
  },
  {
    key: 'mfa_coverage',
    label: 'MFA & Access Coverage Matrix',
    filename: 'ssat-mfa-coverage-template.csv',
    description: 'Redacted account coverage template for IAM-01 / IAM-02 / IAM-03.',
    content:
      'system,role_group,number_of_active_accounts,mfa_enforced,mfa_method_or_policy,exceptions,last_reviewed,reviewer_role,supporting_config_reference\n' +
      'Scholarship Portal,Administrators,0,Yes/No,Phishing-resistant FIDO2 / Authenticator app / SMS,0,YYYY-MM-DD,IT Lead,Redacted config screenshot reference\n'
  },
  {
    key: 'vendor_register',
    label: 'Vendor & Subprocessor Register',
    filename: 'ssat-vendor-register-template.csv',
    description: 'Accountable vendor, subprocessor, export, and renewal register.',
    content:
      'vendor,service,business_owner,data_categories,admin_identity_method,subprocessors,linked_apps,contract_reference,data_export_format,data_deletion_terms,incident_notice_term,security_assurance_review_date,next_renewal,exit_owner,known_issues\n' +
      'Example Vendor,Scholarship Portal,Program Director,Applications; essays,SSO + MFA,Confirm subprocessor list,Email; CRM,Contract ref only,CSV / JSON / PDF,Confirm written deletion SLA,Confirm incident notice SLA,YYYY-MM-DD,YYYY-MM-DD,Program Director,\n'
  },
  {
    key: 'backup_restore',
    label: 'Backup Restore Test Log',
    filename: 'ssat-backup-restore-log-template.csv',
    description: 'Sanitized controlled restore verification log for CONT-02.',
    content:
      'test_id,system,backup_date,test_date,restore_target,authorized_tester_role,scope,time_to_restore,integrity_checks,exceptions,result,followup_owner_role\n' +
      'RST-001,Scholarship Portal,YYYY-MM-DD,YYYY-MM-DD,Isolated nonproduction sandbox,IT Lead,Synthetic cycle records & attachments,00h 45m,Record counts + checksum sample + openability,None,Pass/Partial/Fail,IT Lead\n'
  },
  {
    key: 'reconciliation',
    label: 'Award-to-Disbursement Reconciliation',
    filename: 'ssat-reconciliation-template.csv',
    description: 'Approved award batch to bank disbursement variance sheet for FIN-03.',
    content:
      'batch_id,cycle,approved_award_count,approved_total_usd,disbursed_count,disbursed_total_usd,returned_or_rejected,variance_usd,variance_explanation,preparer_role,independent_reviewer_role,signoff_date\n' +
      'BATCH-EXAMPLE-01,Fall Example Cycle,0,0.00,0,0.00,0,0.00,Synthetic template row,Finance Officer,Executive Director,YYYY-MM-DD\n'
  }
];
