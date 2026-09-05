# 03 — SURFACES, LAYOUT, COMPONENTS

## 1. Grid philosophy

The page should feel designed on a hidden grid.

Recommended desktop starting point:

- max content width: `1120–1320px`
- outer gutter: `24–48px`
- section vertical rhythm: `96–180px`
- common spacing rhythm: `4, 8, 12, 16, 24, 32, 48, 64, 96`

Use fluid sizing where useful, e.g. `clamp()` for type and major gaps.

The exact numbers can change by product. Consistency matters more than the initial value.

---

## 2. Negative space

Whitespace is a structural material.

Large empty areas should:

- isolate an important statement
- create a pause between ideas
- make a product screenshot feel valuable
- increase perceived quality
- direct the eye toward a focal point

Do not fill empty space because it looks “unfinished.”

Premium pages are allowed to breathe.

---

## 3. Section composition

A high-end page should not look like a vertical stack of identical cards.

Instead alternate compositions:

**statement → proof → detail → proof → narrative pause → system view → final conviction**

Vary:

- alignment
- width
- density
- image-to-text ratio
- crop
- background tone

Maintain the same underlying grid so the variation feels authored rather than random.

---

## 4. Containers

Use containers with intention.

### Marketing section container

Broad, open, often no visible boundary.

### Product showcase container

May use a thin border, subtle radius, and elevated surface because it represents an application window.

### Supporting card

Use when information needs grouping. Avoid cardifying every paragraph.

### Modal / command surface

Higher contrast, slightly more elevation, tight spacing, strong focus.

---

## 5. Corner radius system

Choose a coherent family, not arbitrary radii.

Example:

- small: `8px`
- medium: `12px`
- large: `16px`
- showcase: `20–28px`
- pill: use only when the control semantics justify it

Do not give every component `9999px` radius.

Sharp or moderately rounded geometry generally feels more precise than universal pill shapes.

---

## 6. Borders

Borders should be felt before they are noticed.

Prefer:

- 1px low-contrast borders
- inside/outside layering
- a slight difference in border strength between states

Avoid:

- thick outlines
- bright white borders
- gradient borders everywhere

A premium surface can sometimes be defined by one subtle line.

---

## 7. Shadows

Use low-spread, low-opacity shadows for separation.

Good shadow logic:

- large soft shadow for application windows
- close, subtle shadow for controls
- almost no shadow for flat content surfaces

Dark mode often benefits more from **luminance + border + overlap** than from heavy shadow.

---

## 8. Buttons

### Primary button

Should feel like an instrument: compact, confident, immediately legible.

Recommended traits:

- strong contrast
- medium radius
- 36–48px height depending on context
- precise horizontal padding
- clear hover state
- tiny transition, not theatrical animation

### Secondary button

Should be visually quieter, not invisible.

Use surface contrast or a subtle border.

### Text / ghost action

Use for tertiary actions and navigation.

Do not turn every CTA into a filled rectangle.

### Button hierarchy

One section should typically have one visually dominant action.

---

## 9. Navigation

Navigation should disappear into the product's visual field rather than competing with the hero.

Recommended:

- compact height
- understated text
- restrained separators
- one clear primary action
- subtle sticky/blur behavior only when useful

On dark pages, avoid a bright navbar bar. The top chrome should feel like part of the substrate.

---

## 10. Product UI showcases

The hero should often show a **realistic product state** rather than a generic dashboard mockup.

Important details:

- believable hierarchy
- authentic data density
- realistic labels
- plausible sidebars
- consistent icon sizes
- believable states
- micro-details such as status indicators, timestamps, keyboard hints, avatars, metadata

A product demo should be convincing even when the viewer cannot read every word.

---

## 11. Screenshot framing

A premium product screenshot should rarely be pasted raw.

Give it:

- a clear crop
- enough breathing room
- subtle elevation
- a controlled border
- an intentional scale
- a visual reason to exist in that section

For large showcases, allow some overflow beyond the container so the product feels spatial rather than boxed into a generic card.

---

## 12. Icons

Use one icon family.

Rules:

- consistent stroke weight
- consistent optical size
- consistent bounding box
- no random emoji replacing system icons

Icons should support scanning. They should not become decorations.

---

## 13. Texture system

Possible subtle layers:

### Base substrate

Flat or nearly flat.

### Atmospheric layer

Very soft radial light behind a focal point.

### Material layer

A tiny gradient across a surface to imply volume.

### Microtexture

Optional noise/grain, extremely low opacity.

The user should notice the overall richness before noticing the texture itself.

---

## 14. Component consistency matrix

A redesign agent should define globally:

- spacing scale
- type scale
- radius scale
- border system
- shadow system
- button heights
- input heights
- icon sizes
- focus styles
- surface levels
- semantic color states

Then use those tokens everywhere.
