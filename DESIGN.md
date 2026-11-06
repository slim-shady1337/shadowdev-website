# ShadowDev — design system

The world is a foundry. A company arrives in pieces; the page casts those pieces into one working system. Everything visual follows from two facts: **heat only exists where work is happening**, and **what has cooled is vellum, quiet, and documented**.

## Palette

Six roles, two of them pinned by the client.

| Token | Hex | Role |
|---|---|---|
| `--tmina` | `#0B0D0E` | Ground. Cool soot iron, never pure black. |
| `--grafit` | `#15191B` | Raised plate, the second surface. |
| `--celik` | `#8C9298` | Secondary text on iron, hairlines, dimensions. |
| `--hartija` | `#ECEDE8` | Cooled vellum: every section after the pour. |
| `--jezgro` | `#FF5E1F` | Primary. Live work, action, the core. |
| `--zar` | `#FF9911` | Secondary. Hottest edge: hover, live state, the hottest part of heat. |

Derived, not new brand colours: `--tekst-d #D9DCD6` (reading text on iron), `--tinta #0B0D0E` (ink on vellum), `--celik-tinta #525A5E` (secondary on vellum), `--greska #A3210D` (form errors, only on vellum).

**Contrast, measured:** `#FF5E1F` on `#0B0D0E` = 6.37:1 · `#8C9298` on `#0B0D0E` = 6.49:1 · ink on `#ECEDE8` = 15.8:1 · `#525A5E` on `#ECEDE8` = 5.82:1 · ink on `#FF5E1F` = 5.81:1. Orange is never used as small text on vellum (2.48:1) — there it is fill, mark, or large graphic only.

## Type

Three voices, two families plus a technical monospace.

- **Display — Anybody** (variable). `font-weight: 760`, `font-stretch: 116%`, uppercase, `line-height: .88`, `letter-spacing: -.012em`. Wide, squared, machined; it sits beside the client's wordmark without competing with it. Used for `h1`, `h2`, station titles, and nothing else.
- **Text — Archivo** (variable 400–700). 17 px body, `line-height: 1.62`, measure ≤ 60 ch. All reading copy.
- **Code — Martian Mono** (variable 400–700). 11 px, `letter-spacing: .14em`, uppercase. Part numbers, routing operations, tags, dimensions, counters. Anything that is a code or a count.

Scale: hero `clamp(2.55rem, 5.1vw, 4.5rem)` · h2 `clamp(1.85rem, 3.15vw, 2.9rem)` · lead `clamp(1.05rem, 1.15vw, 1.28rem)` · body `1.0625rem` · small `.875rem` · micro `.6875rem`.

## Space and grid

12 columns, `--gut clamp(14px, 1.5vw, 22px)`, page padding `clamp(20px, 4.2vw, 68px)`, max width 1560 px. Vertical rhythm in five steps (`--stack-1` … `--stack-5`), always more space above a heading than below it.

Journey sections are one viewport each; paper sections breathe on `--stack-5`.

## Shape

**One cut corner.** `--chamfer: 14px` (11 px on phones) on every solid face: primary and ghost buttons, the form plate, the proof cards, the success mark. A shape with no fill (tags, frames, rules) stays square, because a cut border cannot close.

No border radius anywhere. No drop shadows. Depth comes from the surface colour, hairlines, and the scene.

## Rules that carry information

- The **dimension rule** at the bottom edge: a measured line with a moving pointer, station count, and station name. It exists only while the assembly is on screen.
- The **assembly index** in the legend: code, name, one-line spec per station — a bill of materials, not a menu.
- **Routing numbers** `10 · 20 · 30 · 40 · 50` in the process section: a real manufacturing sequence.
- **Station plate**: outlined number + rotated kind label (`ERP`, `MES`, …) beside the vertical rule. Never a caps eyebrow above a heading.

## Motion

- The page has no camera and no WebGL: the drawings are the journey. Each figure answers the pointer in its own way (a tile rises, a belt slows, layers open, a dish aims); the page itself never moves unless the reader moves it.
- Figures mount only while their section is within 240 px of the viewport and are torn down when it leaves — a station already read costs nothing.
- Entry choreography happens once, on the thesis: a mask reveal on the `h1`, a soft rise for the lead, actions and plate.
- Section content does not fade up. The SVG diagram draws its leader lines once.
- `prefers-reduced-motion: reduce`: figures mount at `intensity 0` and rest, entry animations stop, smooth scrolling is dropped for native scroll.
- Smooth scroll is Lenis; without it the page scrolls natively and behaves identically.

## Components

**Button** — `.btn` is a 1 px frame with `.btn__face` inside, both chamfered. Primary: `--jezgro` face, `--tinta` label (5.81:1). Hover: `--zar`. Ghost: iron face at 84% with a hairline edge, `--zar` label on hover. On vellum the primary inverts to ink face with vellum label. Focus: 2 px `--zar` ring at 4 px offset on iron, ink ring on vellum. Busy state sets `aria-busy` and swaps the label for "Šaljem…" with a stepping spinner.

**Form** — 48 px controls, 1 px `--linija-p-jaka` border, ink text, orange focus ring tight to the box, error state adds `--greska` border and an inset underline plus a square-marked message tied by `aria-describedby`. The summary is `role="alert"` and focus moves to the first invalid field.

**Nav** — fixed, 66 px, themed from the surface under it (`data-nav="iron" | "paper"`); colour mark + wordmark on iron, ink pair on vellum. Links lose the underline and gain a 1 px orange baseline on hover.

**Hero figure** — the Hub from `@lucasmarkes/hairline`: one core, eight modules on dashed links; the module under the pointer rises and its link turns solid. It is the hero's only image, drawn in the page's ink through the library's six custom properties, set on `.hero__figure`: `--hairline-plate #0b0d0e` (must equal the ground — it masks what the drawing hides behind itself), `--hairline-hi #ff5e1f` (the lit module and its link), `--hairline-edge #a7adb1`, `--hairline-mid #6e767a`, `--hairline-lo rgba(140,146,152,.34)`, `--hairline-stroke 1`. `role="img"` and focus come from the library; the label is bilingual. At `intensity .62` it answers a pointer firmly without twitching; under `prefers-reduced-motion` it mounts at `intensity 0` and rests. It fills the upper right above 1100 px, sits at the upper left between 900 and 1100, and at 900 and below it becomes the first item of a column above the copy — its host stays `position: relative` there, because the library's `svg` is `inset: 0` against the host and would otherwise stretch across the whole hero. In that column a short viewport pushes the headline down rather than under the drawing. The inline SVG still in the hero is the fallback: it shows only when the figure cannot mount, and alone when scripting is off.

**Station** — content-height (never a full viewport, so no band of empty ground sits between drawings), text in six columns behind a vertical hairline, outlined number and rotated kind label in the gutter. Every station's part is a Hairline figure: **Station figure** — `.station__figure` is the grid half the copy is not using (7–12, or 1–6 on flipped stations), `position: relative` so the library's `inset: 0` svg stays inside it, sharing the same six `--hairline-*` values as the hero, 600 px wide and centred in its half. The sides alternate so six stations do not read as one template: copy left on 1, 2 and 4; copy right on 3, 5 and 6. On phones the grid collapses, the figure is centred above the copy and the copy keeps its own left alignment. Each figure mounts only while its section is within 240 px of the viewport and is torn down when it leaves; the copy is never overlapped, since both are grid items rather than layers.

## Voice

Bosnian ijekavian, active verbs, from the client's point of view. One action name everywhere: **Zakaži razgovor**. The form's action is **Pošalji upit**. Errors say what to fix and how. No claim on the page is invented: references and numbers are visibly `PLACEHOLDER`.

## Files

`src/styles/tokens.css` (all values) · `base.css` (reset, type, controls) · `sections.css` (composition) · `journey.css` (scene, dimension rule, entry) · `src/three/world.ts` (the scene) · `src/content/site.ts` (every string, BS + EN).
