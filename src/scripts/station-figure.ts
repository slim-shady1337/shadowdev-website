/* ==========================================================================
   Station figures — every station's part drawn as a Hairline figure.
   Each host mounts only while its section is near the viewport (some figures
   keep a clock running) and is torn down when it leaves, so a station you have
   passed costs nothing. One chunk for the package, tree-shaken to six figures.

   Each figure plays its own lap once, when its station is the one the reader
   is looking at, then rests until the page is reloaded.
   ========================================================================== */

import type { Figure } from '@lucasmarkes/hairline';

export type StationFigureId = 'relay' | 'slow' | 'settle' | 'exploded' | 'phone' | 'dish';

const LABEL: Record<StationFigureId, { bs: string; en: string }> = {
  relay: {
    bs: 'Četiri grane oko jezgra; putanja do čvora pod pokazivačem pali se čvor po čvor.',
    en: 'Four branches around a core; the path to the node under the pointer lights hop by hop.'
  },
  slow: {
    bs: 'Traka sa sanducima prolazi kroz kapiju; pokazivač usporava hod trake.',
    en: 'Crates on a belt passing through a gate; the pointer slows the belt down.'
  },
  settle: {
    bs: 'Dvanaest pločica leži ukrivo oko jezgra; kad se pokazivač približi, slažu se u stablo.',
    en: 'Twelve tiles lie crooked around a hub; as the pointer nears, they settle into a tree.'
  },
  exploded: {
    bs: 'Prozor aplikacije rastavljen na slojeve; pokazivač ih razmiče.',
    en: 'An app window taken apart into layers; the pointer opens the gap.'
  },
  phone: {
    bs: 'Telefon u slojevima: staklo, ploča, baterija, kućište.',
    en: 'A phone in layers: glass, board, battery, shell.'
  },
  dish: {
    bs: 'Tanjir na dvije ose; pokazivač ga nacilja.',
    en: 'A dish on two axes; the pointer aims it.'
  }
};

async function load(id: StationFigureId) {
  const lib = await import('@lucasmarkes/hairline');
  switch (id) {
    case 'relay':
      return lib.relay;
    case 'slow':
      return lib.slow;
    case 'settle':
      return lib.settle;
    case 'exploded':
      return lib.exploded;
    case 'phone':
      return lib.phone;
    case 'dish':
      return lib.dish;
  }
}

/** How long one lap of a figure's own tour is given before it is asked to rest. */
const LAP_MS = 7000;

type Entry = {
  id: StationFigureId;
  figure: Figure | null;
  wanted: boolean;
  loading: boolean;
  played: boolean;
  autoplayWanted: boolean;
};

const entries = new Map<HTMLElement, Entry>();
const lapTimers = new WeakMap<HTMLElement, number>();
let reducedMotion = false;

function startLap(host: HTMLElement, entry: Entry): void {
  if (!entry.figure || entry.played) return;
  entry.played = true;
  entry.autoplayWanted = false;
  entry.figure.update({ play: true });
  const timer = window.setTimeout(() => {
    entry.figure?.update({ play: false });
    lapTimers.delete(host);
  }, LAP_MS);
  lapTimers.set(host, timer);
}

export function mountStationFigures(hosts: HTMLElement[], intensity: number): void {
  if (!hosts.length) return;
  reducedMotion = intensity === 0;

  for (const el of hosts) {
    const id = el.dataset.figureId as StationFigureId | undefined;
    if (id && id in LABEL) {
      entries.set(el, { id, figure: null, wanted: false, loading: false, played: false, autoplayWanted: false });
    }
  }

  const label = (id: StationFigureId) =>
    document.documentElement.lang === 'en' ? LABEL[id].en : LABEL[id].bs;

  async function sync(el: HTMLElement, entry: Entry): Promise<void> {
    if (entry.wanted && !entry.figure && !entry.loading) {
      entry.loading = true;
      try {
        const make = await load(entry.id);
        entry.loading = false;
        if (!entry.wanted) return;
        entry.figure = make(el, { intensity, label: label(entry.id), play: false });
        el.dataset.figure = entry.id;
        /* the reader may have arrived before the chunk did */
        if (entry.autoplayWanted) startLap(el, entry);
      } catch {
        entry.loading = false;
        el.dataset.figure = 'failed';
      }
      return;
    }
    if (!entry.wanted && entry.figure) {
      entry.figure.destroy();
      entry.figure = null;
      entry.played = false;
      const timer = lapTimers.get(el);
      if (timer) {
        window.clearTimeout(timer);
        lapTimers.delete(el);
      }
      delete el.dataset.figure;
    }
  }

  const io = new IntersectionObserver(
    (records) => {
      for (const record of records) {
        const entry = entries.get(record.target as HTMLElement);
        if (!entry || entry.wanted === record.isIntersecting) continue;
        entry.wanted = record.isIntersecting;
        void sync(record.target as HTMLElement, entry);
      }
    },
    { rootMargin: '240px 0px' }
  );

  for (const el of entries.keys()) io.observe(el);

  document.addEventListener('sd:lang', () => {
    for (const entry of entries.values()) {
      if (entry.figure) entry.figure.update({ label: label(entry.id) });
    }
  });
}

/**
 * Play one lap of the figure's own choreography, once, when its station is the
 * one the reader is looking at. The library stops the lap itself as soon as the
 * pointer or focus arrives; the timer is only the outer bound.
 */
export function playStationFigureOnce(station: Element | null): void {
  if (!station || reducedMotion) return;
  const host = station.querySelector<HTMLElement>('[data-station-figure]');
  if (!host) return;
  const entry = entries.get(host);
  if (!entry || entry.played) return;

  if (!entry.figure) {
    /* not mounted yet: remember it and let sync() start the lap on mount */
    entry.autoplayWanted = true;
    return;
  }
  startLap(host, entry);
}
