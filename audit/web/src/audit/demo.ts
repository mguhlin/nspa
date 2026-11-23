import rawDemo from '../../../fixtures/demo_organization.json';
import type { AuditDocument } from '../types';

export function loadDemoAudit(): AuditDocument {
  return JSON.parse(JSON.stringify(rawDemo)) as AuditDocument;
}
