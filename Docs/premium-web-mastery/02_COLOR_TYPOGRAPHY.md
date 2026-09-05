# 02 — COLOR + TYPOGRAPHY

## 1. Color philosophy

Color should establish **material hierarchy, semantic meaning, and brand memory**.

The safest premium system is mostly neutral with one controlled accent family.

A strong default dark palette:

| Token | Starter value | Role |
|---|---:|---|
| `bg-0` | `#090A0B` | page substrate |
| `bg-1` | `#0D0F11` | main section / app surface |
| `bg-2` | `#121416` | elevated surface |
| `bg-3` | `#171A1D` | active / hover surface |
| `line-1` | `#22262A` | primary borders |
| `line-2` | `#191C20` | ultra-subtle separators |
| `text-1` | `#F5F5F3` | primary text |
| `text-2` | `#B1B5BA` | secondary text |
| `text-3` | `#777D84` | metadata / tertiary text |
| `text-4` | `#555B62` | disabled / de-emphasized |
| `accent` | product-specific | CTA / active state |
| `accent-soft` | derived | accent backgrounds |
| `danger` | product-specific | destructive state |
| `success` | product-specific | success state |

These are **starter tokens, not sacred colors**. The product's brand and accessibility requirements may justify changes.

---

## 2. Dark mode: material, not black

A convincing dark UI has an internal light hierarchy.

Do not use `#000000` for everything.

Avoid making borders pure white. Use low-luminance neutral borders that become legible only when needed.

### Recommended surface progression

`bg-0 < bg-1 < bg-2 < bg-3`

The difference between adjacent levels should be noticeable when intentionally looking for it, but never look like four unrelated gray boxes.

### Texture

For subtle depth:

- very light radial/linear tonal shifts
- microscopic grain/noise at extremely low opacity when needed
- soft inset highlights on elevated surfaces
- tiny border contrast
- occasional background vignette around focal areas

Never let texture compete with text.

---

## 3. Light mode

For premium light mode, avoid pure white everywhere.

Starter system:

| Token | Starter value |
|---|---:|
| `bg-0` | `#FAFAF8` |
| `bg-1` | `#F5F5F2` |
| `bg-2` | `#FFFFFF` |
| `line-1` | `#E4E4E0` |
| `text-1` | `#171717` |
| `text-2` | `#5B5B58` |
| `text-3` | `#8B8B86` |

The light theme should feel **paper + interface**, not “website on a white document.”

---

## 4. Accent strategy

Use an accent as a **signal**.

Good uses:

- primary CTA
- active navigation item
- key status
- selection
- important data point
- one hero emphasis

Bad use:

- every icon
- every card
- every heading
- all borders
- every hover state
- entire backgrounds saturated with the brand color

### Accent rule

If everything is emphasized, nothing is emphasized.

---

## 5. Typography hierarchy

Typography should perform most of the visual work.

Suggested hierarchy for a landing page:

- Display: `clamp(3.25rem, 7vw, 7rem)`
- H1: `clamp(2.75rem, 5vw, 5.5rem)`
- H2: `clamp(2rem, 3.4vw, 3.75rem)`
- H3: `1.35rem–1.8rem`
- Body large: `1.05rem–1.25rem`
- Body: `0.95rem–1.05rem`
- Small: `0.78rem–0.9rem`
- Micro: `0.68rem–0.75rem`

These are ranges, not mandatory values.

### Weight system

Prefer a small set:

- 400 — body
- 500 — labels / navigation
- 600 — subheads / controls
- 700 — high emphasis where required

Avoid using many weights merely to decorate the page.

---

## 6. Typeface selection

Use one excellent sans-serif family or a sans + restrained editorial secondary face.

Preferred qualities:

- clean lowercase forms
- excellent numerals
- strong rendering at small sizes
- several weights
- good punctuation
- broad language support

Good default candidates include modern system/UI sans families or a carefully chosen contemporary grotesk. The exact font matters less than:

**metrics + weight distribution + tracking + line height + hierarchy.**

Notion explicitly supports Default, Serif, and Mono typography modes, showing how type itself can be part of the product's expressive system. citeturn567821search0

---

## 7. Tracking and line height

Headlines:

- slightly tight tracking
- compact line height
- deliberate line breaks

Body:

- comfortable line height
- neutral tracking
- readable measure

Microcopy:

- slightly increased tracking can help in all-caps labels
- never use tracking as a substitute for hierarchy

Avoid letting a hero headline span every possible width. A powerful headline usually has an intentionally constrained measure.

---

## 8. Type contrast rules

Use contrast in this order:

1. size
2. weight
3. color
4. spacing
5. casing
6. decoration

Do not start with bright colors or underlines.

---

## 9. Accessibility guardrail

Visual subtlety must not destroy readability. Apple recommends auditing color contrast and sizing/weight decisions for readability and accessible use, and notes that thin type can require larger sizes. citeturn234904search2

The redesign agent must validate contrast for important text and controls instead of blindly following “premium subtle gray” aesthetics.
