// All six stations: mounted, no overlap with the copy, side of the figure, spacing.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = process.env.QA_URL || 'http://127.0.0.1:4399/';
fs.mkdirSync('qa/out', { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-color-profile=srgb', '--hide-scrollbars']
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

  const rows = [];
  for (let n = 1; n <= 6; n++) {
    await page.evaluate((i) => {
      const el = document.getElementById(`stanica-${i}`);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 30, behavior: 'instant' });
    }, n);
    await new Promise((r) => setTimeout(r, 800));

    const info = await page.evaluate((i) => {
      const sec = document.getElementById(`stanica-${i}`);
      const fig = sec?.querySelector('.station__figure');
      const body = sec?.querySelector('.station__body');
      const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), bottom: Math.round(b.bottom) }; };
      const f = r(fig);
      const c = r(body);
      const overlap = f && c ? !(f.x + f.w <= c.x || c.x + c.w <= f.x || f.y + f.h <= c.y || c.y + c.h <= f.y) : null;
      const flip = sec?.classList.contains('station--flip') ?? false;
      return {
        flip,
        mounted: fig?.hasAttribute('data-hairline') ?? false,
        marker: fig?.dataset.figure ?? null,
        figure: f,
        body: c,
        overlap,
        side: f && c ? (f.x > c.x ? 'right' : 'left') : null,
        sectionHeight: Math.round(sec.getBoundingClientRect().height),
        gapAboveFigure: f && c ? (flip ? c.x - (f.x + f.w) : f.x - (c.x + c.w)) : null,
        overflowX: document.documentElement.scrollWidth > window.innerWidth + 1
      };
    }, n);

    await page.screenshot({ path: `qa/out/st-${name}-${n}.png` });
    rows.push({ n, ...info });
  }

  report[name] = { rows, errors };
  await page.close();
}

await browser.close();
fs.writeFileSync('qa/out/stations.json', JSON.stringify(report, null, 2));

for (const [k, v] of Object.entries(report)) {
  for (const r of v.rows) {
    console.log(`${k} st${r.n}: side=${r.side} flip=${r.flip} mounted=${r.mounted} overlap=${r.overlap} fig=${r.figure?.w}x${r.figure?.h} gap=${r.gapAboveFigure} secH=${r.sectionHeight} err=${v.errors.length}`);
  }
}
