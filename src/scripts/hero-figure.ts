/* ==========================================================================
   Hero figure — the Hub from @lucasmarkes/hairline, mounted on demand.
   Loaded as its own chunk so it never blocks the first paint; if it fails,
   the static drawing in the hero stays visible instead.
   ========================================================================== */

import type { Figure } from '@lucasmarkes/hairline';

let figure: Figure | null = null;

export async function mountHeroFigure(
  el: HTMLElement,
  opts: { intensity: number; label: string }
): Promise<void> {
  if (figure) return;
  const { hub } = await import('@lucasmarkes/hairline');
  figure = hub(el, { intensity: opts.intensity, label: opts.label, play: false });
}

export function setHeroFigureLabel(label: string): void {
  figure?.update({ label });
}
