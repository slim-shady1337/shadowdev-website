// ============================================
// WORLD — putovanje kroz digitalni sistem
// Three.js + GSAP ScrollTrigger + Lenis
// ============================================

import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const COLORS = {
  bone: 0xe8e3d6,
  ember: 0xf0a23c,
  signal: 0x56e0c2,
  ash: 0x8a8a94
};

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function line(color, opacity = 0.5) {
  return new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
}

function edges(geo, color, opacity = 0.6) {
  return new THREE.LineSegments(new THREE.EdgesGeometry(geo), line(color, opacity));
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(240,162,60,1)');
  g.addColorStop(0.35, 'rgba(240,162,60,0.35)');
  g.addColorStop(1, 'rgba(240,162,60,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export async function initWorld() {
  const world = document.getElementById('world');
  const canvas = document.getElementById('world-canvas');
  const journey = document.getElementById('journey');
  if (!world || !canvas || !journey) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const probe = document.createElement('canvas');
  const gl = probe.getContext('webgl2') || probe.getContext('webgl');
  if (reduce || !gl) {
    document.documentElement.classList.add('no-3d');
    return;
  }

  const stationEls = Array.from(document.querySelectorAll('[data-station]'));
  const railFill = document.getElementById('rail-fill');
  const teleBar = document.getElementById('tele-bar');
  const teleValue = document.getElementById('tele-value');
  const teleStation = document.getElementById('tele-station');

  /* ---------- smooth scroll ---------- */
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  window.__lenis = lenis;

  // anchor navigacija kroz Lenis (CSS smooth scroll je isključen)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const targetEl = document.querySelector(id);
      if (!targetEl) return;
      e.preventDefault();
      lenis.scrollTo(targetEl, { offset: -72 });
    });
  });

  /* ---------- scene ---------- */
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x060609, 0.015);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 300);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  const isMobile = window.innerWidth < 768;
  const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.4 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  /* ---------- path ---------- */
  const pathPoints = [
    new THREE.Vector3(0, 0.2, 8),
    new THREE.Vector3(0.4, 0.1, -4),
    new THREE.Vector3(2.4, -0.5, -16),
    new THREE.Vector3(-2.4, 0.7, -28),
    new THREE.Vector3(2.4, -0.5, -40),
    new THREE.Vector3(-2.2, 0.6, -52),
    new THREE.Vector3(0.4, -0.1, -64),
    new THREE.Vector3(0, 0.2, -76)
  ];
  const curve = new THREE.CatmullRomCurve3(pathPoints, false, 'catmullrom', 0.5);

  /* ---------- particles ---------- */
  const pCount = isMobile ? 260 : 700;
  const pGeo = new THREE.BufferGeometry();
  const pArr = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pArr[i * 3] = (Math.random() - 0.5) * 44;
    pArr[i * 3 + 1] = (Math.random() - 0.5) * 26;
    pArr[i * 3 + 2] = 8 - Math.random() * 100;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
  const particles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({
      color: COLORS.bone,
      size: 0.06,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  scene.add(particles);

  /* ---------- fragments (start = chaos) ---------- */
  const fragments = [];
  const fragCount = isMobile ? 20 : 46;
  for (let i = 0; i < fragCount; i++) {
    const size = 0.14 + Math.random() * 0.32;
    const box = edges(new THREE.BoxGeometry(size, size, size), i % 4 === 0 ? COLORS.ember : COLORS.bone, 0.45);
    const scatter = new THREE.Vector3((Math.random() - 0.5) * 26, (Math.random() - 0.5) * 14, 8 + (Math.random() - 0.5) * 24);
    const converged = new THREE.Vector3((Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.6, 8 + (Math.random() - 0.5) * 1.6);
    box.position.copy(scatter);
    box.userData = { scatter, converged, spin: (Math.random() - 0.5) * 0.7 };
    fragments.push(box);
    scene.add(box);
  }

  /* ---------- stations ---------- */
  function buildERP() {
    const g = new THREE.Group();
    const R = 2.4;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const b = edges(new THREE.BoxGeometry(0.5, 0.5, 0.5), COLORS.bone, 0.55);
      b.position.set(Math.cos(a) * R, Math.sin(a) * R, 0);
      g.add(b);
      const ln = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R, 0), new THREE.Vector3(0, 0, 0)]),
        line(COLORS.signal, 0.28)
      );
      g.add(ln);
    }
    const hub = edges(new THREE.IcosahedronGeometry(0.4, 1), COLORS.ember, 0.9);
    g.add(hub);
    g.userData.hub = hub;
    return g;
  }

  function buildMES() {
    const g = new THREE.Group();
    const pulses = [];
    for (let i = 0; i < 5; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.35, 0.014, 6, 48),
        new THREE.MeshBasicMaterial({ color: COLORS.signal, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      ring.position.z = -4 + i * 2;
      g.add(ring);
    }
    for (let i = 0; i < 6; i++) {
      const s = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        new THREE.MeshBasicMaterial({ color: COLORS.ember, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      g.add(s);
      pulses.push(s);
    }
    g.userData.pulses = pulses;
    return g;
  }

  function buildCustom() {
    const g = new THREE.Group();
    const parts = [];
    for (let i = 0; i < 5; i++) {
      const p = edges(new THREE.BoxGeometry(0.7, 0.7, 0.7), i === 0 ? COLORS.ember : COLORS.bone, 0.55);
      const a = (i / 5) * Math.PI * 2;
      const scatter = new THREE.Vector3(Math.cos(a) * 2.6, Math.sin(a) * 2.6, (i - 2) * 0.8);
      const assembled = new THREE.Vector3(0, 0, (i - 2) * 0.55);
      p.position.copy(scatter);
      p.userData = { scatter, assembled };
      g.add(p);
      parts.push(p);
    }
    g.userData.parts = parts;
    return g;
  }

  function buildWeb() {
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const w = 2.2 + i * 0.38;
      const h = 1.35 + i * 0.24;
      const frame = edges(new THREE.BoxGeometry(w, h, 0.02), i === 0 ? COLORS.ember : COLORS.bone, 0.5);
      frame.position.z = 1.6 - i * 1.6;
      g.add(frame);
      const bar = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-w / 2 + 0.12, h / 2 - 0.12, 0.03), new THREE.Vector3(w / 2 - 0.12, h / 2 - 0.12, 0.03)]),
        line(COLORS.signal, 0.4)
      );
      bar.position.copy(frame.position);
      g.add(bar);
    }
    return g;
  }

  function buildMobile() {
    const g = new THREE.Group();
    const phone = edges(new THREE.BoxGeometry(1.1, 2.2, 0.12), COLORS.bone, 0.7);
    g.add(phone);
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.94, 2.0),
      new THREE.MeshBasicMaterial({ color: COLORS.signal, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false })
    );
    screen.position.z = 0.07;
    g.add(screen);
    return g;
  }

  function buildMarketing() {
    const g = new THREE.Group();
    const rings = [];
    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1 + i * 0.5, 0.012, 6, 64),
        new THREE.MeshBasicMaterial({ color: i % 2 ? COLORS.signal : COLORS.ember, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      g.add(ring);
      rings.push(ring);
    }
    g.userData.rings = rings;
    return g;
  }

  const defs = [
    { build: buildERP, offset: new THREE.Vector3(0, 0, 0) },
    { build: buildMES, offset: new THREE.Vector3(0, 0, 0) },
    { build: buildCustom, offset: new THREE.Vector3(0, 0, 0) },
    { build: buildWeb, offset: new THREE.Vector3(0, 0, 0) },
    { build: buildMobile, offset: new THREE.Vector3(-3.4, 0.4, 0) },
    { build: buildMarketing, offset: new THREE.Vector3(0, 0, 0) }
  ];

  const stationGroups = defs.map((def, i) => {
    const group = def.build();
    // vizuelno stanica stoji malo ispred tačke gdje kamera dolazi (vidi se dok prilazi)
    const t = (i + 1) / 7 + 0.028;
    group.position.copy(curve.getPoint(t)).add(def.offset);
    scene.add(group);
    return { group, t, progress: 0 };
  });

  /* ---------- core ---------- */
  const core = new THREE.Group();
  const coreIco = edges(new THREE.IcosahedronGeometry(0.8, 1), COLORS.ember, 0.9);
  core.add(coreIco);
  const coreSolid = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 1), new THREE.MeshBasicMaterial({ color: COLORS.ember }));
  core.add(coreSolid);
  const tex = glowTexture();
  [3.2, 5.4].forEach((s) => {
    const spr = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: tex, color: COLORS.ember, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    spr.scale.set(s, s, 1);
    core.add(spr);
  });
  core.position.copy(curve.getPoint(1));
  scene.add(core);

  /* ---------- scroll → camera mapping ---------- */
  let stationProgs = [];
  let mapping = [{ p: 0, t: 0 }, { p: 1, t: 1 }];
  let lastPct = -1;
  let lastIdx = -2;

  function computeLayout() {
    const vh = window.innerHeight;
    const jTop = journey.getBoundingClientRect().top + window.scrollY;
    const jH = journey.offsetHeight;
    const denom = Math.max(1, jH - vh);
    const raw = stationEls.map((el) => {
      const rect = el.getBoundingClientRect();
      const center = rect.top + window.scrollY + rect.height / 2;
      return clamp((center - vh / 2 - jTop) / denom, 0, 1);
    });
    let prev = 0;
    stationProgs = raw.map((p) => {
      const v = Math.max(p, prev + 0.0002);
      prev = v;
      return v;
    });
    mapping = [{ p: 0, t: 0 }];
    stationProgs.forEach((p, i) => mapping.push({ p, t: (i + 1) / 7 }));
    mapping.push({ p: 1, t: 1 });
    stationGroups.forEach((st, i) => { st.progress = stationProgs[i] ?? 0; });
  }

  function mapT(p) {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    for (let i = 0; i < mapping.length - 1; i++) {
      const a = mapping[i];
      const b = mapping[i + 1];
      if (p >= a.p && p <= b.p) {
        const span = b.p - a.p;
        const k = span <= 0 ? 0 : (p - a.p) / span;
        return a.t + (b.t - a.t) * k;
      }
    }
    return p;
  }

  function updateTelemetry(p) {
    const pct = Math.round(p * 100);
    if (pct !== lastPct) {
      lastPct = pct;
      if (teleValue) teleValue.textContent = String(pct).padStart(3, '0');
      if (teleBar) teleBar.style.width = `${pct}%`;
      if (railFill) railFill.style.height = `${pct}%`;
    }
    let idx = -1;
    stationProgs.forEach((sp, i) => { if (p >= sp - 0.015) idx = i; });
    if (idx !== lastIdx) {
      lastIdx = idx;
      stationEls.forEach((el, i) => el.classList.toggle('is-active', i === idx));
      document.querySelectorAll('[data-rail]').forEach((a) => {
        a.classList.toggle('is-active', Number(a.dataset.rail) === idx + 1);
      });
      if (teleStation) {
        if (idx >= 0) {
          const name = stationEls[idx].querySelector('h2')?.textContent?.trim().toUpperCase() || '';
          teleStation.textContent = `${String(idx + 1).padStart(2, '0')} / ${name}`;
        } else {
          teleStation.textContent = '00 / START';
        }
      }
    }
  }

  /* ---------- state ---------- */
  let progress = 0;
  let target = 0;
  const pointer = { x: 0, y: 0 };
  let time = 0;
  let running = false;
  let rafId = null;
  let journeyVisible = true;

  function frame(now) {
    if (!running) { rafId = null; return; }
    const dt = Math.min(0.05, (now - (frame.last || now)) / 1000) || 0.016;
    frame.last = now;
    time += dt;

    // frame-rate independent smoothing
    const k = 1 - Math.exp(-dt * 9);
    progress += (target - progress) * k;

    const t = mapT(progress);
    camera.position.copy(curve.getPoint(t));
    const look = curve.getPoint(Math.min(t + 0.02, 1)).clone();
    look.x += pointer.x * 0.12;
    look.y += pointer.y * 0.12;
    camera.lookAt(look);

    // fragments: chaos → convergence
    const fp = clamp(progress / 0.14, 0, 1);
    fragments.forEach((f) => {
      f.position.lerpVectors(f.userData.scatter, f.userData.converged, fp);
      f.rotation.x += dt * f.userData.spin;
      f.rotation.y += dt * f.userData.spin * 0.7;
    });

    // stations
    const erp = stationGroups[0];
    erp.group.rotation.z = Math.sin(time * 0.25) * 0.08;
    erp.group.userData.hub.rotation.y += dt * 0.6;

    const mes = stationGroups[1];
    mes.group.userData.pulses.forEach((s, i) => {
      s.position.z = ((time * 1.4 + i * 1.4) % 8) - 4;
      const a = time * 1.2 + i * 1.1;
      s.position.x = Math.cos(a) * 0.35;
      s.position.y = Math.sin(a) * 0.35;
      s.material.opacity = 0.55 + Math.sin(time * 3 + i) * 0.35;
    });

    const custom = stationGroups[2];
    const proxCustom = 1 - clamp(Math.abs(progress - custom.progress) / 0.05, 0, 1);
    custom.group.userData.parts.forEach((p) => {
      p.position.lerpVectors(p.userData.scatter, p.userData.assembled, proxCustom);
    });
    custom.group.rotation.y = time * 0.12;

    const mobile = stationGroups[4];
    mobile.group.rotation.y = 0.5 + Math.sin(time * 0.45) * 0.35;

    const marketing = stationGroups[5];
    marketing.group.userData.rings.forEach((r, i) => {
      const cyc = ((time * 0.22 + i * 0.25) % 1);
      const s = 1 + cyc * 1.7;
      r.scale.setScalar(s);
      r.material.opacity = 0.3 * (1 - cyc);
    });

    // core
    core.rotation.y += dt * 0.25;
    core.rotation.x += dt * 0.08;
    const pulse = 1 + Math.sin(time * 1.8) * 0.04;
    core.scale.setScalar(pulse);

    // particles drift
    particles.rotation.z = Math.sin(time * 0.05) * 0.05;

    renderer.render(scene, camera);
    world.classList.add('is-ready');
    updateTelemetry(progress);
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    frame.last = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  /* ---------- triggers ---------- */
  ScrollTrigger.create({
    trigger: journey,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => { target = self.progress; }
  });

  // pointer parallax (fine pointers only)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('pointermove', (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  // pause when journey is off-screen or tab hidden
  const io = new IntersectionObserver(
    (entries) => {
      journeyVisible = entries[0]?.isIntersecting ?? true;
      if (journeyVisible && !document.hidden) start();
      else stop();
    },
    { threshold: 0 }
  );
  io.observe(journey);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (journeyVisible) start();
  });

  // resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.4 : 1.75));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      computeLayout();
      ScrollTrigger.refresh();
    }, 160);
  });

  /* ---------- boot ---------- */
  computeLayout();
  updateTelemetry(0);
  ScrollTrigger.refresh();
  start();

  // debug / QA hook (ne utiče na rad sajta)
  window.__shadowdev = {
    getProgress: () => progress,
    getTarget: () => target,
    getT: () => mapT(progress),
    getStationProgress: () => stationProgs.slice()
  };

  // fonts/layout settle
  window.addEventListener('load', () => {
    computeLayout();
    ScrollTrigger.refresh();
  });
}
