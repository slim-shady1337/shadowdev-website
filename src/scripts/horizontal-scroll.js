// ============================================
// HORIZONTAL SCROLL — pinned usluge (desktop)
// Robusno na resize / rotaciju / promjenu breakpointa
// ============================================

export function initHorizontalScroll() {
  const section = document.getElementById('services-h');
  const track = document.getElementById('services-track');
  const bar = document.getElementById('services-progress-bar');
  if (!section || !track) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const desktop = window.matchMedia('(min-width: 1024px)');

  let distance = 0;
  let enabled = false;

  function reset() {
    enabled = false;
    section.style.height = '';
    track.style.transform = '';
    if (bar) bar.style.width = '0%';
  }

  function measure() {
    if (!desktop.matches) {
      reset();
      return;
    }
    distance = track.scrollWidth - window.innerWidth;
    if (distance <= 0) {
      reset();
      return;
    }
    enabled = true;
    section.style.height = `calc(100svh + ${distance}px)`;
  }

  function onScroll() {
    if (!enabled || !desktop.matches) return;
    const rect = section.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -rect.top / distance));
    track.style.transform = `translateX(${-progress * distance}px)`;
    if (bar) bar.style.width = `${progress * 100}%`;
  }

  measure();
  onScroll();

  window.addEventListener('scroll', onScroll, { passive: true });
  desktop.addEventListener('change', () => {
    measure();
    onScroll();
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      measure();
      onScroll();
    }, 120);
  });
}
