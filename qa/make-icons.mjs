// Generates favicons from the brand mark and the Open Graph image from qa/og.html.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = process.cwd();

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-color-profile=srgb']
});

/* ---- favicons ---- */
const mark = fs.readFileSync(path.join(ROOT, 'public', 'brand', 'mark-color.png')).toString('base64');
const page = await browser.newPage();
const icons = await page.evaluate(async (b64) => {
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = 'data:image/png;base64,' + b64;
  });
  const out = {};
  for (const size of [32, 180, 512]) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const x = c.getContext('2d');
    // square canvas: fit the mark with a small optical inset
    const s = Math.min(size / img.naturalWidth, size / img.naturalHeight) * 0.92;
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    x.imageSmoothingQuality = 'high';
    x.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    out[size] = c.toDataURL('image/png').split(',')[1];
  }
  return out;
}, mark);

for (const [size, b64] of Object.entries(icons)) {
  fs.writeFileSync(path.join(ROOT, 'public', `favicon-${size}.png`), Buffer.from(b64, 'base64'));
}

/* ---- og image ---- */
// fonts.css points at /fonts/... which only resolves over HTTP; rewrite for file://
const fontCss = fs
  .readFileSync(path.join(ROOT, 'src', 'styles', 'fonts.css'), 'utf8')
  .replaceAll("url('/fonts/", "url('../public/fonts/");
fs.writeFileSync(path.join(ROOT, 'qa', 'fonts-local.css'), fontCss);

const og = await browser.newPage();
await og.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await og.goto('file:///' + path.join(ROOT, 'qa', 'og.html').replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
await og.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 400));
await og.screenshot({ path: path.join(ROOT, 'public', 'og.png') });

await browser.close();
console.log('favicons + og written');
