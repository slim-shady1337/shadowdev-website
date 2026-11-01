// ============================================
// SCROLL REVEAL + hero mask reveal
// ============================================

const REDUCE = '(prefers-reduced-motion: reduce)';

export function initReveal() {
  const reduce = window.matchMedia(REDUCE).matches;
  const root = document.documentElement;

  // Hero mask reveal (wordmark izlazi iz maske)
  if (reduce) {
    root.classList.add('is-loaded');
  } else {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => root.classList.add('is-loaded'));
    });
  }

  // Scroll reveal za [data-reveal]
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const show = (el) => el.classList.add('is-in');

  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(show);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        show(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
  );

  items.forEach((el) => observer.observe(el));
}
