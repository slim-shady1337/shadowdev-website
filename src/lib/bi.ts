import type { Bi } from '../content/site';

/** Spreads Bosnian + English into the data attributes the switcher reads. */
export function bi(value: Bi): Record<string, string> {
  return { 'data-bs': value.bs, 'data-en': value.en };
}
