(() => {
  const smaller = document.getElementById('guide-smaller');
  const larger = document.getElementById('guide-larger');
  const output = document.getElementById('guide-size');
  const jump = document.getElementById('guide-jump');
  const key = 'nspa-facilitator-text-size';
  let size = 20;
  try { const stored = Number(localStorage.getItem(key)); if (stored >= 18 && stored <= 36) size = stored; } catch {}
  function update() {
    document.documentElement.style.setProperty('--guide-size', `${size}px`);
    output.value = `${size} px`;
    smaller.disabled = size <= 18;
    larger.disabled = size >= 36;
    try { localStorage.setItem(key, String(size)); } catch {}
  }
  smaller.addEventListener('click', () => { size = Math.max(18, size - 2); update(); });
  larger.addEventListener('click', () => { size = Math.min(36, size + 2); update(); });
  function goToSlide() {
    const target = document.getElementById(jump.value);
    history.replaceState(null, '', '#' + jump.value);
    const toolsHeight = document.querySelector('.guide-tools').getBoundingClientRect().height;
    window.scrollTo({top: window.scrollY + target.getBoundingClientRect().top - toolsHeight - 16, behavior: 'instant'});
  }
  jump.addEventListener('change', goToSlide);
  if (document.getElementById(location.hash.slice(1))) jump.value = location.hash.slice(1);
  update();
  if (location.hash) requestAnimationFrame(goToSlide);
})();
