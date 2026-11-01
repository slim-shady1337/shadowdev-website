// ============================================
// FORM — validacija, stanja, slanje
// ============================================

export function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const done = document.getElementById('form-done');
  const statusEl = document.getElementById('form-status');
  const submit = document.getElementById('contact-submit');

  const MSG = {
    bs: {
      ime: 'Unesite ime (najmanje 2 znaka).',
      email: 'Unesite ispravan e-mail.',
      poruka: 'Napišite poruku (najmanje 10 znakova).',
      telefon: 'Telefon izgleda neispravno.',
      sending: 'Šaljem…',
      sendError: 'Slanje nije uspjelo. Pokušajte ponovo ili pišite na info@shadowdev.ba.'
    },
    en: {
      ime: 'Enter your name (at least 2 characters).',
      email: 'Enter a valid email address.',
      poruka: 'Write a message (at least 10 characters).',
      telefon: 'The phone number looks invalid.',
      sending: 'Sending…',
      sendError: 'Sending failed. Try again or write to info@shadowdev.ba.'
    }
  };

  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'bs');

  function fieldWrap(name) {
    return form.querySelector(`[data-field="${name}"]`);
  }

  function setError(name, message) {
    const wrap = fieldWrap(name);
    if (!wrap) return;
    const input = wrap.querySelector('input, textarea, select');
    const err = wrap.querySelector('.field-error');
    wrap.dataset.invalid = message ? 'true' : 'false';
    if (err) err.textContent = message || '';
    if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function validate() {
    const m = MSG[lang()];
    const data = new FormData(form);
    const ime = String(data.get('ime') || '').trim();
    const email = String(data.get('email') || '').trim();
    const poruka = String(data.get('poruka') || '').trim();
    const telefon = String(data.get('telefon') || '').trim();

    const checks = [
      ['ime', ime.length < 2, m.ime],
      ['email', !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email), m.email],
      ['poruka', poruka.length < 10, m.poruka],
      ['telefon', telefon.length > 0 && !/^[+()\d\s-]{6,}$/.test(telefon), m.telefon]
    ];

    let ok = true;
    let first = null;

    checks.forEach(([name, invalid, text]) => {
      setError(name, invalid ? text : '');
      if (invalid) {
        ok = false;
        if (!first) first = name;
      }
    });

    if (first) {
      fieldWrap(first)?.querySelector('input, textarea, select')?.focus();
    }
    return ok;
  }

  // clear the error as soon as the user corrects the field
  form.querySelectorAll('input, textarea, select').forEach((el) => {
    el.addEventListener('input', () => {
      const wrap = el.closest('[data-field]');
      if (wrap && wrap.dataset.invalid === 'true') {
        wrap.dataset.invalid = 'false';
        const err = wrap.querySelector('.field-error');
        if (err) err.textContent = '';
        el.setAttribute('aria-invalid', 'false');
      }
    });
  });

  // station action → preselect service
  document.querySelectorAll('[data-service]').forEach((a) => {
    a.addEventListener('click', () => {
      const sel = document.getElementById('f-usluga');
      if (sel && a.dataset.service) sel.value = a.dataset.service;
    });
  });

  function showDone() {
    form.hidden = true;
    if (done) {
      done.hidden = false;
      done.focus();
    }
    if (statusEl) statusEl.textContent = '';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validate()) return;

    const m = MSG[lang()];
    if (submit) {
      submit.dataset.loading = 'true';
      submit.disabled = true;
    }
    if (statusEl) {
      statusEl.textContent = m.sending;
      statusEl.dataset.state = 'sending';
    }

    try {
      const fd = new FormData(form);
      fd.append('form-name', 'kontakt');
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(fd).toString()
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showDone();
    } catch (err) {
      const local = ['localhost', '127.0.0.1', ''].includes(location.hostname) || location.protocol === 'file:';
      if (local) {
        // Netlify Forms radi tek nakon deploya — lokalno prikazujemo uspjeh radi testiranja stanja.
        console.warn('[ShadowDev] Lokalno: forma nije poslana (Netlify forma radi na deployu).', err);
        showDone();
      } else if (statusEl) {
        statusEl.textContent = m.sendError;
        statusEl.dataset.state = 'error';
      }
    } finally {
      if (submit) {
        submit.dataset.loading = 'false';
        submit.disabled = false;
      }
    }
  });
}
