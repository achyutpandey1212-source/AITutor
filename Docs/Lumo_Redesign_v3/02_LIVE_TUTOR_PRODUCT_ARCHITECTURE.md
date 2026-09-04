# Lumo V3 — Live Tutor Product Architecture

> **Status:** Foundation / Source of Truth
> **Version:** 3.0
> **Scope:** Live AI Tutor product architecture
> **Depends on:** `01_LUMO_V3_DESIGN_SYSTEM.md`
> **Purpose:** Define what the Live Tutor is, how its major systems relate, and how users move through the experience.

---

# 1. Product Definition

Lumo Live Tutor is not a chatbot embedded inside a lesson.

It is an:

> **AI-powered interactive learning environment where the student learns through conversation, voice, visual explanation, and contextual interaction with an AI tutor.**

The student should feel that they have entered a focused learning session with a tutor.

The interface therefore needs to prioritize:

1. The lesson
2. The tutor
3. The student's current interaction
4. Supporting session information

Everything else is secondary.

---

# 2. Product North Star

The core experience is:

```text
Student enters lesson
        ↓
Lumo establishes context
        ↓
Lesson begins
        ↓
Lumo teaches
        ↓
Visual content supports explanation
        ↓
Student listens / interrupts / asks
        ↓
Lumo responds
        ↓
Conversation becomes part of session history
        ↓
Important moments become replayable
        ↓
Student continues through lesson
```

````

The product should feel continuous.

The user should not feel like they are jumping between:

- a lesson
- a chatbot
- a notes application
- a settings dashboard

These are different capabilities of the same learning environment.

---

# 3. Core Product Model

The Live Tutor consists of five major layers:

```text
                    LIVE TUTOR
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ↓               ↓                ↓
   LEARNING          TUTOR            SESSION
    CANVAS           ENGINE             MEMORY
        │               │                │
        │               │          ┌─────┴─────┐
        │               │          ↓           ↓
        │               │       Timeline    Transcript
        │               │
        │               ↓
        │          Voice / Avatar
        │
        ↓
 Visual Teaching Engine
```

A sixth layer sits across the product:

```text
                  PERSONALIZATION
                         │
          Language / Voice / Speed /
             Subtitles / Theme
```

---

# 4. Primary Experience

The Learning Canvas is the primary experience.

Everything else supports it.

Hierarchy:

```text
PRIMARY
Learning Canvas
        ↓
Tutor interaction
        ↓
Lesson progression

SECONDARY
Ask Lumo
Transcript
Session Timeline
Settings

OPTIONAL / FUTURE
Materials
Additional learning resources
```

The interface must never give secondary tools equal visual importance to the lesson.

---

# 5. Learning Canvas

The Learning Canvas is the stage on which teaching happens.

It should accommodate the existing Lumo teaching infrastructure.

The canvas may contain:

- explanatory text
- diagrams
- formulas
- visual scenes
- animations
- examples
- highlighted concepts
- generated educational visuals
- synchronized visual elements

The canvas must be capable of changing based on what Lumo is teaching.

---

# 6. Existing Visual Teaching Infrastructure

The Live Tutor redesign must preserve and accommodate the existing visual teaching workflow.

Current conceptual pipeline:

```text
Lesson Planner
      ↓
Teaching Plan
      ↓
Visual Scene Planning
      ↓
Scenes / Diagrams / Formulas / Objects
      ↓
Timing / Beat Synchronization
      ↓
Visual Teaching Experience
      ↓
Learning Canvas
```

This infrastructure is already part of Lumo.

The V3 Live Tutor redesign is NOT a replacement for this system.

Instead:

> The new interface becomes the premium environment in which this existing teaching engine operates.

---

# 7. Future Visual Asset Library

Lumo may later introduce a reusable educational asset library containing standardized assets such as:

- cells
- balls
- arrows
- forces
- apparatus
- particles
- diagrams
- scientific objects
- mathematical objects
- educational symbols

The future pipeline may become:

```text
Asset Library
      ↓
Scene Composition
      ↓
Visual Scene
      ↓
Synchronization
      ↓
Learning Canvas
```

This is intentionally outside the first Live Tutor redesign implementation phase.

The current architecture must simply remain compatible with it.

---

# 8. Tutor Engine

The Tutor Engine is the intelligence layer controlling the live teaching experience.

It is responsible for coordinating:

- student input
- lesson context
- AI responses
- tutor state
- voice generation
- subtitles
- conversation
- visual teaching context
- interruption
- session state

Conceptually:

```text
Student
   ↓
Interaction Layer
   ↓
Tutor Engine
   ├── AI reasoning
   ├── Conversation
   ├── Voice
   ├── Tutor state
   ├── Visual context
   └── Session memory
```

The UI must consume Tutor Engine state rather than independently inventing tutor behavior.

---

# 9. Tutor Identity

Lumo is the tutor.

The product should therefore treat Lumo as a persistent entity rather than merely an API response.

Lumo has:

- voice
- language
- personality
- visual presence
- speaking state
- listening state
- contextual awareness
- lesson awareness

The final avatar will visually represent this identity.

---

# 10. Tutor State

The Tutor Engine should expose an explicit state model.

Core states:

```text
IDLE
LISTENING
PROCESSING
SPEAKING
INTERRUPTED
ERROR
```

Potential future states:

```text
PAUSED
LOADING
RECONNECTING
COMPLETED
```

The UI and avatar should respond to these states.

---

# 11. Tutor State Flow

Typical interaction:

```text
IDLE
  ↓
Student activates microphone
  ↓
LISTENING
  ↓
Student finishes
  ↓
PROCESSING
  ↓
Lumo generates response
  ↓
SPEAKING
  ↓
Lumo finishes
  ↓
IDLE
```

Interruption:

```text
SPEAKING
    ↓
Student speaks
    ↓
INTERRUPTED
    ↓
LISTENING
    ↓
PROCESSING
    ↓
SPEAKING
```

Failure:

```text
PROCESSING
    ↓
ERROR
    ↓
IDLE
```

The UI should make these transitions feel immediate and natural.

---

# 12. Voice Interaction

Voice is a primary interaction method.

The student should be able to:

- start listening
- speak naturally
- interrupt Lumo
- hear Lumo respond
- see subtitles
- continue the lesson

Voice should not feel like an optional feature hidden behind a menu.

It is part of the central Live Tutor experience.

---

# 13. Avatar

The avatar is the visual representation of Lumo.

The final avatar may be a premium 3D character.

The avatar should eventually support:

- idle movement
- listening behavior
- speaking behavior
- lip synchronization
- facial expressions
- head movement
- contextual reactions
- gestures

The avatar should NOT be treated as a decorative object.

It is part of the tutor interaction model.

---

# 14. Avatar Architecture

The avatar should consume Tutor Engine state.

Conceptually:

```text
Tutor Engine
      ↓
Tutor State
      ↓
┌─────────────┬─────────────┬─────────────┐
│             │             │             │
Avatar      Subtitles     Controls      Audio
│
├── Mouth
├── Face
├── Head
└── Gesture
```

The avatar should not contain independent business logic.

---

# 15. Lip Synchronization

Future avatar implementation should support:

```text
TTS Audio
    ↓
Speech Timing / Phoneme Data
    ↓
Avatar Animation
    ├── Mouth
    ├── Facial expression
    ├── Head movement
    └── Gesture
```

The architecture should allow this to be introduced without restructuring the Live Tutor.

---

# 16. Lesson Progression

The lesson contains concepts.

Example:

```text
Lesson
 ├── Concept 1
 ├── Concept 2
 ├── Concept 3
 ├── Concept 4
 └── Concept 5
```

The Live Tutor should communicate:

- current concept
- overall progress
- current lesson context

Progress information should remain visually quiet.

It exists to orient the student, not dominate the interface.

---

# 17. Session

Every Live Tutor interaction occurs inside a session.

A session contains:

```text
Session
 ├── Lesson
 ├── Current concept
 ├── Tutor state
 ├── Conversation
 ├── Timeline events
 ├── Replay points
 ├── Settings
 └── Progress
```

This session model is important because multiple Live Tutor features depend on shared context.

---

# 18. Session Memory

Session memory has two major user-facing forms:

```text
SESSION MEMORY
      │
      ├── Transcript
      │
      └── Timeline
```

These are related but not identical.

---

# 19. Transcript

The Transcript stores the conversational history.

It contains:

- student messages
- Lumo responses
- timestamps
- contextual information

Conceptually:

```text
Student
Why does the passenger move forward?

Lumo
Because of inertia...

Student
So inertia is a force?

Lumo
No. That's an important distinction...
```

The transcript should preserve the conversational flow.

---

# 20. Transcript ↔ Lesson Relationship

Transcript messages should remain connected to the lesson context.

A future interaction may allow:

```text
Transcript message
      ↓
Associated lesson moment
      ↓
Replay / navigate
      ↓
Learning Canvas
```

This relationship should be considered in the data architecture even if the full feature is implemented later.

---

# 21. Session Timeline

The Timeline records meaningful moments during the session.

Examples:

```text
09:42
Lesson started

09:47
Concept explained

09:53
Student question

09:54
Lumo explanation

10:02
Replay point
```

The timeline is not a duplicate transcript.

It represents the structure of the learning session.

---

# 22. Replay Points

Replay points allow students to revisit important moments.

A replay point may reference:

- lesson position
- concept
- timestamp
- visual state
- conversation context

Future architecture should allow the system to reconstruct or navigate toward the relevant teaching moment.

---

# 23. Ask Lumo

Ask Lumo is the direct doubt-solving mode.

It is distinct from normal live teaching.

The user invokes it when they want to ask a focused question.

Initial experience:

```text
Live Tutor
     ↓
Ask Lumo
     ↓
Compact doubt solver
     ↓
Question
     ↓
Answer
```

The user can expand the interface when they need more space.

---

# 24. Ask Lumo Models

Ask Lumo must support three model choices:

```text
Lumo Fast
Lumo Light
Lumo Pro
```

These are real product modes, not cosmetic options.

Expected conceptual positioning:

### Lumo Fast

Optimized for speed and simple questions.

### Lumo Light

Balanced quality and speed for everyday tutoring.

### Lumo Pro

Higher reasoning capability for difficult or complex questions.

The selected model must flow through the complete backend path.

```text
Model Selection
      ↓
Frontend State
      ↓
API Request
      ↓
Model Routing
      ↓
Selected Provider / Model
      ↓
Response
```

The UI must never imply a model is selected if the backend ignores the selection.

---

# 25. Ask Lumo Context

Ask Lumo should understand that it exists inside a lesson.

Where possible, it should have access to:

- current lesson
- current concept
- relevant teaching context
- recent conversation
- student context

However, the doubt solver should remain capable of handling a direct focused question without overwhelming the user with context.

---

# 26. Secondary Surfaces

Lumo V3 does not conceptually use "sidebars" as a default product pattern.

Instead, secondary functionality is represented as:

- floating panels
- sheets
- focused overlays
- expandable workspaces
- contextual popovers

The visual treatment is determined by the function.

---

# 27. Surface Hierarchy

Primary:

```text
Learning Canvas
```

Secondary:

```text
Ask Lumo
Transcript
Timeline
Settings
```

Tertiary:

```text
Voice preview
Small menus
Confirmation states
Contextual actions
```

---

# 28. Session Tools

The Live Tutor currently exposes several session tools.

| Existing Control | V3 Product Role           |
| ---------------- | ------------------------- |
| Ask Lumo         | Doubt solving             |
| Notes            | Session Timeline          |
| Materials        | Reconsider / remove       |
| More             | Transcript / Conversation |
| Settings         | Preferences               |

Names may change during UI specification.

Functionality should not be removed merely because the visual control changes.

---

# 29. Materials

Materials is currently non-functional.

V3 should NOT preserve a non-functional primary navigation item merely because it exists today.

Potential future purpose:

- textbook material
- uploaded PDFs
- reference documents
- lesson resources
- supporting content
- teacher-provided material

Until a meaningful experience exists, Materials should be considered optional.

---

# 30. Settings / Personalization

Settings is the personalization layer of Live Tutor.

Initial settings:

```text
Language
Voice
Narration speed
Subtitles
Theme
```

Initial supported tutor languages:

```text
English
Hinglish
Hindi
```

The system may support additional voices internally, but the initial product experience should remain focused.

---

# 31. Voice Selection

Voice selection should eventually behave more like a modern voice product than a generic dropdown.

A voice option should provide:

```text
Voice name
Description
Preview
Selection
```

Example:

```text
Maya
Warm · Conversational
▶ Preview
```

The preview should allow students to hear a sample before committing to a voice.

---

# 32. Theme

The Live Tutor supports:

```text
Light
Dark
```

Both themes represent the same product.

Theme changes should not alter:

- information architecture
- interaction model
- component hierarchy
- motion
- functionality

Only visual tokens change.

---

# 33. Primary User Journey

The ideal session:

```text
1. Student opens lesson
        ↓
2. Lumo introduces the lesson
        ↓
3. Learning Canvas presents teaching content
        ↓
4. Lumo explains using voice + visuals
        ↓
5. Student listens
        ↓
6. Student interrupts / asks a question
        ↓
7. Lumo responds
        ↓
8. Conversation is preserved
        ↓
9. Important moments become timeline events
        ↓
10. Student continues
        ↓
11. Student can revisit previous moments
        ↓
12. Lesson progresses
        ↓
13. Session completes
```

The interface should make this journey feel continuous.

---

# 34. Secondary User Journey — Doubt

```text
Student is learning
        ↓
Student becomes confused
        ↓
Ask Lumo
        ↓
Compact doubt solver opens
        ↓
Student chooses model if desired
        ↓
Student asks question
        ↓
Lumo responds
        ↓
Student closes / expands
        ↓
Returns to lesson
```

The transition back to learning should be frictionless.

---

# 35. Secondary User Journey — Review

```text
Student opens Timeline
        ↓
Sees important session moments
        ↓
Selects a moment
        ↓
Reviews context
        ↓
Replays / navigates to lesson
        ↓
Returns to current lesson position
```

---

# 36. Secondary User Journey — Conversation

```text
Student opens Transcript
        ↓
Reviews conversation
        ↓
Finds previous explanation
        ↓
Potentially navigates to associated lesson moment
        ↓
Returns to lesson
```

---

# 37. Secondary User Journey — Personalization

```text
Student opens Settings
        ↓
Selects language
        ↓
Selects voice
        ↓
Previews voice
        ↓
Adjusts narration speed
        ↓
Toggles subtitles
        ↓
Closes settings
        ↓
Tutor immediately uses updated preferences
```

Changes should ideally apply immediately where technically possible.

---

# 38. Information Architecture

The final Live Tutor should conceptually resemble:

```text
LIVE TUTOR
│
├── Learning Canvas
│
├── Tutor Interaction
│   ├── Voice
│   ├── Avatar
│   └── Text fallback
│
├── Ask Lumo
│   ├── Question
│   ├── Model Selection
│   │   ├── Fast
│   │   ├── Light
│   │   └── Pro
│   └── Conversation
│
├── Session
│   ├── Timeline
│   └── Transcript
│
└── Preferences
    ├── Language
    ├── Voice
    ├── Narration Speed
    ├── Subtitles
    └── Theme
```

---

# 39. Persistent vs Contextual UI

## Persistent

Only functionality that is frequently required should remain visible.

Examples:

- Lumo identity
- lesson context
- progress
- tutor interaction
- settings

## Contextual

These should appear when relevant:

- Explain again
- Try another way
- Replay
- Follow-up
- Transcript actions
- Timeline actions
- Voice controls
- Model controls

The product should prefer:

> **Contextual UI over permanent UI.**

---

# 40. What Should NOT Be Permanent

The following should not occupy permanent screen space simply because they exist:

- transcript
- timeline
- voice picker
- model picker
- replay controls
- secondary lesson actions
- Materials
- large collections of utility buttons

The lesson remains the primary focus.

---

# 41. Mobile / Narrow Layout

The architecture must support narrow layouts without simply shrinking desktop.

On smaller screens:

```text
Learning Canvas
      ↓
Tutor
      ↓
Primary interaction
```

Secondary surfaces become:

- full-screen views
- focused overlays
- bottom sheets
- expandable workspaces

depending on the interaction.

---

# 42. Data Relationships

The major entities are conceptually:

```text
Lesson
  │
  └── Concepts
        │
        └── Live Session
              │
              ├── Tutor State
              ├── Conversation
              ├── Timeline Events
              ├── Replay Points
              ├── Preferences
              └── Progress
```

The Live Tutor should use the existing backend architecture wherever possible.

The redesign is not a justification for unnecessary backend rewrites.

---

# 43. Frontend Architecture Principle

The frontend should be organized around product capabilities rather than visual fragments.

Avoid architecture such as:

```text
Sidebar.tsx
Card.tsx
BlueButton.tsx
AICard.tsx
```

where components are created primarily from visual appearance.

Prefer conceptual boundaries such as:

```text
LiveTutor
LearningCanvas
TutorPresence
TutorControls
AskLumo
SessionTimeline
Transcript
Preferences
VoiceSelector
```

Individual visual components can exist underneath these domains.

---

# 44. Backend Architecture Principle

Existing backend infrastructure should be preserved where it already solves the product requirement.

The redesign should focus on:

1. Missing functionality
2. Broken interactions
3. Incomplete API wiring
4. Incorrect state handling
5. Persistence gaps
6. Model routing
7. Session consistency

Avoid rewriting stable systems purely for the sake of V3.

---

# 45. Functional Audit Requirement

Every major Live Tutor feature must be audited during V3.

For each feature determine:

```text
Does it exist?
Does the UI expose it?
Does the frontend state work?
Does the API support it?
Does the backend implement it?
Is the data persisted?
Does it work after refresh?
Does it work across sessions?
Does it have loading/error states?
Does it work in light mode?
Does it work in dark mode?
```

This audit is documented separately in:

`06_LIVE_TUTOR_FUNCTIONAL_AUDIT.md`

---

# 46. V3 Scope

## Phase A — Product Foundation

Focus on:

- architecture
- visual system
- layout
- hierarchy
- interaction model
- tutor states

## Phase B — Core Live Tutor

Focus on:

- Learning Canvas
- Tutor presence
- Voice interaction
- Avatar-ready architecture
- lesson progression

## Phase C — Secondary Experiences

Focus on:

- Ask Lumo
- Model selection
- Timeline
- Transcript
- Settings
- Voice selection

## Phase D — Functional Audit

Focus on:

- backend wiring
- persistence
- model routing
- session state
- errors
- edge cases

## Phase E — Avatar

Focus on:

- 3D avatar
- animation
- lip sync
- expression
- speaking behavior

## Phase F — Teaching Visual Polish

Focus on:

- asset library
- visual scene quality
- diagrams
- formulas
- animation
- synchronization

---

# 47. Explicitly Out of Initial Scope

The following should not block the first Live Tutor redesign:

- complete asset library
- perfect educational scene generation
- final avatar production quality
- advanced avatar gestures
- every possible language
- every possible AI model
- large materials ecosystem
- advanced analytics
- gamification

These can evolve after the core experience is strong.

---

# 48. Product Quality Gates

A phase should not be considered complete merely because it technically works.

It must pass four gates.

## Functional

Does it work?

## Visual

Does it look intentional and premium?

## Interaction

Does it feel natural?

## Product

Does it make the learning experience better?

A feature that passes only the functional gate is not V3-ready.

---

# 49. V3 Product Principles

### Principle 1

**The lesson is the product.**

### Principle 2

**Lumo is the teacher, not a chatbot widget.**

### Principle 3

**Voice is a first-class interaction.**

### Principle 4

**Visual teaching is a first-class capability.**

### Principle 5

**Secondary tools should not compete with learning.**

### Principle 6

**Contextual UI is preferred over permanent UI.**

### Principle 7

**Existing infrastructure should be leveraged, not unnecessarily rebuilt.**

### Principle 8

**Missing functionality should be fixed while redesigning the relevant experience.**

### Principle 9

**The avatar is part of Lumo's identity.**

### Principle 10

**The product should feel calm even when the underlying technology is complex.**

---

# 50. Final Product Mental Model

The final experience should feel like:

```text
                    LUMO
                     │
              ┌──────┴──────┐
              │             │
           TEACHING      INTERACTION
              │             │
              ↓             ↓
        Learning Canvas    Voice
              │             │
              │          Avatar
              │
              ↓
       Visual Teaching
              │
              ↓
      Concepts / Scenes

                     +

                SESSION MEMORY
                     │
              ┌──────┴──────┐
              ↓             ↓
          Timeline       Transcript

                     +

              FOCUSED TOOLS
                     │
                  Ask Lumo

                     +

              PERSONALIZATION
                     │
                 Settings
```

The user should experience all of this as **one continuous environment**.

Not as a collection of pages.

---

# 51. Final Architecture Principle

The most important rule of the Live Tutor architecture is:

> **The student should remain inside the learning experience even when using secondary functionality.**

Opening Ask Lumo should not feel like leaving the lesson.

Opening Transcript should not feel like leaving the lesson.

Opening Timeline should not feel like leaving the lesson.

Changing voice should not feel like leaving the lesson.

The interface may temporarily change state, size, or focus — but the student should always feel:

> **"I'm still inside my Lumo lesson."**

That continuity is the foundation of the Lumo V3 Live Tutor experience.

```

```
````
