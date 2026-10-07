// Native details keeps Resources usable without JavaScript.
const menus = [...document.querySelectorAll('.resource-menu')];
menus.forEach(menu => menu.addEventListener('toggle', () => {
  if (menu.open) menus.forEach(other => { if (other !== menu) other.open = false; });
}));
document.addEventListener('click', event => menus.forEach(menu => {
  if (!menu.contains(event.target)) menu.open = false;
}));
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const open = menus.find(menu => menu.open);
  if (open) { open.open = false; open.querySelector('summary').focus(); event.preventDefault(); }
});
function legacyCollectionLink() {
  if (!document.getElementById('hero-title')) return;
  const destinations = { '#library': 'resources/library.html#library', '#infographics': 'resources/infographics.html#infographics' };
  if (destinations[location.hash]) location.replace(destinations[location.hash]);
}
window.addEventListener('hashchange', legacyCollectionLink);
legacyCollectionLink();
