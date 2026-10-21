'use strict';
(async () => {
  const form = document.getElementById('awareness-form');
  const results = document.getElementById('assessment-results');
  const script = document.currentScript;
  let questions;
  try {
    const embedded = document.getElementById('assessment-data');
    if (embedded) questions = JSON.parse(embedded.textContent);
    else {
      const response = await fetch(new URL('assessment-data.json?v=20261021-score-2', script.src));
      if (!response.ok) throw new Error('Assessment data unavailable');
      questions = await response.json();
    }
  } catch {
    const message = document.createElement('p');
    message.setAttribute('role', 'alert');
    message.textContent = 'Your feedback could not load. Please reload this page and try again.';
    form.prepend(message);
    form.querySelector('[type="submit"]').disabled = true;
    return;
  }
  const el = (tag, text) => { const node = document.createElement(tag); node.textContent = text; return node; };
  const improvements = {
    task: 'Give AI one clear job. Ask it to show the original words and where it found them. Staff make the decision.',
    upload: 'Before uploading an application, ask your organization which AI account and information you are allowed to use. Removing names is not enough.',
    manifest: 'Open the actual document before relying on its contents. A file name on a list does not show what is inside.',
    quote: 'Compare AI’s claims with the original application. Remove any detail the original does not support.',
    calibrate: 'Use the same scoring rule for the same work. Smoother writing alone does not show a greater community contribution.',
    detector: 'Treat an AI-writing flag as a question to check. Follow the published rules and give the applicant a chance to explain.',
    exception: 'Let a staff member decide requests for extra time. Check the organization’s rules and keep a record of the reason.',
    skill: 'Try saved AI instructions on made-up examples where you know the answer. Check and fix mistakes before using them again.'
  };
  const pictures = {
    'prompt-conversation': 'A person sends a request and receives an AI draft to read.',
    'check-original': 'The original says 12 sessions. The AI draft adds 20% better grades; that unsupported claim is crossed out.',
    'human-decision': 'AI supplies a checklist. A staff member checks it and makes the decision.',
    'codes': 'A made-up applicant’s name is replaced by the code A17 on their documents.',
    'file-list': 'A file list names A17-transcript.pdf. The document itself still needs to be opened.'
  };
  const phases = [
    {title: 'Getting started', text: 'Focus on giving AI a clear request and checking its answer against the original.'},
    {title: 'Checking AI’s answers', text: 'You know some basics. Focus on spotting added facts and keeping decisions with people.'},
    {title: 'Keeping good habits', text: 'You handled most of these situations well. Keep checking facts, permissions, and human decisions.'}
  ];
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const domains = new Map();
    const answers = questions.map(q => {
      const correct = Number(data.get(q.id)) === q.answer;
      const domain = domains.get(q.domain) || {correct: 0, total: 0};
      domain.total++; if (correct) domain.correct++; domains.set(q.domain, domain);
      const feedback = document.getElementById(`feedback-${q.id}`);
      feedback.replaceChildren(el('h3', correct ? 'That’s the recommended choice' : 'Here’s what to reconsider'), el('p', `Recommended: ${q.options[q.answer]}`), el('p', q.why));
      if (q.picture) {
        const figure = el('figure', ''); figure.className = 'concept-picture';
        const image = document.createElement('img'); image.src = `prompting/assets/concepts/${q.picture}.webp`; image.alt = pictures[q.picture]; image.width = 900; image.height = 600; image.loading = 'lazy'; figure.append(image); feedback.append(figure);
      }
      feedback.hidden = false;
      return {q, correct};
    });
    const correct = answers.filter(a => a.correct).length;
    const percent = Math.round(correct / questions.length * 100);
    const phaseNumber = correct <= 3 ? 1 : correct <= 6 ? 2 : 3;
    const phase = phases[phaseNumber - 1];
    const summary = document.getElementById('results-summary');
    const score = el('p', `Your score: ${correct} / ${questions.length} (${percent}%)`); score.className = 'assessment-score'; score.id = 'assessment-score';
    summary.replaceChildren(score, el('p', `${correct} of ${questions.length} answers match the recommended choices.`));
    const phaseText = el('p', `Phase ${phaseNumber} · ${phase.title}. ${phase.text}`); phaseText.id = 'learning-phase'; summary.append(phaseText);
    const chart = el('section', ''); chart.className = 'domain-chart'; chart.append(el('h3', 'Your answers by topic'));
    for (const [name, score] of domains) {
      const row = el('div', ''); row.className = 'domain-result';
      const label = el('p', `${name}: ${score.correct} of ${score.total} questions.`);
      const track = el('div', ''); track.className = 'domain-track'; track.setAttribute('aria-hidden', 'true');
      const fill = el('span', ''); fill.style.width = `${score.correct / score.total * 100}%`; track.append(fill); row.append(label, track); chart.append(row);
    }
    summary.append(chart);
    const suggestions = el('section', ''); suggestions.id = 'improvement-suggestions'; suggestions.append(el('h3', 'Suggestions for improvement'));
    const priority = ['upload','exception','detector','quote','manifest','task','calibrate','skill'];
    const missed = priority.filter(id => answers.some(a => a.q.id === id && !a.correct));
    const list = el('ul', '');
    if (missed.length) {
      suggestions.append(el('p', missed.length > 3 ? 'Start with these three suggestions based on your answers.' : 'Based on your answers, focus on the following.'));
      missed.slice(0,3).forEach(id => list.append(el('li', improvements[id])));
    } else {
      list.append(el('li', 'Keep comparing every new AI answer with the original, even when the same request worked well before.'), el('li', 'Keep using approved accounts and information. Staff should still own final scores and decisions.'));
    }
    suggestions.append(list); summary.append(suggestions);
    results.hidden = false; results.focus();
  });
  form.addEventListener('reset', () => {
    document.querySelectorAll('.answer-feedback').forEach(node => { node.hidden = true; node.replaceChildren(); });
    results.hidden = true; document.getElementById('results-summary').replaceChildren();
  });
})();
