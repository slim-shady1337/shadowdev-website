// ============================================
// TESTIMONIALS — auto-advancing slider
// ============================================

export function initTestimonials() {
  const track = document.getElementById('testimonial-track');
  const dotsContainer = document.getElementById('testimonial-dots');
  if (!track || !dotsContainer) return;

  const slides = Array.from(track.children);
  const count = slides.length;
  if (count <= 1) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const INTERVAL = 5200;

  let index = 0;
  let timer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testimonial-dot';
    dot.setAttribute('aria-label', `Svjedočanstvo ${i + 1}`);
    dot.addEventListener('click', () => { goTo(i); restart(); });
    dotsContainer.appendChild(dot);
  });

  function goTo(i) {
    index = (i + count) % count;
    track.style.transform = `translateX(-${index * 100}%)`;
    dotsContainer.querySelectorAll('.testimonial-dot').forEach((d, j) => {
      d.classList.toggle('active', j === index);
    });
  }

  function restart() {
    if (reduce) return;
    clearInterval(timer);
    timer = setInterval(() => goTo(index + 1), INTERVAL);
  }

  goTo(0);

  if (reduce) return;

  restart();
  track.addEventListener('mouseenter', () => clearInterval(timer));
  track.addEventListener('mouseleave', restart);

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) restart();
        else clearInterval(timer);
      });
    },
    { threshold: 0.2 }
  );
  io.observe(track);
}
