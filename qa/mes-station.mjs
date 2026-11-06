// MES station check: figure mounts near the section, tears down when passed,
// sits in the right half, and the copy never overlaps it.
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

const report = {};

for (const [w, h, name] of [[1440, 900, '1440'], [768, 1024, '768'], [375, 812, '375']]) {
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 1200));

  // scroll to the MES station
  await page.evaluate(() => {
    const el = document.getElementById('stanica-2');
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 40, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 1400));

  const atStation = await page.evaluate(() => {
    const host = document.getElementById('station-figure-2');
    const copy = document.querySelector('#stanica-2 .station__body');
    const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
    const fig = r(host);
    const body = r(copy);
    const svgR = r(host?.querySelector('svg'));
    const overlap = fig && body ? !(fig.x + fig.w <= body.x || body.x + body.w <= fig.x || fig.y + fig.h <= body.y || body.y + body.h <= fig.y) : null;
    return {
      mounted: host?.hasAttribute('data-hairline') ?? false,
      marker: host?.dataset.figure ?? null,
      role: host?.getAttribute('role'),
      label: host?.getAttribute('aria-label'),
      figure: fig,
      svg: svgR,
      body,
      overlapWithCopy: overlap,
      overflowX: document.documentElement.scrollWidth > window.innerWidth + 1
    };
  });

  await page.screenshot({ path: `qa/out/mes-${name}.png` });

  // scroll far past it: the figure should be torn down
  await page.evaluate(() => window.scrollTo({ top: document.getElementById('proces').getBoundingClientRect().top + window.scrollY, behavior: 'instant' }));
  await new Promise((r) => setTimeout(r, 900));
  const after = await page.evaluate(() => {
    const host = document.getElementById('station-figure-2');
    return { mounted: host?.hasAttribute('data-hairline') ?? false, hasSvg: !!host?.querySelector('svg') };
  });

  report[name] = { ...atStation, afterLeaving: after, errors };
  await page.close();
}

await browser.close();
fs.writeFileSync('qa/out/mes-station.json', JSON.stringify(report, null, 2));
for (const [k, v] of Object.entries(report)) {
  console.log(`${k}: mounted=${v.mounted} overlap=${v.overlapWithCopy} fig=${v.figure?.w}x${v.figure?.h} svg=${v.svg?.w}x${v.svg?.h} teardown=${!v.afterLeaving.mounted} overflowX=${v.overflowX} errors=${v.errors.length}`);
}
