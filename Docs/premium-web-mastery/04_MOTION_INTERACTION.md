# 04 — MOTION + INTERACTION

## 1. Motion philosophy

Motion should answer one question:

> **What changed, and where did it go?**

Use animation to communicate state, hierarchy, causality, continuity, and feedback.

Do not animate merely to prove the site is sophisticated.

Apple's current guidance explicitly recommends purposeful motion, brief and precise feedback, and avoiding gratuitous animation. It also emphasizes respecting reduced-motion preferences. citeturn234904search0turn234904search2

---

## 2. Motion categories

### Micro

100–180ms-ish

Use for:

- button hover
- icon state
- small opacity changes
- focus rings

### UI transition

180–320ms-ish

Use for:

- menus
- drawers
- tabs
- filtering
- small panel changes

### Cinematic reveal

320–700ms-ish

Use sparingly for:

- hero entrance
- product showcase reveal
- section transition

### Scroll choreography

Use only for high-value storytelling.

One coordinated animation is better than ten independent effects.

---

## 3. Easing

Preferred feel:

- fast response on interaction
- gentle settle
- no excessive bounce

Use a consistent motion grammar rather than choosing a random easing curve per component.

---

## 4. Entrance choreography

A strong hero reveal can follow:

1. page substrate appears
2. navigation resolves quietly
3. eyebrow/label appears
4. headline enters
5. supporting line resolves
6. CTA becomes available
7. product visual finishes the composition

The page should feel like it **settles into place**, not like objects are thrown onto the screen.

---

## 5. Hover states

Premium hover behavior is often tiny:

- 1–3px movement
- slight brightness shift
- border contrast increase
- subtle shadow increase
- icon translation

Avoid huge scaling on buttons and cards.

---

## 6. Product demonstration motion

This is one of the highest-value places to animate.

Examples:

- list item enters
- task changes state
- AI response streams
- graph updates
- cursor moves to a meaningful action
- navigation changes context
- panel expands to reveal detail

The animation should make the product easier to understand.

---

## 7. Parallax

Use only when multiple layers create real depth.

Good:

- slight background movement behind a stable product frame
- foreground UI moving a little faster than atmospheric texture

Bad:

- entire page floating at different speeds
- large objects sliding unpredictably
- text drifting away from reading position

---

## 8. Reduced motion

Every animated experience must have a reduced-motion path. Essential information cannot depend exclusively on animation.

Use `prefers-reduced-motion: reduce` to reduce or remove:

- large transforms
- continuous loops
- aggressive parallax
- repetitive peripheral motion

Apple explicitly calls for alternatives and reduced-motion behavior for accessibility. citeturn234904search0turn234904search2

---

## 9. Performance rule

Do not sacrifice interaction latency for visual polish.

Prefer:

- transforms and opacity
- CSS where sufficient
- lightweight motion libraries where needed
- lazy loading
- poster/fallback states
- GPU-friendly animation

Avoid:

- huge videos where CSS can do the job
- continuous canvas effects behind every section
- dozens of simultaneous observers
- expensive WebGL for decorative purposes

---

## 10. The motion quality test

Turn animations off.

If the page loses meaning, the information architecture is weak.

Turn animations on.

If the page becomes difficult to read, motion is too strong.

The ideal result is:

**excellent static page + motion makes it feel alive.**
