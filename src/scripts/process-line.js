// ============================================
// PROCESS LINE — crta se pri skrolu
// ============================================

export function initProcessLine() {
  const line = document.getElementById('process-line');
  const fill = document.getElementById('process-line-fill');
  if (!line || !fill) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    fill.style.width = '100%';
    return;
  }

  function update() {
    const rect = line.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
    fill.style.width = `${progress * 100}%`;
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}
