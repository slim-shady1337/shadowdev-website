// ============================================
// APP — boot
// ============================================

import { initNav } from './nav.js';
import { initI18n } from './i18n.js';
import { initForm } from './form.js';

export function boot() {
  initNav();
  initI18n();
  initForm();

  // 3D se učitava lijeno, poslije prvog iscrtavanja
  const loadWorld = () => {
    import('./world.js')
      .then((m) => m.initWorld())
      .catch((err) => {
        console.warn('[ShadowDev] 3D svijet nije učitan; statična verzija ostaje.', err);
        document.documentElement.classList.add('no-3d');
      });
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(loadWorld, { timeout: 1800 });
  } else {
    setTimeout(loadWorld, 500);
  }
}
