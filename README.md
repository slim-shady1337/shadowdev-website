# ShadowDev — OneForAll

Jedna stranica kao putovanje kroz sklop: tamna scena u kojoj fragmenti poslovanja lebde, kamera vođena skrolom prolazi kroz šest stanica, a na kraju se sve hladni i stapa u jedno svijetleće jezgro.

**Ideja svijeta:** ljevaonica. Toplota postoji samo tamo gdje se radi — boja `#FF5E1F` je živo djelo, `#FF9911` najtoplija ivica. Sve što je isporučeno hladi se u hartiju (`#ECEDE8`): mirno, dokumentovano, čitljivo.

## Pokretanje

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # dist/
npm run preview   # pregled produkcijskog builda
```

Node 22.12+.

> Windows napomena: `astro dev` i `astro build` brišu sopstvene lock fajlove u `.astro/` i `dist/`. Ako ih pokrećeš iz okruženja koje blokira brisanje, pokreni terminal sa punim pravima na folder projekta.

## Stack

- **Astro 7** — statički sajt, jedan ulaz: `src/pages/index.astro`
- **@lucasmarkes/hairline** — sve slike na stranici: Hub u heroju + šest figura za stanice. Jedan lijeno učitan chunk (~118 kB / ~30 kB gzip), crta se u bojama stranice preko `--hairline-*` varijabli
- **Lenis** — glatki skrol (bez njega se skroluje native)
- Fontovi se hostuju lokalno (`public/fonts/`), bez treće strane

**Nema WebGL-a.** Tri.js i GSAP su izbačeni zajedno sa 3D scenom — ukupan JS je ~147 kB nekompresovano (prije ~700 kB).

## Struktura

```
src/
  content/site.ts        svi tekstovi, BS + EN, na jednom mjestu
  layouts/BaseLayout.astro   head, meta, JSON-LD, nav, footer, dimenziona linija
  components/            Hero, Legend, Stations, Convergence, Process,
                         Security, Proof, Contact, Footer, Nav
  styles/                tokens.css · base.css · sections.css · journey.css · fonts.css
  scripts/main.ts        jezik, nav, skrol, forma
  scripts/hero-figure.ts Hub figura u heroju (lijeno učitana)
  scripts/station-figure.ts šest figura — svaka se montira samo dok je sekcija blizu
public/
  fonts/                 Anybody (display), Archivo (tekst), Martian Mono (kodovi)
  brand/                 logo izdvojen iz priloženog lockupa: mark / wordmark / lockup,
                         u boji i u tinta verziji
  og.png                 Open Graph slika 1200×630 (generisana iz qa/og.html)
```

## Kako radi putovanje

- `#journey` obuhvata hero → uvod → šest stanica → spajanje. Skrol vodi kroz crteže; nema kamere.
- **Hero**: Hub figura — jezgro i osam modula; modul pod pokazivačem se podiže. Ako figura ne uspije da se učita, ostaje statični SVG; bez JS-a takođe.
- **Stanice 1–6** su figure: Relay, Slow, Settle, Exploded, Phone, Dish. Svaka se **montira samo dok je sekcija blizu ekrana** i gasi kad je prođeš (neke imaju sat koji stalno radi), pa prođena stanica ne košta ništa.
- **Naizmjeničan raspored** da šest stanica ne izgleda kao jedan te isti šablon: 1 i 2 tekst lijevo, 3 tekst desno, 4 lijevo, 5 i 6 desno. Figure su uvijek centrirane u svojoj polovini.
- **Na telefonu** je svaka stanica kolona: figura centrirana iznad teksta, nikad preko njega.
- Sekcije su visine sadržaja (ne 100svh), da između crteža ne ostaje prazan pojas.
- Završnica je SVG dijagram: šest čvorova oko jezgra.
- Uz `prefers-reduced-motion`: figure se montiraju sa `intensity 0` (miruju), animacije ulaza su isključene, skrol je native.

## Dizajn sistem (kratko)

| Token | Hex | Uloga |
|---|---|---|
| Tmina | `#0B0D0E` | tlo, hladna sjena |
| Grafit | `#15191B` | podignuta površina |
| Čelik | `#8C9298` | sekundarni tekst, dlačice |
| Hartija | `#ECEDE8` | isporučeno, „ohlađeno“ |
| Jezgro | `#FF5E1F` | primarna boja, akcija |
| Žar | `#FF9911` | hover, živo stanje |

- **Display:** Anybody (`wdth 116`, `wght 760`, velika slova) · **Tekst:** Archivo · **Kodovi:** Martian Mono
- Jedan rez 45° (`--chamfer`) na svakoj punoj površini; nigdje zaobljenja; nigdje sjene.
- Kontrast: `#FF5E1F` na tmini 6.37:1, tinta na hartiji 15.8:1, tinta na jezgru 5.81:1. Narandžasta se nikad ne koristi kao sitan tekst na hartiji (2.48:1).
- Detalji: `DESIGN.md`, tokeni: `src/styles/tokens.css`, mašinski zapis: `.impeccable/design.json`.

## Pristupačnost

- Semantički HTML, jedan `h1`, skip link, vidljiv fokus (2px, `#FF9911` na tmini / tinta na hartiji), tastatura radi svuda.
- Canvas je `aria-hidden`; cijela ponuda postoji kao tekst; dijagram ima `<title>` i `<desc>`.
- Forma: `aria-invalid`, greške vezane `aria-describedby`, `role="alert"` sažetak, fokus na prvo neispravno polje, fokus prelazi na potvrdu nakon slanja.
- `prefers-reduced-motion`: bez kamere, bez animacija ulaza, dijagram je već nacrtan.
- Bez WebGL-a: ista stranica, samo CSS polje.

## Sigurnost

- Nema tajnih ključeva u kodu; nema serverske logike.
- Forma: `data-netlify="true"` + `form-name`, honeypot polje i vremenska zamka; greške ne otkrivaju ništa osim što treba ispraviti.
- Preporučena CSP zaglavlja (podesiti na hostingu; fontovi su lokalni pa nije potreban `fonts.gstatic.com`):

```
Content-Security-Policy:
  default-src 'self';
  img-src 'self' data:;
  style-src 'self' 'unsafe-inline';
  font-src 'self';
  script-src 'self';
  connect-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self'
Referrer-Policy: strict-origin-when-cross-origin
X-Content-Type-Options: nosniff
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Provjereno / nije provjereno

**Provjereno** (produkcijski build, stvarni Chrome, headless):
- 375 / 768 / 1440 px: nema horizontalnog prelijevanja, nema grešaka u konzoli.
- Svih šest stanica: figura montirana, **bez preklapanja s tekstom**, ispravna strana (1–2 i 4 figura desno, 3, 5 i 6 lijevo), na telefonu centrirana iznad teksta.
- Figure se gase kad sekcija izađe iz vidnog polja (provjereno za sve šest).
- **Figura odradi jedan krug sama** kad njena stanica dođe u centar ekrana (provjereno snimkama: pokretna za vrijeme kruga, mirna poslije). Ne ponavlja se dok se stanica ne napusti i ponovo posjeti.
- **Brojanje sklopa radi u oba smjera**: 00 na početku, 01–06 kod stanica, 00 i skrivena traka na spajanju, i ispravno nazad 06 → 03 → 01 → 00.
- **Svaki nav link doskoči na 92 px** (25 px ispod navigacije), isto i za native skok preko `scroll-margin-top`.
- LCP ~900–1030 ms; CLS 0.0003 / 0.0001.
- `prefers-reduced-motion`: figure se montiraju sa `intensity 0`, animacije ulaza isključene, skrol native.
- Forma: prazno slanje → 4 greške, fokus na prvom polju; ispravno slanje → potvrda, fokus na potvrdi (uz simuliran 200 odgovor).
- BS/EN prekidač: `lang`, naslov, `h1`, navigacija, `aria-label` i labele figura se mijenjaju.
- Mobilni meni: `aria-expanded`, `inert`, Escape, povratak fokusa.
- Impeccable detektor: 0 nalaza.

**Nije provjereno:**
- Safari / iOS i Firefox nisu testirani.
- Stvarno slanje forme na Netlify-ju (lokalno je odgovor simuliran).
- Lighthouse/PSI na mreži.
- Frame rate na slabijim telefonima (nema više WebGL-a, ali figure imaju SVG animacije dok je pokazivač na njima).

## PLACEHOLDERI — popuniti prije objave

1. **Kontakt** — `kontakt@shadowdev.ba`, `+387 61 000 000`, „Sarajevo, Bosna i Hercegovina“ u `src/content/site.ts` → `contact.details`, `Footer.astro` i JSON-LD u `BaseLayout.astro`.
2. **Reference** — dvije kartice i tri brojke u `src/content/site.ts` → `proof` (označene `PLACEHOLDER`). Ubaciti stvarne projekte (uz dozvolu klijenta) i izmjerene podatke.
3. **Domena / canonical / OG URL** — `https://shadowdev.ba/` u `src/layouts/BaseLayout.astro` (`siteUrl`).
4. **OG slika** — `public/og.png` je generisana iz `qa/og.html`; ako se mijenja naslov, regenerisati (`node qa/make-icons.mjs`).
5. **Forma** — Netlify Forms. Na drugom hostingu dodati `action` na endpoint ili zamijeniti slanje u `src/scripts/main.ts` (`sendForm`).
6. **Društvene mreže** — ako ih imate, dodati `sameAs` u JSON-LD i linkove u podnožje.
7. **Logo** — izvorni lockup je `public/logo.png`; izvedene datoteke u `public/brand/` pravi `node qa/build-assets.mjs`. Zamijeniti i ponovo pokrenuti ako se logo promijeni.
8. **CSP / sigurnosna zaglavlja** — podesiti na hostingu prema gore navedenom predlogu.

## Porijeklo slika (provenance)

Nijedna slika nije generisana modelom i nijedna nije stock. Sve izlazi iz priloženog logotipa ili iz koda u ovom repozitoriju:

| Datoteka | Porijeklo |
|---|---|
| `public/logo.png`, `public/banner.png` | Isporučio klijent, nepromijenjeno |
| `public/brand/*.png` (8 datoteka) | Izrezano iz `logo.png` skriptom `qa/build-assets.mjs` — detekcija traka po alfa kanalu, tijesan trim, prozirna podloga; `-ink` varijante su ista geometrija u boji `#0B0D0E` |
| `public/favicon-32.png`, `public/favicon-180.png` | Smanjeni znak iz `public/brand/mark-color.png` skriptom `qa/make-icons.mjs` |
| `public/og.png` | Snimak `qa/og.html` u 1200×630 (`qa/make-icons.mjs`); tipografija Anybody + Martian Mono, logotip iz `public/brand/lockup-color.png` |

`public/og.png` nosi i ugrađen `tEXt` zapis sa istim podacima (386 znakova). Ostale PNG datoteke nemaju ugrađen zapis — alat za embed nije mijenjao te fajlove, pa je porijeklo zapisano ovdje i u `qa/provenance/`.

## QA skripte (nisu dio bundlea)

```sh
npx astro preview --port 4399
node qa/capture.mjs http://127.0.0.1:4399/ ime 1440 900   # snimci sekcija + metrike
node qa/interactions.mjs                                  # meni, forma, jezik, reduced, no-webgl
node qa/build-assets.mjs                                  # fontovi + izvedeni logo
node qa/make-icons.mjs                                    # favikoni + OG slika
```

Snimci i izvještaji idu u `qa/out/`.
