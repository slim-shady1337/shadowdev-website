// Probe: can headless Chrome launch here, and does it have network access?
import puppeteer from 'puppeteer-core';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

let browser;
try {
  browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist']
  });
} catch (err) {
  console.log(JSON.stringify({ launch: false, error: String(err) }));
  process.exit(1);
}

const page = await browser.newPage();
const out = { launch: true };

// WebGL + swiftshader check
out.webgl = await page.evaluate(() => {
  const c = document.createElement('canvas');
  const gl = c.getContext('webgl2') || c.getContext('webgl');
  if (!gl) return false;
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  return dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'webgl-ok';
});

// Network check from inside the browser
try {
  const res = await page.goto('https://fonts.googleapis.com/css2?family=Archivo:wght@400;700&display=swap', { waitUntil: 'domcontentloaded', timeout: 20000 });
  out.fontCss = { status: res?.status() ?? null, sample: (await page.content()).slice(0, 300) };
} catch (err) {
  out.fontCss = { error: String(err).slice(0, 200) };
}

await browser.close();
console.log(JSON.stringify(out, null, 2));
