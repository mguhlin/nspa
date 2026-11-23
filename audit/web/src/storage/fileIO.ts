import type { AuditDocument } from '../types';
import { decryptSsatToAudit, encryptAuditToSsat } from '../crypto/ssat';
import { triggerDownload } from '../a11y/helpers';

export interface GoSessionInfo {
  mode: 'go-local';
  csrf_token: string;
  version: string;
  default_dir: string;
}

export async function detectGoServer(): Promise<GoSessionInfo | null> {
  try {
    const res = await fetch('./api/session', {
      method: 'GET',
      credentials: 'same-origin',
      headers: { Accept: 'application/json' }
    });
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) return null;
    const data = (await res.json()) as Partial<GoSessionInfo>;
    if (data.mode === 'go-local' && typeof data.csrf_token === 'string') {
      return {
        mode: 'go-local',
        csrf_token: data.csrf_token,
        version: data.version || '1.0.0',
        default_dir: data.default_dir || ''
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveAuditBrowser(doc: AuditDocument, passphrase: string): Promise<string> {
  const encrypted = await encryptAuditToSsat(doc, passphrase);
  const safeSlug = (doc.organization_profile.display_name || doc.audit_id || 'scholarship-audit')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'scholarship-audit';
  const filename = `${safeSlug}.ssat`;
  triggerDownload(filename, encrypted, 'application/octet-stream');
  return filename;
}

export async function saveAuditGoLocal(
  doc: AuditDocument,
  passphrase: string,
  filename: string,
  csrfToken: string
): Promise<string> {
  const encrypted = await encryptAuditToSsat(doc, passphrase);
  const res = await fetch('./api/save', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-SSAT-CSRF': csrfToken
    },
    body: JSON.stringify({
      filename,
      encrypted_ssat: encrypted
    })
  });
  const body = (await res.json().catch(() => ({}))) as { error?: string; saved_path?: string };
  if (!res.ok) {
    throw new Error(body.error || 'Failed to save encrypted audit via local Go server.');
  }
  return body.saved_path || filename;
}

export async function openAuditGoLocal(
  filename: string,
  passphrase: string,
  csrfToken: string
): Promise<{ document: AuditDocument; warnings: string[]; path: string }> {
  const res = await fetch('./api/open', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-SSAT-CSRF': csrfToken
    },
    body: JSON.stringify({ filename })
  });
  const body = (await res.json().catch(() => ({}))) as { error?: string; encrypted_ssat?: string; path?: string };
  if (!res.ok || !body.encrypted_ssat) {
    throw new Error(body.error || 'Failed to read encrypted audit file from local Go server.');
  }
  const result = await decryptSsatToAudit(body.encrypted_ssat, passphrase);
  return { ...result, path: body.path || filename };
}

export async function listGoAuditFiles(csrfToken: string): Promise<string[]> {
  const res = await fetch('./api/files', {
    method: 'GET',
    credentials: 'same-origin',
    headers: { 'X-SSAT-CSRF': csrfToken }
  });
  if (!res.ok) return [];
  const body = (await res.json().catch(() => ({}))) as { files?: string[] };
  return Array.isArray(body.files) ? body.files : [];
}

export async function shutdownGoServer(csrfToken: string): Promise<void> {
  const res = await fetch('./api/shutdown', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'X-SSAT-CSRF': csrfToken }
  });
  if (!res.ok) {
    throw new Error('Could not stop local Go server.');
  }
}
