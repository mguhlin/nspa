const search = document.querySelector('#search');
const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = [...document.querySelectorAll('.topic-panel')];
const results = document.querySelector('#search-results');
const count = document.querySelector('#result-count');
const searchable = [...document.querySelectorAll('.quick-link, .resource-row')];
let selected = 'office';
document.querySelector('#search-tools').hidden = false;
document.querySelector('.topic-tabs').hidden = false;
document.querySelector('.compact-library').classList.add('enhanced');
function showTopic(id, focus = false) {
  selected = id;
  tabs.forEach(tab => {
    const active = tab.dataset.topic === id;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    if(active && focus) tab.focus();
  });
  panels.forEach(panel => {
    const active = panel.id === `panel-${id}`;
    panel.hidden = !active;
    panel.open = active;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `tab-${panel.id.replace('panel-', '')}`);
  });
  count.textContent = `${document.querySelector(`#panel-${id}`).querySelectorAll('.resource-row').length} resources in ${tabs.find(t=>t.dataset.topic===id).innerText.replace(/\d+$/, '').trim()}`;
}
function filterResources() {
  const query = search.value.trim().toLocaleLowerCase();
  results.replaceChildren();
  results.hidden = !query;
  document.querySelector('.topic-tabs').hidden = Boolean(query);
  document.querySelector('#empty').hidden = true;
  if (!query) {showTopic(selected); return;}
  panels.forEach(panel => panel.hidden = true);
  const matches = searchable.filter(link => (link.textContent+' '+(link.dataset.keywords||'')).toLocaleLowerCase().includes(query));
  for(const link of matches) {
    const clone = link.cloneNode(true); clone.className = 'resource-row';
    clone.querySelector('.quick-icon')?.remove();
    results.append(clone);
  }
  count.textContent = `${matches.length} matching resources across all topics`;
  document.querySelector('#empty').hidden = matches.length > 0;
}
tabs.forEach((tab,index) => {
 tab.addEventListener('click', () => showTopic(tab.dataset.topic));
 tab.addEventListener('keydown', event => {
  let next;
  if(event.key==='ArrowRight') next=(index+1)%tabs.length;
  if(event.key==='ArrowLeft') next=(index+tabs.length-1)%tabs.length;
  if(event.key==='Home') next=0;
  if(event.key==='End') next=tabs.length-1;
  if(next!==undefined){event.preventDefault();showTopic(tabs[next].dataset.topic,true);}
 });
});
search.addEventListener('input', filterResources);
showTopic(selected);
