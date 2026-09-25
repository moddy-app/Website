# CLAUDE.md — moddy.app website

Entry point for AI agents working on the Moddy website. Read the **Design
guidelines** before touching anything visible: the site has one consistent
look, and every new page or card must look like it was always there.

---

## Project

| | |
|---|---|
| Stack | Eleventy (Nunjucks) + Lit web components + Material Web (`@material/web`) |
| Source | `site/` (npm project). Pages in `site/site/*.html`, TS in `site/src/`, CSS in `site/site/css/` |
| Build | `cd site && npm run build:prod` → `site/_prod/` (Vercel serves it) |
| Local preview | `cd site && npx http-server _prod -p 8099 -s` |
| Languages | en (at `/`), fr, es, pt-br, de (at `/fr`, `/es`, `/pt-br`, `/de`) |

Key files:

- `site/_includes/default.html`: the layout (top bar, content, footer). Front matter it reads:
  `titleKey` (i18n key of the `<title>`), `basePath` (enables hreflang + the locale redirect),
  `clientI18n: true` (page rendered once for every language, translated in the browser:
  the 404), `hideFooter: true` (special pages).
- `site/site/css/home-page.css`: the design system in practice (cards, bento, shapes,
  tints, motion). The home page and `/premium` use it; new pages should too
  (`{% inlinecss "home-page.css" %}`).
- `site/src/components/top-app-bar.ts`: top bar + signed-in user menu.
- `site/src/pages/*.ts`: page scripts (esbuild). End a page module with `export {};` or
  an import so its names stay out of the global scope.
- `site/_data/`: `locales.json`, `i18n/<locale>.json`, `brand.json` (baseline),
  `palettes.js` (random themes), `publicStats.js` (stats fetched at build time),
  `build.js` (deployment id).
- Script URLs in templates always end with `?v={{ build.version }}`: the entry
  scripts keep their name between deployments and the CDN caches them for hours
  in the browser, so without it a returning visitor runs old JS on new HTML.

### i18n (mandatory)

- Every visible string comes from `site/_data/i18n/<locale>.json`, in **all 5 locales**.
  The build fails on a missing key. Filters: `t`, `tObject`, `docsUrl`, `formatNumber`,
  `formatPrice` (`eleventy-helpers/filters/i18n.cjs`).
- Pages are rendered once per locale with `pagination` over `locales`; use
  `{{ 'key' | t(c) }}` with `c = locale.code`, and localized links
  (`{{ loc.prefix }}/premium/`, `'/path' | docsUrl(c)`).
- Components get their text through a `labels` JSON attribute (`top-app-bar`,
  `theme-changer`), never hardcoded.
- The baseline "Built to let you focus on your community" (`brand.json`) stays in
  English in every language.

---

## Design guidelines

### 1. Principles

- **Minimal bento.** The page is a grid of plain rounded cards. One idea per card:
  a title, one or two sentences, and at most one illustration or a few buttons.
- **Nothing decorative without meaning.** No gradients on cards, no glows, no
  shadows on cards, no background patterns, no emoji. A visual shows the product
  doing something (a real-looking Discord message, a log line, a dashboard row),
  or it doesn't exist.
- **Calm.** Motion is rare and purposeful (§7). The page never moves on its own
  except inside an illustration that is on screen.
- **Same margins everywhere.** One spacing value per level (§3). If two gaps on a
  page differ, one of them is wrong.

### 2. Colors

- **Only Material theme tokens** (`--md-sys-color-*`). Never a hex value in CSS.
  The theme is a random seed on every load (`partials/random-theme.html`, locked
  once the user picks one in the footer), in light and dark: anything hardcoded
  will clash with some theme.
- Page background: `surface-container` (set on `:root`). Cards:
  `surface-container-lowest`, one step lighter. Inner panels (a chip, a path pill,
  the user card in the menu): `surface-container`.
- **Small colored areas** (icon shapes, badges) use the containers:
  `primary-container` / `tertiary-container` / `secondary-container`, or `primary`
  for the one solid accent (`.tone-solid`).
- **Large colored areas** (tiles, big highlights) use the soft tints from
  `.home`: `--tint-primary`, `--tint-tertiary`, `--tint-secondary`. Containers are
  too loud at that size.
- Text: `on-surface` for titles, `on-surface-variant` for body and secondary text,
  `primary` for accents (numbers, badges), `error` only for errors and sign out.
- The only colors computed from content: server tiles and the Moddy Max avatar
  ring, both taken from the picture (`src/utils/main-color.ts`), with the theme
  colors as fallback.

### 3. Layout and spacing

| Token | Desktop | ≤ 600px | Use |
|---|---|---|---|
| `--page-gap` | 20px | 12px | page margin, gap between cards, space above the footer |
| `--home-card-padding` (`--space`) | 32px | 20px | card padding **and** the space between blocks inside a card |
| `--home-card-radius` | 32px | 24px | card corners |
| content width | `.home` max 1240px, centered | full width | |

- Grid: `.bento` is 12 columns; cards take `span-3` … `span-8` (default 12). Rows
  must be full: no holes, spans of a row add up to 12.
- Breakpoints: ≤ 1100px every span ≥ 4 becomes 12 (`span-3` → 6); ≤ 900px `.card.split`
  becomes one column; ≤ 600px smaller radius and padding. Check at 390px wide: no
  horizontal scroll, ever.
- Buttons sit at the bottom of their card (`.card-actions`, `margin-top: auto`).
- **Special pages** (404 and the like): `hideFooter: true`, content narrower
  (≈1040px, 640px once stacked) and centered both ways in the window.

### 4. Cards

```html
<section class="card span-7"><span class="edge-caps" aria-hidden="true"><i class="cap-top"><b class="tl"></b><b class="tr"></b></i><span class="own"><b class="tl"></b><b class="tr"></b><b class="bl"></b><b class="br"></b></span><i class="cap-bottom"><b class="bl"></b><b class="br"></b></i></span>
  …
</section>
```

- `.card` uses `overflow: clip` (not `hidden`) and **must** start with that
  `edge-caps` span (copy it as is). A card with it has no `border-radius`: its
  corners are drawn by small pieces in the page color (`.own`), and two sticky
  pairs (`.cap-top`, `.cap-bottom`) keep the corners round where the card meets
  the top bar and the bottom margin of the window (a fixed band,
  `.bento::after`, one page margin high; the footer is drawn over it).
- On a card's last two radii the pieces shrink with `transform: scale()` on the
  card's view timeline, so it ends as a pill. Only `transform`: it runs on the
  compositor in step with the scroll. Never animate `border-radius`, a custom
  property, clip-path or anything else on scroll: all were tried and lagged or
  flickered on phones. The bottom edge animates only with a mouse (phone
  address bars move the bottom of the window mid-scroll).
- A card heading is `h2` (`h1` only for the page's hero). Title → text →
  (visual) → actions, separated by `--space`.
- Every card has a hover state **only** if the whole card is a link. Otherwise,
  no hover on cards.

### 5. Typography

- Font: **Google Sans** (variable, self-hosted, preloaded), weight **600** for
  headings and names, 400–500 for text. **Google Sans Mono** for code, paths, ids.
- Sizes: page `h1` `clamp(38px, 5.2vw, 64px)`; card `h2` 28px (24px ≤ 600px);
  body `--catalog-body-l-font-size` (16px), line-height 1.5, max width ~560px;
  small print 13–15px.
- Numbers that change (stats, counters) use `font-variant-numeric: tabular-nums`
  and the locale's format (`formatNumber`, `Intl.NumberFormat`).
- Dynamic values the user did not write (a path, an id) go in a mono pill, never
  inline in a sentence.

### 6. Icons, shapes, components

- Icons: **Material Symbols Outlined**, **filled** (`'FILL' 1`) in shapes, menus
  and badges. No emoji anywhere.
- A feature icon sits in a **polygon shape**, not a circle or a clover:
  `<span class="shape shape-hexagon tone-tertiary"><span class="material-symbols-outlined">…</span></span>`.
  Shapes: `square`, `diamond`, `pentagon`, `hexagon`, `heptagon`, `octagon`;
  tones: default (primary), `tone-secondary`, `tone-tertiary`, `tone-solid`; sizes 56px
  or `.small` (36px). Vary shapes and tones between neighbouring cards.
- Buttons are Material Web: `md-filled-button` for the one main action,
  `md-outlined-button` for the others, at most three in a row. No custom buttons.
- Menus (`md-menu`): container `surface-container-lowest`, 24px corners, items
  48px high with 16px corners and 8px side margin, filled leading icons, a divider
  inset 16px on both sides, destructive item in `error`. No "external link" icons.
- Tooltips: `inverse-surface` / `inverse-on-surface`, 4px corners, 12px text,
  opacity fade only.
- Avatars: round, `object-fit: cover`. Example people in illustrations use
  `site/images/avatars/*.webp` (Memoji style) and `moddy.webp` for Moddy, never
  initials or stock photos.
- User menu: `@username` + email, a round verified badge (`check_circle`, 16px,
  `primary`, one icon for every kind, the kind in its tooltip), and a ring around
  the top bar avatar for Moddy Max (only in the bar, not in the menu). The ring
  is drawn **outside** the picture: the avatar keeps its 32px either way.
- Theme menu (footer): the site's colors as round swatches (the picked one turns
  into a rounded square with a check) after a "random on every visit" swatch,
  a custom color panel (picker + hex + HCT sliders), and the color mode as three
  segments. Keep every one of these when changing it.

### 7. Motion

- All motion lives inside `@media (prefers-reduced-motion: no-preference)`; without
  it every illustration shows its final state and nothing moves.
- Easing `cubic-bezier(0.2, 0, 0, 1)` (`--ease`); 150–400ms for UI, slower only
  for ambient loops (a shape turning in 24s).
- **Hover only on things that react to the pointer** (links, chips, buttons) and
  only where it tells something (a chip fills in and its arrow slides out). No
  hover on stats, text or illustrations.
- Illustrations play as small scripted demos (`playDemo` / `stepper` with
  `data-at`, `data-done-at`, `data-press-at` in `src/pages/home-page.ts`) and run
  **only while visible** (`loopWhileVisible`). No scroll-triggered entrance
  animations on cards.
- Never compute anything on scroll. Prefer CSS (sticky, transforms) the browser
  composites.
- Loading: the page stays hidden until the components on screen are defined and
  the fonts are loaded (1.5 s max, `html.booting` in `default.html`), then fades
  in; undefined components keep their final size. No flash of fallback font,
  raw buttons or icon names.

### 8. Copy

- Plain, specific, short. Say what Moddy does, with real features and numbers.
  No marketing filler ("seamless", "powerful", "unlock", "elevate", "supercharge",
  "revolutionize", "next level"), no rhetorical questions, no triplets for rhythm,
  no em-dash asides.
- One light joke is welcome on a dead end (404), never in product copy.
- Write the French first if unsure, then translate each locale properly (idioms
  adapted, not word for word).

### 9. Before you push a visual change

1. `npm run build:prod` passes (it also checks every i18n key).
2. Screenshots with Playwright (Chromium is at `/opt/pw-browsers/chromium`) of the
   page on desktop (1400px) and mobile (390px), light and dark, in at least two
   languages; look at them.
3. Scroll a card past the top bar and the bottom edge: corners stay round.
4. Reload a few times: no layout shift during load, and the random theme looks
   right with every seed.
