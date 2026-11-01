// ============================================
// CUSTOM KURSOR — dot + trailing ring
// Samo na (hover:hover)+(pointer:fine), bez reduced motion
// ============================================

export function initCursor() {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!finePointer || reduced) return;

  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  document.documentElement.classList.add('has-cursor');

  const INTERACTIVE = 'a, button, [role="button"], [data-cursor], input, textarea, select, label';

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let visible = false;
  let pressed = false;
  let raf = null;

  function placeDot() {
    const scale = pressed ? 0.55 : 1;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%) scale(${scale})`;
  }

  function onMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!visible) {
      visible = true;
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    }
    placeDot();
  }

  function onOver(e) {
    if (e.target.closest(INTERACTIVE)) ring.classList.add('is-hover');
  }

  function onDown() { pressed = true; placeDot(); }
  function onUp() { pressed = false; placeDot(); }

  function onLeave() {
    visible = false;
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  }

  function loop() {
    // lerp — prsten kasni za tačkom (spring osjećaj)
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener('mousemove', onMove, { passive: true });
  document.addEventListener('mouseover', onOver, { passive: true });
  document.addEventListener('mousedown', onDown, { passive: true });
  document.addEventListener('mouseup', onUp, { passive: true });
  document.documentElement.addEventListener('mouseleave', onLeave);

  raf = requestAnimationFrame(loop);
}
