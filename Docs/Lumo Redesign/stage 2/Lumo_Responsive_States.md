# Lumo Responsive States

**Document:** `LUMO_RESPONSIVE_STATES.md`  
**Stage:** 2 — Product & Experience Architecture  
**Status:** Final  
**Purpose:** Define how Lumo adapts its interface, Learning Theater, interactions, visuals, AI tutor, and controls across screen sizes and device capabilities.

---

# 1. Purpose

Lumo is a learning environment, not a dashboard.

Responsive behavior must therefore preserve the **learning experience**, not merely shrink desktop components until they fit smaller screens.

The responsive system must maintain:

- clarity
- hierarchy
- focus
- accessibility
- interaction quality
- visual continuity
- tutor visibility
- lesson comprehension
- responsive AI controls
- usable assessment interactions

The interface should feel intentionally designed for each viewport.

It must never feel like:

> "The desktop website, but compressed."

---

# 2. Core Responsive Philosophy

Lumo follows this principle:

> **Content adapts to the screen. Learning hierarchy does not.**

Regardless of viewport size, the student should always understand:

1. What am I learning?
2. What is happening right now?
3. What should I look at?
4. What can I interact with?
5. What should I do next?

Responsive changes may alter:

- layout
- density
- navigation
- panel placement
- tutor size
- control visibility
- information density
- interaction patterns

But they must not compromise the learning sequence.

---

# 3. Supported Device Classes

Lumo should primarily support four responsive states:

| State         | Approximate Width | Primary Use             |
| ------------- | ----------------: | ----------------------- |
| Mobile        |         `< 640px` | Phones                  |
| Tablet        |  `640px – 1023px` | Tablets / small laptops |
| Desktop       | `1024px – 1439px` | Standard desktop        |
| Large Desktop |        `≥ 1440px` | Large monitors          |

These are behavioral categories rather than rigid visual rules.

Components may introduce additional breakpoints where necessary.

---

# 4. Responsive Priority

When space becomes constrained, Lumo must prioritize elements in this order:

### Priority 1 — Learning content

The active lesson, explanation, diagram, simulation, question, or assessment.

### Priority 2 — Primary interaction

The action currently required from the student.

Examples:

- answer a question
- continue the lesson
- speak to Lumo
- interact with a simulation
- submit an answer

### Priority 3 — Tutor presence

The AI tutor should remain available, but its visual footprint may shrink.

### Priority 4 — Context

Lesson progress, topic name, current concept, and relevant status.

### Priority 5 — Secondary controls

Examples:

- settings
- playback controls
- visual preferences
- secondary navigation

### Priority 6 — Decorative elements

Decorative visuals should be removed before learning content is compromised.

---

# 5. Breakpoint Philosophy

Do not design components around arbitrary device names.

Instead design around:

> **When does the current layout stop being comfortable?**

Breakpoints should be introduced when:

- text becomes difficult to read
- controls become crowded
- the tutor overlaps the learning visual
- diagrams lose readability
- assessment options become cramped
- navigation becomes ambiguous
- interactive controls become difficult to operate

The exact breakpoint should follow the component's content requirements.

---

# 6. Mobile State

## Width

`< 640px`

Mobile Lumo should feel like a focused learning environment.

The interface should not attempt to preserve the full desktop layout.

---

# 7. Mobile Navigation

Desktop sidebar navigation becomes a compact mobile navigation pattern.

Recommended structure:

```text
┌─────────────────────────────┐
│ Lumo                 ☰      │
├─────────────────────────────┤
│                             │
│       Learning content      │
│                             │
└─────────────────────────────┘
```

````

Navigation may open as:

- bottom sheet
- full-screen sheet
- compact drawer

The primary learning surface must remain unobstructed when navigation is closed.

---

# 8. Mobile Dashboard

The dashboard becomes a vertical learning feed.

Recommended order:

```text
Good morning.

What would you like to learn?

[ Continue Learning ]

Your progress

[ Subject mastery ]

Recommended for you

[ Lesson ]
[ Lesson ]
[ Lesson ]
```

Avoid:

- multi-column analytics grids
- excessive statistics
- dense tables
- unnecessary charts

The mobile dashboard should answer:

> **"What should I learn next?"**

---

# 9. Mobile Learning Theater

The Learning Theater requires special treatment.

Desktop:

```text
┌───────────────────────────────────────┐
│ Lesson header                         │
├───────────────────────────────────────┤
│                                       │
│           Visual Stage                │
│                                       │
│                           Tutor       │
│                                       │
├───────────────────────────────────────┤
│ Timeline / progress                   │
├───────────────────────────────────────┤
│ Voice / interaction                   │
└───────────────────────────────────────┘
```

Mobile:

```text
┌─────────────────────────────┐
│ ← Physics            ⋮      │
├─────────────────────────────┤
│                             │
│       VISUAL STAGE          │
│                             │
│                             │
│                    Tutor    │
│                             │
├─────────────────────────────┤
│ Concept 3 / 7               │
├─────────────────────────────┤
│                             │
│ 🎙 Talk to Lumo             │
│                             │
└─────────────────────────────┘
```

The visual stage remains the dominant element.

---

# 10. Mobile AI Tutor

The tutor must become visually smaller on mobile.

The tutor should never cover important educational content.

Possible mobile representation:

- small floating tutor window
- bottom-corner tutor
- compact portrait bubble
- collapsible tutor panel

The tutor may expand temporarily when:

- introducing a lesson
- providing feedback
- responding directly to the student

Afterward it should return to its compact state.

---

# 11. Mobile Tutor Position

Default:

```text
bottom-right
```

However, the system must dynamically avoid:

- formulas
- diagrams
- interactive controls
- answer options
- important labels

The visual intelligence layer may provide a preferred safe region.

The tutor must never obscure the focal learning object.

---

# 12. Mobile Voice Interaction

Voice interaction becomes a primary interaction method.

Recommended:

```text
┌─────────────────────────────┐
│                             │
│      Lesson visual          │
│                             │
│                             │
├─────────────────────────────┤
│  ● Listening                │
│                             │
│       🎙                    │
│   Hold / Tap to speak       │
└─────────────────────────────┘
```

The voice control must be:

- large enough to tap comfortably
- visually obvious
- reachable with one hand
- accessible

---

# 13. Mobile Barge-In

Barge-in must remain extremely easy.

The student should be able to interrupt the tutor through:

- starting speech
- tapping Stop
- cancelling playback

When interruption occurs:

1. TTS stops.
2. Current turn becomes invalid.
3. Visual beat progression stops.
4. Caption timers stop.
5. Tutor state changes to `INTERRUPTED`.
6. The new student interaction becomes authoritative.

No stale content may continue playing.

---

# 14. Mobile Interactive Questions

When the tutor asks a question, the Learning Theater transforms into the interaction surface.

Do not simply append the question below the video.

The visual stage itself should become the question environment.

Example:

```text
┌─────────────────────────────┐
│                             │
│      VISUAL QUESTION        │
│                             │
│   What happens to current   │
│   if resistance increases?  │
│                             │
│   ○ Increases               │
│   ○ Decreases               │
│   ○ Stays same              │
│                             │
└─────────────────────────────┘
```

The transition should feel like:

> **The lesson changed mode.**

Not:

> **A form appeared underneath the video.**

---

# 15. Mobile Assessment

Assessment questions should use a single-column layout.

Example:

```text
Question 3 of 10

What is the acceleration?

[ Option A ]

[ Option B ]

[ Option C ]

[ Option D ]

        Submit
```

Avoid:

- two-column answers
- tiny controls
- dense question metadata
- unnecessary configuration

The student should focus on the question.

---

# 16. Mobile Long Answers

Long-answer responses should use:

- full-width text area
- comfortable line height
- sufficient vertical space
- sticky or easily accessible submit action

The interface must not make typing feel cramped.

---

# 17. Mobile Numerical / Handwritten Questions

For image-based numerical assessment:

```text
┌─────────────────────────────┐
│ Solve on paper              │
│                             │
│        QUESTION             │
│                             │
│        [diagram]            │
│                             │
├─────────────────────────────┤
│                             │
│     Upload / Capture        │
│                             │
└─────────────────────────────┘
```

The student must clearly understand:

> Solve physically → capture/upload → Lumo evaluates.

---

# 18. Mobile Doubt Solver

The dedicated LumoAI / doubt solver should open as a focused full-height interface or bottom sheet.

It should not permanently consume Learning Theater space.

Example:

```text
┌─────────────────────────────┐
│ ← LumoAI                    │
├─────────────────────────────┤
│                             │
│ Ask anything about this     │
│ lesson.                     │
│                             │
│                             │
├─────────────────────────────┤
│ Model: Lumo Fast ▾          │
│                             │
│ [ Ask Lumo...          🎙 ] │
└─────────────────────────────┘
```

---

# 19. Tablet State

## Width

`640px – 1023px`

Tablet should act as a hybrid state.

The system should retain more desktop structure than mobile but avoid desktop density.

---

# 20. Tablet Navigation

A collapsible sidebar is preferred.

Expanded:

```text
┌──────────────┬─────────────────────────────┐
│              │                             │
│ Navigation   │        Content              │
│              │                             │
└──────────────┴─────────────────────────────┘
```

Collapsed:

```text
┌─────┬──────────────────────────────────────┐
│  ≡  │             Content                  │
└─────┴──────────────────────────────────────┘
```

The student should be able to switch between states.

---

# 21. Tablet Learning Theater

Tablet should preserve the Learning Theater concept.

Recommended:

```text
┌────────────────────────────────────┐
│ Lesson header                      │
├────────────────────────────────────┤
│                                    │
│          Visual Stage              │
│                           Tutor    │
│                                    │
├────────────────────────────────────┤
│ Timeline                           │
├────────────────────────────────────┤
│ Interaction                        │
└────────────────────────────────────┘
```

The tutor may occupy slightly more space than on mobile.

---

# 22. Tablet Assessment

Tablet can use:

- larger answer cards
- two-column options when comfortable
- expanded question visual
- side-by-side question and reference material where useful

However, readability takes priority over density.

---

# 23. Desktop State

## Width

`1024px – 1439px`

Desktop is the primary full-featured Lumo experience.

It should support:

- persistent navigation
- Learning Theater
- tutor panel
- visual stage
- lesson timeline
- interaction controls
- contextual tools

---

# 24. Desktop Layout

Recommended structure:

```text
┌──────────────┬────────────────────────────────────┐
│              │ Lesson Header                      │
│              ├────────────────────────────────────┤
│ Navigation   │                                    │
│              │            Visual Stage             │
│              │                                    │
│              │                         Tutor      │
│              ├────────────────────────────────────┤
│              │ Lesson progression                 │
│              ├────────────────────────────────────┤
│              │ Interaction / Voice                │
└──────────────┴────────────────────────────────────┘
```

The visual stage remains the dominant area.

---

# 25. Large Desktop State

## Width

`≥ 1440px`

Large screens should provide additional breathing room rather than simply making everything larger.

Use additional space for:

- wider lesson stage
- contextual information
- tutor panel
- optional lesson context
- secondary controls

Do not stretch text lines indefinitely.

---

# 26. Large Desktop Maximum Width

Learning content should use sensible maximum widths.

Example conceptual structure:

```text
┌────────────────────────────────────────────────────────┐
│                                                        │
│       ┌────────────────────────────────────────┐       │
│       │                                        │       │
│       │           Learning Stage               │       │
│       │                                        │       │
│       └────────────────────────────────────────┘       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

Large monitors should feel spacious, not empty.

---

# 27. Responsive Tutor Scaling

Tutor size should scale independently from the viewport.

Suggested conceptual sizes:

### Mobile

Compact:

`64–110px`

### Tablet

Compact/medium:

`100–160px`

### Desktop

Medium:

`140–220px`

### Large Desktop

Medium/large:

`160–240px`

These are starting ranges, not rigid requirements.

The tutor should never dominate the lesson.

---

# 28. Responsive Visual Stage

The visual stage is the most important responsive component.

The system must preserve:

- aspect ratio
- visual hierarchy
- diagram readability
- focal subject
- captions where enabled
- interactive controls

When space is reduced:

1. Remove decorative content.
2. Simplify secondary labels.
3. Reduce tutor footprint.
4. Reduce peripheral controls.
5. Preserve the primary visualization.

Never sacrifice the primary concept visualization first.

---

# 29. Responsive Visual Intelligence

VisualStrategyEngine should be aware of viewport constraints.

For example:

Desktop:

```text
        FORCE →

   [ OBJECT ]
```

Mobile:

```text
   FORCE →

 [OBJECT]
```

If the visual becomes too dense, the rendering strategy should adapt.

Potential adaptations:

- larger focal object
- fewer labels
- simplified background
- reduced secondary objects
- alternate camera framing
- shorter text labels

The goal is:

> **Same concept, different composition.**

---

# 30. Responsive 3D Visuals

3D scenes must adapt to device capability.

### High capability

Enable:

- richer lighting
- higher model detail
- more particles
- complex environments

### Medium capability

Reduce:

- shadows
- particle count
- environmental detail
- model complexity

### Low capability

Use:

- simplified 3D
- 2D fallback
- static diagram
- CSS/SVG visualization

Learning content must remain available even when advanced rendering is not.

---

# 31. Device Capability vs Viewport

Responsive behavior should not depend exclusively on screen width.

Lumo should consider:

- viewport size
- device pixel ratio
- CPU/GPU capability
- memory availability
- reduced-motion preference
- network conditions
- browser support

A powerful tablet may support richer visuals than a low-end desktop.

---

# 32. Adaptive Rendering Levels

Recommended rendering tiers:

### Level A — Cinematic

For capable devices.

Includes:

- advanced 3D
- richer environments
- higher-quality animation
- complex simulations

### Level B — Standard

Default.

Includes:

- 2D/3D visuals
- normal animation
- moderate effects

### Level C — Lightweight

For constrained devices.

Includes:

- simplified 2D diagrams
- reduced animation
- lightweight assets
- minimal effects

### Level D — Accessible / Reduced Motion

For users who prefer reduced motion.

Includes:

- static transitions
- minimal movement
- clear state changes
- preserved interaction

---

# 33. Responsive Navigation Rules

Navigation should follow:

> **Navigation supports learning; it must not compete with it.**

Desktop:

- persistent sidebar

Tablet:

- collapsible sidebar

Mobile:

- hidden by default
- drawer / sheet when requested

During an active Learning Theater session, navigation should become visually secondary.

---

# 34. Responsive Header

Desktop header may contain:

```text
← Physics
Newton's Laws
Lesson 3 / 7
12 min
```

Mobile should simplify:

```text
← Physics
Lesson 3 / 7
```

Secondary information may move into an overflow menu.

---

# 35. Responsive Lesson Timeline

Desktop:

```text
Introduction ─ Force ─ Mass ─ Acceleration ─ Quiz
     ✓           ✓        ●          ○
```

Mobile:

```text
Lesson 3 / 7
━━━━━━●━━━━━━
```

The full timeline can be exposed when tapped.

The student should always understand progress without requiring a large timeline.

---

# 36. Responsive Controls

Controls should follow:

> **Primary action visible. Secondary actions discoverable.**

Desktop may show:

```text
↻ Again   💡 Differently   ✋ Stop   ⚙
```

Mobile may show:

```text
      ✋ Stop

      ⋮
```

Secondary actions can live inside an overflow menu.

---

# 37. Responsive Doubt Solver

The doubt solver should behave differently by viewport.

### Desktop

Use a side panel or focused modal.

### Tablet

Use a side panel or large sheet.

### Mobile

Use a full-height sheet / dedicated view.

The lesson state must remain preserved underneath.

Closing the doubt solver must return the student to exactly where they were.

---

# 38. Responsive Model Selector

When the student selects:

- Lumo Fast
- Lumo Light
- Lumo Pro

the model selector should remain simple.

Desktop:

```text
Model
[ Lumo Fast ▾ ]
```

Mobile:

```text
Lumo Fast ▾
```

Detailed model descriptions should appear only when requested.

Do not expose technical provider names by default.

Students should interact with:

> **Lumo Fast / Lumo Light / Lumo Pro**

rather than:

> Gemini / Groq / provider X.

Provider implementation remains an internal architectural concern.

---

# 39. Responsive AI State Indicators

AI states must remain recognizable at every viewport.

Core states:

- Listening
- Thinking
- Speaking
- Interrupted
- Replaying
- Assessment
- Error

Mobile may use compact labels:

```text
● Listening
```

Desktop may use:

```text
🎙 Listening...
```

The state must never depend solely on color.

---

# 40. Responsive Loading States

Loading should preserve the layout of the content that is coming.

Avoid full-screen spinners whenever possible.

Prefer:

- skeleton visual stage
- contextual loading message
- animated tutor state
- progressive rendering

Example:

```text
Preparing your lesson...

Building the visual explanation
```

The student should understand what Lumo is doing.

---

# 41. Responsive Cards

Cards should change density rather than simply scale.

Desktop:

```text
┌─────────────────────────┐
│ Resistance              │
│ Learn how resistance    │
│ affects current        │
│                         │
│ 12 min          →       │
└─────────────────────────┘
```

Mobile:

```text
┌─────────────────────────┐
│ Resistance              │
│ 12 min                  │
│                         │
│ Continue →              │
└─────────────────────────┘
```

---

# 42. Responsive Forms

Forms should become progressively simpler.

Desktop may support:

```text
Topic | Source | Mode | Difficulty
```

Mobile should become:

```text
Topic
↓
Source
↓
Practice mode
↓
Difficulty
↓
Start
```

Use progressive disclosure.

Do not compress a large desktop form into a tiny mobile grid.

---

# 43. Responsive Modals

Desktop:

- centered modal

Tablet:

- large centered modal

Mobile:

- bottom sheet or full-height sheet

The mobile pattern should provide comfortable touch targets and scrolling.

---

# 44. Touch Targets

Interactive controls must be comfortably touchable.

Target approximately:

> **44 × 44 CSS pixels or larger**

for primary touch interactions.

Avoid tightly packed icon buttons on mobile.

This is especially important for:

- Stop
- microphone
- answer options
- submit
- navigation
- playback
- interactive visual controls

---

# 45. Responsive Typography

Typography should scale gradually.

Avoid extreme viewport-based scaling.

Suggested ranges:

### Hero

Desktop:

`56–72px`

Mobile:

`36–48px`

### Page heading

Desktop:

`32–40px`

Mobile:

`26–32px`

### Body

Desktop:

`15–17px`

Mobile:

`15–17px`

Body text should remain highly readable.

---

# 46. Responsive Spacing

Spacing should compress carefully.

Desktop:

```text
large breathing room
```

Tablet:

```text
moderate breathing room
```

Mobile:

```text
compact but comfortable
```

Do not eliminate negative space simply because the viewport is smaller.

Negative space remains important to Lumo's premium visual identity.

---

# 47. Responsive White Space

Lumo's design philosophy strongly values negative space.

Responsive behavior must preserve intentional breathing room.

However:

> Empty space should never force essential content below the fold unnecessarily.

The system should reduce decorative spacing before reducing usability.

---

# 48. Responsive Notifications and Toasts

Desktop:

- bottom-right toast

Tablet:

- bottom-right or bottom-center

Mobile:

- bottom-center
- full-width only when necessary

Toasts must not cover:

- answer controls
- microphone controls
- important visual content

---

# 49. Responsive Accessibility

All responsive states must preserve:

- keyboard navigation
- screen reader compatibility
- visible focus states
- sufficient contrast
- non-color state indicators
- touch accessibility
- reduced-motion support

Responsive design must never create a separate inaccessible mobile experience.

---

# 50. Responsive Error States

Errors should remain contextual.

Bad:

```text
ERROR 500
```

Better:

```text
Lumo couldn't generate the visual.

Your lesson is still available.

[ Try again ]
```

Mobile should preserve the same clarity.

---

# 51. Orientation Changes

Lumo should support:

- portrait
- landscape

especially for tablets.

When orientation changes during a lesson:

- preserve lesson position
- preserve current turn
- preserve visual state where possible
- preserve assessment state
- preserve tutor state

The student should not lose progress.

---

# 52. Mobile Landscape

Landscape mobile may provide a wider Learning Theater.

Use it primarily for:

- diagrams
- simulations
- visual lessons
- interactive exercises

The UI should avoid forcing portrait-only controls into landscape.

---

# 53. Responsive Session Persistence

Viewport changes must never create a new teaching session.

The following must persist:

- session ID
- active concept
- lesson progress
- turn state
- visual state
- assessment state
- memory
- replay history

Responsive rendering is a presentation concern, not a session concern.

---

# 54. Responsive State Transitions

Transitions between responsive layouts should be graceful.

Examples:

```text
Desktop → Tablet
```

may collapse the sidebar.

```text
Tablet → Mobile
```

may replace the sidebar with a drawer.

```text
Portrait → Landscape
```

may enlarge the visual stage.

The underlying learning state remains unchanged.

---

# 55. Performance Rules

Responsive optimization should prioritize the Learning Theater.

When performance is constrained:

1. Preserve lesson interaction.
2. Preserve readable visuals.
3. Preserve voice interaction.
4. Reduce visual effects.
5. Reduce asset quality.
6. Disable expensive 3D effects.
7. Fall back to lightweight visuals if necessary.

Never sacrifice core teaching functionality for visual effects.

---

# 56. Network-Aware Behavior

When network quality is poor:

- prioritize transcript delivery
- prioritize text explanation
- prioritize essential visual assets
- reduce unnecessary asset downloads
- defer high-resolution visuals
- allow progressive visual loading

The student should still be able to learn.

---

# 57. Responsive Audio Behavior

Audio controls must remain accessible.

On mobile:

- volume controls may move into settings
- playback speed remains accessible
- voice selection remains accessible through tutor settings
- Stop / interrupt remains immediately accessible

Audio playback must never block student interaction.

---

# 58. Responsive Voice Settings

Voice settings may include:

- voice
- speaking speed
- language
- pitch where supported

Desktop:

```text
Voice
Speed
Language
```

Mobile:

```text
Voice & Speech
```

opens a dedicated settings sheet.

---

# 59. Responsive Assessment Modes

Lumo supports:

- MCQ
- short answer
- long answer
- numerical
- handwritten/image-based evaluation

Each mode must have its own responsive composition.

Do not force all assessment types into the same generic card.

---

# 60. Responsive Visual Question Mode

When an assessment is triggered inside the Learning Theater:

### Desktop

The visual stage transforms into an interactive workspace.

### Tablet

The workspace expands vertically.

### Mobile

The workspace becomes the primary screen.

The interaction should feel continuous:

```text
Teaching
   ↓
Question
   ↓
Interactive visual workspace
   ↓
Answer
   ↓
Feedback
   ↓
Teaching continues
```

---

# 61. Responsive Mastery / Progress

Progress should remain meaningful at all sizes.

Desktop may show:

```text
Physics
██████████████░░ 82%

Voltage ✓
Current ✓
Resistance ◐
Circuits ○
```

Mobile:

```text
Physics

82% mastered

✓ Voltage
✓ Current
◐ Resistance
○ Circuits
```

Do not sacrifice semantic meaning for chart density.

---

# 62. Responsive Design Principle for Younger Students

For younger students:

- larger controls
- simpler navigation
- stronger visual hierarchy
- more expressive tutor
- more visual interaction

But the underlying Lumo design system remains consistent.

Do not create an entirely separate visual product.

---

# 63. Responsive Design Principle for Older Students

For older students:

- greater information density
- more technical content
- advanced diagrams
- code
- formulas
- deeper controls

Again:

> Same Lumo identity. Different information density.

---

# 64. Responsive Design Tokens

Antigravity should implement responsive tokens centrally rather than scattering arbitrary values throughout components.

Example conceptual structure:

```ts
breakpoints;
spacing;
typography;
containerWidths;
sidebarWidths;
theaterSizes;
tutorSizes;
touchTargets;
```

Components should consume these tokens.

Avoid hard-coded responsive values throughout the application.

---

# 65. CSS / Layout Philosophy

Prefer:

- CSS Grid
- Flexbox
- CSS clamp()
- container queries where useful
- fluid sizing
- intrinsic layouts
- max-width constraints

Avoid:

- excessive absolute positioning
- fixed pixel dimensions for major layouts
- viewport-specific hacks
- duplicated mobile/desktop components without necessity

---

# 66. Component Adaptation

Components should ideally adapt themselves.

Example:

```text
LearningCard
```

should remain the same semantic component while its layout changes.

Avoid creating:

```text
DesktopLearningCard
MobileLearningCard
TabletLearningCard
```

unless the interaction model genuinely differs.

---

# 67. Responsive Testing Matrix

The application should be tested at minimum across:

### Mobile

- 320px
- 375px
- 390px
- 430px

### Tablet

- 768px
- 820px
- 1024px

### Desktop

- 1280px
- 1366px
- 1440px

### Large Desktop

- 1600px
- 1920px
- 2560px

---

# 68. Responsive Testing Priorities

Test especially:

### Learning Theater

- visual readability
- tutor overlap
- controls
- interaction transformation

### Voice

- microphone
- listening state
- speaking state
- interruption

### Assessment

- MCQ
- short answer
- long answer
- numerical
- handwritten upload

### Doubt Solver

- opening
- closing
- model selection
- context preservation

### Navigation

- sidebar
- drawer
- mobile navigation

---

# 69. Never Break These Invariants

Responsive implementation must never violate:

### Learning content remains primary.

### Tutor never obscures important learning content.

### Primary interaction remains obvious.

### Barge-in remains immediately available.

### Assessment remains usable.

### Visual explanations remain readable.

### Session state remains persistent.

### Accessibility remains intact.

### No responsive state creates duplicate business logic.

### No responsive state changes AI orchestration behavior.

---

# 70. The Learning Theater Responsive Rule

The single most important responsive rule is:

> **The Learning Theater is not a video player that shrinks. It is an adaptive learning workspace.**

Desktop:

> expansive visual stage

Tablet:

> balanced visual stage

Mobile:

> focused learning stage

Question mode:

> interactive workspace

Assessment mode:

> assessment workspace

Replay mode:

> visual replay

The same underlying Theater changes composition according to the learning state.

---

# 71. Final Responsive Philosophy

Lumo should feel:

### On desktop

**Immersive.**

### On tablet

**Balanced.**

### On mobile

**Focused.**

But across all three:

> **Calm. Clear. Intelligent. Human.**

The goal is not to make every screen identical.

The goal is to make every screen feel unmistakably like **Lumo**.

---

# 72. Implementation Directive for Antigravity

When implementing responsive behavior:

1. Read `LUMO_BRAND_GUIDELINES.md`.
2. Read `LUMO_DESIGN_SYSTEM.md`.
3. Read `LUMO_COMPONENT_SYSTEM.md`.
4. Read `LUMO_MOTION_GUIDELINES.md`.
5. Read `LUMO_ILLUSTRATION_GUIDELINES.md`.
6. Read `LUMO_UX_PRINCIPLES.md`.
7. Read `LUMO_PRODUCT_ARCHITECTURE.md`.
8. Read `LUMO_UX_BLUEPRINT.md`.
9. Read `LUMO_LEARNING_THEATER.md`.
10. Read `LUMO_AI_ORCHESTRATION.md`.
11. Treat this document as the authoritative responsive behavior specification.

Before changing layouts:

- inspect the existing implementation
- preserve existing functionality
- identify reusable components
- identify existing responsive behavior
- avoid unnecessary rewrites

Do not implement responsive behavior as an afterthought.

Responsive behavior is part of Lumo's product architecture.

---

# 73. Final Rule

> **Lumo does not shrink to fit the screen. Lumo re-composes itself around the learner.**

```

```
````
