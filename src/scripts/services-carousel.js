// ============================================
// SERVICES CAROUSEL
// Horizontal scroll sa strelicama, dots i touch swipe
// ============================================

export function initServicesCarousel() {
  const viewport = document.getElementById('services-viewport');
  const prevBtn = document.querySelector('[data-carousel-prev]');
  const nextBtn = document.querySelector('[data-carousel-next]');
  const dotsContainer = document.getElementById('services-dots');

  if (!viewport || !dotsContainer) return;

  const track = viewport.querySelector('.carousel-track');
  const cards = Array.from(viewport.querySelectorAll('.service-card'));
  if (!cards.length) return;

  // ============ POMOĆNE ============
  function getCardStep() {
    // Širina kartice + gap između kartica
    const cardStyle = getComputedStyle(cards[0]);
    const trackStyle = getComputedStyle(track);
    const gap = parseFloat(trackStyle.columnGap || trackStyle.gap || 24);
    return cards[0].offsetWidth + gap;
  }

  function getMaxScroll() {
    return viewport.scrollWidth - viewport.clientWidth;
  }

  // Koliko kartica stane u vidno polje
  function getVisibleCount() {
    const step = getCardStep();
    if (step <= 0) return 1;
    return Math.max(1, Math.round(viewport.clientWidth / step));
  }

  // ============ DOTS ============
  function buildDots() {
    dotsContainer.innerHTML = '';
    const totalSteps = cards.length - getVisibleCount() + 1;
    const steps = Math.max(1, totalSteps);

    for (let i = 0; i < steps; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Idi na karticu ${i + 1}`);
      dot.addEventListener('click', () => goToCard(i));
      dotsContainer.appendChild(dot);
    }
    updateDots();
  }

  function updateDots() {
    const step = getCardStep();
    if (step <= 0) return;
    const currentIndex = Math.round(viewport.scrollLeft / step);
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  // ============ NAVIGACIJA ============
  function goToCard(index) {
    const step = getCardStep();
    viewport.scrollTo({
      left: step * index,
      behavior: 'smooth'
    });
  }

  function updateArrows() {
    const max = getMaxScroll();
    if (prevBtn) {
      const disabled = viewport.scrollLeft <= 5;
      prevBtn.disabled = disabled;
      prevBtn.classList.toggle('disabled', disabled);
    }
    if (nextBtn) {
      const disabled = viewport.scrollLeft >= max - 5;
      nextBtn.disabled = disabled;
      nextBtn.classList.toggle('disabled', disabled);
    }
  }

  // ============ EVENT LISTENERI ============
  prevBtn?.addEventListener('click', () => {
    const step = getCardStep();
    viewport.scrollBy({ left: -step, behavior: 'smooth' });
  });

  nextBtn?.addEventListener('click', () => {
    const step = getCardStep();
    viewport.scrollBy({ left: step, behavior: 'smooth' });
  });

  viewport.addEventListener('scroll', () => {
    updateArrows();
    updateDots();
  }, { passive: true });

  // Debounced resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      updateArrows();
    }, 150);
  });

  // ============ INIT ============
  buildDots();
  updateArrows();
}