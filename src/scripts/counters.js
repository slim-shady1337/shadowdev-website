// ============================================
// COUNTERS — animirani brojači
// ============================================

export function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function set(el, value) {
    el.textContent = String(value);
  }

  function animate(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (reduce) { set(el, target); return; }

    const duration = 1500;
    const start = performance.now();

    function frame(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      set(el, Math.round(eased * target));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach((el) => set(el, parseInt(el.dataset.count, 10) || 0));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  els.forEach((el) => io.observe(el));
}
