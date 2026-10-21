'use strict';
(async () => {
  const form = document.getElementById('awareness-form');
  const results = document.getElementById('assessment-results');
  const script = document.currentScript;
  let questions;
  try {
    const response = await fetch(new URL('assessment-data.json?v=20261021-simple-1', script.src));
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
    {number: 1, title: 'Getting started', focus: 'You are learning what AI can help with and what a person needs to check.', next: 'Try this small task first. Then read the answer and check that the date stayed the same.', picture: 'prompt-conversation', example: 'Type this into ChatGPT: “Using this note only, write a friendly one-sentence reminder: Applications close October 1.”', actions: [
      ['Try one practice example', 'prompting/demos.html#first-prompt', 'A short request and made-up information are enough to begin.']
    ]},
    {number: 2, title: 'Checking AI’s answers', focus: 'You know some of the basics. Your next step is to check whether AI’s answer matches the original information.', next: 'Your job: remove “improved grades by 20%.” The original never says that. Keep the 12 sessions and check the other details the same way.', picture: 'check-original', example: 'Original: “I ran 12 tutoring sessions.” AI’s answer: “The applicant ran 12 sessions and improved grades by 20%.”', actions: [
      ['Practice checking one answer', 'prompting/demos.html#rubric', 'Look at the original words beside AI’s answer. Remove anything the original does not support.']
    ]},
    {number: 3, title: 'Practicing with a colleague', focus: 'You handled most of these situations well. Your next step is to see whether another person can check your work easily.', next: 'Use made-up information. Ask a colleague to compare the AI answer with the original and tell you what needs fixing.', picture: 'human-decision', example: 'Choose one practice application. Ask AI to make a checklist of its files. Show a colleague the file list and the checklist.', actions: [
      ['Try the file-list example together', 'prompting/demos.html#organize', 'Can both of you find every listed file? A person still checks the actual documents.']
    ]}
  ];
  const pictureDescriptions = {
    'prompt-conversation': 'A person sends a request and receives an AI draft to read.',
    'check-original': 'The original says 12 sessions. The AI draft adds 20% better grades; that unsupported claim is crossed out.',
    'human-decision': 'AI supplies a checklist. A staff member checks it and makes the decision.',
    'codes': 'A made-up applicant’s name is replaced by the code A17 on their documents.',
    'file-list': 'A file list names A17-transcript.pdf. The document itself still needs to be opened.',
    'same-work': 'Two applicants report the same tutoring work in different words and receive the same contribution score.'
  };
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
      feedback.replaceChildren(el('h3', correct ? 'That’s the recommended choice' : 'Here’s what to try instead'), el('p', `Recommended: ${q.options[q.answer]}`), el('p', q.why));
      const link = el('a', q.practice); link.href = q.href; feedback.append(link); feedback.hidden = false;
      if (q.picture) { const figure = el('figure', ''); figure.className = 'concept-picture'; const img = document.createElement('img'); img.src = `prompting/assets/concepts/${q.picture}.webp`; img.alt = pictureDescriptions[q.picture]; img.loading = 'lazy'; img.width = 900; img.height = 600; figure.append(img); feedback.append(figure); }
      return {q, selected, confidence, correct};
    });
    const correct = answers.filter(a => a.correct).length;
    const summary = document.getElementById('results-summary');
    summary.replaceChildren(el('p', `${correct} of ${questions.length} answers match the recommended choices. Use the explanations to decide what to practice.`));
    const readinessIds = ['upload', 'exception', 'detector'];
    const readinessMet = readinessIds.every(id => answers.find(a => a.q.id === id)?.correct);
    const phaseNumber = correct <= 3 ? 1 : correct >= 7 && readinessMet ? 3 : 2;
    currentPhase = phases[phaseNumber - 1];
    const phase = el('section', ''); phase.className = 'learning-phase'; phase.id = 'learning-phase';
    phase.append(el('h3', `Phase ${phaseNumber} · ${currentPhase.title}`), el('p', `${currentPhase.focus}`));
    const figure = el('figure', ''); figure.className = 'phase-picture'; const image = document.createElement('img'); image.src = `prompting/assets/concepts/${currentPhase.picture}.webp`; image.alt = pictureDescriptions[currentPhase.picture]; image.width = 900; image.height = 600; figure.append(image);
    phase.append(figure, el('h4', 'One thing to try now'), el('p', currentPhase.example), el('p', currentPhase.next));
    const actions = el('p', ''); actions.className = 'phase-actions';
    currentPhase.actions.forEach(([title, href]) => { const link = el('a', title); link.href = href; actions.append(link); });
    phase.append(actions);
    const method = el('details', ''); method.append(el('summary', 'What do the phases mean?'), el('p', 'Phase 1: getting started. Phase 2: checking AI’s answers. Phase 3: practicing with a colleague. They suggest where to practice next; they do not measure professional expertise.'), el('p', 'How your answers are used: 0–3 recommended answers suggests Phase 1. Four to six suggests Phase 2. Seven or eight suggests Phase 3 if you also chose to check permission before uploading, let staff decide exceptions, and review detector flags fairly. Otherwise, Phase 2 offers more checking practice. How sure you feel does not change your phase.'));
    phase.append(method); summary.append(phase);
    const chart = el('section', ''); chart.className = 'domain-chart'; chart.append(el('h3', 'My answers by topic'), el('p', 'Each bar shows how many recommended answers you chose in that topic.'));
    for (const [name, score] of domains) {
      const row = el('div', ''); row.className = 'domain-result';
      const label = el('p', `${name}: ${score.correct} of ${score.total} questions.`);
      const track = el('div', ''); track.className = 'domain-track'; track.setAttribute('aria-hidden', 'true');
      const fill = el('span', ''); fill.style.width = `${score.correct / score.total * 100}%`; track.append(fill); row.append(label, track); chart.append(row);
    }
    summary.append(chart);
    const reconsider = answers.filter(a => !a.correct && a.confidence === 'Very confident');
    if (reconsider.length) summary.append(el('p', 'You felt very confident about an answer worth another look. Read its short explanation above.'));
    results.hidden = false; results.focus();
  });
  form.addEventListener('reset', () => {
    document.querySelectorAll('.answer-feedback').forEach(node => { node.hidden = true; node.replaceChildren(); });
    results.hidden = true; document.getElementById('reflection').value = ''; document.getElementById('assessment-status').textContent = ''; answers = []; currentPhase = null;
  });
  document.getElementById('export-reflection').addEventListener('click', () => {
    const lines = ['MY TRUST, TRANSPARENCY, AND AI REFLECTION', 'Practice activity. Answers are not sent to anyone.', ''];
    if (currentPhase) {
      lines.push(`Phase ${currentPhase.number}: ${currentPhase.title}`, currentPhase.focus, '', 'One thing to try now:', currentPhase.example, currentPhase.next);
      currentPhase.actions.forEach(([title, href, description]) => lines.push(title, description, new URL(href, location.href).href, ''));
      lines.push('', 'My answers by topic:', document.querySelector('.domain-chart')?.innerText || '', '');
    }
    answers.forEach((a, i) => lines.push(`${i+1}. ${a.q.q}`, `My choice: ${a.q.options[a.selected]}`, `Confidence: ${a.confidence}`, `Recommended: ${a.q.options[a.q.answer]}`, a.q.why, ''));
    lines.push('One thing I will try next:', document.getElementById('reflection').value);
    const url = URL.createObjectURL(new Blob([lines.join('\n')], {type: 'text/plain;charset=utf-8'}));
    const link = document.createElement('a'); link.href = url; link.download = 'my-ai-review-reflection.txt'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    document.getElementById('assessment-status').textContent = 'Your results were saved to a text file.';
  });
  window.addEventListener('beforeprint', () => {
    let text = document.getElementById('reflection-print');
    if (!text) { text = document.createElement('p'); text.id = 'reflection-print'; document.getElementById('reflection').after(text); }
    text.textContent = document.getElementById('reflection').value;
  });
  document.getElementById('print-reflection').addEventListener('click', () => window.print());
})();
