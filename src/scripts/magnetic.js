// ============================================
// MAGNETIC — dugmad se blago privlače ka kursoru
// Samo na (hover:hover)+(pointer:fine), bez reduced motion
// ============================================

export function initMagnetic() {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!finePointer || reduced) return;

  const els = Array.from(document.querySelectorAll('[data-magnetic]'));
  if (!els.length) return;

  const STRENGTH = 0.32;
  const RADIUS = 140;

  const state = els.map((el) => ({ el, tx: 0, ty: 0, cx: 0, cy: 0, x: 0, y: 0, hover: false }));

  els.forEach((item, i) => {
    const s = state[i];
    const el = item;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < RADIUS) {
        const pull = (1 - dist / RADIUS) * STRENGTH;
        s.tx = dx * pull;
        s.ty = dy * pull;
      } else {
        s.tx = 0;
        s.ty = 0;
      }
      s.hover = true;
    });

    el.addEventListener('mouseleave', () => {
      s.tx = 0;
      s.ty = 0;
      s.hover = false;
    });
  });

  function loop() {
    state.forEach((s) => {
      s.x += (s.tx - s.x) * 0.2;
      s.y += (s.ty - s.y) * 0.2;
      s.el.style.transform = `translate(${s.x}px, ${s.y}px)`;
    });
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
