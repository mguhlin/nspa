import rawCatalog from '../../../catalog/controls.v1.json';
import type { ControlCatalog, ControlDefinition, DomainDefinition, SimulationDefinition } from '../types';
import { EVIDENCE_TEMPLATES, type TemplateFile } from './templates';

export { EVIDENCE_TEMPLATES, type TemplateFile };

export const CATALOG: ControlCatalog = rawCatalog as ControlCatalog;

export const CONTROL_MAP: ReadonlyMap<string, ControlDefinition> = new Map(
  CATALOG.controls.map((c) => [c.control_id, c])
);

export const DOMAIN_MAP: ReadonlyMap<string, DomainDefinition> = new Map(
  CATALOG.domains.map((d) => [d.domain_id, d])
);

export const SIMULATION_MAP: ReadonlyMap<string, SimulationDefinition> = new Map(
  CATALOG.simulations.map((s) => [s.simulation_key, s])
);

export function getTemplateByKey(key: string): TemplateFile {
  return EVIDENCE_TEMPLATES.find((t) => t.key === key) || EVIDENCE_TEMPLATES[0];
}

export function getControlsForDomain(domainId: string): ControlDefinition[] {
  return CATALOG.controls.filter((c) => c.domain_id === domainId);
}
