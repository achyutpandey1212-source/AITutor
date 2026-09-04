# LUMO UX PRINCIPLES

**Document:** LUMO_UX_PRINCIPLES.md  
**Purpose:** Core UX philosophy and behavioral rules for the Lumo product  
**Audience:** Product designers, developers, AI systems, and Antigravity  
**Status:** Locked — Stage 1 Design Foundation

---

# 1. Core Philosophy

Lumo is a **learning environment, not a dashboard**.

The interface should not feel like a collection of pages, cards, statistics, forms, and settings.

It should feel like a place where a student:

1. Chooses what they want to learn.
2. Becomes curious about the subject.
3. Receives a clear explanation.
4. Interacts with the tutor and lesson.
5. Receives feedback.
6. Builds genuine understanding and mastery.

The UX should therefore represent a **teaching experience**, not merely an application interface.

> **Lumo should feel like a personal tutor has built a learning space specifically for you.**

---

# 2. The Lumo Learning Loop

The fundamental UX loop is:

```text
AUTONOMY
    ↓
CURIOSITY
    ↓
EXPLANATION
    ↓
INTERACTION
    ↓
FEEDBACK
    ↓
MASTERY
    ↓
NEW CURIOSITY
```

Every major Lumo experience should support this loop.

The interface should never interrupt the learning process with unnecessary configuration, navigation, or visual noise.

---

# 3. Autonomy

## Principle

The student should feel that they are **choosing their learning path**, rather than being forced through a rigid system.

Lumo should ask:

> "What do you want to learn?"

rather than immediately asking the student to configure a lesson.

---

## Good UX

```text
What would you like to learn today?

[ Continue Physics ]

[ Explore something new ]

[ Ask your tutor ]

[ Practice a weak concept ]
```

The student is given meaningful choices without being overwhelmed.

---

## Avoid

```text
Configure Lesson

Subject:
[ Select ]

Topic:
[ Select ]

Difficulty:
[ Select ]

Duration:
[ Select ]

Teaching Style:
[ Select ]

Visual Style:
[ Select ]

Voice:
[ Select ]

Start
```

The student should not feel like they are configuring software.

---

## Rule

**Expose choices progressively.**

Do not present every possible option at once.

Start with the student's goal.

Reveal configuration only when it becomes useful.

---

# 4. Curiosity

Learning should begin with curiosity rather than administration.

Lumo should make the student want to discover what comes next.

Curiosity can be created through:

- interesting questions
- surprising examples
- visual demonstrations
- real-world connections
- interactive simulations
- contextual prompts
- short challenges
- "what happens if..." moments

---

## Example

Instead of:

> Lesson 4: Newton's Second Law

Prefer:

> **What happens when you push something twice as hard?**

Then reveal:

> Newton's Second Law

This creates a reason to learn the concept.

---

# 5. Explanation

Explanation is the heart of Lumo.

The AI should not simply output information.

It should **teach**.

A Lumo explanation should ideally combine:

```text
CONTEXT
   ↓
INTUITION
   ↓
EXPLANATION
   ↓
VISUALIZATION
   ↓
EXAMPLE
   ↓
CHECK UNDERSTANDING
```

The tutor should adapt the explanation to:

- student's level
- current concept
- previous mistakes
- previous explanations
- learning progress
- requested explanation style

---

# 6. Explain, Don't Dump

Never treat large blocks of information as teaching.

Avoid:

```text
Definition
+
Long paragraph
+
Five formulas
+
Large diagram
+
Ten bullet points
```

Instead use progressive teaching:

```text
Idea
 ↓
Simple explanation
 ↓
Visual demonstration
 ↓
Example
 ↓
Student interaction
```

The student should always know:

> **"What am I supposed to understand right now?"**

---

# 7. Visuals Are Part of Teaching

Visuals are not decorative elements.

In Lumo, visualizations are a core teaching mechanism.

Whenever a concept benefits from visual representation, the interface should prioritize:

- diagrams
- animations
- formulas
- timelines
- maps
- simulations
- spatial relationships
- real-world scenes
- 3D representations where appropriate
- code execution and visualization where appropriate

The visual should support the explanation rather than compete with it.

---

# 8. Visual Priority

During a teaching session:

```text
LESSON VISUAL
      ↓
PRIMARY FOCUS

AI TUTOR
      ↓
GUIDE

UI CONTROLS
      ↓
SUPPORT
```

The lesson visualization is the stage.

The AI tutor is the teacher guiding the student through that stage.

Controls should remain secondary.

---

# 9. Interaction

Learning should not be passive.

Lumo should frequently give the student opportunities to:

- answer
- predict
- manipulate
- ask questions
- interrupt
- explore
- choose between explanations
- solve problems
- test their understanding

The student should feel like a participant rather than a viewer.

---

## Example

Instead of:

> "Resistance reduces current."

Lumo can ask:

> "If we double the resistance, what do you think happens to the current?"

Then allow the student to answer.

Afterward:

> "Exactly. Now let's see why."

The system then visualizes the relationship.

---

# 10. Conversation Is an Interaction Layer

The tutor should feel conversational rather than transactional.

Students should be able to naturally say:

> "Wait."

> "I didn't understand that."

> "Explain it differently."

> "Give me an example."

> "Why?"

> "What happens if..."

> "Can you go back?"

> "Quiz me."

These should feel like natural actions inside the learning environment.

The interface should not force the student to translate natural language into application commands.

---

# 11. True Barge-In

A live tutor must respect interruption.

When the student begins speaking while the tutor is speaking:

1. Tutor speech should stop immediately.
2. Active visual progression should stop.
3. Active captions should stop.
4. The current turn should become invalid.
5. The student's new input should become the active interaction.
6. No stale response should continue afterward.

The student should feel:

> **"The tutor is listening to me."**

Not:

> "The application is still playing the previous response."

---

# 12. Feedback

Feedback should help the student understand **why** something happened.

Avoid making feedback purely evaluative.

### Avoid

```text
❌ WRONG
```

### Prefer

```text
Almost.

You identified the voltage correctly,
but the resistance is affecting the current.

Let's look at that relationship again.
```

Feedback should feel:

- constructive
- specific
- calm
- immediate
- actionable

---

# 13. Mistakes Are Learning Events

A wrong answer should not feel like failure.

It should become a teaching signal.

The system should use mistakes to determine:

- misconception
- missing prerequisite
- difficulty mismatch
- explanation weakness
- concept requiring reinforcement

Then adapt the lesson.

---

## Example

```text
Student answers incorrectly
          ↓
Identify misconception
          ↓
Explain the misconception
          ↓
Provide alternative explanation
          ↓
Visual demonstration
          ↓
Re-evaluate
```

This is one of the most important behaviors that differentiates Lumo from a normal chatbot.

---

# 14. Adaptation Should Be Visible

Lumo's intelligence should be understandable to the student.

If the tutor detects a weakness, the interface may communicate:

> **I noticed resistance is giving you trouble.**

Then:

```text
Electricity

✓ Voltage
✓ Current

→ Resistance     Let's strengthen this

○ Ohm's Law
○ Circuits
```

The student should understand that Lumo is responding to their learning behavior.

---

# 15. Mastery

Progress should communicate **understanding**, not merely activity.

Avoid making the primary metric:

```text
12 lessons completed
8 hours studied
42 sessions
```

These numbers are useful, but they do not necessarily represent learning.

Instead emphasize:

```text
Concept mastery

Voltage       ████████████████  92%
Current       ██████████████░░  84%
Resistance    █████████░░░░░░  61%
Circuits      ███████░░░░░░░░  48%
```

The important question is:

> **"What do I understand now?"**

---

# 16. The Dashboard Is a Learning Home

The dashboard should not feel like an analytics console.

It should answer three questions immediately:

### 1. Where am I?

Current learning context.

### 2. What should I do next?

Recommended next action.

### 3. How am I improving?

Meaningful mastery information.

---

## Preferred structure

```text
Good morning.

What would you like to learn today?

        ↓

Continue learning

        ↓

Recommended next steps

        ↓

Your mastery

        ↓

Recent discoveries
```

The dashboard should guide the student rather than overwhelm them with data.

---

# 17. Progressive Disclosure

Lumo should reveal complexity gradually.

The principle:

> **Simple first. Powerful when needed.**

A beginner should not need to understand the full feature set.

Advanced options can appear when relevant.

---

## Example

Initial state:

```text
What would you like to practice?

[ Quick Practice ]
[ Deep Practice ]
[ Exam Mode ]
```

After choosing:

```text
Difficulty?

Easy   Medium   Hard
```

Only then expose advanced options if necessary.

---

# 18. Reduce Cognitive Load

Every element on screen should have a purpose.

Ask:

> Does this help the student learn?

If not, remove it or reduce its prominence.

Avoid:

- unnecessary cards
- decorative dashboards
- excessive badges
- redundant text
- competing CTAs
- unnecessary gradients
- excessive animation
- excessive gamification
- visual clutter

---

# 19. One Dominant Focus

Every screen should have a clear primary focus.

The student should not wonder:

> "Where should I look?"

---

## Example

During a lesson:

```text
                 PRIMARY

            VISUAL LESSON


         AI TUTOR / GUIDE


      SECONDARY CONTROLS
```

During assessment:

```text
                 PRIMARY

              QUESTION


          ANSWER AREA


       SECONDARY CONTROLS
```

During onboarding:

```text
                 PRIMARY

          LEARNING GOAL


          NEXT DECISION
```

---

# 20. Negative Space Is Intentional

Lumo should use generous negative space.

Whitespace is not wasted space.

It provides:

- visual hierarchy
- cognitive breathing room
- focus
- premium perception
- separation between concepts

Do not fill empty space simply because it exists.

---

# 21. Calm Interface

Lumo should feel calm even when the underlying technology is complex.

Avoid making every system activity visually loud.

For example:

### Instead of

```text
⚡ AI PROCESSING
🔥 GENERATING
🧠 THINKING
🚀 OPTIMIZING
```

Prefer:

```text
Tutor is thinking...
```

with subtle motion.

The intelligence should feel effortless.

---

# 22. Emotional Design

Lumo should communicate:

```text
"You can figure this out."
```

rather than:

```text
"Prove that you know this."
```

The interface should reduce unnecessary academic anxiety.

This applies especially to:

- assessment
- mistakes
- weak concepts
- incomplete lessons
- difficult questions

---

# 23. Assessment Is Practice, Not Punishment

Assessment should feel like another part of the teaching loop.

The preferred flow is:

```text
Teach
 ↓
Practice
 ↓
Evaluate
 ↓
Understand mistake
 ↓
Adapt
 ↓
Try again
```

Assessment should not abruptly transform the application into a cold examination portal.

---

# 24. Re-Explanation Is a First-Class Interaction

Students learn differently.

Lumo should support requests such as:

> "Explain that again."

> "Explain it more simply."

> "Explain it differently."

> "Give me a real-world example."

> "Show me visually."

> "Use an analogy."

These should be easy and natural.

---

# 25. Replay vs Re-Explain

These are fundamentally different experiences.

### Explain Again

Means:

> **Show me the same explanation again.**

Use deterministic replay where possible.

The previous teaching segment should be reproduced without unnecessary regeneration.

---

### Explain Differently

Means:

> **I didn't understand the previous explanation. Try another approach.**

The tutor should generate a new explanation using the previous concept context.

---

# 26. Real-World Context

Whenever useful, Lumo should connect abstract concepts to real-world situations.

Examples:

### Physics

Force → shopping cart, car, rock, elevator.

### Biology

Cells → body systems, plants, ecosystems.

### Mathematics

Probability → games, weather, everyday decisions.

### Programming

Loops → repeated real-world actions.

### History

Events → maps, timelines, people, locations.

Real-world context should clarify the concept, not become decoration.

---

# 27. Subject-Aware UX

Lumo should not teach every subject using the same visual language.

The underlying interface remains consistent, but the teaching medium changes.

### Physics

- vectors
- motion
- forces
- simulations
- graphs

### Biology

- anatomical diagrams
- cells
- systems
- 3D structures

### Mathematics

- equations
- graphs
- geometric constructions
- step-by-step derivations

### History

- timelines
- maps
- archival-style visuals
- event relationships

### Programming

- code
- execution
- output
- architecture diagrams
- interactive examples

The interface should adapt to the subject.

---

# 28. AI Tutor Personality

The AI tutor should feel:

- patient
- knowledgeable
- encouraging
- conversational
- responsive
- confident without being arrogant
- human-like without pretending to be human

The tutor should not constantly use exaggerated enthusiasm.

Avoid:

> "OMG AMAZING!!! 🔥🔥🔥 YOU GOT IT!!!"

Prefer:

> "Exactly. You've got the idea."

Personality should support learning rather than become the entertainment.

---

# 29. AI Tutor Is the Guide, Not the Product

The AI tutor should not dominate every screen.

The tutor exists to facilitate learning.

During visual teaching:

```text
Visual = primary
Tutor = guide
Controls = support
```

During conversation:

```text
Student + Tutor = primary
Visual = contextual support
```

During assessment:

```text
Question = primary
Tutor = feedback / guidance
```

The hierarchy should change according to the learning task.

---

# 30. Don't Build a Chatbot UI

Lumo should not resemble:

```text
┌──────────────────────────────┐
│ User                         │
│ Explain Newton's laws        │
│                              │
│ AI                           │
│ Newton's laws are...         │
│                              │
│ User                         │
│ I don't understand           │
│                              │
│ AI                           │
│ Here's another explanation   │
└──────────────────────────────┘
```

Conversation can exist, but the experience should be richer:

```text
Student question
      ↓
Tutor response
      ↓
Visual explanation
      ↓
Example
      ↓
Interactive question
      ↓
Feedback
```

Conversation is one layer of the classroom, not the entire classroom.

---

# 31. Lumo Should Feel Like a Product

Every interaction should feel intentional.

Avoid:

- default browser UI
- inconsistent component styles
- arbitrary colors
- random animations
- inconsistent spacing
- placeholder copy
- generic AI loading states
- unnecessary technical terminology

The student should feel that the entire experience belongs to one coherent product.

---

# 32. Visual Hierarchy Rules

Every interface should have:

### Primary

The thing the student should focus on now.

### Secondary

Information that helps with the primary task.

### Tertiary

Controls, metadata, navigation, and optional information.

Never allow all three levels to visually compete equally.

---

# 33. Motion Philosophy

Motion should communicate meaning.

Good motion:

- shows progression
- explains relationships
- highlights changes
- guides attention
- communicates system state
- makes interaction feel responsive

Bad motion:

- exists purely for decoration
- repeatedly distracts
- delays interaction
- competes with teaching visuals
- makes the interface feel childish

The question should always be:

> **"What does this motion communicate?"**

---

# 34. Loading Should Preserve Context

Never make students stare at a generic blank loading screen.

Instead preserve the current context.

For example:

```text
Building your lesson...

Newton's Second Law

[Visual preview remains visible]

Tutor is preparing the explanation...
```

The system should feel active rather than broken.

---

# 35. Errors Should Be Human

Errors should not expose technical implementation details.

Avoid:

```text
500 INTERNAL SERVER ERROR
GEMINI API REQUEST FAILED
TTS PROVIDER EXCEPTION
```

Prefer:

> **Something went wrong while preparing the explanation.**

Then:

> Try again

The technical details can remain available for developers and diagnostics.

---

# 36. Accessibility

Accessibility is part of the product, not an afterthought.

The interface should:

- maintain strong text contrast
- avoid color-only communication
- support keyboard navigation
- provide readable text sizes
- provide clear focus states
- support reduced motion
- provide transcript alternatives for voice
- preserve readable content when audio fails

Color should reinforce meaning, never be the only way meaning is communicated.

---

# 37. Responsive Behavior

Lumo should adapt to the device rather than simply shrink.

### Desktop

Prioritize:

- immersive lesson stage
- visualizations
- tutor presence
- supporting controls

### Tablet

Prioritize:

- lesson stage
- simplified navigation
- accessible interaction

### Mobile

Prioritize:

- tutor interaction
- focused visuals
- essential controls
- readable content

Do not attempt to preserve every desktop element on mobile.

---

# 38. Design for Focus

When the student enters a lesson, the rest of the application should fade into the background.

The lesson should feel like entering a dedicated learning space.

Navigation becomes secondary.

Notifications become secondary.

Statistics become secondary.

The current concept becomes primary.

---

# 39. The Learning Theater

The AI Tutor experience should be treated as a **Learning Theater**.

The basic structure:

```text
┌──────────────────────────────────────────────┐
│ Navigation / Lesson Context                  │
├──────────────────────────────────────────────┤
│                                              │
│                                              │
│             LESSON VISUAL STAGE              │
│                                              │
│        diagrams / simulations / formulas     │
│                                              │
│                           AI TUTOR            │
│                                              │
├──────────────────────────────────────────────┤
│ Lesson Progress / Current Concept            │
├──────────────────────────────────────────────┤
│ Voice / Input / Interaction                  │
└──────────────────────────────────────────────┘
```

The Learning Theater is the signature experience of Lumo.

---

# 40. Design Around the Teaching Loop

Whenever a new feature is proposed, evaluate it against:

```text
AUTONOMY
    ↓
CURIOSITY
    ↓
EXPLANATION
    ↓
INTERACTION
    ↓
FEEDBACK
    ↓
MASTERY
```

Ask:

1. Does this help the student choose?
2. Does this create curiosity?
3. Does this improve explanation?
4. Does this enable meaningful interaction?
5. Does this provide useful feedback?
6. Does this contribute to mastery?

If the answer is no to all of these, the feature probably does not belong in the core learning experience.

---

# 41. Anti-Patterns

Antigravity must actively avoid these patterns.

## Generic AI Dashboard

```text
Cards
Stats
Charts
Recent Sessions
AI Assistant
Settings
```

without a clear learning journey.

---

## ChatGPT Clone

```text
Chat history
Message bubbles
Input box
Send button
```

as the primary teaching experience.

---

## Children's Game

```text
XP
Coins
Streaks
Badges
Confetti
Levels
Rewards
```

everywhere.

---

## Corporate SaaS

```text
Dense tables
Tiny text
Heavy sidebars
Excessive configuration
Analytics-first UI
```

---

## AI Slop

Avoid:

- excessive purple/blue AI gradients
- glowing blobs
- random 3D spheres
- floating glass cards
- meaningless particle effects
- generic robot imagery
- decorative AI terminology

Lumo should feel designed, not AI-generated.

---

# 42. Premium Does Not Mean Complex

Premium design comes from:

- restraint
- consistency
- spacing
- typography
- hierarchy
- purposeful motion
- high-quality visuals
- thoughtful interactions

It does not come from adding more effects.

---

# 43. The Three Core Feelings

Every major Lumo experience should aim to produce:

## CALM

The student knows what to focus on.

## CURIOUS

The student wants to discover what comes next.

## CAPABLE

The student feels that they are making progress.

These three feelings are more important than visual trends.

---

# 44. The Ultimate UX Test

Before shipping a screen, ask:

### Can a student understand what to do within 3 seconds?

If not, simplify.

### Is there one obvious primary action?

If not, improve hierarchy.

### Does the interface help learning?

If not, remove unnecessary elements.

### Does the UI communicate Lumo's intelligence?

If not, find a way to make adaptation, visualization, or personalization visible.

### Does it feel like a place to learn?

If it feels like a dashboard, chatbot, game, or generic SaaS product, redesign it.

---

# 45. Antigravity Implementation Rule

When modifying or creating UI, Antigravity must treat this document as a **UX constitution**.

Do not make isolated visual improvements that violate the larger learning philosophy.

Before implementing a feature:

1. Understand the student's goal.
2. Identify where the feature belongs in the learning loop.
3. Determine the primary interaction.
4. Establish visual hierarchy.
5. Minimize unnecessary configuration.
6. Preserve learning focus.
7. Use motion only when meaningful.
8. Ensure accessibility.
9. Preserve consistency with the Lumo design system.
10. Verify that the result feels like a learning environment rather than a generic web application.

---

# 46. Final Principle

Lumo is not trying to make education look more like software.

Lumo is trying to make software feel more like **learning with a great tutor**.

The ultimate experience should feel like:

```text
I choose what I want to learn.
        ↓
I'm curious.
        ↓
My tutor explains it.
        ↓
I can see it.
        ↓
I can interact with it.
        ↓
I make mistakes safely.
        ↓
The tutor adapts.
        ↓
I understand it.
        ↓
I feel capable.
        ↓
I want to learn the next thing.
```

That loop is the heart of Lumo.

Everything else exists to support it.
