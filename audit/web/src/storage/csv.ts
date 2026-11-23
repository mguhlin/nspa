import type { InventoryItem, Sensitivity } from '../types';

export const MAX_CSV_BYTES = 2 * 1024 * 1024; // 2 MiB
export const MAX_CSV_ROWS = 500;

export const INVENTORY_COLUMNS: readonly (keyof InventoryItem)[] = [
  'asset_id',
  'process_stage',
  'system_name',
  'business_owner_role',
  'technical_owner_role',
  'data_categories',
  'sensitivity',
  'data_origin',
  'purpose',
  'authorized_roles',
  'systems_receiving_copies',
  'storage_location',
  'retention_trigger',
  'retention_rule',
  'disposal_method',
  'control_evidence',
  'last_verified',
  'known_gaps'
];

/**
 * Neutralize CSV formula injection (Test T-09).
 * Any cell beginning with =, +, -, @, tab, or carriage return (even after leading spaces)
 * is prefixed with a single quote so spreadsheet tools treat it as literal text.
 */
export function sanitizeCsvCell(value: unknown): string {
  const raw = value === null || value === undefined ? '' : String(value);
  const trimmedStart = raw.replace(/^[\u0000-\u0020]+/, '');
  const firstChar = trimmedStart.charAt(0);
  const rawFirst = raw.charAt(0);
  const needsNeutralization =
    rawFirst === '=' ||
    rawFirst === '+' ||
    rawFirst === '-' ||
    rawFirst === '@' ||
    rawFirst === '\t' ||
    rawFirst === '\r' ||
    firstChar === '=' ||
    firstChar === '+' ||
    firstChar === '-' ||
    firstChar === '@';
  const safe = needsNeutralization ? `'${raw}` : raw;
  if (/[",\r\n]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export function buildSafeCsv(headers: readonly string[], rows: ReadonlyArray<ReadonlyArray<unknown>>): string {
  const lines = [headers.map((h) => sanitizeCsvCell(h)).join(',')];
  for (const row of rows) {
    lines.push(row.map((cell) => sanitizeCsvCell(cell)).join(','));
  }
  return lines.join('\r\n') + '\r\n';
}

export function parseCsvText(raw: string): string[][] {
  if (new TextEncoder().encode(raw).byteLength > MAX_CSV_BYTES) {
    throw new Error('CSV file exceeds maximum allowed size (2 MiB).');
  }
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  const text = raw.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\r') {
      if (text[i + 1] === '\n') i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      if (rows.length > MAX_CSV_ROWS + 1) {
        throw new Error(`CSV exceeds maximum allowed row count (${MAX_CSV_ROWS}).`);
      }
    } else if (ch === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      if (rows.length > MAX_CSV_ROWS + 1) {
        throw new Error(`CSV exceeds maximum allowed row count (${MAX_CSV_ROWS}).`);
      }
    } else {
      cell += ch;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

export interface CsvInventoryPreview {
  headers: string[];
  items: InventoryItem[];
  piiWarnings: string[];
  skippedRows: number;
}

const SSN_PATTERN = /\b\d{3}-\d{2}-\d{4}\b/;
const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
const CARD_OR_ACCT_PATTERN = /\b\d{13,19}\b/;

function normalizeSensitivity(v: string): Sensitivity {
  const low = v.trim().toLowerCase();
  if (low === 'public') return 'Public';
  if (low === 'internal') return 'Internal';
  if (low === 'confidential') return 'Confidential';
  if (low === 'restricted') return 'Restricted';
  return 'Unknown';
}

export function previewInventoryCsv(raw: string): CsvInventoryPreview {
  const rows = parseCsvText(raw);
  if (rows.length < 2) {
    throw new Error('CSV must include a header row and at least one inventory row.');
  }
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const colIndex = new Map<string, number>();
  headers.forEach((h, idx) => colIndex.set(h, idx));

  if (!colIndex.has('system_name') && !colIndex.has('asset_id')) {
    throw new Error('CSV header must include at least "asset_id" or "system_name".');
  }

  const piiWarnings: string[] = [];
  const items: InventoryItem[] = [];
  let skippedRows = 0;

  for (let r = 1; r < rows.length; r += 1) {
    const cells = rows[r];
    const lineJoined = cells.join(' ');
    if (SSN_PATTERN.test(lineJoined)) {
      piiWarnings.push(`Row ${r + 1} appears to contain an SSN-like pattern (###-##-####). Remove raw PII before importing.`);
    }
    if (EMAIL_PATTERN.test(lineJoined)) {
      piiWarnings.push(`Row ${r + 1} contains an email address. Use role names instead of personal emails.`);
    }
    if (CARD_OR_ACCT_PATTERN.test(lineJoined)) {
      piiWarnings.push(`Row ${r + 1} contains a long numeric sequence resembling an account or card number.`);
    }

    const pick = (key: keyof InventoryItem): string => {
      const idx = colIndex.get(key);
      return idx !== undefined && cells[idx] !== undefined ? cells[idx].trim().slice(0, 500) : '';
    };

    const sys = pick('system_name');
    const aid = pick('asset_id') || `INV-${String(items.length + 1).padStart(3, '0')}`;
    if (!sys && !pick('process_stage')) {
      skippedRows += 1;
      continue;
    }

    items.push({
      asset_id: aid,
      process_stage: pick('process_stage') || 'Unknown',
      system_name: sys || 'Unnamed System',
      business_owner_role: pick('business_owner_role'),
      technical_owner_role: pick('technical_owner_role'),
      data_categories: pick('data_categories'),
      sensitivity: normalizeSensitivity(pick('sensitivity')),
      data_origin: pick('data_origin'),
      purpose: pick('purpose'),
      authorized_roles: pick('authorized_roles'),
      systems_receiving_copies: pick('systems_receiving_copies'),
      storage_location: pick('storage_location'),
      retention_trigger: pick('retention_trigger'),
      retention_rule: pick('retention_rule'),
      disposal_method: pick('disposal_method'),
      control_evidence: pick('control_evidence'),
      last_verified: pick('last_verified'),
      known_gaps: pick('known_gaps')
    });
  }

  return { headers, items, piiWarnings, skippedRows };
}

export function exportInventoryToCsv(items: InventoryItem[]): string {
  return buildSafeCsv(
    INVENTORY_COLUMNS,
    items.map((item) => INVENTORY_COLUMNS.map((col) => item[col] ?? ''))
  );
}
