// Section-by-section capture: node qa/capture.mjs <url> <prefix> <width> <height>
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const [url, prefix = 'shot', width = '1440', height = '900'] = process.argv.slice(2);
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
    '--ignore-gpu-blocklist',
    '--force-color-profile=srgb',
    '--hide-scrollbars'
  ]
});

const page = await browser.newPage();
await page.setViewport({ width: Number(width), height: Number(height), deviceScaleFactor: 1 });

const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('requestfailed', (r) => errors.push('REQFAIL: ' + r.url() + ' ' + (r.failure()?.errorText ?? '')));

await page.evaluateOnNewDocument(() => {
  window.__cls = 0;
  window.__lcp = 0;
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__lcp = e.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
  } catch {}
});

await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 1800));

const metrics = await page.evaluate(() => ({
  scrollHeight: document.documentElement.scrollHeight,
  innerWidth: window.innerWidth,
  overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
  lcp: Math.round(window.__lcp || 0),
  cls: Number((window.__cls || 0).toFixed(4)),
  is3d: document.documentElement.classList.contains('is-3d'),
  no3d: document.documentElement.classList.contains('no-3d'),
  webgl: (() => {
    try {
      const c = document.getElementById('world-canvas');
      return !!(c && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch {
      return false;
    }
  })()
}));

const stops = [
  ['hero', 0],
  ['legend', '#sistem'],
  ['station1', '#stanica-1'],
  ['station2', '#stanica-2'],
  ['station3', '#stanica-3'],
  ['station4', '#stanica-4'],
  ['station5', '#stanica-5'],
  ['station6', '#stanica-6'],
  ['converge', '#spajanje'],
  ['process', '#proces'],
  ['security', '#sigurnost'],
  ['proof', '#reference'],
  ['contact', '#kontakt'],
  ['footer', 'footer']
];

const shots = [];
for (const [name, target] of stops) {
  await page.evaluate((t) => {
    if (typeof t === 'number') window.scrollTo({ top: t, behavior: 'instant' });
    else {
      const el = document.querySelector(t);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: Math.max(0, y - 92), behavior: 'instant' });
      }
    }
  }, target);
  await new Promise((r) => setTimeout(r, 900));
  const file = `${OUT}/${prefix}-${name}.png`;
  await page.screenshot({ path: file });
  shots.push(file);
}

await browser.close();

const report = { url, width, height, metrics, errors: [...new Set(errors)], shots };
fs.writeFileSync(`${OUT}/${prefix}-report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ metrics, errors: report.errors.length ? report.errors : 'none' }, null, 2));
