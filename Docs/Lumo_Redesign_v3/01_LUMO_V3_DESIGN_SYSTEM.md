# Lumo V3 — Design System

> **Status:** Foundation / Source of Truth
> **Version:** 3.0
> **Scope:** Lumo product-wide visual language, beginning with Live AI Tutor
> **Primary Goal:** Establish a premium, restrained, modern product identity that feels intentionally designed rather than assembled from generic AI SaaS patterns.

---

# 1. Design Philosophy

Lumo V3 is not a visual reskin of Lumo V2.

The redesign establishes a new product philosophy:

> **Lumo is a learning environment with an intelligent tutor — not an AI dashboard with educational content.**

The interface should feel:

- Premium
- Calm
- Intelligent
- Focused
- Modern
- Human
- Confident
- Minimal
- Spatially generous
- Purposeful

It should NOT feel:

- AI-generated
- Template-driven
- Over-designed
- Neon
- Futuristic for the sake of being futuristic
- Glassmorphic
- Dashboard-heavy
- Card-heavy
- Gradient-heavy
- "AI SaaS landing page"
- Gamified without purpose

The design should communicate quality through:

1. Typography
2. Spacing
3. Hierarchy
4. Composition
5. Interaction
6. Motion
7. Restraint

Not through visual effects.

---

# 2. North Star

Every visual decision should answer:

> **Does this make Lumo easier, calmer, clearer, or more delightful to use?**

If a visual element exists primarily to make the interface look "AI", it should probably be removed.

If a visual element exists to communicate state, hierarchy, interaction, or meaning, it can stay.

---

# 3. Core Visual Principles

## 3.1 Content First

The learning content is the hero.

The interface must never visually overpower:

- lesson explanations
- diagrams
- formulas
- examples
- visual scenes
- tutor speech
- student interaction

The UI is the environment around the lesson.

It should not compete with the lesson.

---

## 3.2 Negative Space Is Intentional

Lumo should use generous empty space.

Empty space is not a sign that content is missing.

It is used to:

- establish hierarchy
- reduce cognitive load
- isolate important information
- make interactions feel premium
- create visual calm

Do not fill empty areas simply because they exist.

---

## 3.3 Remove Before Adding

When a screen feels empty, the first instinct must NOT be:

> Add another card.

Instead ask:

- Does the screen actually need more information?
- Is existing content properly positioned?
- Can typography carry more hierarchy?
- Can spacing be improved?
- Can the interaction become contextual?

Lumo V3 should generally prefer subtraction over decoration.

---

## 3.4 One Product, One Visual Language

Ask Lumo, Transcript, Session Timeline, Settings, Voice Selection and the Learning Canvas must all feel like parts of the same product.

They must not look like independently designed components.

Shared visual DNA includes:

- color tokens
- typography
- spacing
- borders
- radius
- shadows
- motion
- interaction states
- surface hierarchy

---

# 4. Color System

## 4.1 Color Philosophy

Lumo V3 uses a restrained neutral-first palette.

Primary visual colors:

- Charcoal
- Warm white
- Neutral grey
- Lumo Amber

Semantic colors are reserved for actual system states.

Avoid decorative cyan, purple, green, blue and rainbow gradients.

---

# 5. Dark Theme

Dark mode is the primary premium expression of Lumo.

It must NOT use pure black everywhere.

The interface should use a layered charcoal system.

## 5.1 Dark Tokens

```text
--lumo-dark-bg:              #0D0D0D
--lumo-dark-surface:         #121212
--lumo-dark-surface-2:       #171717
--lumo-dark-surface-3:       #1C1C1C

--lumo-dark-border:          rgba(255,255,255,0.08)
--lumo-dark-border-strong:   rgba(255,255,255,0.12)

--lumo-dark-text:            #F5F5F2
--lumo-dark-text-secondary:  #A7A7A2
--lumo-dark-text-muted:      #6F6F6B
--lumo-dark-text-disabled:   #4B4B48
```

````

These values are starting tokens, not immutable pixel requirements.

The visual goal is:

> charcoal surfaces with extremely subtle tonal separation.

---

# 6. Light Theme

Light mode should not simply invert dark mode.

It should feel intentionally designed.

Avoid:

- pure white everywhere
- cold blue-grey backgrounds
- excessive shadows
- high-contrast borders

## 6.1 Light Tokens

```text
--lumo-light-bg:              #F7F7F4
--lumo-light-surface:         #FFFFFF
--lumo-light-surface-2:       #F2F2EF
--lumo-light-surface-3:       #EBEBE7

--lumo-light-border:          rgba(0,0,0,0.08)
--lumo-light-border-strong:   rgba(0,0,0,0.12)

--lumo-light-text:            #171715
--lumo-light-text-secondary:  #686864
--lumo-light-text-muted:      #94948F
--lumo-light-text-disabled:   #B5B5B0
```

The light theme should feel:

> warm, clean, editorial and calm.

---

# 7. Lumo Accent

Lumo's primary brand accent is **amber/gold**.

It is the signature accent and should be used sparingly.

The accent communicates:

- Lumo identity
- primary actions
- selected states
- important highlights
- progress
- meaningful interaction

It should NOT be sprayed across the interface.

## 7.1 Accent Tokens

```text
--lumo-accent:              #D99A3D
--lumo-accent-bright:       #E8AA4C
--lumo-accent-soft:         rgba(217,154,61,0.12)
--lumo-accent-border:       rgba(217,154,61,0.30)
```

Accent usage should generally follow:

```text
Primary action       → accent
Selected item        → accent
Brand identity       → accent
Progress             → accent
Important state      → accent

Decorative element   → avoid
Large background     → avoid
Glow everywhere      → avoid
Every button         → avoid
```

---

# 8. Semantic Colors

Semantic colors exist to communicate actual system state.

They must not become decorative colors.

## Success

```text
--lumo-success: #4FA978
```

Use for:

- successful completion
- connected state
- active microphone state when appropriate
- successful actions

## Warning

```text
--lumo-warning: #D7A94B
```

Use for:

- warnings
- attention-required states

## Error

```text
--lumo-error: #D96C63
```

Use for:

- errors
- failed requests
- microphone failures
- unavailable services

## Info

```text
--lumo-info: #7897B8
```

Use sparingly.

Blue should NOT become part of the default Lumo visual identity.

---

# 9. No Decorative Neon

The following patterns are explicitly discouraged:

```text
cyan glow
purple glow
green neon rings
rainbow gradients
blue AI aura
large gradient blobs
holographic backgrounds
glowing borders
```

If glow is used, it must communicate something meaningful.

For example:

> subtle microphone activity

is acceptable.

> glowing every card

is not.

---

# 10. Typography

Typography is one of the primary mechanisms through which Lumo communicates quality.

The interface should rely on typography rather than decorative UI.

## 10.1 Typography Characteristics

Preferred characteristics:

- clean
- modern
- highly legible
- slightly warm
- strong large-scale hierarchy
- restrained weights

Avoid:

- excessive uppercase text
- tiny text everywhere
- excessive boldness
- decorative fonts
- excessive letter spacing

---

# 11. Type Scale

Starting scale:

```text
Display:
48–64px

Page Heading:
32–40px

Section Heading:
24–30px

Large Body:
18–20px

Body:
15–17px

Small:
13–14px

Micro:
11–12px
```

Exact values may adapt to context.

The learning canvas should generally use larger typography than application chrome.

---

# 12. Font Weight

Recommended:

```text
Regular:       400
Medium:        500
Semibold:      600
Bold:          700
```

Avoid using 700 everywhere.

Large headings should feel confident without appearing heavy.

---

# 13. Text Hierarchy

A typical hierarchy:

```text
Primary content
    ↓
Supporting content
    ↓
Interaction
    ↓
Metadata
```

The navigation should almost always be visually quieter than the lesson.

For example:

```text
Laws of Motion                  ← dominant

Introduction to Newton's Laws   ← supporting

Concept 1 of 5                  ← metadata
```

Not:

```text
Concept 1 of 5
INTRODUCTION...
Laws of Motion
```

where every element competes.

---

# 14. Uppercase Usage

Uppercase text should be rare.

Avoid large pill badges containing entire lesson titles.

Preferred:

```text
Physics

Laws of Motion
```

instead of:

```text
[ INTRODUCTION TO LAWS OF MOTION ]
```

Uppercase can still be used for tiny metadata labels when appropriate.

---

# 15. Spacing System

Lumo uses a consistent spacing scale.

Base unit:

```text
4px
```

Preferred spacing:

```text
4
8
12
16
20
24
32
40
48
64
80
96
128
```

Large spaces should be used intentionally.

---

# 16. Layout Philosophy

The interface should breathe.

Avoid:

```text
card
card
card
card
button
button
button
```

Instead use hierarchy through:

```text
position
spacing
typography
alignment
subtle surfaces
```

The screen should feel composed rather than populated.

---

# 17. Containers

Containers should be used only when they provide meaningful grouping.

A container should communicate:

> These things belong together.

It should not merely communicate:

> This is a component.

---

# 18. Border Radius

Lumo V3 moves away from excessive rounded-pill styling.

Recommended radius tokens:

```text
--radius-xs:       6px
--radius-sm:       8px
--radius-md:       12px
--radius-lg:       16px
--radius-xl:       20px
--radius-pill:     999px
```

Use pills only when semantically appropriate:

- tags
- compact status indicators
- compact controls
- segmented choices

Do NOT turn every button, card and input into a pill.

---

# 19. Borders

Borders should be subtle.

Dark mode:

```text
rgba(255,255,255,0.06–0.10)
```

Light mode:

```text
rgba(0,0,0,0.06–0.10)
```

Avoid thick visible outlines unless they are required for accessibility or state.

---

# 20. Shadows

Shadows should provide depth, not decoration.

Dark mode should rely primarily on:

- tonal separation
- subtle borders
- elevation

rather than huge shadows.

Example:

```text
box-shadow:
0 12px 40px rgba(0,0,0,0.20);
```

Large dramatic shadows are discouraged.

---

# 21. Surfaces

Lumo V3 has a hierarchy of surfaces.

## Level 0 — Environment

The main application background.

## Level 1 — Surface

Major content regions.

## Level 2 — Elevated Surface

Floating panels and important secondary interfaces.

## Level 3 — Focus Surface

Modals or highly focused temporary interactions.

Example dark hierarchy:

```text
Background
#0D0D0D

Surface
#121212

Elevated
#171717

Focused
#1C1C1C
```

The difference between levels should be subtle.

---

# 22. Cards

Cards are allowed but must earn their existence.

A card should solve one of these problems:

- grouping
- hierarchy
- interaction
- elevation
- focus

Do not create a card for every piece of information.

The learning canvas should generally avoid looking like a collection of cards.

---

# 23. Inputs

Inputs should feel like part of the environment.

Avoid:

```text
huge rounded input
heavy border
bright background
large shadow
```

Preferred:

- subtle surface
- restrained border
- strong typography
- clear focus state
- minimal chrome

---

# 24. Buttons

Buttons should have clear hierarchy.

## Primary

Reserved for the most important action.

Example:

```text
Ask Lumo
Start
Continue
```

Primary buttons may use the Lumo accent.

## Secondary

Neutral surface/border.

Example:

```text
Explain again
Try another way
```

## Tertiary

Text/icon interaction.

Example:

```text
Close
Back
Replay
```

Never give every action primary-button styling.

---

# 25. Iconography

Icons should be:

- simple
- consistent
- thin-to-medium weight
- visually quiet

Avoid mixing:

- emoji
- random icon libraries
- 3D icons
- different stroke styles

The current graduation-cap emoji should NOT remain as the final Lumo avatar representation.

---

# 26. Navigation

Navigation is application chrome.

It should remain visually quiet.

The navigation should not compete with the lesson.

Preferred hierarchy:

```text
Lumo                    ← brand

Lesson context          ← quiet

Progress                ← quiet

Utility controls        ← quiet
```

Navigation should not feel like a website header pasted onto an application.

---

# 27. Learning Canvas

The Learning Canvas is the visual center of Lumo.

It is where the existing teaching engine will render:

- explanations
- diagrams
- formulas
- visual scenes
- examples
- educational animations
- generated lesson content

The canvas must be designed to accommodate these experiences without requiring a future structural redesign.

The canvas is NOT a card containing a lesson.

It is the lesson environment itself.

---

# 28. Tutor Presence

Lumo should have a persistent visual presence.

However:

> **Presence ≠ giant AI widget.**

The tutor should feel integrated into the learning environment.

The visual should support:

- idle
- listening
- processing
- speaking
- interrupted
- error

The final implementation may use a 3D character/avatar.

The design system must therefore reserve space and interaction architecture for a future expressive avatar.

---

# 29. Avatar Philosophy

The avatar should feel like a character, not a generic AI visual.

Avoid:

```text
floating holographic head
neon human
glowing orb
generic robot
emoji
AI brain
```

Preferred characteristics:

- recognizable
- expressive
- premium
- consistent
- approachable
- educational
- visually restrained

The avatar should eventually support:

- lip sync
- facial expressions
- speaking animation
- listening behavior
- idle movement
- contextual reactions
- potentially gestures

The avatar's animation must communicate state rather than exist purely as decoration.

---

# 30. Tutor State Visual Language

## IDLE

Very subtle movement.

The interface should feel calm.

## LISTENING

The visual becomes slightly more active.

Possible signals:

- subtle breathing
- gentle expansion
- minimal waveform
- restrained accent state

## THINKING

Use minimal activity.

Do NOT use:

- spinning loaders everywhere
- flashing effects
- excessive particle effects

## SPEAKING

The avatar becomes the visual focus.

Future implementation:

- lip sync
- facial expression
- subtle head movement
- speech-reactive motion

## INTERRUPTED

Transition immediately from speaking to listening.

The interaction should feel natural.

## ERROR

Use semantic error color sparingly.

Explain the issue clearly.

---

# 31. Motion Principles

Motion is part of the Lumo product language.

It should feel:

- smooth
- intentional
- physical
- restrained

Not:

- flashy
- bouncy
- chaotic
- game-like

---

# 32. Motion Timing

Suggested ranges:

```text
Micro interaction:     100–180ms
Small transition:      180–250ms
Panel transition:      250–350ms
Major transition:      350–500ms
```

Large cinematic transitions may exceed these when justified by the learning experience.

---

# 33. Easing

Prefer natural easing.

Examples:

```text
ease-out
cubic-bezier(0.22, 1, 0.36, 1)
```

Avoid excessive:

```text
bounce
elastic
springy
overshoot
```

unless a specific interaction benefits from it.

---

# 34. Secondary Surface Motion

Secondary surfaces should not feel like generic drawers.

When opening:

- subtle fade
- subtle translation
- controlled elevation

When closing:

- quick
- predictable
- unobtrusive

The transition should communicate:

> "This is another layer of Lumo."

not:

> "A website sidebar just slid onto the screen."

---

# 35. Ask Lumo Surface

Ask Lumo is a focused doubt-solving experience.

It should initially appear as a compact floating surface.

It may expand into a larger workspace.

It must use the same design language as the main Live Tutor.

Required visual capabilities:

- question input
- model selection
- loading state
- response state
- error state
- expand/collapse
- close
- conversation context

Supported model identities:

```text
Lumo Fast
Lumo Light
Lumo Pro
```

Model selection must be treated as a real product capability, not merely a visual selector.

---

# 36. Session Timeline

The existing Notes functionality represents session history and replay points.

The visual language should therefore emphasize:

- time
- events
- concepts
- replay points
- important moments

The timeline should feel like a learning history rather than a generic notes sidebar.

Potential terminology:

```text
Session
Timeline
Replay
Moments
```

Final naming is defined in the product architecture document.

---

# 37. Transcript / Conversation

The existing "More" functionality represents the live conversation between student and Lumo.

The experience should feel closer to a focused conversation surface than a generic sidebar.

It should support:

- student messages
- Lumo responses
- timestamps
- contextual lesson relationship
- potential replay/navigation
- scrolling
- search or filtering later if required

The transcript should visually inherit the same typography and surfaces as the rest of Lumo.

---

# 38. Settings

Settings should become a structured preferences experience.

Primary controls:

```text
Language
Voice
Narration speed
Subtitles
Theme
```

Initial language scope:

```text
English
Hinglish
Hindi
```

Voice selection should support:

- voice cards/rows
- voice description
- preview button
- active selection
- sample playback

The voice experience should be inspired by high-quality voice products, not generic dropdown forms.

---

# 39. Light/Dark Theme Architecture

Light and dark modes must share the same design tokens.

The following should NOT change between themes:

- layout
- spacing
- hierarchy
- component structure
- interaction model
- motion

Only the visual surface tokens should change.

This ensures:

> Lumo remains the same product regardless of theme.

---

# 40. Responsive Philosophy

Lumo is a product environment, not merely a responsive website.

The layout must preserve:

1. Learning content
2. Tutor interaction
3. Navigation
4. Essential controls

Secondary functionality can collapse or become modal/floating.

At smaller widths:

- secondary surfaces may become full-screen
- controls may collapse
- transcript/timeline may become focused views
- tutor presence must remain accessible
- learning content remains primary

Do not simply shrink the desktop interface.

---

# 41. Accessibility

Premium design must remain accessible.

Requirements:

- sufficient text contrast
- visible keyboard focus
- readable typography
- touch targets large enough for interaction
- semantic buttons
- meaningful labels
- reduced-motion support
- subtitles/captions
- clear error states

Visual minimalism must never sacrifice usability.

---

# 42. Component Density

Default density should be:

> **Low to medium.**

Avoid:

- tightly packed dashboards
- excessive controls
- permanent utility bars
- dense metadata

The user should feel that Lumo gives them room to think.

---

# 43. Contextual UI

One of the core V3 principles:

> **Contextual UI > Permanent UI**

If an action is only useful at certain moments, it should appear at those moments.

For example:

`Explain again`

does not need to permanently occupy the bottom toolbar.

It can become available after Lumo explains something.

Similarly:

`Replay`

can appear when a timeline event is selected.

This reduces visual noise.

---

# 44. Persistent vs Contextual Controls

## Persistent

Keep only controls that are frequently needed:

- primary tutor interaction
- essential navigation
- settings
- lesson progress

## Contextual

Potentially:

- Explain again
- Try another way
- Replay
- Ask follow-up
- Transcript controls
- Scene controls

---

# 45. Anti-Patterns

The following are explicitly prohibited unless there is a strong functional reason.

## Visual

- excessive gradients
- neon glows
- glassmorphism
- rainbow accents
- blue AI glow
- excessive shadows
- excessive rounded cards
- excessive pills
- emoji as primary UI
- decorative particle effects

## Layout

- permanent giant bottom toolbar
- nested card systems
- excessive sidebars
- multiple competing focal points
- dense utility navigation

## Interaction

- dropdown for every setting
- permanent controls for contextual actions
- unnecessary confirmation modals
- animations without meaning

---

# 46. Design Hierarchy

Every screen should establish:

```text
1. What am I learning?
        ↓
2. What is Lumo doing?
        ↓
3. What can I do right now?
        ↓
4. What additional information can I access?
```

The user should never need to visually parse the entire interface to understand the current task.

---

# 47. Premium Product Test

Before accepting a screen, ask:

### Test 1 — Remove 20%

Can 20% of the visible UI disappear without hurting functionality?

If yes, remove it.

### Test 2 — Squint Test

If the interface is blurred, can you still identify the primary focus?

If not, hierarchy is weak.

### Test 3 — Color Test

If all accent colors disappear, does the interface still look good?

If not, it relies too heavily on decoration.

### Test 4 — Border Test

If most borders disappear, does the layout still make sense?

If not, spacing/hierarchy needs work.

### Test 5 — Screenshot Test

Would the interface look like a serious product in a static screenshot?

It should.

### Test 6 — Interaction Test

Does the interface become more useful when the user interacts with it?

It should not merely become more animated.

---

# 48. Lumo V3 Visual Identity Summary

```text
CHARCOAL
     +
WARM WHITE
     +
MUTED GREYS
     +
LUMO AMBER
     +
GENEROUS SPACE
     +
STRONG TYPOGRAPHY
     +
SUBTLE SURFACES
     +
PURPOSEFUL MOTION
     +
INTELLIGENT INTERACTION
```

This is the visual DNA.

---

# 49. What Lumo V3 Should Feel Like

The target is not:

> "A futuristic AI education platform."

The target is:

> **A beautifully designed learning product that happens to contain extremely advanced AI.**

The AI should be evident through what Lumo does.

The interface should be confident enough not to constantly advertise it.

---

# 50. Final Design Rule

When in doubt:

> **Remove the decoration. Increase the space. Strengthen the hierarchy. Let the product behavior create the magic.**

Lumo V3 should feel like a product designed by a team that knows exactly what belongs on the screen — and, equally importantly, what does not.

```

### One important thing

I deliberately **didn't put the exact final avatar design, exact Live Tutor layout, or exact Ask Lumo/Timeline/Settings layouts into this document**.

That's intentional.

This doc is the **constitution** — colors, typography, spacing, surfaces, motion, principles, anti-patterns.

`02` will define **what the product actually is and how all these pieces relate**, and `03` can then get much more concrete about the actual screen.

That separation will save us from the exact problem we're trying to escape: having one giant prompt where the AI starts inventing UI decisions halfway through implementation.
```
````
