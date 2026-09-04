# 07_AVATAR_SYSTEM_SPEC.md

> **Status:** Avatar Architecture & Interaction Specification
> **Version:** 3.0
> **Scope:** Lumo visual identity, avatar placement, states, animation, audio synchronization, expression system, and future lip-sync architecture
>
> **Depends on:**
>
> - `01_LUMO_V3_DESIGN_SYSTEM.md`
> - `02_LIVE_TUTOR_PRODUCT_ARCHITECTURE.md`
> - `03_LIVE_TUTOR_UI_SPECIFICATION.md`
> - `04_TUTOR_STATE_AND_INTERACTION_SPEC.md`
> - `05_SECONDARY_SURFACES_SPEC.md`
> - `06_LIVE_TUTOR_FUNCTIONAL_AUDIT.md`
>
> **Purpose:** Define the architectural and visual foundation for Lumo's on-screen tutor presence without coupling the Live Tutor UI to a specific avatar technology.

---

# 1. Purpose

The avatar is not merely decoration.

Lumo is a live tutor.

The student should be able to perceive:

```text
Lumo is listening.
Lumo is thinking.
Lumo is explaining.
Lumo is waiting.
Lumo has finished.
Lumo was interrupted.
```

The avatar provides a visual representation of those states.

However:

> **The avatar must support the teaching experience, not compete with it.**

The lesson remains the primary product.

---

# 2. Core Philosophy

The avatar should communicate:

```text
Presence
+
Personality
+
Responsiveness
+
Emotion
+
Speech
```

without becoming:

```text
A mascot
+
A game character
+
A giant animated decoration
```

The desired feeling is:

> **A calm, intelligent tutor who happens to have a visual presence.**

---

# 3. The Current Avatar Problem

The current implementation is effectively:

```text
emoji
+
rectangle
+
generic UI container
```

This creates several problems.

### Problem 1 — No identity

The user sees an icon rather than a tutor.

### Problem 2 — No state communication

The avatar does not meaningfully communicate:

- listening
- thinking
- speaking
- interruption

### Problem 3 — No personality

An emoji cannot establish a consistent Lumo identity.

### Problem 4 — No future path

The current structure makes it difficult to evolve toward:

```text
3D avatar
+
expressions
+
speech animation
+
lip sync
```

---

# 4. V3 Avatar Goal

The V3 architecture should allow this progression:

```text
V3 Shell
    ↓
Clean avatar placeholder
    ↓
Static Lumo identity
    ↓
Animated presence
    ↓
3D avatar
    ↓
Facial expressions
    ↓
Speech animation
    ↓
Lip sync
    ↓
Contextual gestures
```

The first UI implementation does NOT need to complete the entire pipeline.

---

# 5. Avatar as a System

The avatar must be treated as a system rather than an image.

Conceptually:

```text
Tutor Engine
      ↓
Tutor State
      ↓
Avatar State
      ↓
Animation Controller
      ↓
Visual Renderer
```

The renderer may later change completely.

The contract should remain stable.

---

# 6. Avatar Component Boundary

The Live Tutor should communicate with one high-level component:

```text
<TutorPresence />
```

rather than directly manipulating:

```text
3D model
canvas
video
SVG
CSS animation
```

---

# 7. TutorPresence Contract

Conceptual interface:

```ts
type TutorPresenceState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "interrupted"
  | "error";
```

Potential component:

```ts
<TutorPresence
  state={tutorState}
  expression={expression}
  audioState={audioState}
  speakingProgress={speakingProgress}
/>
```

The exact implementation may differ.

The architectural principle should remain.

---

# 8. Separation of Concerns

The system must separate:

```text
Tutor State
```

from:

```text
Avatar Animation
```

Example:

```text
Tutor = SPEAKING
```

does not dictate exactly how the avatar animates.

Instead:

```text
SPEAKING
 ↓
Avatar Animation Controller
 ↓
Speaking animation
```

This allows future changes without rewriting tutor logic.

---

# 9. Avatar State Mapping

Initial mapping:

| Tutor State | Avatar Behavior                          |
| ----------- | ---------------------------------------- |
| IDLE        | Calm breathing / subtle idle             |
| LISTENING   | Attentive / engaged                      |
| THINKING    | Reflective / processing                  |
| SPEAKING    | Active facial + mouth animation          |
| INTERRUPTED | Brief transition / attention shift       |
| ERROR       | Neutral concern / restrained error state |

---

# 10. IDLE

Idle means:

> Lumo is present but not actively interacting.

Visual behavior:

- subtle breathing
- occasional natural movement
- relaxed expression
- low animation amplitude

Avoid:

- constant head movement
- exaggerated blinking
- floating
- glowing
- pulsing

The avatar should almost disappear into the environment when inactive.

---

# 11. LISTENING

Listening communicates:

> "I'm paying attention to you."

Possible behavior:

```text
slight forward attention
subtle eye focus
gentle nod
attentive expression
```

The movement should remain restrained.

Avoid:

```text
microphone animation
giant waveform
constant nodding
```

The microphone/input UI already communicates recording.

---

# 12. THINKING

Thinking communicates:

> "I'm processing what you said."

Possible behavior:

```text
slight gaze movement
subtle expression change
small head movement
quiet idle animation
```

Do NOT use:

```text
loading spinner on face
"thinking..." floating text
rapid blinking
AI sparkles
```

The system should feel intelligent rather than theatrical.

---

# 13. SPEAKING

Speaking is the most important avatar state.

The avatar should visibly communicate:

> **Lumo is actually speaking right now.**

At minimum:

```text
mouth movement
+
subtle facial animation
+
natural idle motion
```

Future:

```text
phoneme-level lip sync
+
expression
+
head movement
+
gestures
```

---

# 14. INTERRUPTED

When the student interrupts Lumo:

```text
SPEAKING
   ↓
INTERRUPTED
   ↓
LISTENING
```

The avatar should immediately stop speech animation.

It should not:

```text
finish the current sentence animation
continue mouth movement
remain frozen
```

---

# 15. ERROR

Error should not make the avatar look broken.

Use a restrained state.

Potential:

```text
neutral expression
slight concern
return to idle
```

The actual error message belongs to the UI.

The avatar should support the message, not replace it.

---

# 16. Avatar Placement

The avatar should occupy a meaningful position within the Live Tutor composition.

Preferred conceptual structure:

```text
┌────────────────────────────────────────────┐
│                                            │
│                LESSON CANVAS               │
│                                            │
│                                            │
│                         ┌──────────────┐   │
│                         │              │   │
│                         │    LUMO      │   │
│                         │   PRESENCE   │   │
│                         │              │   │
│                         └──────────────┘   │
│                                            │
│          interaction / controls            │
└────────────────────────────────────────────┘
```

The exact position is defined by the Live Tutor UI specification.

---

# 17. Avatar Hierarchy

The avatar should never dominate the learning content.

Priority:

```text
1. Teaching content
2. Tutor interaction
3. Tutor presence
4. Controls
5. Decorative elements
```

If the avatar becomes visually louder than the lesson:

> It is too large or too decorative.

---

# 18. Avatar Size

Avatar size should respond to context.

Potential states:

```text
Desktop:
medium / prominent

Tablet:
medium

Mobile:
compact
```

Do not hardcode a huge fixed avatar.

---

# 19. Avatar and Visual Lessons

When an important visual scene is being taught:

```text
Visual lesson
      >
Avatar
```

The avatar should yield visual priority.

Possible behavior:

```text
visual-heavy scene
 ↓
avatar becomes smaller / less prominent
```

The avatar remains present without competing with the diagram or animation.

---

# 20. Avatar and Text Lessons

During conversational explanations:

```text
Text / explanation
+
Avatar
```

The avatar may receive slightly more prominence.

This creates a dynamic visual hierarchy.

---

# 21. Avatar and Diagrams

During a diagram explanation:

```text
Diagram
      ↓
Primary focus

Lumo
      ↓
Supporting presence
```

The avatar should not cover important content.

---

# 22. Avatar and Formulas

During formula explanations:

```text
Formula
 ↓
primary

Avatar
 ↓
secondary
```

The formula should remain legible.

---

# 23. Avatar Container

Avoid:

```text
large rounded rectangle
+
emoji
+
border
+
shadow
```

This is the current amateur pattern.

Instead, the avatar should feel embedded into the environment.

---

# 24. Avatar Background

Preferred:

```text
transparent / environmental
```

or:

```text
very subtle surface
```

Avoid:

```text
neon circle
gradient blob
glowing orb
generic AI halo
```

---

# 25. Avatar Lighting

If using 3D:

Lighting should be:

```text
soft
studio-like
consistent
warm-neutral
```

Avoid:

```text
cyberpunk lighting
blue/purple rim light
strong neon glow
gaming aesthetic
```

Lumo is an educational product, not a gaming interface.

---

# 26. Avatar Visual Identity

Lumo should eventually have a recognizable visual identity.

The avatar should communicate:

```text
intelligent
friendly
calm
modern
professional
approachable
```

Avoid making it:

```text
too childish
too corporate
too robotic
too realistic
too cartoonish
```

The final balance should feel intentional.

---

# 27. 3D Avatar Direction

The long-term direction is a 3D tutor.

Desired qualities:

```text
stylized realism
clean materials
subtle facial detail
natural proportions
professional appearance
```

Avoid:

```text
hyper-realistic human
uncanny realism
game NPC appearance
generic AI woman/man
anime mascot
```

---

# 28. 3D Model Requirements

Future avatar should support:

```text
head rotation
eye movement
blinking
mouth movement
facial expressions
jaw movement
basic gestures
idle animation
speaking animation
```

---

# 29. Avatar Rigging

The 3D avatar should ideally be rigged for:

```text
facial expressions
jaw
lips
eyes
eyelids
head
neck
upper body
```

A facial rig is significantly more valuable than having dozens of body gestures.

---

# 30. Expression System

Expressions should be semantic.

Conceptual values:

```ts
type TutorExpression =
  | "neutral"
  | "warm"
  | "curious"
  | "focused"
  | "encouraging"
  | "surprised"
  | "concerned"
  | "celebratory";
```

The Teacher Engine should not directly manipulate facial bones.

---

# 31. Expression Mapping

Example:

```text
Student answers correctly
        ↓
encouraging

Student asks question
        ↓
curious

Complex explanation
        ↓
focused

Student makes mistake
        ↓
warm / encouraging

Important discovery
        ↓
surprised / excited
```

Keep expressions subtle.

---

# 32. Expression Intensity

Expressions should support intensity:

```text
0.0
0.25
0.5
0.75
1.0
```

Most tutoring interactions should remain around:

```text
0.25–0.6
```

Avoid cartoon-level expression.

---

# 33. Expression Priority

If multiple expression signals occur:

```text
explicit teaching emotion
>
interaction emotion
>
default state emotion
>
idle
```

The system should blend rather than abruptly switch.

---

# 34. Expression Transitions

Do not instantly snap:

```text
neutral
 ↓
excited
```

Use short transitions.

Conceptually:

```text
neutral
   ↓
blend
   ↓
excited
```

This prevents robotic animation.

---

# 35. Idle Animation

Idle animation should be subtle.

Possible components:

```text
breathing
micro head movement
blinking
eye movement
small posture changes
```

These should have slightly randomized timing.

Perfectly periodic animation looks artificial.

---

# 36. Blinking

Blinking should:

- occur naturally
- not happen too frequently
- pause or change during speech when appropriate
- never be synchronized to a fixed timer only

---

# 37. Eye Movement

Future system should allow:

```text
look at camera
look toward lesson
look toward highlighted visual
look toward student interaction
```

This is especially valuable when visual teaching becomes more advanced.

---

# 38. Gaze Architecture

Conceptually:

```text
Teaching Context
      ↓
Gaze Target
      ↓
Avatar Controller
      ↓
Eye / Head movement
```

Example:

```text
Formula appears
 ↓
Lumo gaze subtly shifts toward formula
```

This can dramatically improve perceived intelligence.

---

# 39. Avatar → Visual Scene Relationship

Future advanced interaction:

```text
Lumo explains
 ↓
diagram highlights object
 ↓
Lumo gaze follows object
```

This creates a coherent teacher presence.

It should be treated as a future enhancement.

---

# 40. Speech Animation

At minimum:

```text
TTS playing
 ↓
Avatar speaking animation
```

The animation should stop immediately when TTS stops.

---

# 41. Speaking Progress

The avatar system should optionally receive:

```ts
speakingProgress: number;
```

where:

```text
0 → beginning
1 → finished
```

This enables future synchronization.

---

# 42. Audio Synchronization

Architecture:

```text
TTS
 ↓
Audio Playback
 ↓
Playback Clock
 ↓
Avatar Animation
```

The avatar should synchronize with actual playback time rather than AI generation time.

---

# 43. Why Playback Time Matters

AI generation can finish before audio starts.

Therefore:

```text
AI response complete
```

does NOT mean:

```text
avatar should start speaking
```

Correct:

```text
TTS audio begins
 ↓
avatar begins speaking
```

---

# 44. TTS Cancellation

When audio stops:

```text
audio stopped
 ↓
avatar speaking animation stopped
 ↓
mouth closed
 ↓
return to appropriate state
```

Never allow the avatar to continue speaking after audio ends.

---

# 45. Future Lip Sync

Long-term architecture:

```text
Tutor response
      ↓
TTS generation
      ↓
Audio
      +
phoneme / viseme timing
      ↓
Lip Sync Controller
      ↓
Avatar mouth
```

---

# 46. Viseme Architecture

The avatar should eventually use visemes rather than simply opening/closing the mouth.

Conceptually:

```text
phoneme
 ↓
viseme
 ↓
mouth pose
```

Examples:

```text
A
E
I
O
U
M/B/P
F/V
TH
S/Z
SH/CH
L
R
```

The exact mapping depends on the avatar rig.

---

# 47. Lip Sync Fallback

If phoneme timing is unavailable:

```text
Audio amplitude
 ↓
mouth openness
```

can provide approximate synchronization.

This is acceptable as an early prototype.

It should not be considered final-quality lip sync.

---

# 48. Lip Sync Latency

Target:

> Avatar speech should begin essentially with audio playback.

Avoid visible delays between:

```text
audio starts
```

and:

```text
mouth starts
```

Even small delays can make the avatar feel fake.

---

# 49. Lip Sync Interruption

If the user interrupts:

```text
TTS cancellation
 ↓
lip sync cancellation
 ↓
mouth closes
 ↓
expression transitions
 ↓
LISTENING
```

All animation queues must be cancelled.

---

# 50. Streaming Lip Sync

Future architecture may support:

```text
LLM streaming
 ↓
TTS streaming
 ↓
audio chunks
 ↓
viseme timing
 ↓
real-time avatar
```

This is a future optimization.

Do not block initial V3 implementation on it.

---

# 51. Avatar Animation Controller

The animation controller should sit between tutor state and renderer.

Conceptually:

```text
TutorState
     ↓
AvatarStateMapper
     ↓
AnimationController
     ↓
Renderer
```

This is important.

It prevents application logic from becoming coupled to Three.js, Ready Player Me, Live2D, video, or another future technology.

---

# 52. Renderer Independence

Potential future renderers:

```text
CSS / SVG
Canvas
Three.js
React Three Fiber
Video
Pre-rendered animation
External avatar SDK
```

The rest of the application should not care.

---

# 53. Avatar API

Conceptual:

```ts
interface TutorPresenceController {
  setState(state: TutorPresenceState): void;

  setExpression(expression: TutorExpression, intensity?: number): void;

  setGazeTarget(target: GazeTarget): void;

  startSpeaking(metadata?: SpeakingMetadata): void;

  stopSpeaking(): void;

  interrupt(): void;
}
```

Exact API may evolve.

---

# 54. Avatar Events

Potential events:

```text
avatar.speaking.started
avatar.speaking.ended
avatar.expression.changed
avatar.interrupted
avatar.ready
avatar.error
```

These may be useful for telemetry/debugging.

---

# 55. Avatar Loading

A future 3D avatar may take time to initialize.

Required states:

```text
loading
ready
error
```

During loading:

> Use a clean temporary presence state.

Do not show:

```text
broken model
empty rectangle
giant spinner
```

---

# 56. Avatar Failure

If the avatar fails:

```text
Avatar unavailable
```

should NOT mean:

```text
Tutor unavailable
```

The lesson and audio should continue.

Fallback:

```text
minimal Lumo presence
```

---

# 57. Avatar Error Isolation

Architecture:

```text
Avatar failure
      ↓
Fallback renderer
      ↓
Tutor continues
```

not:

```text
Avatar failure
      ↓
React tree crashes
      ↓
Lesson disappears
```

---

# 58. Avatar Accessibility

The avatar is not the sole communication mechanism.

Important information must also exist in:

- text
- subtitles
- UI state
- accessible labels

A user should understand:

```text
Lumo is listening
```

without seeing the avatar.

---

# 59. Reduced Motion

If the user prefers reduced motion:

```text
complex avatar animation
 ↓
minimal animation
```

Lip sync may remain if needed for speech comprehension, but decorative movement should be reduced.

---

# 60. Audio-Only Fallback

If avatar rendering is unavailable:

```text
TTS
+
subtitles
+
minimal presence indicator
```

must still create a coherent tutor experience.

---

# 61. Dark Mode Avatar

The avatar should integrate with the dark environment.

Avoid:

```text
glowing blue edges
purple aura
neon outline
```

Preferred:

```text
soft lighting
natural contrast
subtle depth
```

---

# 62. Light Mode Avatar

The same avatar identity should work in light mode.

Do not create:

```text
dark-mode avatar
```

and:

```text
light-mode avatar
```

as completely different characters.

Lighting/material adaptation is acceptable.

Identity must remain consistent.

---

# 63. Avatar Accent

The global Lumo accent may occasionally appear through:

- subtle lighting
- small UI state indicator
- selected state
- minimal environmental detail

Do not color the entire avatar with the accent.

---

# 64. Avatar Motion Budget

The avatar has a motion budget.

During normal tutoring:

```text
Low → Medium
```

During important moments:

```text
Medium
```

Never:

```text
Constant high-energy animation
```

The lesson should remain calm.

---

# 65. Teaching Context

The avatar should eventually understand the context of the lesson.

Potential contextual signals:

```text
concept
difficulty
student correctness
student confusion
visual emphasis
lesson milestone
```

These can drive subtle expressions.

---

# 66. Correct Answer

When the student answers correctly:

```text
Teacher Engine
 ↓
correct
 ↓
encouraging expression
 ↓
subtle nod
```

Do not use:

```text
confetti
huge smile
celebration animation
```

unless the product intentionally introduces a stronger celebration mode.

---

# 67. Student Mistake

When the student is wrong:

Lumo should appear:

```text
warm
patient
encouraging
```

Never:

```text
disappointed
angry
mocking
```

The avatar should reinforce psychological safety.

---

# 68. Student Confusion

When the system detects confusion:

```text
curious / attentive
 ↓
simplification
 ↓
supportive expression
```

The avatar should feel like it is adapting.

---

# 69. Concept Completion

At lesson milestones:

```text
concept complete
 ↓
subtle positive expression
```

Avoid excessive celebration.

---

# 70. Avatar and Ask Lumo

Ask Lumo is a secondary conversational surface.

The primary avatar should generally remain in the background.

If Ask Lumo is expanded:

```text
Ask Lumo
 ↓
conversation becomes primary
```

The avatar may be reduced or omitted.

---

# 71. Avatar and Settings

Settings should not show a large avatar.

The avatar is not relevant to most configuration tasks.

Voice selection may include a tiny preview identity, but should not duplicate the full tutor presence.

---

# 72. Avatar and Timeline

Timeline should not animate the avatar.

Timeline is navigation/history.

Selecting a timeline event may later update the avatar state when replay begins.

---

# 73. Avatar and Transcript

Transcript may show:

```text
Lumo
```

as a text identity.

Do not place the full 3D avatar beside every transcript message.

---

# 74. Avatar Performance

A 3D avatar must not destroy lesson performance.

Monitor:

```text
FPS
GPU usage
CPU usage
memory
canvas rendering
animation cost
```

The avatar should gracefully reduce quality if required.

---

# 75. Quality Levels

Future avatar rendering may support:

```text
High
Medium
Low
Fallback
```

This can be based on device capability.

---

# 76. Mobile Avatar

On mobile, the avatar must be significantly more restrained.

The student has less screen space.

Recommended:

```text
small presence
+
speech animation
+
clear state
```

not:

```text
large 3D character occupying half the viewport
```

---

# 77. Mobile Visual Teaching

When a visual scene appears:

```text
Visual
>
Avatar
```

The avatar may become smaller automatically.

---

# 78. Desktop Visual Teaching

Desktop provides more room.

The avatar may occupy a dedicated presence zone without obstructing content.

---

# 79. Avatar Positioning System

Position should be context-aware.

Conceptual:

```ts
type AvatarLayoutMode =
  | "standard"
  | "compact"
  | "visual-focus"
  | "conversation"
  | "mobile";
```

---

# 80. Standard Mode

Normal tutoring:

```text
medium avatar
+
comfortable presence
```

---

# 81. Visual-Focus Mode

When a diagram/formula/animation becomes dominant:

```text
smaller avatar
+
reduced animation
```

---

# 82. Conversation Mode

When the tutor is explaining something conversationally:

```text
slightly stronger avatar presence
```

Still subordinate to the lesson.

---

# 83. Mobile Mode

```text
compact avatar
+
minimal movement
```

---

# 84. Avatar Transition Between Modes

Transitions should be smooth.

Example:

```text
STANDARD
   ↓
VISUAL FOCUS
   ↓
avatar scales down subtly
```

No abrupt disappearance.

---

# 85. Do Not Overdesign the Avatar

The avatar itself must follow the same V3 principles:

```text
negative space
restraint
clarity
premium materials
subtle motion
strong typography around it
```

Do not compensate for weak product design by making the avatar flashy.

---

# 86. Avatar Anti-Patterns

Do NOT use:

```text
❌ Emoji inside rectangle
❌ Generic AI robot
❌ Glowing orb
❌ Neon face
❌ Floating hologram
❌ Constant talking animation
❌ Excessive head movement
❌ Fake waveform around head
❌ Giant avatar card
❌ Anime mascot unless deliberately chosen as the brand
❌ Stock human video pretending to be AI
❌ Random avatar generated independently of Lumo's design system
```

---

# 87. The "AI Slop" Test

If the avatar includes:

```text
gradient glow
+
floating particles
+
neon ring
+
AI sparkles
+
glass card
```

the design has probably failed.

The avatar should feel like a product identity, not an AI landing-page illustration.

---

# 88. Avatar Design Test

Ask:

### Identity

Would someone recognize Lumo without the logo?

### Presence

Does the avatar feel alive?

### Restraint

Does it avoid distracting from learning?

### State

Can the user understand what Lumo is doing?

### Consistency

Does it work in light and dark modes?

### Future-proofing

Can it become a fully rigged 3D tutor without changing the application architecture?

---

# 89. V3 Initial Implementation

The first V3 implementation should NOT attempt to build the final 3D avatar.

Instead:

```text
TutorPresence component
        ↓
Clean visual placeholder
        ↓
Correct sizing
        ↓
Correct placement
        ↓
Correct states
        ↓
Correct animation hooks
```

This allows the product shell to stabilize first.

---

# 90. Avatar Prototype Phase

After the shell is stable:

```text
Phase A
Static 3D model

Phase B
Idle animation

Phase C
Listening / thinking states

Phase D
Speaking animation

Phase E
Expressions

Phase F
Lip sync

Phase G
Gaze

Phase H
Contextual gestures
```

---

# 91. Recommended Prototype Scope

The first 3D prototype only needs:

```text
3D model
idle animation
blink
simple facial expressions
basic mouth movement
```

Do not immediately build:

```text
complex gestures
full body animation
perfect phoneme mapping
```

---

# 92. Lip Sync Prototype Scope

First prototype:

```text
TTS audio
 ↓
amplitude analysis
 ↓
mouth openness
```

Then:

```text
phoneme/viseme timing
 ↓
accurate lip sync
```

---

# 93. Final Lip Sync Architecture

Target:

```text
                 TUTOR ENGINE
                      │
                      ▼
                TEXT RESPONSE
                      │
              ┌───────┴────────┐
              │                │
              ▼                ▼
             TTS         SUBTITLE ENGINE
              │
              ▼
         AUDIO STREAM
              │
        ┌─────┴─────┐
        │           │
        ▼           ▼
    PLAYBACK    VISEME DATA
        │           │
        └─────┬─────┘
              ▼
       LIP SYNC ENGINE
              │
              ▼
       AVATAR RENDERER
```

---

# 94. Final Avatar Architecture

```text
                         LUMO
                          │
                    Teacher Engine
                          │
                    Tutor State
                          │
                ┌─────────┴─────────┐
                │                   │
          Expression          Speaking State
                │                   │
                └─────────┬─────────┘
                          │
                 Avatar Controller
                          │
          ┌───────────────┼───────────────┐
          │               │               │
        Gaze          Animation        Lip Sync
          │               │               │
          └───────────────┼───────────────┘
                          │
                    Avatar Renderer
                          │
                 ┌────────┴────────┐
                 │                 │
              3D Model          Fallback
```

---

# 95. Definition of Done — V3 Shell

Avatar system is considered ready for initial V3 when:

- [ ] TutorPresence component exists
- [ ] Avatar has a defined placement
- [ ] Avatar does not use the current emoji-in-rectangle treatment
- [ ] IDLE state exists
- [ ] LISTENING state exists
- [ ] THINKING state exists
- [ ] SPEAKING state exists
- [ ] INTERRUPTED state exists
- [ ] ERROR state exists
- [ ] Avatar does not obstruct visual lessons
- [ ] Light mode works
- [ ] Dark mode works
- [ ] Mobile behavior exists
- [ ] Avatar can be replaced without rewriting tutor logic

---

# 96. Definition of Done — 3D Prototype

Later:

- [ ] 3D model integrated
- [ ] Rig works
- [ ] Idle animation works
- [ ] Blinking works
- [ ] Listening animation works
- [ ] Thinking animation works
- [ ] Speaking animation works
- [ ] Expressions work
- [ ] Performance acceptable
- [ ] Fallback exists

---

# 97. Definition of Done — Final Avatar

Eventually:

- [ ] High-quality 3D model
- [ ] Strong Lumo identity
- [ ] Natural facial animation
- [ ] Natural blinking
- [ ] Eye/gaze system
- [ ] Expression system
- [ ] Audio-synchronized speech
- [ ] Accurate lip sync
- [ ] Interruption-safe animation
- [ ] Contextual expressions
- [ ] Visual-scene awareness
- [ ] Responsive scaling
- [ ] Light/dark integration
- [ ] Mobile optimization
- [ ] Performance fallback

---

# 98. Most Important Product Rule

> **The avatar is Lumo's presence, not Lumo's product.**

The student comes to learn.

The lesson is the product.

The AI is the intelligence.

The avatar is the human-facing presence that makes that intelligence feel alive.

---

# 99. Final North Star

The desired progression is:

```text
CURRENT

Emoji
  ↓
Rectangle
  ↓
Generic AI UI
```

to:

```text
LUMO V3

Lesson
  ↓
Tutor Presence
  ↓
Natural Interaction
  ↓
Expressive Avatar
  ↓
Real-Time Speech
  ↓
Lip Sync
  ↓
Context-Aware Teaching
```

The final experience should make the student think:

> **"Lumo is actually here teaching me."**

Not:

> "There is an AI character on the screen."

---

# 100. Final Rule

> **Build the avatar architecture now. Build the final avatar later.**

The V3 Live Tutor must already have the correct space, hierarchy, state model, animation boundary, and integration contracts for the eventual avatar.

That way, when the final 3D Lumo arrives, we are plugging a better presence into an already-premium product — not rebuilding the product around the avatar.

```

```
