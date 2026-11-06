/* ==========================================================================
   Station figure — the MES station drawn as the Hairline "Slow" figure
   (crates on a belt through a gate; the pointer slows the belt down).
   Same pattern as the hero: its own chunk, a bilingual label, and a static
   drawing left behind if the chunk never arrives.

   Slow keeps a clock running, so it is mounted only while its section is near
   the viewport and torn down when it leaves: a station you have passed should
   cost nothing.
   ========================================================================== */

import type { Figure } from '@lucasmarkes/hairline';

const LABEL = {
  bs: 'Traka sa sanducima prolazi kroz kapiju; pokazivač usporava hod trake.',
  en: 'Crates on a belt passing through a gate; the pointer slows the belt down.'
};

export function mountMesFigure(el: HTMLElement, opts: { intensity: number }): void {
  let figure: Figure | null = null;
  let wanted = false;
  let loading = false;

  const label = () => (document.documentElement.lang === 'en' ? LABEL.en : LABEL.bs);

  async function sync(): Promise<void> {
    if (wanted && !figure && !loading) {
      loading = true;
      try {
        const { slow } = await import('@lucasmarkes/hairline');
        loading = false;
        if (!wanted) return;
        figure = slow(el, { intensity: opts.intensity, label: label(), play: false });
        el.dataset.figure = 'slow';
      } catch {
        loading = false;
        el.dataset.figure = 'failed';
      }
      return;
    }
    if (!wanted && figure) {
      figure.destroy();
      figure = null;
      delete el.dataset.figure;
    }
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting === wanted) continue;
        wanted = entry.isIntersecting;
        void sync();
      }
    },
    { rootMargin: '240px 0px' }
  );
  io.observe(el);

  document.addEventListener('sd:lang', () => {
    figure?.update({ label: label() });
  });
}
