import type { AuditDocument } from '../types';
import { decryptSsatToAudit, encryptAuditToSsat } from '../crypto/ssat';

const STORAGE_KEY = 'ssat_encrypted_local_copy_v1';

export function hasLocalEncryptedCopy(): boolean {
  try {
    return Boolean(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return false;
  }
}

export async function saveLocalEncryptedCopy(doc: AuditDocument, passphrase: string): Promise<void> {
  const envelope = await encryptAuditToSsat(doc, passphrase);
  try {
    window.localStorage.setItem(STORAGE_KEY, envelope);
  } catch {
    throw new Error('Browser storage quota exceeded or disabled. Export an encrypted .ssat file instead.');
  }
}

export async function loadLocalEncryptedCopy(passphrase: string): Promise<{ document: AuditDocument; warnings: string[] }> {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    throw new Error('Browser storage is unavailable.');
  }
  if (!raw) {
    throw new Error('No encrypted local copy is stored in this browser.');
  }
  return decryptSsatToAudit(raw, passphrase);
}

export function clearLocalEncryptedCopy(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage restriction
  }
}
