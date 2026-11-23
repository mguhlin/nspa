import type { Store } from '../audit/state';
import type { SimulationOutcome } from '../types';
import { CATALOG } from '../audit/catalog';
import { esc, nextId, todayISO, triggerDownload } from '../a11y/helpers';

export function renderSimulations(store: Store): string {
  const doc = store.get().doc;
  if (!doc) return '<p>Start or open an audit first.</p>';

  const simCards = CATALOG.simulations
    .map((sim) => {
      const priorRuns = doc.simulations.filter((r) => r.simulation_key === sim.simulation_key);
      const latest = priorRuns[priorRuns.length - 1];
      const badgeTone =
        !latest
          ? 'neutral'
          : latest.pass_partial_fail === 'pass'
            ? 'ok'
            : latest.pass_partial_fail === 'partial'
              ? 'warn'
              : 'danger';

      return `
        <article class="card sim-card">
          <div class="sim-head">
            <div>
              <span class="badge badge-info">${esc(sim.simulation_key)}</span>
              <span class="badge badge-neutral">Controls: ${esc(sim.linked_control_ids.join(', '))}</span>
              <span class="badge badge-${badgeTone}">${esc(latest ? `Last run: ${latest.pass_partial_fail.toUpperCase()} (${latest.date})` : 'Not run yet')}</span>
            </div>
          </div>
          <h2>${esc(sim.title)}</h2>
          <p>${esc(sim.purpose)}</p>
          <div class="teaching-grid" style="margin-top:12px">
            <div class="teaching-panel">
              <h3>Prerequisites &amp; safety</h3>
              <ul>${sim.prerequisites.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
            </div>
            <div class="teaching-panel">
              <h3>Fictional test dataset</h3>
              <p>${esc(sim.fictional_dataset)}</p>
            </div>
            <div class="teaching-panel">
              <h3>Role checklist</h3>
              <ul>${sim.role_checklist.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
            </div>
          </div>

          <details style="margin-top:12px" ${!latest ? 'open' : ''}>
            <summary><strong>Steps &amp; Record Verification Log for ${esc(sim.simulation_key)}</strong></summary>
            <ol style="margin:10px 0 14px">${sim.steps.map((st) => `<li>${esc(st)}</li>`).join('')}</ol>
            <p class="muted"><strong>Expected result:</strong> ${esc(sim.expected_result)}</p>
            <p class="muted"><strong>Artifacts to create:</strong> ${esc(sim.artifacts_to_create.join(' · '))}</p>

            <form class="sim-log-form" data-sim-key="${esc(sim.simulation_key)}" style="margin-top:14px">
              <div class="form-grid">
                <label><span>Authorized by role *</span><input type="text" name="authorized_by_role" required value="${esc(doc.organization_profile.auditor_role || 'Program Director')}" maxlength="120" /></label>
                <label><span>Test date *</span><input type="date" name="date" required value="${esc(todayISO())}" /></label>
                <label><span>Test environment *</span><input type="text" name="test_environment" required placeholder="Nonproduction sandbox / Authorized tabletop" maxlength="200" /></label>
                <label><span>Outcome *</span>
                  <select name="pass_partial_fail">
                    <option value="pass">Pass — Safeguard worked as expected</option>
                    <option value="partial">Partial — Some gaps or exceptions observed</option>
                    <option value="fail">Fail — Control failed; remediation required</option>
                  </select>
                </label>
                <label><span>Follow-up owner role</span><input type="text" name="owner" placeholder="e.g., IT Lead" maxlength="120" /></label>
                <label><span>Retest date</span><input type="date" name="retest_date" /></label>
              </div>
              <label style="margin-top:10px"><span>Synthetic data used (never real applicants/donors)</span><input type="text" name="synthetic_data_used" value="${esc(sim.fictional_dataset)}" maxlength="400" /></label>
              <label style="margin-top:10px"><span>Actual observation *</span><textarea name="actual_observation" rows="3" required placeholder="Describe objectively what happened during the test..." maxlength="3000"></textarea></label>
              <label style="margin-top:10px"><span>Limitations / scope boundaries</span><input type="text" name="limitations" placeholder="e.g., Tested primary approver only; backup scheduled next month" maxlength="1000" /></label>
              <div class="btn-row" style="margin-top:12px">
                <button type="submit" class="btn btn-primary">Save Verification Log</button>
              </div>
            </form>
          </details>
        </article>
      `;
    })
    .join('');

  const logsRows = doc.simulations
    .map(
      (run) => `
      <tr>
        <td><strong>${esc(run.test_id)}</strong><br><small>${esc(run.date)}</small></td>
        <td>${esc(run.scenario)}<br><small class="muted">${esc(run.linked_control_ids.join(', '))}</small></td>
        <td><span class="badge badge-${run.pass_partial_fail === 'pass' ? 'ok' : run.pass_partial_fail === 'partial' ? 'warn' : 'danger'}">${esc(run.pass_partial_fail.toUpperCase())}</span></td>
        <td>${esc(run.actual_observation)}<br><small class="muted">Limits: ${esc(run.limitations || 'None noted')}</small></td>
        <td>
          <button type="button" class="btn btn-sm btn-outline" data-dl-sim="${esc(run.test_id)}">Download Record (.md)</button>
        </td>
      </tr>`
    )
    .join('');

  return `
    <div class="page-head">
      <div>
        <p class="eyebrow">Practical Centerpiece · Non-Destructive Verification</p>
        <h1>Five Guided Simulations</h1>
        <p class="muted">Test safeguards using synthetic datasets and authorized tabletops — never run destructive or unauthorized tests against production systems.</p>
      </div>
    </div>

    <div class="sim-stack">${simCards}</div>

    <section class="card" style="margin-top:20px" aria-labelledby="sim-logs-heading">
      <h2 id="sim-logs-heading">Recorded Verification Logs (${doc.simulations.length})</h2>
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th>Test ID &amp; Date</th><th>Scenario &amp; Controls</th><th>Outcome</th><th>Observation &amp; Limitations</th><th>Evidence Export</th></tr></thead>
          <tbody>${logsRows || '<tr><td colspan="5">No simulation verification logs recorded yet.</td></tr>'}</tbody>
        </table>
      </div>
    </section>
  `;
}

export function bindSimulationsEvents(container: HTMLElement, store: Store): void {
  const doc = store.get().doc;
  if (!doc) return;

  container.querySelectorAll<HTMLFormElement>('.sim-log-form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const simKey = form.dataset.simKey || 'SIM-01';
      const sim = CATALOG.simulations.find((s) => s.simulation_key === simKey);
      if (!sim) return;
      const fd = new FormData(form);
      const observation = String(fd.get('actual_observation') || '').trim();
      if (!observation) return;

      store.updateDoc((draft) => {
        const testId = nextId('TEST', draft.simulations.map((x) => x.test_id));
        const evId = nextId('EV-SIM', draft.evidence.map((x) => x.evidence_id));
        const outcome = String(fd.get('pass_partial_fail') || 'partial') as SimulationOutcome;
        const date = String(fd.get('date') || todayISO());

        draft.simulations.push({
          test_id: testId,
          simulation_key: sim.simulation_key,
          linked_control_ids: [...sim.linked_control_ids],
          scenario: sim.title,
          authorized_by_role: String(fd.get('authorized_by_role') || '').trim(),
          test_environment: String(fd.get('test_environment') || '').trim(),
          synthetic_data_used: String(fd.get('synthetic_data_used') || '').trim(),
          date,
          steps_completed: [...sim.steps],
          actual_observation: observation,
          expected_result: sim.expected_result,
          pass_partial_fail: outcome,
          evidence_id: evId,
          limitations: String(fd.get('limitations') || '').trim(),
          owner: String(fd.get('owner') || '').trim(),
          retest_date: String(fd.get('retest_date') || '').trim()
        });

        // Automatically create linked Evidence Record so teams can verify controls cleanly
        draft.evidence.push({
          evidence_id: evId,
          title: `${sim.title} — Verification Log ${testId} (Synthetic Test)`,
          artifact_type: 'Simulation Verification Log',
          linked_controls: [...sim.linked_control_ids],
          linked_systems: [],
          artifact_date: date,
          period_covered: draft.organization_profile.primary_cycle || 'Current Cycle',
          produced_by: String(fd.get('authorized_by_role') || '').trim(),
          storage_reference: `ssat-simulation-log/${testId}`,
          evidence_origin: 'sampled_test',
          review_method: 'executed_controlled_test',
          reviewer_role: String(fd.get('authorized_by_role') || '').trim(),
          review_date: date,
          scope_sampling: String(fd.get('test_environment') || '').trim(),
          result: outcome === 'pass' ? 'supports' : outcome === 'partial' ? 'partially_supports' : 'contradicts',
          review_status: outcome === 'pass' ? 'verified' : 'reviewed',
          exceptions: String(fd.get('limitations') || '').trim(),
          data_sensitivity: 'Internal',
          freshness_days: 180,
          next_review_date: String(fd.get('retest_date') || '').trim(),
          redaction_status: 'metadata_only',
          optional_hash: ''
        });
      }, `Recorded verification log for ${sim.title} and added linked evidence artifact.`);
    });
  });

  container.querySelectorAll<HTMLButtonElement>('[data-dl-sim]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.dlSim || '';
      const run = doc.simulations.find((s) => s.test_id === id);
      if (!run) return;
      const md = [
        `# Verification Log: ${run.test_id} — ${run.scenario}`,
        '',
        `- **Date:** ${run.date}`,
        `- **Linked Controls:** ${run.linked_control_ids.join(', ')}`,
        `- **Authorized By Role:** ${run.authorized_by_role}`,
        `- **Environment:** ${run.test_environment}`,
        `- **Synthetic Data Used:** ${run.synthetic_data_used}`,
        `- **Outcome:** ${run.pass_partial_fail.toUpperCase()}`,
        `- **Linked Evidence ID:** ${run.evidence_id}`,
        '',
        '## Expected Result',
        run.expected_result,
        '',
        '## Actual Observation',
        run.actual_observation,
        '',
        '## Limitations & Retest',
        `- **Limitations:** ${run.limitations || 'None noted'}`,
        `- **Owner Role:** ${run.owner || 'Unassigned'}`,
        `- **Retest Date:** ${run.retest_date || 'TBD'}`,
        '',
        '> Self-assessment test record using synthetic data only. Not a regulatory certification.'
      ].join('\n');
      triggerDownload(`${run.test_id.toLowerCase()}-verification-record.md`, md, 'text/markdown;charset=utf-8');
      store.setStatus(`Downloaded verification record ${run.test_id}.`, 'ok');
    });
  });
}
