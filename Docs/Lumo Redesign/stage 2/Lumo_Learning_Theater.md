# LUMO LEARNING THEATER

**Document:** `LUMO_LEARNING_THEATER.md`  
**Stage:** 2 — Product & Experience Architecture  
**Purpose:** Define the structure, behavior, interaction model, and visual hierarchy of Lumo's core live teaching environment.

---

# 1. Purpose

The Learning Theater is the heart of Lumo.

It is where the student actually learns through:

- AI-guided teaching
- spoken conversation
- visual explanations
- animated diagrams
- interactive demonstrations
- questions
- assessments
- adaptive feedback
- replay
- re-explanation
- real-time interruption

The Learning Theater must NOT feel like:

- a chatbot
- a generic video player
- a dashboard
- a form
- a conventional online classroom
- an AI avatar sitting beside text

It should feel like:

> **A personal intelligent classroom where the lesson responds to the student.**

The theater should communicate that Lumo is actively teaching rather than simply generating content.

---

# 2. Core Philosophy

The Learning Theater follows the learning loop:

```text
Understand
    ↓
Explain
    ↓
Demonstrate
    ↓
Interact
    ↓
Question
    ↓
Evaluate
    ↓
Adapt
    ↓
Continue
```

````

The interface should visually support this loop.

The student should never feel like they have left the lesson simply because the teaching mode changes.

For example:

```text
Teaching
   ↓
Question
   ↓
Practice
   ↓
Feedback
   ↓
Re-explanation
   ↓
Teaching
```

should feel like one continuous experience.

---

# 3. Primary Layout

The default Learning Theater consists of four major areas:

```text
┌──────────────────────────────────────────────────────────┐
│                    SESSION HEADER                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│                                                          │
│                  VISUAL LEARNING STAGE                  │
│                                                          │
│        diagrams / animation / simulation / code          │
│                                                          │
│                              ┌──────────────┐            │
│                              │ AI TUTOR     │            │
│                              │              │            │
│                              └──────────────┘            │
│                                                          │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                 LESSON PROGRESS / CONTEXT                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│              CONVERSATION / VOICE CONTROLS              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

The exact layout may adapt responsively, but the hierarchy should remain consistent.

---

# 4. Visual Learning Stage

The Visual Learning Stage is the primary area of the Theater.

It is the most important visual element on the screen.

It may contain:

- diagrams
- formulas
- charts
- timelines
- maps
- simulations
- scientific illustrations
- 2D animations
- 3D scenes
- code demonstrations
- architecture diagrams
- environmental scenes
- generated visual explanations
- interactive exercises

The visual stage should generally occupy more visual attention than the AI tutor.

The student should think:

> "I'm looking at the concept."

not:

> "I'm watching an avatar talk."

---

# 5. AI Tutor

The AI Tutor acts as the teacher and guide.

The tutor should occupy a relatively smaller area of the Theater.

The tutor's role is to:

- explain
- react
- ask questions
- provide encouragement
- clarify
- acknowledge student responses
- guide attention toward important parts of the visual
- adapt explanations
- respond naturally to interruptions

The tutor should NOT dominate the screen.

The visual lesson is the stage.

The tutor is the guide.

---

# 6. AI Tutor Visual Direction

The tutor should eventually evolve beyond a static image.

The preferred long-term direction is:

```text
AI Tutor
   ↓
expressive character
   ↓
facial movement
   ↓
lip synchronization
   ↓
speech animation
   ↓
subtle gestures
   ↓
contextual expressions
```

Possible implementations may include:

- realistic avatar
- stylized 3D character
- high-quality 2D character
- 3D animated tutor

The specific technology is intentionally NOT locked by this document.

The important requirement is that the tutor should feel like it is actually speaking and reacting.

Avoid:

- static profile images
- frozen avatars
- generic stock characters
- exaggerated cartoon behavior
- unnecessary animation

The tutor's visual personality should remain compatible with Lumo's calm and intelligent brand.

---

# 7. Tutor States

The tutor should visually communicate its current state.

Possible states include:

```text
IDLE
LISTENING
THINKING
SPEAKING
INTERRUPTED
ASSESSING
REPLAYING
ERROR
```

Examples:

### Listening

The tutor subtly acknowledges that it is listening.

```text
● Listening...
```

### Thinking

Use a subtle visual indication.

```text
Tutor is thinking...
```

Avoid generic full-screen loading screens.

### Speaking

The tutor may use:

- lip synchronization
- subtle facial movement
- small gestures
- speech activity indicator

### Interrupted

The tutor should immediately stop its speaking state.

The interface should acknowledge:

> "Got it."

or transition naturally into listening.

---

# 8. Visuals Are Educational, Not Decorative

Every visual should have a pedagogical purpose.

Good:

```text
Teacher explains force
        ↓
force vector appears
        ↓
object moves
        ↓
acceleration changes
```

Bad:

```text
Teacher explains force
        ↓
random particles
        ↓
glowing background
        ↓
decorative 3D object
```

Visual complexity must serve understanding.

---

# 9. Subject-Aware Visuals

The Theater should support different visual languages depending on the subject.

### Physics

Use:

- force vectors
- moving objects
- graphs
- equations
- simulations
- real-world environments

Example:

```text
        F →
    ┌────────┐
    │  ROCK  │
    └────────┘
```

A future 3D implementation could show a real object responding to force.

### Biology

Use:

- cells
- organs
- molecules
- biological processes
- 3D structures
- animated systems

Example:

```text
Cell
 ↓
membrane
 ↓
nucleus
 ↓
organelles
```

### Mathematics

Use:

- geometric construction
- graphs
- coordinate systems
- equations
- transformations
- dynamic visual proofs

### History

Use:

- timelines
- maps
- locations
- historical environments
- event cards
- animated chronology

### Geography

Use:

- maps
- terrain
- climate visualizations
- geographic layers
- spatial relationships

### Programming

Use:

- code
- execution flow
- architecture diagrams
- variable changes
- terminal output
- visual debugging
- data structures

The Theater should make abstract concepts visible.

---

# 10. 2D vs 3D

3D should NOT be used everywhere.

Use 2D when:

- the concept is naturally diagrammatic
- equations are being explained
- a simple flow is sufficient
- a timeline is being taught
- the visual needs maximum clarity

Use 3D when depth materially improves understanding.

Examples:

- solar system
- molecular structures
- human anatomy
- spatial geometry
- mechanical systems
- physical environments
- complex scientific structures
- interactive simulations

Rule:

> **Use 3D because the concept benefits from depth, not because 3D looks impressive.**

---

# 11. Real-World Context

When appropriate, Lumo should connect abstract concepts to real-world examples.

For example:

```text
Concept:
Force

Example:
Pushing a shopping cart

Visual:
Realistic environment
      +
Shopping cart
      +
Force vector
      +
Movement
```

Another example:

```text
Concept:
Friction

Environment:
Road

Object:
Car

Visualization:
Tire → road interaction
```

The environment should be selected because it improves comprehension.

Do not insert environmental backgrounds simply for visual spectacle.

---

# 12. Learning Segments

Lessons should be broken into understandable segments.

A lesson may follow:

```text
INTRODUCTION
      ↓
CONCEPT
      ↓
VISUAL EXPLANATION
      ↓
EXAMPLE
      ↓
STUDENT QUESTION
      ↓
PRACTICE
      ↓
FEEDBACK
      ↓
NEXT CONCEPT
```

The Theater should smoothly transition between these states.

Avoid overwhelming the student with every element simultaneously.

---

# 13. Progressive Visual Disclosure

Visual information should appear when it becomes relevant.

Example:

Instead of showing:

```text
F = ma
mass
acceleration
force vectors
graph
example
definition
formula
notes
```

all at once:

```text
Step 1:
Object

↓

Step 2:
Mass

↓

Step 3:
Force

↓

Step 4:
Acceleration

↓

Step 5:
F = ma
```

This makes the explanation easier to follow.

---

# 14. Speech + Visual Synchronization

Speech and visuals should be synchronized.

When the tutor says:

> "The force is increasing."

the corresponding force vector should change at approximately the same moment.

When the tutor says:

> "The object accelerates."

the object should visually accelerate.

When the tutor explains an equation:

```text
F = ma
```

the relevant variables should be highlighted at the correct moment.

The goal is:

```text
Speech
   +
Visual
   +
Timing
   =
Understanding
```

Remotion should be used where appropriate to choreograph these teaching sequences.

---

# 15. Interactive Playground Mode

One of the most important Theater behaviors is the ability for the Visual Learning Stage to transform into an interactive learning surface.

When Lumo asks a question, the question should NOT simply appear underneath the video.

Instead:

```text
Teaching Mode
      ↓
Question Trigger
      ↓
Visual Stage transforms
      ↓
Interactive Playground
```

The Theater itself becomes the place where the student answers.

---

# 16. Question Mode

The Visual Learning Stage may transform into:

- MCQ interface
- short-answer interface
- long-answer interface
- numerical problem
- interactive diagram
- code exercise
- drag-and-drop interaction
- simulation interaction
- written-answer submission

The transformation should feel like a natural state change of the lesson.

Example:

```text
┌──────────────────────────────────────────────┐
│                                              │
│           WHAT HAPPENS TO CURRENT?           │
│                                              │
│              R ↑                             │
│                                              │
│        A) Increases                          │
│        B) Decreases                          │
│        C) Stays the same                     │
│        D) Cannot determine                   │
│                                              │
└──────────────────────────────────────────────┘
```

The tutor remains available as the guide.

---

# 17. Numerical / Written Practice

For questions requiring substantial calculations or written working, Lumo may provide a dedicated problem image or worksheet-style prompt.

The student can:

1. solve on paper
2. capture the answer
3. submit the image
4. allow the AI evaluation pipeline to inspect it

This supports written-answer practice and prepares students for environments where presentation and working matter.

The interface should clearly communicate:

> "Show your working."

rather than simply asking for the final number.

---

# 18. Feedback Mode

After an answer:

```text
Student Answer
      ↓
Evaluation
      ↓
Feedback
      ↓
Adaptation
```

Correct answers should receive positive reinforcement.

Incorrect answers should not feel punitive.

Avoid:

```text
❌ WRONG
```

Prefer:

```text
Not quite.

Let's look at what happens to resistance first.
```

The Theater should then visually return attention to the relevant concept.

---

# 19. Adaptive Teaching

The Theater should visibly demonstrate that Lumo adapts.

Example:

```text
Student struggles with:
Resistance

        ↓

Lumo detects weakness

        ↓

Lesson adapts

        ↓

Resistance receives
additional explanation

        ↓

New example

        ↓

Re-evaluation
```

The interface may communicate this subtly:

> "Let's strengthen this concept."

or:

> "I think another example might help."

Avoid exposing technical AI reasoning.

The student should experience adaptation naturally.

---

# 20. Conversation

The Theater supports natural conversation.

Student input may arrive through:

- microphone
- text input

Both must enter the same underlying orchestration pipeline.

Conceptually:

```text
Voice
  ↓
STT
  ↓
Conversation Orchestrator
  ↓
Teaching / Assessment / Replay / Adaptation


Text
  ↓
Conversation Orchestrator
  ↓
Teaching / Assessment / Replay / Adaptation
```

The interface should not make voice and text feel like two different products.

---

# 21. Voice Interaction

The primary interaction should eventually feel conversational.

Example:

```text
Tutor:
"Why do you think the car slows down?"

Student:
"Because friction?"

Tutor:
"Exactly. Now let's see what happens
when friction increases."
```

The Theater should support natural back-and-forth rather than rigid question-answer forms.

---

# 22. True Barge-In

The student must be able to interrupt the tutor.

Possible triggers:

- student begins speaking
- Stop button
- explicit interruption

When interruption occurs:

```text
ACTIVE TURN
    ↓
INVALIDATE TURN
    ↓
STOP TTS
    ↓
CLEAR VISUAL TIMERS
    ↓
CLEAR CAPTION TIMERS
    ↓
INVALIDATE STALE VISUAL EVENTS
    ↓
LISTEN TO STUDENT
```

No stale tutor response should continue after interruption.

No "zombie" visual animation should resume after the student has changed the conversation.

---

# 23. Turn Identity

Every active tutor interaction must have a unique `turnId`.

Only the currently valid turn may modify:

- tutor state
- audio
- captions
- visual beats
- lesson state
- UI state

Conceptually:

```text
Turn 42 → active

Student interrupts

Turn 42 → invalid

Turn 43 → active
```

Any late event from Turn 42 must be ignored.

This invariant is critical.

---

# 24. Replay

Replay is different from re-explanation.

### Explain Again

Means:

> Replay the previous teaching segment.

This should use deterministic persisted teaching data where available.

It should NOT unnecessarily invoke an LLM.

```text
Explain Again
      ↓
ReplayService
      ↓
Previous visual + speech payload
```

### Explain Differently

Means:

> Generate a new explanation using the previous concept as context.

```text
Explain Differently
      ↓
TeacherEngine
      ↓
Fresh explanation
```

The UI should clearly distinguish these actions.

---

# 25. Theater Controls

Controls should remain minimal.

Potential controls:

```text
← Exit

Lesson progress

↻ Explain Again

💡 Explain Differently

✋ Stop
```

Additional controls may include:

- voice selection
- speech speed
- captions
- mute
- replay segment
- session pause

Controls should not compete with the learning stage.

---

# 26. Voice Controls

The voice system should eventually support:

- multiple voices
- speech speed
- volume
- language
- voice style where supported
- TTS provider selection internally

Student-facing controls should remain simple.

Example:

```text
Voice
──────
Lumo Voice 01

Speed
──────
0.8×  1×  1.2×  1.5×
```

Do not expose technical provider names unless there is a deliberate product reason.

---

# 27. Caption Behavior

Captions should be optional.

Default:

```text
Captions: OFF
```

When enabled, captions should remain readable and synchronized with speech.

Captions should not simply duplicate the entire visual lesson.

The visual should communicate concepts.

The narration should explain them.

---

# 28. Session Progress

The Theater should provide orientation without becoming a dashboard.

Example:

```text
Physics

Newton's Laws

Concept 3 of 7

Introduction ✓
Force ✓
Mass ✓
Acceleration ●
Practice ○
Quiz ○
```

Progress should answer:

> "Where am I?"

not:

> "How many statistics can I see?"

---

# 29. Session Header

The header should remain visually quiet.

Possible information:

```text
← Physics

Newton's Laws

3 / 7
```

Optional:

- session duration
- pause
- exit
- accessibility
- settings

Avoid large dashboard-style metric displays.

---

# 30. Doubt Solver / Lumo AI

The Learning Theater should provide a small, persistent entry point for additional assistance.

Example:

```text
          ✦ Ask Lumo
```

or:

```text
          ? Ask a doubt
```

Clicking it opens a dedicated doubt-solving interface.

This should NOT destroy the current lesson state.

The student should be able to ask:

- "What does this word mean?"
- "Explain this formula."
- "Why did you use this step?"
- "Give me another example."
- "Explain this in simpler language."

The doubt interface should behave as a contextual assistant.

---

# 31. Lumo AI Model Tiers

The product architecture may eventually expose multiple reasoning tiers.

Conceptually:

```text
Lumo Fast
    ↓
Fast everyday interaction

Lumo Light
    ↓
Balanced everyday reasoning

Lumo Pro
    ↓
Complex reasoning
```

The exact underlying models are an implementation decision.

The student-facing experience should remain consistent.

The system should intelligently allocate expensive reasoning to tasks that actually require it.

---

# 32. AI Work Allocation

Not every interaction requires the most powerful model.

Lightweight models should preferably handle:

- simple conversational responses
- acknowledgements
- basic follow-ups
- simple intent classification
- routine classroom interaction

More capable models should preferably handle:

- lesson planning
- difficult conceptual reasoning
- complex student questions
- adaptive teaching decisions
- scene generation
- visual strategy
- complex assessment generation
- difficult numerical reasoning
- high-value synthesis

This reduces latency and preserves expensive model capacity for tasks where reasoning quality matters.

---

# 33. Loading Behavior

Never use a generic:

```text
Loading...
```

when a meaningful state can be communicated.

Use:

```text
Tutor is thinking...
```

or:

```text
Building your lesson...
```

or:

```text
Preparing the visual...
```

or:

```text
Checking your answer...
```

The interface should communicate what Lumo is doing.

---

# 34. Error Handling

Errors should preserve the learning experience.

Examples:

### TTS failure

The lesson should still provide readable text.

```text
Voice unavailable.

You can continue reading the explanation.
```

### STT failure

Do not corrupt the session.

Allow:

```text
Try again
```

or:

```text
Type your response
```

### Visual asset failure

Fallback to:

- simpler visual
- 2D diagram
- text explanation

Never leave the Theater in a broken visual state.

---

# 35. Empty / Initial State

When a session begins, the Theater should not feel empty.

Example:

```text
┌────────────────────────────────────────────┐
│                                            │
│                                            │
│                Ready?                      │
│                                            │
│        Let's learn Newton's Laws.          │
│                                            │
│              [ Begin Lesson ]              │
│                                            │
└────────────────────────────────────────────┘
```

The beginning should feel like entering a classroom.

---

# 36. Pause / Resume

Pausing a lesson should preserve:

- current concept
- current lesson position
- session memory
- visual state where possible
- assessment state
- conversation context

When resumed:

```text
Welcome back.

We were exploring acceleration.
Let's continue from there.
```

The student should not feel like they are starting over.

---

# 37. Responsive Behavior

Desktop is the primary showcase environment for the Learning Theater.

However, the experience must remain usable on smaller screens.

### Desktop

```text
Large visual stage
+
Tutor
+
controls
```

### Tablet

```text
Visual stage
      ↓
Tutor
      ↓
Controls
```

### Mobile

Prioritize:

1. visual lesson
2. tutor state
3. conversation
4. essential controls

Avoid shrinking the entire desktop layout into a tiny screen.

The Theater should recompose rather than merely scale.

---

# 38. Visual Hierarchy

The hierarchy should generally be:

```text
1. Current learning concept
        ↓
2. Visual explanation
        ↓
3. Tutor
        ↓
4. Student interaction
        ↓
5. Progress
        ↓
6. Secondary controls
```

Do not allow:

- navigation
- analytics
- decorative elements
- settings
- branding
- secondary cards

to overpower the concept being taught.

---

# 39. Motion in the Theater

Motion should communicate learning state.

Good examples:

- diagram drawing
- equation transformation
- object movement
- graph animation
- timeline progression
- visual highlighting
- tutor speech animation
- state transitions
- question transformation

Avoid:

- random floating elements
- excessive particles
- unnecessary parallax
- constant background animation
- animation simply because it looks impressive

Motion must have a reason.

---

# 40. Cinematic Moments

The Theater may occasionally use high-quality cinematic transitions.

Examples:

```text
Solar system appears
        ↓
camera moves toward Earth
        ↓
zoom into atmosphere
        ↓
concept begins
```

or:

```text
City environment
        ↓
car begins moving
        ↓
friction increases
        ↓
car slows
        ↓
formula appears
```

These moments should be used selectively.

They are highlights, not constant decoration.

---

# 41. Interactive 3D Future Direction

The Theater should be architected so that interactive 3D can be introduced where appropriate.

Potential use cases:

- solar system
- molecular structures
- anatomy
- mechanical systems
- 3D geometry
- physics simulations
- spatial concepts

Possible technologies include:

- React Three Fiber
- Three.js
- WebGL
- other browser-compatible 3D technologies

Technology choice should be made per use case.

Do NOT make the entire application dependent on 3D.

---

# 42. Asset Library

Lumo should eventually develop a reusable visual asset library.

Possible assets:

```text
Human figures
Animals
Vehicles
Buildings
Nature
Scientific objects
Laboratory objects
Classroom objects
Machines
Geometric objects
Maps
Icons
Environment components
```

Assets should be reusable across lessons.

For example:

```text
Shopping cart
   ↓
Physics
   ↓
Force

Shopping cart
   ↓
Math
   ↓
Distance / speed

Shopping cart
   ↓
Economics
   ↓
Cost / quantity
```

The goal is to build a scalable visual vocabulary.

---

# 43. Asset Quality

Assets should feel coherent.

Avoid combining:

```text
realistic human
+
flat cartoon car
+
random stock background
+
generic 3D object
```

unless intentionally designed as a coherent style.

The asset library should maintain consistency in:

- lighting
- proportions
- rendering style
- color treatment
- perspective
- visual detail
- animation behavior

---

# 44. Theater as a State Machine

The UI should conceptually behave as a state machine.

Example:

```text
IDLE
 ↓
LISTENING
 ↓
THINKING
 ↓
SPEAKING
 ↓
VISUAL_BEAT
 ↓
LISTENING
```

Or:

```text
SPEAKING
 ↓
QUESTION
 ↓
ASSESSMENT
 ↓
EVALUATION
 ↓
FEEDBACK
 ↓
ADAPTATION
 ↓
SPEAKING
```

Interruption can occur from almost any active state:

```text
ANY ACTIVE STATE
        ↓
    INTERRUPTED
        ↓
    LISTENING
```

The implementation must prevent invalid state transitions.

---

# 45. Theater Event Flow

A typical interaction:

```text
Student speaks
      ↓
STT
      ↓
Student input finalized
      ↓
Intent classification
      ↓
Context construction
      ↓
Route request
      ↓
Teacher / Assessment / Replay
      ↓
Teaching content generated
      ↓
Visual strategy
      ↓
Speech generation
      ↓
Tutor speaks
      ↓
Visual beats execute
      ↓
Session memory updated
      ↓
Student interaction
```

Every stage should remain synchronized through the active `turnId`.

---

# 46. Core Theater Invariants

These are non-negotiable.

### Invariant 1

Voice and text must use the same orchestration pipeline.

### Invariant 2

Only one active tutor turn may control a session.

### Invariant 3

Student interruption invalidates the current turn.

### Invariant 4

Replay must not require unnecessary LLM generation.

### Invariant 5

"Explain differently" must generate a genuinely new explanation.

### Invariant 6

Assessment answers must remain isolated from ordinary teaching turns.

### Invariant 7

Assessment failure may trigger adaptive teaching.

### Invariant 8

Late visual events from invalid turns must be ignored.

### Invariant 9

A voice failure must not destroy the learning session.

### Invariant 10

A visual failure must have a graceful fallback.

---

# 47. What the Theater Must NOT Become

Avoid turning the Theater into:

### A chatbot

```text
User message
AI message
User message
AI message
```

The lesson should remain visually driven.

### A video player

```text
Play
Pause
Timeline
Transcript
```

The lesson should remain interactive.

### A dashboard

```text
Score
Stats
Cards
Metrics
```

The lesson should remain focused.

### An avatar demo

```text
Talking head
+
text
```

The visual lesson must remain the hero.

### A game

Do not overload the Theater with:

- XP
- coins
- streaks
- rewards
- badges
- confetti

Learning comes first.

---

# 48. The Signature Lumo Experience

The ideal experience should look something like:

```text
Student:
"Teach me Newton's second law."

              ↓

Lumo:
"Sure. Let's start with something
you already know."

              ↓

VISUAL STAGE

Shopping cart appears.

              ↓

Tutor explains.

              ↓

Force vector animates.

              ↓

Mass changes.

              ↓

Acceleration changes.

              ↓

Tutor asks:

"What happens if we double the mass?"

              ↓

VISUAL STAGE TRANSFORMS

Interactive question appears.

              ↓

Student answers.

              ↓

Lumo evaluates.

              ↓

Student struggles.

              ↓

Lumo notices the misconception.

              ↓

"Let's look at this differently."

              ↓

New visual explanation.

              ↓

Different example.

              ↓

Student answers again.

              ↓

Concept strengthens.

              ↓

Lesson continues.
```

That is the experience Lumo should ultimately deliver.

---

# 49. Design Principle

The Learning Theater should always answer three questions:

### Where am I?

Current lesson and concept.

### What am I learning?

The visual teaching stage.

### What should I do next?

The current interaction.

If the interface makes these three things obvious, the Theater remains understandable even as the underlying AI system becomes extremely sophisticated.

---

# 50. Final Definition

The Lumo Learning Theater is:

> **A real-time, adaptive teaching environment where the AI tutor, visual lesson, conversation, assessment, and student interaction operate as one continuous learning experience.**

The visual stage is the classroom.

The AI tutor is the teacher.

The student is an active participant.

The AI adapts the lesson in real time.

The interface should make that intelligence visible without overwhelming the student.

**Lumo should not feel like an AI sitting inside an educational website.**

It should feel like:

> **the classroom itself has become intelligent.**

```

```
````
