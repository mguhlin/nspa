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
