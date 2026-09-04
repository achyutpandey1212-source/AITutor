# 05_SECONDARY_SURFACES_SPEC.md

> **Status:** Interaction & UI Specification
> **Version:** 3.0
> **Scope:** Ask Lumo, Timeline, Transcript, Settings
>
> **Depends on:**
>
> - `01_LUMO_V3_DESIGN_SYSTEM.md`
> - `02_LIVE_TUTOR_PRODUCT_ARCHITECTURE.md`
> - `03_LIVE_TUTOR_UI_SPECIFICATION.md`
> - `04_TUTOR_STATE_AND_INTERACTION_SPEC.md`
>
> **Purpose:** Define how secondary experiences behave, appear, open, close, and interact with the Live Tutor without turning the product into a collection of generic sidebars.

---

# 1. Purpose

The Live Tutor has several important secondary experiences:

1. Ask Lumo
2. Timeline
3. Transcript
4. Settings

These features already exist conceptually in the product.

The problem is not that these features exist.

The problem is that they currently behave like independent UI widgets:

```text
button
↓
sidebar
↓
content
```

````

This creates the feeling of an unfinished AI dashboard.

V3 changes the mental model:

> **Secondary surfaces are temporary focused spaces within the lesson, not permanent application chrome.**

The lesson remains the primary environment.

---

# 2. Core Principle

The user should always feel:

> "I am still inside my lesson."

Not:

> "A different webpage opened."

Therefore:

```text
Live Tutor
    │
    ├── Learning Canvas
    │
    └── Temporary focused surface
```

rather than:

```text
Dashboard
├── Main page
├── Notes sidebar
├── Chat sidebar
├── Settings sidebar
└── Ask AI popup
```

---

# 3. Surface Taxonomy

Each secondary experience has a different purpose.

| Surface    | Purpose                 | Priority | Typical Size       |
| ---------- | ----------------------- | -------: | ------------------ |
| Ask Lumo   | Active problem solving  |     High | Compact → Expanded |
| Timeline   | Navigate lesson history |   Medium | Compact / Panel    |
| Transcript | Review conversation     |   Medium | Panel              |
| Settings   | Configure tutor         |      Low | Panel              |

They should not all use identical layouts.

---

# 4. Surface Behavior

Secondary surfaces should generally:

- appear above the lesson
- preserve lesson context
- have clear hierarchy
- have predictable close behavior
- avoid excessive visual decoration
- use the V3 surface system
- support light and dark modes
- work responsively

They should NOT:

- permanently occupy the right side
- introduce a completely different visual language
- use generic glassmorphism
- become giant rounded cards
- use excessive shadows
- cover the entire lesson unless intentionally expanded

---

# 5. Opening Model

The default desktop model is:

```text
Learning Canvas
       ↓
Surface requested
       ↓
Surface appears as focused layer
       ↓
Canvas remains visible
```

The transition should communicate:

> "You are temporarily focusing on something."

---

# 6. Closing Model

Closing a surface returns the user to exactly where they were.

```text
Lesson
 ↓
Timeline
 ↓
Close
 ↓
Same lesson state
```

The system should not:

- reload the lesson
- reset the canvas
- restart audio
- lose scroll position
- reset selected scene
- reset tutor state

---

# 7. Surface Layering

Conceptual layering:

```text
Layer 0
Learning Canvas

Layer 1
Tutor Presence

Layer 2
Secondary Surface

Layer 3
Surface-specific transient elements
```

Do not create unnecessary stacking layers.

---

# 8. Surface Backdrop

A secondary surface may use a subtle separation layer from the canvas.

Preferred:

- mild background separation
- subtle opacity shift
- restrained shadow
- border only where necessary

Avoid:

- heavy black overlay
- extreme blur
- glowing glass
- dramatic dimming

The lesson should remain recognizable.

---

# 9. Surface Width

Desktop surfaces should generally use constrained widths.

Suggested starting ranges:

```text
Compact:
320–420px

Standard:
400–520px

Expanded:
600–900px
```

These are starting points, not hard requirements.

The width should depend on the task.

---

# 10. Surface Position

Avoid blindly anchoring every surface to:

```text
right: 0
top: 0
bottom: 0
```

That creates the exact generic sidebar appearance we are trying to eliminate.

Instead, surfaces should be positioned according to their role.

Possible approaches:

```text
Floating panel
Centered workspace
Contextual sheet
Anchored panel
```

---

# 11. Surface Transition

Recommended transition:

```text
opacity
+
small spatial movement
+
subtle scale adjustment
```

Conceptually:

```text
Hidden
 ↓
opacity 0
 ↓
slight offset
 ↓
opacity 1
 ↓
settled position
```

Avoid large drawer animations.

The interface should feel calm and expensive.

---

# 12. Surface Close

Every surface must have an obvious close mechanism.

Primary:

```text
×
```

Potential secondary:

```text
Esc
```

Clicking outside may close lightweight surfaces.

However, destructive or stateful experiences should not close accidentally.

---

# 13. Focus Management

When a surface opens:

- keyboard focus should move appropriately
- input should become usable immediately when relevant
- Escape should close where appropriate
- focus should return to the triggering control after closing

This is especially important for Ask Lumo and Settings.

---

# 14. Multiple Surfaces

Only one major secondary surface should generally be active at a time.

Avoid:

```text
Ask Lumo
+
Timeline
+
Settings
+
Transcript
```

all layered simultaneously.

If another surface is opened:

```text
Current surface
      ↓
Close / transition
      ↓
New surface
```

This prevents UI chaos.

---

# 15. Ask Lumo

Ask Lumo is the most interactive secondary surface.

Its purpose:

> Let the student ask a focused question without leaving the lesson.

It should feel like an extension of Lumo, not a separate chatbot.

---

# 16. Ask Lumo Entry

The primary Live Tutor has an Ask Lumo action.

When activated:

```text
Lesson
 ↓
Ask Lumo
 ↓
Compact Ask Lumo surface
```

The lesson remains visible.

---

# 17. Ask Lumo Compact Mode

Compact mode should be optimized for quick questions.

Conceptual structure:

```text
┌────────────────────────────────────┐
│ Ask Lumo                       ×   │
│                                    │
│ What's confusing you?              │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ Ask a question...              │ │
│ └────────────────────────────────┘ │
│                                    │
│ Fast   Light   Pro          Ask → │
└────────────────────────────────────┘
```

This is structural only.

The final implementation must follow the V3 visual language.

---

# 18. Ask Lumo Compact Size

The compact surface should feel like a focused tool.

It should not occupy most of the screen.

Suggested desktop starting point:

```text
Width:
360–460px

Height:
auto based on content
```

The surface should expand naturally when conversation grows.

---

# 19. Ask Lumo Expanded Mode

Users can enlarge Ask Lumo for deeper interaction.

Expanded mode becomes a focused workspace.

Conceptually:

```text
┌─────────────────────────────────────────────┐
│ Ask Lumo                                ×  │
│                                             │
│                                             │
│              Conversation                  │
│                                             │
│                                             │
│                                             │
│─────────────────────────────────────────────│
│ Question...                                 │
│                                             │
│ Fast       Light       Pro             Ask  │
└─────────────────────────────────────────────┘
```

The underlying lesson context should remain available conceptually.

---

# 20. Ask Lumo Expansion

The transition should feel like:

```text
Compact
   ↓
Expand
   ↓
Larger focused workspace
```

Not:

```text
Small card
   ↓
New page
```

The user should feel that the same tool simply became larger.

---

# 21. Ask Lumo Conversation

Ask Lumo should support conversation history within the current interaction.

Messages should feel editorial and restrained.

Avoid:

- huge chat bubbles
- excessive rounded containers
- user/AI bubbles with cartoon styling
- giant avatars
- decorative gradients

The content should be the focus.

---

# 22. Ask Lumo Input

Input should support:

- text
- microphone where supported
- submit
- model selection

Potential structure:

```text
Question input

[voice]                         [send]
```

The input should remain visually simple.

---

# 23. Ask Lumo Model Selector

Required models:

```text
Lumo Fast
Lumo Light
Lumo Pro
```

Model selection is a real functional requirement.

The UI should make the active model obvious.

---

# 24. Model Selection Interaction

Preferred interaction:

```text
Fast
Light
Pro
```

as a compact selector.

Alternative:

A compact control that opens a small model menu.

Avoid forcing model selection into a deep settings screen.

It belongs directly inside Ask Lumo because it affects the current question.

---

# 25. Model Selection Persistence

The selected model may persist as a user preference.

However:

> A previous interaction's model must never change retroactively.

Example:

```text
Question 1 → Lumo Fast
Question 2 → Lumo Pro
```

Transcript/history must preserve this association if model metadata is stored.

---

# 26. Model Descriptions

Recommended:

### Lumo Fast

Quick answers.

### Lumo Light

Balanced reasoning.

### Lumo Pro

Deep reasoning.

Descriptions should remain short.

---

# 27. Ask Lumo Loading

When a question is submitted:

```text
Input
 ↓
Thinking
 ↓
Response
```

Do not show a generic page loader.

The surface should remain stable while the response is generated.

---

# 28. Ask Lumo Error

Example:

> Lumo couldn't answer right now.

Actions:

```text
Retry
```

Potential secondary action:

```text
Change model
```

The user's question must not disappear.

---

# 29. Ask Lumo Context

Ask Lumo should have access to appropriate session context where supported.

Potential context:

- current lesson
- current concept
- recent tutor conversation
- current visual scene
- selected timeline moment

The UI does not need to expose all of this.

The intelligence should happen underneath.

---

# 30. Ask Lumo → Live Tutor Relationship

Ask Lumo is not a completely separate assistant.

Conceptually:

```text
Lumo Live Tutor
       │
       ├── Teaching interaction
       │
       └── Ask Lumo
```

The same overall Lumo identity should remain consistent.

---

# 31. Timeline

Timeline replaces the current "Notes" mental model.

The purpose is:

> Help the student navigate meaningful moments in a tutoring session.

It is not a traditional note-taking app.

---

# 32. Timeline Entry

Opening Timeline:

```text
Lesson
 ↓
Timeline
 ↓
Focused timeline surface
```

---

# 33. Timeline Content

Potential entries:

```text
10:02
Newton's First Law
Concept introduced

10:08
Student question
Why does the passenger move forward?

10:14
Important moment
Inertia explained

10:20
Replay point
```

The actual event taxonomy may evolve.

---

# 34. Timeline Design

The Timeline should visually resemble a calm chronological record.

Potential structure:

```text
10:02 ─── Concept
   │
10:08 ─── Question
   │
10:14 ─── Explanation
   │
10:20 ─── Replay
```

The timeline itself should be visually light.

Avoid excessive vertical lines, glowing nodes, or decorative timelines.

---

# 35. Timeline Importance

Not every interaction deserves a timeline entry.

Important events:

- concept starts
- major explanation
- student question
- misconception
- important example
- replay point
- concept completion

Avoid recording every tiny state change.

---

# 36. Timeline Interaction

Selecting an event:

```text
Timeline event
 ↓
Navigate to relevant session point
 ↓
Learning Canvas updates
```

If replay is supported:

```text
Select
 ↓
Replay
```

---

# 37. Timeline + Transcript

Timeline and Transcript should be linked.

Example:

```text
Timeline:
10:08 — Student question

       ↓ click

Transcript:
Student:
"Why does the passenger move forward?"
```

This relationship should be preserved in the data model.

---

# 38. Timeline Empty State

Example:

> Your important lesson moments will appear here.

Keep it minimal.

Do not use a giant illustration.

---

# 39. Timeline Loading

Use a quiet loading state.

Avoid a large skeletonized dashboard.

The surface should retain its structure while data loads.

---

# 40. Transcript

Transcript provides a record of the tutoring conversation.

It is not intended to behave like a traditional messaging application.

---

# 41. Transcript Entry

Opening Transcript:

```text
Lesson
 ↓
Transcript
 ↓
Conversation surface
```

---

# 42. Transcript Structure

Recommended:

```text
YOU

Why does the passenger move forward?

LUMO

Because the passenger's body tends
to maintain its state of motion...
```

The interface should distinguish speakers through typography and spacing first.

Do not rely on giant colored chat bubbles.

---

# 43. Transcript Hierarchy

Priority:

```text
Speaker
 ↓
Message
 ↓
Timestamp / metadata
```

Not:

```text
Avatar
 ↓
Bubble
 ↓
Timestamp
 ↓
Buttons
```

The transcript should feel more like a conversation record than a messaging app.

---

# 44. Transcript Metadata

Potential metadata:

- timestamp
- model
- voice
- interrupted state
- associated timeline event

Most metadata should remain hidden until useful.

Do not clutter every message.

---

# 45. Transcript Search

Future capability:

```text
Search conversation
```

This is not required for initial V3 implementation.

Architecture should not prevent it.

---

# 46. Transcript Replay

Where technically supported:

```text
Transcript message
 ↓
Replay associated moment
 ↓
Canvas returns to relevant state
```

This should integrate with Timeline.

---

# 47. Transcript Empty State

Example:

> Your conversation with Lumo will appear here.

Minimal.

---

# 48. Transcript During Active Session

The transcript may update live.

However, the surface should not automatically open whenever a new message appears.

Opening is user-controlled.

---

# 49. Settings

Settings controls tutor preferences.

It should feel like a product preference panel rather than a traditional admin settings page.

---

# 50. Settings Categories

Initial:

```text
Language
Voice
Narration Speed
Subtitles
Theme
```

Potential future:

```text
Tutor behavior
Accessibility
Audio input
Advanced
```

Do not add categories merely to fill space.

---

# 51. Settings Layout

Recommended:

```text
Settings

Language
English

Voice
Maya
Preview →

Narration speed
1.0×

Subtitles
On

Theme
Dark
```

The interface should be highly scannable.

---

# 52. Settings Sections

Each setting should have:

```text
Label
Current value
Interaction
Optional description
```

Avoid large card containers around every setting.

---

# 53. Language

Initial options:

```text
English
Hinglish
Hindi
```

Changing language should update the relevant tutor configuration.

Where required, voice availability should update accordingly.

---

# 54. Voice Selection

Voice selection must be preview-first.

The user should not have to select a voice blindly.

Conceptual structure:

```text
Voice

Maya
Warm · Conversational

▶ Preview

Arjun
Clear · Energetic

▶ Preview

Aisha
Calm · Supportive

▶ Preview
```

---

# 55. Voice Preview

Preview behavior:

```text
Tap Preview
 ↓
Play sample sentence
 ↓
Preview control changes to Stop
 ↓
Audio finishes
 ↓
Returns to Preview
```

Only one preview should play at a time.

Starting a new preview should stop the previous one.

---

# 56. Voice Preview Sentence

Preview sentence should be consistent enough for comparison.

Example:

> "Let's work through this step together."

The exact sentence can later vary by language.

---

# 57. Voice Selection

Selecting a voice:

```text
Preview
 ↓
User selects
 ↓
Selection becomes active
 ↓
Future tutor speech uses selected voice
```

The current session should apply the new preference according to backend capability.

---

# 58. Voice Preview Error

Example:

> Preview unavailable.

Action:

> Try again

Do not break the rest of Settings.

---

# 59. Narration Speed

Possible controls:

```text
0.75×
1.0×
1.25×
1.5×
```

The active value should be obvious.

---

# 60. Subtitle Settings

Simple toggle:

```text
Subtitles
On / Off
```

Changes should apply immediately to future/active subtitle rendering according to implementation.

---

# 61. Theme Settings

Theme:

```text
Light
Dark
```

The user should see the change immediately.

Theme switching should not reload the application.

---

# 62. Settings Persistence

Preferences should persist across sessions where appropriate.

Potential persisted settings:

```text
language
voice
narrationSpeed
subtitles
theme
```

---

# 63. Settings + Current Session

Changing a preference should not unexpectedly reset:

- lesson progress
- timeline
- transcript
- current scene
- tutor state

The session should remain intact.

---

# 64. Mobile Behavior

On mobile, secondary surfaces should become:

```text
bottom sheet
or
full-screen focused surface
```

depending on task.

Recommended:

### Ask Lumo

Expanded focused workspace.

### Timeline

Bottom sheet / full-height sheet.

### Transcript

Full-height conversation surface.

### Settings

Full-height settings surface.

---

# 65. Mobile Close Behavior

Every surface must support:

- close button
- swipe down where appropriate
- back navigation where appropriate

Do not trap users inside a surface.

---

# 66. Desktop vs Mobile

Desktop:

```text
Lesson remains visible
Surface overlays / floats
```

Mobile:

```text
Surface becomes primary focus
Lesson context remains recoverable
```

Do not simply shrink desktop panels.

---

# 67. Dark Mode

All surfaces must feel native to Lumo's dark environment.

Dark surface hierarchy:

```text
Canvas
#0D0D0D

Surface
#121212

Elevated surface
#171717

Higher elevation
#1C1C1C
```

Text should remain warm-white rather than pure white everywhere.

---

# 68. Light Mode

Light surfaces should remain restrained.

Conceptual hierarchy:

```text
Canvas
#F7F7F4

Surface
#FFFFFF

Elevated
subtle separation
```

Avoid excessive gray boxes.

---

# 69. Accent Usage

The V3 warm accent should be used for:

- active states
- selection
- important interaction
- progress
- focus

It should NOT be used for:

- every border
- every icon
- every heading
- decorative gradients

Accent should remain scarce.

---

# 70. Typography

Secondary surfaces should inherit the global V3 typography system.

Hierarchy should come from:

- font size
- weight
- spacing
- contrast

not from:

- colored labels everywhere
- giant headings
- decorative text effects

---

# 71. Icons

Icons should be:

- simple
- consistent
- quiet
- recognizable

Avoid mixing:

```text
emoji
Lucide-style icon
custom 3D icon
gradient icon
```

inside the same surface.

Use one coherent icon language.

---

# 72. Buttons

Primary actions:

```text
Ask
Save
Retry
Select
```

should be visually clear.

Secondary actions:

```text
Preview
Cancel
Close
```

should remain quieter.

Avoid making every control look like a primary CTA.

---

# 73. Inputs

Inputs should feel integrated with the surface.

Avoid:

```text
giant rounded input
+ glowing border
+ gradient send button
```

Prefer a restrained editor-like input.

---

# 74. Focus States

Keyboard focus must remain visible.

Focus styling should use the V3 accent system.

Do not rely exclusively on browser-default outlines if they clash with the visual system.

---

# 75. Scroll Behavior

Long surfaces should scroll internally where appropriate.

The main lesson canvas should not unexpectedly scroll because a secondary surface opened.

For example:

```text
Transcript scroll
≠
Lesson scroll
```

These should be independent where required.

---

# 76. Surface Memory

When closing and reopening a surface during the same session:

### Ask Lumo

Preserve conversation.

### Timeline

Preserve current position if practical.

### Transcript

Preserve scroll position where practical.

### Settings

Preserve the user's last position if useful.

Do not reset unnecessarily.

---

# 77. Surface State

Each surface should have:

```text
closed
opening
open
closing
```

and, where relevant:

```text
loading
ready
error
empty
```

These should be represented intentionally.

---

# 78. Surface Accessibility

Every surface must:

- have a logical focus order
- support keyboard navigation
- provide accessible labels
- support screen readers
- provide visible focus states
- support reduced motion

---

# 79. Surface Error Isolation

A failure inside one surface should not break the entire tutor.

Example:

```text
Voice preview fails
      ↓
Settings shows error
      ↓
Live Tutor continues working
```

Similarly:

```text
Timeline fails
      ↓
Timeline unavailable
      ↓
Lesson continues
```

---

# 80. Surface Performance

Secondary surfaces should not initialize heavy resources until needed.

Examples:

- voice preview audio
- transcript search
- expanded Ask Lumo
- timeline processing

Lazy-load where appropriate.

---

# 81. No Duplicate State

Do not create separate copies of:

```text
transcript
session
lesson state
selected voice
selected model
```

inside every surface.

The surfaces should consume shared session state.

---

# 82. Backend Integration

The V3 redesign must preserve existing backend functionality.

Required verification:

```text
Ask Lumo → model routing
Timeline → session events
Transcript → conversation persistence
Settings → user/session preferences
Voice preview → selected TTS voice
Narration speed → TTS configuration
Language → tutor configuration
```

---

# 83. Ask Lumo Backend Contract

At minimum:

```text
model
message
sessionContext
lessonContext
```

should be available where supported.

The backend must know which model was selected.

---

# 84. Timeline Backend Contract

Timeline events should contain enough information to locate the relevant session moment.

Conceptually:

```text
timelineEvent
{
    id
    type
    timestamp
    title
    description
    sessionPosition
    relatedInteractionId
}
```

Exact schema should follow existing backend conventions.

---

# 85. Transcript Backend Contract

Transcript messages should retain:

```text
speaker
content
timestamp
interactionId
model
```

Optional:

```text
interrupted
audioReference
timelineEventId
```

---

# 86. Settings Backend Contract

User/session preferences may include:

```text
language
voice
narrationSpeed
subtitles
theme
```

The frontend should not assume these preferences exist only locally if the product architecture requires cross-session persistence.

---

# 87. Surface Relationship Diagram

```text
                         LIVE TUTOR
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
       LESSON             TUTOR             SESSION
       CANVAS             PRESENCE            DATA
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    SECONDARY SURFACES
                             │
          ┌──────────┬───────┼───────┬──────────┐
          │          │       │       │          │
       ASK LUMO   TIMELINE TRANSCRIPT SETTINGS
          │          │       │       │
          └──────────┴───────┴───────┘
```

All four are parts of the same session.

---

# 88. Opening Priority

If the user is actively speaking or Lumo is speaking:

Opening a secondary surface must not accidentally interrupt the tutor.

For example:

```text
Lumo speaking
 ↓
User opens Timeline
 ↓
Timeline opens
 ↓
Lumo continues speaking
```

unless the specific interaction intentionally pauses the lesson.

---

# 89. Settings During Speaking

Opening Settings while Lumo is speaking should NOT automatically stop speech.

The user may inspect/change preferences while listening.

If the user changes voice:

Recommended:

> Apply to future speech.

Do not unexpectedly restart the current audio.

---

# 90. Timeline During Speaking

Timeline may open while Lumo is speaking.

However, if the user selects a replay point:

```text
Current speech
 ↓
User selects replay
 ↓
Current interaction is cancelled/paused
 ↓
Replay begins
```

Exact behavior should be defined by the session engine.

---

# 91. Transcript During Speaking

Opening Transcript should not stop the tutor.

The user may read along while Lumo speaks.

If subtitles are enabled, transcript and subtitles are separate systems.

---

# 92. Ask Lumo During Speaking

Opening Ask Lumo should not automatically stop the current tutor response.

However, submitting a new Ask Lumo question may require:

```text
Current tutor speech
 ↓
Ask Lumo interaction
```

The exact audio-priority rule should be defined during implementation.

Recommended:

> Explicit Ask Lumo submission should take priority over ongoing tutor narration.

---

# 93. Surface Priority

When competing interactions occur:

```text
Explicit user action
>
Current audio
>
Decorative UI
```

User intent wins.

---

# 94. Surface Motion Rules

Motion should explain:

```text
Where did this surface come from?
Where will it go?
What is currently focused?
```

Motion should NOT exist merely because animation is possible.

---

# 95. Surface Anti-Patterns

Do NOT implement:

```text
❌ Every feature opens from the right
❌ Full-height generic sidebar
❌ Huge rounded glass card
❌ Blue-purple gradient background
❌ Neon glow around active state
❌ Excessive blur
❌ Giant close button
❌ Huge "AI" branding
❌ Random floating particles
❌ Decorative waveform
❌ Generic chatbot bubble styling
```

---

# 96. Surface Quality Test

For each surface ask:

### Purpose

Can the user understand what this surface does immediately?

### Context

Does the user know they are still inside the lesson?

### Focus

Is there one obvious primary action?

### Visual quality

Does it look like part of the same product?

### Exit

Can the user return naturally?

If any answer is no, the surface needs revision.

---

# 97. Ask Lumo Definition of Done

Complete when:

- compact mode works
- expanded mode works
- model selection works
- Fast/Light/Pro route correctly
- conversation persists
- loading state exists
- errors recover
- context is preserved
- light mode works
- dark mode works
- responsive layout works
- surface feels like part of Lumo rather than a generic chatbot

---

# 98. Timeline Definition of Done

Complete when:

- meaningful events appear
- timestamps are clear
- events are selectable
- relevant lesson moments can be reached
- transcript relationship works
- empty state exists
- loading/error states exist
- light/dark modes work
- surface does not feel like a notes app

---

# 99. Transcript Definition of Done

Complete when:

- user/Lumo messages are clearly distinguishable
- conversation persists
- live updates work
- timestamps/context work
- timeline relationship works
- scrolling is stable
- empty/loading/error states exist
- light/dark modes work
- it does not visually resemble a generic chat application

---

# 100. Settings Definition of Done

Complete when:

- language selection works
- voice selection works
- voice preview works
- narration speed works
- subtitles toggle works
- theme switching works
- preferences persist correctly
- changes do not break the current lesson
- light/dark modes are polished
- mobile layout works

---

# 101. Final Product Principle

These surfaces should disappear when they are not needed.

They should not compete with the lesson.

The student should primarily experience:

```text
LESSON
```

and secondarily:

```text
LUMO
```

Everything else should appear only when requested.

---

# 102. Final Rule

> **Secondary functionality should feel like depth, not clutter.**

The product can contain:

- powerful models
- timeline intelligence
- conversation history
- voice controls
- language settings
- contextual tools

But none of those should make the main experience visually complicated.

The student should see a calm lesson environment.

When they need more power, it should be there.

When they don't, it should disappear.

That is the V3 secondary-surface philosophy.

```

```
````
