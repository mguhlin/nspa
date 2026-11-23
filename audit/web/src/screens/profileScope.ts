import type { Store } from '../audit/state';
import type { SystemCriticality } from '../types';
import { esc, nextId } from '../a11y/helpers';

const DEFAULT_STAGES = [
  'Application intake',
  'Eligibility check',
  'Committee review',
  'Award approval & notifications',
  'Disbursement & reconciliation',
  'Donor stewardship',
  'Retention & archive'
];

const DEFAULT_DATA_CATS = [
  'Applicant contact details',
  'Academic transcripts & grades',
  'Essays & personal statements',
  'Recommendation letters',
  'Financial need / tax summaries',
  'Awardee disbursement institution details',
  'Donor contact & gift history',
  'Unknown (needs inventory)'
];

export function renderProfileScope(store: Store): string {
  const doc = store.get().doc;
  if (!doc) return '<p>Start or open an audit first.</p>';
  const p = doc.organization_profile;
  const s = doc.scope;

  const stagesHtml = DEFAULT_STAGES.map(
    (st) => `
    <label class="check-pill">
      <input type="checkbox" name="stage" value="${esc(st)}" ${s.scholarship_stages.includes(st) ? 'checked' : ''} />
      <span>${esc(st)}</span>
    </label>`
  ).join('');

  const dataCatsHtml = DEFAULT_DATA_CATS.map(
    (dc) => `
    <label class="check-pill">
      <input type="checkbox" name="datacat" value="${esc(dc)}" ${s.data_categories.includes(dc) ? 'checked' : ''} />
      <span>${esc(dc)}</span>
    </label>`
  ).join('');

  const systemsRows = doc.systems
    .map(
      (sys) => `
      <tr>
        <td><strong>${esc(sys.system_id)}</strong><br>${esc(sys.name)}</td>
        <td><span class="badge ${sys.criticality === 'Critical' ? 'badge-danger' : sys.criticality === 'High' ? 'badge-warn' : 'badge-neutral'}">${esc(sys.criticality)}</span></td>
        <td>${esc(sys.processes.join(', ') || 'Unknown')}</td>
        <td>${esc(sys.owner_role || 'Unassigned')}</td>
        <td>${esc(sys.vendor_or_host || 'Unknown')}</td>
        <td><button type="button" class="btn btn-sm btn-outline" data-remove-sys="${esc(sys.system_id)}">Remove</button></td>
      </tr>`
    )
    .join('');

  return `
    <div class="page-head">
      <div>
        <p class="eyebrow">Step 1 · Set the scene</p>
        <h1>Name your audit</h1>
        <p class="muted">Start with an audit name and your role. Everything else can wait. Use role names and descriptions, not applicant records.</p>
      </div>
      <div class="btn-row">
        <button type="button" class="btn btn-primary" data-go="roadmap">Back to roadmap</button>
        <button type="button" class="btn btn-outline" data-go="quick">Open five starting questions</button>
      </div>
    </div>

    <form id="profile-scope-form" class="card form-section">
      <h2>Organization Profile</h2>
      <div class="form-grid">
        <label>
          <span>Organization display label (optional; avoid real names if practicing)</span>
          <input type="text" name="display_name" value="${esc(p.display_name)}" placeholder="e.g., Community Scholarship Foundation" maxlength="200" />
        </label>
        <label>
          <span>Your role</span>
          <input type="text" name="auditor_role" value="${esc(p.auditor_role)}" placeholder="e.g., Program Director & IT Lead" maxlength="120" />
        </label>
      </div><details class="section-block"><summary>Optional: organization details</summary><div class="form-grid">
        <label>
          <span>Organization / mission type</span>
          <select name="organization_type">
            ${['', 'Independent nonprofit scholarship provider', 'Community foundation', 'Higher-education / institutional scholarship office', 'Corporate or family foundation', 'Association scholarship fund', 'Unknown / Other']
              .map((opt) => `<option value="${esc(opt)}" ${p.organization_type === opt ? 'selected' : ''}>${esc(opt || 'Select type...')}</option>`)
              .join('')}
          </select>
        </label>
        <label>
          <span>Team size band</span>
          <select name="size_band">
            ${['', 'Micro (1–5 staff)', 'Small team (6–15 staff, volunteer reviewers)', 'Mid-size (16–50 staff)', 'Larger institution (50+ staff)', 'Unknown']
              .map((opt) => `<option value="${esc(opt)}" ${p.size_band === opt ? 'selected' : ''}>${esc(opt || 'Select size band...')}</option>`)
              .join('')}
          </select>
        </label>
        <label>
          <span>Primary scholarship cycle</span>
          <input type="text" name="primary_cycle" value="${esc(p.primary_cycle)}" placeholder="e.g., Fall 2026–2027 Cycle" maxlength="120" />
        </label>
        <label>
          <span>Geography / operating region</span>
          <input type="text" name="geography" value="${esc(p.geography)}" placeholder="e.g., Texas / Multi-state U.S." maxlength="120" />
        </label>

      </div>
      </details><details class="section-block"><summary>Optional: scope, policy, and contract details</summary><div class="callout callout-warn" style="margin-top:16px">
        <label>
          <span><strong>Legal &amp; contractual review flag</strong> (SSAT does not issue legal compliance verdicts)</span>
          <input type="text" name="legal_context_flag" value="${esc(p.legal_context_flag || 'Requires Counsel / Authorized Review')}" maxlength="200" />
        </label>
        <label style="margin-top:10px">
          <span>Policy / contract / statutory notes for counsel review</span>
          <textarea name="legal_notes" rows="2" maxlength="2000">${esc(p.legal_notes)}</textarea>
        </label>
      </div>

      <h2 style="margin-top:24px">Audit Scope &amp; Boundaries</h2>
      <fieldset class="check-fieldset">
        <legend>In-scope scholarship stages</legend>
        <div class="check-group">${stagesHtml}</div>
      </fieldset>
      <fieldset class="check-fieldset">
        <legend>Data categories handled (categories only — never raw student/donor values)</legend>
        <div class="check-group">${dataCatsHtml}</div>
      </fieldset>
      <div class="form-grid" style="margin-top:14px">
        <label>
          <span>Audit boundaries (what is included)</span>
          <textarea name="audit_boundaries" rows="3" maxlength="2000">${esc(s.audit_boundaries)}</textarea>
        </label>
        <label>
          <span>Known exclusions</span>
          <textarea name="exclusions" rows="3" maxlength="2000">${esc(s.exclusions)}</textarea>
        </label>
        <label>
          <span>Obligations (one per line; mark legal duties as Requires Counsel Review)</span>
          <textarea name="obligations" rows="3" maxlength="2000">${esc(s.obligations.join('\n'))}</textarea>
        </label>
        <label>
          <span>Explicit unknowns (areas requiring discovery)</span>
          <textarea name="unknowns" rows="3" maxlength="2000">${esc(s.unknowns)}</textarea>
        </label>
      </div>
      </details><div class="btn-row" style="margin-top:16px">
        <button type="submit" class="btn btn-primary">Keep details and view roadmap</button>
      </div>
    </form>

    <section class="card" style="margin-top:20px" aria-labelledby="systems-heading">
      <h2 id="systems-heading">In-Scope Systems &amp; Third Parties (${doc.systems.length})</h2>
      <p class="muted">List scholarship portals, CRMs, shared drives, payment platforms, email/SSO, and AI tools.</p>
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th>System</th><th>Criticality</th><th>Processes</th><th>Owner Role</th><th>Vendor / Host</th><th>Action</th></tr></thead>
          <tbody>${systemsRows || '<tr><td colspan="6">No systems added yet. Add your primary portal, email, CRM, and disbursement platforms below.</td></tr>'}</tbody>
        </table>
      </div>
      <form id="add-system-form" class="inline-add-form">
        <h3>Add a system or third-party service</h3>
        <div class="form-grid">
          <label>
            <span>System name *</span>
            <input type="text" name="sys_name" required placeholder="e.g., Scholarship Application Portal" maxlength="160" />
          </label>
          <label>
            <span>Criticality</span>
            <select name="sys_crit">
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Unknown">Unknown</option>
            </select>
          </label>
          <label>
            <span>Owner role</span>
            <input type="text" name="sys_owner" placeholder="e.g., Program Director" maxlength="120" />
          </label>
          <label>
            <span>Vendor or hosting provider</span>
            <input type="text" name="sys_vendor" placeholder="e.g., Cloud Vendor / Unknown" maxlength="160" />
          </label>
          <label>
            <span>Processes (comma-separated)</span>
            <input type="text" name="sys_processes" placeholder="Intake, Review, Award" maxlength="200" />
          </label>
          <label>
            <span>Data categories (comma-separated)</span>
            <input type="text" name="sys_cats" placeholder="Applications, Essays, Scores" maxlength="200" />
          </label>
        </div>
        <div class="btn-row" style="margin-top:12px">
          <button type="submit" class="btn btn-secondary">Add System</button>
        </div>
      </form>
    </section>
  `;
}

export function bindProfileScopeEvents(container: HTMLElement, store: Store): void {
  container.querySelectorAll<HTMLButtonElement>('[data-go]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.go as 'roadmap' | 'quick';
      store.navigate(target);
    });
  });

  const form = container.querySelector<HTMLFormElement>('#profile-scope-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const stages = fd.getAll('stage').map(String);
    const datacats = fd.getAll('datacat').map(String);
    const obligations = String(fd.get('obligations') || '')
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean);

    store.updateDoc((doc) => {
      doc.organization_profile = {
        display_name: String(fd.get('display_name') || '').trim(),
        organization_type: String(fd.get('organization_type') || '').trim(),
        size_band: String(fd.get('size_band') || '').trim(),
        primary_cycle: String(fd.get('primary_cycle') || '').trim(),
        geography: String(fd.get('geography') || '').trim(),
        auditor_role: String(fd.get('auditor_role') || '').trim(),
        legal_context_flag: String(fd.get('legal_context_flag') || 'Requires Counsel / Authorized Review').trim(),
        legal_notes: String(fd.get('legal_notes') || '').trim()
      };
      doc.scope = {
        scholarship_stages: stages,
        data_categories: datacats,
        audit_boundaries: String(fd.get('audit_boundaries') || '').trim(),
        obligations,
        exclusions: String(fd.get('exclusions') || '').trim(),
        unknowns: String(fd.get('unknowns') || '').trim()
      };
      if (doc.assessment_status === 'draft') doc.assessment_status = 'in_progress';
    }, 'Audit details kept. Save audit to keep a file.');
    store.navigate('roadmap');
  });

  const sysForm = container.querySelector<HTMLFormElement>('#add-system-form');
  sysForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(sysForm);
    const name = String(fd.get('sys_name') || '').trim();
    if (!name) return;
    store.updateDoc((doc) => {
      const id = nextId('SYS', doc.systems.map((x) => x.system_id));
      doc.systems.push({
        system_id: id,
        name,
        criticality: (String(fd.get('sys_crit') || 'Unknown') as SystemCriticality),
        owner_role: String(fd.get('sys_owner') || '').trim() || 'Unassigned',
        vendor_or_host: String(fd.get('sys_vendor') || '').trim() || 'Unknown',
        processes: String(fd.get('sys_processes') || '')
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean),
        data_categories: String(fd.get('sys_cats') || '')
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean),
        notes: ''
      });
    }, `Added system "${name}" to audit scope.`);
  });

  container.querySelectorAll<HTMLButtonElement>('[data-remove-sys]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.removeSys || '';
      store.updateDoc((doc) => {
        doc.systems = doc.systems.filter((s) => s.system_id !== id);
      }, `Removed system ${id}.`);
    });
  });
}
