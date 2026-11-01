// ============================================
// I18N — BS / EN (data-bs / data-en)
// ============================================

export function initI18n() {
  const root = document.documentElement;
  const buttons = Array.from(document.querySelectorAll('[data-lang]'));

  let lang = localStorage.getItem('lang') === 'en' ? 'en' : 'bs';

  function apply(l) {
    lang = l;
    root.setAttribute('lang', l);
    localStorage.setItem('lang', l);

    document.querySelectorAll('[data-bs]').forEach((el) => {
      const value = l === 'en' ? el.dataset.en : el.dataset.bs;
      if (value != null) el.textContent = value;
    });

    document.querySelectorAll('[data-bs-placeholder]').forEach((el) => {
      const value = l === 'en' ? el.dataset.enPlaceholder : el.dataset.bsPlaceholder;
      if (value != null) el.setAttribute('placeholder', value);
    });

    document.querySelectorAll('[data-bs-aria]').forEach((el) => {
      const value = l === 'en' ? el.dataset.enAria : el.dataset.bsAria;
      if (value != null) el.setAttribute('aria-label', value);
    });

    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
  }

  buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.lang)));
  apply(lang);
}
