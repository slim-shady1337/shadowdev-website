// Interaction QA: menu, form states, language switch, focus, reduced motion, no WebGL.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = process.env.QA_URL || 'http://127.0.0.1:4399/';
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
    '--force-color-profile=srgb'
  ]
});

const report = {};

/* ---------------- desktop: form + language + focus ---------------- */
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });

  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.method() === 'POST') {
      req.respond({ status: 200, contentType: 'text/html', body: 'ok' });
    } else {
      req.continue();
    }
  });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 1400));

  // empty submit
  await page.evaluate(() => {
    document.querySelector('#kontakt')?.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.click('#contact-submit');
  await new Promise((r) => setTimeout(r, 400));

  report.formEmpty = await page.evaluate(() => ({
    invalid: document.querySelectorAll('.input[aria-invalid="true"]').length,
    errorsShown: Array.from(document.querySelectorAll('.form-field__error')).filter((e) => !e.hidden).length,
    summaryShown: !document.getElementById('form-summary')?.hidden,
    focused: document.activeElement?.id || '',
    labelStyled: getComputedStyle(document.querySelector('.form-field__label')).display
  }));
  await page.screenshot({ path: `${OUT}/form-errors.png` });

  // fill and send
  await page.type('#f-ime', 'Amina Hodžić');
  await page.type('#f-email', 'amina@firma.ba');
  await page.type('#f-firma', 'Firma d.o.o.');
  await page.select('#f-tema', 'ERP sistem');
  await page.type('#f-poruka', 'Trebamo povezati skladište i proizvodnju u jedan sistem.');
  await new Promise((r) => setTimeout(r, 120));
  await page.evaluate(() => document.getElementById('contact-submit')?.click());
  await new Promise((r) => setTimeout(r, 900));

  report.formSend = await page.evaluate(() => ({
    doneVisible: !document.getElementById('form-done')?.hidden,
    formHidden: document.getElementById('contact-form')?.hidden,
    focused: document.activeElement?.id || document.activeElement?.tagName
  }));
  await page.screenshot({ path: `${OUT}/form-done.png` });

  // language switch
  await page.evaluate(() => document.querySelector('[data-lang="en"]')?.click());
  await new Promise((r) => setTimeout(r, 350));
  report.lang = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    title: document.title,
    h1: document.querySelector('.hero__title')?.textContent?.trim(),
    nav: document.querySelector('.nav__link')?.textContent?.trim(),
    station: document.querySelector('#stanica-1 h2')?.textContent?.trim(),
    pressed: document.querySelector('[data-lang="en"]')?.getAttribute('aria-pressed'),
    ariaNav: document.querySelector('.nav__links')?.getAttribute('aria-label'),
    figureLabel: document.getElementById('hero-figure')?.getAttribute('aria-label')
  }));
  await page.screenshot({ path: `${OUT}/lang-en.png` });

  // focus ring on the primary action
  await page.evaluate(() => document.querySelector('[data-lang="bs"]')?.click());
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await new Promise((r) => setTimeout(r, 400));
  await page.evaluate(() => document.querySelector('.hero__actions .btn')?.focus());
  await page.keyboard.press('Tab');
  await page.keyboard.down('Shift');
  await page.keyboard.press('Tab');
  await page.keyboard.up('Shift');
  await new Promise((r) => setTimeout(r, 300));
  report.focus = await page.evaluate(() => {
    const el = document.activeElement;
    const cs = el ? getComputedStyle(el) : null;
    return { tag: el?.tagName, text: el?.textContent?.trim().slice(0, 40), outline: cs?.outlineWidth };
  });
  await page.screenshot({ path: `${OUT}/focus-ring.png` });

  report.errors = errors;
  await page.close();
}

/* ---------------- mobile: menu ---------------- */
{
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812 });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 1200));

  await page.click('#menu-btn');
  await new Promise((r) => setTimeout(r, 500));
  report.menuOpen = await page.evaluate(() => ({
    expanded: document.getElementById('menu-btn')?.getAttribute('aria-expanded'),
    inert: document.getElementById('mobile-menu')?.hasAttribute('inert'),
    translated: getComputedStyle(document.getElementById('mobile-menu')).visibility,
    bodyOverflow: document.body.style.overflow
  }));
  await page.screenshot({ path: `${OUT}/menu-open.png` });

  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 500));
  report.menuClosed = await page.evaluate(() => ({
    expanded: document.getElementById('menu-btn')?.getAttribute('aria-expanded'),
    inert: document.getElementById('mobile-menu')?.hasAttribute('inert'),
    focus: document.activeElement?.id
  }));
  await page.close();
}

/* ---------------- reduced motion ---------------- */
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 900));
  report.reduced = await page.evaluate(() => ({
    no3d: document.documentElement.classList.contains('no-3d'),
    reduced: document.documentElement.classList.contains('reduced'),
    worldOpacity: getComputedStyle(document.querySelector('.world')).opacity,
    dimrule: getComputedStyle(document.querySelector('.dimrule')).display,
    heroVisible: document.querySelector('.hero__title')?.getBoundingClientRect().height > 10,
    stations: document.querySelectorAll('[data-station]').length
  }));
  await page.screenshot({ path: `${OUT}/reduced-hero.png` });
  await page.close();
}

/* ---------------- no WebGL ---------------- */
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.evaluateOnNewDocument(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      if (String(type).includes('webgl')) return null;
      return original.call(this, type, ...rest);
    };
  });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 900));
  report.noWebgl = await page.evaluate(() => ({
    no3d: document.documentElement.classList.contains('no-3d'),
    dimrule: getComputedStyle(document.querySelector('.dimrule')).display,
    heroHeight: Math.round(document.querySelector('.hero').getBoundingClientRect().height),
    stationHeight: Math.round(document.querySelector('#stanica-1').getBoundingClientRect().height),
    bodyScroll: document.documentElement.scrollHeight
  }));
  await page.screenshot({ path: `${OUT}/no-webgl.png` });
  await page.close();
}

await browser.close();
fs.writeFileSync(`${OUT}/interactions.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
