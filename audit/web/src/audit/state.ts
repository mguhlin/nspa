import type { AuditDocument, AuditSnapshot, SaveTruthState, ScreenId } from '../types';
import { STARTER_CHECKS } from './journey';
import { createEmptyAudit } from './validation';
import { loadDemoAudit } from './demo';
import { computeMetrics, isEvidenceStale } from './scoring';
import { nowISO, todayISO } from '../a11y/helpers';

export interface AppState {
  screen: ScreenId;
  selectedControlId: string;
  selectedDomainId: string;
  doc: AuditDocument | null;
  locked: boolean;
  dirty: boolean;
  saveTruth: SaveTruthState;
  lastSavedAt: string | null;
  lastSavedPath: string | null;
  autosaveEnabled: boolean;
  autosavePassphrase: string | null; // memory-only while autosave active; cleared on lock/clear
  undoStack: AuditDocument[];
  statusMessage: string;
  statusTone: 'info' | 'ok' | 'warn' | 'danger';
  goServerMode: boolean;
  goCsrfToken: string | null;
  goVersion: string | null;
}

const MAX_UNDO = 30;

export class Store {
  private state: AppState;
  private listeners = new Set<() => void>();

  constructor() {
    this.state = {
      screen: 'welcome',
      selectedControlId: 'DATA-01',
      selectedDomainId: 'DATA',
      doc: null,
      locked: false,
      dirty: false,
      saveTruth: 'memory_only',
      lastSavedAt: null,
      lastSavedPath: null,
      autosaveEnabled: false,
      autosavePassphrase: null,
      undoStack: [],
      statusMessage: '',
      statusTone: 'info',
      goServerMode: false,
      goCsrfToken: null,
      goVersion: null
    };
  }

  get(): AppState {
    return this.state;
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(): void {
    for (const fn of this.listeners) fn();
  }

  setGoRuntime(enabled: boolean, csrfToken: string | null, version: string | null): void {
    this.state = {
      ...this.state,
      goServerMode: enabled,
      goCsrfToken: csrfToken,
      goVersion: version
    };
    this.emit();
  }

  setStatus(message: string, tone: AppState['statusTone'] = 'info'): void {
    this.state = { ...this.state, statusMessage: message, statusTone: tone };
    this.emit();
  }

  navigate(screen: ScreenId, opts?: { controlId?: string; domainId?: string }): void {
    this.state = {
      ...this.state,
      screen,
      selectedControlId: opts?.controlId ?? (screen === 'quick' ? STARTER_CHECKS.find(c => !this.state.doc?.assessments[c.id] || this.state.doc.assessments[c.id].status === 'not_assessed')?.id || STARTER_CHECKS[0].id : this.state.selectedControlId),
      selectedDomainId: opts?.domainId ?? this.state.selectedDomainId
    };
    this.emit();
  }

  ensureActiveAuditAndNavigate(screen: ScreenId): void {
    if (this.state.doc) {
      this.navigate(screen);
      return;
    }
    const doc = createEmptyAudit('');
    this.state = {
      ...this.state,
      doc,
      locked: false,
      dirty: false,
      saveTruth: 'memory_only',
      lastSavedAt: null,
      lastSavedPath: null,
      undoStack: [],
      screen,
      selectedControlId: screen === 'quick' ? STARTER_CHECKS[0].id : this.state.selectedControlId,
      statusMessage:
        'Your work stays on this device. Use Save audit to keep an encrypted copy.',
      statusTone: 'info'
    };
    this.emit();
  }

  startNewAudit(orgName = ''): void {
    const doc = createEmptyAudit(orgName);
    this.state = {
      ...this.state,
      doc,
      locked: false,
      dirty: false,
      saveTruth: 'memory_only',
      lastSavedAt: null,
      lastSavedPath: null,
      undoStack: [],
      screen: 'profile',
      statusMessage: 'Your audit is ready. Start with a name and your role, then return to the roadmap. Save an encrypted file to keep your work.',
      statusTone: 'info'
    };
    this.emit();
  }

  startDemoAudit(): void {
    const doc = loadDemoAudit();
    this.state = {
      ...this.state,
      doc,
      locked: false,
      dirty: false,
      saveTruth: 'memory_only',
      lastSavedAt: null,
      lastSavedPath: null,
      undoStack: [],
      screen: 'roadmap',
      statusMessage: 'Loaded fictional Practice Audit (Example Scholarship Foundation — FICTIONAL).',
      statusTone: 'info'
    };
    this.emit();
  }

  openLoadedAudit(doc: AuditDocument, pathLabel: string | null, warnings: string[] = []): void {
    const warnText = warnings.length > 0 ? ` Notice: ${warnings.join(' ')}` : '';
    this.state = {
      ...this.state,
      doc,
      locked: false,
      dirty: false,
      saveTruth: pathLabel ? 'file_saved' : 'memory_only',
      lastSavedAt: nowISO(),
      lastSavedPath: pathLabel,
      undoStack: [],
      screen: 'roadmap',
      statusMessage: `Unlocked encrypted audit for "${doc.organization_profile.display_name || doc.audit_id}".${warnText}`,
      statusTone: warnings.length > 0 ? 'warn' : 'ok'
    };
    this.emit();
  }

  updateDoc(mutator: (draft: AuditDocument) => void, label?: string): void {
    if (!this.state.doc) return;
    const prevSnapshot = JSON.parse(JSON.stringify(this.state.doc)) as AuditDocument;
    const nextDoc = JSON.parse(JSON.stringify(this.state.doc)) as AuditDocument;
    mutator(nextDoc);
    nextDoc.updated_at = nowISO();
    const nextUndo = [...this.state.undoStack, prevSnapshot].slice(-MAX_UNDO);
    this.state = {
      ...this.state,
      doc: nextDoc,
      dirty: true,
      saveTruth: this.state.autosaveEnabled ? 'export_needed' : 'export_needed',
      undoStack: nextUndo,
      statusMessage: label ? label : this.state.statusMessage,
      statusTone: label ? 'ok' : this.state.statusTone
    };
    this.emit();
  }

  undo(): boolean {
    if (this.state.undoStack.length === 0) return false;
    const previous = this.state.undoStack[this.state.undoStack.length - 1];
    this.state = {
      ...this.state,
      doc: previous,
      undoStack: this.state.undoStack.slice(0, -1),
      dirty: true,
      saveTruth: 'export_needed',
      statusMessage: 'Reverted last change (Undo).',
      statusTone: 'info'
    };
    this.emit();
    return true;
  }

  markFileSaved(pathLabel: string | null): void {
    this.state = {
      ...this.state,
      dirty: false,
      saveTruth: 'file_saved',
      lastSavedAt: nowISO(),
      lastSavedPath: pathLabel || this.state.lastSavedPath,
      statusMessage: pathLabel
        ? `Encrypted audit saved to ${pathLabel}.`
        : 'Encrypted .ssat audit bundle exported.',
      statusTone: 'ok'
    };
    this.emit();
  }

  markEncryptedAutosaveSynced(): void {
    this.state = {
      ...this.state,
      saveTruth: 'encrypted_local_synced',
      lastSavedAt: nowISO()
    };
    this.emit();
  }

  configureAutosave(enabled: boolean, passphrase: string | null): void {
    this.state = {
      ...this.state,
      autosaveEnabled: enabled,
      autosavePassphrase: enabled ? passphrase : null,
      saveTruth: enabled ? 'encrypted_local_synced' : this.state.dirty ? 'export_needed' : 'memory_only'
    };
    this.emit();
  }

  createSnapshot(label: string, changeNote: string): void {
    this.updateDoc((doc) => {
      const m = computeMetrics(doc);
      const controlScores: AuditSnapshot['control_scores'] = {};
      for (const [cid, a] of Object.entries(doc.assessments)) {
        if (a.status === 'not_applicable') controlScores[cid] = 'NA';
        else if (a.status === 'assessed') controlScores[cid] = a.score;
      }
      const snap: AuditSnapshot = {
        snapshot_id: `SNAP-${todayISO()}-${String(doc.snapshots.length + 1).padStart(2, '0')}`,
        label: label.trim() || `${doc.organization_profile.primary_cycle || 'Audit'} Snapshot`,
        cycle_name: doc.organization_profile.primary_cycle || 'Current Cycle',
        captured_at: nowISO(),
        change_note: changeNote.trim(),
        schema_version: doc.schema_version,
        catalog_version: doc.catalog_version,
        summary: {
          assessed_controls: m.assessed_controls,
          applicable_controls: m.applicable_controls,
          readiness_percent: m.readiness_percent,
          coverage_percent: m.coverage_percent,
          critical_gaps: m.critical_gaps,
          open_high_critical_findings: m.open_high_critical_findings,
          stale_evidence_count: m.stale_evidence_count
        },
        control_scores: controlScores,
        evidence_refs: doc.evidence.map((e) => e.evidence_id),
        vendor_names: doc.systems.map((s) => s.vendor_or_host || s.name).filter(Boolean)
      };
      doc.snapshots.unshift(snap);
    }, 'Captured immutable assessment snapshot for history and cycle comparison.');
  }

  startNextCycle(nextCycleName: string): void {
    this.createSnapshot(
      `${this.state.doc?.organization_profile.primary_cycle || 'Prior Cycle'} Close`,
      `Snapshot preserved before starting "${nextCycleName}".`
    );
    this.updateDoc((doc) => {
      doc.organization_profile.primary_cycle = nextCycleName.trim() || 'Next Scholarship Cycle';
      doc.assessment_status = 'in_progress';
      // Retain evidence dates, flag stale artifacts, and reset controls relying only on stale evidence for rescoring
      const staleIds = new Set<string>();
      for (const ev of doc.evidence) {
        if (isEvidenceStale(ev)) {
          ev.review_status = 'stale';
          staleIds.add(ev.evidence_id);
        }
      }
      for (const a of Object.values(doc.assessments)) {
        if (a.status === 'assessed' && a.score === 2) {
          const allStaleOrEmpty =
            a.evidence_ids.length === 0 || a.evidence_ids.every((id) => staleIds.has(id));
          if (allStaleOrEmpty) {
            a.score = 1;
            a.assessment_notes = `${a.assessment_notes ? a.assessment_notes + ' ' : ''}[Cycle rollover ${todayISO()}: linked evidence requires freshness re-verification before restoring Score 2.]`;
          }
        }
      }
    }, `Started next cycle "${nextCycleName}". Prior snapshot saved and stale evidence flagged for re-verification.`);
  }

  lockSession(): void {
    this.state = {
      ...this.state,
      doc: null,
      locked: true,
      dirty: false,
      undoStack: [],
      autosavePassphrase: null,
      saveTruth: 'memory_only',
      screen: 'welcome',
      statusMessage: 'Session locked. In-memory audit contents cleared from this view.',
      statusTone: 'info'
    };
    this.emit();
  }

  clearSession(): void {
    this.state = {
      ...this.state,
      doc: null,
      locked: false,
      dirty: false,
      undoStack: [],
      lastSavedAt: null,
      lastSavedPath: null,
      autosavePassphrase: null,
      saveTruth: 'memory_only',
      screen: 'welcome',
      statusMessage: 'Session cleared from browser memory.',
      statusTone: 'info'
    };
    this.emit();
  }
}

export function saveTruthLabel(state: AppState): { text: string; tone: 'neutral' | 'warn' | 'ok' } {
  if (!state.doc) return { text: 'No active audit', tone: 'neutral' };
  if (state.saveTruth === 'file_saved' && !state.dirty) {
    return { text: 'Encrypted .ssat saved', tone: 'ok' };
  }
  if (state.saveTruth === 'encrypted_local_synced') {
    return { text: 'Encrypted local copy updated · Export .ssat for backup', tone: 'ok' };
  }
  if (state.dirty) {
    return { text: 'Unsaved changes — save audit', tone: 'warn' };
  }
  return { text: 'Not saved to a file yet', tone: 'neutral' };
}
