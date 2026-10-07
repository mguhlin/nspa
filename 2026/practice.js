document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
  const text = document.getElementById(button.dataset.copy).textContent;
  const status = document.querySelector('.copy-status');
  try {
    await navigator.clipboard.writeText(text);
    status.textContent = 'Copied. Use only the fictional practice packet.';
    button.textContent = 'Copied';
    setTimeout(() => { button.textContent = 'Copy text'; }, 1800);
  } catch {
    status.textContent = 'Select the text above and copy it manually.';
  }
}));

const drafts = [...document.querySelectorAll('[data-draft]')];
if (drafts.length) {
const draftStatus = document.querySelector('#draft-status');
const offlineDrafts = location.protocol === 'file:' || location.pathname.includes('/offline/');
const conversationDrafts = location.pathname.endsWith('/conversation.html');
const draftKey = conversationDrafts
  ? (offlineDrafts ? 'nspa-offline-conversation-v1' : 'nspa-conversation-v1')
  : (offlineDrafts ? 'nspa-offline-drafts-v1' : 'nspa-workshop-drafts-v1');
try {
  const saved = JSON.parse(localStorage.getItem(draftKey) || '{}');
  drafts.forEach(field => { field.value = typeof saved[field.dataset.draft] === 'string' ? saved[field.dataset.draft] : ''; });
} catch {
  draftStatus.textContent = 'Saved drafts could not be loaded. Export your work before leaving.';
}
drafts.forEach(field => field.addEventListener('input', () => {
  try {
    localStorage.setItem(draftKey, JSON.stringify(Object.fromEntries(drafts.map(field => [field.dataset.draft, field.value]))));
    draftStatus.textContent = 'Saved in this browser. Export a copy to keep.';
  } catch {
    draftStatus.textContent = 'Browser storage is unavailable. Export your drafts before leaving.';
  }
}));
document.querySelector('#export-drafts').addEventListener('click', () => {
  const text = 'NSPA 2026 workshop drafts\n\n' + drafts.map(field =>
    document.querySelector(`label[for="${field.id}"]`).textContent + '\n' + field.value
  ).join('\n\n');
  const url = URL.createObjectURL(new Blob([text], {type: 'text/plain;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = conversationDrafts ? 'nspa-conversation-notes.txt' : 'nspa-workshop-drafts.txt';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  draftStatus.textContent = 'Drafts exported.';
});
document.querySelector('#print-drafts').addEventListener('click', () => window.print());
window.addEventListener('beforeprint', () => drafts.forEach(field => {
  let output = field.nextElementSibling;
  if (!output?.classList.contains('print-answer')) {
    output = document.createElement('p');
    output.className = 'print-answer';
    field.after(output);
  }
  output.textContent = field.value || 'No response entered.';
}));
}
