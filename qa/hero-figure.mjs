// Hero evidence: rest, pointer over a tile, reduced motion, no WebGL, and five widths.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = process.env.QA_URL || 'http://127.0.0.1:4399/';
fs.mkdirSync('qa/out', { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--force-color-profile=srgb', '--hide-scrollbars']
});

const errors = [];

async function open(width, height, { reduce = false, noGl = false } = {}) {
  const page = await browser.newPage();
  const local = [];
  page.on('console', (m) => { if (m.type() === 'error') local.push(m.text()); });
  page.on('pageerror', (e) => local.push('PAGEERROR: ' + e.message));
  page.on('requestfailed', (r) => local.push('REQFAIL: ' + r.url()));
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  if (reduce) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  if (noGl) {
    await page.evaluateOnNewDocument(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
        if (String(type).includes('webgl')) return null;
        return original.call(this, type, ...rest);
      };
    });
  }
  await page.evaluateOnNewDocument(() => {
    window.__cls = 0;
    window.__lcp = 0;
    try {
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    } catch {}
  });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 1600));
  return { page, local };
}

const report = {};

/* 1440: rest and hover */
{
  const { page, local } = await open(1440, 900);
  report.desktop = await page.evaluate(() => {
    const host = document.getElementById('hero-figure');
    const r = host?.getBoundingClientRect();
    return {
      mounted: document.documentElement.classList.contains('has-hero-figure'),
      failed: document.documentElement.classList.contains('hero-figure-failed'),
      role: host?.getAttribute('role'),
      label: host?.getAttribute('aria-label'),
      svg: !!host?.querySelector('svg'),
      box: r ? { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } : null,
      overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
      lcp: Math.round(window.__lcp || 0),
      cls: Number((window.__cls || 0).toFixed(4))
    };
  });
  await page.screenshot({ path: 'qa/out/figure-rest-1440.png' });

  // hover a tile on the left of the hub
  const box = report.desktop.box;
  if (box) {
    await page.mouse.move(box.x + box.w * 0.22, box.y + box.h * 0.52, { steps: 8 });
    await new Promise((r) => setTimeout(r, 900));
    await page.screenshot({ path: 'qa/out/figure-hover-1440.png' });
    report.hoverLink = await page.evaluate(() => {
      const hi = document.querySelectorAll('#hero-figure .hi');
      const solid = document.querySelectorAll('#hero-figure .hi');
      return { lit: hi.length, solid: solid.length };
    });
  }
  report.desktop.errors = local;
  await page.close();
}

/* other widths */
for (const [w, h, name] of [[1280, 800, '1280'], [1024, 768, '1024'], [768, 1024, '768'], [375, 812, '375']]) {
  const { page, local } = await open(w, h);
  const info = await page.evaluate(() => {
    const host = document.getElementById('hero-figure');
    const r = host?.getBoundingClientRect();
    const h1 = document.querySelector('.hero__title')?.getBoundingClientRect();
    const overlap = r && h1 ? !(r.right < h1.left || r.left > h1.right || r.bottom < h1.top || r.top > h1.bottom) : null;
    return {
      mounted: document.documentElement.classList.contains('has-hero-figure'),
      box: r ? { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } : null,
      h1: h1 ? { x: Math.round(h1.x), y: Math.round(h1.y), w: Math.round(h1.width), h: Math.round(h1.height) } : null,
      overlapWithH1: overlap,
      overflowX: document.documentElement.scrollWidth > window.innerWidth + 1
    };
  });
  await page.screenshot({ path: `qa/out/figure-${name}.png` });
  report[name] = { ...info, errors: local };
  await page.close();
}

/* reduced motion and no WebGL at 1440 */
for (const [key, opts, file] of [
  ['reduced', { reduce: true }, 'figure-reduced.png'],
  ['noWebgl', { noGl: true }, 'figure-no-webgl.png']
]) {
  const { page, local } = await open(1440, 900, opts);
  const info = await page.evaluate(() => {
    const host = document.getElementById('hero-figure');
    return {
      mounted: document.documentElement.classList.contains('has-hero-figure'),
      no3d: document.documentElement.classList.contains('no-3d'),
      label: host?.getAttribute('aria-label'),
      still: getComputedStyle(document.querySelector('.hero__still')).display,
      svg: !!host?.querySelector('svg')
    };
  });
  await page.screenshot({ path: `qa/out/${file}` });
  report[key] = { ...info, errors: local };
  await page.close();
}

await browser.close();
fs.writeFileSync('qa/out/hero-figure.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
