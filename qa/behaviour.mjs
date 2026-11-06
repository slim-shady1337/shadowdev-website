// Behaviour check: autonomous lap on the focused station, counter up/down,
// and where each navigation link actually lands.
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

/* ---------- 1. navigation links ---------- */
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 1200));

  const links = ['#sistem', '#proces', '#sigurnost', '#reference', '#kontakt'];
  const landings = [];

  for (const href of links) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await new Promise((r) => setTimeout(r, 700));
    await page.click(`.nav__link[href="${href}"]`);
    await new Promise((r) => setTimeout(r, 2000));
    const info = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      const nav = document.getElementById('site-nav');
      const r = el.getBoundingClientRect();
      const n = nav.getBoundingClientRect();
      return {
        href: sel,
        top: Math.round(r.top),
        navBottom: Math.round(n.bottom),
        gapBelowNav: Math.round(r.top - n.bottom),
        headingTop: Math.round((el.querySelector('h2') ?? el).getBoundingClientRect().top)
      };
    }, href);
    landings.push(info);
  }
  report.navLandings = landings;
  await page.close();
}

/* ---------- 2. counter up and down ---------- */
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 1200));

  const read = () => page.evaluate(() => ({
    value: document.getElementById('dimrule-value')?.textContent,
    name: document.getElementById('dimrule-name')?.textContent,
    active: document.querySelectorAll('.station.is-active').length,
    ruleOpacity: getComputedStyle(document.querySelector('.dimrule')).opacity
  }));

  const steps = [];
  const goTo = async (selector, label) => {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 0, behavior: 'instant' });
    }, selector);
    await new Promise((r) => setTimeout(r, 500));
    steps.push({ at: label, ...(await read()) });
  };

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await new Promise((r) => setTimeout(r, 500));
  steps.push({ at: 'hero (start)', ...(await read()) });

  await goTo('#stanica-1', 'station 1');
  await goTo('#stanica-3', 'station 3');
  await goTo('#stanica-6', 'station 6');
  await goTo('#spajanje', 'convergence');

  // back up the same way
  await goTo('#stanica-3', 'station 3 (back up)');
  await goTo('#stanica-1', 'station 1 (back up)');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await new Promise((r) => setTimeout(r, 500));
  steps.push({ at: 'hero (back up)', ...(await read()) });

  report.counter = steps;
  await page.close();
}

/* ---------- 3. autonomous lap ---------- */
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 1000));

  // centre station 3 and keep the pointer away from the figure
  await page.evaluate(() => {
    const el = document.getElementById('stanica-3');
    const mid = el.getBoundingClientRect().top + window.scrollY + el.offsetHeight / 2 - window.innerHeight / 2;
    window.scrollTo({ top: mid, behavior: 'instant' });
  });
  await page.mouse.move(10, 10);
  await new Promise((r) => setTimeout(r, 900));

  const host = await page.$('#stanica-3 .station__figure');
  const shot = async (name) => {
    const buf = await host.screenshot({ path: `qa/out/lap-${name}.png` });
    return buf;
  };

  // sample the lap while it should be running
  const frames = [];
  for (let i = 0; i < 6; i++) {
    frames.push(await shot(`run${i}`));
    await new Promise((r) => setTimeout(r, 500));
  }
  const distinctWhileRunning = new Set(frames.map((f) => f.length)).size;

  // after the lap the figure must be still
  await new Promise((r) => setTimeout(r, 7000));
  const restA = await shot('rest-a');
  await new Promise((r) => setTimeout(r, 1200));
  const restB = await shot('rest-b');

  report.lap = {
    distinctFramesWhileRunning: distinctWhileRunning,
    moving: distinctWhileRunning > 1,
    atRestAfterLap: restA.equals(restB)
  };
  await page.close();
}

await browser.close();
fs.writeFileSync('qa/out/behaviour.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
