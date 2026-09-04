# LUMO — Motion Guidelines

**Document:** LUMO_MOTION_GUIDELINES.md  
**Status:** Final — Stage 1 Design System  
**Product:** Lumo  
**Purpose:** Define the motion language, timing, animation principles, and interaction behavior across the Lumo product.

---

# 1. Motion Philosophy

Motion in Lumo exists to make the interface feel:

- Alive
- Intelligent
- Responsive
- Calm
- Premium
- Understandable

Motion must never exist merely because an element "can be animated."

The fundamental rule is:

> **Motion should communicate meaning, hierarchy, continuity, or feedback.**

Lumo is a learning environment rather than a conventional SaaS dashboard.

Therefore, motion has two distinct roles:

### Interface Motion

Helps the student understand the interface.

Examples:

- Opening a menu
- Switching tabs
- Showing a toast
- Expanding a card
- Entering a page
- Changing state

### Learning Motion

Helps the student understand the subject.

Examples:

- A force vector moving an object
- A cell component appearing
- A mathematical equation building progressively
- A historical timeline advancing
- Code executing
- A solar system orbiting
- A circuit becoming connected

These two types of motion must never be treated identically.

---

# 2. The Lumo Motion Principle

Lumo follows:

> **Calm interface motion + purposeful learning motion + selective cinematic moments.**

The interface should feel smooth without constantly moving.

The lesson environment can become dramatically more expressive when animation is part of the explanation.

---

# 3. Motion Hierarchy

Motion should follow three levels.

## Level 1 — Micro Motion

Small, fast interactions.

Used for:

- Buttons
- Inputs
- Toggles
- Hover states
- Icons
- Navigation
- Small state changes

Characteristics:

- Fast
- Subtle
- Predictable

---

## Level 2 — Interface Motion

Used for:

- Cards
- Panels
- Modals
- Navigation
- Page transitions
- Progress
- AI state changes

Characteristics:

- Noticeable
- Smooth
- Directional
- Functional

---

## Level 3 — Cinematic / Learning Motion

Used for:

- Remotion lesson visuals
- Scientific simulations
- 3D visualizations
- Diagrams
- Timelines
- Mathematical demonstrations
- Real-world examples
- AI teaching moments

Characteristics:

- More expressive
- Slower when appropriate
- Sequenced
- Synchronized with narration
- Meaning-driven

---

# 4. Timing System

Lumo should use a small and consistent timing scale.

## Instant

`0–80ms`

Use for:

- State acknowledgement
- Immediate visual feedback
- Active/inactive indicators

Do not use for large transitions.

---

## Fast

`100–160ms`

Use for:

- Button hover
- Icon transitions
- Small opacity changes
- Toggles
- Input feedback

Default:

`140ms`

---

## Standard

`180–260ms`

Use for:

- Cards
- Dropdowns
- Tabs
- Navigation
- Small panels
- Component state changes

Default:

`220ms`

This is the primary UI transition range.

---

## Moderate

`280–450ms`

Use for:

- Modals
- Larger panels
- Page elements
- Important state changes
- Progressive disclosure

Default:

`350ms`

---

## Slow

`500–900ms`

Use selectively for:

- Hero elements
- Cinematic interface moments
- Major learning transitions
- Large visual transformations

Slow motion should never be the default for ordinary UI.

---

# 5. Recommended Timing Tokens

```text
--motion-instant: 80ms
--motion-fast: 140ms
--motion-standard: 220ms
--motion-moderate: 350ms
--motion-slow: 650ms
--motion-cinematic: 900ms+
```

````

These values are guidelines rather than rigid requirements.

The perceived speed of an animation should also depend on:

- Distance
- Element size
- Complexity
- Direction
- Context

---

# 6. Easing

Lumo should generally avoid linear easing for interface motion.

Linear motion often feels mechanical.

## Standard UI

Preferred:

```text
cubic-bezier(0.2, 0.8, 0.2, 1)
```

Use for:

- Cards
- Panels
- Navigation
- Position changes
- General UI transitions

---

## Enter

Use a slightly responsive ease-out.

The element should arrive naturally rather than snapping into place.

Conceptually:

```text
Fast start → gentle finish
```

---

## Exit

Use a slightly faster transition.

Conceptually:

```text
Quick departure → minimal lingering
```

Exits should generally feel faster than entrances.

---

## Interactive Feedback

Buttons and controls should respond immediately.

Avoid making users wait for an animation before they can continue interacting.

---

# 7. Transform Preferences

Prefer transform and opacity-based animation where possible.

Preferred:

- `opacity`
- `transform`
- `scale`
- `translate`
- `rotate`

Use layout-affecting properties cautiously.

Avoid unnecessary animation of:

- Width
- Height
- Top
- Left
- Margin
- Padding

when a transform can achieve the same visual result.

---

# 8. Interface Motion

## Buttons

Buttons may use:

- Slight scale
- Subtle elevation
- Background transition
- Icon movement

Example:

```text
Resting
↓
Hover
↓
Slight visual lift
↓
Press
↓
Tiny compression
↓
Return
```

The effect should be subtle.

Avoid:

- Large bouncing
- Excessive scaling
- Dramatic rotations
- Elastic cartoon effects

---

# 9. Cards

Cards should not aggressively fly around the interface.

Preferred behavior:

```text
opacity: 0 → 1
translateY: 6px → 0
```

or a similarly subtle entrance.

Hover can introduce:

- Small elevation increase
- Slight translateY
- Border emphasis

Avoid:

- Large rotations
- Excessive zoom
- Floating cards everywhere

---

# 10. Navigation Motion

Navigation should feel almost invisible.

When switching between sections:

- Maintain spatial continuity
- Avoid unnecessary page theatrics
- Preserve context whenever possible

The student should feel:

> "I moved to another part of my workspace."

Not:

> "The website played an animation."

---

# 11. Tabs

Tab transitions should be immediate and clear.

The active indicator may:

- Slide
- Fade
- Resize

A short transition around:

`180–240ms`

is recommended.

The indicator should help communicate:

> "This is where you are."

---

# 12. Modals

Modals should enter with a combination of:

- Opacity
- Small scale or vertical translation

Example:

```text
Overlay
opacity: 0 → 1

Modal
opacity: 0 → 1
scale: 0.98 → 1
```

Avoid dramatic zooming.

The modal is a functional interruption, not a cinematic scene.

---

# 13. Dropdowns

Dropdowns should appear quickly.

Recommended:

```text
opacity: 0 → 1
translateY: -4px → 0
```

Duration:

`160–220ms`

Do not make menus slowly float into view.

---

# 14. Progress Animation

Progress should animate when the value meaningfully changes.

For example:

```text
████████░░ 72%

→

█████████░ 81%
```

The transition should visually communicate improvement.

Recommended duration:

`400–700ms`

Progress should not constantly animate while the user is simply looking at it.

---

# 15. Toasts

Toasts should:

- Enter quickly
- Remain readable
- Exit quietly

Recommended:

```text
Enter: 220–300ms
Visible: context dependent
Exit: 160–220ms
```

Do not make every toast bounce or shake.

Errors may use a subtle visual emphasis, but avoid aggressive animation.

---

# 16. AI State Motion

The AI tutor has several states.

Motion should communicate these states without creating noise.

## Listening

The interface may show:

```text
● Listening
```

with a very subtle breathing/pulsing indicator.

The pulse should be slow and calm.

It should communicate:

> "I'm listening."

not:

> "Something is flashing."

---

## Thinking

Use a restrained animated indicator.

Example:

```text
Tutor is thinking
•••
```

or a subtle ambient animation.

Avoid:

```text
LOADING!!!
████████████
```

The AI should feel thoughtful rather than computationally busy.

---

## Speaking

During speech:

- AI presence becomes active
- Audio state becomes visually apparent
- Visual lesson remains the primary focus

The lesson should not become overwhelmed by an animated avatar.

---

## Interrupted

When the student interrupts:

```text
Speaking
   ↓
Interrupted
   ↓
Listening
```

The transition should be immediate.

There should be no lingering animation suggesting that the tutor is still speaking.

This is especially important because Lumo implements true barge-in behavior.

---

## Assessment

Assessment mode should have its own restrained visual language.

The interface should transition clearly into:

> "Now we're checking understanding."

Avoid making assessment feel like a dramatic game-show sequence.

---

## Replay

Replay should communicate continuity.

The student should feel:

> "We're returning to something you already learned."

rather than:

> "A new lesson is loading."

---

# 17. Page Transitions

Page transitions should be minimal.

Recommended:

```text
opacity
+
small translate
```

Avoid cinematic page transitions throughout the entire application.

The learning experience itself should be the cinematic part.

---

# 18. Learning Motion

Learning motion is fundamentally different from UI animation.

The purpose is not decoration.

The purpose is:

> **Make an abstract concept observable.**

---

# 19. Learning Motion Rule

Every major animation should answer:

> **What does this animation help the student understand?**

If the answer is:

> "It looks cool."

the animation probably does not belong.

If the answer is:

> "It shows why increasing resistance reduces current."

the animation is educationally valuable.

---

# 20. Progressive Explanation

Complex concepts should often be revealed progressively.

Example:

Instead of:

```text
F = ma
```

appearing instantly:

```text
F
↓
F = m
↓
F = ma
```

This allows the visual explanation to follow the teaching sequence.

---

# 21. Spatial Contiguity

When the tutor discusses a visual element, that element should be visually emphasized.

Example:

Tutor:

> "The force acting on the object increases."

Visual:

```text
Object
  □

Force
  →→→→
```

The force vector changes at the same moment.

The student should not have to search the screen for the relevant information.

---

# 22. Temporal Synchronization

Speech and visual events should be synchronized whenever possible.

Conceptually:

```text
Tutor narration
      ↓
"Resistance increases..."
      ↓
Visual resistance increases
      ↓
Current decreases
      ↓
Tutor explains result
```

This synchronization is one of Lumo's strongest differentiators.

---

# 23. Visual Signaling

Important elements may be highlighted using:

- Glow
- Scale
- Opacity
- Motion
- Outline
- Focus
- Color emphasis

But only the relevant element should receive emphasis.

Avoid highlighting everything.

---

# 24. Avoid Visual Competition

At any moment there should ideally be:

### One primary visual focus

and

### Supporting information

not five competing animations.

The student should immediately know:

> "Look here."

---

# 25. Sequential Animation

When a concept has multiple stages, reveal them sequentially.

Example:

```text
Step 1
Object appears

↓

Step 2
Force appears

↓

Step 3
Acceleration changes

↓

Step 4
Relationship is summarized
```

This is preferable to showing all four simultaneously.

---

# 26. Subject-Aware Learning Motion

Motion should change depending on the subject.

## Physics

Use:

- Forces
- Vectors
- Motion
- Graphs
- Collisions
- Simulations

## Biology

Use:

- Cells
- Molecules
- Biological processes
- Organ systems
- 3D structures

## Chemistry

Use:

- Molecular structures
- Reactions
- Particle movement
- Bond formation/breaking

## Mathematics

Use:

- Graph transformations
- Geometric construction
- Equation progression
- Coordinate movement
- Function visualization

## History

Use:

- Timelines
- Maps
- Territory changes
- Event sequences
- Historical relationships

## Geography

Use:

- Maps
- Terrain
- Climate systems
- Population movement
- Spatial relationships

## Programming

Use:

```text
Code
↓
Execution
↓
State change
↓
Output
```

The animation should explain the programming concept rather than simply display code.

---

# 27. Cinematic Motion

Cinematic motion is reserved for moments where the product should create a strong sense of:

- Wonder
- Discovery
- Context
- Scale
- Real-world understanding

Examples:

### Solar System

Planets appear and begin orbiting.

### Human Cell

Camera transitions into a cell and reveals organelles.

### Physics

Camera follows a moving object through a real-world environment.

### History

A map evolves through time.

### Programming

A code block transforms into an animated execution flow.

---

# 28. Cinematic Motion Must Remain Educational

Cinematic animation should never become a distraction.

The hierarchy remains:

```text
Understanding
    ↓
Visual explanation
    ↓
Cinematic presentation
```

Never:

```text
Cinematic spectacle
    ↓
Everything else
```

---

# 29. Camera Motion

When 3D or cinematic visuals are used:

Prefer:

- Slow camera movement
- Controlled zoom
- Deliberate framing
- Focus transitions
- Smooth orbiting

Avoid:

- Rapid camera spins
- Excessive zooming
- Constant perspective changes
- Motion without instructional purpose

The student should never feel motion sickness while learning.

---

# 30. 3D Motion

3D should be used selectively.

Good uses:

- Solar system
- Cell structures
- Molecules
- Mechanical systems
- Architecture
- Geometry
- Spatial concepts

Bad uses:

- Decorative 3D objects around the dashboard
- Random floating objects
- 3D backgrounds behind text
- Constant 3D effects

3D is a teaching tool, not a branding requirement.

---

# 31. Real-World Visual Motion

When the AI uses a real-world analogy, the visual should reflect that analogy.

Example:

> "Imagine pushing a shopping cart."

Visual:

```text
Person → 🛒
        Force →
```

The animation can demonstrate:

- Applied force
- Direction
- Acceleration
- Resistance

The real-world example becomes part of the explanation.

---

# 32. Remotion Motion Principles

Remotion-generated lessons should follow the same Lumo motion language.

Visual sequences should be:

- Segmented
- Intentional
- Narration-aware
- State-aware
- Interruptible
- Replayable

Every visual beat should have a clear identity.

Example:

```text
VisualBeat
├── concept
├── start
├── duration
├── visual action
└── narration relationship
```

---

# 33. Barge-In and Motion Cancellation

Lumo supports true conversational interruption.

Therefore:

> **No animation may continue after its turn becomes invalid.**

When a student interrupts:

```text
Active turn
   ↓
Invalidate turn
   ↓
Cancel TTS
   ↓
Cancel visual timers
   ↓
Stop captions
   ↓
Reject stale visual updates
   ↓
Return to listening
```

This prevents zombie animations.

---

# 34. Stale Animation Prevention

A visual event must verify that its associated `turnId` is still active before applying a state change.

Conceptually:

```text
if currentTurnId !== eventTurnId:
    discard event
```

This is a core architectural requirement.

Visual continuity must never override turn validity.

---

# 35. Replay Motion

Replay should reuse the original teaching visual state whenever possible.

The goal is:

> **Revisit, not regenerate.**

Therefore replay should feel like:

```text
Current lesson
      ↓
Return to previous concept
      ↓
Replay original visual sequence
```

rather than:

```text
Generate another explanation
```

This reinforces the deterministic nature of Lumo's replay system.

---

# 36. Re-Explain Motion

"Explain differently" is different from replay.

The visual system may intentionally produce:

- A different example
- A different diagram
- A different perspective
- A different sequence
- A different animation

The UI should communicate that the tutor is taking a new teaching approach.

---

# 37. Assessment Motion

Assessment animation should be restrained.

Good:

- Question transition
- Answer feedback
- Progress update
- Concept mastery change
- Adaptive lesson transition

Avoid:

- Confetti after every answer
- Loud success animations
- Game-show effects
- Excessive countdown effects

Assessment should feel motivating without creating performance anxiety.

---

# 38. Adaptive Teaching Motion

When the AI detects a weakness, the interface can subtly communicate adaptation.

Example:

```text
Resistance

✓ Voltage
✓ Current
→ Resistance     ← Let's strengthen this
○ Ohm's Law
```

Then the learning path updates.

This is an opportunity to make Lumo's intelligence visible.

The animation should be subtle enough that it feels like the tutor naturally adjusted the lesson.

---

# 39. Dashboard Motion

Dashboard motion should be minimal.

Possible uses:

- Progress values updating
- Recommended lesson appearing
- Mastery changes
- Continue-learning state
- Subtle hover states

Avoid:

- Animated backgrounds
- Constant floating elements
- Auto-moving cards
- Decorative particles

The dashboard should feel calm.

---

# 40. Landing Page Motion

The landing page may be more expressive than the application.

Use motion to demonstrate the product's core magic.

For example:

```text
Student asks
      ↓
AI understands
      ↓
Lesson forms
      ↓
Visual appears
      ↓
Tutor explains
      ↓
Student answers
```

This is more valuable than generic hero animations.

---

# 41. Negative Space and Motion

Motion must respect Lumo's use of negative space.

Do not fill empty space simply because animation is possible.

Negative space communicates:

- Calm
- Confidence
- Premium quality
- Focus
- Hierarchy

Animation should enhance that feeling rather than destroy it.

---

# 42. Dark Theme Motion

Dark mode should use slightly softer motion than the light theme when appropriate.

Avoid extremely bright glowing animations.

Use:

- Controlled highlights
- Subtle luminance changes
- Soft transitions
- Restrained glow

The dark interface should feel:

> Premium and immersive.

Not:

> Cyberpunk gaming dashboard.

---

# 43. Light Theme Motion

The light theme should feel:

> Fruity, fresh, warm and playful.

Motion can be slightly more expressive here.

However:

> Fruity does not mean chaotic.

Maintain the same fundamental motion discipline.

---

# 44. Reduced Motion

Lumo must respect:

```text
prefers-reduced-motion: reduce
```

When reduced motion is enabled:

### Disable or reduce

- Large transforms
- Parallax
- Continuous decorative animation
- Camera movement
- Excessive scaling
- Complex page transitions
- Auto-playing cinematic sequences

### Preserve

- State changes
- Focus indicators
- Essential feedback
- Progress updates
- Educational sequencing where necessary

Animations should generally be replaced with:

```text
opacity
+
instant/simple state transition
```

where possible.

---

# 45. Educational Reduced Motion

If a learning animation is essential to understanding a concept, provide an accessible alternative.

Examples:

### Animation

A ball accelerates.

### Reduced-motion alternative

A sequence of clearly labeled static states:

```text
t = 0
● →

t = 1
●   →

t = 2
●      →
```

The concept remains understandable without continuous animation.

---

# 46. When NOT to Animate

Do not animate:

- Every card
- Every button
- Every icon
- Every text element
- Every page load
- Every dashboard metric
- Every hover
- Every background
- Every section simultaneously

Avoid animation when it:

- Adds no information
- Delays interaction
- Distracts from the lesson
- Makes reading harder
- Creates visual fatigue
- Competes with the primary learning visual
- Makes the product feel childish
- Exists only to demonstrate technical capability

---

# 47. The "Would This Help Me Learn?" Test

Before adding a significant animation, ask:

### 1. What is moving?

### 2. Why is it moving?

### 3. What does the movement communicate?

### 4. Does it improve understanding?

### 5. Does it establish hierarchy?

### 6. Could the same information be communicated more simply?

If the answer to #4 is no and the animation is not providing important UI feedback:

> **Do not animate it.**

---

# 48. Motion Consistency

All Lumo interfaces should share:

- Consistent timing
- Consistent easing
- Consistent interaction feedback
- Consistent state transitions
- Consistent visual hierarchy

The user should gradually learn how Lumo behaves.

Predictability creates confidence.

---

# 49. Motion and Product Personality

Lumo's personality should be reflected through motion.

## Lumo should feel

```text
Smart
Calm
Curious
Warm
Precise
Expressive
Premium
```

## Lumo should NOT feel

```text
Corporate
Mechanical
Chaotic
Childish
Over-gamified
Cyberpunk
Generic AI
```

---

# 50. Final Motion Principles

The entire Lumo motion system can be summarized as:

### 01 — Motion has a job

Never animate without purpose.

### 02 — UI stays calm

The interface should not constantly demand attention.

### 03 — Learning can become cinematic

When animation explains a concept, Lumo can become dramatically more expressive.

### 04 — One visual focus at a time

Avoid competing motion.

### 05 — Speech and visuals should work together

The tutor says it.

The visual demonstrates it.

### 06 — Motion must respect interruption

A student's new turn immediately invalidates stale animation.

### 07 — Replay should replay

Do not regenerate what can be deterministically replayed.

### 08 — Re-explanation can transform

A different explanation may use a different visual approach.

### 09 — 3D is a tool

Use it when spatial understanding benefits from it.

### 10 — Respect reduced motion

Accessibility is part of the design system.

### 11 — Negative space is valuable

Do not fill silence with animation.

### 12 — Premium comes from restraint

The goal is not:

> "Look how much animation we have."

The goal is:

> **"Everything moved exactly when it needed to."**

---

# 51. Lumo Motion North Star

> **Lumo should feel still when nothing needs to move, responsive when the student interacts, and cinematic when an idea comes alive.**
````
