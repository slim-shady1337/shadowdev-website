// Generic screenshot helper: node qa/shot.mjs <url> <out.png> [width] [height] [fullPage]
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const [url, out, w = '1440', h = '900', full = '1'] = process.argv.slice(2);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--force-color-profile=srgb']
});

const page = await browser.newPage();
await page.setViewport({ width: Number(w), height: Number(h), deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

await page.goto(url, { waitUntil: 'networkidle0', timeout: 90000 });
try { await page.evaluate(() => document.fonts.ready); } catch {}
await new Promise((r) => setTimeout(r, 700));

fs.mkdirSync(path.dirname(out), { recursive: true });
await page.screenshot({ path: out, fullPage: full === '1' });
console.log(JSON.stringify({ out, errors }, null, 2));
await browser.close();
