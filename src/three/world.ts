/* ==========================================================================
   The assembly — a lazily mounted WebGL scene.
   Six stations along one axis; the parts are business artifacts, cast in
   graphite and lit only on their edges. Scroll drives the camera; the last
   stretch pours every station into one core.
   ========================================================================== */

import * as THREE from 'three';

export type WorldOptions = {
  mobile: boolean;
  narrow: boolean;
};

export type WorldHandle = {
  setProgress: (p: number) => void;
  setActive: (index: number) => void;
  setPointer: (x: number, y: number) => void;
  start: () => void;
  stop: () => void;
  dispose: () => void;
};

/* deterministic noise so screenshots and QA runs are stable */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const INK = 0xecede8;
const STEEL = 0x8c9298;
const HEAT = 0xff5e1f;
const EMBER = 0xff9911;

/* --------------------------------------------------------------------------
   geometry helpers
   -------------------------------------------------------------------------- */

function chamferShape(w: number, h: number, c: number) {
  const hw = w / 2;
  const hh = h / 2;
  const s = new THREE.Shape();
  s.moveTo(-hw, -hh);
  s.lineTo(hw - c, -hh);
  s.lineTo(hw, -hh + c);
  s.lineTo(hw, hh);
  s.lineTo(-hw, hh);
  s.lineTo(-hw, -hh);
  return s;
}

function chamferBox(w: number, h: number, d: number, c = 0.06) {
  const g = new THREE.ExtrudeGeometry(chamferShape(w, h, c), {
    depth: d,
    bevelEnabled: false,
    curveSegments: 1
  });
  g.translate(0, 0, -d / 2);
  return g;
}

/* --------------------------------------------------------------------------
   document textures — the artifacts a firm actually runs on
   -------------------------------------------------------------------------- */

type DocKind = 'ledger' | 'order' | 'chart' | 'phone' | 'web' | 'signal';

function docTexture(kind: DocKind): THREE.CanvasTexture {
  const W = 340;
  const H = 460;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  x.fillStyle = '#101416';
  x.fillRect(0, 0, W, H);

  const line = (a: number) => `rgba(140,146,152,${a})`;
  const heat = (a: number) => `rgba(255,94,31,${a})`;

  x.lineWidth = 1;

  if (kind === 'ledger') {
    // header band
    x.fillStyle = 'rgba(255,94,31,.14)';
    x.fillRect(18, 18, W - 36, 30);
    x.strokeStyle = heat(0.85);
    x.strokeRect(18.5, 18.5, W - 37, 29);
    // grid
    const cols = 5;
    const rows = 14;
    const cw = (W - 36) / cols;
    const rh = 24;
    for (let r = 0; r <= rows; r++) {
      x.strokeStyle = line(r === 0 ? 0.4 : 0.16);
      x.beginPath();
      x.moveTo(18, 62 + r * rh);
      x.lineTo(W - 18, 62 + r * rh);
      x.stroke();
    }
    for (let i = 0; i <= cols; i++) {
      x.strokeStyle = line(0.16);
      x.beginPath();
      x.moveTo(18 + i * cw, 62);
      x.lineTo(18 + i * cw, 62 + rows * rh);
      x.stroke();
    }
    // cells that carry heat
    const lit = [
      [2, 3],
      [4, 6],
      [1, 9],
      [3, 11]
    ];
    x.fillStyle = heat(0.62);
    for (const [cc, rr] of lit) x.fillRect(18 + cc * cw + 1, 62 + rr * rh + 1, cw - 2, rh - 2);
    // figures
    for (let r = 0; r < rows; r++) {
      for (let i = 1; i < cols; i++) {
        x.strokeStyle = line(0.32);
        x.beginPath();
        x.moveTo(18 + i * cw + 7, 62 + r * rh + rh / 2);
        x.lineTo(18 + i * cw + cw - 9, 62 + r * rh + rh / 2);
        x.stroke();
      }
    }
  }

  if (kind === 'order') {
    x.strokeStyle = line(0.5);
    x.strokeRect(20.5, 20.5, W - 41, H - 41);
    x.fillStyle = heat(0.9);
    x.fillRect(20, 20, W - 40, 6);
    // barcode
    const bx = 40;
    let bx2 = bx;
    const rnd = mulberry32(11);
    while (bx2 < W - 40) {
      const w = 1 + Math.floor(rnd() * 4);
      if (rnd() > 0.42) {
        x.fillStyle = `rgba(236,237,232,${0.55 + rnd() * 0.35})`;
        x.fillRect(bx2, 70, w, 96);
      }
      bx2 += w + 2 + Math.floor(rnd() * 4);
    }
    // ruled lines of an order form
    for (let i = 0; i < 7; i++) {
      const y = 200 + i * 30;
      x.strokeStyle = line(0.2);
      x.beginPath();
      x.moveTo(40, y);
      x.lineTo(W - 40, y);
      x.stroke();
      x.fillStyle = line(0.55);
      x.fillRect(40, y - 10, 46, 3);
    }
    x.fillStyle = heat(0.8);
    x.fillRect(W - 96, H - 70, 56, 26);
  }

  if (kind === 'chart') {
    // axes
    x.strokeStyle = line(0.45);
    x.beginPath();
    x.moveTo(36, 40);
    x.lineTo(36, H - 60);
    x.lineTo(W - 28, H - 60);
    x.stroke();
    const bars = 9;
    const bw = (W - 80) / bars;
    for (let i = 0; i < bars; i++) {
      const h = 40 + Math.abs(Math.sin(i * 1.7)) * (H - 190);
      const isHot = i > bars - 3;
      x.fillStyle = isHot ? heat(0.8) : line(0.22);
      x.fillRect(42 + i * bw, H - 60 - h, bw - 8, h);
    }
    // trend line
    x.strokeStyle = heat(0.95);
    x.lineWidth = 1.6;
    x.beginPath();
    for (let i = 0; i < bars; i++) {
      const h = 40 + Math.abs(Math.sin(i * 1.7)) * (H - 190);
      const px = 42 + i * bw + (bw - 8) / 2;
      const py = H - 60 - h - 12;
      i === 0 ? x.moveTo(px, py) : x.lineTo(px, py);
    }
    x.stroke();
    x.lineWidth = 1;
  }

  if (kind === 'phone') {
    x.strokeStyle = line(0.55);
    x.beginPath();
    x.roundRect(80, 18, W - 160, H - 36, 22);
    x.stroke();
    // status + list rows
    x.fillStyle = line(0.3);
    x.fillRect(96, 60, W - 192, 3);
    for (let i = 0; i < 6; i++) {
      const y = 96 + i * 48;
      x.strokeStyle = line(0.14);
      x.strokeRect(96.5, y + 0.5, W - 193, 38);
      x.fillStyle = line(0.4);
      x.fillRect(108, y + 12, 90, 5);
      x.fillRect(108, y + 24, 56, 3);
      if (i < 2) {
        x.fillStyle = heat(0.8);
        x.fillRect(W - 130, y + 14, 22, 10);
      }
    }
    x.fillStyle = heat(0.9);
    x.fillRect(96, H - 92, W - 192, 34);
  }

  if (kind === 'web') {
    x.strokeStyle = line(0.5);
    x.strokeRect(18.5, 18.5, W - 37, H - 37);
    x.fillStyle = line(0.22);
    x.fillRect(19, 19, W - 38, 26);
    for (let i = 0; i < 3; i++) {
      x.fillStyle = line(0.4);
      x.beginPath();
      x.arc(34 + i * 14, 32, 3.5, 0, 7);
      x.fill();
    }
    // hero block + columns
    x.fillStyle = heat(0.55);
    x.fillRect(32, 64, W - 64, 92);
    x.fillStyle = line(0.35);
    x.fillRect(32, 176, (W - 78) / 2, 8);
    x.fillRect(32, 194, (W - 78) / 2.6, 8);
    for (let i = 0; i < 3; i++) {
      x.strokeStyle = line(0.16);
      x.strokeRect(32.5, 236 + i * 62.5, W - 65, 48);
      x.fillStyle = line(0.3);
      x.fillRect(44, 252 + i * 62.5, 90, 4);
      x.fillRect(44, 264 + i * 62.5, 140, 4);
    }
    x.fillStyle = heat(0.9);
    x.fillRect(32, H - 66, 88, 26);
  }

  if (kind === 'signal') {
    const cx = W / 2;
    const cy = H / 2;
    for (let i = 1; i <= 7; i++) {
      x.strokeStyle = i === 7 ? heat(0.85) : line(0.1 + i * 0.03);
      x.beginPath();
      x.arc(cx, cy, i * 26, Math.PI * 1.12, Math.PI * 1.88);
      x.stroke();
      x.beginPath();
      x.arc(cx, cy, i * 26, Math.PI * 0.12, Math.PI * 0.88);
      x.stroke();
    }
    x.fillStyle = heat(0.95);
    x.beginPath();
    x.arc(cx, cy, 9, 0, 7);
    x.fill();
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const r = 30 + (i % 5) * 22;
      x.fillStyle = line(0.35);
      x.fillRect(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2, 2);
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 2;
  return tex;
}

/* --------------------------------------------------------------------------
   mount
   -------------------------------------------------------------------------- */

export function mountWorld(canvas: HTMLCanvasElement, opts: WorldOptions): WorldHandle {
  const mobile = opts.mobile;
  const narrow = opts.narrow;
  const reduced = false;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !mobile,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setClearAlpha(0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b0d0e, mobile ? 0.024 : 0.019);

  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 320);

  const hemi = new THREE.HemisphereLight(0x39424a, 0x070809, 1.35);
  scene.add(hemi);

  const keyLight = new THREE.DirectionalLight(EMBER, 2.1);
  keyLight.position.set(6, 7, 5);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(HEAT, 1.1);
  rimLight.position.set(-6, 3, -8);
  scene.add(rimLight);

  const fill = new THREE.DirectionalLight(0x9fb0b8, 0.5);
  fill.position.set(0, 2, 8);
  scene.add(fill);

  const coreLight = new THREE.PointLight(HEAT, 0, 42, 2);
  scene.add(coreLight);

  /* shared materials */
  const matPlate = new THREE.MeshStandardMaterial({
    color: 0x1a2023,
    roughness: 0.55,
    metalness: 0.35,
    flatShading: true
  });
  const matPlateDeep = new THREE.MeshStandardMaterial({
    color: 0x0e1214,
    roughness: 0.5,
    metalness: 0.55,
    flatShading: true
  });
  const matHeat = new THREE.MeshBasicMaterial({ color: HEAT });
  const matEmber = new THREE.MeshBasicMaterial({ color: EMBER });
  const matInk = new THREE.MeshBasicMaterial({ color: INK });

  /* path */
  const PATH: THREE.Vector3[] = [
    new THREE.Vector3(0, 1.5, 13),
    new THREE.Vector3(2.2, 1.1, 0.5),
    new THREE.Vector3(-2.4, 1.6, -12.5),
    new THREE.Vector3(2.4, 1.1, -25.5),
    new THREE.Vector3(-2.2, 1.4, -38.5),
    new THREE.Vector3(2.3, 1.7, -51.5),
    new THREE.Vector3(-2.0, 1.2, -64.5),
    new THREE.Vector3(0, 1.6, -78)
  ];
  const curvePos = new THREE.CatmullRomCurve3(PATH, false, 'catmullrom', 0.35);
  // On desktop the flight looks slightly right and down: that is where a part sits.
  // On a phone the part sits above the text instead, so the frame stays whole.
  const lookPoints = PATH.map((v) =>
    new THREE.Vector3(
      v.x + (narrow ? 0.12 : 0.65),
      v.y - (narrow ? 0.1 : 0.95),
      v.z - 7.2
    )
  );
  const curveLook = new THREE.CatmullRomCurve3(lookPoints, false, 'catmullrom', 0.35);

  /* The hero's own drawing is no longer part of this scene: it is the Hub
     figure in the page, drawn in SVG (src/scripts/hero-figure.ts). The camera
     starts on an empty field and meets the first station as you scroll. */

  /* ---- stations ---------------------------------------------------------- */
  type Station = { group: THREE.Group; home: THREE.Vector3; edges: THREE.LineBasicMaterial[]; scale: number };
  const stations: Station[] = [];

  function stationShell(index: number, scale = 1.5) {
    const group = new THREE.Group();
    const edgeMats: THREE.LineBasicMaterial[] = [];
    const at = PATH[index + 1];
    if (narrow) {
      // centred above the copy: the camera shifts laterally, so the group follows it
      group.position.set(at.x, at.y + 2.8, at.z - 11);
      group.scale.setScalar(scale * 0.76);
    } else {
      // the part sits ahead and right of the camera, in the half the page leaves free
      group.position.set(at.x + 2.4, at.y - 1.3, at.z - 7.6);
      group.scale.setScalar(scale);
    }
    scene.add(group);
    stations.push({ group, home: group.position.clone(), edges: edgeMats, scale: group.scale.x });
    return { group, edgeMats };
  }

  function addPart(
    group: THREE.Group,
    edgeMats: THREE.LineBasicMaterial[],
    geo: THREE.BufferGeometry,
    pos: [number, number, number],
    rot: [number, number, number] = [0, 0, 0],
    hot = false
  ) {
    const mesh = new THREE.Mesh(geo, hot ? matPlateDeep : matPlate);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    const mat = new THREE.LineBasicMaterial({
      color: hot ? HEAT : STEEL,
      transparent: true,
      opacity: hot ? 0.75 : 0.3
    });
    mat.userData.base = mat.opacity;
    mat.userData.hot = hot;
    edgeMats.push(mat);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 20), mat);
    mesh.add(edges);
    group.add(mesh);
    return mesh;
  }

  function addLine(
    group: THREE.Group,
    a: THREE.Vector3,
    b: THREE.Vector3,
    color = HEAT,
    opacity = 0.55
  ) {
    const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    group.add(new THREE.Line(geo, mat));
  }

  /* 01 — business system: modules wired to one hub, seen head on */
  {
    const { group, edgeMats } = stationShell(0, 1.45);
    const hub = addPart(
      group,
      edgeMats,
      new THREE.CylinderGeometry(0.62, 0.62, 0.16, 6),
      [0, 0, 0],
      [Math.PI / 2, 0, Math.PI / 6],
      true
    );
    hub.name = 'hub';
    const hubRing = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.008, 5, 64), matHeat);
    hubRing.position.z = 0.12;
    group.add(hubRing);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * 1.45;
      const y = Math.sin(a) * 1.45;
      addPart(group, edgeMats, chamferBox(0.58, 0.58, 0.14, 0.09), [x, y, 0], [0, 0, a + Math.PI / 4], i === 0);
      addLine(
        group,
        new THREE.Vector3(Math.cos(a) * 0.72, Math.sin(a) * 0.72, 0),
        new THREE.Vector3(x - Math.cos(a) * 0.34, y - Math.sin(a) * 0.34, 0),
        i === 0 ? HEAT : STEEL,
        i === 0 ? 0.85 : 0.32
      );
    }
  }

  /* 02 — production: drawn as the Hairline "Slow" figure in the page
     (src/scripts/station-figure.ts). The shell stays so station order and the
     camera anchors keep their indices; it holds no geometry. */
  {
    stationShell(1, 1.28);
  }

  /* 03 — custom: scattered parts stack into one part as the section passes */
  {
    const { group, edgeMats } = stationShell(2, 1.6);
    const parts: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const mesh = addPart(
        group,
        edgeMats,
        chamferBox(0.82, 0.82, 0.09, 0.11),
        [0, 0, 0],
        [0, 0, 0],
        i === 0
      );
      parts.push(mesh);
    }
    (group as any).__parts = parts;
  }

  /* 04 — web: stacked plates of a layered interface */
  {
    const { group, edgeMats } = stationShell(3, 1.62);
    for (let i = 0; i < 5; i++) {
      addPart(
        group,
        edgeMats,
        chamferBox(2.0 - i * 0.12, 1.18, 0.03, 0.1),
        [i * 0.06, i * 0.12, i * 0.34 - 0.7],
        [0, 0, 0],
        i === 4
      );
    }
    addPart(group, edgeMats, chamferBox(1.2, 0.06, 0.06, 0.02), [0, -0.68, 0.2]);
  }

  /* 05 — mobile: a machined billet that turns */
  {
    const { group, edgeMats } = stationShell(4, 2.0);
    const phone = addPart(group, edgeMats, chamferBox(0.78, 1.55, 0.09, 0.12), [0, 0, 0], [0, 0.3, 0], true);
    const screenGeo = new THREE.PlaneGeometry(0.62, 1.3);
    const mat = new THREE.MeshBasicMaterial({
      map: docTexture('phone'),
      transparent: true,
      opacity: 0.9,
      toneMapped: false
    });
    const screen = new THREE.Mesh(screenGeo, mat);
    screen.position.z = 0.051;
    phone.add(screen);
    addPart(group, edgeMats, chamferBox(0.5, 0.9, 0.06, 0.08), [-1.05, -0.32, 0.4], [0, 0.5, 0], false);
  }

  /* 06 — marketing: reach, ring by ring, facing the reader */
  {
    const { group, edgeMats } = stationShell(5, 1.55);
    for (let i = 0; i < 4; i++) {
      const geo = new THREE.TorusGeometry(0.42 + i * 0.36, 0.007, 5, 72);
      const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshBasicMaterial({
          color: i === 3 ? HEAT : STEEL,
          transparent: true,
          opacity: i === 3 ? 0.9 : 0.34
        })
      );
      mesh.position.z = -i * 0.12;
      group.add(mesh);
    }
    addPart(group, edgeMats, chamferBox(0.34, 0.34, 0.34, 0.06), [0, 0, 0.2], [0.35, 0.55, 0], true);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const dot = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.045), matEmber);
      const r = 0.7 + (i % 4) * 0.32;
      dot.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.1);
      group.add(dot);
    }
  }

  /* ---- the core --------------------------------------------------------- */
  const core = new THREE.Group();
  core.position.copy(PATH[7]).add(new THREE.Vector3(0, 0.15, -13));
  scene.add(core);

  const corePrism = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 0.95, 0.42, 6, 1, false),
    new THREE.MeshStandardMaterial({
      color: 0x1a1114,
      roughness: 0.35,
      metalness: 0.6,
      emissive: HEAT,
      emissiveIntensity: 0.12,
      flatShading: true
    })
  );
  corePrism.rotation.x = Math.PI / 2;
  core.add(corePrism);

  const coreRingMat = new THREE.MeshBasicMaterial({ color: HEAT, transparent: true, opacity: 0.8 });
  const coreRing = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.008, 5, 96), coreRingMat);
  core.add(coreRing);

  const glowTexture = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,150,80,.95)');
    grad.addColorStop(0.35, 'rgba(255,94,31,.42)');
    grad.addColorStop(1, 'rgba(255,94,31,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();

  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.55,
      toneMapped: false
    })
  );
  glow.scale.setScalar(4.2);
  core.add(glow);

  /* six parts that spiral into the core as the journey ends */
  const pourParts: THREE.Mesh[] = [];
  for (let i = 0; i < 6; i++) {
    const geo = chamferBox(0.3, 0.3, 0.06, 0.05);
    const mesh = new THREE.Mesh(geo, matPlateDeep);
    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: i === 0 ? HEAT : STEEL, transparent: true, opacity: 0.3 })
    );
    mesh.add(edge);
    (mesh as any).userData.edge = edge;
    core.add(mesh);
    pourParts.push(mesh);
  }

  /* ---- embers ----------------------------------------------------------- */
  const emberCount = mobile ? 90 : 220;
  const emberPos = new Float32Array(emberCount * 3);
  const emberSeed = mulberry32(9);
  for (let i = 0; i < emberCount; i++) {
    emberPos[i * 3] = (emberSeed() - 0.5) * 26;
    emberPos[i * 3 + 1] = (emberSeed() - 0.5) * 12;
    emberPos[i * 3 + 2] = 8 - emberSeed() * 92;
  }
  const emberGeo = new THREE.BufferGeometry();
  emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
  const embers = new THREE.Points(
    emberGeo,
    new THREE.PointsMaterial({
      color: EMBER,
      size: 0.045,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false
    })
  );
  scene.add(embers);

  /* ---- state ------------------------------------------------------------ */
  let target = 0;
  let current = 0;
  let active = 0;
  let pointerX = 0;
  let pointerY = 0;
  let px = 0;
  let py = 0;
  let raf = 0;
  let running = false;
  let last = performance.now();
  let elapsed = 0;
  const tmpPos = new THREE.Vector3();
  const tmpLook = new THREE.Vector3();

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = narrow ? 58 : 46;
    camera.updateProjectionMatrix();
  }

  function frame(now: number) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    elapsed += dt;

    current += (target - current) * Math.min(1, dt * 7.5);
    px += (pointerX - px) * Math.min(1, dt * 4);
    py += (pointerY - py) * Math.min(1, dt * 4);

    const t = clamp01(current);
    curvePos.getPoint(t, tmpPos);
    curveLook.getPoint(t, tmpLook);

    const converge = smooth(0.9, 1, t);

    camera.position.copy(tmpPos);
    camera.position.x += px * 0.6 * (1 - converge);
    camera.position.y += py * 0.35 * (1 - converge) + Math.sin(elapsed * 0.28) * 0.05;
    camera.position.z -= converge * 6;
    camera.lookAt(tmpLook);

    /* stations: each part arrives with its section, then cools out of sight */
    const pour = smooth(0.87, 0.965, t);
    stations.forEach((s, i) => {
      const rel = t - (i + 1) / 7;
      const near = clamp01(1 - Math.abs(rel) / 0.075);
      const alive = near * (1 - pour);
      s.group.visible = alive > 0.004;

      s.group.position.set(s.home.x + (1 - near) * 6, s.home.y, s.home.z);
      s.group.scale.setScalar(s.scale * (0.82 + 0.18 * near) * (1 - pour * 0.95));
      s.group.rotation.y = Math.sin(elapsed * 0.12 + i) * 0.04;

      for (const m of s.edges) {
        const base = (m.userData.base as number) ?? 0.3;
        m.opacity = m.userData.hot
          ? base * (0.35 + 0.85 * near)
          : base * (0.2 + 1.25 * near);
      }
    });

    /* six parts spiral into the core: the slogan, made visible */
    pourParts.forEach((m, i) => {
      const a = (i / 6) * Math.PI * 2 + elapsed * 0.22;
      const r = 2.9 * (1 - converge) + 0.35;
      m.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.3 - converge * 0.2);
      m.rotation.z = a + converge * 1.2;
      m.scale.setScalar((1 - converge * 0.65) * (0.35 + converge * 0.9));
      (m as any).userData.edge.material.opacity = 0.25 + converge * 0.65;
    });

    /* station 3 assembles itself: a ring of parts becomes one stacked part */
    const s3 = stations[2]?.group as any;
    if (s3?.__parts) {
      const local = clamp01(1 - Math.abs(t - 3 / 7) * 4.2);
      s3.__parts.forEach((mesh: THREE.Mesh, i: number) => {
        const a = (i / 6) * Math.PI * 2;
        const r = 1.85 * (1 - local);
        mesh.position.x = Math.cos(a) * r;
        mesh.position.y = Math.sin(a) * r;
        mesh.position.z = i * 0.075 * local;
        mesh.rotation.z = a * (1 - local);
      });
    }

    core.rotation.y = elapsed * 0.16;
    coreRing.rotation.x = Math.sin(elapsed * 0.3) * 0.22;
    coreRing.rotation.z = Math.cos(elapsed * 0.22) * 0.18;
    coreRing.scale.setScalar(1 + converge * 0.25 + Math.sin(elapsed * 0.8) * 0.01);
    corePrism.material.emissiveIntensity = 0.1 + converge * 0.55;
    coreRingMat.opacity = 0.4 + converge * 0.5;
    glow.material.opacity = 0.2 + converge * 0.42;
    glow.scale.setScalar(2.1 + converge * 2.2 + Math.sin(elapsed * 0.9) * 0.05);
    coreLight.intensity = converge * 16 + 1.2;
    coreLight.position.copy(core.position);
    core.visible = t > 0.8;
    /* on a phone the diagram owns the finale; the core stays as light only */
    corePrism.visible = !narrow;
    coreRing.visible = !narrow;
    for (const m of pourParts) m.visible = !narrow;

    embers.rotation.y = elapsed * 0.012;
    embers.material.opacity = 0.32 + converge * 0.45;

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  return {
    setProgress(p: number) {
      target = clamp01(p);
    },
    setActive(index: number) {
      active = index;
    },
    setPointer(x: number, y: number) {
      pointerX = x;
      pointerY = y;
    },
    start,
    stop,
    dispose() {
      stop();
      window.removeEventListener('resize', resize);
      renderer.dispose();
      scene.traverse((obj) => {
        const any = obj as any;
        if (any.geometry) any.geometry.dispose?.();
        if (any.material) {
          const m = any.material;
          if (Array.isArray(m)) m.forEach((mm) => mm.dispose?.());
          else m.dispose?.();
        }
      });
    }
  };
}
