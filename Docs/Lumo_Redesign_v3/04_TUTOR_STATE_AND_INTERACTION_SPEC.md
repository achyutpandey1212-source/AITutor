# 04_TUTOR_STATE_AND_INTERACTION_SPEC.md

> **Status:** Core Interaction Specification
> **Version:** 3.0
> **Scope:** Lumo Live Tutor state machine, voice interaction, tutor presence, transitions, interruption, and user feedback
>
> **Depends on:**
>
> - `01_LUMO_V3_DESIGN_SYSTEM.md`
> - `02_LIVE_TUTOR_PRODUCT_ARCHITECTURE.md`
> - `03_LIVE_TUTOR_UI_SPECIFICATION.md`
>
> **Purpose:** Define exactly how Lumo behaves between Idle → Listening → Thinking → Speaking → Interrupted → Error and how the UI, audio, avatar, subtitles, and controls respond to those states.

---

# 1. Purpose

The Live Tutor is fundamentally a real-time interaction.

Therefore, the quality of the product is not determined only by how the screen looks.

It is determined by how naturally the system moves between states.

The user should feel:

> Lumo is present, understands what I am doing, listens to me, thinks, responds, and reacts naturally.

The system should never feel like:

> Button clicked → API request → loading spinner → response.

The state machine is therefore a first-class product system.

---

# 2. Core State Model

The primary Tutor states are:

```text
IDLE
  ↓
LISTENING
  ↓
THINKING
  ↓
SPEAKING
  ↓
IDLE
```

````

Additional transitions:

```text
SPEAKING
   ↓
INTERRUPTED
   ↓
LISTENING
```

Failure:

```text
ANY ACTIVE STATE
   ↓
ERROR
   ↓
IDLE
```

Optional future state:

```text
ANY STATE
   ↓
PAUSED
```

---

# 3. State Definitions

## IDLE

Lumo is available but not actively interacting.

Characteristics:

- lesson is visible
- tutor is ready
- microphone is available
- avatar is calm
- no active audio
- no processing indicator
- no temporary interaction overlay

User mental model:

> "Lumo is ready."

---

## LISTENING

Lumo is actively receiving student speech.

Characteristics:

- microphone is active
- speech recognition is active
- avatar appears attentive
- listening feedback is visible
- user may continue speaking naturally

User mental model:

> "Lumo is listening to me."

---

## THINKING

The student has finished speaking and Lumo is processing the request.

Characteristics:

- microphone is no longer recording
- speech recognition is complete
- AI response is being generated
- avatar enters a subtle thinking state
- user should receive immediate confirmation that input was received

User mental model:

> "Lumo heard me and is thinking."

---

## SPEAKING

Lumo is actively delivering the response.

Characteristics:

- TTS audio is playing
- avatar is speaking
- lip sync is active when available
- subtitles update with speech when enabled
- student can interrupt

User mental model:

> "Lumo is explaining something to me."

---

## INTERRUPTED

Lumo was speaking but the student intentionally interrupted.

Characteristics:

- TTS stops immediately
- speaking animation stops
- current subtitle state is cleared or transitioned
- microphone becomes active
- system moves into LISTENING

User mental model:

> "Lumo stopped so it can listen to me."

---

## ERROR

Something prevented the interaction from completing.

Possible causes:

- microphone failure
- speech recognition failure
- network failure
- model failure
- TTS failure
- session failure

Characteristics:

- current operation stops safely
- user receives a clear explanation
- recovery action is provided
- system should return to a usable state

User mental model:

> "Something went wrong, but I can continue."

---

# 4. State Machine

The canonical state machine is:

```text
                         ┌─────────────┐
                         │             │
                         │    IDLE     │
                         │             │
                         └──────┬──────┘
                                │
                          Start interaction
                                │
                                ▼
                         ┌─────────────┐
                         │             │
                         │ LISTENING   │
                         │             │
                         └──────┬──────┘
                                │
                         Speech complete
                                │
                                ▼
                         ┌─────────────┐
                         │             │
                         │  THINKING   │
                         │             │
                         └──────┬──────┘
                                │
                         Response ready
                                │
                                ▼
                         ┌─────────────┐
                         │             │
                         │  SPEAKING   │
                         │             │
                         └──────┬──────┘
                                │
                     ┌──────────┴──────────┐
                     │                     │
                Response ends          User interrupts
                     │                     │
                     ▼                     ▼
                   IDLE              INTERRUPTED
                                           │
                                           ▼
                                      LISTENING
```

Error can occur from any active state:

```text
LISTENING
    ↓
  ERROR

THINKING
    ↓
  ERROR

SPEAKING
    ↓
  ERROR
```

---

# 5. State Transition Rules

Every state transition must have:

1. A clear trigger
2. A deterministic next state
3. UI feedback
4. Audio behavior
5. Avatar behavior
6. Recovery behavior where applicable

A state should never change merely because a UI component happened to re-render.

State changes must be driven by actual product events.

---

# 6. IDLE State

## Entry Conditions

Lumo enters IDLE when:

- lesson loads successfully
- speaking finishes
- interaction is cancelled
- error recovery completes
- user closes an active interaction

---

## IDLE UI

The UI should be calm.

Visible:

- lesson content
- Lumo presence
- primary microphone action
- optional contextual action

Hidden:

- loading indicator
- active microphone state
- processing state
- unnecessary controls

---

## IDLE Avatar

The avatar should have a subtle idle animation.

Possible behaviors:

- natural breathing
- occasional blink
- small head movement
- subtle posture changes

Avoid:

- constant bouncing
- floating
- exaggerated animation
- glowing aura

The avatar should feel alive without demanding attention.

---

# 7. Starting Interaction

Primary transition:

```text
IDLE
 ↓
User activates microphone
 ↓
LISTENING
```

The transition should feel immediate.

Avoid:

```text
Click
↓
500ms delay
↓
Loading
↓
Microphone activates
```

Instead:

```text
Click
↓
Listening state immediately
↓
Audio capture begins
```

---

# 8. LISTENING State

Listening is one of the most important states in the product.

The student must know immediately that Lumo is listening.

---

## Listening UI

Potential signals:

```text
Microphone → active
Avatar → attentive
Subtitle area → listening indication
```

Possible minimal text:

> Listening…

Do not require text if the visual state is already obvious.

---

# 9. Listening Microphone

The microphone control becomes the primary visual interaction.

It should communicate:

```text
Inactive
    ↓
Active
```

The active state should use the V3 accent system rather than introducing a separate neon color.

---

# 10. Listening Avatar

When listening:

- eyes/head should appear attentive
- idle movement may reduce
- avatar may subtly orient toward the user
- speaking animation must not play

The difference between IDLE and LISTENING should be noticeable but restrained.

---

# 11. Speech Recognition

While LISTENING:

```text
Microphone
   ↓
Audio capture
   ↓
Speech recognition
   ↓
Partial transcript
```

If supported, partial transcription may be displayed.

Example:

> "Why does the object..."

This provides confirmation that speech is being received.

---

# 12. Partial Transcript

Partial transcript should remain subtle.

It should not become a giant chat bubble.

Possible behavior:

```text
Why does the object...
```

then:

```text
Why does the object keep moving?
```

The final transcript is committed only after speech ends.

---

# 13. End of Speech

When speech recognition determines that the user has finished:

```text
LISTENING
    ↓
Speech complete
    ↓
THINKING
```

The microphone should stop recording.

The UI should transition immediately.

---

# 14. THINKING State

Thinking represents actual model processing.

This state should communicate:

> Input received. Lumo is working.

It should NOT communicate:

> The website is loading.

---

# 15. Thinking UI

Avoid:

```text
Loading...
████████
```

Prefer:

- subtle tutor state
- understated processing indicator
- small textual feedback if needed

Potential:

> Thinking…

But this should not be necessary if the avatar state makes it obvious.

---

# 16. Thinking Avatar

The avatar may:

- slightly shift expression
- pause active movement
- subtly change gaze
- perform a small thinking gesture

Avoid exaggerated "AI thinking" animations.

No spinning head.

No giant loading circle around the avatar.

---

# 17. Thinking Timeout

If processing takes unusually long, the interface should eventually provide feedback.

Example:

> Still working…

Potential recovery:

> Try again

The exact timeout should be determined during implementation based on real model latency.

Do not expose raw backend timeout numbers to users.

---

# 18. THINKING → SPEAKING

When a valid response is available:

```text
THINKING
    ↓
Response generated
    ↓
TTS ready
    ↓
SPEAKING
```

If text response arrives before TTS:

```text
Response generated
    ↓
Prepare audio
    ↓
SPEAKING
```

The user should not see unnecessary intermediate technical states.

---

# 19. SPEAKING State

Speaking is the primary tutor-presence state.

Lumo should feel like an actual tutor delivering an explanation.

---

# 20. Speaking UI

When Lumo speaks:

- microphone changes to interrupt behavior
- avatar becomes active
- subtitles appear if enabled
- lesson visuals may update
- contextual actions may become available after or during explanation

The interface should remain calm.

---

# 21. Speaking Avatar

The future avatar should support:

```text
Audio
 ↓
Speech timing
 ↓
Lip synchronization
 ↓
Facial expression
 ↓
Head movement
 ↓
Gesture
```

The avatar's speaking animation should be driven by actual speech.

It should not simply loop a generic talking animation.

---

# 22. Lip Sync

The final avatar architecture should support phoneme-aware or timing-aware lip synchronization.

Conceptually:

```text
TTS
 ↓
Audio
 ↓
Speech timing / phoneme information
 ↓
Mouth animation
```

Fallback:

```text
TTS Audio
 ↓
Amplitude / timing analysis
 ↓
Approximate mouth movement
```

The system should support an improved lip-sync implementation later without changing the overall Tutor Engine.

---

# 23. Speaking Expressions

Lumo should eventually vary expression according to teaching context.

Examples:

### Explaining

Calm / focused

### Important point

Slight emphasis

### Asking student a question

Curious / attentive

### Correcting misconception

Gentle / reassuring

### Encouraging

Warm / positive

Expressions must remain subtle.

Avoid cartoon-like overacting.

---

# 24. Speaking Subtitles

If subtitles are enabled:

```text
SPEAKING
    ↓
Subtitle begins
    ↓
Text progresses with speech
    ↓
Subtitle ends
```

The subtitle system should ideally synchronize to speech timing.

---

# 25. Subtitle Failure

If subtitle synchronization fails, speech should continue.

The tutor must never stop speaking simply because subtitles failed.

Priority:

```text
Audio > Tutor interaction > Visual subtitle synchronization
```

---

# 26. Speaking Completion

When the response finishes:

```text
SPEAKING
    ↓
Audio ends
    ↓
Subtitle ends
    ↓
Avatar returns to idle
    ↓
IDLE
```

The transition should be smooth.

---

# 27. Student Interruption

Interruption is a first-class feature.

The student should NOT have to wait for Lumo to finish speaking.

This is critical to making Lumo feel conversational rather than like a video player.

---

# 28. Interruption Trigger

Possible triggers:

### Explicit

Student taps interrupt/microphone.

### Voice activity

Student begins speaking while Lumo is speaking.

If voice interruption is supported:

```text
SPEAKING
    ↓
Voice detected
    ↓
INTERRUPTED
```

---

# 29. Interruption Sequence

Canonical flow:

```text
SPEAKING
   ↓
Student interrupts
   ↓
Stop TTS
   ↓
Stop speaking animation
   ↓
Clear / finalize current subtitle
   ↓
INTERRUPTED
   ↓
Activate microphone
   ↓
LISTENING
```

The total transition should feel nearly instantaneous.

---

# 30. Interruption Audio

When interrupted:

- stop Lumo audio immediately
- do not allow audio tail to continue
- cancel queued speech where possible
- release audio resources
- prepare microphone input

Avoid:

```text
Student interrupts
↓
Lumo continues speaking for another 1–2 seconds
```

That makes the tutor feel disconnected from the user.

---

# 31. Interruption Transcript

The transcript must preserve useful conversational context.

Example:

```text
Lumo:
"Inertia is the tendency of an object to..."

Student:
"Wait, why does it happen?"
```

The interrupted Lumo response should not be discarded entirely if it was already generated.

The system should preserve enough context for future continuation.

---

# 32. Interrupted Response Context

The Tutor Engine should know:

```text
Previous response
Current speech position
Student interruption
New student question
```

This allows the next response to understand that the previous explanation was interrupted.

---

# 33. Error State

Errors must never leave the interface stuck.

Bad:

```text
Thinking...
```

forever.

Good:

```text
Something went wrong.

Try again
```

---

# 34. Error Categories

Potential categories:

```text
MICROPHONE_ERROR
SPEECH_RECOGNITION_ERROR
NETWORK_ERROR
MODEL_ERROR
TTS_ERROR
SESSION_ERROR
UNKNOWN_ERROR
```

The user should not necessarily see these technical names.

They are useful internally for handling and analytics.

---

# 35. Microphone Error

Example user-facing behavior:

> Microphone unavailable.

Action:

> Try again

Optional fallback:

> Type instead

---

# 36. Speech Recognition Error

Example:

> I couldn't catch that.

Actions:

> Try again

or:

> Type your question

The lesson should remain intact.

---

# 37. Model Error

Example:

> Lumo couldn't generate a response right now.

Action:

> Try again

If appropriate, backend fallback routing may automatically attempt another provider/model.

The UI should not expose infrastructure complexity.

---

# 38. TTS Error

If text response succeeded but TTS failed:

The text response should remain available.

Potential:

> Lumo couldn't speak this response.

Action:

> Play again

or:

> Read as text

The system should not lose the generated answer.

---

# 39. Network Error

Example:

> Connection interrupted.

Action:

> Retry

The current lesson/session should remain available where possible.

---

# 40. ERROR → IDLE

After recovery:

```text
ERROR
   ↓
Retry / dismiss
   ↓
IDLE
```

Do not automatically force the user into another state unless the recovery action explicitly requires it.

---

# 41. State Priority

Some states take priority over others.

Priority:

```text
ERROR
   ↑
INTERRUPTED
   ↑
SPEAKING
   ↑
THINKING
   ↑
LISTENING
   ↑
IDLE
```

This is conceptual.

Higher-priority events must be able to safely cancel lower-priority operations.

Example:

```text
SPEAKING
+
Student interruption
=
Stop speaking immediately
```

---

# 42. Cancellation Rules

Every asynchronous operation must support cancellation where technically possible.

Operations include:

- speech recognition
- AI generation
- TTS
- subtitle playback
- avatar animation
- voice preview

Example:

```text
TTS request A
     ↓
Student interrupts
     ↓
Cancel / ignore stale result
     ↓
Start request B
```

Stale asynchronous responses must never overwrite newer state.

---

# 43. Race Condition Prevention

The system must prevent cases such as:

```text
Request A
    ↓
Request B
    ↓
B finishes first
    ↓
A finishes later
```

The older response must not replace the newer interaction.

Every interaction should have an identifiable request/session context.

---

# 44. State Ownership

Tutor state should have a single source of truth.

Recommended conceptual state:

```text
TutorSessionState
{
    status,
    currentInteraction,
    transcript,
    audio,
    subtitles,
    lessonContext,
    preferences
}
```

Individual UI components should consume this state.

They should not independently decide:

> "Lumo is speaking now."

---

# 45. Audio State

Audio state should be explicit.

Potential:

```text
audioStatus:
    idle
    recording
    generating
    playing
    stopped
    error
```

This may be separate from Tutor state internally but must remain synchronized with it.

---

# 46. Interaction State

Each user interaction should have a lifecycle.

Conceptually:

```text
Interaction
 ├── startedAt
 ├── userInput
 ├── transcript
 ├── model
 ├── response
 ├── audio
 ├── duration
 ├── interrupted
 └── completed
```

This helps support:

- transcript
- timeline
- analytics
- replay
- debugging

---

# 47. Model Selection During Live Interaction

Ask Lumo explicitly supports:

```text
Lumo Fast
Lumo Light
Lumo Pro
```

The selected model should be associated with that interaction.

Example:

```text
Interaction
 ├── model: lumo-pro
 ├── question
 └── response
```

Changing the selected model later should not rewrite the history of previous interactions.

---

# 48. Language State

Language is part of tutor configuration.

Supported initial options:

```text
English
Hinglish
Hindi
```

The active language should influence:

- speech recognition
- model prompting
- TTS
- subtitles
- voice selection where applicable

---

# 49. Voice State

Voice configuration should be represented explicitly.

Conceptually:

```text
voice
 ├── id
 ├── name
 ├── language
 └── provider
```

Voice previews should use the same underlying voice identity as actual tutor speech.

The preview must not use a placeholder voice.

---

# 50. Narration Speed

Narration speed is a tutor preference.

Example:

```text
0.75×
1.0×
1.25×
1.5×
```

Changing the setting should affect future speech.

The exact behavior for currently playing speech must be decided during implementation.

Preferred behavior:

> Apply to the next generated speech segment.

---

# 51. Subtitle State

Subtitle state:

```text
ON
OFF
```

When OFF:

- no subtitle rendering
- no empty subtitle container
- no subtitle-related animation

When ON:

- subtitles follow active speech

---

# 52. Tutor State + Lesson Visuals

Tutor state may influence the visual teaching canvas.

Example:

```text
SPEAKING
   ↓
Scene animation progresses

LISTENING
   ↓
Scene may pause if lesson logic requires interaction

THINKING
   ↓
Visual scene may remain paused

INTERRUPTED
   ↓
Scene pauses / transitions
```

The exact behavior depends on lesson engine logic.

The UI must support these interactions without coupling the visual renderer directly to the avatar component.

---

# 53. Tutor State + Timeline

Meaningful state transitions may generate timeline events.

Examples:

```text
Lesson started
Concept started
Student question
Lumo explanation
Student interruption
Replay point
Concept completed
```

Not every state transition should become a timeline event.

Avoid timeline spam.

---

# 54. Tutor State + Transcript

Conversation should be committed at meaningful points.

Student:

```text
speech begins
```

↓

Partial transcript:

```text
temporary
```

↓

Speech ends:

```text
final user message
```

↓

Lumo responds:

```text
assistant message
```

↓

Response interrupted:

```text
preserve partial response where useful
```

---

# 55. Natural Conversation Requirement

The tutor should not feel turn-based.

Bad:

```text
Lumo speaks
↓
"Your turn"
↓
Student presses button
↓
Student speaks
↓
Lumo speaks
```

Preferred:

```text
Lumo speaks
↓
Student naturally interrupts
↓
Lumo stops
↓
Student continues
↓
Lumo responds
```

The interface should support conversational flow.

---

# 56. Automatic Listening

Future implementation may support automatic listening after Lumo finishes.

Potential flow:

```text
SPEAKING
 ↓
Response ends
 ↓
IDLE
 ↓
LISTENING
```

This should only be enabled if it produces a better experience and does not cause accidental recording.

The initial implementation may retain explicit microphone activation.

---

# 57. Silence Detection

When LISTENING:

```text
Student speaks
 ↓
Silence detected
 ↓
Speech considered complete
 ↓
THINKING
```

Silence threshold should be configurable internally.

Do not make students learn a technical timing rule.

---

# 58. False Interruption Prevention

If voice interruption is enabled, the system must avoid interpreting:

- background noise
- keyboard sounds
- coughing
- music
- environmental audio

as intentional interruption.

Voice activity detection should be combined with reasonable confidence thresholds.

---

# 59. Accessibility

Every state must be understandable without relying exclusively on color.

Examples:

Listening:

```text
icon + animation + optional label
```

Error:

```text
icon + text + action
```

Speaking:

```text
avatar movement + subtitles when enabled
```

The system should support keyboard and assistive technology where applicable.

---

# 60. Reduced Motion

If reduced-motion preferences are enabled:

- minimize avatar movement
- remove decorative transitions
- preserve functional state feedback
- keep interaction understandable

Do not remove essential feedback.

---

# 61. Light / Dark State Behavior

Tutor states must work in both themes.

The semantic state remains the same.

Only the visual treatment changes.

Example:

```text
LISTENING
Light → warm accent / subtle contrast
Dark  → warm accent / subtle contrast
```

Do not create separate state logic for dark mode.

---

# 62. Motion Principles

Motion should communicate state.

Good motion:

```text
idle → listening
listening → thinking
thinking → speaking
speaking → interrupted
```

Bad motion:

```text
constant decorative floating
glowing
bouncing
rotating
pulsing everything
```

Every animation should answer:

> What information does this motion communicate?

If the answer is "nothing", remove it.

---

# 63. Transition Timing

Transitions should feel fast enough for conversation.

Conceptual guidance:

```text
UI state transition:
~150–250ms

Secondary surface:
~200–300ms

Avatar state:
~200–500ms

Speech interruption:
near-immediate

Audio stop:
immediate
```

These are starting points.

Actual values should be tuned during implementation.

---

# 64. State Transition Table

| Current     | Event             | Next                       | Required Behavior    |
| ----------- | ----------------- | -------------------------- | -------------------- |
| IDLE        | Start microphone  | LISTENING                  | Begin recording      |
| LISTENING   | Speech complete   | THINKING                   | Stop recording       |
| THINKING    | Response ready    | SPEAKING                   | Start TTS            |
| SPEAKING    | Response complete | IDLE                       | Stop speech          |
| SPEAKING    | User interrupts   | INTERRUPTED                | Stop TTS immediately |
| INTERRUPTED | Microphone ready  | LISTENING                  | Begin recording      |
| LISTENING   | Mic error         | ERROR                      | Show recovery        |
| THINKING    | Model error       | ERROR                      | Show recovery        |
| SPEAKING    | TTS error         | ERROR / IDLE               | Preserve text        |
| ERROR       | Retry             | Previous safe state / IDLE | Recover              |
| ERROR       | Dismiss           | IDLE                       | Return to lesson     |

---

# 65. Invalid State Transitions

The system should prevent nonsensical transitions.

Examples:

```text
IDLE → SPEAKING
```

without a response.

```text
LISTENING → SPEAKING
```

without processing/generation.

```text
ERROR → SPEAKING
```

without a successful response.

These should be rejected or safely normalized.

---

# 66. State Persistence

Not every real-time state should be persisted.

Persist:

- conversation
- lesson progress
- timeline
- preferences
- completed interactions

Do NOT persist transient UI states such as:

- current microphone animation
- temporary processing indicator
- avatar frame

unless needed for recovery.

---

# 67. Refresh Behavior

If the page refreshes during:

### IDLE

Restore session normally.

### LISTENING

Do not automatically reopen microphone without explicit user permission.

Return to safe IDLE.

### THINKING

Recover only if the request/session system supports resumability.

Otherwise return safely to IDLE and preserve the last known user input.

### SPEAKING

Do not automatically resume audio without user interaction.

Restore session context rather than blindly replaying speech.

---

# 68. Browser Permission Behavior

Microphone permission must be handled gracefully.

First use:

```text
User activates microphone
 ↓
Browser permission
 ↓
Granted
 ↓
LISTENING
```

Denied:

```text
Permission denied
 ↓
ERROR
 ↓
Explain how to enable microphone
```

Do not repeatedly trigger permission prompts.

---

# 69. Audio Resource Management

When leaving SPEAKING:

- stop audio
- release playback resources
- clear stale audio references
- stop speaking animation

When leaving LISTENING:

- stop microphone stream where appropriate
- stop speech recognition
- release resources

Resource cleanup is mandatory.

---

# 70. Background / Tab Behavior

If the user changes tabs or the browser suspends the page:

The system must avoid:

- continuing hidden microphone capture unexpectedly
- continuing uncontrolled audio
- corrupting tutor state

The exact behavior should follow browser constraints and be implemented safely.

---

# 71. User Intent Over Automation

The system should never become overly autonomous.

Especially:

- microphone activation
- recording
- voice interruption
- audio playback

User control must remain obvious.

The tutor should feel intelligent, not invasive.

---

# 72. Primary Interaction Rule

At every moment, there must be one obvious answer to:

> "What is Lumo doing right now?"

And:

> "What can I do right now?"

Example:

### IDLE

Lumo is ready.

Action:

> Speak

### LISTENING

Lumo is listening.

Action:

> Continue speaking / stop

### THINKING

Lumo is thinking.

Action:

> Wait / cancel if supported

### SPEAKING

Lumo is explaining.

Action:

> Listen / interrupt

### ERROR

Lumo failed.

Action:

> Retry

---

# 73. No Technical Leakage

Never expose infrastructure concepts such as:

```text
Gemini failed
Groq fallback
API timeout
TTS provider unavailable
HTTP 500
WebSocket disconnected
```

unless needed for developer/debug mode.

User-facing language should remain human.

---

# 74. Developer Debug Mode

A development-only debug panel may expose:

```text
Tutor State
Audio State
Model
Latency
STT Status
TTS Status
Request ID
Session ID
```

This should NEVER appear in production UI.

It can be extremely useful while building and testing the Live Tutor.

---

# 75. Telemetry / Analytics

The system should eventually track:

```text
session_started
microphone_started
speech_detected
speech_completed
model_request_started
model_response_received
tts_started
tts_completed
tutor_interrupted
session_error
voice_changed
model_changed
```

This helps identify where real-world interaction breaks down.

---

# 76. Latency Targets

The experience should aim for conversational responsiveness.

Important perceived milestones:

```text
Microphone activation
→ immediate

Speech completion
→ immediate transition to thinking

Response availability
→ speak as soon as useful audio is ready

Interruption
→ immediate audio stop
```

Actual latency targets should be measured against the existing backend infrastructure.

Do not fake responsiveness with arbitrary animations.

---

# 77. Streaming Compatibility

The architecture should allow future streaming.

Potential:

```text
Student finishes speaking
        ↓
Model begins generating
        ↓
First response tokens
        ↓
TTS begins
        ↓
Lumo starts speaking
        ↓
Remaining response continues generating
```

This can significantly reduce perceived latency.

The UI should not prevent this architecture.

---

# 78. Partial Response Handling

If streaming is introduced:

```text
Response chunk 1
 ↓
TTS segment 1

Response chunk 2
 ↓
TTS segment 2

Response chunk 3
 ↓
TTS segment 3
```

The avatar and subtitle system must support continuous speech across segments.

The student should perceive one coherent response.

---

# 79. Interrupt During Streaming

If the student interrupts:

```text
Streaming model
      ↓
Cancel generation
      ↓
Cancel queued TTS
      ↓
Stop current audio
      ↓
Stop avatar speech
      ↓
LISTENING
```

Already generated content may be preserved in transcript depending on implementation.

---

# 80. Final State Contract

The frontend should be able to reliably determine:

```text
currentTutorState
currentAudioState
currentInteraction
currentLessonContext
currentModel
currentVoice
subtitleEnabled
```

These values should be sufficient to render the Live Tutor correctly.

---

# 81. Final Product Test

A new user should be able to watch a complete interaction and understand the sequence without explanation:

```text
Lumo is ready
      ↓
Lumo listens
      ↓
Lumo thinks
      ↓
Lumo speaks
      ↓
Student interrupts
      ↓
Lumo stops
      ↓
Lumo listens again
      ↓
Lumo responds
```

If the user cannot visually understand this sequence, the state design needs work.

---

# 82. Definition of Done

Tutor State & Interaction is complete when:

- all core states exist
- transitions are deterministic
- microphone behavior is reliable
- speech recognition is handled
- model generation is handled
- TTS is handled
- interruption works
- stale requests cannot overwrite current state
- errors recover safely
- subtitles follow speech
- avatar states map correctly
- light mode works
- dark mode works
- accessibility is considered
- resource cleanup works
- refresh behavior is safe
- backend model selection is respected
- voice selection is respected

---

# 83. Final Interaction Philosophy

The Live Tutor should not feel like software switching between screens.

It should feel like a tutor reacting to the student.

The transitions should therefore feel:

```text
Immediate
Natural
Quiet
Predictable
Responsive
Human
```

The technology underneath can be extremely complicated.

The student should never have to think about it.

---

# 84. Final Rule

> **Lumo's state is the language through which the product communicates intelligence.**

The interface does not need to constantly announce:

> "I am AI."

It needs to behave like a responsive tutor.

When Lumo listens, the student knows.

When Lumo thinks, the student knows.

When Lumo speaks, the student knows.

When the student interrupts, Lumo reacts.

When something fails, the student knows what to do next.

That is the foundation of a believable Live AI Tutor.

```

```
````
