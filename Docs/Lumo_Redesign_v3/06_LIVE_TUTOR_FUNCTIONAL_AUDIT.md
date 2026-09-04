# 06_LIVE_TUTOR_FUNCTIONAL_AUDIT.md

> **Status:** Functional Audit & Implementation Checklist
> **Version:** 3.0
> **Scope:** Existing Live Tutor frontend/backend functionality, missing functionality, UX gaps, integration gaps, and V3 implementation requirements
>
> **Depends on:**
>
> - `01_LUMO_V3_DESIGN_SYSTEM.md`
> - `02_LIVE_TUTOR_PRODUCT_ARCHITECTURE.md`
> - `03_LIVE_TUTOR_UI_SPECIFICATION.md`
> - `04_TUTOR_STATE_AND_INTERACTION_SPEC.md`
> - `05_SECONDARY_SURFACES_SPEC.md`
>
> **Purpose:** Audit what already exists, identify what is missing or incomplete, and prevent V3 UI work from accidentally breaking or duplicating existing infrastructure.

---

# 1. Purpose

Lumo already has substantial backend and frontend infrastructure.

The objective of V3 is NOT:

> "Rebuild Lumo from scratch."

The objective is:

> **Preserve the working product engine, improve weak areas, complete missing functionality, and rebuild the experience around a premium product architecture.**

The audit therefore separates functionality into:

```text
EXISTS
WORKS BUT NEEDS POLISH
PARTIALLY IMPLEMENTED
MISSING
NOT NEEDED YET
FUTURE
```

---

# 2. Audit Philosophy

Do not rewrite working systems simply because the UI is changing.

Before replacing any implementation:

1. Verify whether functionality already exists.
2. Verify whether it actually works.
3. Verify whether its API contract is usable.
4. Verify whether it supports V3 interaction requirements.
5. Only then decide whether modification is necessary.

---

# 3. Current Product Infrastructure

Known existing infrastructure includes:

```text
Frontend
React 18
TypeScript
Vite

Backend
Node.js
Express
TypeScript

Authentication
Firebase Auth

Database
MongoDB

AI Provider Layer
Gemini
Groq fallback

Key Management
KeyPool / API key rotation

Teaching Engine
TeacherEngine

Lesson Planning
LessonPlan contracts
Zod validation
Hybrid State Architecture

Session System
Teaching sessions
Session APIs

Visual Teaching
Lesson planner
Visual scene planning
Diagrams
Formulas
Animated teaching visuals
Beat synchronization

TTS
Voice generation infrastructure

STT
Speech input infrastructure
```

This infrastructure should be treated as the foundation of V3.

---

# 4. Functional Classification

Use the following labels during implementation:

### A — Working

Already functional and should primarily receive UI integration/polish.

### B — Working but Needs Improvement

Functional but UX, reliability, architecture, or capability needs refinement.

### C — Partial

Some implementation exists but does not satisfy V3 requirements.

### D — Missing

Must be implemented.

### E — Deferred

Useful eventually, but should not block V3.

### F — Remove / Hide

Existing UI functionality that currently provides insufficient value.

---

# 5. High-Level Audit

| Area                  | Current State    | V3 Action                          |
| --------------------- | ---------------- | ---------------------------------- |
| Authentication        | Working          | Preserve                           |
| MongoDB               | Working          | Preserve                           |
| AI Provider Layer     | Working          | Preserve                           |
| Key Rotation          | Working          | Preserve                           |
| Teacher Engine        | Working          | Preserve                           |
| Lesson Planning       | Working          | Preserve + polish                  |
| Visual Scene Planning | Existing         | Polish later                       |
| TTS                   | Existing         | Integrate deeply                   |
| STT                   | Existing         | Integrate deeply                   |
| Live Tutor State      | Partial          | Formalize                          |
| Tutor Avatar          | Placeholder      | Upgrade later                      |
| Lip Sync              | Missing          | Future / prototype                 |
| Ask Lumo              | Existing         | Redesign + model selector          |
| Timeline              | Existing concept | Redesign + audit persistence       |
| Transcript            | Existing concept | Redesign + audit persistence       |
| Settings              | Existing         | Redesign + improve voice selection |
| Materials             | Non-functional   | Hide/remove                        |
| Voice Preview         | Missing/partial  | Implement                          |
| Light Theme           | Existing/desired | Polish                             |
| Dark Theme            | Existing/desired | Rebuild                            |
| Responsive UI         | Partial          | Rework                             |
| Streaming             | Potential        | Evaluate                           |
| Interruption          | Required         | Implement/verify                   |
| Error Recovery        | Partial          | Formalize                          |
| Asset Library         | Future           | Defer                              |
| 3D Avatar             | Future           | Prototype after shell              |

---

# 6. Authentication

## Status

### A — Working

Firebase authentication already exists.

No reason to rebuild this for V3.

---

## V3 Requirements

The Live Tutor must correctly receive:

```text
authenticated user
user identity
session ownership
```

The redesign must not break:

- login
- signup
- logout
- authentication persistence

---

# 7. Database

## Status

### A — Working

MongoDB infrastructure already exists.

V3 should reuse existing models where practical.

---

## Audit

Verify persistence for:

```text
Teaching session
Lesson progress
Transcript
Timeline
User preferences
Tutor configuration
```

If a piece already persists correctly:

> Do not rewrite it.

---

# 8. AI Provider Layer

## Status

### A — Working

Gemini primary + Groq fallback infrastructure already exists.

Key pooling/rotation also exists.

---

# 9. V3 Requirement

The UI must not care which underlying provider handles the request.

The frontend should communicate with the tutor abstraction.

Conceptually:

```text
UI
 ↓
Tutor API
 ↓
Teacher Engine / AI Provider Layer
 ↓
Selected model/provider
```

Not:

```text
UI
 ↓
Gemini directly
```

---

# 10. Lumo Model Architecture

Lumo currently has three conceptual models:

```text
Lumo Fast
Lumo Light
Lumo Pro
```

These must become explicit product-level model choices.

---

# 11. Model Selection Audit

Required:

```text
Ask Lumo
 ↓
Model selector
 ↓
Fast / Light / Pro
 ↓
Backend receives selected model
 ↓
Correct routing
```

Audit questions:

- Does backend already accept a model identifier?
- Does the frontend currently expose model selection?
- Does Ask Lumo currently hardcode one model?
- Can model selection persist?
- Is model metadata preserved in conversation history?

---

# 12. Required Model Contract

Conceptually:

```text
model:
    lumo-fast
    lumo-light
    lumo-pro
```

The frontend should not send raw provider names.

Example:

Bad:

```text
gemini-2.5-flash
```

Preferred:

```text
lumo-fast
```

The provider layer determines what that means.

---

# 13. Teacher Engine

## Status

### A — Working

TeacherEngine already exists.

It should remain the primary orchestration layer for Live Tutor behavior.

---

# 14. Teacher Engine Audit

Verify:

```text
lesson context
student context
conversation context
current concept
current visual scene
student question
model selection
language
tutor state
```

The UI redesign should not duplicate this logic.

---

# 15. LessonPlan Contract

## Status

### A — Working

Zod contracts already exist.

V3 should consume the existing lesson structure rather than creating a separate frontend-specific lesson representation unnecessarily.

---

# 16. Teaching Session

## Status

### A / B — Existing

Teaching sessions already exist in MongoDB.

Audit:

```text
session creation
session retrieval
session resume
session updates
session completion
session ownership
```

---

# 17. Session Resume

Required behavior:

```text
User opens lesson
 ↓
Existing session detected
 ↓
Resume where appropriate
```

Refreshing the page must not unnecessarily create a duplicate session.

---

# 18. Session State

The session should maintain enough information to restore:

```text
lesson
current concept
progress
transcript
timeline
relevant preferences
```

Transient real-time states should not be persisted unnecessarily.

---

# 19. Speech Recognition

## Status

### A / B — Existing

STT infrastructure exists.

The primary V3 requirement is integration quality.

---

# 20. STT Audit

Verify:

```text
microphone permission
recording start
recording stop
speech detection
partial transcript
final transcript
silence detection
error handling
resource cleanup
```

---

# 21. STT → Tutor State

Required:

```text
IDLE
 ↓
microphone activated
 ↓
LISTENING
 ↓
speech complete
 ↓
THINKING
```

The UI must not independently guess when recording has ended.

---

# 22. Partial STT

If current STT infrastructure supports partial results:

Use them for subtle listening feedback.

Example:

```text
Why does the...
```

then:

```text
Why does the passenger move forward?
```

If partial results are unreliable:

> Keep them internal rather than exposing unstable text.

---

# 23. TTS

## Status

### A / B — Existing

TTS infrastructure exists.

V3 should make TTS a first-class interaction rather than treating it as a separate utility.

---

# 24. TTS Audit

Verify:

```text
voice selection
language
narration speed
audio generation
audio playback
audio cancellation
audio cleanup
error handling
```

---

# 25. Voice Selection

Current requirement:

Initial language support:

```text
English
Hinglish
Hindi
```

Voice selection should be tied to supported languages.

---

# 26. Voice Preview

## Status

### D — Missing / Needs Implementation

Required:

```text
Voice list
 ↓
Preview button
 ↓
Sample audio
 ↓
Select voice
 ↓
Future tutor speech uses selected voice
```

---

# 27. Voice Preview Requirements

Only one preview should play at a time.

Starting another preview must stop the previous preview.

Preview failure must not break the Live Tutor.

---

# 28. Voice Identity

Preview and actual TTS must reference the same voice identity.

Do not create:

```text
Preview voice A
Actual voice B
```

The user should hear exactly what they selected.

---

# 29. Narration Speed

## Status

### B — Existing / Needs Verification

Verify whether TTS already accepts speed.

Required UI values may include:

```text
0.75×
1.0×
1.25×
1.5×
```

The exact supported range should follow the actual TTS provider.

---

# 30. Language

## Status

### B — Existing / Needs Verification

Required:

```text
English
Hinglish
Hindi
```

Language selection should affect the appropriate layers:

```text
STT
 ↓
Teacher Engine
 ↓
Response
 ↓
TTS
 ↓
Subtitles
```

---

# 31. Language + Voice Compatibility

The UI must not allow impossible combinations.

Example:

```text
Hindi
 ↓
Only compatible voices
```

Changing language may update the available voice list.

---

# 32. Subtitles

## Status

### B — Existing / Needs Verification

Required:

```text
ON
OFF
```

Subtitles should synchronize with tutor speech where technically possible.

---

# 33. Subtitle Architecture

Preferred:

```text
Tutor response
 ↓
Speech segmentation / timing
 ↓
Subtitle timing
```

Fallback:

```text
Tutor response
 ↓
Approximate text progression
```

---

# 34. Tutor State Machine

## Status

### C — Needs Formalization

V3 requires explicit:

```text
IDLE
LISTENING
THINKING
SPEAKING
INTERRUPTED
ERROR
```

These states should be represented centrally.

---

# 35. Current State Audit

Determine whether current frontend has:

- independent booleans
- multiple loading flags
- audio-specific state
- microphone-specific state
- inconsistent speaking/listening flags

If so, consolidate them into a coherent tutor state model.

---

# 36. Avoid Boolean Explosion

Avoid architectures like:

```text
isListening
isSpeaking
isLoading
isProcessing
isGenerating
isPlaying
isInterrupted
hasError
```

where combinations can become contradictory.

Example:

```text
isListening = true
isSpeaking = true
```

This should be impossible.

Prefer an explicit state machine.

---

# 37. Speaking Interruption

## Status

### D / B — Required

The user must be able to interrupt Lumo.

Required:

```text
SPEAKING
 ↓
User interrupts
 ↓
Stop audio
 ↓
Stop avatar speech
 ↓
Cancel queued TTS
 ↓
LISTENING
```

---

# 38. Interruption Audit

Verify:

- audio stops immediately
- queued audio is cancelled
- stale TTS responses are ignored
- avatar stops speaking
- subtitle state resets
- microphone activates
- transcript remains coherent

---

# 39. Race Conditions

This is a high-priority technical audit.

Example:

```text
Request A
 ↓
Request B
 ↓
B finishes
 ↓
A finishes later
```

A must not overwrite B.

Use request/session identity or cancellation logic.

---

# 40. TTS Race Condition

Example:

```text
Response A
 ↓
TTS A

User interrupts

Response B
 ↓
TTS B

TTS A finishes late
```

TTS A must not restart or overwrite current audio state.

---

# 41. Avatar

## Status

### C — Placeholder

Current avatar implementation is not final.

The current emoji/rectangle treatment should not be considered the V3 visual solution.

---

# 42. Avatar V3 Strategy

Do NOT block the entire UI redesign waiting for the final avatar.

Implementation sequence:

```text
V3 shell
 ↓
Avatar integration boundary
 ↓
Temporary clean placeholder
 ↓
UI finalized
 ↓
3D avatar prototype
 ↓
Expressive states
 ↓
Lip sync
```

---

# 43. Avatar Component Contract

The UI should interact with an abstract tutor presence component.

Conceptually:

```text
TutorPresence
{
    state
    audioState
    expression
    speakingProgress
}
```

This allows the avatar implementation to change later without rebuilding the Live Tutor.

---

# 44. 3D Avatar

## Status

### E — Future / Prototype

Desired capabilities:

```text
3D model
expressions
head movement
idle animation
speaking animation
lip sync
contextual gestures
```

Do not block V3 shell completion on this.

---

# 45. Lip Sync

## Status

### D / E

Not required for the first UI shell iteration.

Architecture should support it.

Future pipeline:

```text
TTS
 ↓
audio
 ↓
phoneme / timing data
 ↓
avatar mouth
```

Fallback:

```text
audio amplitude
 ↓
approximate mouth movement
```

---

# 46. Visual Teaching Engine

## Status

### A / B — Existing

The existing lesson pipeline already supports:

```text
Lesson Planner
 ↓
Visual Scene Planning
 ↓
Diagrams
 ↓
Formula
 ↓
Visual Assets
 ↓
Beat synchronization
 ↓
Rendered teaching visuals
```

This is an important existing strength.

---

# 47. V3 Visual Engine Rule

Do NOT redesign the visual teaching engine during the initial Live Tutor shell redesign.

The first objective is:

> Make the environment that displays these visuals premium.

The visual-generation engine can then receive its own polish phase.

---

# 48. Visual Asset Library

## Status

### E — Future

Planned direction:

```text
Educational Asset Library
├── Cells
├── Balls
├── Arrows
├── Particles
├── Forces
├── Mathematical objects
├── Scientific apparatus
└── Other reusable assets
```

This should be treated as a future quality multiplier.

It is not required to complete the V3 shell.

---

# 49. Learning Canvas

## Status

### B — Existing but Needs UI Rework

The canvas already has the infrastructure to display teaching content.

V3 requirement:

> The canvas becomes the visual center of the product.

The canvas should not be trapped inside generic cards.

---

# 50. Ask Lumo

## Status

### B / C — Existing but Incomplete

Existing:

- doubt solver concept
- compact interface
- question interaction

Missing / required:

```text
Lumo Fast
Lumo Light
Lumo Pro
```

and real backend routing based on selection.

---

# 51. Ask Lumo Expansion

## Status

### B

Current compact interface should support:

```text
Compact
 ↓
Expand
 ↓
Focused workspace
```

The expanded version should reuse the same conversation state.

---

# 52. Ask Lumo Context

Audit whether Ask Lumo currently receives:

```text
current lesson
current concept
recent tutor conversation
current scene
```

If context already exists:

> Preserve it.

If missing:

> Add only the minimum context required to make Ask Lumo useful.

---

# 53. Ask Lumo Model Persistence

Possible behavior:

```text
User selects Pro
 ↓
asks question
 ↓
Pro responds
```

On reopening:

The selected model may remain Pro.

This should be treated as a user preference.

---

# 54. Timeline

## Status

### B / C

Current concept exists as "Notes" / timeline tracking.

The UI currently does not communicate the correct mental model.

V3 should rename/reframe it as:

> Timeline

---

# 55. Timeline Functional Audit

Verify:

```text
event creation
event persistence
timestamps
session position
replay point
concept association
interaction association
```

---

# 56. Timeline Event Quality

Avoid recording:

```text
every state change
every token
every audio event
```

Instead record meaningful moments.

---

# 57. Timeline Replay

Audit whether an event can actually navigate to the relevant session moment.

If replay is currently only visual:

> Complete the functional connection.

---

# 58. Transcript

## Status

### B / C

Conversation history already exists conceptually.

V3 should transform it from a generic chat sidebar into a session transcript.

---

# 59. Transcript Audit

Verify:

```text
user message
Lumo message
timestamp
interaction ID
session ID
model
interruption state
```

---

# 60. Transcript + Timeline

These should share identifiers.

Conceptually:

```text
Timeline Event
      │
      └── interactionId
                │
                ↓
          Transcript Message
```

This enables future navigation between them.

---

# 61. Transcript During Speaking

Transcript should update without interrupting the tutor.

The surface itself should not automatically open.

---

# 62. Settings

## Status

### B — Existing but Needs Major UX Rework

Current settings concept exists.

V3 should redesign it around:

```text
Language
Voice
Narration Speed
Subtitles
Theme
```

---

# 63. Settings Audit

Verify whether each setting actually affects runtime behavior.

A UI control that changes nothing is considered incomplete.

---

# 64. Settings → Backend

Required:

```text
Language
 ↓
Tutor/STT/TTS configuration

Voice
 ↓
TTS configuration

Narration speed
 ↓
TTS configuration

Subtitles
 ↓
UI state

Theme
 ↓
UI state / persistence
```

---

# 65. Materials

## Status

### F — Hide / Remove for V3

Current Materials functionality is non-functional.

Do not preserve it simply because it exists visually.

Recommendation:

> Remove it from the primary Live Tutor chrome for V3.

It can return once a meaningful Materials product has been defined.

---

# 66. Materials Future Definition

If brought back later, Materials could contain:

```text
uploaded PDFs
textbooks
reference documents
lesson resources
teacher resources
```

But this requires an actual product definition first.

---

# 67. Top Navigation

Current UI contains several controls.

V3 should reduce the number of visible controls.

Target conceptual set:

```text
Timeline
Transcript
Settings
```

Ask Lumo should remain a primary contextual action rather than a generic navigation item.

Materials should be hidden until functional.

---

# 68. Theme

## Status

### B — Existing / Needs Rework

Both themes must be first-class.

Required:

```text
Light
Dark
```

Dark should use charcoal/near-black rather than blue-gray.

---

# 69. Theme Persistence

Theme preference should persist.

Changing theme must not:

- reload the page
- reset the lesson
- interrupt audio
- destroy state

---

# 70. Responsive Behavior

## Status

### C — Needs Rework

Do not merely shrink desktop components.

Need separate compositions for:

```text
Desktop
Tablet
Mobile
```

---

# 71. Mobile Secondary Surfaces

Recommended:

```text
Ask Lumo
→ focused/full-height workspace

Timeline
→ sheet/full-height surface

Transcript
→ full-height conversation

Settings
→ full-height settings
```

---

# 72. Loading States

## Status

### B / C

Audit every async operation.

Required states:

```text
AI generation
TTS generation
STT
Ask Lumo
Timeline
Transcript
Voice preview
```

Every operation needs a designed loading state.

---

# 73. Error Handling

## Status

### B / C

Required categories:

```text
MICROPHONE_ERROR
STT_ERROR
MODEL_ERROR
TTS_ERROR
NETWORK_ERROR
SESSION_ERROR
UNKNOWN_ERROR
```

Each needs a recovery path.

---

# 74. Error Isolation

A failure in one subsystem should not crash the entire lesson.

Example:

```text
Voice preview fails
 ↓
Settings error
 ↓
Live Tutor continues
```

---

# 75. Offline / Network Behavior

At minimum:

If network connection fails:

```text
Current lesson remains visible
 ↓
User sees connection error
 ↓
Retry available
```

Do not blank the entire application.

---

# 76. Refresh Safety

Verify:

```text
refresh during idle
refresh during listening
refresh during thinking
refresh during speaking
```

Safe default:

```text
Transient state
→ recover to IDLE

Persistent session data
→ preserve
```

---

# 77. Browser Permission

Microphone permission flow must be explicitly tested.

States:

```text
not requested
granted
denied
blocked
```

---

# 78. Audio Cleanup

When audio interaction ends:

```text
microphone stream
TTS playback
audio buffers
event listeners
```

must be cleaned up.

Memory leaks in long tutoring sessions would be particularly damaging.

---

# 79. Long Session Stability

Test sessions lasting:

```text
15 minutes
30 minutes
60+ minutes
```

Verify:

- audio remains stable
- transcript doesn't explode rendering cost
- timeline remains usable
- memory usage stays reasonable
- avatar remains responsive
- lesson rendering remains smooth

---

# 80. Performance Audit

Potential heavy systems:

```text
Canvas animations
TTS
STT
Avatar
Subtitles
Transcript
Timeline
```

Avoid unnecessary React re-renders.

---

# 81. Transcript Performance

For long sessions:

Do not render hundreds/thousands of messages inefficiently.

Future-compatible architecture should support:

```text
virtualization
pagination
incremental loading
```

if needed.

---

# 82. Visual Rendering Performance

The UI redesign must not degrade existing teaching visuals.

Test:

```text
simple text lesson
diagram lesson
formula lesson
animated lesson
heavy visual scene
```

---

# 83. State Synchronization

Verify synchronization between:

```text
Tutor Engine
Frontend state
Audio
STT
TTS
Transcript
Timeline
Canvas
Avatar
```

No subsystem should independently believe a different tutor state.

---

# 84. Functional Dependency Graph

```text id="j7z8zq"
                 TEACHING SESSION
                        │
             ┌──────────┴──────────┐
             │                     │
        TEACHER ENGINE         LESSON PLAN
             │                     │
             └──────────┬──────────┘
                        │
                  TUTOR STATE
                        │
        ┌───────────────┼────────────────┐
        │               │                │
       STT             AI               TTS
        │               │                │
        └───────────────┼────────────────┘
                        │
                 LIVE TUTOR UI
                        │
       ┌────────────────┼────────────────┐
       │                │                │
    CANVAS           AVATAR          SUBTITLES
       │
       └───────────────┬────────────────┘
                       │
                SESSION RECORD
                       │
              ┌────────┴────────┐
              │                 │
          TIMELINE          TRANSCRIPT
```

Ask Lumo:

```text
Live Tutor
    ↓
Ask Lumo
    ↓
AI Provider Layer
```

Settings:

```text
User Preferences
    ↓
STT / TTS / Tutor / UI
```

---

# 85. Priority Matrix

## P0 — Must Work

```text
Live Tutor shell
Tutor state machine
STT
AI response
TTS
Microphone
Speaking
Listening
Interruption
Transcript
Session persistence
Ask Lumo
Model selection
Settings
Light/dark theme
```

---

# 86. P1 — Important Polish

```text
Voice preview
Better subtitle synchronization
Timeline replay
Responsive refinement
Error recovery
Performance optimization
Voice/language compatibility
Session resume refinement
```

---

# 87. P2 — Next Quality Layer

```text
3D avatar
Avatar expressions
Lip sync
Streaming responses
Streaming TTS
More advanced interruption detection
Asset library
Advanced replay
```

---

# 88. P3 — Future Product Expansion

```text
Material library
Advanced accessibility
Tutor personality controls
Advanced lesson analytics
Adaptive visual teaching
More languages
More voice providers
Advanced avatar gestures
```

---

# 89. Things NOT To Rebuild

Do not rebuild merely for V3:

```text
Firebase Auth
MongoDB infrastructure
AI provider abstraction
Key rotation
TeacherEngine
LessonPlan contracts
Existing session architecture
Existing visual scene planner
Existing visual generation pipeline
```

Unless the audit discovers an actual technical blocker.

---

# 90. Things That SHOULD Be Reworked

High-confidence V3 work:

```text
Live Tutor visual shell
Tutor state presentation
Secondary surfaces
Ask Lumo model selector
Settings UX
Voice selection
Voice preview
Timeline presentation
Transcript presentation
Theme system
Responsive composition
Avatar integration boundary
Error states
Loading states
Interruption UX
```

---

# 91. Things To Defer

Do not let these block the first redesign:

```text
Final 3D avatar
Perfect lip sync
Complete asset library
Advanced visual engine polish
Large multilingual expansion
Advanced lesson analytics
Full Materials system
```

---

# 92. Implementation Order

Recommended sequence:

```text
PHASE 1
Functional baseline audit
        ↓
Verify existing APIs and state

PHASE 2
V3 application shell
        ↓
Light / Dark
        ↓
Learning Canvas
        ↓
Tutor presence boundary

PHASE 3
Tutor state machine
        ↓
IDLE
LISTENING
THINKING
SPEAKING
INTERRUPTED
ERROR

PHASE 4
Voice interaction
        ↓
STT
        ↓
TTS
        ↓
Interruption
        ↓
Subtitles

PHASE 5
Secondary surfaces
        ↓
Ask Lumo
Timeline
Transcript
Settings

PHASE 6
Missing functionality
        ↓
Model selection
Voice preview
Preference persistence
Replay

PHASE 7
Responsive
        ↓
Desktop
Tablet
Mobile

PHASE 8
Polish
        ↓
Motion
        ↓
Loading
        ↓
Errors
        ↓
Performance

PHASE 9
Avatar prototype
        ↓
3D
        ↓
Expressions
        ↓
Lip sync
```

---

# 93. Functional Audit Checklist

Before declaring V3 Live Tutor complete:

## Core Tutor

- [ ] Lesson loads
- [ ] Session loads
- [ ] Tutor can listen
- [ ] STT works
- [ ] Tutor generates response
- [ ] TTS works
- [ ] Tutor speaks
- [ ] Tutor can be interrupted
- [ ] Tutor returns to listening
- [ ] Transcript persists
- [ ] Timeline persists
- [ ] Errors recover

---

## Ask Lumo

- [ ] Opens
- [ ] Compact mode works
- [ ] Expands
- [ ] Conversation works
- [ ] Fast works
- [ ] Light works
- [ ] Pro works
- [ ] Selected model reaches backend
- [ ] Context is preserved
- [ ] Conversation persists
- [ ] Errors recover

---

## Timeline

- [ ] Opens
- [ ] Meaningful events appear
- [ ] Timestamps work
- [ ] Events persist
- [ ] Events are selectable
- [ ] Replay/navigation works
- [ ] Transcript relationship works

---

## Transcript

- [ ] Opens
- [ ] User messages appear
- [ ] Lumo messages appear
- [ ] Live updates work
- [ ] Persistence works
- [ ] Timeline relationship works
- [ ] Long sessions remain performant

---

## Settings

- [ ] Language works
- [ ] Voice works
- [ ] Voice preview works
- [ ] Narration speed works
- [ ] Subtitles work
- [ ] Theme works
- [ ] Preferences persist
- [ ] Changes don't reset session

---

## Visual Teaching

- [ ] Text lesson works
- [ ] Diagram works
- [ ] Formula works
- [ ] Animated visual works
- [ ] Scene transitions work
- [ ] Canvas remains responsive

---

## Responsive

- [ ] Desktop
- [ ] Tablet
- [ ] Mobile
- [ ] Secondary surfaces
- [ ] Touch interactions
- [ ] Keyboard navigation

---

# 94. Backend Audit Questions

Before implementation, answer these questions from the actual codebase:

```text
1. What endpoint starts a teaching session?

2. What endpoint sends a student interaction?

3. Where is model selection represented?

4. Does Ask Lumo already support model selection?

5. Where is the selected voice stored?

6. Where is narration speed stored?

7. Where is language stored?

8. How is transcript persisted?

9. How are timeline events generated?

10. Can timeline events reference exact session positions?

11. Can TTS be cancelled?

12. Can STT be cancelled?

13. How does the system detect speech completion?

14. Can the AI response stream?

15. Can TTS stream?

16. How is session resume handled?

17. What happens if the browser refreshes?

18. What happens if a request finishes after cancellation?

19. What happens if TTS fails after AI succeeds?

20. What happens if the AI provider fails?

21. Does provider fallback already happen automatically?

22. Which existing state variables should be consolidated?

23. Which current frontend controls are connected to real APIs?

24. Which current UI controls are purely decorative?
```

These questions should be answered from the repository before modifying backend contracts.

---

# 95. Frontend Audit Questions

```text
1. Where is LiveTutor mounted?

2. What component currently owns tutor state?

3. Are there multiple competing state systems?

4. How is audio managed?

5. How is microphone permission handled?

6. How is STT handled?

7. How is TTS handled?

8. How are transcripts rendered?

9. How are timeline events rendered?

10. How do current sidebars open/close?

11. Is there already a modal/surface system?

12. Is there already a theme system?

13. Are light/dark tokens centralized?

14. Is there a global component library?

15. Which components can be reused?

16. Which components should be deleted?

17. Which current styles are global and dangerous to change?

18. Are animations implemented consistently?

19. Are there duplicated API calls?

20. Are there stale async state bugs?
```

---

# 96. Definition of "Existing"

A feature should only be marked:

> EXISTING / WORKING

if it passes an actual functional test.

A button rendering on screen does NOT count.

Example:

```text
Voice selector visible
```

does not mean:

```text
Voice selection works.
```

---

# 97. Definition of "Complete"

A feature is complete only when:

```text
UI
+
State
+
Backend
+
Persistence
+
Error handling
+
Responsive behavior
```

are all coherent.

---

# 98. V3 Functional Philosophy

The product already contains substantial technology.

The goal is not to add complexity for the sake of complexity.

Instead:

```text
Existing infrastructure
        ↓
Clean state model
        ↓
Premium interface
        ↓
Better interaction
        ↓
Better perceived intelligence
```

---

# 99. Most Important Technical Principle

> **Do not rebuild infrastructure to solve a visual problem.**

If the backend already generates:

- lessons
- diagrams
- formulas
- audio
- AI responses
- transcripts

then the first question should be:

> "How do we expose this beautifully?"

not:

> "Should we replace the whole stack?"

---

# 100. Most Important Product Principle

The existing backend can be extremely sophisticated.

The student should experience:

```text
Simple
Fast
Calm
Responsive
Intelligent
```

The complexity should remain behind the interface.

---

# 101. Final V3 Audit Outcome

After completing this audit, every Live Tutor feature must fall into one of these buckets:

```text
KEEP
 ↓
working infrastructure

IMPROVE
 ↓
functional but weak

COMPLETE
 ↓
partially implemented

ADD
 ↓
required missing capability

HIDE
 ↓
low-value / unfinished UI

DEFER
 ↓
future quality layer
```

---

# 102. Final Rule

> **V3 is not a rewrite. It is a productization pass.**

The backend already contains much of the intelligence.

The lesson engine already exists.

The visual engine already exists.

The AI provider layer already exists.

The session architecture already exists.

The opportunity now is to make all of those systems feel like they belong to **one deliberate, premium product**.

The redesign should therefore focus on:

```text
SYSTEM
   ↓
STATE
   ↓
INTERACTION
   ↓
VISUAL LANGUAGE
   ↓
PERCEIVED QUALITY
```

not on replacing technology simply because the current interface looks amateur.

---

# 103. Final North Star

When this audit is complete, we should be able to say:

> **"The engine was already there. V3 makes it feel like a product."**

```

```
