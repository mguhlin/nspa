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
    const list = document.createElement('ul');
    for (const [name, score] of domains) list.append(el('li', `${name}: ${score.correct} of ${score.total} scenarios.`));
    summary.append(list);
    const reconsider = answers.filter(a => !a.correct && a.confidence === 'Very confident');
    if (reconsider.length) summary.append(el('p', 'I felt very confident about a choice that differed from the recommended step. I can use that explanation as a starting point for discussion.'));
    const practice = answers.find(a => !a.correct) || answers.find(a => a.confidence === 'Unsure') || answers[0];
    const next = el('p', 'My next practice step: '); const link = el('a', practice.q.practice); link.href = practice.q.href; next.append(link); summary.append(next);
    results.hidden = false; results.focus();
  });
  form.addEventListener('reset', () => {
    document.querySelectorAll('.answer-feedback').forEach(node => { node.hidden = true; node.replaceChildren(); });
    results.hidden = true; document.getElementById('reflection').value = ''; document.getElementById('assessment-status').textContent = ''; answers = [];
  });
  document.getElementById('export-reflection').addEventListener('click', () => {
    const lines = ['MY TRUST, TRANSPARENCY, AND AI REFLECTION', 'Informal learning exercise. Answers are not submitted.', ''];
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
