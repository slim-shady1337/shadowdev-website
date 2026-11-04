// Phone heroes: short viewports where a bottom-aligned copy used to slide
// under the Hub. Checks overlap, whether the hero fits, and the CTA position.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = process.env.QA_URL || 'http://127.0.0.1:4399/';
fs.mkdirSync('qa/out', { recursive: true });

const sizes = [
  [360, 640, '360x640'],
  [375, 667, '375x667'],
  [390, 844, '390x844'],
  [412, 915, '412x915']
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--force-color-profile=srgb', '--hide-scrollbars']
});

const report = {};

for (const [w, h, name] of sizes) {
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 1500));

  const info = await page.evaluate(() => {
    const rect = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), bottom: Math.round(r.bottom) };
    };
    const fig = rect('#hero-figure');
    const h1 = rect('.hero__title');
    const cta = rect('.hero__actions .btn');
    const plate = rect('.hero__plate');
    const hero = rect('.hero');
    const overlap = fig && h1 ? !(fig.x + fig.w <= h1.x || h1.x + h1.w <= fig.x || fig.y + fig.h <= h1.y || h1.y + h1.h <= fig.y) : null;
    return {
      hero,
      figure: fig,
      h1,
      overlapWithH1: overlap,
      gapFigureToH1: fig && h1 ? h1.y - (fig.y + fig.h) : null,
      cta,
      ctaInFirstViewport: cta ? cta.bottom <= window.innerHeight : null,
      plateInFirstViewport: plate ? plate.bottom <= window.innerHeight : null,
      heroFitsViewport: hero ? hero.h <= window.innerHeight + 2 : null,
      overflowX: document.documentElement.scrollWidth > window.innerWidth + 1
    };
  });

  await page.screenshot({ path: `qa/out/phone-${name}.png` });
  report[name] = { ...info, errors };
  await page.close();
}

await browser.close();
fs.writeFileSync('qa/out/hero-phone.json', JSON.stringify(report, null, 2));
for (const [k, v] of Object.entries(report)) {
  console.log(
    `${k}: overlap=${v.overlapWithH1} gap=${v.gapFigureToH1} heroFits=${v.heroFitsViewport} ctaInView=${v.ctaInFirstViewport} plateInView=${v.plateInFirstViewport} overflowX=${v.overflowX} errors=${v.errors.length}`
  );
}
