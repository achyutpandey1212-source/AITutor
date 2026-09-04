# LUMO — PRODUCT ARCHITECTURE

**Document:** 2.1 — Product Architecture  
**Product:** Lumo  
**Status:** Final  
**Purpose:** Product-level architectural blueprint for the Lumo learning environment

---

# 1. Product Identity

Lumo is an **AI-native learning environment**, not a conventional educational dashboard and not a chatbot with educational features.

Its core experience is a personalized teaching loop:

> **Understand → Plan → Explain → Demonstrate → Interact → Evaluate → Adapt → Continue**

The architecture must therefore be designed around the **learning experience**, rather than around isolated pages or technical services.

Lumo should feel like a place where a student comes to learn, interact, practice, ask questions, and improve.

---

# 2. Core Product Pillars

Lumo is built around five primary experiences:

1. **Learning Home**
2. **Live Theater**
3. **Assessment / Practice**
4. **Doubt Solving**
5. **Progress & Mastery**

These experiences share the same underlying student context.

The student should never feel as if they are moving between unrelated applications.

---

# 3. High-Level Product Architecture

```text
                         LUMO
                           │
             ┌─────────────┴─────────────┐
             │                           │
        Learning Home              Live Theater
             │                           │
             │                    ┌──────┴──────┐
             │                    │             │
             │                 Teaching     Interaction
             │                    │             │
             └──────────────┬─────┴─────────────┘
                            │
                   Shared Learning Context
                            │
             ┌──────────────┼──────────────┐
             │              │              │
        Assessments     Doubt Solver    Progress
             │              │              │
             └──────────────┼──────────────┘
                            │
                     Session Memory
                            │
                    Student Knowledge
```

````

All major experiences should consume and contribute to the same learning context.

---

# 4. Product Layers

Lumo should be understood as five architectural layers.

```text
┌──────────────────────────────────────────┐
│              EXPERIENCE LAYER            │
│                                          │
│ Home · Theater · Assessment · Doubts     │
│ Progress · Onboarding · Settings         │
└─────────────────────┬────────────────────┘
                      │
┌─────────────────────▼────────────────────┐
│             INTERACTION LAYER             │
│                                          │
│ Voice · Text · Visual Interaction        │
│ MCQ · Short Answer · Long Answer         │
│ Numerical · Image Answer                 │
└─────────────────────┬────────────────────┘
                      │
┌─────────────────────▼────────────────────┐
│              INTELLIGENCE LAYER           │
│                                          │
│ Conversation Orchestrator                │
│ Teacher Engine                            │
│ Assessment Engine                         │
│ Lesson Planner                            │
│ Adaptive Teaching                         │
│ Intent Routing                            │
└─────────────────────┬────────────────────┘
                      │
┌─────────────────────▼────────────────────┐
│            CONTENT / VISUAL LAYER         │
│                                          │
│ Visual Strategy                          │
│ Remotion                                  │
│ Visual Asset Library                      │
│ Scene Generation                          │
│ Visual Beat Synchronization               │
└─────────────────────┬────────────────────┘
                      │
┌─────────────────────▼────────────────────┐
│              MEMORY / DATA               │
│                                          │
│ Session Memory                            │
│ Replay                                    │
│ Lesson State                              │
│ Assessment History                        │
│ Student Progress                          │
└──────────────────────────────────────────┘
```

---

# 5. Live Theater — The Core Experience

The Live Theater is the centerpiece of Lumo.

It is not merely a video player.

It is a **real-time interactive teaching environment**.

The Theater combines:

- AI tutor
- visual lesson stage
- voice interaction
- text interaction
- captions
- interactive questions
- assessment
- replay
- adaptive teaching
- session memory

---

# 6. Live Theater Layout

The default Theater should prioritize the educational visual.

```text
┌──────────────────────────────────────────────────┐
│  ← Physics                         Lesson 3 / 7 │
├──────────────────────────────────────────────────┤
│                                                  │
│                                                  │
│                VISUAL LESSON STAGE              │
│                                                  │
│          diagrams / simulations / formulas       │
│                                                  │
│                                                  │
│                                  ┌───────────┐   │
│                                  │   LUMO    │   │
│                                  │   TUTOR   │   │
│                                  └───────────┘   │
│                                                  │
├──────────────────────────────────────────────────┤
│  Introduction  ·  Force  ·  Mass  ·  Quiz       │
├──────────────────────────────────────────────────┤
│                                                  │
│        🎙 Talk to Lumo                           │
│                                                  │
└──────────────────────────────────────────────────┘
```

The tutor should occupy a **supporting visual role**.

The lesson visualization is the primary stage.

---

# 7. AI Tutor Architecture

The tutor is not simply an avatar.

The tutor consists of several coordinated systems:

```text
Student Input
     │
     ▼
Input Layer
     │
     ▼
Intent Router
     │
     ▼
Conversation Orchestrator
     │
     ├── Teacher Engine
     ├── Assessment Engine
     ├── Replay Service
     ├── Session Memory
     └── Adaptive Teaching
     │
     ▼
TeachingContent
     │
     ├── Speech
     ├── Visual Beats
     ├── Interaction
     └── Tutor State
     │
     ▼
Theater
```

---

# 8. Unified Input Architecture

Voice and text must never become separate teaching systems.

Both enter the same orchestration pipeline.

```text
Voice
  │
 STT
  │
  ├──────────────┐
                 │
Text ────────────┤
                 ▼
        ConversationOrchestrator
                 │
                 ▼
          Intent + Context
                 │
                 ▼
             Response
```

This guarantees consistent behavior regardless of how the student communicates.

---

# 9. Conversation Modes

Lumo should recognize several interaction modes.

### Teaching

The student is learning a concept.

```text
TEACH
```

### Question

The student asks about something.

```text
QUESTION
```

### Follow-up

The student continues the current concept.

```text
FOLLOW_UP
```

### Clarification

The student signals confusion.

```text
CLARIFICATION
```

### Replay

The student wants the previous explanation again.

```text
REPLAY
```

### Re-explain

The student wants another explanation.

```text
RE_EXPLAIN
```

### Assessment

The tutor initiates or the student requests testing.

```text
ASSESSMENT
```

### Answer

The student responds to an active assessment.

```text
ANSWER
```

Other supported states include:

```text
SKIP
PAUSE
RESUME
END_SESSION
```

---

# 10. The Theater Should Transform

A major architectural principle:

> **The lesson stage itself should become the interaction surface when learning requires interaction.**

Do not permanently place questions below the lesson as an ordinary form.

For example:

```text
Teaching Mode

┌─────────────────────────────┐
│                             │
│       VISUAL LESSON         │
│                             │
│       F = ma                │
│                             │
└─────────────────────────────┘
```

When the tutor asks a question:

```text
Interactive Mode

┌─────────────────────────────┐
│                             │
│      What happens to F      │
│      if mass doubles?       │
│                             │
│       ○ decreases           │
│       ○ increases           │
│       ○ stays same          │
│                             │
└─────────────────────────────┘
```

The Theater transitions between:

```text
TEACHING
    ↓
INTERACTION
    ↓
FEEDBACK
    ↓
TEACHING
```

This makes the experience feel like a live class rather than a video followed by a quiz.

---

# 11. Assessment Inside the Theater

The Theater supports:

### Multiple Choice

Fast conceptual checks.

### Short Answer

Students explain concepts in their own words.

### Long Answer

More comprehensive reasoning.

### Numerical

Students solve calculations.

### Written Numerical / Heavy Questions

For more complex numerical problems, Lumo may request an image of the student's handwritten solution.

The submitted image can then be evaluated.

This allows Lumo to assess:

- final answer
- working
- reasoning
- clarity
- presentation

The goal is not merely:

> "Did the student get the number?"

It can also evaluate:

> "Can the student produce a clean, understandable solution?"

---

# 12. Interactive Assessment Principle

Assessment should not feel like leaving the classroom.

The visual stage should transform into the appropriate interaction environment.

Examples:

```text
MCQ
→ interactive choice interface

Short Answer
→ focused response interface

Numerical
→ equation / answer workspace

Written Numerical
→ camera/image submission interface
```

After evaluation:

```text
Assessment
     ↓
Feedback
     ↓
Misconception Detection
     ↓
Adaptive Teaching
```

---

# 13. Adaptive Teaching

Assessment is not the end of the interaction.

If the student struggles:

```text
Incorrect Answer
      ↓
Identify Misconception
      ↓
Select Teaching Response
      ↓
Re-explain
      ↓
Demonstrate
      ↓
Ask Again
      ↓
Evaluate
```

The interface should visibly communicate adaptation.

Example:

> **Lumo noticed you're struggling with resistance. Let's try another way.**

The learning path can then prioritize that concept.

---

# 14. Model Routing Philosophy

Lumo should NOT use one large AI model for every operation.

Different tasks require different levels of intelligence and latency.

The architecture should use a **model-routing layer**.

```text
                    AI REQUEST
                       │
                       ▼
                 Task Classifier
                       │
        ┌──────────────┼──────────────┐
        │              │              │
      FAST           LIGHT           PRO
        │              │              │
   Low latency    Balanced        Deep reasoning
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                Model Provider
```

---

# 15. Lumo Model Tiers

The product may expose three conceptual intelligence tiers where appropriate.

### Lumo Fast

Purpose:

> Real-time conversational interaction.

Use for:

- simple follow-up questions
- acknowledgements
- conversational turns
- simple clarifications
- short contextual responses
- low-complexity intent handling

Priority:

**Latency**

---

### Lumo Light

Purpose:

> Fast educational reasoning.

Use for:

- ordinary explanations
- simple concept questions
- moderate contextual reasoning
- lightweight adaptation
- routine teaching interactions

Priority:

**Latency + quality**

---

### Lumo Pro

Purpose:

> Complex educational reasoning and generation.

Use for:

- lesson planning
- difficult questions
- complex misconceptions
- complex numerical reasoning
- scene planning
- visual strategy
- long structured outputs
- advanced assessment reasoning
- complex document/RAG reasoning

Priority:

**Reasoning quality**

---

# 16. Model Routing Must Be Task-Based

The system should NOT automatically escalate:

```text
Student says something
       ↓
Gemini
       ↓
Groq
```

for every interaction.

Instead:

```text
Student Input
      ↓
Intent + Complexity
      ↓
Task Classification
      ↓
Appropriate Model Tier
```

Example:

```text
"Okay"

→ Lumo Fast


"What happens to current if resistance doubles?"

→ Lumo Light


"Explain why increasing resistance decreases current using
the microscopic behavior of electrons."

→ Lumo Light / Pro depending on complexity


"Create a complete visual lesson explaining electromagnetic induction
with experiments, diagrams and adaptive questions."

→ Lumo Pro
```

---

# 17. Preserve Expensive Model Capacity

High-quality models should be reserved for tasks where they create meaningful value.

Heavy reasoning should primarily power:

- lesson planning
- complex teaching generation
- complex assessment
- misconception analysis
- adaptive strategy
- visual scene planning
- visual beat generation
- RAG-heavy reasoning
- difficult numerical evaluation
- complex content generation

Routine conversational traffic should not unnecessarily consume the same capacity.

---

# 18. Provider Abstraction

The product must remain provider-agnostic.

```text
Lumo AI Layer
      │
      ▼
Model Router
      │
 ┌────┼────┐
 │    │    │
Gemini Groq Future
          Providers
```

The internal product should not depend directly on a specific provider.

Providers are implementation details.

---

# 19. Current Provider Strategy

Current architecture:

```text
Primary:
Gemini

Fallback:
Groq
```

Future architecture:

```text
                 Lumo Model Router
                        │
        ┌───────────────┼───────────────┐
        │               │               │
     Fast Model      Light Model      Pro Model
        │               │               │
        └───────────────┼───────────────┘
                        │
             Provider Abstraction
```

The exact underlying models may change over time.

The product architecture should not need to change when models change.

---

# 20. Doubt Solver

The student should have access to a dedicated lightweight doubt-solving surface without leaving the Theater.

Possible entry point:

```text
        Ask Lumo
           💡
```

or:

```text
        Lumo AI
```

Opening it should provide a focused interaction surface.

Example:

```text
┌──────────────────────────────────────┐
│ Ask Lumo                         ×   │
├──────────────────────────────────────┤
│                                      │
│ What are you confused about?         │
│                                      │
│ [ Type your doubt...              ]  │
│                                      │
│ 🎙 Speak                             │
│                                      │
│ Model                                 │
│                                      │
│ ○ Lumo Fast                          │
│ ○ Lumo Light                         │
│ ● Lumo Pro                           │
│                                      │
│              Ask →                   │
└──────────────────────────────────────┘
```

The model selector should be presented as an **advanced option**, not forced upon every student.

---

# 21. Model Selection UX

Model selection should communicate intent rather than technical jargon.

Instead of only:

```text
Fast
Light
Pro
```

consider:

```text
⚡ Fast
Quick answers for simple doubts

🧠 Light
Balanced explanations

✨ Pro
Deep reasoning for difficult problems
```

The default should remain automatic.

Students should not need to understand AI models to use Lumo.

---

# 22. Visual Intelligence Architecture

Lumo's visuals are a core product capability.

The visual system should not simply generate random illustrations.

It should understand:

```text
Concept
   ↓
Pedagogical Goal
   ↓
Visual Strategy
   ↓
Scene
   ↓
Assets
   ↓
Animation
   ↓
Visual Beats
   ↓
Speech Synchronization
```

---

# 23. Visual Strategy

Different concepts require different representations.

Examples:

```text
Physics
→ simulations
→ force vectors
→ motion
→ graphs

Biology
→ scientific diagrams
→ anatomy
→ cellular structures
→ processes

History
→ timelines
→ maps
→ environments
→ event sequences

Mathematics
→ equations
→ geometric constructions
→ graphs
→ step-by-step transformations

Programming
→ code
→ execution flow
→ architecture diagrams
→ state changes
→ output

Geography
→ maps
→ terrain
→ climate
→ spatial relationships
```

The visual system must select representations based on the concept.

---

# 24. Visual Asset Library

Lumo should progressively develop a reusable visual asset library.

Potential categories:

```text
People
Vehicles
Buildings
Trees
Rocks
Animals
Scientific objects
Laboratory equipment
Machines
Geometric objects
UI/code elements
Maps
Environmental scenes
Educational symbols
```

Assets should be designed to work together stylistically.

The library should prioritize:

- consistency
- reusability
- composability
- animation readiness
- educational clarity

---

# 25. 2D vs 3D

3D should not be used simply because it looks impressive.

Use 3D when depth or spatial understanding materially improves learning.

Good candidates:

- solar systems
- molecular structures
- cells
- anatomy
- mechanical systems
- physical simulations
- geometry
- spatial environments
- engineering concepts

Use 2D for:

- equations
- timelines
- simple diagrams
- graphs
- flowcharts
- text explanations
- simple relationships

Architecture should support both.

---

# 26. Remotion's Role

Remotion remains the primary orchestration layer for deterministic educational video composition.

It is responsible for:

- lesson sequencing
- visual beats
- timing
- transitions
- captions
- diagrams
- animations
- scene composition

The architecture may integrate additional rendering technologies where necessary.

For example:

```text
Remotion
   │
   ├── 2D educational scenes
   ├── typography
   ├── diagrams
   ├── transitions
   │
   └── 3D / interactive scene
          │
          └── WebGL / R3F where justified
```

Three.js / React Three Fiber should be used selectively rather than across the entire application.

---

# 27. Tutor Visual Architecture

The AI tutor should evolve beyond a static avatar.

Long-term direction:

```text
AI Tutor

Voice
 +
Lip synchronization
 +
Facial expression
 +
Head movement
 +
Gestures
 +
Emotional state
```

The tutor should visually react to the teaching state.

Examples:

```text
Explaining
→ natural speaking animation

Thinking
→ subtle thinking state

Asking question
→ attentive expression

Student answers incorrectly
→ encouraging reaction

Student succeeds
→ positive reaction
```

The tutor remains visually subordinate to the educational content.

---

# 28. Voice Architecture

Voice must be provider-agnostic.

```text
Text
 ↓
TTS Provider
 ↓
Audio
 ↓
Playback Controller
 ↓
Theater
```

The system should support:

- voice selection
- speech speed
- pitch where supported
- volume
- cancellation
- interruption
- fallback
- future multilingual providers

---

# 29. Voice Personality

The goal is not simply:

> Generate speech.

The goal is:

> **Generate natural tutoring speech.**

The system should eventually support:

- pauses
- emphasis
- conversational pacing
- sentence-level timing
- appropriate pronunciation
- emotional variation
- subject-aware delivery

Example:

Instead of:

> "The answer is ten meters per second."

The tutor should be capable of:

> "So... the answer is **ten meters per second**."

where the emphasis and pause feel intentional.

---

# 30. True Barge-In

Barge-in is a fundamental Theater requirement.

If the student interrupts:

```text
Tutor Speaking
      ↓
Student Starts Speaking
      ↓
Invalidate Active Turn
      ↓
Cancel TTS
      ↓
Cancel Caption Timers
      ↓
Cancel Visual Timers
      ↓
Reject Late AI Response
      ↓
Begin New Turn
```

No stale turn should be allowed to mutate the Theater.

---

# 31. Single Turn Authority

Every session must have exactly one active authoritative turn.

```text
Session
 │
 └── Active Turn
       │
       ├── turnId
       ├── generation
       ├── speech
       ├── visuals
       └── state
```

A new turn invalidates the previous turn.

This prevents:

- zombie audio
- zombie captions
- stale visuals
- overlapping tutor responses
- race conditions

---

# 32. Session Memory

The session should continuously accumulate structured learning context.

Memory may include:

```text
Current topic
Current concept
Concepts covered
Questions asked
Student answers
Misconceptions
Strong concepts
Weak concepts
Assessment results
Visual history
Lesson progress
Replayable segments
```

Memory should be structured rather than relying exclusively on raw conversation history.

---

# 33. Replay vs Re-Explain

These are fundamentally different operations.

### Explain Again

```text
Student
  ↓
REPLAY
  ↓
ReplayService
  ↓
Persisted TeachingContent
```

No new LLM generation should be necessary.

---

### Explain Differently

```text
Student
  ↓
RE_EXPLAIN
  ↓
ContextBuilder
  ↓
TeacherEngine
  ↓
New TeachingContent
```

The previous explanation should be provided as context.

The new explanation should intentionally use a different teaching strategy.

---

# 34. Learning Home

The dashboard should be redesigned as a **personal learning home**.

It should answer:

> What should I learn next?

rather than:

> What are my statistics?

Primary elements:

```text
Continue Learning
      ↓
Recommended Learning
      ↓
Current Mastery
      ↓
Weak Concepts
      ↓
Recent Sessions
```

Analytics should support decisions rather than dominate the interface.

---

# 35. Progress Architecture

Progress should represent mastery.

Example:

```text
Physics

Voltage       ✓ Mastered
Current       ✓ Strong
Resistance    ◐ Developing
Circuits      ○ Not learned
```

The system should distinguish between:

- exposure
- practice
- understanding
- mastery

A simple percentage is not enough to represent learning.

---

# 36. Assessment Architecture

Assessment is a teaching instrument, not an isolated exam module.

```text
Lesson
  ↓
Question
  ↓
Student Response
  ↓
Evaluation
  ↓
Feedback
  ↓
Misconception
  ↓
Adaptive Teaching
```

Assessment results must feed back into:

- Session Memory
- Progress
- Recommendations
- Adaptive Teaching

---

# 37. Data Flow

The canonical teaching flow is:

```text
Student
  │
  ▼
Voice / Text
  │
  ▼
Input Layer
  │
  ▼
Conversation Orchestrator
  │
  ├── Intent Router
  ├── Context Builder
  └── Turn Manager
  │
  ▼
Teaching / Assessment / Replay
  │
  ▼
TeachingContent
  │
  ├── Speech
  ├── Visual Beats
  ├── Interaction
  └── State
  │
  ▼
Client Theater
  │
  ├── Visual Stage
  ├── Tutor
  ├── Audio
  └── Interaction
  │
  ▼
Session Memory
  │
  ▼
Progress / Adaptation
```

---

# 38. Error Philosophy

Failures should degrade gracefully.

### TTS failure

Keep readable transcript.

```text
TTS failed
   ↓
Display response
   ↓
Allow text interaction
```

### STT failure

Do not corrupt session state.

```text
STT failed
   ↓
Return to listening-ready state
   ↓
Allow typed input
```

### AI provider failure

Use provider fallback.

```text
Primary
  ↓
Failure
  ↓
Fallback
  ↓
Response
```

### Visual asset failure

Use an appropriate fallback representation.

```text
Missing asset
   ↓
Fallback visual
   ↓
Teaching continues
```

The student should not feel that the system has collapsed because one subsystem failed.

---

# 39. Separation of Responsibilities

Subsystems must remain modular.

Existing systems should not be rewritten simply to accommodate the new product architecture.

Important subsystems include:

```text
TeacherEngine
AssessmentEngine
LessonPlanner
VisualStrategyEngine
SessionMemoryService
ReplayService
ConversationOrchestrator
```

Each should retain a clear responsibility.

The orchestrator coordinates them.

It should not absorb all their internal logic.

---

# 40. Frontend Architecture

The frontend should be organized around product experiences.

Conceptually:

```text
client/
│
├── pages/
│   ├── Home
│   ├── Theater
│   ├── Assessment
│   ├── Progress
│   └── Settings
│
├── components/
│   ├── theater/
│   ├── tutor/
│   ├── assessment/
│   ├── learning/
│   └── shared/
│
├── hooks/
│
├── services/
│   ├── stt
│   ├── tts
│   ├── api
│   └── session
│
└── state/
```

The exact folder structure may evolve during implementation.

Product boundaries matter more than arbitrary folder naming.

---

# 41. Backend Architecture

The backend should remain modular.

Conceptually:

```text
server/
│
├── orchestration/
├── teacher/
├── assessment/
├── lesson/
├── visual/
├── memory/
├── voice/
├── ai/
├── routes/
└── shared/
```

The orchestration layer coordinates the product.

Specialized engines remain independent.

---

# 42. Technology Philosophy

Use technology because it improves the learning experience.

Do not add technology merely because it looks impressive.

### React

Primary client framework.

### TypeScript

Required across the application.

### Remotion

Educational video and visual sequencing.

### React Three Fiber / Three.js

Selective use for meaningful 3D learning experiences.

### Web Speech / STT

Fast browser-level voice interaction where appropriate.

### TTS providers

Provider abstraction for natural voice generation.

### Gemini / Groq

Provider implementations behind the Lumo AI layer.

### MongoDB

Persistent learning and session data.

### Firebase

Authentication.

---

# 43. Next.js Decision

The current application uses React + Vite.

There is no architectural requirement to migrate to Next.js simply for the redesign.

The redesign should prioritize:

- product quality
- performance
- animation
- maintainability
- learning UX

A migration to Next.js should only happen if a concrete requirement emerges, such as:

- server-side rendering requirements
- SEO-heavy public pages
- framework-specific infrastructure
- improved application architecture that justifies migration

Do not migrate merely because Next.js is fashionable.

---

# 44. Animation Philosophy

Animation must serve one of three purposes:

### Orientation

Help the student understand where they are.

### Explanation

Demonstrate a concept.

### Feedback

Communicate system or learning state.

Decorative animation should remain limited.

---

# 45. Product-Level Motion

Lumo should feel alive but calm.

Use:

- smooth transitions
- subtle state changes
- purposeful visual transformations
- progressive reveal
- diagram animation
- spatial continuity

Avoid:

- excessive bouncing
- constant particles
- unnecessary parallax
- animation on every element
- distracting transitions

---

# 46. The Core Design Principle

The architecture should always answer:

> **Does this make learning better?**

If yes:

Build it.

If it only makes the application look technologically impressive:

Question it.

If it introduces complexity without meaningful learning value:

Do not build it.

---

# 47. Product Differentiation

Lumo's competitive advantage should not be:

> "We have an AI chatbot."

It should be:

> **"Lumo teaches concepts through a live, adaptive visual classroom."**

The experience combines:

```text
Conversation
      +
Natural Voice
      +
AI Tutor
      +
Visual Explanation
      +
Interactive Practice
      +
Assessment
      +
Adaptive Teaching
      +
Session Memory
```

The combination is the product.

---

# 48. Long-Term Product Vision

The architecture should allow Lumo to evolve toward:

```text
                  LUMO
                   │
          Personal AI Teacher
                   │
        ┌──────────┼──────────┐
        │          │          │
      Voice      Vision     Text
        │          │          │
        └──────────┼──────────┘
                   │
          Adaptive Learning
                   │
        ┌──────────┼──────────┐
        │          │          │
     Lessons   Practice    Assessment
        │          │          │
        └──────────┼──────────┘
                   │
              Mastery Model
                   │
                   ▼
             Personalized
              Education
```

Lumo should progressively become capable of adapting:

- what it teaches
- how it teaches
- how fast it teaches
- which visuals it uses
- how difficult questions become
- how it speaks
- how much assistance it provides

based on the individual student.

---

# 49. Architectural North Star

When making future architectural decisions, use these rules:

### Rule 1

**Learning experience comes before technology.**

### Rule 2

**The Theater is the core product experience.**

### Rule 3

**Voice and text share one orchestration pipeline.**

### Rule 4

**Heavy AI reasoning is reserved for high-value tasks.**

### Rule 5

**Low-latency models handle routine conversation whenever possible.**

### Rule 6

**Visuals are part of teaching, not decoration.**

### Rule 7

**Assessment feeds adaptation.**

### Rule 8

**Memory connects sessions into a continuous learning journey.**

### Rule 9

**The AI tutor guides the lesson; the visual stage demonstrates the concept.**

### Rule 10

**Technology must justify itself through learning value.**

---

# 50. Final Product Loop

The complete Lumo experience should ultimately feel like:

```text
                 STUDENT
                    │
                    ▼
               EXPRESSES
                    │
              voice / text
                    │
                    ▼
               UNDERSTAND
                    │
                    ▼
                  PLAN
                    │
                    ▼
                EXPLAIN
                    │
                    ▼
              DEMONSTRATE
                    │
                    ▼
               INTERACT
                    │
                    ▼
                EVALUATE
                    │
                    ▼
                 ADAPT
                    │
                    ▼
                PRACTICE
                    │
                    ▼
                MASTER
                    │
                    ▼
              REMEMBER
                    │
                    └──────────────┐
                                   │
                                   ▼
                              NEXT SESSION
```

This loop is the architectural identity of Lumo.

The application should not be designed as a collection of pages.

It should be designed as a **continuous intelligent learning environment**.
````
