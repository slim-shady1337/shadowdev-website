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

- One orchestrated gesture: the camera flight. Stations arrive with their section, the hero fragments leave before the reading section, the last stretch cools the parts out and lights the core.
- Entry choreography happens once, on the thesis: a mask reveal on the `h1`, a soft rise for the lead, actions and plate.
- Section content does not fade up. The SVG diagram draws its leader lines once.
- `prefers-reduced-motion: reduce` removes the camera entirely, adds `html.no-3d`, drops the dimension rule, and leaves the CSS field as the ground.
- No WebGL: identical page, CSS field only.

## Components

**Button** — `.btn` is a 1 px frame with `.btn__face` inside, both chamfered. Primary: `--jezgro` face, `--tinta` label (5.81:1). Hover: `--zar`. Ghost: iron face at 84% with a hairline edge, `--zar` label on hover. On vellum the primary inverts to ink face with vellum label. Focus: 2 px `--zar` ring at 4 px offset on iron, ink ring on vellum. Busy state sets `aria-busy` and swaps the label for "Šaljem…" with a stepping spinner.

**Form** — 48 px controls, 1 px `--linija-p-jaka` border, ink text, orange focus ring tight to the box, error state adds `--greska` border and an inset underline plus a square-marked message tied by `aria-describedby`. The summary is `role="alert"` and focus moves to the first invalid field.

**Nav** — fixed, 66 px, themed from the surface under it (`data-nav="iron" | "paper"`); colour mark + wordmark on iron, ink pair on vellum. Links lose the underline and gain a 1 px orange baseline on hover.

**Hero figure** — the Hub from `@lucasmarkes/hairline`: one core, eight modules on dashed links; the module under the pointer rises and its link turns solid. It is the hero's only image, drawn in the page's ink through the library's six custom properties, set on `.hero__figure`: `--hairline-plate #0b0d0e` (must equal the ground — it masks what the drawing hides behind itself), `--hairline-hi #ff5e1f` (the lit module and its link), `--hairline-edge #a7adb1`, `--hairline-mid #6e767a`, `--hairline-lo rgba(140,146,152,.34)`, `--hairline-stroke 1`. `role="img"` and focus come from the library; the label is bilingual. At `intensity .62` it answers a pointer firmly without twitching; under `prefers-reduced-motion` it mounts at `intensity 0` and rests. It fills the upper right above 1100 px and sits above the copy below that. The inline SVG still in the hero is the fallback: it shows only when the figure cannot mount, and alone when scripting is off.

**Station** — 100 svh, text on the left six columns behind a vertical hairline, outlined number and rotated kind label in the gutter, 3D part on the right in the camera's frame.

## Voice

Bosnian ijekavian, active verbs, from the client's point of view. One action name everywhere: **Zakaži razgovor**. The form's action is **Pošalji upit**. Errors say what to fix and how. No claim on the page is invented: references and numbers are visibly `PLACEHOLDER`.

## Files

`src/styles/tokens.css` (all values) · `base.css` (reset, type, controls) · `sections.css` (composition) · `journey.css` (scene, dimension rule, entry) · `src/three/world.ts` (the scene) · `src/content/site.ts` (every string, BS + EN).
