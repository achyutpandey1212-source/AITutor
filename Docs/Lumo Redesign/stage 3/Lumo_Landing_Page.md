# LUMO — LANDING PAGE

**Document:** `LUMO_LANDING_PAGE.md`  
**Stage:** 3 — Page Architecture & Experience Design  
**Status:** Final Design Specification  
**Audience:** Antigravity / Frontend Implementation

---

# 1. Purpose

The Lumo landing page is the first impression of the product.

Its job is **not** to explain every feature.

Its job is to communicate, within seconds:

> **Lumo is an AI tutor that teaches through conversation, voice, visuals, interaction, and adaptation.**

The landing page should make the product feel like a **real, premium AI learning product**, not a generic ed-tech website or an AI chatbot wrapper.

The landing page must create enough curiosity that the visitor wants to enter the product and experience the Learning Theater.

---

# 2. Core Emotional Direction

The landing page should communicate:

- Intelligent
- Calm
- Premium
- Curious
- Futuristic
- Human
- Educational
- Technically impressive
- Trustworthy

The primary emotional reaction should be:

> **"This feels different from a normal learning app."**

A secondary reaction should be:

> **"I want to see what happens when I actually learn something with this."**

---

# 3. Primary Design Philosophy

## Negative Space Heavy

The landing page must intentionally use generous negative space.

Do NOT attempt to fill every area of the screen.

Whitespace is part of the design language.

The page should feel:

- spacious
- intentional
- quiet
- premium
- confident

The product should never appear desperate to communicate everything at once.

A visitor should immediately understand what matters.

---

# 4. Visual Hierarchy

The landing page follows this priority:

```text
1. Lumo identity
        ↓
2. Core promise
        ↓
3. Product demonstration
        ↓
4. Why Lumo is different
        ↓
5. Learning experience
        ↓
6. Call to action
```

The hierarchy must remain obvious even if the visitor only looks at the page for a few seconds.

---

# 5. Hero Section

## Objective

The hero should immediately answer:

> What is Lumo?

without requiring the visitor to read a large paragraph.

---

## Recommended Structure

Large amount of negative space.

Small brand/product eyebrow:

> AI-powered personal tutor

Main headline:

> **Learn anything. Your way.**

Supporting copy:

> Lumo teaches through conversation, voice, visuals and interactive lessons — adapting to how you learn.

Primary CTA:

> **Start Learning**

Secondary CTA:

> **See Lumo in action**

---

# 6. Hero Layout

The hero should NOT be overloaded with:

- multiple cards
- floating dashboards
- excessive feature badges
- decorative AI graphics
- large illustrations
- excessive gradients
- fake statistics
- testimonials
- feature grids

The hero should breathe.

Conceptually:

```text
                    LUMO

              AI PERSONAL TUTOR


              Learn anything.
                 Your way.


        Lumo teaches through conversation,
       voice, visuals and interactive lessons.


          [ Start Learning ]   [ See it in action ]


                       ↓
```

The exact visual arrangement can evolve during implementation, but the principle remains:

> **One dominant message. One dominant action.**

---

# 7. Hero Product Visual

The hero may contain a subtle product preview, but it must not compete with the headline.

The product preview should demonstrate the actual Lumo experience rather than being a generic dashboard mockup.

Preferred demonstration:

```text
Student:
"Teach me Newton's Second Law."

             ↓

Lumo begins teaching

       ┌──────────────────────────────┐
       │                              │
       │        F = ma                │
       │                              │
       │       ● ─────────→          │
       │                              │
       │       FORCE →                │
       │                              │
       └──────────────────────────────┘

              Lumo Tutor
```

The visual should communicate:

**conversation → explanation → visualization**

without requiring extensive text.

---

# 8. Hero Animation

Hero motion must be subtle.

Possible sequence:

1. Lumo logo appears.
2. Headline settles into position.
3. Supporting text fades in.
4. Product demonstration begins.
5. Visual lesson element activates.
6. Tutor state changes subtly.
7. CTA becomes available.

The animation should feel like the product is **coming alive**, not like a marketing animation trying to impress the visitor.

---

# 9. Hero Motion Rules

Use:

- opacity
- transform
- subtle scale
- gentle movement
- progressive visual reveal

Avoid:

- aggressive parallax
- constant floating objects
- particle explosions
- excessive 3D effects
- bouncing UI
- excessive text animation
- scroll-jacking

Motion should reinforce the product's intelligence and calmness.

---

# 10. Product Demonstration Section

This is one of the most important sections of the landing page.

Instead of explaining Lumo with a long feature list, demonstrate the teaching loop.

Possible heading:

> **Learning should feel like a conversation.**

Then show:

```text
Student asks
      ↓
Lumo understands
      ↓
Lumo explains
      ↓
Visual appears
      ↓
Lumo asks a question
      ↓
Student responds
      ↓
Lumo adapts
```

This section should visually demonstrate the actual product behavior.

---

# 11. Demonstration Philosophy

The landing page should **show the magic rather than describe the magic**.

For example:

Instead of:

> "Lumo generates personalized visual explanations."

Show:

```text
"Explain photosynthesis."

            ↓

      Plant visualization

       ☀️
        ↓
      🌿
   CO₂ + H₂O
        ↓
     Glucose
```

Then:

> "Now tell me — where does the plant get its carbon from?"

This immediately communicates adaptive teaching.

---

# 12. Learning Theater Preview

The Learning Theater is Lumo's flagship experience.

The landing page should contain a section introducing it without reproducing the entire interface.

Suggested heading:

> **A classroom built around you.**

Supporting copy:

> Watch concepts come alive, talk to your tutor, interrupt whenever you need, and practice directly inside the lesson.

Show a premium preview of:

- visual lesson stage
- tutor
- lesson progression
- interactive question state
- voice interaction
- visual explanation

The preview should feel cinematic.

---

# 13. Learning Theater Visual

The visual should prioritize the lesson canvas.

The tutor should occupy a smaller supporting area.

Conceptually:

```text
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│             LESSON VISUAL                   │
│                                             │
│          F = ma                             │
│                                             │
│       ● ───────────────→                    │
│                                             │
│                              ┌──────────┐   │
│                              │  LUMO    │   │
│                              │  TUTOR   │   │
│                              └──────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

This reinforces that Lumo is not simply an avatar talking over text.

---

# 14. "More Than a Chatbot" Section

Lumo should explicitly differentiate itself from generic AI chat interfaces.

Possible heading:

> **Not another chatbot.**

Supporting concept:

```text
Chatbot

Ask → Answer


Lumo

Ask
 ↓
Understand
 ↓
Explain
 ↓
Visualize
 ↓
Practice
 ↓
Evaluate
 ↓
Adapt
 ↓
Continue
```

The visual treatment should be simple and elegant.

Do not attack other products directly.

The goal is to communicate a different product category.

---

# 15. Core Capability Section

The landing page may introduce the major capabilities:

### Conversational Teaching

Talk naturally with Lumo.

### Visual Explanations

Concepts become diagrams, animations and simulations.

### Adaptive Learning

Lumo adjusts explanations and difficulty based on understanding.

### Interactive Practice

Questions appear directly inside the learning experience.

### Document-Aware Learning

Upload or select your own learning material and let Lumo teach from it.

### Multimodal Interaction

Voice, text, visuals and uploaded work can participate in the same learning loop.

---

# 16. Capability Presentation Rules

Do not create a huge conventional feature grid.

Avoid:

```text
[Feature Card]
[Feature Card]
[Feature Card]
[Feature Card]
[Feature Card]
[Feature Card]
```

Instead, use a small number of larger storytelling sections.

Each capability should be demonstrated visually where possible.

The visitor should understand:

> **What does this actually feel like?**

rather than simply:

> **What APIs does this use?**

---

# 17. Subject Demonstration Section

Because Lumo is designed to support many subjects, the landing page can demonstrate the breadth of its visual teaching capabilities.

Possible heading:

> **Every subject has its own language.**

Examples:

### Biology

Interactive cell visualization.

### Physics

Force, motion and simulation.

### Chemistry

Molecules, reactions and structures.

### Mathematics

Equations, graphs and geometric constructions.

### Astronomy

Planets, orbits and spatial relationships.

### History

Timelines, maps and contextual scenes.

### Programming

Code → execution → output.

The purpose is not to claim that every possible visual already exists.

The purpose is to communicate the **subject-aware visual teaching direction** of Lumo.

---

# 18. Target Demo Integration

The landing page should eventually use the strongest available demonstrations.

The target demo set includes at least one impressive experience for each major showcased domain:

- Biology
- Physics
- Chemistry
- Mathematics
- Astronomy
- Programming

The strongest available demo should be prioritized rather than creating dozens of mediocre examples.

A small number of excellent demonstrations is preferable to a large library of generic ones.

---

# 19. Document-Aware Learning Section

Lumo's RAG/document capability should be presented as part of the learning experience.

Possible heading:

> **Bring your own material.**

Show:

```text
Upload textbook / notes
          ↓
Choose topic
          ↓
Lumo understands the material
          ↓
Start a lesson
```

The user should also be shown that previously uploaded documents can be selected again.

Conceptually:

```text
Your materials

[ Physics Notes.pdf       ▼ ]

Topic

[ Newton's Laws           ]

              [ Start Lesson ]
```

This should reinforce that users do not need to repeatedly upload the same material.

---

# 20. Assessment Preview

The landing page may briefly demonstrate that learning does not stop at explanation.

Possible heading:

> **Don't just understand it. Prove it.**

Show the Learning Theater transitioning into an interactive question.

For example:

```text
        ┌───────────────────────────┐
        │                           │
        │       QUESTION            │
        │                           │
        │ If mass doubles, what     │
        │ happens to acceleration?  │
        │                           │
        │  ○ A                       │
        │  ○ B                       │
        │  ○ C                       │
        │  ○ D                       │
        │                           │
        └───────────────────────────┘
```

The question should appear as an actual part of the lesson environment.

---

# 21. Adaptive Teaching Section

This is one of Lumo's strongest differentiators.

Show an example of the tutor noticing difficulty.

Example:

```text
Student struggles with:

Resistance
    ↓

Lumo notices
    ↓

Alternative explanation
    ↓

New visual example
    ↓

Targeted question
    ↓

Improved understanding
```

Possible copy:

> **Lumo notices when something isn't clicking.**

Supporting copy:

> Instead of simply repeating an answer, Lumo can change the explanation, demonstrate the concept differently, and check your understanding again.

This communicates intelligence through behavior.

---

# 22. CTA Strategy

The landing page should have a clear primary CTA.

Primary CTA:

> **Start Learning**

Secondary CTA:

> **See Lumo in action**

The CTA language should remain human and action-oriented.

Avoid:

- "Get Started With AI"
- "Explore Platform"
- "Launch Experience"
- "Try Our Revolutionary Technology"
- "Unlock AI-Powered Education"

Simple is stronger.

---

# 23. CTA Placement

Primary CTA should appear:

1. Hero
2. Near the end of the page

Secondary contextual CTAs may appear after major demonstrations.

Do not put a CTA after every section.

Too many CTAs create visual noise and weaken hierarchy.

---

# 24. Final CTA Section

The final section should feel like an invitation rather than a sales pitch.

Possible heading:

> **Ready to learn differently?**

Supporting copy:

> Pick a topic. Bring your material. Ask a question. Lumo will take it from there.

CTA:

> **Start Learning**

The section should have generous negative space.

---

# 25. Navigation

Desktop navigation should remain minimal.

Recommended structure:

```text
Lumo

Learn
How it works
Subjects

                         Sign in
                         [ Start Learning ]
```

Depending on the final product scope, navigation can be reduced further.

The landing page should not expose the entire application navigation.

---

# 26. Navigation Rules

The navbar should:

- remain visually light
- use strong typography hierarchy
- avoid excessive pills
- avoid excessive icons
- avoid oversized branding
- avoid large dropdown menus

The primary CTA can use the established Lumo button system.

---

# 27. Light Theme

The light landing page should represent the **fruity Lumo identity**.

Characteristics:

- warm/light background
- black or very dark logo
- expressive but controlled accent colors
- soft surfaces
- colorful educational visuals
- subtle playful details
- generous whitespace

The page should feel:

> fresh, optimistic and premium.

"Fruity" does NOT mean:

- rainbow everywhere
- childish colors
- excessive gradients
- candy-like UI
- neon overload

Color should appear as intentional accents against a calm foundation.

---

# 28. Dark Theme

The dark theme should preserve the same identity while becoming more cinematic.

Characteristics:

- deep neutral background
- white Lumo logo
- restrained colorful accents
- luminous educational visuals
- stronger contrast
- cinematic lesson previews

The dark theme should feel:

> intelligent, immersive and cinematic.

It should NOT become a generic "AI dark mode" filled with blue/purple gradients.

---

# 29. Theme Consistency

Light and dark themes must represent the same brand.

Do not create:

```text
Light Lumo = colorful education app

Dark Lumo = cyberpunk AI startup
```

Instead:

```text
Light Lumo = fresh + calm + expressive

Dark Lumo = cinematic + calm + expressive
```

The same spacing, typography, geometry and component language should remain consistent.

---

# 30. Illustration Direction

Landing-page illustrations should follow:

**LUMO_ILLUSTRATION_GUIDELINES.md**

Preferred visual language:

- editorial
- scientific
- polished
- subject-aware
- dimensional where useful
- restrained
- educational

Avoid generic AI imagery.

Do not use:

- robot heads
- glowing brains
- random AI circuits
- generic humanoid holograms
- stock student illustrations
- meaningless 3D blobs

Every major visual should communicate something about learning.

---

# 31. 3D Usage

Three.js / React Three Fiber may be used selectively.

Good uses:

- interactive cell
- molecule
- solar system
- scientific object
- spatial geometry
- physics simulation
- educational 3D model

Bad uses:

- 3D background purely for decoration
- floating shapes behind the hero
- random particles
- decorative WebGL effects with no educational purpose

The landing page should introduce the visual potential of Lumo without turning the entire website into a WebGL showcase.

---

# 32. Motion System

Landing-page motion follows:

**LUMO_MOTION_GUIDELINES.md**

The guiding principle:

> Motion should create understanding, hierarchy or curiosity.

Good:

- visual demonstrations
- progressive reveals
- diagram construction
- subtle section transitions
- product-state changes
- interactive previews

Bad:

- constant movement
- decorative loops everywhere
- distracting scroll effects
- excessive parallax
- motion competing with the headline

---

# 33. Scroll Experience

The landing page should feel like a deliberate story.

Recommended progression:

```text
Hero
  ↓
What Lumo is
  ↓
Product demonstration
  ↓
Learning Theater
  ↓
Subject-aware visuals
  ↓
Adaptive teaching
  ↓
Document-aware learning
  ↓
Assessment
  ↓
Final CTA
```

The user should feel that the page is gradually revealing what Lumo can do.

---

# 34. Responsive Behavior

The landing page must be designed mobile-first in terms of hierarchy, even if desktop is the primary demo environment.

On mobile:

- preserve negative space
- reduce visual density
- stack demonstrations
- simplify navigation
- reduce decorative elements
- maintain readable typography
- preserve CTA visibility
- avoid overly large hero graphics

Do not simply shrink the desktop design.

Recompose it.

---

# 35. What NOT to Put on the Landing Page

The following should NOT appear unless there is a strong product reason:

- Huge statistics dashboards
- Fake user counts
- Fake testimonials
- Fake reviews
- Excessive badges
- Excessive partner logos
- Long technical explanations
- API/model names
- Backend architecture
- Large pricing sections if pricing is not part of the MVP
- Excessive feature cards
- Giant FAQ sections
- Generic AI stock imagery
- Excessive gradients
- Excessive glassmorphism
- Random 3D objects
- Decorative particle backgrounds
- Excessive gamification
- Streak counters
- XP systems
- Leaderboards
- "Powered by AI" repeated everywhere

The landing page is not a technical documentation page.

---

# 36. What the Landing Page SHOULD Make Visible

The visitor should understand these capabilities without reading technical documentation:

```text
✓ Lumo is conversational

✓ Lumo can teach through voice

✓ Lumo can generate/use visual explanations

✓ Lessons can become interactive

✓ Students can interrupt and ask questions

✓ Lumo can adapt explanations

✓ Students can practice inside the lesson

✓ Documents/materials can inform the learning experience

✓ Lumo supports different subjects

✓ The Learning Theater is the core experience
```

---

# 37. Judge-Facing Principle

The landing page should help a hackathon judge understand the product quickly.

Within approximately 10–20 seconds, the judge should be able to answer:

### What is it?

An AI personal tutor.

### What makes it different?

It teaches through conversation + voice + visuals + interaction + adaptation.

### What does it look like?

A Learning Theater rather than a chatbot.

### What can it teach?

Multiple subjects with subject-aware visual explanations.

### What should I do next?

Enter Lumo and try it.

---

# 38. Performance Principle

Visual quality must never come at the expense of landing-page performance.

Avoid loading large assets merely for decoration.

Use:

- optimized images
- lazy loading
- code splitting
- selective WebGL
- compressed media
- progressive loading

Heavy cinematic demonstrations should be introduced only where their visual impact justifies their cost.

---

# 39. Implementation Philosophy

The landing page should be implemented as a polished product experience, not as a collection of disconnected sections.

Components should be reusable where appropriate.

However, Antigravity should NOT create a generic section-builder aesthetic where every section becomes:

```text
heading
paragraph
three cards
button
```

Each section should have a reason to exist and a visual composition appropriate to the story being told.

---

# 40. Success Criteria

The landing page is successful if:

- Lumo is understandable within seconds.
- The page feels premium without feeling corporate.
- Negative space is a major part of the visual identity.
- The fruity light theme feels intentional rather than childish.
- The dark theme feels cinematic without becoming generic AI aesthetics.
- The Learning Theater is clearly the flagship experience.
- Product demonstrations are more prominent than feature descriptions.
- The visitor understands that Lumo is more than a chatbot.
- Visual intelligence is demonstrated rather than merely claimed.
- The page does not feel overcrowded.
- Motion supports the narrative.
- The design works responsively.
- The page creates curiosity to enter the actual product.

---

# 41. Core Landing Page Principle

Above everything else:

> **Do not try to show everything Lumo can do. Show enough of Lumo's intelligence that the visitor wants to experience the rest.**

The landing page should leave the visitor thinking:

> **"Okay... I want to see this tutor actually teach."**

That is the purpose of the landing page.

```

```
