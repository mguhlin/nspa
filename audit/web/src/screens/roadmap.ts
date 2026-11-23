import type { Store } from '../audit/state';
import { checkProofRuleForScoreTwo } from '../audit/scoring';
import { CATALOG } from '../audit/catalog';
import { STARTER_CHECKS, starterProgress, actionCandidates, createSuggestedActions } from '../audit/journey';
import { esc } from '../a11y/helpers';
import type { ScreenId } from '../types';

export function renderRoadmap(store: Store): string {
  const st = store.get(), doc = st.doc;
  if (!doc) return '';
  const starterDone = starterProgress(doc);
  const assessed = CATALOG.controls.filter(c => doc.assessments[c.control_id]?.status !== 'not_assessed' && doc.assessments[c.control_id]).length;
  const named = Boolean(doc.organization_profile.display_name && doc.organization_profile.auditor_role);
  const candidates = actionCandidates(doc);
  const owned = doc.findings.filter(f => f.owner_role.trim()).length;
  const next: ScreenId = !named ? 'profile' : starterDone < 5 ? 'quick' : candidates.length ? 'findings' : assessed < 30 ? 'audit' : 'reports';
  const nextLabel = !named ? 'Name your audit' : starterDone < 5 ? 'Continue the five starting questions' : candidates.length ? 'Build your action plan' : assessed < 30 ? 'Continue the full review' : 'Prepare your summary';
  const steps = [
    { title: 'Set the scene', screen: 'profile', label: 'Edit audit details', status: named ? 'Ready' : 'Start here', copy: 'Give this audit a name and identify the role leading the work. Fill in the other details when you need them.' },
    { title: 'Start with five questions', screen: 'quick', label: 'Open starting questions', status: `${starterDone} of 5 assessed`, copy: 'Look at accounts, recovery, payments, information, and emergency contacts. “Not sure” is a useful answer; it stays an open question.' },
    { title: 'Collect proof', screen: 'evidence', label: 'Open evidence notes', status: `${doc.evidence.length} reference${doc.evidence.length === 1 ? '' : 's'}`, copy: 'Ask a colleague for a configuration check, a test result, or a document. Record a safe reference to it, rather than uploading private records.' },
    { title: 'Review the remaining questions', screen: 'audit', label: 'Open full review', status: `${assessed} of 30 assessed`, copy: 'Work through one topic at a time. The first five count toward this total. You can pause and save at any point.' },
    { title: 'Choose what to fix', screen: 'findings', label: 'Open action plan', status: `${owned} of ${doc.findings.length} actions have owners`, copy: 'Turn known gaps into tasks. Choose an owner, a deadline, and a way to check the fix. Start with the most serious gaps.' },
    { title: 'Share a summary and save', screen: 'reports', label: 'Open reports', status: st.dirty || !st.lastSavedPath ? 'Save a file to keep your work' : 'Encrypted audit saved', copy: 'Use the redacted executive brief for a team conversation. Save your password-protected audit file so you can return to it later.' }
  ];
  return `<div class="page-head"><div><p class="eyebrow">Your audit, one step at a time</p><h1>${esc(doc.organization_profile.display_name || 'Your security roadmap')}</h1><p class="lead">Find the gaps. Choose what to fix. Keep the evidence.</p></div>${doc.is_demo ? '<span class="badge badge-warn">Fictional practice audit</span>' : ''}</div>
    <section class="next-step" aria-labelledby="next-heading"><div><p class="eyebrow">Recommended next step</p><h2 id="next-heading">${esc(nextLabel)}</h2><p>You can use any step below. You do not need to finish everything in one sitting.</p></div><button class="btn btn-accent" ${candidates.length && next === 'findings' ? 'id="recommended-build-plan"' : `data-journey-go="${next}"`}>${esc(nextLabel)}</button></section>
    <ol class="journey-list">${steps.map((s, i) => `<li><span class="journey-number" aria-hidden="true">${i + 1}</span><div><div class="journey-title"><h2>${s.title}</h2><span class="journey-status">${esc(s.status)}</span></div><p>${s.copy}</p><button class="btn btn-outline" data-journey-go="${s.screen}">${s.label}</button></div></li>`).join('')}</ol>
    <section class="card section-block"><h2>Your five starting questions</h2><p class="muted">This is a starting point, not a security score. Unassessed areas remain unknown.</p><div class="starter-list">${STARTER_CHECKS.map(c => { const a = doc.assessments[c.id]; const text = a?.status === 'not_applicable' ? 'Not applicable' : a?.status === 'assessed' ? a.score === 2 ? checkProofRuleForScoreTwo(a, doc.evidence).allowed ? 'Verified in full review' : 'Evidence needs review' : a.score === 1 ? 'Needs proof / partial' : 'Gap identified' : 'Not sure / not assessed'; return `<div><strong>${c.title}</strong><span>${text}</span><button class="btn btn-sm btn-outline" data-starter-control="${c.id}">Review <span class="sr-only">${c.title}</span></button></div>`; }).join('')}</div></section>
    ${candidates.length ? `<section class="callout callout-warn section-block"><h2>Turn ${candidates.length} known gap${candidates.length === 1 ? '' : 's'} into a plan</h2><p>Create editable tasks from answers marked missing or partial. Existing actions are kept. Unknown answers are not treated as failed safeguards.</p><button class="btn btn-primary" id="build-action-plan">Create suggested actions</button></section>` : ''}
    <p class="muted">Assessment progress records answers, not proof of security. Verified answers require reviewed evidence in the full review.</p>`;
}

export function bindRoadmapEvents(container: HTMLElement, store: Store): void {
  container.querySelectorAll<HTMLButtonElement>('[data-journey-go]').forEach(btn => btn.addEventListener('click', () => {
    store.navigate(btn.dataset.journeyGo as ScreenId);
  }));
  container.querySelector('#recommended-build-plan')?.addEventListener('click', () => createSuggestedActions(store));
  container.querySelector('#build-action-plan')?.addEventListener('click', () => createSuggestedActions(store));
  container.querySelectorAll<HTMLButtonElement>('[data-starter-control]').forEach(btn => btn.addEventListener('click', () => store.navigate('quick', { controlId: btn.dataset.starterControl })));
}
