// ============================================
// THEME — tamna (default) / svijetla
// ============================================

export function initTheme() {
  const root = document.documentElement;

  function updateIcons() {
    const isLight = root.classList.contains('light');
    const sun = document.getElementById('icon-sun');
    const moon = document.getElementById('icon-moon');
    const sunM = document.querySelector('.m-icon-sun');
    const moonM = document.querySelector('.m-icon-moon');

    sun?.classList.toggle('hidden', isLight);
    moon?.classList.toggle('hidden', !isLight);
    sunM?.classList.toggle('hidden', isLight);
    moonM?.classList.toggle('hidden', !isLight);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isLight ? '#f3f7fd' : '#05070b');
  }

  function toggle() {
    const isLight = root.classList.toggle('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateIcons();
  }

  document.getElementById('theme-toggle')?.addEventListener('click', toggle);
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => btn.addEventListener('click', toggle));

  updateIcons();
}
