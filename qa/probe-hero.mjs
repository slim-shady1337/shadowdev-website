import puppeteer from 'puppeteer-core';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--hide-scrollbars'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844 });
await page.goto('http://127.0.0.1:4399/', { waitUntil: 'domcontentloaded' });
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 1500));

const out = await page.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const cs = (el) => (el ? getComputedStyle(el) : null);
  const hero = q('.hero');
  const fig = q('#hero-figure');
  const svg = q('#hero-figure svg');
  const h1 = q('.hero__title');
  const grid = q('.hero__grid');
  const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { y: Math.round(b.y), h: Math.round(b.height), x: Math.round(b.x), w: Math.round(b.width) }; };
  const hcs = cs(hero);
  const fcs = cs(fig);
  return {
    hero: { ...r(hero), display: hcs.display, dir: hcs.flexDirection, justify: hcs.justifyContent, align: hcs.alignItems, gap: hcs.gap, minH: hcs.minHeight, padT: hcs.paddingTop, padB: hcs.paddingBottom },
    grid: { ...r(grid), display: cs(grid).display },
    figure: { ...r(fig), position: fcs.position, top: fcs.top, right: fcs.right, order: fcs.order, width: fcs.width, margin: fcs.margin },
    svg: r(svg),
    h1: { ...r(h1), width: cs(h1).width },
    children: Array.from(hero.children).map((c) => ({ tag: c.tagName, cls: c.className, ...r(c), display: getComputedStyle(c).display, order: getComputedStyle(c).order }))
  };
});
console.log(JSON.stringify(out, null, 2));
await browser.close();
