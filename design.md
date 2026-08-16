# Design System — Shagun

> Living organism under laboratory glass.

**Theme:** light  
**Voice:** botanical-clinical. Scientific credibility through typographic confidence and chromatic silence — not visual volume.

Shagun uses this language across marketing, dashboard, collector capture, and reconciliation. Warm snow-white canvas, deep forest green surfaces, whisper-light headlines (300–350). The palette is almost monochrome — 93% achromatic — with a single vivid lime (`#d3fa99`) as functional punctuation. Components are weightless: pill controls, 16px-radius cards, **no drop shadows, no gradients, no decorative borders**.

---

## Color philosophy

One chromatic pillar — Forest Depths `#1c3a13` — plus one warm neutral (Snow White) and one vivid accent (Lime Pulse). The green is dark enough to read as editorial ink. Lime Pulse is the only color that feels “switched on”; it appears only where the system must shout (sale, new, emphasis).

Do not use pure white (`#ffffff`). Do not introduce blues, reds, or purples. Do not fill large areas with Lime Pulse.

### Tokens — colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Forest Depths | `#1c3a13` | `--color-forest-depths` | Primary brand — filled CTAs, dark sections, nav, primary body text |
| Lime Pulse | `#d3fa99` | `--color-lime-pulse` | Badges, “New” tags, small functional emphasis only |
| Sage Moss | `#757c5d` | `--color-sage-moss` | Variant accent; muted green that does not compete with Forest Depths |
| Olive Gold | `#9f995b` | `--color-olive-gold` | Soft yellow wash for small highlight bands |
| Eucalyptus | `#698e79` | `--color-eucalyptus` | Cooler evening / secondary variant accent |
| Snow White | `#fcfcf7` | `--color-snow-white` | Page canvas, card surfaces, inverse text |
| Warm Stone | `#eeeee9` | `--color-warm-stone` | Secondary surface, alternating bands, muted separators |
| Frosted Glass | `#c4c7c4` | `--color-frosted-glass` | Frosted overlay / muted cards (`backdrop-filter: blur`) |
| Ash | `#b3b3b3` | `--color-ash` | Disabled buttons, low-emphasis borders |
| Pewter | `#666666` | `--color-pewter` | Secondary body, captions, helper text |
| Ink | `#000000` | `--color-ink` | Maximum-contrast body on light sections — use sparingly |

### Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Page canvas | `#fcfcf7` | Default body and most content |
| 1 | Card surface | `#eeeee9` | Subtle panels and alternating bands |
| 2 | Dark section | `#1c3a13` | Full-bleed product / feature bands |
| 3 | Accent highlight | `#d3fa99` | Badges and small callouts only |

Section backgrounds should be **Snow White or Forest Depths**. Avoid extra intermediate surfaces except Warm Stone for quiet rhythm.

### Elevation

Intentionally **shadowless**. Hierarchy comes from color contrast, type weight (300 vs 400), and space. No `box-shadow`. No gradients.

---

## Typography

**Primary:** Seed Sans — all UI, headings, body, nav, buttons. Substitute: Inter (300, 400, 500) or General Sans.  
**Mono:** Seed Sans Mono — product/batch codes, amounts, specs. Substitute: JetBrains Mono or IBM Plex Mono. Letter-spacing `+0.015em`.

OpenType: `"ss05"` on when the brand face is available.

**Signature:** weights **300–350 at 32px and above**. Body, buttons, and labels use **400–500**. Never 600+ on headlines.

### Type scale

| Role | Size | Line height | Letter spacing | Token |
|------|------|-------------|----------------|-------|
| micro | 10px | 1 | — | `--text-micro` |
| label | 12px | 1.5 | — | `--text-label` |
| caption | 14px | 1.4 | — | `--text-caption` |
| body-sm | 16px | 1.5 | — | `--text-body-sm` |
| body | 18px | 1.3 | -0.18px | `--text-body` |
| subheading | 24px | 1.2 | -0.48px | `--text-subheading` |
| heading-sm | 32px | 1.5 | — | `--text-heading-sm` |
| heading | 36px | 1 | — | `--text-heading` |
| heading-lg | 40px | 1.1 | -0.4px | `--text-heading-lg` |
| display | 48px | 1.1 | -0.72px | `--text-display` |

Tighten tracking at 24px and above (`-0.015em` to `-0.02em`).

---

## Spacing & shape

**Base unit:** 8px · **Density:** comfortable · **Page max-width:** 1200px · **Section gap:** 64px · **Card padding:** 16px · **Element gap:** 8px · **Page margins:** 24px

### Spacing scale

| Name | Value | Token |
|------|-------|-------|
| 8 | 8px | `--spacing-8` |
| 16 | 16px | `--spacing-16` |
| 24 | 24px | `--spacing-24` |
| 32 | 32px | `--spacing-32` |
| 40 | 40px | `--spacing-40` |
| 48 | 48px | `--spacing-48` |
| 56 | 56px | `--spacing-56` |
| 64 | 64px | `--spacing-64` |
| 80 | 80px | `--spacing-80` |
| 96 | 96px | `--spacing-96` |
| 128 | 128px | `--spacing-128` |

### Radius

| Element | Value | Token |
|---------|-------|-------|
| inputs | 8px | `--radius-inputs` |
| cards | 16px | `--radius-cards` |
| large cards | 32px | `--radius-large-cards` |
| buttons, badges, pills | 1000px | `--radius-full` / `--radius-buttons` |

Pills are non-negotiable for primary interactive elements. Do not use 4–8px radii on buttons or badges.

---

## Layout

- Centered grid, max-width **1200px**, **24px** horizontal margins.
- Hero: ~50/50 text-left / image-right (or full-bleed photo with left-aligned overlay).
- Sections alternate **Snow White** and **Forest Depths** at full bleed.
- Product / card grids: 4 equal columns, **16px** gutters.
- Content: ~40% text / ~60% media, **64–96px** vertical padding.
- Sticky nav **64–80px**. Large section gaps (**64–96px**). Low information density.

---

## Components

### Primary filled button

Pill, Forest Depths fill, Snow White text, 16px / 400, padding **16px × 24px**. No border, no shadow. Highest visual weight. Use for Get Started, Seal batch, Confirm amount, Save.

### Ghost outlined button

Transparent, **1.5px** Snow White border, Snow White text, same radius and padding. Sign in and actions on dark / image surfaces.

### Inverted light button

Snow White fill, **1.5px** Forest Depths border, Forest Depths text. Secondary actions on light surfaces.

### Text link with arrow

Forest Depths, **1.5px** underline, padding **7px / 10.5px**, append `→`. Shop-style and secondary nav.

### Sale / emphasis badge

Lime Pulse background, Forest Depths text, 12px / 500, padding **6px × 8px**, full pill. Only badge that uses the vivid accent.

### Product / status tag

`rgba(252, 252, 247, 0.2)` on photos; Snow White text; same pill padding. Top-left of imagery.

### Product / feature card (dark)

Transparent on Forest Depths, **16px** radius, no border, no shadow. Code pill + name (24px / 350) + media + CTA + uppercase 12px / 500 meta.

### Feature card (light)

Transparent or Frosted Glass, **16px** radius. Frosted variant: `backdrop-filter: blur(37.5px)`.

### Navigation

Full-width Snow White, sticky. Left: wordmark + green dot. Center: links. Right: ghost Sign in + primary Get Started. Height 64–80px, padding 24–48px.

### Promo banner

Full-bleed, **40px**, Snow White, Forest Depths, 12px / 500 uppercase. Icon + short line + inline link.

### Input (dark sections)

Transparent, **1.5px** Snow White border, Snow White text, **8px** radius, padding **14px / 20px**. Placeholder: semi-transparent Snow White.

### Code pill

**1.5px** outline (Snow White or Forest Depths), full pill, **6px × 8px**, 12px / 500. Specimen-label look. Use for batch IDs, gift codes, event slugs. **Mono** for the code string.

---

## Imagery & icons

High-key, naturalistic photography; shallow depth of field. No lifestyle crowds, no stock staging. Second visual: delicate organic line drawing in muted green. Icons: thin-stroke, monochrome Forest Depths or Snow White.

For Shagun product UI, envelope / ledger photography and quiet line icons follow the same restraint.

---

## Mapping to Shagun

| Product surface | Treatment |
|-----------------|-----------|
| Marketing / landing | Snow White canvas, Forest Depths hero band, whisper display headlines |
| Dashboard | Light canvas, Warm Stone panels, Forest Depths primary actions |
| Collector (snap) | Dark Forest Depths capture chrome; ghost buttons; lime only for “new / unprocessed” |
| Reconciliation | Light clinical table; mono for amounts and batch codes; pewter for helper copy |
| Auth | Light canvas, inverted + primary pills, no shadows |

Unprocessed / attention states may use **Lime Pulse** as a small pill — never as a full-row fill.

---

## Do

- Forest Depths for all primary CTAs, dark sections, and default primary text.
- Weight 300–350 for display/headings (32px+); 400–500 for body, buttons, labels.
- Lime Pulse only on badges and small pills.
- 1000px radius on buttons, badges, tags, pills.
- Section backgrounds: Snow White or Forest Depths.
- Tight tracking at 24px+.
- Mono for codes, amounts, and spec lists.

## Don’t

- Drop shadows or elevation.
- Gradients.
- Weight 600+ on headlines.
- Saturated colors outside the five greens.
- Pure white `#ffffff`.
- Square or 4–8px radii on buttons/badges.
- Large Lime Pulse surfaces.

---

## CSS custom properties

```css
:root {
  --color-forest-depths: #1c3a13;
  --color-lime-pulse: #d3fa99;
  --color-sage-moss: #757c5d;
  --color-olive-gold: #9f995b;
  --color-eucalyptus: #698e79;
  --color-snow-white: #fcfcf7;
  --color-warm-stone: #eeeee9;
  --color-frosted-glass: #c4c7c4;
  --color-ash: #b3b3b3;
  --color-pewter: #666666;
  --color-ink: #000000;

  --font-seed-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-seed-sans-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

  --text-micro: 10px;
  --leading-micro: 1;
  --text-label: 12px;
  --leading-label: 1.5;
  --text-caption: 14px;
  --leading-caption: 1.4;
  --text-body-sm: 16px;
  --leading-body-sm: 1.5;
  --text-body: 18px;
  --leading-body: 1.3;
  --tracking-body: -0.18px;
  --text-subheading: 24px;
  --leading-subheading: 1.2;
  --tracking-subheading: -0.48px;
  --text-heading-sm: 32px;
  --leading-heading-sm: 1.5;
  --text-heading: 36px;
  --leading-heading: 1;
  --text-heading-lg: 40px;
  --leading-heading-lg: 1.1;
  --tracking-heading-lg: -0.4px;
  --text-display: 48px;
  --leading-display: 1.1;
  --tracking-display: -0.72px;

  --font-weight-light: 300;
  --font-weight-w350: 350;
  --font-weight-regular: 400;
  --font-weight-medium: 500;

  --spacing-unit: 8px;
  --spacing-8: 8px;
  --spacing-16: 16px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-40: 40px;
  --spacing-48: 48px;
  --spacing-56: 56px;
  --spacing-64: 64px;
  --spacing-80: 80px;
  --spacing-96: 96px;
  --spacing-128: 128px;

  --page-max-width: 1200px;
  --section-gap: 64px;
  --card-padding: 16px;
  --element-gap: 8px;

  --radius-lg: 8px;
  --radius-2xl: 16px;
  --radius-3xl: 32px;
  --radius-full: 1000px;
  --radius-cards: 16px;
  --radius-badges: 1000px;
  --radius-inputs: 8px;
  --radius-buttons: 1000px;
  --radius-large-cards: 32px;

  --surface-page-canvas: #fcfcf7;
  --surface-card-surface: #eeeee9;
  --surface-dark-section: #1c3a13;
  --surface-accent-highlight: #d3fa99;
}
```

### Tailwind v4 `@theme`

```css
@theme {
  --color-forest-depths: #1c3a13;
  --color-lime-pulse: #d3fa99;
  --color-sage-moss: #757c5d;
  --color-olive-gold: #9f995b;
  --color-eucalyptus: #698e79;
  --color-snow-white: #fcfcf7;
  --color-warm-stone: #eeeee9;
  --color-frosted-glass: #c4c7c4;
  --color-ash: #b3b3b3;
  --color-pewter: #666666;
  --color-ink: #000000;

  --font-seed-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-seed-sans-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

  --text-micro: 10px;
  --leading-micro: 1;
  --text-label: 12px;
  --leading-label: 1.5;
  --text-caption: 14px;
  --leading-caption: 1.4;
  --text-body-sm: 16px;
  --leading-body-sm: 1.5;
  --text-body: 18px;
  --leading-body: 1.3;
  --tracking-body: -0.18px;
  --text-subheading: 24px;
  --leading-subheading: 1.2;
  --tracking-subheading: -0.48px;
  --text-heading-sm: 32px;
  --leading-heading-sm: 1.5;
  --text-heading: 36px;
  --leading-heading: 1;
  --text-heading-lg: 40px;
  --leading-heading-lg: 1.1;
  --tracking-heading-lg: -0.4px;
  --text-display: 48px;
  --leading-display: 1.1;
  --tracking-display: -0.72px;

  --spacing-8: 8px;
  --spacing-16: 16px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-40: 40px;
  --spacing-48: 48px;
  --spacing-56: 56px;
  --spacing-64: 64px;
  --spacing-80: 80px;
  --spacing-96: 96px;
  --spacing-128: 128px;

  --radius-lg: 8px;
  --radius-2xl: 16px;
  --radius-3xl: 32px;
  --radius-full: 1000px;
}
```

Until Seed Sans is licensed, use **Inter 300 / 400 / 500** and **IBM Plex Mono**. Prefer weight 300 for display if 350 is unavailable.

---

## Quick color reference

- Primary text / primary action: `#1c3a13`
- Page background: `#fcfcf7`
- Dark section: `#1c3a13`
- Accent / badge: `#d3fa99`
- Secondary surface: `#eeeee9`
