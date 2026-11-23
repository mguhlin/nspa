import type { AuditDocument } from '../types';
import { CATALOG, CONTROL_MAP } from './catalog';
import { effectivePriority } from './scoring';

export type MatrixLevel = 'High' | 'Medium' | 'Low';
export type MatrixBand = 'Critical' | 'High' | 'Medium' | 'Low';

export interface RiskMatrixItem {
  id: string;
  control_id: string;
  title: string;
  source: 'finding' | 'control';
  likelihood: MatrixLevel;
  impact: MatrixLevel;
  band: MatrixBand;
  owner: string;
}

export interface RiskMatrixCell {
  likelihood: MatrixLevel;
  impact: MatrixLevel;
  band: MatrixBand;
  items: RiskMatrixItem[];
}

export const MATRIX_LEVELS_DESC: readonly MatrixLevel[] = ['High', 'Medium', 'Low'];
export const MATRIX_LEVELS_ASC: readonly MatrixLevel[] = ['Low', 'Medium', 'High'];

export function cellRiskBand(likelihood: MatrixLevel, impact: MatrixLevel): MatrixBand {
  if (likelihood === 'High' && impact === 'High') return 'Critical';
  if ((likelihood === 'High' && impact === 'Medium') || (likelihood === 'Medium' && impact === 'High')) return 'High';
  if (likelihood === 'Low' && impact === 'Low') return 'Low';
  if ((likelihood === 'Low' && impact === 'Medium') || (likelihood === 'Medium' && impact === 'Low')) return 'Low';
  return 'Medium';
}

/**
 * Deterministic Likelihood x Impact mapping from open findings and unmitigated Score 0/1 controls.
 * Used as an internal planning visual — never as a fabricated numeric probability.
 */
export function buildRiskMatrix(doc: AuditDocument): {
  cells: RiskMatrixCell[];
  totalItems: number;
  getCell: (likelihood: MatrixLevel, impact: MatrixLevel) => RiskMatrixCell;
} {
  const map = new Map<string, RiskMatrixCell>();
  const cells: RiskMatrixCell[] = [];

  for (const likelihood of MATRIX_LEVELS_DESC) {
    for (const impact of MATRIX_LEVELS_ASC) {
      const cell: RiskMatrixCell = {
        likelihood,
        impact,
        band: cellRiskBand(likelihood, impact),
        items: []
      };
      map.set(`${likelihood}:${impact}`, cell);
      cells.push(cell);
    }
  }

  const coveredControlIds = new Set<string>();

  // Plot all open findings
  for (const f of doc.findings) {
    if (f.status === 'Verified Closed' || f.status === 'Accepted by Authorized Owner') continue;
    coveredControlIds.add(f.control_id);
    const ctrl = CONTROL_MAP.get(f.control_id);
    const a = doc.assessments[f.control_id];
    const pri = ctrl ? effectivePriority(ctrl, a) : 'High';

    let impact: MatrixLevel = 'Medium';
    if (f.severity === 'Immediate / Critical' || pri === 'Critical') impact = 'High';
    else if (f.severity === 'Low / Improvement') impact = 'Low';

    let likelihood: MatrixLevel = 'Medium';
    if (f.severity === 'Immediate / Critical' || a?.score === 0) likelihood = 'High';
    else if (f.severity === 'Low / Improvement' || f.severity === 'Medium') likelihood = 'Low';

    const cell = map.get(`${likelihood}:${impact}`);
    if (cell) {
      cell.items.push({
        id: f.finding_id,
        control_id: f.control_id,
        title: f.title,
        source: 'finding',
        likelihood,
        impact,
        band: cell.band,
        owner: f.owner_role || ctrl?.suggested_owner || 'Unassigned'
      });
    }
  }

  // Also plot any assessed Score 0 or Score 1 control that doesn't yet have an open finding
  for (const ctrl of CATALOG.controls) {
    if (coveredControlIds.has(ctrl.control_id)) continue;
    const a = doc.assessments[ctrl.control_id];
    if (!a || a.status !== 'assessed' || (a.score !== 0 && a.score !== 1)) continue;
    const pri = effectivePriority(ctrl, a);
    const impact: MatrixLevel = pri === 'Critical' ? 'High' : 'Medium';
    const likelihood: MatrixLevel = a.score === 0 ? 'High' : 'Medium';
    const cell = map.get(`${likelihood}:${impact}`);
    if (cell) {
      cell.items.push({
        id: ctrl.control_id,
        control_id: ctrl.control_id,
        title: `${ctrl.title} (Score ${a.score})`,
        source: 'control',
        likelihood,
        impact,
        band: cell.band,
        owner: ctrl.suggested_owner
      });
    }
  }

  const totalItems = cells.reduce((acc, c) => acc + c.items.length, 0);
  return {
    cells,
    totalItems,
    getCell: (l, i) => map.get(`${l}:${i}`)!
  };
}
