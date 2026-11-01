// ============================================
// HERO CANVAS — neuronska mreža (kursor-reaktivna)
// ============================================

export function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let raf = null;
  let visible = true;

  const isMobile = window.innerWidth < 768;
  const NODE_COUNT = isMobile ? 18 : 70;
  const SYMBOL_COUNT = isMobile ? 4 : 16;
  const CONNECT = isMobile ? 110 : 150;

  const nodes = [];
  const symbols = [];
  const mouse = { x: null, y: null, active: false };

  const SYMBOLS = ['</>', 'ERP', 'MES', 'API', 'SQL', 'REST', 'GET', 'POST', 'C#', 'VS', 'AI', '{ }'];

  let colors = { primary: '56, 189, 248', accent: '14, 115, 231' };

  function hexToRgb(hex, fallback) {
    if (!hex) return fallback;
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }

  function readColors() {
    const style = getComputedStyle(document.documentElement);
    colors.accent = hexToRgb(style.getPropertyValue('--accent').trim(), '14, 115, 231');
    colors.primary = hexToRgb(style.getPropertyValue('--accent-2').trim(), '56, 189, 248');
  }

  function makeNode() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1.2 + Math.random() * 1.6,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.008 + Math.random() * 0.02,
      depth: 0.3 + Math.random() * 0.7
    };
  }

  function makeSymbol() {
    return {
      text: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      size: 10 + Math.random() * 6,
      opacity: 0.1 + Math.random() * 0.14,
      rot: (Math.random() - 0.5) * 0.3,
      rotSpeed: (Math.random() - 0.5) * 0.002,
      depth: 0.3 + Math.random() * 0.7
    };
  }

  function build() {
    nodes.length = 0;
    symbols.length = 0;
    for (let i = 0; i < NODE_COUNT; i++) nodes.push(makeNode());
    for (let i = 0; i < SYMBOL_COUNT; i++) symbols.push(makeSymbol());
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function onMove(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x >= 0 && x <= width && y >= 0 && y <= height) {
      mouse.x = x;
      mouse.y = y;
      mouse.active = true;
    } else {
      mouse.active = false;
    }
  }

  function onLeave() { mouse.active = false; }

  function update() {
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      n.pulse += n.pulseSpeed;

      // blago privlačenje ka kursoru
      if (mouse.active) {
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 180 && dist > 0.01) {
          const force = (1 - dist / 180) * 0.06 * n.depth;
          n.x += (dx / dist) * force;
          n.y += (dy / dist) * force;
        }
      }

      if (n.x < -10) n.x = width + 10;
      if (n.x > width + 10) n.x = -10;
      if (n.y < -10) n.y = height + 10;
      if (n.y > height + 10) n.y = -10;
    }

    for (const s of symbols) {
      s.x += s.vx;
      s.y += s.vy;
      s.rot += s.rotSpeed;

      if (mouse.active && !isMobile) {
        s.x += ((mouse.x - width / 2) / width) * s.depth * 0.5;
        s.y += ((mouse.y - height / 2) / height) * s.depth * 0.5;
      }

      if (s.x < -60) s.x = width + 60;
      if (s.x > width + 60) s.x = -60;
      if (s.y < -60) s.y = height + 60;
      if (s.y > height + 60) s.y = -60;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // veze među čvorovima
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < CONNECT) {
          const o = (1 - dist / CONNECT) * 0.4;
          ctx.strokeStyle = `rgba(${colors.accent}, ${o})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // veze ka kursoru
    if (mouse.active) {
      for (const n of nodes) {
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 200) {
          const o = (1 - dist / 200) * 0.6;
          ctx.strokeStyle = `rgba(${colors.primary}, ${o})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    // tech simboli
    for (const s of symbols) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      ctx.font = `500 ${s.size}px 'JetBrains Mono', monospace`;
      ctx.fillStyle = `rgba(${colors.primary}, ${s.opacity})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.text, 0, 0);
      ctx.restore();
    }

    // čvorovi sa glow
    for (const n of nodes) {
      const pulse = n.r + Math.sin(n.pulse) * 0.5;
      const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, pulse * 5);
      glow.addColorStop(0, `rgba(${colors.accent}, 0.5)`);
      glow.addColorStop(1, `rgba(${colors.accent}, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(n.x, n.y, pulse * 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(${colors.primary}, 0.9)`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, pulse, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop() {
    if (!visible) { raf = null; return; }
    update();
    draw();
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (!raf) raf = requestAnimationFrame(loop);
  }

  function stop() {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }

  readColors();
  resize();
  start();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { readColors(); resize(); }, 150);
  });

  window.addEventListener('mousemove', onMove, { passive: true });
  document.documentElement.addEventListener('mouseleave', onLeave);

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      });
    },
    { threshold: 0 }
  );
  io.observe(canvas);

  const mo = new MutationObserver(readColors);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
}
