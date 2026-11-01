// QA: realni Chrome — 375 / 768 / 1440, reduced-motion on/off, stanice, forma, LCP
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const URL = process.env.QA_URL || 'http://localhost:4399/';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = 'qa/out';
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-webgl',
    '--ignore-gpu-blocklist'
  ]
});

const sizes = [
  { w: 375, h: 812, name: 'mobile' },
  { w: 768, h: 1024, name: 'tablet' },
  { w: 1440, h: 900, name: 'desktop' }
];

const results = [];

async function run(size, reduce) {
  const page = await browser.newPage();
  await page.setViewport({ width: size.w, height: size.h, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: reduce ? 'reduce' : 'no-preference' }
  ]);
  await page.evaluateOnNewDocument(() => {
    window.__lcp = 0;
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) window.__lcp = e.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {}
  });

  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

  const t0 = Date.now();
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 90000 });
  await new Promise((r) => setTimeout(r, 2500));
  const loadMs = Date.now() - t0;

  const info = await page.evaluate(() => {
    const doc = document.documentElement;
    const c = document.querySelector('#world-canvas');
    let gl = false;
    try { gl = !!(c && (c.getContext('webgl2') || c.getContext('webgl'))); } catch { gl = false; }
    return {
      scrollWidth: doc.scrollWidth,
      innerWidth: window.innerWidth,
      overflowX: doc.scrollWidth > window.innerWidth + 1,
      isReady: document.getElementById('world')?.classList.contains('is-ready') || false,
      no3d: doc.classList.contains('no-3d'),
      webgl: gl,
      stations: document.querySelectorAll('[data-station]').length,
      sections: document.querySelectorAll('section').length,
      form: !!document.getElementById('contact-form'),
      jsonLd: !!document.querySelector('script[type="application/ld+json"]'),
      lcp: Math.round(window.__lcp || 0),
      loadMs: 0
    };
  });
  info.loadMs = loadMs;

  // dođi do stanice 3 (centar) i provjeri aktivna stanja + kameru
  await page.evaluate(() => {
    document.getElementById('stanica-3')?.scrollIntoView({ block: 'center' });
  });
  await new Promise((r) => setTimeout(r, 1800));

  const atStation = await page.evaluate(() => ({
    activeStations: document.querySelectorAll('.station.is-active').length,
    activeRail: document.querySelectorAll('[data-rail].is-active').length,
    progress: window.__shadowdev?.getProgress?.() ?? null,
    t: window.__shadowdev?.getT?.() ?? null,
    tele: document.getElementById('tele-station')?.textContent?.trim() ?? '',
    depth: document.getElementById('tele-value')?.textContent?.trim() ?? ''
  }));

  await page.screenshot({ path: `${OUT}/${size.name}-${reduce ? 'reduced' : 'motion'}.png`, fullPage: false });

  results.push({ size: size.name, width: size.w, reduce, ...info, atStation, errors });
  await page.close();
}

for (const size of sizes) {
  await run(size, false);
  await run(size, true);
}

/* ---- forma: prazna → greške; validna → uspjeh ---- */
const formPage = await browser.newPage();
await formPage.setViewport({ width: 1440, height: 900 });
const formErrors = [];
formPage.on('pageerror', (e) => formErrors.push(e.message));
await formPage.goto(URL, { waitUntil: 'networkidle0' });

await formPage.evaluate(() => document.getElementById('contact-form')?.scrollIntoView({ block: 'center' }));
await new Promise((r) => setTimeout(r, 400));
await formPage.evaluate(() => document.getElementById('contact-submit')?.click());
await new Promise((r) => setTimeout(r, 300));
const invalidCount = await formPage.evaluate(() => document.querySelectorAll('[data-field][data-invalid="true"]').length);
const focused = await formPage.evaluate(() => document.activeElement?.id || '');

await formPage.type('#f-ime', 'Test Korisnik');
await formPage.type('#f-email', 'test@example.com');
await formPage.type('#f-poruka', 'Ovo je testna poruka duža od deset znakova.');
await formPage.evaluate(() => document.getElementById('contact-submit')?.click());
await new Promise((r) => setTimeout(r, 900));
const formState = await formPage.evaluate(() => ({
  doneVisible: !document.getElementById('form-done')?.hidden,
  formHidden: document.getElementById('contact-form')?.hidden || false
}));
await formPage.close();

/* ---- jezik ---- */
const langPage = await browser.newPage();
await langPage.setViewport({ width: 1440, height: 900 });
await langPage.goto(URL, { waitUntil: 'networkidle0' });
await langPage.evaluate(() => document.querySelector('[data-lang="en"]')?.click());
await new Promise((r) => setTimeout(r, 400));
const langCheck = await langPage.evaluate(() => ({
  lang: document.documentElement.lang,
  hero: document.querySelector('.hero-title .line')?.textContent?.trim(),
  nav: document.querySelector('.nav-link')?.textContent?.trim(),
  station: document.querySelector('#stanica-1 h2')?.textContent?.trim()
}));
await langPage.close();

await browser.close();

const report = {
  results,
  form: { invalidCount, focused, ...formState, errors: formErrors },
  langCheck,
  ranAt: new Date().toISOString()
};
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

const anyError = results.some((r) => r.errors.length > 0) || formErrors.length > 0;
const anyOverflow = results.some((r) => r.overflowX);
const stationsOk = results.filter((r) => !r.reduce).every((r) => r.atStation.activeStations >= 1);
const formOk = invalidCount >= 1 && formState.doneVisible;
const langOk = langCheck.lang === 'en' && langCheck.hero === 'One system.';

console.error(`SUMMARY errors=${anyError} overflow=${anyOverflow} stations=${stationsOk} form=${formOk} lang=${langOk}`);
process.exit(anyError || anyOverflow || !stationsOk || !formOk || !langOk ? 2 : 0);
