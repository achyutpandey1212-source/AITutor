# LUMO — Design System

> **Status:** Locked  
> **Purpose:** Source of truth for Lumo's visual design tokens and foundational interface rules.

---

# 1. Design System Philosophy

Lumo's design system is built around:

> **Calm × Curious × Cinematic**

The system should create an interface that feels:

- premium
- warm
- intelligent
- approachable
- spacious
- visually expressive
- consistent
- learning-focused

The design system must support both light and dark themes while preserving the same Lumo identity.

---

# 2. Design Principles

## 2.1 Clarity Over Decoration

Visual elements must have a purpose.

Do not add:

- unnecessary cards
- decorative gradients
- excessive shadows
- random illustrations
- unnecessary borders
- excessive animation

when they do not improve comprehension or navigation.

---

## 2.2 Negative Space Is Intentional

Empty space is a design element.

Do not automatically fill available space.

Use generous spacing to create:

- hierarchy
- focus
- calmness
- premium perception
- visual breathing room

---

## 2.3 Color Creates Hierarchy

Color should guide attention rather than decorate every component.

A typical screen should have:

1. neutral foundation
2. one primary visual emphasis
3. limited supporting accents

Avoid making every component colorful.

---

## 2.4 Components Must Feel Like One Product

All screens must use the same:

- colors
- typography
- spacing
- radii
- borders
- shadows
- interaction states
- iconography

Do not invent a separate visual language for individual pages.

---

# 3. Color System

Lumo uses a colorful and expressive visual identity without becoming visually noisy.

The primary personality comes from:

> **Orange / Coral**

Supported by:

> **Mint / Green + Yellow + Sky Blue**

Occasional supporting colors such as pink or lavender may be used where appropriate.

Indigo and purple should NOT be used as Lumo's primary brand identity.

Avoid the stereotypical:

> blue/indigo/purple AI SaaS gradient.

---

# 4. Core Brand Colors

These are the foundational Lumo colors.

## Lumo Orange

```text
Primary: #FF5A36
```

Primary brand/action color.

Use for:

- primary CTAs
- important actions
- active states
- key highlights
- brand moments
- important interactive elements

Orange should be visually prominent but not appear on every component.

---

## Lumo Coral

```text
Primary: #FF765C
```

A softer companion to the primary orange.

Use for:

- gradients
- illustrations
- secondary highlights
- friendly states
- decorative visual moments

---

## Lumo Peach

```text
Primary: #FFB39F
```

Use sparingly for:

- soft backgrounds
- illustrations
- subtle decorative elements
- selected states

---

## Lumo Yellow

```text
Primary: #F5B942
```

Use for:

- highlights
- important concepts
- curiosity prompts
- learning emphasis
- achievement moments

Yellow should be used as an accent rather than a dominant interface color.

---

## Lumo Mint

```text
Primary: #55C98A
```

Use for:

- positive learning states
- mastery
- progress
- successful completion
- interactive visualizations

---

## Lumo Sky

```text
Primary: #55A9E8
```

Use for:

- informational states
- maps
- scientific visualizations
- secondary learning indicators
- subject-specific visuals

---

## Lumo Pink

```text
Primary: #F39AB5
```

Optional supporting accent.

Use sparingly for:

- illustrations
- special visual moments
- younger learner experiences
- decorative highlights

Pink should never become the dominant brand color.

---

# 5. Light Theme

The light theme is a core part of Lumo's identity.

It should feel:

> **Fruity, fresh, warm, optimistic, spacious, and premium.**

"Fruity" means expressive accent colors and playful visual energy.

It does NOT mean:

- childish
- rainbow-colored
- cluttered
- overly saturated
- toy-like

---

## Light Theme Foundations

### Background

```text
#FAF9F5
```

Warm ivory foundation.

Use as the primary application background.

---

### Surface

```text
#FFFFFF
```

Primary elevated surface.

Use for:

- cards
- panels
- dialogs
- navigation surfaces
- lesson containers

---

### Surface Soft

```text
#F5F3EE
```

Use for:

- secondary sections
- subtle containers
- input backgrounds
- inactive areas

---

### Text Primary

```text
#172033
```

Use for:

- headings
- primary body text
- important labels

---

### Text Secondary

```text
#5E6675
```

Use for:

- descriptions
- supporting text
- metadata
- secondary labels

---

### Text Muted

```text
#89909D
```

Use for:

- placeholders
- timestamps
- disabled information
- tertiary metadata

---

### Border

```text
#E7E4DC
```

Use for subtle separation.

---

# 6. Dark Theme

The dark theme should feel:

> **Premium, cinematic, immersive, and intelligent.**

It should NOT feel:

- cyberpunk
- neon-heavy
- hacker-themed
- aggressively futuristic

---

## Dark Theme Foundations

### Background

```text
#0D0F12
```

Primary dark background.

---

### Surface

```text
#15181D
```

Primary elevated surface.

---

### Surface Elevated

```text
#1B1F25
```

Used for:

- cards
- dialogs
- active panels
- elevated lesson elements

---

### Text Primary

```text
#F7F5EF
```

Warm white text.

---

### Text Secondary

```text
#B6BAC2
```

Secondary text.

---

### Text Muted

```text
#7E848F
```

Muted text.

---

### Border

```text
#292D34
```

Subtle dark-mode borders.

---

# 7. Semantic Colors

Semantic colors communicate meaning and must not depend on color alone.

---

## Success

```text
Light: #39A96B
Dark:  #62D394
```

Use for:

- correct answers
- completed concepts
- successful actions
- mastery

Always pair with a symbol or text when communicating meaning.

Example:

> ✓ Correct

not simply a green background.

---

## Warning

```text
Light: #D99527
Dark:  #F2B84B
```

Use for:

- attention
- incomplete work
- caution
- important reminders

---

## Error

```text
Light: #DE6B68
Dark:  #F18480
```

Use for:

- actual errors
- failed actions
- invalid input
- destructive states

Error states should feel constructive rather than punitive.

Prefer:

> "Let's try that again."

over:

> "WRONG."

---

## Information

```text
Light: #428FD1
Dark:  #6CB8F2
```

Use for:

- explanations
- tips
- contextual information
- informational notifications

---

# 8. Color Usage Ratio

A typical interface should approximately follow:

```text
70–85%  Neutral foundation
10–20%  Surfaces / secondary neutrals
5–10%   Brand and semantic colors
```

These percentages are guidelines, not strict mathematical requirements.

The important principle is:

> **Neutral space should dominate. Color should create emphasis.**

---

# 9. Gradients

Gradients are allowed but should be used intentionally.

Preferred gradient behavior:

- subtle
- warm
- atmospheric
- brand-relevant

Good examples:

```text
Orange → Coral
Peach → Orange
Yellow → Peach
Mint → Sky
```

Avoid:

```text
Purple → Indigo → Blue
```

as a generic AI aesthetic.

Do not use gradients on every:

- button
- card
- heading
- background
- icon

---

# 10. Typography

## Primary Typeface

### Plus Jakarta Sans

Use Plus Jakarta Sans as the primary Lumo typeface.

It provides a balance between:

- friendliness
- readability
- modernity
- premium appearance
- technical credibility

It should work across:

- younger learners
- teenagers
- university students
- teachers
- parents

---

# 11. Typography Hierarchy

## Display

```text
Size: 64px
Weight: 700
Line Height: 1.05
Letter Spacing: -0.035em
```

Use primarily for:

- landing-page hero headlines
- major brand statements

Do not use excessively inside the application.

---

## H1

```text
Size: 40px
Weight: 700
Line Height: 1.15
Letter Spacing: -0.025em
```

---

## H2

```text
Size: 32px
Weight: 700
Line Height: 1.2
Letter Spacing: -0.02em
```

---

## H3

```text
Size: 24px
Weight: 650
Line Height: 1.25
Letter Spacing: -0.015em
```

---

## H4

```text
Size: 20px
Weight: 600
Line Height: 1.3
```

---

## Body Large

```text
Size: 18px
Weight: 400
Line Height: 1.6
```

Use for:

- important descriptions
- introductory copy
- learning explanations

---

## Body

```text
Size: 16px
Weight: 400
Line Height: 1.55
```

Primary application body text.

---

## Body Small

```text
Size: 14px
Weight: 400
Line Height: 1.5
```

Use for:

- supporting information
- metadata
- secondary descriptions

---

## Caption

```text
Size: 12px
Weight: 500
Line Height: 1.4
```

Use sparingly for:

- labels
- timestamps
- small metadata

---

# 12. Typography Rules

Do:

- maintain strong hierarchy
- keep paragraphs readable
- use weight to establish emphasis
- use size changes intentionally
- keep line lengths comfortable

Avoid:

- excessive font weights
- giant text everywhere
- all-caps body copy
- decorative typography
- multiple unrelated typefaces
- low-contrast text

---

# 13. Spacing System

Lumo uses an **8px base spacing system**.

Primary spacing tokens:

```text
4px
8px
12px
16px
24px
32px
40px
48px
64px
80px
96px
128px
```

---

## Spacing Usage

### 4px

Micro spacing.

Use for:

- icon/text relationships
- tightly grouped metadata
- small visual adjustments

---

### 8px

Small internal spacing.

Use for:

- compact controls
- labels
- icon groups

---

### 12px

Small component spacing.

Use for:

- button content
- compact cards
- input elements

---

### 16px

Standard component spacing.

Use for:

- buttons
- inputs
- compact cards
- navigation items

---

### 24px

Primary component spacing.

Use for:

- card padding
- grouped controls
- sections within components

---

### 32px

Major internal spacing.

Use for:

- large cards
- content groups
- page subsections

---

### 40–48px

Large section spacing.

Use for:

- major layout separation
- hero internal spacing
- large content groups

---

### 64px+

Page-level spacing.

Use for:

- major sections
- hero sections
- transitions between content groups

---

# 14. Page Layout Width

Desktop content should generally use:

```text
Maximum width: 1200–1280px
```

Do not stretch content unnecessarily across the entire viewport.

Large screens should preserve comfortable reading and interaction widths.

---

# 15. Radius System

Lumo uses soft geometry.

Components should feel friendly without becoming excessively bubbly.

---

## Small Radius

```text
8px
```

Use for:

- compact elements
- small tags
- small controls

---

## Medium Radius

```text
12px
```

Use for:

- buttons
- inputs
- compact cards

---

## Large Radius

```text
16px
```

Use for:

- standard cards
- panels
- content containers

---

## XL Radius

```text
20px
```

Use for:

- large feature cards
- major content panels

---

## Cinematic Radius

```text
24px
```

Use selectively for:

- hero visual containers
- AI tutor presentation areas
- major lesson stages
- cinematic visual experiences

---

## Radius Rule

Do not use extremely rounded corners by default.

Avoid making every element:

```text
32px+
```

The interface should feel:

> soft but sophisticated.

---

# 16. Borders

Borders should be subtle.

They exist primarily to:

- establish boundaries
- separate surfaces
- improve scanning
- define interactive areas

They should not become decorative outlines.

---

## Light Theme

Primary border:

```text
#E7E4DC
```

Subtle border:

```text
#EEECE6
```

---

## Dark Theme

Primary border:

```text
#292D34
```

Subtle border:

```text
#20242A
```

---

## Border Width

Default:

```text
1px
```

Use thicker borders only when there is a functional reason.

---

# 17. Shadows

Lumo uses restrained shadows.

Avoid dramatic floating-card shadows.

---

## Light Theme Shadow — Small

```text
0 1px 3px rgba(23, 32, 51, 0.06)
```

Use for:

- small interactive elements
- subtle elevation

---

## Light Theme Shadow — Medium

```text
0 8px 24px rgba(23, 32, 51, 0.08)
```

Use for:

- dropdowns
- popovers
- elevated cards

---

## Light Theme Shadow — Large

```text
0 16px 40px rgba(23, 32, 51, 0.10)
```

Use sparingly for:

- dialogs
- major floating surfaces
- hero elements

---

## Dark Theme Shadow

Dark mode should rely more heavily on:

- tonal contrast
- borders
- surface variation

rather than large black shadows.

When shadows are necessary, keep them subtle.

---

# 18. Elevation System

Lumo uses four conceptual elevation levels.

---

## Level 0 — Ground

The page itself.

```text
Background
```

No shadow.

---

## Level 1 — Surface

Standard content surfaces.

Examples:

- cards
- panels
- navigation

Use:

- slight tonal difference
- subtle border
- minimal shadow if necessary

---

## Level 2 — Elevated

Examples:

- dropdowns
- popovers
- floating controls
- important interactive panels

Use:

- stronger surface contrast
- subtle shadow

---

## Level 3 — Floating

Examples:

- modal dialogs
- command menus
- major floating interfaces

Use:

- strongest surface contrast
- controlled shadow
- clear separation

---

## Level 4 — Cinematic

Reserved for major visual experiences.

Examples:

- hero visual
- AI tutor stage
- immersive lesson visual
- special learning simulation

Level 4 should not mean "big shadow."

It means:

> **strong visual separation and attention hierarchy.**

---

# 19. Surface Hierarchy

The interface should establish hierarchy through subtle differences.

### Light

```text
Background
#FAF9F5

Surface
#FFFFFF

Soft Surface
#F5F3EE
```

### Dark

```text
Background
#0D0F12

Surface
#15181D

Elevated Surface
#1B1F25
```

Avoid excessive shades that make the interface visually noisy.

---

# 20. Breakpoints

Lumo should be responsive by default.

Recommended breakpoints:

```text
Mobile Small:   < 480px
Mobile:         480px–767px
Tablet:         768px–1023px
Desktop:        1024px–1279px
Large Desktop:  1280px+
```

These are layout breakpoints, not device-specific requirements.

---

# 21. Mobile Rules

On mobile:

- prioritize the primary task
- reduce decorative elements
- simplify navigation
- stack complex layouts
- maintain generous touch targets
- avoid horizontal overflow
- preserve hierarchy
- keep important actions visible

Do not simply shrink the desktop interface.

Mobile layouts should be intentionally composed.

---

# 22. Tablet Rules

Tablet layouts should balance:

- desktop information density
- mobile interaction simplicity

Two-column layouts may remain where appropriate, but should collapse when readability suffers.

---

# 23. Desktop Rules

Desktop layouts may use:

- multi-column compositions
- persistent navigation
- larger lesson stages
- expanded visualizations
- richer supporting information

However:

> More screen space does not mean more UI.

Negative space remains important.

---

# 24. Large Desktop Rules

For very large displays:

- constrain content width
- avoid stretched paragraphs
- avoid oversized cards
- preserve visual hierarchy
- allow additional breathing room

Do not design exclusively around filling the viewport.

---

# 25. Responsive Typography

Typography should adapt naturally.

Suggested hero behavior:

```text
Desktop:
64px

Tablet:
48–56px

Mobile:
40–44px
```

Body text should remain comfortably readable rather than becoming excessively small.

---

# 26. Accessibility

Accessibility is part of the design system.

Never communicate meaning through color alone.

For example:

Bad:

```text
Green = correct
Red = incorrect
```

Preferred:

```text
✓ Correct
↻ Let's try another approach
```

Color provides additional reinforcement.

---

## Contrast

Text and important interface elements must maintain strong contrast against their backgrounds.

Do not use pale accent colors for critical text.

---

## Focus States

Interactive elements must have a visible focus state.

Keyboard users should always be able to determine which element is active.

---

## Touch Targets

Interactive mobile controls should provide comfortable touch targets.

Avoid tiny icons as the only interaction mechanism.

---

## Reduced Motion

Respect:

```text
prefers-reduced-motion
```

Users who request reduced motion should receive simplified transitions and animations.

---

# 27. Design Token Philosophy

Implementation should expose these values as reusable design tokens rather than hard-coding random values throughout the application.

Example conceptual structure:

```text
colors
typography
spacing
radius
border
shadow
elevation
breakpoints
```

Components should reference tokens.

Do not create one-off values unless there is a documented reason.

---

# 28. Component Consistency Rule

If two components perform the same function, they should visually behave the same.

For example:

All primary buttons should share:

- color
- typography
- radius
- height
- hover behavior
- focus behavior
- loading behavior

Individual pages should not redefine these values.

---

# 29. Visual Density

Lumo should generally prefer:

> **Low to medium visual density.**

The learning environment requires space for:

- reading
- watching
- thinking
- interacting
- visualizing concepts

Avoid dense dashboards where every pixel contains information.

---

# 30. The Hero Principle

Hero sections should not attempt to demonstrate every feature simultaneously.

The hero should communicate:

1. What Lumo is.
2. Why it is different.
3. What the user can do next.

The product demonstration should be visually impressive but compositionally clear.

Negative space is encouraged.

---

# 31. Learning Interface Principle

Inside actual learning experiences:

> **The concept is the hero.**

The AI tutor supports the lesson.

The visual explanation supports the concept.

Controls should remain accessible without competing with the teaching content.

---

# 32. Visual Effects

Allowed:

- subtle gradients
- soft glows
- gentle blur
- atmospheric backgrounds
- tasteful floating elements
- restrained depth

Avoid:

- excessive glassmorphism
- neon borders
- constant glowing objects
- heavy particle systems
- decorative 3D objects without purpose
- visual effects competing with lesson content

---

# 33. What Lumo Should NOT Look Like

Avoid the visual language of generic AI products:

```text
Purple/indigo gradients
Glowing AI blobs
Neon outlines
Glassmorphism everywhere
Dark cyberpunk dashboards
Robot imagery
Floating brains
Excessive sparkle icons
AI-generated abstract backgrounds
```

Lumo should communicate intelligence through:

```text
Clear hierarchy
Beautiful teaching visuals
Adaptive interactions
Thoughtful feedback
Natural conversation
Purposeful motion
Subject-aware visualization
```

---

# 34. Design System North Star

When making a visual decision, prioritize in this order:

```text
1. Learning clarity
2. Usability
3. Visual hierarchy
4. Brand identity
5. Delight
6. Decoration
```

Never reverse this order.

---

# 35. Final Design Rule

Lumo should feel:

> **Beautiful without being distracting.**

> **Colorful without being chaotic.**

> **Friendly without being childish.**

> **Premium without being sterile.**

> **Futuristic without looking like generic AI.**

> **Cinematic without sacrificing learning clarity.**

And above everything:

> **Lumo is a learning environment, not a dashboard.**
