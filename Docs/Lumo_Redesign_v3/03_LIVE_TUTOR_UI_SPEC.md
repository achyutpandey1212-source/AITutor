# Lumo V3 — Live Tutor UI Specification

> **Status:** Implementation Blueprint
> **Version:** 3.0
> **Depends on:**
>
> - `01_LUMO_V3_DESIGN_SYSTEM.md`
> - `02_LIVE_TUTOR_PRODUCT_ARCHITECTURE.md`
>
> **Scope:** Live AI Tutor primary interface and its secondary interaction surfaces
>
> **Goal:** Transform the existing Live Tutor into a premium, focused, product-level learning environment while preserving existing functionality and backend infrastructure.

---

# 1. Purpose

This document defines the actual UI architecture for the Lumo V3 Live Tutor.

It translates the product architecture into:

- screen structure
- spatial hierarchy
- component responsibilities
- persistent controls
- contextual controls
- secondary surfaces
- interaction states
- responsive behavior
- light/dark behavior
- motion requirements

This document does NOT redefine Lumo's visual design language.

The visual rules are defined in:

`01_LUMO_V3_DESIGN_SYSTEM.md`

This document does NOT redefine backend architecture.

Existing backend infrastructure should be preserved wherever possible.

---

# 2. Core UI Philosophy

The Live Tutor should feel like a focused workspace.

The user should immediately understand:

```text
WHAT AM I LEARNING?
        ↓
WHAT IS LUMO DOING?
        ↓
WHAT CAN I DO?
```

````

The interface should not require the student to inspect multiple panels before understanding the current lesson.

---

# 3. Primary Screen Model

The default Live Tutor screen is conceptually divided into four zones:

```text
┌──────────────────────────────────────────────────────────┐
│                    TOP CHROME                            │
│                                                          │
│  Lumo      Lesson / Concept          Session Tools       │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│                                                          │
│                                                          │
│                 LEARNING CANVAS                          │
│                                                          │
│              Visual teaching area                        │
│                                                          │
│                                                          │
│                                     LUMO                 │
│                                  tutor presence           │
│                                                          │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                  TUTOR INTERACTION                       │
│                                                          │
│              listening / speaking / input                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

This is a conceptual structure, not a requirement for visible rectangular boundaries.

The final interface should NOT look like four stacked boxes.

---

# 4. Spatial Hierarchy

The approximate visual priority is:

```text
Learning Canvas       60–70%
Tutor Presence        10–20%
Primary Interaction   10–15%
Navigation / Tools     5–10%
```

These are visual-priority guidelines rather than fixed dimensions.

The actual allocation should adapt to the lesson content and viewport.

---

# 5. Top Chrome

The top area should be intentionally minimal.

It should communicate:

- Lumo identity
- current lesson
- current concept/progress
- access to session tools
- access to settings

It should NOT resemble a traditional website navbar.

---

# 6. Top Left — Lumo Identity

The top-left should establish Lumo's presence.

Potential structure:

```text
Lumo

Physics
Laws of Motion
```

or:

```text
Lumo
Laws of Motion
```

The exact textual hierarchy may change depending on available space.

The brand should remain quiet.

Do not use:

- giant logo
- gradient logo
- glowing logo
- excessive branding

---

# 7. Lesson Context

The lesson context should provide orientation without consuming significant space.

Example:

```text
Laws of Motion
Concept 2 of 5
```

Possible future implementation:

```text
Laws of Motion
Newton's First Law
```

Progress can be represented using:

- subtle text
- tiny progress indicator
- understated progress line

Avoid giant progress bars.

---

# 8. Top Right — Session Controls

The top-right contains secondary tools.

Initial functionality:

```text
Timeline
Transcript
Settings
```

The current "Materials" control should NOT automatically be retained.

If it has no meaningful functionality, it should be hidden until a real Materials experience exists.

---

# 9. Session Controls — Visual Behavior

Controls should appear as quiet icon/text controls.

Example:

```text
Timeline    Transcript    Settings
```

or, at tighter widths:

```text
[Timeline icon] [Transcript icon] [Settings icon]
```

Avoid:

```text
[ NOTES ] [ MATERIALS ] [ MORE ] [ SETTINGS ]
```

as a row of large pill buttons.

The latter creates dashboard-like visual noise.

---

# 10. Learning Canvas

The Learning Canvas is the dominant region.

It should have no unnecessary visible container.

Avoid:

```text
┌──────────────────────────────┐
│                              │
│       Lesson Card            │
│                              │
└──────────────────────────────┘
```

Prefer:

```text
background

          Lesson content

     diagram / formula / scene


```

The environment itself is the canvas.

---

# 11. Canvas Content

The canvas may render:

- text
- diagrams
- formulas
- illustrations
- animated objects
- visual scenes
- examples
- generated educational content
- synchronized elements

The UI must never assume that the content is static.

The canvas should support transitions between scenes.

---

# 12. Canvas Safe Zones

The UI must reserve space around important interactive elements.

Suggested safe zones:

```text
Top:
Lesson context

Center:
Teaching content

Lower region:
Tutor interaction

Tutor presence:
Corner / contextual position
```

Visual lesson content should never be hidden underneath controls or the avatar.

---

# 13. Dynamic Canvas Layout

The canvas may adapt based on lesson content.

For example:

### Diagram-heavy lesson

The diagram receives maximum space.

### Formula-heavy lesson

Formula and supporting explanation receive maximum space.

### Conversation-heavy moment

The visual canvas may become quieter while tutor presence becomes more prominent.

The UI must support dynamic composition.

---

# 14. Tutor Presence

The tutor should have a persistent but restrained visual presence.

The final implementation is expected to support a premium 3D avatar.

The avatar should not be trapped inside a generic card.

Avoid:

```text
┌─────────────────┐
│      👨‍🏫        │
│      Lumo       │
└─────────────────┘
```

Instead, the avatar should feel integrated into the environment.

---

# 15. Avatar Position

Default positioning should likely be near the lower-right region of the learning canvas.

Conceptually:

```text
┌─────────────────────────────────────────┐
│                                         │
│            LESSON CONTENT               │
│                                         │
│                                         │
│                           Lumo           │
│                         avatar          │
└─────────────────────────────────────────┘
```

However, avatar placement must remain adaptive.

If visual content occupies the right side, the avatar may reposition.

The avatar should never cover important educational content.

---

# 16. Avatar Scale

The avatar should be:

- large enough to feel like a tutor
- small enough to preserve learning content

It should NOT dominate the screen.

The avatar is the teacher's presence, not the lesson itself.

---

# 17. Avatar States

The UI must visually accommodate:

```text
IDLE
LISTENING
PROCESSING
SPEAKING
INTERRUPTED
ERROR
```

The final avatar implementation will consume these states.

The UI should not hardcode animations directly into unrelated components.

---

# 18. Avatar — Speaking

When Lumo speaks:

- avatar becomes subtly more active
- mouth animation eventually synchronizes with speech
- subtitles appear if enabled
- lesson visuals may continue to change

The interface should avoid excessive speaking effects.

No:

- giant waveform
- neon glow
- flashing border
- bouncing avatar

The speaking state should feel alive, not theatrical.

---

# 19. Avatar — Listening

Listening should be immediately understandable.

Potential signals:

- subtle accent
- small microphone state
- gentle animation
- slight avatar attention shift

The student should understand:

> Lumo is listening to me.

without needing a textual explanation.

---

# 20. Avatar — Processing

Processing should feel intelligent but quiet.

Avoid giant loading animations.

Preferred:

- subtle motion
- restrained indicator
- natural transition

The user should not feel that the product is "waiting for an API."

---

# 21. Tutor Interaction Zone

The primary interaction area sits toward the bottom of the screen.

It should be minimal.

Conceptually:

```text
              Lumo is listening...

                   [ ● ]

              Speak naturally
```

or during speaking:

```text
              Lumo is explaining...

            "Inertia is the tendency..."
```

The exact presentation depends on state.

---

# 22. Voice Interaction

Voice is the primary interaction mechanism.

The interface should allow:

```text
Start listening
      ↓
Student speaks
      ↓
Listening state
      ↓
Processing
      ↓
Lumo speaks
      ↓
Student can interrupt
```

The microphone interaction must feel like the center of the Live Tutor.

---

# 23. Microphone Control

The microphone control should be:

- immediately discoverable
- visually dominant enough to find
- not oversized
- clearly stateful

States:

```text
Inactive
Listening
Processing
Unavailable
```

The button must clearly communicate its current state.

---

# 24. Text Fallback

Voice-first does not mean voice-only.

A text fallback should exist for:

- users who cannot use microphone
- microphone failures
- accessibility
- quiet environments
- quick questions

The text interaction should remain visually secondary.

---

# 25. Subtitles

Subtitles should appear near the tutor / lower content region without blocking the lesson.

They should:

- be readable
- synchronize with speech
- support light/dark themes
- remain unobtrusive

Avoid permanent giant subtitle boxes.

---

# 26. Subtitle Behavior

When enabled:

```text
Lumo speaks
     ↓
Subtitle appears
     ↓
Text progresses with speech
     ↓
Subtitle disappears / updates
```

When disabled:

No subtitle container should remain visible merely because subtitles are turned off.

---

# 27. Contextual Tutor Actions

After Lumo explains something, contextual actions may become available.

Examples:

```text
Explain again
Simplify
Give an example
Ask a question
```

These actions should not permanently occupy the screen.

They appear when relevant.

---

# 28. Primary Interaction Principle

The student should never have to decide:

> "Which button do I press to continue?"

The interaction should naturally follow the tutoring state.

When Lumo finishes:

```text
Lumo finishes
      ↓
Student can speak
```

The UI should guide this naturally.

---

# 29. Ask Lumo

Ask Lumo is a secondary but important interaction.

Default behavior:

```text
Student selects Ask Lumo
        ↓
Compact floating doubt solver opens
```

The lesson remains visible behind it.

---

# 30. Ask Lumo — Compact Mode

Compact mode should be approximately:

```text
┌─────────────────────────────┐
│ Ask Lumo                 ×  │
│                             │
│ What are you confused about?│
│                             │
│ __________________________  │
│                             │
│ Fast  Light  Pro            │
│                             │
│                    Ask →    │
└─────────────────────────────┘
```

This is conceptual.

The final design should avoid turning it into a generic rounded card.

---

# 31. Ask Lumo — Expanded Mode

The user may expand Ask Lumo.

Expanded mode becomes a focused workspace.

The underlying lesson should still remain conceptually connected.

Possible structure:

```text
┌────────────────────────────────────────────┐
│ Ask Lumo                              ×     │
│                                            │
│                                            │
│              Conversation                  │
│                                            │
│                                            │
│                                            │
│ __________________________________________ │
│                                            │
│ Fast      Light      Pro              Ask  │
└────────────────────────────────────────────┘
```

---

# 32. Ask Lumo Model Selector

Model selection is mandatory.

Models:

```text
Lumo Fast
Lumo Light
Lumo Pro
```

The selector must clearly communicate:

- current model
- model purpose
- selection state

Potential positioning:

```text
Fast    Light    Pro
```

rather than a hidden dropdown.

The final interaction should be optimized for quick model selection.

---

# 33. Ask Lumo Model Descriptions

Suggested conceptual descriptions:

```text
Lumo Fast
Quick answers for simple questions.

Lumo Light
Balanced speed and reasoning.

Lumo Pro
Deep reasoning for difficult questions.
```

These descriptions should be concise.

---

# 34. Ask Lumo Functional Requirement

Model selection must affect the actual backend request.

Required flow:

```text
User selects model
      ↓
Frontend stores selection
      ↓
Request contains model
      ↓
Backend routes request
      ↓
Selected model/provider executes
      ↓
Response returned
```

The interface must not contain a fake selector.

---

# 35. Timeline

The existing Notes functionality should evolve into a Timeline experience.

The Timeline should communicate:

- important moments
- concepts
- questions
- replay points
- timestamps

It should NOT feel like a generic notes drawer.

---

# 36. Timeline Surface

The Timeline should appear as a focused secondary surface.

It may be:

- floating panel
- sheet
- focused overlay

depending on viewport.

Desktop example:

```text
┌───────────────────────────────────────┐
│ Session Timeline                  ×   │
│                                       │
│ 10:02  Newton's First Law             │
│        Concept introduced              │
│                                       │
│ 10:08  Student question               │
│        "Why does the object..."       │
│                                       │
│ 10:14  Replay point                   │
│                                       │
└───────────────────────────────────────┘
```

The actual visual design should follow the V3 design system.

---

# 37. Timeline Interaction

Selecting an event should allow:

```text
Timeline event
      ↓
Relevant session moment
      ↓
Replay / navigate
      ↓
Learning Canvas updates
```

The transition should feel connected to the lesson.

---

# 38. Transcript

Transcript represents the conversational memory of the session.

It should not be presented as a generic "More" sidebar.

The user should understand immediately:

> This is what I and Lumo said during this lesson.

---

# 39. Transcript Surface

Conceptually:

```text
┌───────────────────────────────────────┐
│ Conversation                      ×   │
│                                       │
│ YOU                                   │
│ Why does the passenger move forward?  │
│                                       │
│ LUMO                                  │
│ Because of inertia...                 │
│                                       │
│ YOU                                   │
│ So inertia is a force?                │
│                                       │
└───────────────────────────────────────┘
```

The surface should feel calm and editorial.

Avoid chat-app visual clichés.

---

# 40. Transcript ↔ Timeline

Transcript and Timeline should be connected.

A conversation event may have:

- timestamp
- concept association
- replay point

Future implementation may allow:

```text
Transcript message
      ↓
Open associated moment
      ↓
Return to lesson
```

This relationship should be preserved in the architecture.

---

# 41. Settings

Settings is accessed from the top-right.

It should open a focused preferences surface.

It should NOT feel like:

> another giant sidebar.

---

# 42. Settings Categories

Initial categories:

```text
Language
Voice
Narration Speed
Subtitles
Theme
```

Potential future categories:

```text
Tutor Personality
Accessibility
Audio Input
Advanced
```

These should not be added until needed.

---

# 43. Language Selector

Initial supported languages:

```text
English
Hinglish
Hindi
```

The selector should clearly indicate the active language.

Avoid large dropdown-heavy forms where possible.

---

# 44. Voice Selector

Voice selection should use a modern preview-first interaction.

Conceptually:

```text
VOICE

Maya
Warm · Conversational
▶ Preview                         ✓

Arjun
Clear · Energetic
▶ Preview

Aisha
Calm · Supportive
▶ Preview
```

The user should be able to hear a sample before selecting a voice.

---

# 45. Voice Preview

Preview interaction:

```text
Select preview
      ↓
Play sample sentence
      ↓
User listens
      ↓
User selects voice
```

Preview playback must not accidentally trigger the full tutor.

---

# 46. Narration Speed

Narration speed should use a simple control.

Potential values:

```text
0.75×
1.0×
1.25×
1.5×
```

The exact range may change based on backend capabilities.

The control should not visually dominate settings.

---

# 47. Subtitles Toggle

Simple on/off interaction.

States:

```text
Subtitles
● On

Subtitles
○ Off
```

The UI should update immediately.

---

# 48. Theme

Theme options:

```text
Light
Dark
```

The product should remember the user's choice.

The entire interface must transition consistently.

---

# 49. Materials

Materials is currently non-functional.

For V3:

> **Do not allocate primary visual real estate to Materials until it has a defined purpose.**

Potential future functionality:

- uploaded learning material
- textbook
- reference documents
- teacher-provided resources
- lesson resources

Until then, it may be removed from the primary interface.

---

# 50. Desktop Layout

Recommended conceptual desktop composition:

```text
┌──────────────────────────────────────────────────────────────┐
│ Lumo       Lesson / Concept                  Timeline  ⚙     │
│                                                              │
│                                                              │
│                                                              │
│                                                              │
│                  LEARNING CANVAS                             │
│                                                              │
│             visual / formula / diagram                      │
│                                                              │
│                                             LUMO             │
│                                           avatar             │
│                                                              │
│                                                              │
│                         subtitles                            │
│                                                              │
│                           ●                                  │
│                     microphone                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

This is intentionally sparse.

The exact layout should emerge from content requirements rather than filling the screen.

---

# 51. Desktop Maximum Width

The Live Tutor should use the full available viewport intelligently.

Do not create an arbitrary centered website container that leaves large unused margins around the entire application.

The Learning Canvas should be allowed to breathe.

Secondary content may use constrained widths.

---

# 52. Tablet Layout

On tablet:

- top chrome remains compact
- canvas remains primary
- avatar may reduce in size
- secondary controls may collapse
- Ask Lumo becomes a larger floating surface
- Timeline/Transcript may become focused overlays

Avoid squeezing desktop controls into a narrow row.

---

# 53. Mobile Layout

Mobile is a different composition.

Primary order:

```text
Lesson
↓
Tutor
↓
Interaction
```

Secondary functionality becomes:

- bottom sheet
- full-screen overlay
- focused modal workspace

depending on task.

---

# 54. Mobile Avatar

The avatar should remain visible but should not consume most of the screen.

Possible positioning:

```text
       Lesson content

       visual content

          Lumo

     microphone / input
```

The avatar should adapt to the lesson content.

---

# 55. Responsive Rule

Never solve responsiveness by simply shrinking everything.

Instead:

> **Change the composition.**

Desktop:

```text
Canvas + Avatar + Controls
```

Mobile:

```text
Canvas
Avatar
Primary interaction
```

Secondary tools move into focused surfaces.

---

# 56. Dark Mode

Dark mode is a first-class design, not an inversion.

Primary background:

```text
#0D0D0D
```

Surfaces:

```text
#121212
#171717
#1C1C1C
```

Text:

```text
#F5F5F2
```

Secondary text:

```text
#A7A7A2
```

Accent:

```text
#D99A3D
```

Avoid blue-tinted dark backgrounds.

---

# 57. Light Mode

Primary background:

```text
#F7F7F4
```

Surface:

```text
#FFFFFF
```

Text:

```text
#171715
```

Secondary:

```text
#686864
```

Accent:

```text
#D99A3D
```

Light mode should feel warm and editorial.

---

# 58. Surface Behavior

Opening a secondary experience should not visually destroy the underlying lesson.

For example:

```text
Learning Canvas
      ↓
Ask Lumo opens
      ↓
Canvas remains recognizable
      ↓
Ask Lumo becomes temporary focus
```

The student should always understand where they came from.

---

# 59. No Permanent Sidebar

The V3 Live Tutor should NOT use permanent right-side drawers for:

- Notes
- Transcript
- Settings
- Ask Lumo

unless a specific future UX test proves that a persistent panel improves learning.

The default model is:

> focused temporary surface.

---

# 60. Surface Transitions

Secondary surfaces should:

- fade in subtly
- move naturally
- preserve spatial continuity
- have clear close behavior

Avoid:

- dramatic sliding drawers
- oversized bounce
- glowing borders
- abrupt screen replacement

---

# 61. Keyboard / Desktop Interaction

Important shortcuts may eventually include:

```text
Space
Start / stop listening

Esc
Close secondary surface

Enter
Submit text

↑ / ↓
Navigate selected items
```

Exact shortcuts should be validated during implementation.

---

# 62. Loading States

Every async experience must have a designed loading state.

Examples:

```text
Tutor response generating
Voice generating
Ask Lumo responding
Timeline loading
Transcript loading
Voice preview loading
```

Loading states should feel integrated.

Avoid generic:

```text
Loading...
```

where possible.

---

# 63. Error States

Errors should be contextual.

Example:

Instead of:

```text
Error 500
```

Prefer:

```text
Lumo couldn't respond right now.

Try again
```

Errors should provide a clear recovery path.

---

# 64. Empty States

Empty states should be minimal.

Example Timeline:

```text
No moments yet.

Important moments from this session
will appear here.
```

Do not create giant empty-state illustrations unless useful.

---

# 65. Disabled States

Disabled controls should:

- remain understandable
- appear visually muted
- communicate why when appropriate

Do not simply reduce opacity to 20%.

---

# 66. Interaction Priority

At any given moment there should be one obvious primary action.

Examples:

### Lumo speaking

Primary:

> Listen / Interrupt

### Lumo listening

Primary:

> Speak

### Ask Lumo open

Primary:

> Ask

### Voice selection

Primary:

> Select voice

### Timeline open

Primary:

> Select moment

This hierarchy should drive button styling.

---

# 67. Visual Hierarchy Test

Every implementation should pass:

### 3-second test

Within three seconds, a new user should understand:

- where the lesson is
- where Lumo is
- how to interact

If they cannot, simplify.

---

# 68. Anti-Slop Rules

The implementation must NOT introduce:

```text
❌ Blue-purple AI gradients
❌ Excessive glassmorphism
❌ Neon borders
❌ Giant rounded cards
❌ Floating AI orbs
❌ Emoji tutor avatar
❌ Excessive pills
❌ Permanent sidebars
❌ 10+ utility buttons
❌ Decorative waveforms everywhere
❌ Random glowing dots
❌ Huge shadows
❌ Dashboard-style card grids
```

The absence of these elements is an explicit product requirement.

---

# 69. Component Architecture

Suggested conceptual frontend structure:

```text
LiveTutor
│
├── TutorHeader
│   ├── LumoIdentity
│   ├── LessonContext
│   └── SessionTools
│
├── LearningCanvas
│   └── TeachingRenderer
│
├── TutorPresence
│   ├── Avatar
│   ├── TutorState
│   └── Subtitles
│
├── TutorInteraction
│   ├── Microphone
│   ├── TextFallback
│   └── ContextualActions
│
├── AskLumo
│   ├── QuestionInput
│   ├── ModelSelector
│   └── Conversation
│
├── SessionTimeline
│
├── Transcript
│
└── TutorSettings
    ├── Language
    ├── Voice
    ├── NarrationSpeed
    ├── Subtitles
    └── Theme
```

These are product boundaries.

They do not dictate exact React component nesting.

---

# 70. State Ownership

Major state should have clear ownership.

Conceptually:

```text
Live Tutor Session
│
├── lesson state
├── tutor state
├── audio state
├── transcript
├── timeline
├── preferences
└── Ask Lumo state
```

Individual UI surfaces should not independently duplicate these states.

---

# 71. Tutor State → UI Mapping

```text
IDLE
↓
Calm avatar
Primary microphone action

LISTENING
↓
Listening avatar
Active microphone state

PROCESSING
↓
Thinking state
Input temporarily disabled

SPEAKING
↓
Speaking avatar
Subtitles
Interrupt available

INTERRUPTED
↓
Speaking stops
Listening begins

ERROR
↓
Error message
Retry action
```

---

# 72. Tutor State → Avatar Mapping

```text
IDLE
    → idle animation

LISTENING
    → attentive expression

PROCESSING
    → thinking expression

SPEAKING
    → lip sync + expression

INTERRUPTED
    → transition to listening

ERROR
    → neutral / concerned state
```

The final animation system will be specified separately.

---

# 73. Backend Integration Requirements

The UI redesign must preserve existing backend functionality.

Before implementation is considered complete, verify:

```text
Voice generation
Speech recognition
Tutor responses
Session persistence
Lesson state
Timeline persistence
Transcript persistence
Model routing
Settings persistence
```

---

# 74. Ask Lumo Backend Requirement

The following must be verified:

```text
Lumo Fast
Lumo Light
Lumo Pro
```

The selected model must actually reach the model-routing layer.

No visual-only implementation is acceptable.

---

# 75. Voice Backend Requirement

Voice selection must affect actual TTS generation.

Flow:

```text
Voice selection
      ↓
User preference
      ↓
Tutor request
      ↓
TTS provider
      ↓
Selected voice
```

Narration speed must similarly affect generated playback where supported.

---

# 76. Session Persistence

Refreshing the page should not unexpectedly destroy:

- lesson progress
- transcript
- timeline
- selected preferences
- relevant session state

The exact persistence mechanism should follow existing backend architecture.

---

# 77. Performance

The Live Tutor can contain:

- real-time audio
- animations
- visual teaching
- avatar rendering
- subtitles
- AI interaction

Therefore the UI must avoid unnecessary rendering complexity.

Premium does not mean computationally wasteful.

Avoid adding decorative effects that compete with:

- canvas rendering
- audio
- avatar
- lesson animation

---

# 78. Visual Teaching Compatibility

The Learning Canvas must remain compatible with the existing visual teaching engine.

Do not hardcode the canvas around:

- static cards
- fixed aspect-ratio illustrations
- one type of diagram
- one lesson format

It must remain a flexible rendering environment.

---

# 79. Future Asset Library Compatibility

Future educational assets should be able to render inside the same canvas.

Potential future asset types:

```text
Cell
Ball
Arrow
Force
Particle
Formula
Diagram
Apparatus
Scientific object
Mathematical object
```

The V3 UI must not make assumptions that prevent this.

---

# 80. Future Avatar Compatibility

The UI must support future migration:

```text
Current placeholder
       ↓
3D avatar
       ↓
Expressive avatar
       ↓
Lip-synced avatar
       ↓
Context-aware teaching avatar
```

The surrounding UI should not need to be rebuilt at each stage.

---

# 81. Implementation Priority

Implementation should proceed in this order:

```text
1. Global V3 shell
        ↓
2. Learning Canvas
        ↓
3. Tutor presence architecture
        ↓
4. Primary voice interaction
        ↓
5. Top navigation
        ↓
6. Secondary surfaces
        ↓
7. Ask Lumo
        ↓
8. Timeline
        ↓
9. Transcript
        ↓
10. Settings
        ↓
11. Voice preview
        ↓
12. Functional audit
        ↓
13. Avatar prototype
```

Do not begin by polishing tiny icons.

---

# 82. Iteration Strategy

Each major area should go through:

```text
Functional baseline
        ↓
Visual redesign
        ↓
Interaction polish
        ↓
Dark theme
        ↓
Light theme
        ↓
Responsive
        ↓
Edge cases
```

Do not attempt to perfect every screen simultaneously.

---

# 83. Definition of Done — Primary Screen

The primary Live Tutor screen is complete when:

- lesson content is visually dominant
- Lumo has a clear presence
- voice interaction feels natural
- controls are minimal
- navigation is quiet
- no AI-slop visual patterns remain
- dark mode is polished
- light mode is polished
- responsive composition works
- existing teaching visuals render correctly
- loading/error states exist
- interaction states are coherent

---

# 84. Definition of Done — Secondary Surfaces

Each secondary surface is complete when:

- it has a clear purpose
- it does not compete with the lesson
- it opens naturally
- it closes naturally
- it preserves session context
- it follows V3 design tokens
- it supports dark/light themes
- it has loading/error/empty states
- existing functionality is preserved
- missing backend functionality is addressed

---

# 85. Final UI Mental Model

The finished interface should feel like:

```text
                 LUMO
                  │
        ┌─────────┴─────────┐
        │                   │
   THE LESSON           THE TUTOR
        │                   │
        ↓                   ↓
 Learning Canvas        Avatar / Voice
        │                   │
        └─────────┬─────────┘
                  │
             Interaction
                  │
        ┌─────────┼─────────┐
        ↓         ↓         ↓
    Ask Lumo   Timeline  Transcript
                  │
                  ↓
              Settings
```

But the user should NOT visually experience this as a diagram.

They should experience it as one environment.

---

# 86. Final Rule

The Live Tutor should never feel like:

> "A dashboard containing an AI tutor."

It should feel like:

> **"I am inside a lesson, and Lumo is teaching me."**

Everything in the UI exists to reinforce that feeling.

If a component, panel, animation, color, button, card, or interaction weakens that feeling, it should be questioned before being added.

---

# 87. V3 UI North Star

The final interface should communicate:

> **Calm surface. Powerful system. Human tutor. Intelligent teaching.**

The complexity should live underneath.

The student should experience simplicity.

```

```
````
