// Resource links in the slides can target a collapsed worked example or source list.
function revealLinkedSection() {
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  if (target?.tagName === 'DETAILS') {
    target.open = true;
    target.scrollIntoView({block: 'start'});
  }
}
window.addEventListener('hashchange', revealLinkedSection);
revealLinkedSection();

const sessionPath = location.pathname;
const promptingSession = sessionPath.includes('/prompting/') || sessionPath.endsWith('/p/ai-prompting-webdeck.html');
document.querySelectorAll('.workshop-nav a').forEach(link => {
  const promptingTab = link.pathname.includes('/prompting/');
  if (promptingTab === promptingSession) link.setAttribute('aria-current', 'page');
  else link.removeAttribute('aria-current');
});
