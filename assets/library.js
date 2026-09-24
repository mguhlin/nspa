const search = document.querySelector('#search');
const category = document.querySelector('#category');
const cards = [...document.querySelectorAll('.resource')];
document.querySelector('#search-tools').hidden = false;
function filterResources() {
  const query = search.value.trim().toLocaleLowerCase();
  let count = 0;
  for (const card of cards) {
    const visible = (!category.value || card.dataset.category === category.value) && card.textContent.toLocaleLowerCase().includes(query);
    card.hidden = !visible;
    if (visible) count++;
  }
  document.querySelector('#result-count').textContent = `${count} ${count === 1 ? 'resource' : 'resources'} to explore`;
  document.querySelector('#empty').hidden = count > 0;
}
search.addEventListener('input', filterResources);
category.addEventListener('change', filterResources);
filterResources();
