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

const currentWorkshopPath = location.pathname.replace(/index\.html$/, '').replace(/\/$/, '');
document.querySelectorAll('.workshop-nav a').forEach(link => {
  const path = link.pathname.replace(/index\.html$/, '').replace(/\/$/, '');
  if (!link.hash && path === currentWorkshopPath) link.setAttribute('aria-current', 'page');
});

// Existing slide source links now open the optional reference page directly.
if (location.hash === "#sources" && currentWorkshopPath.endsWith("/2026")) {
  location.replace(new URL("resources.html#sources", location.href));
}
