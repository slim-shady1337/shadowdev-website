// ============================================
// HERO CANVAS ANIMATION
// Mreža čvorova + tech simboli + mouse parallax
// ============================================

export function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Ako korisnik ne želi animacije, ne pokreći
  if (prefersReducedMotion) return;

  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;

  // ============ STANJE ============
  const nodes = [];
  const symbols = [];
  const mouse = { x: null, y: null, active: false };

  // Tech simboli koji lebde
  const SYMBOLS = [
    '</>', '{ ONE FOR ALL }', 'API', 'SQL', 'MES', 'ERP',
    'REST', 'SELECT', 'GET', 'POST', 'C#', 'VS'
  ];

  // Broj elemenata – manje na mobilnom
const isMobile = window.innerWidth < 768;
const NODE_COUNT = isMobile ? 14 : 60;
const SYMBOL_COUNT = isMobile ? 4 : 18;
const CONNECT_DISTANCE = isMobile ? 110 : 160;

  // ============ BOJE (čitaju se iz CSS varijabli) ============
  let colors = {
    primary: '10, 84, 169',
    primaryLight: '26, 122, 224',
    text: '176, 190, 197'
  };

    function readColors() {
    const style = getComputedStyle(document.documentElement);
    const primaryHex = style.getPropertyValue('--primary').trim() || '#0A54A9';
    const primaryLightHex = style.getPropertyValue('--primary-light').trim() || '#1a7ae0';

    colors.primary = hexToRgb(primaryHex);
    colors.primaryLight = hexToRgb(primaryLightHex);
    // Simboli u crvenoj boji - u light modu tamnija, u dark svjetlija crvena
    const isDark = document.documentElement.classList.contains('dark');
    colors.symbol = isDark ? '255, 82, 82' : '220, 38, 38';
  }

  function hexToRgb(hex) {
    if (!hex) return '10, 84, 169';
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }

  // ============ INICIJALIZACIJA ============
  function createNode() {
    const speed = 0.15 + Math.random() * 0.25;
    const angle = Math.random() * Math.PI * 2;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 1.5 + Math.random() * 1.5,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.01 + Math.random() * 0.02,
      // Parallax faktor – svaki čvor malo drugačije reaguje
      parallax: 0.2 + Math.random() * 0.8
    };
  }

  function createSymbol() {
    return {
      text: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      fontSize: 11 + Math.random() * 6,
      opacity: 0.15 + Math.random() * 0.15,
      rotation: (Math.random() - 0.5) * 0.3,
      rotationSpeed: (Math.random() - 0.5) * 0.002,
      parallax: 0.3 + Math.random() * 0.7
    };
  }

  function init() {
    nodes.length = 0;
    symbols.length = 0;
    for (let i = 0; i < NODE_COUNT; i++) nodes.push(createNode());
    for (let i = 0; i < SYMBOL_COUNT; i++) symbols.push(createSymbol());
  }

  // ============ RESIZE ============
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    init();
  }

    // ============ MOUSE ============
    function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Reaguj samo ako je miš unutar hero sekcije
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      mouse.x = x;
      mouse.y = y;
      mouse.active = true;
    } else {
      mouse.active = false;
    }
  }

  function handleMouseLeave() {
    mouse.active = false;
    mouse.x = null;
    mouse.y = null;
  }

  // ============ CRTRANJE ============
  function draw() {
    ctx.clearRect(0, 0, width, height);

    // --- 1. Nacrtaj veze između čvorova ---
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECT_DISTANCE) {
          const opacity = (1 - dist / CONNECT_DISTANCE) * 0.55;
          ctx.strokeStyle = `rgba(${colors.primary}, ${opacity})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // --- 2. Nacrtaj veze ka mišu (samo ako je miš aktiv) ---
    if (mouse.active) {
      for (let i = 0; i < nodes.length; i++) {
        const dx = nodes[i].x - mouse.x;
        const dy = nodes[i].y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = isMobile ? 100 : 180;

        if (dist < maxDist) {
          const opacity = (1 - dist / maxDist) * 0.7;
          ctx.strokeStyle = `rgba(${colors.primaryLight}, ${opacity})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    // --- 3. Nacrtaj tech simbole ---
    symbols.forEach(s => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rotation);
      ctx.font = `700 ${s.fontSize}px 'Inter', monospace`;
      ctx.fillStyle = `rgba(${colors.symbol}, ${s.opacity})`;
      ctx.shadowColor = `rgba(${colors.symbol}, ${s.opacity * 0.8})`;
      ctx.shadowBlur = 8;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.text, 0, 0);
      ctx.restore();
    });

    // --- 4. Nacrtaj čvorove ---
    nodes.forEach(n => {
      n.pulse += n.pulseSpeed;
      const pulseSize = n.radius + Math.sin(n.pulse) * 0.5;

      // Glow oko čvora
      const gradient = ctx.createRadialGradient(
        n.x, n.y, 0,
        n.x, n.y, pulseSize * 4
      );
      gradient.addColorStop(0, `rgba(${colors.primary}, 0.4)`);
      gradient.addColorStop(1, `rgba(${colors.primary}, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(n.x, n.y, pulseSize * 4, 0, Math.PI * 2);
      ctx.fill();

      // Sam čvor
      ctx.fillStyle = `rgba(${colors.primary}, 0.9)`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, pulseSize, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // ============ AŽURIRANJE POZICIJA ============
  function update() {
    nodes.forEach(n => {
      // Bazno kretanje
      n.x += n.vx;
      n.y += n.vy;

      // Parallax efekat od miša (samo ako je miš aktivan)
      if (mouse.active && !isMobile) {
        const dx = mouse.x - width / 2;
        const dy = mouse.y - height / 2;
        // Blago privlačenje ka mišu, zavisi od parallax faktora
        n.x += (dx / width) * n.parallax * 0.4;
        n.y += (dy / height) * n.parallax * 0.4;
      }

      // Wrap-around: kada izađe sa jedne strane, pojavi se sa druge
      if (n.x < -10) n.x = width + 10;
      if (n.x > width + 10) n.x = -10;
      if (n.y < -10) n.y = height + 10;
      if (n.y > height + 10) n.y = -10;
    });

    symbols.forEach(s => {
      s.x += s.vx;
      s.y += s.vy;
      s.rotation += s.rotationSpeed;

      // Parallax za simbole
      if (mouse.active && !isMobile) {
        const dx = mouse.x - width / 2;
        const dy = mouse.y - height / 2;
        s.x += (dx / width) * s.parallax * 0.6;
        s.y += (dy / height) * s.parallax * 0.6;
      }

      // Wrap-around
      if (s.x < -50) s.x = width + 50;
      if (s.x > width + 50) s.x = -50;
      if (s.y < -50) s.y = height + 50;
      if (s.y > height + 50) s.y = -50;
    });
  }

  // ============ LOOP ============
  let animationId = null;
  let isVisible = true;

  function loop() {
    if (!isVisible) {
      animationId = null;
      return;
    }
    update();
    draw();
    animationId = requestAnimationFrame(loop);
  }

  function start() {
    if (animationId) return;
    animationId = requestAnimationFrame(loop);
  }

  function stop() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  // ============ INICIJALIZACIJA ============
  readColors();
  resize();
  start();

  // Event listeneri
  window.addEventListener('resize', () => {
    // Debounce resize
    clearTimeout(window._heroResizeTimer);
    window._heroResizeTimer = setTimeout(() => {
      readColors();
      resize();
    }, 150);
  });

  // Prati miš preko cijelog window-a (ne preko canvas-a)
  // Tako canvas ne mora imati pointer-events: auto
  window.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseleave', handleMouseLeave);

  // Touch podrška (mobile) – parallax na dodir
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
      mouse.active = true;
    }
  }, { passive: true });

  canvas.addEventListener('touchend', handleMouseLeave);

  // Reaguj na promjenu teme
  const observer = new MutationObserver(() => {
    readColors();
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  // Pauziraj animaciju kad hero nije vidljiv (perf)
  const intersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      if (isVisible) start();
      else stop();
    });
  }, { threshold: 0 });
  intersectionObserver.observe(canvas);
}