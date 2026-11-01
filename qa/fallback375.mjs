// 375px fallback captures: reduced motion and no-WebGL.
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

async function shot(name, { reduce, noGl }) {
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812 });
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
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 1100));
  await page.screenshot({ path: `qa/out/${name}.png` });
  const state = await page.evaluate(() => ({
    no3d: document.documentElement.classList.contains('no-3d'),
    hero: Math.round(document.querySelector('.hero').getBoundingClientRect().height),
    still: getComputedStyle(document.querySelector('.hero__still')).display
  }));
  await page.close();
  return state;
}

const reduced = await shot('m375-reduced', { reduce: true });
const noGl = await shot('m375-no-webgl', { noGl: true });
console.log(JSON.stringify({ reduced, noGl }, null, 2));
await browser.close();
