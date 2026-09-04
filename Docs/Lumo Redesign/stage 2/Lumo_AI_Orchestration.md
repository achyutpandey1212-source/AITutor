# LUMO AI ORCHESTRATION

**Document:** `LUMO_AI_ORCHESTRATION.md`  
**Stage:** 2 — Product & Experience Architecture  
**Purpose:** Define how Lumo's AI capabilities are divided, routed, coordinated, and executed across the product.

---

# 1. Purpose

Lumo is not a single-model chatbot.

It is an AI teaching system composed of multiple specialized capabilities working together.

The architecture should optimize for:

- teaching quality
- response latency
- reliability
- cost efficiency
- provider resilience
- contextual understanding
- adaptive teaching
- visual generation quality
- voice responsiveness

The core principle is:

> **Use the smallest capable model for the job, and reserve heavyweight reasoning for tasks that genuinely require it.**

Do not send every student interaction through the most powerful model.

---

# 2. Core Philosophy

Lumo should behave like one intelligent tutor to the student.

Internally, however, different AI capabilities may perform different jobs.

Conceptually:

```text
                     LUMO AI
                        │
          ┌─────────────┼─────────────┐
          │             │             │
          ▼             ▼             ▼
      FAST PATH     TEACHING PATH   DEEP PATH
          │             │             │
    Conversation    TeacherEngine   Complex reasoning
    Intent          Adaptation      Lesson planning
    Simple Q&A      Context         Visual generation
    Acknowledgement Explanation     Assessment design
```

````

The complexity should remain invisible to the student.

The student simply experiences:

> "Lumo understands me."

---

# 3. AI Capability Layers

Lumo should conceptually contain the following AI layers:

```text
1. Input / Speech Layer
2. Intent Layer
3. Context Layer
4. Fast Conversation Layer
5. Teaching Reasoning Layer
6. Assessment Reasoning Layer
7. Visual Intelligence Layer
8. Lesson Planning Layer
9. Memory Layer
10. Voice Generation Layer
11. Provider Fallback Layer
```

These are logical responsibilities.

They do not necessarily need to be separate services.

---

# 4. AI Provider Abstraction

The application must NOT hard-code business logic around a specific AI provider.

Use a provider abstraction.

Conceptually:

```text
                    AIProvider
                       │
          ┌────────────┴────────────┐
          │                         │
       Gemini                     Groq
       Provider                   Provider
```

The application should communicate with an internal interface rather than directly coupling every subsystem to Gemini or Groq.

Example conceptual interface:

```ts
interface AIProvider {
  generate(request: AIRequest): Promise<AIResponse>;
  stream?(request: AIRequest): AsyncIterable<AIChunk>;
}
```

The exact implementation may differ.

The important principle is provider independence.

---

# 5. Model Tiers

Lumo should conceptually expose three capability tiers internally and potentially to users.

## Lumo Fast

Optimized for:

- extremely low latency
- simple conversational interactions
- intent classification
- acknowledgements
- simple follow-ups
- lightweight contextual responses
- routine classroom conversation

Priority:

```text
LATENCY > REASONING DEPTH
```

---

## Lumo Light

Optimized for:

- normal tutoring
- straightforward explanations
- contextual follow-ups
- simple conceptual questions
- routine adaptive responses

Priority:

```text
LATENCY ≈ QUALITY
```

---

## Lumo Pro

Optimized for:

- difficult reasoning
- complex explanations
- lesson planning
- difficult student questions
- complex numerical reasoning
- visual strategy
- scene generation
- assessment generation
- high-value adaptive decisions

Priority:

```text
QUALITY > LATENCY
```

These names describe product capabilities, not necessarily specific underlying model names.

The actual models may change over time.

---

# 6. Model Selection Principle

Do not select a model based purely on "which model is strongest."

Select based on task complexity.

Conceptually:

```text
Simple task
   ↓
Lumo Fast

Moderate task
   ↓
Lumo Light

Complex task
   ↓
Lumo Pro
```

This prevents unnecessary latency and preserves heavyweight model capacity.

---

# 7. Fast Conversation Path

Normal classroom conversation should be fast.

Examples:

Student:

> "Yeah."

Student:

> "Okay."

Student:

> "Why?"

Student:

> "Wait, what does mass mean?"

Student:

> "Can you repeat that?"

Student:

> "Got it."

These interactions should not automatically invoke heavyweight reasoning.

The system should prefer a fast path when the task is simple.

---

# 8. Fast Path Architecture

Conceptually:

```text
Student Input
     ↓
STT / Text
     ↓
Intent Router
     ↓
Context Builder
     ↓
Fast Model
     ↓
Response
     ↓
TTS
```

The fast path should minimize:

- unnecessary model calls
- large prompts
- excessive context
- expensive reasoning
- unnecessary visual generation

---

# 9. Heavy Reasoning Path

Heavy models should be reserved for tasks where additional reasoning materially improves the result.

Examples:

- building a new lesson
- planning a multi-step explanation
- generating a complex visual sequence
- interpreting a difficult misconception
- solving advanced numerical reasoning
- generating assessment questions
- planning adaptive remediation
- constructing complex visual scenes
- deciding between multiple pedagogical approaches

Conceptually:

```text
Student / System Request
       ↓
Complexity Detection
       ↓
Lumo Pro
       ↓
Structured Teaching Output
```

---

# 10. Do Not Use Heavy Reasoning for Everything

Bad architecture:

```text
Every student message
        ↓
Gemini strongest model
        ↓
Response
```

Problems:

- unnecessary latency
- unnecessary token consumption
- wasted model capacity
- slower conversation
- higher infrastructure cost

Preferred:

```text
Student message
      ↓
Classify complexity
      ↓
┌───────────────┬────────────────┐
│ Simple        │ Complex        │
│               │                │
▼               ▼                │
Fast/Light      Pro              │
└───────────────┴────────────────┘
```

---

# 11. Intent Classification

Intent classification should happen before expensive reasoning whenever possible.

Possible intents:

```text
TEACH
QUESTION
FOLLOW_UP
CLARIFICATION
REPLAY
RE_EXPLAIN
ASSESSMENT
ANSWER
SKIP
PAUSE
RESUME
END_SESSION
```

The classifier should preferably be deterministic or lightweight where reliable.

Do not invoke a heavyweight model simply to determine obvious intents.

Examples:

```text
"Explain that again"
→ REPLAY

"Explain it differently"
→ RE_EXPLAIN

"Quiz me"
→ ASSESSMENT

"What is mass?"
→ QUESTION
```

---

# 12. Deterministic Intent Rules

Certain intents should be recognized through fast rules whenever possible.

Examples:

```text
"again"
"repeat that"
"show that again"
"explain that again"
```

may indicate:

```text
REPLAY
```

Similarly:

```text
"quiz me"
"test me"
"ask me a question"
```

may indicate:

```text
ASSESSMENT
```

Deterministic routing improves responsiveness and reduces unnecessary AI calls.

---

# 13. Conversation Orchestrator

The `ConversationOrchestrator` is responsible for coordinating the live teaching experience.

It should NOT become a giant class containing every piece of AI logic.

Its responsibilities should remain:

```text
1. Receive turn
2. Validate turn
3. Determine intent
4. Build context
5. Select execution path
6. Invoke appropriate subsystem
7. Assemble response
8. Emit events
9. Update memory
```

Specialized logic should remain in dedicated services.

---

# 14. Modular AI Architecture

Preferred architecture:

```text
ConversationOrchestrator
        │
        ├── IntentRouter
        │
        ├── ContextBuilder
        │
        ├── ClassroomTurnManager
        │
        ├── TeacherEngine
        │
        ├── AssessmentEngine
        │
        ├── ReplayService
        │
        ├── VisualStrategyEngine
        │
        ├── SessionMemoryService
        │
        └── AIProviderLayer
```

Avoid:

```text
ConversationOrchestrator
        │
        └── 3000-line god class
```

---

# 15. Context Management

Lumo should provide enough context for meaningful teaching without sending the entire session history on every request.

Context should be compact and relevant.

Possible context:

```text
Current subject
Current topic
Current concept
Lesson progress
Recent turns
Active visual
Recent student mistakes
Relevant session memory
Assessment state
Student level
Language
```

---

# 16. Recent Conversation Window

Normal conversational requests should use a bounded recent-turn window.

Example:

```text
Recent 6 turns
```

rather than:

```text
Entire session transcript
```

This reduces:

- token usage
- latency
- irrelevant context
- context pollution

Long-term knowledge should come from structured session memory.

---

# 17. Structured Memory

Important learning information should be stored separately from raw conversation.

Examples:

```text
Concepts covered
Strong concepts
Weak concepts
Misconceptions
Assessment results
Formulas
Examples used
Current lesson position
Visual history
Student preferences
```

The AI should retrieve relevant structured memory when necessary.

---

# 18. Student Model

Lumo should gradually build a lightweight understanding of the learner.

Potential attributes:

```text
Learning level
Known concepts
Weak concepts
Strong concepts
Common mistakes
Preferred explanation style
Preferred language
Recent performance
Current topic
```

The student model should support adaptation.

It should not become an unnecessarily complex psychological profile.

---

# 19. Teaching Engine

`TeacherEngine` is responsible for pedagogical reasoning.

It should decide:

- how to explain
- which example to use
- what level of complexity to use
- whether another analogy is needed
- how to respond to misconceptions
- what question to ask
- how to continue the lesson

It should receive structured context rather than raw application state.

---

# 20. Teacher Output Contract

Teaching output should be structured.

Conceptually:

```ts
TeachingContent {
  speech: string;
  explanation: string;
  concept: string;
  visualPlan?: VisualPlan;
  question?: QuestionPlan;
  nextAction?: string;
}
```

The exact schema should follow the application's shared contracts.

The goal is to keep:

```text
Reasoning
   ↓
Structured output
   ↓
Voice + Visual + UI
```

separate.

---

# 21. Visual Intelligence

Visual generation should be treated as a specialized capability.

The AI should determine:

- whether a visual is necessary
- what type of visual is appropriate
- what assets are required
- whether 2D or 3D is useful
- what should animate
- what should be highlighted
- how the visual relates to narration

The system should not generate visual complexity automatically.

---

# 22. Visual Generation Priority

Prefer:

```text
No visual
    ↓
Simple diagram
    ↓
Animated 2D visual
    ↓
Rich environmental scene
    ↓
Interactive 3D
```

depending on educational necessity.

3D is a capability, not a default.

---

# 23. Lesson Planning

Lesson planning is a heavyweight task.

A lesson plan may need to reason about:

- student level
- syllabus
- prerequisite concepts
- learning objectives
- concept sequence
- examples
- visual opportunities
- practice opportunities
- assessment points
- remediation paths

This is an appropriate place for a stronger reasoning model.

Conceptually:

```text
Student Goal
     +
Subject
     +
Level
     +
Learning Material
     ↓
Lumo Pro
     ↓
LessonPlan
```

---

# 24. Lesson Planning Should Not Happen Every Turn

Once a lesson is planned, normal student interaction should operate against the existing lesson plan.

Do not regenerate the entire lesson plan whenever the student asks a simple question.

Instead:

```text
Lesson Plan
     ↓
Current Concept
     ↓
Student interaction
     ↓
Local adaptation
```

Replanning should occur only when necessary.

---

# 25. Adaptive Teaching

Adaptation is a core Lumo capability.

Adaptation may be triggered by:

- incorrect assessment answer
- repeated confusion
- explicit student request
- difficulty signal
- hesitation
- repeated failed attempts
- successful mastery

Possible response:

```text
Student struggles
      ↓
Detect misconception
      ↓
Determine intervention
      ↓
Choose:
  - analogy
  - simpler explanation
  - new example
  - visual
  - practice question
      ↓
Re-evaluate
```

---

# 26. Adaptive Reasoning Allocation

Not every adaptation requires the strongest model.

Simple adaptation:

```text
Student got simple question wrong
      ↓
Known misconception
      ↓
Lumo Light
```

Complex adaptation:

```text
Student repeatedly misunderstands
multiple related concepts
      ↓
Deep misconception analysis
      ↓
Lumo Pro
```

---

# 27. Assessment Engine

Assessment generation and evaluation should remain separate from ordinary conversation.

Assessment tasks may include:

- MCQ
- short answer
- long answer
- numerical
- written-answer image evaluation

The assessment subsystem should preserve its existing contracts and internal logic.

The orchestration layer decides when to invoke it.

---

# 28. Assessment Routing

Example:

```text
"Quiz me"
      ↓
ASSESSMENT
      ↓
AssessmentEngine
      ↓
Question
      ↓
Student Answer
      ↓
AssessmentEngine
      ↓
Evaluation
```

Do not route an active assessment answer through the ordinary teaching pipeline.

---

# 29. Assessment Failure → Adaptive Teaching

When an assessment reveals a weakness:

```text
Assessment
    ↓
Incorrect
    ↓
Misconception identified
    ↓
Adaptive Teaching
    ↓
TeacherEngine
    ↓
New explanation
    ↓
New practice
```

This is one of Lumo's strongest intelligence loops.

---

# 30. Replay

Replay should be deterministic whenever possible.

Example:

```text
"Explain that again."
      ↓
REPLAY
      ↓
ReplayService
      ↓
Stored teaching segment
```

No LLM generation should be required when the stored segment is sufficient.

This provides:

- lower latency
- consistency
- lower model usage
- exact replay

---

# 31. Re-Explain

Re-explanation is fundamentally different.

Example:

```text
"Explain it differently."
      ↓
RE_EXPLAIN
      ↓
TeacherEngine
      ↓
Previous concept context
      ↓
Fresh explanation
```

The new explanation should actually differ in:

- analogy
- example
- framing
- visual strategy
- explanation depth

It should not simply repeat the same response with different wording.

---

# 32. Voice Architecture

Voice should remain provider-agnostic.

Conceptually:

```text
             VoiceProvider
                  │
       ┌──────────┴──────────┐
       │                     │
     STT                    TTS
       │                     │
 Browser / Future        Browser / Future
 providers               providers
```

Future providers may include specialized Indian-language voice systems.

The application should not need to be rewritten when a new provider is introduced.

---

# 33. STT Strategy

The STT layer should prioritize:

1. responsiveness
2. reliable transcription
3. interruption detection
4. language support

Voice input should ultimately enter the same orchestration pipeline as typed input.

```text
Voice
 ↓
STT
 ↓
StudentInput
 ↓
ConversationOrchestrator
```

---

# 34. TTS Strategy

TTS should support:

- cancellation
- interruption
- multiple voices
- speech speed
- graceful failure
- future multilingual providers

The tutor's speech should feel natural.

Long-term improvements should include:

```text
Voice quality
+
Prosody
+
Natural pauses
+
Speed control
+
Emotion
+
Lip synchronization
```

---

# 35. Voice Speed

Student-facing speech speed should be configurable.

Example:

```text
0.75×
1.0×
1.25×
1.5×
```

The default should remain natural and comfortable.

The system should not require regeneration of lesson content simply because playback speed changed.

---

# 36. Voice Selection

Students should eventually be able to select from a curated set of Lumo voices.

Avoid exposing provider-specific model names.

Use product-facing names such as:

```text
Lumo Calm
Lumo Clear
Lumo Warm
```

The underlying provider can change independently.

---

# 37. Barge-In Architecture

Barge-in is a core real-time requirement.

When the student interrupts:

```text
Student starts speaking
       ↓
Cancel TTS
       ↓
Invalidate active turn
       ↓
Cancel visual timers
       ↓
Reject stale events
       ↓
Accept new input
```

The system must never allow the previous turn to continue controlling the Theater.

---

# 38. Turn Identity

Each active turn must have a unique identity.

Conceptually:

```text
Session
   ↓
Turn 41
```

Student interrupts:

```text
Turn 41 → INVALID
Turn 42 → ACTIVE
```

All asynchronous events must validate their turn identity before mutating state.

---

# 39. Zombie Response Prevention

A response generated before interruption may complete after the interruption.

That response must NOT be allowed to:

- start TTS
- change captions
- advance visuals
- modify current lesson state
- overwrite newer responses

Conceptually:

```ts
if (!turnManager.isCurrent(turnId)) {
  discard();
}
```

This invariant must be preserved throughout the system.

---

# 40. Streaming

Where supported, streaming should be used selectively.

Potential flow:

```text
Student Input
      ↓
Fast intent detection
      ↓
Model begins response
      ↓
First useful chunk
      ↓
TTS begins
      ↓
Visual events begin
```

Do not wait unnecessarily for the entire response when partial output can safely improve responsiveness.

However, structured visual generation may require a complete validated payload before playback.

---

# 41. Latency Budget

The system should optimize for perceived latency rather than only raw model latency.

The student should quickly receive acknowledgement.

For example:

```text
Student finishes speaking
        ↓
Immediate state change
"Thinking..."
        ↓
Fast routing
        ↓
Response generation
        ↓
TTS / Visual
```

The interface should never appear frozen while the AI is working.

---

# 42. Parallel Work

Independent work should be parallelized when safe.

Example:

```text
Teaching response
      │
      ├── TTS generation
      │
      └── Visual preparation
```

Do not unnecessarily serialize independent operations.

However, dependencies must remain explicit.

Example:

```text
Teaching content
      ↓
Visual strategy
      ↓
Visual rendering
```

may require ordering.

---

# 43. AI Response Contract

AI-generated content should be structured before reaching the UI.

Preferred:

```text
AI reasoning
    ↓
Validated structured response
    ↓
┌──────────┬───────────┬─────────────┐
│ Speech   │ Visual    │ Interaction │
└──────────┴───────────┴─────────────┘
```

Avoid passing arbitrary model-generated text directly into multiple UI systems.

---

# 44. Schema Validation

AI outputs must be validated.

Use shared contracts / Zod schemas where appropriate.

If a model produces malformed structured output:

```text
AI output
   ↓
Validation
   ↓
Invalid
   ↓
Repair / fallback
```

Never allow malformed AI output to silently corrupt session state.

---

# 45. Provider Fallback

Provider fallback should be automatic where appropriate.

Conceptually:

```text
Primary provider
      ↓
Failure / timeout
      ↓
Fallback provider
      ↓
Response
```

Current architecture may use:

```text
Gemini
   ↓
Groq fallback
```

The provider layer should hide this implementation detail from higher-level teaching logic.

---

# 46. Fallback Is Not Always Model Substitution

A fallback should preserve the task contract.

For example:

```text
TeacherEngine
     ↓
AIProvider.generateTeaching()
```

should not need to know whether Gemini or Groq generated the result.

The provider layer handles the substitution.

---

# 47. Retry Strategy

Avoid uncontrolled retries.

Bad:

```text
Failure
 ↓
Retry
 ↓
Retry
 ↓
Retry
 ↓
Retry
```

Preferred:

```text
Primary attempt
      ↓
short retry if appropriate
      ↓
fallback provider
      ↓
graceful UI fallback
```

Retries should be bounded.

---

# 48. AI Failure Hierarchy

If AI generation fails:

### Level 1

Retry safely.

### Level 2

Switch provider.

### Level 3

Use cached / deterministic response if available.

### Level 4

Provide a graceful textual fallback.

Never leave the student staring at an indefinite loading state.

---

# 49. Model Routing Examples

### Example A — Simple Question

Student:

> "What is mass?"

```text
STT
 ↓
IntentRouter
 ↓
QUESTION
 ↓
Lumo Fast / Light
 ↓
Teacher response
 ↓
TTS
```

---

### Example B — Difficult Conceptual Question

Student:

> "Why does increasing resistance reduce current if voltage is constant?"

```text
IntentRouter
 ↓
QUESTION
 ↓
Complexity detection
 ↓
Lumo Pro
 ↓
TeacherEngine
 ↓
VisualStrategyEngine
 ↓
TTS + Visual
```

---

### Example C — Replay

Student:

> "Explain that again."

```text
REPLAY
 ↓
ReplayService
 ↓
Stored teaching segment
 ↓
TTS + Visual
```

No LLM generation.

---

### Example D — Re-explanation

Student:

> "Explain that differently."

```text
RE_EXPLAIN
 ↓
TeacherEngine
 ↓
Lumo Light / Pro depending on complexity
 ↓
New explanation
 ↓
VisualStrategyEngine
 ↓
TTS + Visual
```

---

### Example E — Assessment

Student:

> "Quiz me."

```text
ASSESSMENT
 ↓
AssessmentEngine
 ↓
Question
 ↓
Interactive Playground
```

---

### Example F — Difficult Adaptive Remediation

```text
Student fails multiple questions
       ↓
Weakness detected
       ↓
Deep misconception analysis
       ↓
Lumo Pro
       ↓
Adaptive teaching plan
       ↓
New explanation
       ↓
New visual
       ↓
Re-evaluation
```

---

# 50. Lumo AI During Live Theater

The Theater should use a layered strategy.

```text
                  LIVE THEATER
                       │
          ┌────────────┴────────────┐
          │                         │
   Real-time interaction      Deep generation
          │                         │
    Lumo Fast/Light              Lumo Pro
          │                         │
    Conversation                Planning
    Follow-ups                  Complex Q&A
    Simple questions            Visual strategy
    Acknowledgements            Assessment
```

The live experience should feel fast while heavyweight intelligence remains available when necessary.

---

# 51. Background Generation

Where possible, expensive preparation can happen before the student reaches the relevant moment.

Examples:

```text
Lesson currently explaining Concept 2

Background:
Prepare Concept 3 visual
Prepare likely example
Prepare possible question
```

This can reduce perceived latency.

However, background generation must not interfere with current turn state.

---

# 52. Predictive Generation Must Be Conservative

Do not generate huge amounts of content speculatively.

Generate only when:

- the next step is reasonably predictable
- the result is cheap enough
- the content can be safely discarded
- it does not consume resources needed for active interaction

The active student interaction always has priority.

---

# 53. AI Memory Boundaries

Do not allow every model to independently mutate session state.

Preferred:

```text
AI
 ↓
Structured output
 ↓
Orchestrator
 ↓
Validated state update
 ↓
SessionMemory
```

The AI suggests what should happen.

The application remains the authority over state.

---

# 54. AI Must Not Become the Source of Truth

The following should remain deterministic application state:

- current turn
- session ID
- assessment state
- current lesson position
- active visual state
- replay availability
- interruption state
- authentication
- permissions
- persistence

AI should not directly control these without validation.

---

# 55. Student-Facing Model Selector

If Lumo exposes model tiers to students, keep the interface simple.

Possible UI:

```text
Ask Lumo

○ Fast
  Quick answers

○ Light
  Balanced

● Pro
  Deep reasoning
```

The default should be automatic selection.

Most students should not need to think about model selection during normal learning.

---

# 56. Automatic Mode

Recommended default:

```text
Lumo Auto
```

The system decides the appropriate model.

Conceptually:

```text
Lumo Auto
     ↓
Task complexity
     ↓
Fast / Light / Pro
```

This should be the standard classroom experience.

---

# 57. Explicit Model Selection

Manual model selection may be useful inside the dedicated Lumo AI / Doubt Solver interface.

Example:

```text
Quick doubt
→ Fast

Normal explanation
→ Light

Deep reasoning
→ Pro
```

The selection should be optional.

The core Theater should remain distraction-free.

---

# 58. Language Architecture

The AI layer should eventually support:

```text
English
Hindi
Hinglish
```

without changing the teaching architecture.

Language should be a parameter of the teaching and voice pipeline.

Conceptually:

```text
Student language
      ↓
Intent
      ↓
TeacherEngine
      ↓
Response language
      ↓
TTS provider
```

Future specialized Indian-language voice providers can be added behind the voice abstraction.

---

# 59. Multilingual Preservation

Adding Hindi/Hinglish must not break the existing English pipeline.

Therefore:

- provider interfaces remain stable
- teaching contracts remain language-neutral
- visual plans remain language-neutral where possible
- TTS/STT providers are replaceable
- language selection remains explicit

---

# 60. Observability

AI orchestration should emit structured telemetry.

Useful events include:

```text
AI_REQUEST_STARTED
AI_REQUEST_COMPLETED
AI_REQUEST_FAILED
MODEL_SELECTED
PROVIDER_FALLBACK
INTENT_CLASSIFIED
TEACHING_GENERATED
VISUAL_GENERATED
TTS_STARTED
TTS_FAILED
TURN_INTERRUPTED
REPLAY_STARTED
ASSESSMENT_STARTED
ADAPTATION_TRIGGERED
```

Telemetry should help diagnose:

- latency
- failure rates
- provider performance
- model routing
- interruption behavior
- expensive operations

Do not expose internal telemetry to students.

---

# 61. AI Cost Awareness

The system should track model usage internally.

Potential metrics:

```text
Requests per model
Tokens per model
Average latency
Fallback rate
Failure rate
Average generation duration
```

The objective is not simply minimizing cost.

The objective is:

> **Maximum educational quality per unit of compute and latency.**

---

# 62. Security

AI outputs must be treated as untrusted generated data.

Validate:

- structured outputs
- URLs
- asset identifiers
- tool parameters
- database updates

Never allow arbitrary model output to execute privileged operations.

---

# 63. Long-Term Architecture

The system should be able to evolve from:

```text
Gemini
+
Groq
```

toward:

```text
             Lumo AI Layer
                   │
      ┌────────────┼────────────┐
      │            │            │
    Fast         Light          Pro
      │            │            │
   Provider      Provider      Provider
      │            │            │
      └────────────┼────────────┘
                   │
             Provider Pool
```

Providers and models can change without rewriting the product architecture.

---

# 64. Core Design Rules

### Rule 1

Do not use the strongest model for every request.

### Rule 2

Optimize live conversation for latency.

### Rule 3

Reserve heavyweight reasoning for genuinely complex tasks.

### Rule 4

Keep AI responsibilities modular.

### Rule 5

Keep application state deterministic.

### Rule 6

Validate AI outputs.

### Rule 7

Use structured contracts between AI and UI systems.

### Rule 8

Keep provider logic behind an abstraction.

### Rule 9

Never allow stale AI turns to mutate the live classroom.

### Rule 10

Use deterministic services whenever an LLM is unnecessary.

---

# 65. The Lumo AI Decision Tree

Conceptually:

```text
                    STUDENT INPUT
                         │
                         ▼
                  INPUT NORMALIZATION
                         │
                         ▼
                    INTENT ROUTER
                         │
              ┌──────────┼───────────┐
              │          │           │
           REPLAY    ASSESSMENT   NORMAL
              │          │           │
              ▼          ▼           ▼
        ReplayService Assessment   Complexity
                                      │
                              ┌───────┼───────┐
                              │       │       │
                            SIMPLE  MEDIUM  COMPLEX
                              │       │       │
                              ▼       ▼       ▼
                            FAST    LIGHT    PRO
                              │       │       │
                              └───────┼───────┘
                                      │
                                      ▼
                               TEACHING OUTPUT
                                      │
                         ┌────────────┼────────────┐
                         │            │            │
                         ▼            ▼            ▼
                       Speech       Visual      Interaction
                         │            │            │
                         └────────────┼────────────┘
                                      ▼
                                Learning Theater
                                      │
                                      ▼
                                Session Memory
```

---

# 66. Final Architecture Principle

Lumo should feel like **one AI tutor**.

Internally, it should behave like a coordinated intelligence system.

The student should never have to understand:

- which model answered
- which provider generated the response
- which service handled the request
- which model created the visual
- which subsystem evaluated the answer

unless they explicitly choose to explore those options.

The complexity belongs inside the system.

The experience should remain simple.

---

# 67. Final Definition

> **Lumo AI Orchestration is the intelligence layer that decides what kind of reasoning is required, selects the appropriate capability, coordinates teaching, assessment, visual generation, voice, memory, and adaptation, and delivers the result as one coherent tutoring experience.**

The fundamental principle is:

> **Fast when it can be. Deep when it must be. Adaptive when it matters. Invisible when it works.**

```

```
````
