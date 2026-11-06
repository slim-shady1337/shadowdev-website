/* ==========================================================================
   Boot: language, navigation, scroll, the hairline figures, the form.
   Everything here is progressive: the page is complete without it.
   ========================================================================== */

import { mountHeroFigure, setHeroFigureLabel } from './hero-figure';
import { mountStationFigures, playStationFigureOnce } from './station-figure';

type Lang = 'bs' | 'en';

const root = document.documentElement;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReduced) root.classList.add('reduced');

/* --------------------------------------------------------------------------
   Language
   -------------------------------------------------------------------------- */

const STORE_KEY = 'sd-lang';

function applyLang(lang: Lang) {
  root.lang = lang;

  document.querySelectorAll<HTMLElement>('[data-en]').forEach((el) => {
    const bs = el.dataset.bs ?? '';
    el.textContent = lang === 'en' ? el.dataset.en ?? bs : bs;
  });

  document.querySelectorAll<HTMLElement>('[data-en-aria-label]').forEach((el) => {
    if (!el.dataset.bsLabel) el.dataset.bsLabel = el.getAttribute('aria-label') ?? '';
    el.setAttribute('aria-label', lang === 'en' ? el.dataset.enAriaLabel ?? '' : el.dataset.bsLabel);
  });

  const title = lang === 'en' ? root.dataset.titleEn : root.dataset.titleBs;
  const desc = lang === 'en' ? root.dataset.descEn : root.dataset.descBs;
  if (title) document.title = title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (desc && metaDesc) metaDesc.setAttribute('content', desc);
  const ogLocale = document.querySelector('meta[property="og:locale"]');
  if (ogLocale) ogLocale.setAttribute('content', lang === 'en' ? 'en_US' : 'bs_BA');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle && title) ogTitle.setAttribute('content', title);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc && desc) ogDesc.setAttribute('content', desc);

  document.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
  });

  try {
    localStorage.setItem(STORE_KEY, lang);
  } catch {
    /* storage blocked: the switch still works for this page view */
  }

  document.dispatchEvent(new CustomEvent('sd:lang'));
}

/* --------------------------------------------------------------------------
   Mobile menu
   -------------------------------------------------------------------------- */

const menuBtn = document.getElementById('menu-btn') as HTMLButtonElement | null;
const menu = document.getElementById('mobile-menu') as HTMLElement | null;
let menuOpen = false;

function setMenu(open: boolean) {
  if (!menuBtn || !menu) return;
  menuOpen = open;
  menuBtn.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('is-open', open);
  menu.toggleAttribute('inert', !open);
  menu.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) {
    lenis?.stop();
    menu.querySelector<HTMLAnchorElement>('a')?.focus();
  } else {
    lenis?.start();
    menuBtn.focus();
  }
}

menuBtn?.addEventListener('click', () => setMenu(!menuOpen));
menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

document.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const next: Lang = btn.dataset.lang === 'en' ? 'en' : 'bs';
    if (next !== root.lang) applyLang(next);
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menuOpen) setMenu(false);
});

/* --------------------------------------------------------------------------
   Scroll: nav state, the dimension rule, the journey
   -------------------------------------------------------------------------- */

const journey = document.getElementById('journey');
const after = document.querySelector('.after') as HTMLElement | null;
const footer = document.querySelector('.footer') as HTMLElement | null;
const nav = document.getElementById('site-nav');
const convergeEl = document.getElementById('spajanje');

const ruleFill = document.querySelector<HTMLElement>('.dimrule__fill');
const ruleHead = document.querySelector<HTMLElement>('.dimrule__head');
const ruleValue = document.getElementById('dimrule-value');
const ruleName = document.getElementById('dimrule-name');

const stationEls = Array.from(document.querySelectorAll<HTMLElement>('[data-station]'));

let activeStation = -1;
const START_LABEL = 'Početak';

function stationTitle(index: number) {
  const el = stationEls[index]?.querySelector('h2');
  return el?.textContent?.trim() ?? '';
}

function setActiveStation(index: number) {
  if (index === activeStation) return;
  activeStation = index;
  stationEls.forEach((el, i) => el.classList.toggle('is-active', i === index));
  if (ruleName) ruleName.textContent = index >= 0 ? stationTitle(index) : START_LABEL;
  if (ruleValue) ruleValue.textContent = index >= 0 ? `0${index + 1}` : '00';
}

/* Which station the reader is actually looking at: whichever sits nearest the
   middle of the viewport, in both scroll directions. An IntersectionObserver
   only fires on entry, which left the counter stuck on the last station after
   scrolling back up. */
function updateActiveStation() {
  if (!stationEls.length) return;
  const mid = window.innerHeight * 0.5;
  let best = Infinity;
  let index = -1;

  stationEls.forEach((el, i) => {
    const rect = el.getBoundingClientRect();
    const distance = Math.abs(rect.top + rect.height / 2 - mid);
    if (distance < best) {
      best = distance;
      index = i;
    }
  });

  const next = best < window.innerHeight * 0.55 ? index : -1;
  if (next !== activeStation) {
    setActiveStation(next);
    if (next >= 0) playStationFigureOnce(stationEls[next]);
  }
}

let scrollQueued = false;

/* How far the reader is through the journey, 0 to 1. */
function journeyProgress() {
  if (!journey) return 0;
  const top = journey.offsetTop;
  const span = Math.max(1, journey.offsetHeight - window.innerHeight);
  return Math.min(1, Math.max(0, (window.scrollY - top) / span));
}

function onScrollFrame() {
  scrollQueued = false;
  const y = window.scrollY;
  const vh = window.innerHeight;

  nav?.classList.toggle('is-stuck', y > 16);

  const afterTop = after ? after.getBoundingClientRect().top + y : Infinity;
  const footerTop = footer ? footer.getBoundingClientRect().top + y : Infinity;
  const probe = y + 96;
  root.dataset.nav = probe >= afterTop && probe < footerTop ? 'paper' : 'iron';

  const convergeTop = convergeEl ? convergeEl.getBoundingClientRect().top + y : Infinity;
  root.classList.toggle('is-journey-done', y + vh * 0.6 >= convergeTop);
  root.classList.toggle('is-after-journey', y + vh * 0.55 >= afterTop);

  if (journey && ruleFill && ruleHead) {
    const pct = `${(journeyProgress() * 100).toFixed(2)}%`;
    ruleFill.style.width = pct;
    ruleHead.style.left = pct;
  }

  updateActiveStation();
}

function onScroll() {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(onScrollFrame);
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll, { passive: true });

/* --------------------------------------------------------------------------
   Diagram: leader lines draw once
   -------------------------------------------------------------------------- */

const diagram = document.getElementById('system-diagram');
if (diagram) {
  if (prefersReduced) {
    diagram.classList.add('is-drawn');
  } else {
    const dio = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            diagram.classList.add('is-drawn');
            dio.disconnect();
          }
        }
      },
      { threshold: 0.35 }
    );
    dio.observe(diagram);
  }
}

/* --------------------------------------------------------------------------
   Smooth scroll
   -------------------------------------------------------------------------- */

let lenis: { raf: (t: number) => void; scrollTo: (target: unknown, opts?: unknown) => void; stop: () => void; start: () => void; destroy: () => void } | null = null;

async function bootSmoothScroll() {
  const { default: Lenis } = await import('lenis');

  const instance = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
    smoothWheel: true
  });
  lenis = instance as unknown as typeof lenis;

  const raf = (time: number) => {
    instance.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

function idle(cb: () => void) {
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
  if (ric) ric(cb, { timeout: 1600 });
  else window.setTimeout(cb, 800);
}

/* Anchor links: one behaviour with or without smooth scroll, focus follows. */
function bootAnchors() {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      /* the clearance comes from scroll-margin-top, so native and smooth
         scrolling land in exactly the same place */
      if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.15 });
      else target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      window.setTimeout(
        () => {
          const el = target as HTMLElement;
          el.setAttribute('tabindex', '-1');
          el.focus({ preventScroll: true });
        },
        lenis ? 1250 : 500
      );
    });
  });
}

document.addEventListener('sd:lang', () => {
  if (activeStation >= 0 && ruleName) ruleName.textContent = stationTitle(activeStation);
  setHeroFigureLabel(root.lang === 'en' ? HUB_LABEL.en : HUB_LABEL.bs);
});

/* --------------------------------------------------------------------------
   Hero figure — the Hub, drawn in the page's ink
   -------------------------------------------------------------------------- */

const HUB_LABEL = {
  bs: 'Jezgro i osam povezanih modula; modul pod kursorom se podiže.',
  en: 'A core with eight connected modules; the module under the pointer rises.'
};

const heroFigureEl = document.getElementById('hero-figure');

async function bootHeroFigure() {
  if (!heroFigureEl) return;
  try {
    await mountHeroFigure(heroFigureEl, {
      intensity: prefersReduced ? 0 : 0.62,
      label: root.lang === 'en' ? HUB_LABEL.en : HUB_LABEL.bs
    });
    /* the label may have changed while the chunk was in flight */
    setHeroFigureLabel(root.lang === 'en' ? HUB_LABEL.en : HUB_LABEL.bs);
    root.classList.add('has-hero-figure');
  } catch {
    root.classList.add('hero-figure-failed');
  }
}

/* --------------------------------------------------------------------------
   Station figures — the parts drawn as Hairline figures
   -------------------------------------------------------------------------- */

function bootStationFigures() {
  const hosts = Array.from(document.querySelectorAll<HTMLElement>('[data-station-figure]'));
  mountStationFigures(hosts, prefersReduced ? 0 : 0.6);
}

/* --------------------------------------------------------------------------
   Contact form
   -------------------------------------------------------------------------- */

const form = document.getElementById('contact-form') as HTMLFormElement | null;
const formDone = document.getElementById('form-done');
const formSummary = document.getElementById('form-summary');
const submitBtn = document.getElementById('contact-submit') as HTMLButtonElement | null;
const formStarted = Date.now();

type FieldKey = 'name' | 'email' | 'topic' | 'message';
const fieldIds: Record<FieldKey, string> = {
  name: 'f-ime',
  email: 'f-email',
  topic: 'f-tema',
  message: 'f-poruka'
};

function fieldError(key: FieldKey, show: boolean) {
  const input = document.getElementById(fieldIds[key]) as HTMLInputElement | HTMLTextAreaElement | null;
  const msg = document.getElementById(`${fieldIds[key]}-error`);
  if (!input || !msg) return;
  input.setAttribute('aria-invalid', String(show));
  msg.hidden = !show;
}

function validate(): FieldKey[] {
  const bad: FieldKey[] = [];
  const name = (document.getElementById('f-ime') as HTMLInputElement).value.trim();
  const email = (document.getElementById('f-email') as HTMLInputElement).value.trim();
  const topic = (document.getElementById('f-tema') as HTMLSelectElement).value;
  const message = (document.getElementById('f-poruka') as HTMLTextAreaElement).value.trim();

  if (name.length < 2) bad.push('name');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) bad.push('email');
  if (!topic) bad.push('topic');
  if (message.length < 20) bad.push('message');

  (['name', 'email', 'topic', 'message'] as FieldKey[]).forEach((k) => fieldError(k, bad.includes(k)));
  return bad;
}

form?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea').forEach((el) => {
  el.addEventListener('input', () => {
    const key = (Object.keys(fieldIds) as FieldKey[]).find((k) => fieldIds[k] === el.id);
    if (key && el.getAttribute('aria-invalid') === 'true') fieldError(key, false);
  });
});

let sending = false;

async function sendForm(): Promise<void> {
  if (!form || !submitBtn || sending) return;
  const bad = validate();

  if (formSummary) {
    formSummary.hidden = bad.length === 0;
  }

  if (bad.length) {
    const first = document.getElementById(fieldIds[bad[0]]);
    first?.focus();
    return;
  }

  const honeypot = (form.querySelector('[name="bot-field"]') as HTMLInputElement | null)?.value ?? '';
  const tooFast = Date.now() - formStarted < 1500;

  sending = true;
  submitBtn.disabled = true;
  submitBtn.setAttribute('aria-busy', 'true');
  form.querySelector<HTMLElement>('[data-label="idle"]')!.hidden = true;
  form.querySelector<HTMLElement>('[data-label="busy"]')!.hidden = false;

  try {
    if (honeypot || tooFast) throw new Error('skip');

    const res = await fetch(form.action || '/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString()
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    form.hidden = true;
    if (formDone) {
      formDone.hidden = false;
      formDone.focus();
    }
  } catch (err) {
    if (honeypot || (err instanceof Error && err.message === 'skip')) {
      /* bots land here; they see what a successful send looks like */
      form.hidden = true;
      if (formDone) {
        formDone.hidden = false;
        formDone.focus();
      }
      return;
    }
    submitBtn.removeAttribute('aria-busy');
    form.querySelector<HTMLElement>('[data-label="idle"]')!.hidden = false;
    form.querySelector<HTMLElement>('[data-label="busy"]')!.hidden = true;
    const fallback = document.getElementById('send-error');
    if (fallback) fallback.hidden = false;
  } finally {
    sending = false;
    submitBtn.disabled = false;
    submitBtn.removeAttribute('aria-busy');
  }
}

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  void sendForm();
});

/* --------------------------------------------------------------------------
   Start
   -------------------------------------------------------------------------- */

let storedLang: Lang = 'bs';
try {
  storedLang = (localStorage.getItem(STORE_KEY) as Lang) || 'bs';
} catch {
  /* ignore */
}
applyLang(storedLang === 'en' ? 'en' : 'bs');
bootAnchors();
onScrollFrame();
void bootHeroFigure();
bootStationFigures();

/* Smooth scroll is motion; without it the page scrolls natively. */
if (!prefersReduced) {
  idle(() => {
    void bootSmoothScroll();
  });
}
