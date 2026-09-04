# LUMO_LIVE_THEATER_SPEC.md

> Product Specification — Stage 3.4
>
> The Live Theater is Lumo's primary teaching environment and the central
> demonstration surface of the product.
>
> It must feel like an intelligent, interactive classroom rather than a
> conventional video player, chatbot, or dashboard.

---

# 1. PURPOSE

The Live Theater is where Lumo actually teaches.

A student enters the Theater to experience:

1. AI-guided teaching
2. Natural voice conversation
3. Synchronized visual explanations
4. Interactive diagrams and simulations
5. Context-aware questioning
6. Adaptive explanations
7. Assessment moments
8. Student interruption and follow-up
9. Document/RAG-grounded teaching
10. Session progress and mastery

The Theater must demonstrate Lumo's core proposition:

> Lumo does not merely tell students information.
> Lumo teaches concepts through coordinated explanation, visualization,
> interaction, questioning, feedback and adaptation.

The Theater is therefore the highest-priority page for visual polish,
interaction quality and demo reliability.

---

# 2. CORE EXPERIENCE

The fundamental teaching loop is:

```text
UNDERSTAND
    ↓
PLAN
    ↓
EXPLAIN
    ↓
DEMONSTRATE
    ↓
QUESTION
    ↓
EVALUATE
    ↓
ADAPT
    ↓
CONTINUE
```

````

The interface should visually support this loop.

The student should never feel that:

- the AI is simply generating text
- the video is playing independently
- the visual is unrelated to narration
- the question is a separate page
- assessment is disconnected from teaching
- the tutor is merely an avatar

Everything should feel like one continuous classroom.

---

# 3. THEATER PRIORITY

The Theater is the most important product surface.

Priority order:

```text
1. Teaching quality
2. Visual explanation quality
3. Voice/conversation quality
4. Interaction quality
5. Question/assessment integration
6. AI choreography
7. Visual polish
8. Secondary metadata
```

Do not sacrifice teaching clarity for decorative UI.

The Theater must remain:

- calm
- focused
- cinematic
- interactive
- intelligent
- visually impressive
- easy to understand

---

# 4. PRE-SESSION CONFIGURATION

Before teaching begins, the student enters a lightweight configuration state.

The goal is:

> "Tell Lumo how you want to learn."

Not:

> "Configure a complicated AI system."

---

## 4.1 Topic

Allow the student to specify:

- subject
- topic
- chapter
- concept
- free-form learning request

Examples:

```text
Explain Newton's Laws

Teach me photosynthesis

Help me understand quadratic equations

Teach me linked lists

Explain the solar system
```

---

# 4.2 Document / RAG SOURCE

The Theater must support document-based teaching directly.

The student should NOT be forced to navigate to a separate document page
before starting a lesson.

Provide:

```text
Learning source

[ Upload a document ]

or

[ Select from your documents ▾ ]
```

Existing documents should be selectable.

Example:

```text
Select source

○ No document
○ NCERT Physics Class 9
○ My Biology Notes
○ Operating Systems.pdf
○ Mathematics Chapter 4.pdf
```

If a document is selected:

```text
Topic:
[ Newton's Laws ]

Source:
[ NCERT Physics Class 9 ▾ ]

[ Start learning ]
```

The selected document should automatically become available to the
RAG pipeline.

---

## 4.3 Teaching Mode

Keep the initial MVP selection simple.

Suggested options:

```text
Learn
Practice
Revise
```

The default should be:

```text
Learn
```

Additional modes can be added later.

---

# 5. VOICE CONFIGURATION

Voice settings should be available BEFORE the session begins.

The student should be able to configure:

### Voice

Example:

```text
Voice

○ Lumo — Warm
○ Lumo — Clear
○ Lumo — Energetic
○ Lumo — Calm
```

The implementation may map these profiles to available TTS voices.

The UI should not expose technical provider names unless necessary.

Do not show:

```text
Kokoro
ElevenLabs
Gemini TTS
Provider X
```

The student cares about the experience, not the infrastructure.

---

## 5.1 Narration speed

Provide an easy control:

```text
Narration speed

0.75×   1×   1.25×   1.5×
```

Default:

```text
1×
```

The system should remember the student's selection for the session.

---

## 5.2 Voice preview

Where technically feasible:

```text
▶ Preview voice
```

The student should be able to hear a short sample before starting.

---

# 6. CAPTION CONFIGURATION

Allow:

```text
Captions
[ OFF / ON ]
```

Default:

```text
OFF
```

Captions should never become a giant transcript covering the visual stage.

If enabled, captions should:

- remain compact
- be readable
- avoid blocking important visuals
- synchronize with narration
- support accessibility

---

# 7. START EXPERIENCE

The transition from configuration into Theater should feel intentional.

Suggested sequence:

```text
Configuration
      ↓
Preparing lesson
      ↓
Planning visual experience
      ↓
Theater opens
      ↓
Tutor begins teaching
```

Avoid long generic loading screens.

Instead communicate useful state:

```text
Preparing your lesson…

Building the explanation
Preparing visual demonstrations
Setting up your learning path
```

If preparation takes time, progressively reveal readiness.

---

# 8. THEATER LAYOUT

The Theater should prioritize the visual lesson stage.

Conceptual layout:

```text
┌─────────────────────────────────────────────────────────────┐
│ ← Physics                     Newton's Laws        ⋯        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                                                             │
│                  VISUAL LESSON STAGE                        │
│                                                             │
│                                                             │
│              diagrams / animation / simulation              │
│                                                             │
│                                         ┌──────────────┐    │
│                                         │              │    │
│                                         │  AI TUTOR    │    │
│                                         │              │    │
│                                         └──────────────┘    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Introduction ─── Force ─── Mass ─── Acceleration ─── Quiz │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│        🎙 Talk to Lumo                         Ask Lumo AI  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

This is conceptual.

Actual implementation should adapt based on viewport size.

---

# 9. VISUAL STAGE

The visual stage is the HERO of the Theater.

The visual should receive more visual prominence than the AI tutor.

The student should primarily look at:

> what is being taught

not:

> who is speaking

---

# 10. TUTOR PLACEMENT

The tutor should occupy a smaller area of the Theater.

The tutor exists to provide:

- human presence
- facial expression
- lip synchronization
- conversational feedback
- teaching presence

The tutor should NOT dominate the screen.

Suggested desktop proportion:

```text
Visual Stage: ~75–85%

Tutor: ~15–25%
```

Possible implementations:

### Floating tutor

```text
                  VISUAL
        ┌───────────────────────┐
        │                       │
        │      F = ma           │
        │                       │
        │   ● ─────────────→    │
        │                       │
        └───────────────────────┘

                         ┌───────┐
                         │ TUTOR │
                         └───────┘
```

### Integrated tutor panel

```text
┌───────────────────────────────┬──────────┐
│                               │          │
│       VISUAL STAGE            │  TUTOR   │
│                               │          │
│                               │          │
└───────────────────────────────┴──────────┘
```

The floating approach is preferred for cinematic lessons when space allows.

---

# 11. AI TUTOR VISUAL DIRECTION

The tutor should eventually evolve beyond the current basic avatar.

Target direction:

> expressive, believable, responsive digital teacher

The tutor should support:

- lip synchronization
- facial expressions
- eye movement
- subtle head movement
- listening state
- speaking state
- thinking state
- encouraging state
- confused/concerned state when appropriate
- celebration/positive feedback
- idle state

The tutor should feel like it is participating in the lesson.

It must NOT look like:

- a static image
- a talking PNG
- a generic AI avatar pasted over the lesson
- an unrelated stock character

The tutor is part of the teaching choreography.

---

# 12. TUTOR STATES

Minimum states:

```text
IDLE
LISTENING
THINKING
SPEAKING
ENCOURAGING
CORRECTING
CELEBRATING
INTERRUPTED
ERROR
```

Example:

### LISTENING

Student is speaking.

Tutor:

- stops narration
- looks/listens toward student interaction
- remains visually attentive

### THINKING

Tutor is processing a request.

Show subtle activity.

Avoid:

```text
Loading...
```

Prefer:

```text
Lumo is thinking…
```

### SPEAKING

Tutor:

- lip sync active
- expression matched to narration
- visual lesson synchronized

---

# 13. LESSON VISUAL STATES

The visual stage should support multiple visual types.

Possible states:

```text
INTRO
EXPLANATION
DIAGRAM
FORMULA
ANIMATION
SIMULATION
TIMELINE
MAP
CODE
CHART
COMPARISON
EXAMPLE
QUESTION
INTERACTIVE
FEEDBACK
SUMMARY
```

The AI should choose the appropriate representation based on the concept.

---

# 14. VISUAL MEDIUM SELECTION

The orchestration system should NOT default to one visual technology.

It should choose based on teaching need.

Decision framework:

```text
Simple explanation
        ↓
2D visual / typography / shapes

Scientific diagram
        ↓
2D structured diagram

Dynamic process
        ↓
Remotion animation

Interactive scientific model
        ↓
React Three Fiber / Three.js

3D object exploration
        ↓
React Three Fiber / Three.js

Code explanation
        ↓
Code visualization

Geographical concept
        ↓
Map / 2D visual

Historical sequence
        ↓
Timeline / scene composition
```

Technology must serve pedagogy.

Do not use 3D merely because it looks impressive.

---

# 15. REMOTION INTEGRATION

Remotion is the primary system for deterministic cinematic lesson sequences.

Use Remotion for:

- animated equations
- transitions
- timelines
- concept sequences
- diagrams
- visual storytelling
- synchronized captions
- formula construction
- step-by-step explanations
- subject-aware animated scenes

The lesson plan should define:

```text
scene
duration
narration
visual state
visual parameters
transition
emphasis
question trigger
```

---

# 16. REACT THREE FIBER / THREE.JS INTEGRATION

R3F/Three.js should be used selectively.

Ideal cases:

### Biology

```text
Cell
    ↓
3D cell model
    ↓
Organelles highlighted
    ↓
Membrane interaction
```

### Astronomy

```text
Solar system
    ↓
Orbit visualization
    ↓
Planet selection
    ↓
Scale/comparison
```

### Physics

```text
Forces
Motion
Projectile trajectories
Optics
Mechanics
```

### Chemistry

```text
Molecules
Atomic structure
Bonding
Molecular geometry
```

### Engineering / CS

```text
3D systems
Architecture
Networks
Hardware
Data structures where spatial representation helps
```

The system should have a reusable 3D asset/component library.

---

# 17. ASSET LIBRARY

Lumo should gradually build a reusable visual asset library.

Potential asset categories:

```text
Human figures
Vehicles
Buildings
Trees
Roads
Rocks
Tables
Chairs
Machines
Planets
Cells
Atoms
Molecules
Laboratory objects
Geometric shapes
Charts
Arrows
Vectors
UI elements
Code blocks
Mathematical symbols
```

Assets should be:

- stylistically consistent
- reusable
- parameterizable
- lightweight where possible
- easy for the orchestration layer to invoke

The asset library is a long-term differentiator.

---

# 18. AI CHOREOGRAPHY

This is one of the most important architectural requirements.

The AI should not merely generate:

```text
explanation text
```

It should generate a structured teaching plan.

Conceptually:

```text
TeachingPlan
│
├── objective
├── concept
├── explanation
├── narration
├── visual strategy
├── visual scenes
├── timing
├── emphasis points
├── examples
├── questions
├── expected responses
├── assessment moments
└── adaptation rules
```

The orchestration layer then executes this plan.

---

# 19. CHOREOGRAPHY EXAMPLE

Student:

> "Explain Newton's second law."

AI planning:

```text
1. Introduce force
2. Show object
3. Introduce acceleration
4. Introduce mass
5. Construct F = ma
6. Demonstrate with shopping cart
7. Ask conceptual question
8. Evaluate response
9. Adapt if necessary
10. Continue
```

The Theater executes these beats.

---

# 20. VISUAL/NARRATION SYNCHRONIZATION

Narration and visuals must be synchronized.

Example:

Narration:

> "When force increases..."

Visual:

```text
Force vector
     →
     →
     →→→
```

Then:

Narration:

> "...the acceleration increases."

Visual:

```text
Object
● → → → →
```

The visual change should happen at the appropriate narration beat.

Do not play a generic animation underneath unrelated narration.

---

# 21. BEAT-BASED EXECUTION

Lessons should be represented as discrete teaching beats.

Example:

```text
Beat 1
INTRODUCTION

Beat 2
OBJECT APPEARS

Beat 3
FORCE VECTOR APPEARS

Beat 4
MASS LABEL APPEARS

Beat 5
EQUATION BUILDS

Beat 6
REAL-WORLD EXAMPLE

Beat 7
QUESTION
```

Each beat should have:

```text
turnId
sceneId
timestamp
visualAction
narrationSegment
state
```

This allows precise synchronization and interruption.

---

# 22. TURN IDENTITY

Every teaching interaction must retain turn identity.

Example:

```text
turn_session123_g8_abc
```

If the student interrupts:

```text
Current turn → INVALID
New turn → CREATED
```

Old visual events must not mutate the Theater.

This prevents zombie visual updates.

---

# 23. BARGE-IN

Barge-in is a first-class interaction.

When the student begins speaking:

```text
Student speaks
      ↓
Stop TTS
      ↓
Cancel active narration
      ↓
Cancel pending visual beats
      ↓
Invalidate current turn
      ↓
Capture student input
      ↓
Process new turn
```

The transition must feel immediate.

Never allow the old tutor to continue speaking over the student.

---

# 24. MANUAL STOP

Provide a visible control:

```text
✋ Stop
```

When pressed:

- cancel browser TTS
- cancel active playback
- invalidate current turn
- stop scheduled visual events
- preserve session state
- keep transcript intact
- return Theater to an idle/listening state

---

# 25. THEATER CONTROLS

During a session, controls should include:

```text
Pause
Stop
Microphone
Captions
Replay
Explain differently
```

Potential secondary controls:

```text
Voice
Narration speed
Volume
Fullscreen
```

Do not permanently display every control.

Use progressive disclosure where appropriate.

---

# 26. SESSION PAUSE

Pause should suspend teaching without destroying state.

Pause should:

- stop narration
- stop visual progression
- preserve current scene
- preserve current turn
- preserve learning state

Resume should continue from the appropriate point.

---

# 27. MICROPHONE

Microphone states:

```text
OFF
READY
LISTENING
PROCESSING
ERROR
```

Visual feedback should be obvious but subtle.

Example:

```text
🎙 Listening…
```

The microphone must never silently remain active.

---

# 28. CAPTIONS

Captions should:

- synchronize with narration
- remain readable
- avoid covering key diagrams
- be optional
- support accessibility

Default:

```text
OFF
```

When ON:

```text
┌───────────────────────────────┐
│        Visual Stage           │
│                               │
│                               │
│  "Force causes acceleration"  │
└───────────────────────────────┘
```

Captions should not duplicate every visual label unnecessarily.

---

# 29. QUESTION TRANSFORMATION

Questions should NOT simply appear underneath the video.

When Lumo decides it is time to check understanding:

```text
Teaching
   ↓
Question trigger
   ↓
Visual stage transforms
   ↓
Interactive playground
```

The lesson itself becomes the question environment.

This is a core Theater interaction.

---

# 30. INTERACTIVE PLAYGROUND

Example:

Lumo teaches:

```text
Ohm's Law
V = IR
```

Then asks:

> "What happens to current if resistance doubles?"

The visual stage transforms:

```text
┌───────────────────────────────────────────┐
│                                           │
│             V = IR                        │
│                                           │
│        R = 2Ω                             │
│        V = 10V                            │
│                                           │
│        What is I?                         │
│                                           │
│        ○ 2A                               │
│        ○ 5A                               │
│        ○ 10A                              │
│        ○ 20A                              │
│                                           │
└───────────────────────────────────────────┘
```

After answering:

```text
Evaluation
    ↓
Feedback
    ↓
Visual explanation
    ↓
Continue lesson
```

The Theater should smoothly return to teaching.

---

# 31. SUPPORTED QUESTION TYPES

The Theater must support:

### MCQ

Interactive options.

### Short answer

Text input.

### Long answer

Expanded text input.

### Numerical

Numeric input.

### Heavy numerical / written solution

Student may be instructed:

> Solve this on paper and upload a clear image of your solution.

The uploaded image is evaluated.

This supports practice for written examinations.

---

# 32. WRITTEN ANSWER EVALUATION

For image-based numerical answers:

The system should evaluate:

- correctness
- intermediate steps
- formula usage
- final answer
- readability
- clarity

Poor handwriting/readability may result in uncertainty.

The interface should communicate this constructively.

Avoid:

```text
WRONG
```

Prefer:

```text
I can read most of your solution, but step 3 is unclear.
Let's check that step together.
```

---

# 33. ASSESSMENT DURING TEACHING

Assessment moments should feel like natural teaching checkpoints.

Examples:

```text
Quick check
Let's see if this makes sense.

Try this
Your turn.

Think about it
What would happen if…?
```

Avoid making every question feel like an exam.

The purpose is understanding detection.

---

# 34. ADAPTIVE FEEDBACK

After a student response:

### Correct

```text
✓ Exactly.

You've got the idea.
```

Then continue.

### Partially correct

```text
You're close.

You identified the relationship correctly,
but let's revisit the second step.
```

### Incorrect

```text
Not quite.

Let's look at what happens to the force first.
```

The AI should decide whether to:

- continue
- clarify
- re-explain
- provide another example
- lower difficulty
- ask a simpler question
- revisit the concept

---

# 35. RE-EXPLANATION

The student may request:

```text
Explain again
Explain differently
Give me an example
Show me visually
Why?
```

These requests should remain inside the Theater.

The student should not be pushed to another page.

---

# 36. DETERMINISTIC REPLAY

"Explain that again" should use deterministic replay whenever appropriate.

Replay:

- previously generated narration
- previously generated visual payload
- same teaching segment
- same conceptual sequence

No unnecessary LLM generation.

This improves:

- latency
- reliability
- consistency
- API usage

---

# 37. EXPLAIN DIFFERENTLY

"Explain differently" should produce a new pedagogical strategy.

Example:

Original:

```text
Mathematical explanation
```

Alternative:

```text
Real-world analogy
```

or:

```text
Visual explanation
```

or:

```text
Step-by-step derivation
```

The concept remains the same.

---

# 38. LUMO AI / DOUBT SOLVER

The Theater should contain a compact entry point:

```text
Ask Lumo AI
```

This opens a focused contextual AI interface.

It should feel similar to a modern AI assistant rather than a traditional support popup.

---

# 39. LUMO AI INTERFACE

Conceptually:

```text
┌──────────────────────────────────────┐
│ Ask Lumo                         ×   │
├──────────────────────────────────────┤
│                                      │
│ Context                              │
│ Newton's Laws                        │
│                                      │
│ Lumo                                  │
│ "Sure — let's break that down."      │
│                                      │
│                                      │
│ [ Ask a follow-up…              ] ↑  │
│                                      │
│ Model: Lumo Fast ▾                   │
└──────────────────────────────────────┘
```

The interface should be compact and focused.

---

# 40. MODEL SELECTION

Expose friendly model tiers rather than raw provider/model names.

Suggested:

```text
Lumo Fast
Lumo Light
Lumo Pro
```

Conceptual purpose:

### Lumo Fast

For:

- simple questions
- conversational follow-ups
- quick clarifications
- low-latency interactions

### Lumo Light

For:

- normal tutoring interactions
- moderate reasoning
- routine explanations

### Lumo Pro

For:

- complex reasoning
- difficult problems
- deeper explanations
- advanced planning

The underlying model/provider mapping is an implementation detail.

---

# 41. CONTEXT-AWARE LUMO AI

The doubt solver should understand:

- current subject
- current topic
- current lesson
- current concept
- selected document
- recent teaching turns
- student progress
- current visual
- current assessment state

Example:

Student asks:

> "Why did you divide by R?"

Lumo should understand what "you" and "R" refer to without requiring the
student to restate the entire problem.

---

# 42. MULTI-MODAL DOUBT SOLVING

Future capability may include:

- text
- voice
- image
- handwritten solution
- screenshot

The Theater architecture should not prevent this.

---

# 43. DOCUMENT-AWARE TEACHING

If a document is selected:

```text
Document
   ↓
RAG retrieval
   ↓
Relevant context
   ↓
Teacher Engine
   ↓
Teaching Plan
   ↓
Visual Strategy
   ↓
Theater
```

The Theater should make document grounding subtly visible.

Example:

```text
Based on your uploaded chapter
```

Do not expose technical RAG terminology to normal students.

---

# 44. DEMO-CRITICAL VISUAL SCENARIOS

The system does NOT need to support every subject perfectly before demo.

Instead, prioritize polished representative scenarios.

Minimum target demo set:

```text
BIOLOGY
Interactive 3D cell

PHYSICS
Force / motion / Newton's Laws simulation

CHEMISTRY
Molecule / atomic / bonding visualization

MATHEMATICS
Animated equation / geometric visualization

ASTRONOMY
Interactive solar-system visualization

COMPUTER SCIENCE
Code + execution / architecture visualization
```

Each scenario should be polished enough to demonstrate the concept
convincingly.

The goal is breadth of demonstrated capability, not hundreds of mediocre
templates.

---

# 45. BIOLOGY DEMO

Target:

```text
Cell
```

Potential sequence:

```text
Cell appears
    ↓
Membrane highlighted
    ↓
Nucleus highlighted
    ↓
Mitochondria highlighted
    ↓
Organelles explained
    ↓
Student interaction
    ↓
Question
```

R3F/Three.js is appropriate.

---

# 46. PHYSICS DEMO

Target:

```text
Newton's Laws / Force
```

Potential sequence:

```text
Object appears
    ↓
Force applied
    ↓
Vector appears
    ↓
Mass changes
    ↓
Acceleration changes
    ↓
F = ma constructed
    ↓
Student changes parameters
```

R3F or high-quality 2D animation may be used depending on the scene.

---

# 47. CHEMISTRY DEMO

Target:

```text
Molecules / bonding
```

Potential sequence:

```text
Atoms appear
    ↓
Electron interaction
    ↓
Bond forms
    ↓
Molecule rotates
    ↓
Structure explained
```

3D visualization is strongly encouraged where pedagogically useful.

---

# 48. MATHEMATICS DEMO

Target:

```text
Equation / geometry
```

Potential sequence:

```text
Problem
    ↓
Step 1
    ↓
Step 2
    ↓
Transformation
    ↓
Final result
```

Motion should communicate mathematical relationships.

---

# 49. ASTRONOMY DEMO

Target:

```text
Solar system
```

Potential sequence:

```text
Solar system overview
    ↓
Planet focus
    ↓
Orbit animation
    ↓
Scale/comparison
    ↓
Interactive question
```

3D visualization can be used.

---

# 50. COMPUTER SCIENCE DEMO

Target:

```text
Code + execution
```

Potential sequence:

```text
Code appears
    ↓
Relevant lines highlighted
    ↓
Execution visualized
    ↓
Output changes
    ↓
Student predicts output
    ↓
System evaluates
```

This demonstrates that Lumo is not limited to traditional school science.

---

# 51. SESSION PROGRESS

The Theater may display lightweight progress.

Example:

```text
Newton's Laws

Introduction ✓
Force ✓
Mass ✓
Acceleration ◐
Practice ○
Summary ○
```

Avoid turning the Theater into a dashboard.

Progress should remain secondary to the lesson.

---

# 52. SESSION COMPLETION

At the end of a session:

```text
Lesson complete

Newton's Laws

✓ Force
✓ Mass
✓ Acceleration

You practiced:
2 questions

Strongest concept:
Force

Worth revisiting:
Acceleration

[ Continue learning ]
[ Practice this topic ]
[ Back to Learning Home ]
```

The completion state should feel rewarding but restrained.

---

# 53. ADAPTIVE NEXT STEP

The system should recommend a meaningful next action.

Examples:

```text
You're ready for the next concept.

[ Continue → ]
```

or:

```text
Acceleration needs a little more practice.

[ Practice again ]
```

The recommendation should come from learning state rather than arbitrary
UI logic.

---

# 54. ERROR STATES

Errors should preserve learning continuity wherever possible.

---

## AI provider failure

If primary provider fails:

```text
Fallback provider
      ↓
Continue session
```

The student should ideally never know.

---

## TTS failure

If audio fails:

```text
Visual lesson continues.

Narration unavailable right now.
You can continue with captions or text.
```

Transcript must remain available.

---

## STT failure

If speech recognition fails:

```text
I couldn't hear that clearly.

Try again or type your answer.
```

Do not destroy session state.

---

## Visual failure

If a visual asset fails:

```text
Fallback visual representation
```

The teaching explanation should continue.

---

## R3F/3D failure

Fallback to:

```text
2D representation
```

Never allow a 3D rendering failure to destroy the entire lesson.

---

# 55. NETWORK INTERRUPTION

The Theater should distinguish:

```text
Temporary connection issue
```

from:

```text
Session failure
```

Where possible:

- preserve state locally
- preserve transcript
- retry operations
- avoid duplicate turns
- prevent duplicated narration

---

# 56. MOBILE / SMALL SCREEN

The Theater must remain functional on smaller screens.

Priority:

```text
Visual stage
    ↓
Tutor
    ↓
Interaction
    ↓
Controls
```

On mobile:

- tutor may become smaller
- controls may move to bottom sheet
- secondary metadata should disappear
- progress can collapse
- Lumo AI opens as a full-screen sheet

Do not squeeze the desktop layout into mobile.

---

# 57. TABLET

Tablet should support:

```text
Visual stage
Tutor overlay
Bottom controls
```

Use responsive layout rather than fixed dimensions.

---

# 58. DESKTOP

Desktop is the primary demo target.

Take advantage of:

- large visual stage
- cinematic compositions
- tutor overlay
- rich 2D/3D visuals
- contextual controls

The desktop Theater should feel like a premium learning studio.

---

# 59. FULLSCREEN

The Theater should support fullscreen mode.

Fullscreen should remove unnecessary application chrome.

Example:

```text
┌──────────────────────────────────────────────┐
│                                              │
│              LESSON VISUAL                   │
│                                              │
│                                              │
│                             TUTOR            │
│                                              │
│                                              │
│   controls                                  │
└──────────────────────────────────────────────┘
```

This is especially important for demo recordings.

---

# 60. VISUAL LANGUAGE

The Theater must follow the Lumo Design System.

Use:

- fruity light theme
- premium dark theme
- soft geometry
- clean typography
- restrained shadows
- high-quality illustrations
- intentional motion
- strong negative space

Avoid:

- generic AI gradients
- excessive glassmorphism
- neon cyberpunk styling
- excessive floating cards
- dashboard-like layouts
- decorative animation with no teaching purpose

---

# 61. MOTION

Motion should communicate:

- causality
- sequence
- emphasis
- transition
- state
- interaction

Examples:

```text
Equation builds progressively
Vector moves toward object
Cell organelle highlights
Timeline progresses
Code executes line-by-line
```

Avoid:

```text
Random particles
Constant floating animations
Unnecessary bouncing
Large decorative transitions
```

---

# 62. CINEMATIC TRANSITIONS

Transitions between lesson beats should feel polished.

Possible techniques:

- fade
- morph
- camera movement
- spatial transition
- scale
- crossfade
- object continuity

The transition should preserve conceptual continuity.

Example:

```text
Object
   ↓
Force vector
   ↓
Equation
```

The same object should remain visually meaningful where possible.

---

# 63. TEACHER ↔ VISUAL RELATIONSHIP

The tutor should react to the visual.

For example:

Tutor says:

> "Look at the mitochondria here."

At that moment:

```text
3D cell
      ↓
Mitochondria highlight
      ↓
Tutor gestures / expression changes
```

The visual and tutor should feel coordinated.

---

# 64. QUESTION TRANSITION

The transition into a question should be visually obvious.

Example:

```text
Teaching
   ↓
Tutor pauses
   ↓
Visual settles
   ↓
"Your turn"
   ↓
Interactive playground appears
```

This should feel like a natural classroom checkpoint.

---

# 65. ANSWER TRANSITION

After the answer:

```text
Answer submitted
      ↓
Evaluation
      ↓
Feedback
      ↓
Visual explanation
      ↓
Teaching resumes
```

Avoid navigating to a separate assessment page.

---

# 66. ORCHESTRATION RESPONSIBILITIES

The Theater UI should NOT decide teaching logic.

The backend orchestration layer owns:

- intent
- turn identity
- teaching plan
- visual strategy
- assessment timing
- adaptation
- context
- model routing

The client owns:

- rendering
- playback
- interaction
- controls
- microphone
- local UI state
- visual execution
- interruption handling

---

# 67. MODEL ROUTING PRINCIPLE

Different AI tasks should use different model tiers where appropriate.

Do NOT send every student utterance through the most expensive/heaviest
reasoning model.

Conceptually:

```text
Student utterance
        ↓
Intent classification
        ↓
┌───────────────────────────────┐
│ Simple / conversational       │ → Fast model
│ Normal teaching interaction   │ → Light model
│ Complex reasoning             │ → Pro model
│ Lesson planning               │ → Pro/heavy model
│ Visual choreography           │ → Pro/heavy model
│ Assessment planning           │ → Pro/heavy model
└───────────────────────────────┘
```

The exact provider/model mapping belongs in:

`LUMO_AI_ORCHESTRATION.md`

---

# 68. HIGH-REASONING TASKS

Reserve stronger models for tasks such as:

- lesson planning
- complex reasoning
- visual choreography
- multi-step problem solving
- difficult assessment generation
- misconception analysis
- complex RAG synthesis
- scene planning
- advanced visual strategy

Do not waste heavy model capacity on:

```text
"Yes"
"Okay"
"Explain that again"
"What does this word mean?"
```

when a faster model can handle it.

---

# 69. LATENCY PRINCIPLE

The Theater should optimize perceived latency.

Prefer:

```text
Fast response
      ↓
Immediate acknowledgement
      ↓
Background preparation
      ↓
Rich result
```

rather than:

```text
Student speaks
      ↓
Long silence
      ↓
Everything generated
      ↓
Response
```

The student should feel that Lumo is responsive.

---

# 70. PREFETCHING

Where possible, the system should prepare upcoming lesson content.

Example:

```text
Current beat
    ↓
Upcoming beat prepared in background
```

Potentially precompute:

- next visual
- next narration
- next asset
- next transition

But never allow speculative work to mutate the active session incorrectly.

Turn identity must remain authoritative.

---

# 71. CACHING

Cache deterministic/reusable assets where appropriate:

- visual assets
- previously generated teaching segments
- replay payloads
- document embeddings
- common scene templates
- static 3D assets

Avoid regenerating expensive content unnecessarily.

---

# 72. DEMO MODE

The Theater should be designed with the final hackathon demo in mind.

Demo mode should prioritize:

- reliability
- visual quality
- fast transitions
- representative subject coverage
- clean fullscreen presentation
- no unnecessary technical UI
- deterministic showcase scenarios

The demo should never depend on an extremely long generation pipeline.

---

# 73. TARGET DEMO PHILOSOPHY

We do NOT need to demonstrate every possible educational scenario.

We need a small number of excellent scenarios.

Target:

```text
1 excellent Biology experience
1 excellent Physics experience
1 excellent Chemistry experience
1 excellent Mathematics experience
1 excellent Astronomy experience
1 excellent Coding experience
```

These should prove that the underlying architecture generalizes.

---

# 74. RECOMMENDED DEMO FLOW

Example final demo:

```text
Landing
   ↓
Login
   ↓
Learning Home
   ↓
Start Theater
   ↓
Select Biology
   ↓
Select Cell topic
   ↓
Select voice
   ↓
Start
   ↓
AI tutor introduces concept
   ↓
3D cell appears
   ↓
Organelles highlight
   ↓
Student interrupts:
"Wait, what's the mitochondria?"
   ↓
Tutor responds
   ↓
Visual focuses mitochondria
   ↓
Tutor asks question
   ↓
Visual stage transforms
   ↓
Interactive question
   ↓
Student answers
   ↓
AI evaluates
   ↓
Tutor adapts
   ↓
Continue lesson
```

This is the kind of sequence that should make the product immediately
understandable to judges.

---

# 75. WHAT MAKES THEATER DIFFERENT

The Theater must visibly communicate:

```text
Chatbot
      ≠
AI Tutor

Video
      ≠
AI Tutor

Avatar
      ≠
AI Tutor

AI Tutor
      =
Voice
+
Reasoning
+
Visual teaching
+
Interaction
+
Assessment
+
Adaptation
```

The Theater is where this distinction becomes visible.

---

# 76. WHAT NOT TO DO

Never turn the Theater into:

### A chatbot

```text
Chat messages
Chat messages
Chat messages
```

### A video player

```text
Play
Pause
Timeline
Volume
```

### An avatar showcase

```text
Huge talking avatar
Tiny visual
```

### A dashboard

```text
10 cards
5 graphs
7 metrics
```

### A game

```text
XP
coins
streaks
badges everywhere
```

The Theater is a learning environment.

---

# 77. SUCCESS CRITERIA

The Theater redesign is successful when a first-time viewer can understand
within seconds:

1. This is an AI tutor.
2. The tutor speaks naturally.
3. The lesson is visually generated.
4. The visuals actually explain the concept.
5. The student can interrupt.
6. The tutor can adapt.
7. Questions happen inside the lesson.
8. The visual stage becomes interactive.
9. The system can use documents/context.
10. Different subjects can be taught differently.

---

# 78. FINAL DESIGN PRINCIPLE

The most important Theater rule:

> The interface should disappear when learning begins.

The student should stop thinking:

> "I am using an application."

and start feeling:

> "I am being taught."

The controls, panels, cards and technical complexity should remain available,
but secondary.

The visual lesson, tutor and interaction should occupy the student's
attention.

---

# 79. FINAL PRODUCT VISION

Lumo's Live Theater should feel like:

```text
Interactive textbook
        +
AI tutor
        +
Visual laboratory
        +
Conversation
        +
Practice environment
        +
Adaptive classroom
```

Not a collection of features.

One coherent experience.

---

# 80. IMPLEMENTATION PRIORITY

When implementing or redesigning the Theater, follow this order:

```text
PHASE A
Core Theater layout

PHASE B
Pre-session configuration

PHASE C
Tutor placement and states

PHASE D
Visual stage

PHASE E
Voice + narration controls

PHASE F
Live interaction + barge-in

PHASE G
Question transformation

PHASE H
Interactive playground

PHASE I
Remotion integration

PHASE J
R3F / Three.js integration

PHASE K
AI choreography

PHASE L
Visual synchronization

PHASE M
Assessment adaptation

PHASE N
Error/fallback handling

PHASE O
Demo scenarios

PHASE P
Final cinematic polish
```

Do not jump directly to decorative polish.

Build the experience hierarchy first.

---

# 81. NON-NEGOTIABLES

The following requirements must survive every future redesign:

- Theater remains the primary teaching surface.
- Visual stage remains more prominent than the tutor.
- Tutor remains expressive and conversational.
- Voice configuration exists before the session.
- Narration speed can be controlled.
- Captions are optional.
- Microphone can be controlled.
- Student can interrupt Lumo.
- Student can pause/stop the session.
- Replay is deterministic where possible.
- "Explain differently" creates a new explanation.
- Questions can transform the visual stage.
- MCQ, short answer, long answer and numerical flows are supported.
- Written numerical answers can be evaluated from images.
- RAG/document teaching is accessible directly from the Theater.
- Existing uploaded documents can be selected without re-uploading.
- 2D, Remotion and R3F are selected according to pedagogical need.
- Visuals and narration remain synchronized.
- Turn identity prevents stale updates.
- AI model routing is task-aware.
- Heavy models are reserved for heavy reasoning.
- Fallbacks preserve learning continuity.
- The Theater must work for the target demo scenarios.
- The interface must remain calm and focused.
- The Theater must never become a generic chatbot UI.

---

# 82. THE NORTH STAR

If there is ever a conflict between adding another feature and improving the
core teaching experience, prioritize the teaching experience.

The ultimate goal is:

> **Make difficult concepts feel understandable because the student can
> see, hear, question and interact with the explanation in real time.**

That is the Lumo Theater.

```

```
````
