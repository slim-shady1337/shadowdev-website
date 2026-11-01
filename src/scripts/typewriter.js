// ============================================
// TYPEWRITER — hero terminal linija
// ============================================

export function initTypewriter() {
  const el = document.getElementById('hero-type');
  if (!el) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const PHRASES = ['ERP & MES sistemi', 'Web & App development', 'Digitalni marketing'];

  if (reduce) {
    el.textContent = PHRASES[0];
    return;
  }

  const TYPE_MS = 55;
  const DELETE_MS = 28;
  const HOLD_MS = 1900;

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const phrase = PHRASES[phraseIndex];

    if (!deleting) {
      charIndex++;
      el.textContent = phrase.slice(0, charIndex);
      if (charIndex === phrase.length) {
        deleting = true;
        setTimeout(tick, HOLD_MS);
        return;
      }
      setTimeout(tick, TYPE_MS);
    } else {
      charIndex--;
      el.textContent = phrase.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % PHRASES.length;
        setTimeout(tick, 350);
        return;
      }
      setTimeout(tick, DELETE_MS);
    }
  }

  setTimeout(tick, 600);
}
