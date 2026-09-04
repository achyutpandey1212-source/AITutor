# LUMO_UX_BLUEPRINT.md

> **Status:** Finalized — Stage 2.2
>
> **Product:** Lumo
>
> **Purpose:** Define the complete user experience architecture of Lumo and translate the Lumo UX Principles into concrete product flows, screens, interaction patterns, and learning experiences.
>
> **Core Philosophy:**
>
> Lumo is a **learning environment, not a dashboard**.
>
> The interface should guide the learner through:
>
> **Autonomy → Curiosity → Explanation → Interaction → Feedback → Mastery**
>
> The UI must make Lumo's intelligence visible without making the interface feel complicated.

---

# 1. UX NORTH STAR

Lumo should feel like a place where a student can enter with a question, learn something visually, interact with the tutor, practice the concept, receive feedback, and continue learning without feeling like they are navigating a traditional educational website.

The product should communicate:

> **"Lumo is teaching with me, not displaying information to me."**

The interface should therefore prioritize:

- Learning over navigation
- Understanding over information density
- Interaction over passive consumption
- Visual explanation over walls of text
- Personalization over rigid curriculum
- Calmness over gamification
- Intelligence over visual gimmicks
- Continuity over disconnected screens

---

# 2. PRIMARY UX LOOP

Every major Lumo experience should support the following loop:

```text
                    AUTONOMY
                       ↓
               What do I want to learn?
                       ↓
                   CURIOSITY
                       ↓
             Why does this work?
                       ↓
                 EXPLANATION
                       ↓
           Lumo teaches the concept
                       ↓
                 INTERACTION
                       ↓
        Student manipulates / answers /
             asks / explores
                       ↓
                   FEEDBACK
                       ↓
       Lumo evaluates understanding
                       ↓
                   ADAPTATION
                       ↓
       Lumo changes explanation,
       difficulty or approach
                       ↓
                   MASTERY
                       ↓
       Student understands the concept
                       ↓
               Next concept / topic
```

````

This loop should be reflected in the actual interface.

---

# 3. PRODUCT INFORMATION ARCHITECTURE

Lumo should have a small number of meaningful primary destinations.

```text
Lumo
│
├── Home
│
├── Learn
│   ├── Live Theater
│   ├── AI Lessons
│   └── Continue Learning
│
├── Practice
│   ├── Quick Practice
│   ├── Assessments
│   └── Exam Practice
│
├── Progress
│
└── Profile / Settings
```

The navigation should remain intentionally simple.

Students should not need to understand Lumo's internal architecture.

---

# 4. HOME — PERSONAL LEARNING HOME

The Home page is not an analytics dashboard.

Its purpose is to answer:

> **"What should I do next?"**

### Primary hierarchy

```text
Greeting

What would you like to learn today?

[ Ask Lumo anything ]

Continue learning

[ Current lesson ]

Your learning

[ Subject mastery ]

Recommended next

[ Concept ] [ Concept ] [ Practice ]
```

---

# 5. HOME — HERO INTERACTION

The most important element on Home should be the ability to immediately start learning.

Example:

```text
What would you like to learn today?

┌───────────────────────────────────────┐
│ Ask Lumo anything...                  │
│                                       │
│ 🎙 Speak        📎 Upload        →     │
└───────────────────────────────────────┘
```

The student should be able to:

- Type a question
- Speak a question
- Upload learning material
- Select a subject
- Continue a previous lesson

The input should feel like an invitation rather than a search box.

---

# 6. CONTINUE LEARNING

Lumo should prominently surface the student's current learning context.

Example:

```text
Continue learning

Physics
Newton's Laws

━━━━━━━━━━━━━━━━━━━━━━
78% mastery

You were exploring:
Force and acceleration

[ Continue lesson ]
```

The system should remember where the student left off.

---

# 7. PROGRESS

Progress should communicate **mastery**, not merely activity.

Avoid making the primary interface:

```text
Hours studied
Sessions completed
Questions answered
Login streak
```

Instead prioritize:

```text
Physics

✓ Motion
✓ Force
◐ Newton's Laws
○ Gravitation

Mastery: 78%
```

The interface should help answer:

> "What do I understand?"

and:

> "What should I strengthen next?"

---

# 8. LIVE THEATER — CORE EXPERIENCE

Live Theater is the flagship Lumo experience.

It should not feel like:

- A chatbot
- A video player
- A Zoom classroom
- A traditional lecture
- An avatar sitting beside text

It should feel like:

> **An interactive learning stage where the lesson responds to the student in real time.**

---

# 9. LIVE THEATER STRUCTURE

The primary theater layout should contain three conceptual layers:

```text
┌──────────────────────────────────────────────┐
│ Lesson context / navigation                  │
├──────────────────────────────────────────────┤
│                                              │
│                                              │
│              LEARNING STAGE                  │
│                                              │
│       diagrams / simulations / formulas      │
│       environments / timelines / code        │
│                                              │
│                            ┌──────────────┐  │
│                            │ AI TUTOR     │  │
│                            │              │  │
│                            └──────────────┘  │
│                                              │
├──────────────────────────────────────────────┤
│ lesson progression / concept navigation      │
├──────────────────────────────────────────────┤
│              🎙 Talk to Lumo                 │
└──────────────────────────────────────────────┘
```

The **learning stage is the visual hero**.

The AI tutor should occupy a smaller area and act as a guide.

---

# 10. LEARNING STAGE

The learning stage is where Lumo demonstrates concepts.

Depending on the subject, it can display:

- Scientific diagrams
- Mathematical equations
- Physics simulations
- 3D objects
- Biological structures
- Maps
- Timelines
- Historical environments
- Charts
- Code
- Architecture diagrams
- Interactive objects
- Real-world scenes
- Generated illustrations
- Step-by-step explanations

The stage should change according to what is being taught.

---

# 11. AI TUTOR

The AI tutor is a guide, not the primary visual content.

The tutor should:

- Speak naturally
- React to the student's input
- Show appropriate expressions
- Provide contextual feedback
- Point attention toward the relevant visual
- Ask questions
- Encourage exploration
- Explain mistakes constructively

The tutor should visually communicate states such as:

```text
Listening
Thinking
Speaking
Waiting
Interrupted
Explaining
Asking
Evaluating
```

The tutor should never dominate the learning stage unnecessarily.

---

# 12. TUTOR SIZE AND POSITION

Default:

```text
Learning Stage: ~75–85%
Tutor:          ~15–25%
```

The exact proportions may change responsively.

The tutor can temporarily become more prominent when:

- Introducing a concept
- Giving important feedback
- Asking a question
- Having a conversational exchange

The tutor can become visually subordinate when:

- A complex diagram is being explained
- A simulation is running
- Code is being demonstrated
- A mathematical derivation is displayed

---

# 13. LIVE THEATER IS STATEFUL

The theater should always communicate what is currently happening.

Possible states:

```text
IDLE
LISTENING
THINKING
SPEAKING
INTERRUPTED
ASSESSMENT
REPLAYING
ERROR
```

These states should be subtle and contextual.

Avoid giant banners saying:

> SYSTEM STATE: THINKING

Instead use natural UI language:

```text
● Lumo is thinking...
```

or:

```text
🎙 Listening...
```

---

# 14. STUDENT INTERRUPTION / BARGE-IN

Barge-in is a first-class interaction.

If Lumo is speaking and the student begins talking:

```text
Lumo speaking
      ↓
Student starts speaking
      ↓
Lumo stops speaking immediately
      ↓
Current visual progression stops
      ↓
Current turn becomes invalid
      ↓
Student input becomes the active interaction
```

The interface must never allow an old tutor response to continue updating the stage after interruption.

This should feel instantaneous.

---

# 15. THEATER QUESTION MODE

A major principle:

> **Questions should become part of the learning stage rather than appearing as an unrelated form underneath the lesson.**

When Lumo decides to ask a question, the learning stage should transform.

Example:

```text
NORMAL LESSON

┌──────────────────────────────────────┐
│                                      │
│        FORCE SIMULATION              │
│                                      │
│        ● ─────────────→              │
│                                      │
└──────────────────────────────────────┘
```

Then:

```text
QUESTION MODE

┌──────────────────────────────────────┐
│                                      │
│          QUICK CHECK                 │
│                                      │
│ What happens to acceleration         │
│ if the force is doubled?             │
│                                      │
│   ○ It decreases                     │
│   ○ It stays the same                │
│   ○ It increases                     │
│   ○ Cannot be determined             │
│                                      │
└──────────────────────────────────────┘
```

The visual stage itself becomes interactive.

---

# 16. QUESTION TYPES

Lumo should support multiple interaction formats.

### Multiple Choice

```text
○ Option A
○ Option B
○ Option C
○ Option D
```

### Short Answer

```text
[ Type your answer... ]
```

### Long Answer

```text
[ Write your explanation... ]
```

### Numerical

```text
Solve the problem.

[ Answer ]
```

### Handwritten / Notebook Answer

For heavier numerical or board-style questions:

```text
Solve this on paper.

[ Upload your solution ]
```

The submitted image can be evaluated by the assessment system.

This mode should intentionally encourage students to practice writing complete, clean solutions.

---

# 17. QUESTION TRANSITION

The transition from lesson to question should feel like a natural teaching moment.

Example:

```text
Tutor:

"Okay, you've seen what happens when
force increases.

Now let's see if you've got it."

                    ↓

Learning stage transforms

                    ↓

Interactive question
```

Avoid suddenly opening a disconnected modal unless absolutely necessary.

---

# 18. ANSWER FEEDBACK

Feedback should focus on understanding rather than judgment.

Avoid:

```text
❌ WRONG
```

Prefer:

```text
Almost.

You correctly identified the force,
but acceleration depends on mass too.

Let's look at the relationship again.
```

The relevant visual should return to the stage.

---

# 19. ADAPTIVE TEACHING

Assessment should directly influence teaching.

Example:

```text
Student answers incorrectly
            ↓
Lumo identifies misconception
            ↓
Stage highlights relevant concept
            ↓
Tutor explains differently
            ↓
Student tries again
            ↓
Understanding improves
```

The student should be able to visually see that Lumo adapted.

Example:

```text
Lumo noticed you're having trouble
with resistance.

Let's approach it differently.
```

This is a key product differentiator.

---

# 20. REPLAY VS RE-EXPLAIN

These must remain visually and behaviorally distinct.

### Explain Again

Student:

> "Explain that again."

Lumo should replay the previous teaching segment deterministically.

```text
↻ Replaying
```

The same visual and explanation should return.

No unnecessary regeneration should occur.

---

### Explain Differently

Student:

> "I still don't get it."

or:

> "Can you explain it another way?"

Lumo should generate a new explanation using the previous context.

```text
💡 Trying another explanation
```

The visual may change.

---

# 21. VISUAL CONTINUITY

Lumo should avoid resetting the entire stage whenever the student asks a follow-up.

Example:

```text
Current visual:

FORCE → OBJECT → ACCELERATION
```

Student:

> "What happens if the mass increases?"

The stage should modify the existing visualization.

For example:

```text
FORCE → OBJECT
          ↓
       larger mass

Acceleration ↓
```

This makes the lesson feel continuous rather than like a sequence of unrelated generated slides.

---

# 22. DOUBT SOLVER / LUMO AI

The main lesson should remain focused.

Students should nevertheless have access to a dedicated AI interaction layer.

Possible entry point:

```text
✨ Ask Lumo
```

or:

```text
?
```

This opens a focused doubt-solving interface without destroying the current lesson state.

---

# 23. DOUBT SOLVER EXPERIENCE

The doubt solver should feel like a temporary side interaction.

Example:

```text
┌──────────────────────────────────────┐
│ Ask Lumo                         ×   │
├──────────────────────────────────────┤
│                                      │
│ What are you confused about?         │
│                                      │
│ [ Ask your doubt... ]                │
│                                      │
│ 🎙 Speak                             │
│                                      │
├──────────────────────────────────────┤
│ Lumo model                            │
│                                      │
│ Fast     Light     Pro                │
└──────────────────────────────────────┘
```

The current lesson should remain available behind or alongside the interface where practical.

---

# 24. MODEL SELECTOR

Lumo may expose different reasoning modes where appropriate.

Conceptually:

```text
Lumo Fast
```

For:

- Very quick questions
- Simple clarification
- Conversational interaction
- Lightweight follow-ups

```text
Lumo Light
```

For:

- Normal tutoring
- Simple explanations
- Routine interaction
- Fast classroom dialogue

```text
Lumo Pro
```

For:

- Complex reasoning
- Difficult questions
- Deep explanations
- Advanced problem solving

The UI should not expose raw provider names such as Gemini or Groq to students.

The user interacts with **Lumo modes**, not infrastructure.

---

# 25. AI MODEL ROUTING PHILOSOPHY

The product should internally separate AI work according to complexity.

### Fast AI work

Use lightweight / fast models for:

- Conversational turns
- Simple follow-up questions
- Intent classification
- Basic clarification
- Short responses
- Routine classroom interaction

### Heavy AI work

Reserve stronger reasoning models for:

- Lesson planning
- Complex reasoning
- Visual strategy
- Scene generation
- Beat planning
- Complex assessment generation
- Difficult problem solving
- Deep adaptive analysis

The goal is:

> **Do not spend expensive or slow reasoning on simple classroom conversation.**

This should be invisible to the student.

---

# 26. VOICE EXPERIENCE

Voice should feel conversational rather than like a text-to-speech reader.

The system should support:

- Speech recognition
- Natural tutor speech
- Interruptions
- Voice selection
- Speech speed
- Playback control
- Cancellation
- Fallback to readable text

The tutor's voice should be configurable through settings.

Potential controls:

```text
Voice
[ Selected voice ]

Speaking speed
○ 0.75×
● 1.0×
○ 1.25×
○ 1.5×
```

Additional voice providers can be integrated later without changing the UX.

---

# 27. CAPTIONS

Captions should not automatically duplicate the tutor's entire narration in large text.

Default:

```text
Captions: OFF
```

When enabled:

- Keep them visually subtle
- Synchronize them with speech
- Avoid covering important visuals
- Allow accessibility-focused reading
- Never make captions compete with the learning stage

---

# 28. AI LESSONS

AI Lessons are the more structured, prepared learning experience.

They should feel different from Live Theater.

Live Theater:

> **Conversation-first**

AI Lessons:

> **Lesson-first**

Possible flow:

```text
Choose topic
      ↓
Lumo prepares lesson
      ↓
Preview
      ↓
Start lesson
      ↓
Visual explanation
      ↓
Interactive checkpoints
      ↓
Assessment
      ↓
Summary
```

---

# 29. AI LESSON VISUAL STRUCTURE

AI Lessons should follow a clear visual progression.

Example:

```text
Introduction
     ↓
Concept
     ↓
Visual demonstration
     ↓
Example
     ↓
Student interaction
     ↓
Practice
     ↓
Recap
```

The interface should make this progression visible without becoming a rigid progress bar.

---

# 30. SUBJECT-AWARE UX

The visual language of the learning stage should adapt to the subject.

### Physics

- Forces
- Motion
- Vectors
- Simulations
- Real-world objects

### Biology

- Cells
- Organs
- Molecules
- Biological processes
- 3D structures

### Chemistry

- Molecules
- Reactions
- Atomic structures
- Particle interactions

### Mathematics

- Graphs
- Geometry
- Equations
- Coordinate systems
- Step-by-step derivations

### History

- Timelines
- Maps
- Historical scenes
- People
- Events

### Geography

- Maps
- Terrain
- Climate
- Environmental scenes
- Spatial relationships

### Programming

- Code
- Execution flow
- Architecture
- Data structures
- Visual debugging
- Output

The design system remains consistent while the content expression changes.

---

# 31. 2D VS 3D UX

3D should be used where depth or spatial understanding provides genuine educational value.

Use 3D for:

- Solar systems
- Cells
- Molecules
- Mechanical objects
- Geometry
- Spatial structures
- Interactive simulations
- Complex environments

Use 2D for:

- Simple diagrams
- Timelines
- Equations
- Basic charts
- Text explanations
- Lightweight illustrations
- UI elements

Rule:

> **3D is an educational instrument, not decoration.**

---

# 32. PRACTICE EXPERIENCE

Practice should feel less intimidating than an examination.

Instead of:

> Start Assessment

Prefer:

> **Let's practice**

Possible modes:

```text
Quick Practice
```

Short, low-pressure session.

```text
Deep Practice
```

More detailed conceptual practice.

```text
Exam Practice
```

Board / CBT-style structured assessment.

---

# 33. ASSESSMENT SETUP

Use progressive disclosure.

Instead of displaying a large configuration form:

```text
Subject
Topic
Source
Question type
Difficulty
Question count
Time
...
```

Guide the student through a short conversational setup.

Example:

```text
What are we practicing?

[ Physics ]

What topic?

[ Electricity ]

How do you want to practice?

[ Quick ] [ Deep ] [ Exam ]

Challenge level?

[ Easy — Medium — Hard ]

                [ Start ]
```

Only show advanced options when necessary.

---

# 34. ASSESSMENT EXPERIENCE

Assessment should feel like focused practice.

The interface should clearly communicate:

```text
Question 4 of 10

██████████████░░░░

[ Question ]

[ Answer ]

[ Submit ]
```

But avoid excessive examination anxiety.

The visual system should remain aligned with Lumo's calm identity.

---

# 35. HANDWRITTEN ANSWERS

For supported questions:

```text
Solve this problem on paper.

Show your complete working.

[ Upload solution ]
```

After evaluation:

```text
Your answer

✓ Correct approach

△ Check this step

Lumo's feedback:
...
```

The system should evaluate reasoning and presentation according to the configured assessment rules.

---

# 36. SESSION SUMMARY

After a lesson or practice session, the student should not simply see:

```text
Score: 82%
```

Instead:

```text
Today's learning

You learned:
✓ Voltage
✓ Current
✓ Resistance

You strengthened:
◐ Ohm's Law

You may want to revisit:
○ Circuit relationships

Mastery
██████████████░░ 82%

[ Continue learning ]
```

The summary should answer:

> What did I learn?

> What do I understand?

> What should I do next?

---

# 37. PROGRESS EXPERIENCE

Progress should be organized around concepts.

Example:

```text
Physics

Motion             ████████████  92%
Force              ██████████░░  81%
Electricity         ████████░░░░  67%
Optics             ██████░░░░░░  51%
```

Selecting a concept should reveal:

- Covered lessons
- Strengths
- Weaknesses
- Previous mistakes
- Recommended next lesson
- Recent assessment performance

---

# 38. ADAPTIVE RECOMMENDATIONS

Recommendations should be generated from learning history.

Example:

```text
Recommended for you

You struggled with resistance
during your last session.

Try:
"Resistance — explained visually"

12 min
```

Recommendations should feel helpful rather than algorithmic.

Avoid:

> AI RECOMMENDATION ENGINE SUGGESTS...

Use:

> **Lumo thinks this would help.**

---

# 39. NAVIGATION

Desktop navigation should remain compact.

Possible structure:

```text
Lumo

Home
Learn
Practice
Progress

────────────

Profile
Settings
```

Do not fill the sidebar with every possible feature.

Secondary features can live inside contextual menus.

---

# 40. MOBILE UX

The learning experience should be responsive, but the theater should not simply shrink the desktop layout.

On mobile:

```text
┌─────────────────────┐
│ Lesson              │
├─────────────────────┤
│                     │
│   LEARNING STAGE    │
│                     │
│                     │
├─────────────────────┤
│ AI Tutor             │
├─────────────────────┤
│ 🎙 Talk to Lumo      │
└─────────────────────┘
```

Controls should be thumb-accessible.

The visual stage remains the primary focus.

---

# 41. RESPONSIVE PRIORITIES

When screen space decreases:

1. Preserve the learning visual
2. Preserve tutor interaction
3. Preserve student input
4. Preserve essential lesson context
5. Collapse secondary controls
6. Hide non-essential metadata

Never allow decorative UI to consume space needed for learning.

---

# 42. MODALS

Modals should be reserved for tasks that genuinely require focus.

Good uses:

- Settings
- Model selection
- Voice selection
- Confirmation
- Upload
- Session exit

Avoid using modals for:

- Normal teaching
- Routine questions
- Tutor responses
- Standard feedback

Learning should happen inside the learning environment.

---

# 43. TOASTS

Toasts should be used for lightweight system feedback.

Examples:

```text
Lesson saved
```

```text
Voice changed
```

```text
Solution uploaded
```

Avoid using toasts for educational feedback.

Educational feedback belongs in the learning stage.

---

# 44. ERROR UX

Errors should preserve the student's learning flow whenever possible.

Bad:

```text
ERROR 500
MODEL FAILURE
```

Better:

```text
Lumo couldn't generate the visual right now.

I've kept the explanation available below.

[ Continue ]
```

If TTS fails:

```text
Lumo couldn't play the voice.

The explanation is still available as text.
```

If STT fails:

```text
I couldn't hear that.

Try again or type your question.
```

---

# 45. LOADING UX

Avoid generic:

```text
Loading...
```

Use contextual language.

Examples:

```text
Lumo is preparing the lesson...
```

```text
Lumo is thinking...
```

```text
Building the visual...
```

```text
Preparing your practice...
```

Loading states should communicate what the system is actually doing.

---

# 46. EMPTY STATES

Empty states should invite action.

Instead of:

```text
No lessons.
```

Use:

```text
Your learning journey starts here.

Ask Lumo something,
choose a topic, or upload your material.

[ Start learning ]
```

---

# 47. AUTHENTICATION UX

Authentication should be almost invisible.

The goal is:

```text
Sign in
      ↓
You're in Lumo
```

Avoid unnecessary onboarding questionnaires.

Collect additional information progressively when it improves personalization.

---

# 48. ONBOARDING

If onboarding is used, it should demonstrate the product rather than explain it.

Possible flow:

```text
Welcome to Lumo

What are you learning?

        ↓

Ask your first question

        ↓

Lumo demonstrates visual teaching

        ↓

"That's how learning works here."
```

The student should experience the product quickly.

---

# 49. AI PERSONALITY IN UX

Lumo should communicate like a patient tutor.

Preferred:

> "Let's look at this another way."

> "I think the confusing part is here."

> "You're close. Check what happens to the mass."

> "Want me to show this visually?"

Avoid:

> "Incorrect response."

> "Processing request."

> "Your query has been received."

> "AI-generated explanation complete."

---

# 50. CHILD → COLLEGE ADAPTATION

Lumo should support different learner ages without creating entirely separate products.

Younger learners may receive:

- Larger controls
- More expressive visuals
- Simpler language
- More visual examples
- More playful interaction

Older learners may receive:

- Denser technical information
- Advanced notation
- Code
- Detailed explanations
- More sophisticated visualizations

The core Lumo design language remains consistent.

---

# 51. GAMIFICATION

Gamification should support mastery rather than become the product.

Preferred:

```text
Mastery
███████████░░

8 concepts strengthened this week
```

Avoid making the core interface revolve around:

- XP
- Streaks
- Leaderboards
- Badges
- Coins
- Rewards
- Combos

The primary reward should be:

> **"I understand this now."**

---

# 52. MOTION IN UX

Motion should communicate:

- State changes
- Cause and effect
- Progression
- Spatial relationships
- Focus
- Feedback

Learning animations should support comprehension.

Examples:

```text
Equation builds progressively
```

```text
Force vector moves the object
```

```text
Timeline advances through events
```

```text
Cell components reveal sequentially
```

Decorative animation should remain secondary.

---

# 53. CINEMATIC MOMENTS

Lumo can occasionally create memorable transitions.

Examples:

```text
A flat diagram expands into a 3D model.
```

```text
A map zooms into the relevant region.
```

```text
A cell opens into its internal structure.
```

```text
A code block transforms into an execution flow.
```

These moments should be purposeful and tied to the lesson.

---

# 54. LEARNING STAGE TRANSFORMATION

One of Lumo's signature UX behaviors should be:

> **The same stage can transform depending on what the student is doing.**

Example:

```text
Explanation
     ↓
Visual demonstration
     ↓
Interactive simulation
     ↓
Question
     ↓
Student answer
     ↓
Feedback
     ↓
Re-explanation
```

This creates the feeling of a living classroom.

---

# 55. CONTEXTUAL CONTROLS

Controls should appear when they are relevant.

During speaking:

```text
✋ Stop
```

During replay:

```text
↻ Replaying
```

During assessment:

```text
Submit
```

During visual exploration:

```text
Reset
```

Do not permanently expose every possible action.

---

# 56. LUMO AI ENTRY POINT

The student should always have access to help without leaving the current context.

A subtle persistent control may be:

```text
✨ Ask Lumo
```

It can open:

- Doubt solver
- Quick explanation
- Concept clarification
- Model selection
- Voice interaction

This should never overpower the main lesson.

---

# 57. CORE UX DIFFERENTIATOR

The strongest UX differentiator is not the dashboard.

It is:

> **The learning environment changes based on the student's interaction.**

A normal educational platform:

```text
Video
↓
Question
↓
Score
```

Lumo:

```text
Explain
↓
Visualize
↓
Ask
↓
Student responds
↓
Understand response
↓
Adapt
↓
Visualize differently
↓
Try again
↓
Master
```

That distinction should be visible within seconds of using the product.

---

# 58. JUDGE-FIRST EXPERIENCE

For demonstrations, the product should make the following immediately obvious:

### 1. Voice

Student speaks naturally.

### 2. Tutor

Lumo responds naturally.

### 3. Visual intelligence

The learning stage changes according to the explanation.

### 4. Interaction

Lumo asks a question.

### 5. Assessment

Student answers.

### 6. Adaptation

Lumo identifies the weakness.

### 7. Re-explanation

Lumo changes the teaching strategy.

### 8. Continuity

The visual lesson continues rather than resetting.

The judge should understand:

> **This is an AI teacher, not an AI chatbot with educational content.**

---

# 59. UX PRIORITY HIERARCHY

When deciding between competing UI elements, use this order:

```text
1. Learning clarity
2. Student interaction
3. AI teaching state
4. Visual explanation
5. Context
6. Navigation
7. Progress
8. Decoration
```

Never sacrifice learning clarity for visual spectacle.

---

# 60. THE LUMO EXPERIENCE IN ONE SCREEN

The ideal Live Theater should communicate:

```text
┌──────────────────────────────────────────────────┐
│ Lumo                              Physics · 3/7  │
├──────────────────────────────────────────────────┤
│                                                  │
│                                                  │
│               LEARNING STAGE                    │
│                                                  │
│                  F = ma                          │
│                                                  │
│             ● ─────────────→                     │
│                                                  │
│                                  ┌────────────┐  │
│                                  │   Lumo     │  │
│                                  │  speaking  │  │
│                                  └────────────┘  │
│                                                  │
├──────────────────────────────────────────────────┤
│ Intro     Force     Motion     ● Checkpoint      │
├──────────────────────────────────────────────────┤
│                                                  │
│  ✨ Ask Lumo                 🎙 Talk to Lumo      │
│                                                  │
└──────────────────────────────────────────────────┘
```

The student should immediately understand:

> "I'm inside a lesson."

Not:

> "I'm inside a dashboard."

---

# 61. THE LUMO UX PRINCIPLE

Every major interaction should pass this test:

### Does this help the student learn?

If yes:

Keep it.

### Does it communicate useful context?

If yes:

Keep it.

### Is it visually beautiful but educationally irrelevant?

Reduce it.

### Is it technically impressive but distracting?

Hide it or make it contextual.

### Is it adding complexity without improving learning?

Remove it.

---

# 62. FINAL UX MANTRA

Lumo should feel:

**Calm enough to focus.**

**Beautiful enough to inspire curiosity.**

**Interactive enough to explore.**

**Intelligent enough to adapt.**

**Human enough to feel accompanied.**

And above everything:

> **Lumo should make difficult things feel understandable.**

---

# 63. IMPLEMENTATION GUIDANCE

This document defines UX behavior and hierarchy.

It does NOT dictate a specific frontend implementation.

Implementation decisions such as:

- React architecture
- Next.js migration
- GSAP
- Three.js / React Three Fiber
- Remotion
- WebGL
- animation libraries
- rendering strategies
- backend architecture
- AI providers

should be evaluated separately against the existing technical architecture.

The redesign must **improve the existing product without unnecessarily rewriting stable backend systems**.

---

# 64. DESIGN SYSTEM DEPENDENCY

All UI described in this document must follow:

- `LUMO_BRAND_GUIDELINES.md`
- `LUMO_DESIGN_SYSTEM.md`
- `LUMO_COMPONENT_SYSTEM.md`
- `LUMO_MOTION_GUIDELINES.md`
- `LUMO_ILLUSTRATION_GUIDELINES.md`
- `LUMO_UX_PRINCIPLES.md`

These documents together define Lumo's visual and experiential language.

---

# 65. FINAL PRODUCT EXPERIENCE

The intended experience is:

```text
                    LUMO

             "What do you want
                to learn?"

                     ↓

                  Student

                     ↓

              Lumo understands

                     ↓

              Lumo explains

                     ↓

          Visual stage comes alive

                     ↓

              Lumo asks a question

                     ↓

             Student interacts

                     ↓

              Lumo evaluates

                     ↓

          Lumo identifies weakness

                     ↓

          Lumo adapts the lesson

                     ↓

          New visual explanation

                     ↓

               Student understands

                     ↓

                 Mastery

                     ↓

              "What next?"
```

This is the core experience that every future Lumo feature should strengthen.

```

```
````
