# ShadowDev — OneForAll

Single-page sajt kao **putovanje kroz digitalni sistem**: scroll vodi 3D kameru kroz šest stanica usluga do svijetlećeg jezgra — jedan partner, jedan sistem, sve povezano.

## Pokretanje

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/
npm run preview  # lokalni pregled builda
```

> Napomena za Windows: ako `npm run build` padne na `.astro`/`node_modules` dozvolama, pokreni terminal sa punim pravima na folder projekta. (U ovom okruženju build je radio uz šire dopuštenje sandboxa.)

## Stack

- **Astro 7** — statički sajt, jedan ulaz (`src/pages/index.astro`)
- **Three.js** — 3D scena i kamera, lijeno učitana (`world` chunk)
- **GSAP + ScrollTrigger** — mapiranje scrolla na kameru i stanice
- **Lenis** — glatki scroll sinhronizovan sa GSAP tickerom

## Kako radi putovanje

- `#journey` obuhvata hero → uvod → 6 stanica → spajanje.
- Scroll progres (ScrollTrigger) mapira se na `CatmullRomCurve3` putanju; kamera leti kroz stanice.
- Stanice su proceduralne (moduli, tunel impulsa, dijelovi koji se slažu, slojevi prozora, telefon, talasi signala); na kraju se sve stapa u jezgro („OneForAll").
- Bez WebGL-a ili uz `prefers-reduced-motion`: scena se ne učitava (`html.no-3d`), sadržaj ostaje potpuno upotrebljiv.

## Dizajn sistem

| Token | Hex | Uloga |
|---|---|---|
| Void | `#060609` | scena / pozadina |
| Slate | `#101118` | površine |
| Bone | `#E8E3D6` | primarni tekst |
| Ash | `#8A8A94` | sekundarni tekst |
| Ember | `#F0A23C` | jezgro / primarna akcija |
| Signal | `#56E0C2` | podaci / živo stanje |

- **Display:** Syne (600–800) · **Tekst:** Manrope (400–600) · **Mono:** sistemski (`ui-monospace`)
- Aktivni stilovi: `src/styles/system.css` + `src/styles/journey.css`
- Komponente: `src/components/*` · skripte: `src/scripts/*`

## Pristupačnost i performanse

- Semantički HTML, jedan `h1`, vidljiv fokus, skip link, `aria` oznake, forma sa `role="alert"` greškama.
- Canvas je `aria-hidden`; sav sadržaj postoji kao tekst u sekcijama.
- `prefers-reduced-motion`: bez 3D-a i bez animacija putovanja.
- DPR ograničen (1.4 mobilno / 1.75 desktop), 3D lijeno, pauza kad je putovanje van ekrana ili tab skriven.
- Meta + Open Graph + JSON-LD (`Organization`).

## PLACEHOLDERI — popuniti prije objave

1. **Kontakt:** `info@shadowdev.ba`, `+387 61 000 000`, lokacija „Sarajevo" — u `BaseLayout.astro` (footer), `ContactSection.astro` i JSON-LD-u.
2. **Reference:** dvije kartice i četiri brojke u `References.astro` (označene `PLACEHOLDER`) — zamijeniti stvarnim projektima/klijentima (uz dozvolu) i izmjerenim podacima.
3. **OG slika:** `public/og.jpg` ne postoji — dodati 1200×630 i provjeriti `og:image`.
4. **Canonical URL:** `https://shadowdev.ba/` u `BaseLayout.astro` (`siteUrl`) — promijeniti ako je domena drugačija.
5. **Društvene mreže:** dodati `sameAs` u JSON-LD i linkove u footer ako ih koristite.
6. **Logo:** koristi se postojeći `public/logo.png`; poželjna mono/svijetla varijanta za tamnu podlogu.
7. **Forma:** Netlify Forms (`data-netlify="true"`, polje `form-name="kontakt"`). Lokalno se prikazuje simulirani uspjeh; na deployu radi stvarno slanje. Po potrebi dodati `action`.
8. **Sigurnosna zaglavlja:** preporučeni CSP (npr. `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; connect-src 'self'`) — podesiti na hostingu. Nema tajnih ključeva u kodu.

## QA (opciono)

`qa/qa.mjs` pokreće instalirani Chrome preko `puppeteer-core` (nije dio produkcionog bundlea) i provjerava 375/768/1440, reduced-motion, formu i jezik. Rezultati i screenshotovi su u `qa/out/`.

## Napomena o starim fajlovima

Fajlovi iz prethodne iteracije (`global.css`, `cyberpunk.css`, stari `components/*`, stari `scripts/*` osim `nav.js`) više se ne uvoze i mogu se obrisati.
