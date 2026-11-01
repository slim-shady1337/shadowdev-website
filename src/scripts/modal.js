// ============================================
// MODAL — zakazivanje sastanka
// ============================================

export function initModal() {
  const modal = document.getElementById('contact-modal');
  const closeBtn = document.getElementById('modal-close');
  if (!modal) return;

  function open() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    const first = modal.querySelector('input, textarea');
    if (first) setTimeout(() => first.focus(), 50);
  }

  function close() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  document.querySelectorAll('[data-open-modal]').forEach((btn) => btn.addEventListener('click', open));
  closeBtn?.addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}
