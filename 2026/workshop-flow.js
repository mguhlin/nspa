// One activity or readiness area at a time; all content remains available without JS.
(() => {
  const panels = [...document.querySelectorAll('[data-step]')];
  if (!panels.length) return;
  const links = [...document.querySelectorAll('[data-step-link]')];
  const pager = document.querySelector('[data-step-pager]');
  const status = document.querySelector('[data-step-status]');
  const previous = document.querySelector('[data-step-prev]');
  const next = document.querySelector('[data-step-next]');
  let selected = 0;

  function panelForHash() {
    let target;
    try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); }
    catch { return null; }
    return target?.closest('[data-step]') || null;
  }
  function show(index, focus = false) {
    selected = index;
    panels.forEach((panel, i) => { panel.hidden = i !== index; });
    links.forEach(link => {
      if (link.hash === '#' + panels[index].id) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
    const label = document.querySelector('[data-step-nav]').dataset.stepLabel || 'Activity';
    status.textContent = `${label} ${index + 1} of ${panels.length}`;
    previous.disabled = index === 0;
    next.disabled = index === panels.length - 1;
    if (focus) {
      panels[index].querySelector('h2').focus({preventScroll: true});
      panels[index].scrollIntoView({block: 'start'});
    }
  }
  function navigate(index) {
    try { history.pushState(null, '', '#' + panels[index].id); }
    catch { location.hash = panels[index].id; }
    show(index, true);
  }
  links.forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    navigate(panels.findIndex(panel => '#' + panel.id === link.hash));
  }));
  previous.addEventListener('click', () => navigate(Math.max(0, selected - 1)));
  next.addEventListener('click', () => navigate(Math.min(panels.length - 1, selected + 1)));
  window.addEventListener('hashchange', () => {
    const panel = panelForHash();
    if (panel) {
      show(panels.indexOf(panel));
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target.tagName === 'DETAILS') target.open = true;
      target.scrollIntoView({block: 'start'});
    }
  });
  pager.hidden = false;
  const initial = panelForHash();
  show(initial ? panels.indexOf(initial) : 0);
  if (initial) {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target.tagName === 'DETAILS') target.open = true;
    target.scrollIntoView({block: 'start'});
  }
})();
