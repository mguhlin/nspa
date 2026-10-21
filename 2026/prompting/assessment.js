'use strict';
(async () => {
  const form = document.getElementById('awareness-form');
  const results = document.getElementById('assessment-results');
  const script = document.currentScript;
  let questions;
  try {
    const response = await fetch(new URL('assessment-data.json', script.src));
    if (!response.ok) throw new Error('Assessment data unavailable');
    questions = await response.json();
  } catch {
    const message = document.createElement('p');
    message.setAttribute('role', 'alert');
    message.textContent = 'The interactive feedback could not load. Please reload this page or open the demonstration practice page.';
    form.prepend(message);
    form.querySelector('[type="submit"]').disabled = true;
    return;
  }
  let answers = [];
  let currentPhase = null;
  const phases = [
    {number: 1, title: 'Build a foundation', focus: 'Practice one bounded task with fictional material and learn to connect every finding to its source.', next: 'To move toward Phase 2, work through a demonstration and aim for at least four recommended choices when you revisit the scenarios.', actions: [
      ['Practice the parts of a useful prompt', 'prompting/demos.html#rubric', 'Name the task, sources, rubric, output, and limits.'],
      ['Check the application inventory', 'prompting/demos.html#organize', 'Separate a listed filename from verified document content.'],
      ['Review the human decision boundary', 'prompting/demos.html#completeness', 'Flag a gap or exception for staff without accepting or rejecting an applicant.']
    ]},
    {number: 2, title: 'Strengthen your checks', focus: 'Make evidence verification, approved data use, and fair human review consistent across your workflow.', next: 'To move toward Phase 3, aim for seven or eight recommended choices, including the approved-data, exception-decision, and detector-response scenarios.', actions: [
      ['Audit rubric evidence', 'prompting/demos.html#rubric', 'Verify exact quotations, source locations, and the difference between a contribution and a supported result.'],
      ['Check the Project setup', 'prompting/demos.html#setup', 'Confirm the service and purpose are approved before supplying real applicant information.'],
      ['Clarify applicant and reviewer rules', 'prompting/demos.html#policy', 'Keep concern responses and exceptions with an authorized person.']
    ]},
    {number: 3, title: 'Develop a repeatable workflow', focus: 'Your choices support trying a small, documented practice workflow with explicit human checks.', next: 'Deepen this phase by testing the procedure on varied fictional cases, logging corrections, and asking a colleague to review the handoff before considering an approved pilot.', actions: [
      ['Set up a practice Project', 'prompting/demos.html#setup', 'Keep the sources and standing instructions together, then verify each response.'],
      ['Adapt the reusable evidence review skill', 'prompting/demos.html#skill', 'Run the missing-evidence, equivalent-wording, and embedded-instruction evaluation cases.'],
      ['Keep a correction log', 'prompting/files/review-log.csv', 'Record the version, expected finding, error, correction, owner, and stop condition.']
    ]}
  ];
  const el = (tag, text) => { const node = document.createElement(tag); node.textContent = text; return node; };
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const domains = new Map();
    answers = questions.map(q => {
      const selected = Number(data.get(q.id));
      const confidence = String(data.get(`confidence-${q.id}`));
      const correct = selected === q.answer;
      const domain = domains.get(q.domain) || {correct: 0, total: 0};
      domain.total++; if (correct) domain.correct++; domains.set(q.domain, domain);
      const feedback = document.getElementById(`feedback-${q.id}`);
      feedback.replaceChildren(el('h3', correct ? 'My choice matches the recommended step' : 'A step to reconsider'), el('p', `Recommended: ${q.options[q.answer]}`), el('p', q.why));
      const link = el('a', q.practice); link.href = q.href; feedback.append(link); feedback.hidden = false;
      return {q, selected, confidence, correct};
    });
    const correct = answers.filter(a => a.correct).length;
    const summary = document.getElementById('results-summary');
    summary.replaceChildren(el('p', `${correct} of ${questions.length} choices match the recommended steps in these scenarios. The explanations matter more than the total.`));
    const readinessIds = ['upload', 'exception', 'detector'];
    const readinessMet = readinessIds.every(id => answers.find(a => a.q.id === id)?.correct);
    const phaseNumber = correct <= 3 ? 1 : correct >= 7 && readinessMet ? 3 : 2;
    currentPhase = phases[phaseNumber - 1];
    const phase = el('section', ''); phase.className = 'learning-phase'; phase.id = 'learning-phase';
    phase.append(el('h3', `Phase ${phaseNumber} · ${currentPhase.title}`), el('p', `Your answers place you in Phase ${phaseNumber} of this learning pathway. ${currentPhase.focus}`));
    const pathway = el('ol', ''); pathway.className = 'phase-pathway'; pathway.setAttribute('aria-label', 'Learning phases');
    phases.forEach(item => { const step = el('li', `Phase ${item.number}: ${item.title}`); if (item.number === phaseNumber) step.setAttribute('aria-current', 'step'); pathway.append(step); });
    phase.append(pathway, el('h4', 'What I can do next'));
    const actions = el('ol', ''); actions.className = 'phase-actions';
    currentPhase.actions.forEach(([title, href, description]) => { const item = el('li', ''); const link = el('a', title); link.href = href; item.append(link, el('p', description)); actions.append(item); });
    phase.append(actions, el('p', currentPhase.next));
    const method = el('details', ''); method.append(el('summary', 'How this learning phase is chosen'), el('p', 'Phase 1: zero to three choices match the recommended steps. Phase 2: four to six matches, or seven to eight with a readiness check to revisit. Phase 3: seven to eight matches plus the recommended choices for approved data use, human exception decisions, and fair detector responses. Confidence choices inform reflection and do not change the phase. These are workshop learning rules, not validated expertise levels.'));
    phase.append(method); summary.append(phase);
    const chart = el('section', ''); chart.className = 'domain-chart'; chart.append(el('h3', 'My scenario results by topic'), el('p', 'The bars show choices matching the recommended steps. Topics have different numbers of questions.'));
    for (const [name, score] of domains) {
      const row = el('div', ''); row.className = 'domain-result';
      const label = el('p', `${name}: ${score.correct} of ${score.total} scenarios.`);
      const track = el('div', ''); track.className = 'domain-track'; track.setAttribute('aria-hidden', 'true');
      const fill = el('span', ''); fill.style.width = `${score.correct / score.total * 100}%`; track.append(fill); row.append(label, track); chart.append(row);
    }
    summary.append(chart);
    const reconsider = answers.filter(a => !a.correct && a.confidence === 'Very confident');
    if (reconsider.length) summary.append(el('p', 'I felt very confident about a choice that differed from the recommended step. I can use that explanation as a starting point for discussion.'));
    const practice = answers.find(a => !a.correct) || answers.find(a => a.confidence === 'Unsure') || answers[0];
    const next = el('p', 'My next practice step: '); const link = el('a', practice.q.practice); link.href = practice.q.href; next.append(link); summary.append(next);
    results.hidden = false; results.focus();
  });
  form.addEventListener('reset', () => {
    document.querySelectorAll('.answer-feedback').forEach(node => { node.hidden = true; node.replaceChildren(); });
    results.hidden = true; document.getElementById('reflection').value = ''; document.getElementById('assessment-status').textContent = ''; answers = []; currentPhase = null;
  });
  document.getElementById('export-reflection').addEventListener('click', () => {
    const lines = ['MY TRUST, TRANSPARENCY, AND AI REFLECTION', 'Informal learning exercise. Answers are not submitted.', ''];
    if (currentPhase) {
      lines.push(`Phase ${currentPhase.number}: ${currentPhase.title}`, currentPhase.focus, '', 'What I can do next:');
      currentPhase.actions.forEach(([title, href, description]) => lines.push(title, description, new URL(href, location.href).href, ''));
      lines.push(currentPhase.next, '', 'Scenario results by topic:', document.querySelector('.domain-chart')?.innerText || '', '');
    }
    answers.forEach((a, i) => lines.push(`${i+1}. ${a.q.q}`, `My choice: ${a.q.options[a.selected]}`, `Confidence: ${a.confidence}`, `Recommended: ${a.q.options[a.q.answer]}`, a.q.why, ''));
    lines.push('One change I will make:', document.getElementById('reflection').value);
    const url = URL.createObjectURL(new Blob([lines.join('\n')], {type: 'text/plain;charset=utf-8'}));
    const link = document.createElement('a'); link.href = url; link.download = 'my-ai-review-reflection.txt'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    document.getElementById('assessment-status').textContent = 'Reflection exported to a text file.';
  });
  window.addEventListener('beforeprint', () => {
    let text = document.getElementById('reflection-print');
    if (!text) { text = document.createElement('p'); text.id = 'reflection-print'; document.getElementById('reflection').after(text); }
    text.textContent = document.getElementById('reflection').value;
  });
  document.getElementById('print-reflection').addEventListener('click', () => window.print());
})();
