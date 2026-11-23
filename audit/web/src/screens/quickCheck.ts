import type { Store } from '../audit/state';
import { STARTER_CHECKS, starterProgress } from '../audit/journey';
import { ensureControlAssessment } from '../audit/validation';
import { esc } from '../a11y/helpers';

export function renderQuickCheck(store: Store): string {
  const st = store.get(), doc = st.doc;
  if (!doc) return '';
  const index = Math.max(0, STARTER_CHECKS.findIndex(c => c.id === st.selectedControlId));
  const check = STARTER_CHECKS[index], a = doc.assessments[check.id];
  const hasVerified = a?.status === 'assessed' && a.score === 2;
  return `<div class="page-head"><div><p class="eyebrow">Start small</p><h1>Five starting questions</h1><p class="muted">No technical expertise needed. Ask a colleague when you are unsure.</p></div><button class="btn btn-outline" data-quick-roadmap>Back to roadmap</button></div>
    <label class="quick-mobile-select"><span>Jump to a question</span><select id="quick-question-select">${STARTER_CHECKS.map((c, i) => `<option value="${c.id}" ${i === index ? 'selected' : ''}>${i + 1}. ${c.title}</option>`).join('')}</select></label><div class="quick-layout"><nav class="quick-nav" aria-label="Starting questions">${STARTER_CHECKS.map((c, i) => `<button class="quick-nav-item ${index === i ? 'active' : ''}" data-quick-id="${c.id}" ${index === i ? 'aria-current="step"' : ''}><span>${i + 1}</span>${c.title}</button>`).join('')}<p class="muted">${starterProgress(doc)} of 5 assessed. Unknowns stay open.</p></nav>
    <section class="card quick-question" aria-labelledby="quick-heading"><p class="eyebrow">Question ${index + 1} of 5</p><h2 id="quick-heading">${check.title}</h2><p class="lead">${check.question}</p><p class="quick-help">${check.help}</p>
    ${hasVerified || a?.status === 'not_applicable' ? `<div class="callout callout-info"><p>This question has a ${hasVerified ? 'full-review answer marked verified' : 'documented N/A answer'} in the full review. Open it there to revise the supporting details.</p><button class="btn btn-primary" data-quick-full>Open full question</button></div>` : `<form id="quick-form"><fieldset class="score-fieldset"><legend>What do you know so far?</legend>${[{ value: '1', label: 'In place or partly in place', desc: 'We still need to check the proof.' }, { value: '0', label: 'Not in place', desc: 'We need to fix this.' }, { value: 'unknown', label: 'Not sure yet', desc: 'We need to ask someone.' }].map(o => `<label class="score-option"><input type="radio" name="quick_answer" value="${o.value}" required ${a?.status === 'assessed' && String(a.score) === o.value ? 'checked' : a?.status === 'not_assessed' && a.assessment_notes && o.value === 'unknown' ? 'checked' : ''}><span><strong>${o.label}</strong><small>${o.desc}</small></span></label>`).join('')}</fieldset><label><span>A note to help your team (optional)</span><textarea name="quick_notes" rows="2" maxlength="4000" placeholder="For example: Ask the portal administrator to confirm this.">${esc(a?.assessment_notes || '')}</textarea></label><p class="muted">Use descriptions and roles. Leave out applicant records, passwords, and payment details.</p><button class="btn btn-primary" type="submit">${index === 4 ? 'Keep answer and view roadmap' : 'Keep answer and continue'}</button></form>`}
    <details class="section-block"><summary>Ready to verify this answer?</summary><p>The full question explains acceptable evidence and records who checked it, how, and when. A first-pass answer cannot earn a verified score.</p><button class="btn btn-outline" data-quick-full>Open full question</button></details></section></div>`;
}

export function bindQuickCheckEvents(container: HTMLElement, store: Store): void {
  const index = Math.max(0, STARTER_CHECKS.findIndex(c => c.id === store.get().selectedControlId));
  const check = STARTER_CHECKS[index];
  container.querySelectorAll<HTMLButtonElement>('[data-quick-id]').forEach(b => b.addEventListener('click', () => store.navigate('quick', { controlId: b.dataset.quickId })));
  container.querySelector<HTMLSelectElement>('#quick-question-select')?.addEventListener('change', e => store.navigate('quick', { controlId: (e.target as HTMLSelectElement).value }));
  container.querySelector('[data-quick-roadmap]')?.addEventListener('click', () => store.navigate('roadmap'));
  container.querySelectorAll('[data-quick-full]').forEach(b => b.addEventListener('click', () => store.navigate('audit', { controlId: check.id })));
  container.querySelector<HTMLFormElement>('#quick-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement), answer = String(fd.get('quick_answer'));
    if (!['0', '1', 'unknown'].includes(answer)) return;
    store.updateDoc(doc => {
      const a = ensureControlAssessment(doc, check.id);
      a.status = answer === 'unknown' ? 'not_assessed' : 'assessed';
      a.score = answer === 'unknown' ? null : answer === '0' ? 0 : 1;
      a.assessment_notes = String(fd.get('quick_notes') || '').trim();
      a.self_attestation_claim = answer === '1';
      doc.assessments[check.id] = a;
    }, answer === 'unknown' ? 'Kept as unknown. Ask a colleague and come back to this question.' : 'Answer kept in this session. Save audit to keep a file.');
    store.navigate(index === 4 ? 'roadmap' : 'quick', { controlId: STARTER_CHECKS[Math.min(index + 1, 4)].id });
  });
}
