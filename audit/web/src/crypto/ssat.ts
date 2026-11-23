import { argon2idAsync } from '@noble/hashes/argon2.js';
import type { AuditDocument } from '../types';
import { MAX_AUDIT_JSON_BYTES, validateAndMigrateAudit } from '../audit/validation';

export const SSAT_FORMAT = 'ssat-encrypted-v1';
export const SSAT_VERSION = 1;
export const SSAT_KDF = 'argon2id';
export const SSAT_CIPHER = 'aes-256-gcm';

export interface SsatKdfParams {
  t: number;
  m: number;
  p: number;
  dkLen: number;
}

export interface SsatEncryptedEnvelope {
  format: typeof SSAT_FORMAT;
  version: typeof SSAT_VERSION;
  kdf: typeof SSAT_KDF;
  kdf_params: SsatKdfParams;
  cipher: typeof SSAT_CIPHER;
  salt_b64: string;
  nonce_b64: string;
  ciphertext_b64: string;
}

export const DEFAULT_KDF_PARAMS: Readonly<SsatKdfParams> = {
  t: 3,
  m: 32768, // 32 MiB — balanced for ordinary & lower-power devices, ~0.8s in JS
  p: 1,
  dkLen: 32
};

// Strict KDF bounds prevent both silent weakening AND resource-exhaustion DoS
export const KDF_BOUNDS = {
  minT: 2,
  maxT: 10,
  minM: 16384, // 16 MiB
  maxM: 131072, // 128 MiB
  minP: 1,
  maxP: 4,
  dkLen: 32,
  saltBytes: 16,
  nonceBytes: 12,
  minPassphraseLength: 10
} as const;

export const MAX_SSAT_ENVELOPE_BYTES = 14 * 1024 * 1024; // allows base64 overhead over 10 MiB JSON

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  if (typeof b64 !== 'string' || !/^[A-Za-z0-9+/]*={0,2}$/.test(b64) || b64.length % 4 !== 0) {
    throw new Error('Malformed base64 encoding in encrypted audit file.');
  }
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

function getSubtle(): SubtleCrypto {
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    return globalThis.crypto.subtle;
  }
  throw new Error('Web Crypto API is unavailable in this environment.');
}

function randomBytes(len: number): Uint8Array {
  const buf = new Uint8Array(len);
  globalThis.crypto.getRandomValues(buf);
  return buf;
}

/**
 * Canonical AAD string identical across TypeScript and Go implementations.
 */
export function buildCanonicalAad(env: {
  format: string;
  version: number;
  kdf: string;
  kdf_params: SsatKdfParams;
  cipher: string;
  salt_b64: string;
  nonce_b64: string;
}): Uint8Array {
  const s = [
    env.format,
    `v=${env.version}`,
    `kdf=${env.kdf}`,
    `t=${env.kdf_params.t}`,
    `m=${env.kdf_params.m}`,
    `p=${env.kdf_params.p}`,
    `dkLen=${env.kdf_params.dkLen}`,
    `cipher=${env.cipher}`,
    `salt=${env.salt_b64}`,
    `nonce=${env.nonce_b64}`
  ].join('|');
  return new TextEncoder().encode(s);
}

export function validateKdfParams(params: unknown): SsatKdfParams {
  if (!params || typeof params !== 'object') {
    throw new Error('Missing KDF parameters in .ssat header.');
  }
  const p = params as Record<string, unknown>;
  const t = Number(p.t);
  const m = Number(p.m);
  const par = Number(p.p);
  const dkLen = Number(p.dkLen);

  if (!Number.isInteger(t) || t < KDF_BOUNDS.minT || t > KDF_BOUNDS.maxT) {
    throw new Error(`Unsupported Argon2id time cost (must be ${KDF_BOUNDS.minT}..${KDF_BOUNDS.maxT}).`);
  }
  if (!Number.isInteger(m) || m < KDF_BOUNDS.minM || m > KDF_BOUNDS.maxM) {
    throw new Error(`Unsupported Argon2id memory parameter (must be ${KDF_BOUNDS.minM}..${KDF_BOUNDS.maxM} KiB).`);
  }
  if (!Number.isInteger(par) || par < KDF_BOUNDS.minP || par > KDF_BOUNDS.maxP) {
    throw new Error(`Unsupported Argon2id parallelism parameter (must be ${KDF_BOUNDS.minP}..${KDF_BOUNDS.maxP}).`);
  }
  if (!Number.isInteger(dkLen) || dkLen !== KDF_BOUNDS.dkLen) {
    throw new Error('Unsupported Argon2id key length.');
  }
  return { t, m, p: par, dkLen };
}

export async function encryptAuditToSsat(
  doc: AuditDocument,
  passphrase: string,
  kdfParams: SsatKdfParams = DEFAULT_KDF_PARAMS
): Promise<string> {
  if (!passphrase || passphrase.length < KDF_BOUNDS.minPassphraseLength) {
    throw new Error(`Passphrase must be at least ${KDF_BOUNDS.minPassphraseLength} characters.`);
  }
  const checkedParams = validateKdfParams(kdfParams);
  const plaintext = new TextEncoder().encode(JSON.stringify(doc));
  if (plaintext.byteLength > MAX_AUDIT_JSON_BYTES) {
    throw new Error('Audit payload exceeds maximum allowed size (10 MiB).');
  }

  const salt = randomBytes(KDF_BOUNDS.saltBytes);
  const nonce = randomBytes(KDF_BOUNDS.nonceBytes);
  const salt_b64 = toBase64(salt);
  const nonce_b64 = toBase64(nonce);

  const keyBytes = await argon2idAsync(new TextEncoder().encode(passphrase), salt, {
    t: checkedParams.t,
    m: checkedParams.m,
    p: checkedParams.p,
    dkLen: checkedParams.dkLen
  });

  const aad = buildCanonicalAad({
    format: SSAT_FORMAT,
    version: SSAT_VERSION,
    kdf: SSAT_KDF,
    kdf_params: checkedParams,
    cipher: SSAT_CIPHER,
    salt_b64,
    nonce_b64
  });

  const subtle = getSubtle();
  const keyCopy = new Uint8Array(keyBytes);
  const nonceCopy = new Uint8Array(nonce);
  const aadCopy = new Uint8Array(aad);
  const ptCopy = new Uint8Array(plaintext);

  const cryptoKey = await subtle.importKey('raw', keyCopy, { name: 'AES-GCM' }, false, ['encrypt']);
  const encrypted = await subtle.encrypt(
    { name: 'AES-GCM', iv: nonceCopy, additionalData: aadCopy, tagLength: 128 },
    cryptoKey,
    ptCopy
  );
  // Best-effort clear of derived key buffer
  keyBytes.fill(0);
  keyCopy.fill(0);

  const envelope: SsatEncryptedEnvelope = {
    format: SSAT_FORMAT,
    version: SSAT_VERSION,
    kdf: SSAT_KDF,
    kdf_params: checkedParams,
    cipher: SSAT_CIPHER,
    salt_b64,
    nonce_b64,
    ciphertext_b64: toBase64(new Uint8Array(encrypted))
  };

  return JSON.stringify(envelope, null, 2);
}

export interface DecryptResult {
  document: AuditDocument;
  warnings: string[];
}

export async function decryptSsatToAudit(rawText: string, passphrase: string): Promise<DecryptResult> {
  if (!passphrase) {
    throw new Error('Enter the passphrase to unlock this audit file.');
  }
  const rawBytes = new TextEncoder().encode(rawText).byteLength;
  if (rawBytes > MAX_SSAT_ENVELOPE_BYTES) {
    throw new Error('Encrypted audit file exceeds maximum allowed size.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error('This file is not a valid .ssat encrypted audit bundle.');
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Invalid .ssat envelope structure.');
  }

  const env = parsed as Record<string, unknown>;
  if (env.format !== SSAT_FORMAT || env.version !== SSAT_VERSION) {
    throw new Error('Unsupported .ssat file format or version. No silent fallback is permitted.');
  }
  if (env.kdf !== SSAT_KDF) {
    throw new Error('Unsupported key-derivation algorithm in .ssat file.');
  }
  if (env.cipher !== SSAT_CIPHER) {
    throw new Error('Unsupported cipher in .ssat file.');
  }

  const kdfParams = validateKdfParams(env.kdf_params);
  if (
    typeof env.salt_b64 !== 'string' ||
    typeof env.nonce_b64 !== 'string' ||
    typeof env.ciphertext_b64 !== 'string'
  ) {
    throw new Error('Missing cryptographic fields in .ssat file.');
  }

  const salt = fromBase64(env.salt_b64);
  const nonce = fromBase64(env.nonce_b64);
  const ciphertext = fromBase64(env.ciphertext_b64);

  if (salt.byteLength !== KDF_BOUNDS.saltBytes) {
    throw new Error('Invalid salt length in .ssat file.');
  }
  if (nonce.byteLength !== KDF_BOUNDS.nonceBytes) {
    throw new Error('Invalid nonce length in .ssat file.');
  }
  if (ciphertext.byteLength < 17) {
    throw new Error('Encrypted payload is truncated or corrupted.');
  }

  const aad = buildCanonicalAad({
    format: SSAT_FORMAT,
    version: SSAT_VERSION,
    kdf: SSAT_KDF,
    kdf_params: kdfParams,
    cipher: SSAT_CIPHER,
    salt_b64: env.salt_b64,
    nonce_b64: env.nonce_b64
  });

  const keyBytes = await argon2idAsync(new TextEncoder().encode(passphrase), salt, {
    t: kdfParams.t,
    m: kdfParams.m,
    p: kdfParams.p,
    dkLen: kdfParams.dkLen
  });

  const subtle = getSubtle();
  const keyCopy = new Uint8Array(keyBytes);
  const nonceCopy = new Uint8Array(nonce);
  const aadCopy = new Uint8Array(aad);
  const ctCopy = new Uint8Array(ciphertext);

  let decryptedBuf: ArrayBuffer;
  try {
    const cryptoKey = await subtle.importKey('raw', keyCopy, { name: 'AES-GCM' }, false, ['decrypt']);
    decryptedBuf = await subtle.decrypt(
      { name: 'AES-GCM', iv: nonceCopy, additionalData: aadCopy, tagLength: 128 },
      cryptoKey,
      ctCopy
    );
  } catch {
    throw new Error('Unable to decrypt .ssat file. Check your passphrase or verify the file was not modified or corrupted.');
  } finally {
    keyBytes.fill(0);
    keyCopy.fill(0);
  }

  if (decryptedBuf.byteLength > MAX_AUDIT_JSON_BYTES) {
    throw new Error('Decrypted audit exceeds maximum allowed size.');
  }

  let jsonPayload: unknown;
  try {
    jsonPayload = JSON.parse(new TextDecoder().decode(decryptedBuf));
  } catch {
    throw new Error('Decrypted audit content is not valid JSON.');
  }

  const validation = validateAndMigrateAudit(jsonPayload);
  if (!validation.valid || !validation.document) {
    throw new Error(`Audit schema validation failed: ${validation.errors.join(' ')}`);
  }

  return {
    document: validation.document,
    warnings: validation.warnings
  };
}
