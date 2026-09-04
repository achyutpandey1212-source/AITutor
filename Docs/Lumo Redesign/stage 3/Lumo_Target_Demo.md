# LUMO — TARGET DEMO

**Document Type:** Hackathon Demo Execution Blueprint  
**Stage:** 3 — Product Experience & Interface Architecture  
**Status:** Locked  
**Purpose:** Define the minimum set of experiences that must work exceptionally well for the hackathon demonstration.

---

# 1. PURPOSE OF THIS DOCUMENT

Lumo does NOT need every theoretical feature to be fully production-ready for the hackathon.

The objective is to create a **small number of exceptionally polished, believable and technically impressive learning experiences** that demonstrate the core intelligence of the platform.

This document defines what must receive the highest implementation priority.

The guiding principle is:

> **Do fewer things exceptionally well rather than many things superficially.**

The demo must make judges understand that Lumo is not simply:

- an AI chatbot
- a talking avatar
- a video generator
- a question-answering system
- a generic ed-tech dashboard

Instead, the demo must communicate:

> **Lumo is an AI-native learning environment capable of understanding a student's goal, planning a lesson, visually demonstrating concepts, interacting with the student, evaluating understanding and adapting the teaching experience.**

---

# 2. THE CORE DEMO LOOP

The primary demonstration should follow this sequence:

```text
Landing
   ↓
Choose / Upload Topic
   ↓
Configure Learning Session
   ↓
Start Learning Theater
   ↓
Tutor Introduction
   ↓
Premium Visual Explanation
   ↓
Animated / Interactive Visualization
   ↓
Tutor Checks Understanding
   ↓
Visual Stage Transforms
   ↓
Interactive Question
   ↓
Student Responds
   ↓
AI Evaluates
   ↓
Tutor Adapts Explanation
   ↓
Student Asks a Doubt
   ↓
Lumo AI Opens
   ↓
Context-Aware Doubt Solving
   ↓
Return to Theater
   ↓
Assessment
   ↓
Adaptive Evaluation
   ↓
Revision Recommendation
```

````

This is the **golden path** of the product.

Every major design and engineering decision should be evaluated against whether it strengthens this experience.

---

# 3. DEMO PRIORITY HIERARCHY

Not all features have equal importance.

## Tier 1 — Must Be Exceptional

These are the parts judges should remember.

1. Learning Theater
2. Visual teaching
3. AI tutor interaction
4. Interactive question transformation
5. AI evaluation and adaptation
6. Voice interaction
7. Context-aware Lumo AI
8. At least one impressive 3D / interactive visualization
9. Subject-aware visual demonstrations
10. Overall visual polish

---

## Tier 2 — Must Work Reliably

These support the primary experience.

1. Landing page
2. Topic selection
3. Document upload
4. Existing document selection
5. Dashboard
6. Assessment experience
7. Authentication
8. Session persistence
9. RAG/document context
10. Error and fallback handling

These do not need enormous visual complexity.

They need to feel polished, coherent and reliable.

---

## Tier 3 — Nice to Have

These should only be implemented after Tier 1 and Tier 2 are stable.

Examples:

- Advanced gamification
- Extensive analytics
- Large lesson libraries
- Complex social features
- Large numbers of interactive simulations
- Advanced personalization dashboards
- Large-scale asset libraries
- Extensive voice catalogs
- Experimental AI features

Do not allow Tier 3 work to delay the core demonstration.

---

# 4. THE GOLDEN PATH

The following experience should be considered the primary recorded demonstration.

---

## STEP 1 — LANDING

The student arrives at Lumo.

The landing page should immediately communicate:

> Learn anything. Your way.

The interface should be spacious, calm and premium.

The landing page should NOT overwhelm the user with feature cards.

The primary objective is:

```text
What is Lumo?
Why is it different?
How do I start?
```

The primary CTA should lead directly into learning.

---

# 5. STEP 2 — CHOOSE OR UPLOAD A TOPIC

The student should be able to start learning without navigating through complicated configuration.

Possible entry:

```text
What would you like to learn?

[ Search a topic... ]

Physics
Biology
Chemistry
Mathematics
History
Programming
Astronomy
...
```

The student should also be able to use a document.

```text
Use a document

[ Upload document ]

or

[ Select existing document ▼ ]
```

If an existing document has already been uploaded, the student should NOT need to upload it again.

---

# 6. STEP 3 — CONFIGURE THE SESSION

Before the Theater begins, the student can configure important preferences.

The configuration should remain simple.

Possible controls:

```text
Tutor voice
[ Voice A ▼ ]

Narration speed
[ 0.8x ───●─── 1.2x ]

Teaching style
[ Balanced ▼ ]

Captions
[ Off / On ]

Difficulty
[ Adaptive ]

Start session →
```

The configuration screen should feel like preparing a personalized lesson, not configuring software.

---

# 7. STEP 4 — ENTER THE LEARNING THEATER

This is the primary product experience.

The Theater should immediately feel different from a chatbot.

The visual stage should dominate the screen.

The AI tutor should act as a guide rather than occupying the entire interface.

Conceptually:

```text
┌─────────────────────────────────────────────┐
│ Lumo                              Physics   │
├─────────────────────────────────────────────┤
│                                             │
│                                             │
│             VISUAL LESSON STAGE             │
│                                             │
│        diagrams / animation / 3D            │
│                                             │
│                         ┌───────────────┐   │
│                         │    TUTOR      │   │
│                         │               │   │
│                         └───────────────┘   │
│                                             │
├─────────────────────────────────────────────┤
│ Lesson progress                             │
│ ● Intro ─ ● Concept ─ ○ Practice ─ ○ Quiz  │
├─────────────────────────────────────────────┤
│ 🎙 Talk to Lumo                             │
└─────────────────────────────────────────────┘
```

The Theater should feel like a **learning stage**, not a video player.

---

# 8. STEP 5 — TUTOR INTRODUCTION

The tutor introduces the concept naturally.

Example:

> "Today we're going to understand Newton's Second Law. Instead of memorizing F = ma, let's see what actually happens when we change the force."

The visual stage begins responding immediately.

The voice and visual timeline must remain synchronized.

---

# 9. STEP 6 — PREMIUM VISUAL EXPLANATION

This is one of the most important moments in the demo.

The explanation should not rely primarily on text.

Instead:

```text
Concept
   ↓
Visual representation
   ↓
Animation
   ↓
Narration
   ↓
Highlight
   ↓
Student understanding
```

Example:

### Physics

A cart begins moving.

Force vectors appear.

Mass changes.

Acceleration changes.

The tutor explains the relationship.

The visual demonstrates it.

---

# 10. VISUAL QUALITY TARGET

The visuals should NOT feel like:

- basic SVG diagrams
- PowerPoint slides
- static generated images
- generic educational stock illustrations

The target is:

> **Premium interactive educational visualization.**

Whenever appropriate, visuals may use:

- Remotion
- React Three Fiber
- Three.js
- SVG
- Canvas
- CSS animation
- custom asset libraries
- environmental scenes
- scientific illustrations

The technology should be selected according to the visual requirement.

Do not use 3D simply because it is technically impressive.

Use it when it makes the concept easier to understand or significantly improves the demonstration.

---

# 11. STEP 7 — 3D / INTERACTIVE VISUALIZATION

At least one highly polished interactive visualization should exist for each major showcase subject.

Examples:

## Biology

Interactive 3D cell.

Possible interaction:

```text
Cell
 ├── Nucleus
 ├── Mitochondria
 ├── Ribosome
 └── Cell membrane
```

The tutor can highlight individual structures while explaining them.

---

## Physics

Interactive force / motion simulation.

Example:

```text
Force → [ CART ] → Acceleration
```

Variables can change dynamically.

---

## Chemistry

Molecular / atomic visualization.

Example:

```text
Atom
 ↓
Electron configuration
 ↓
Bond formation
```

---

## Astronomy

Interactive solar system.

The tutor can:

- focus on a planet
- change scale
- explain orbital motion
- compare planets

---

## Mathematics

Interactive geometry.

Example:

```text
Triangle
 ↓
Change angle
 ↓
Observe relationship
 ↓
Derive formula
```

---

## Programming

Interactive code environment.

Example:

```text
Code
   ↓
Execution
   ↓
Output
   ↓
Explanation
```

The visualization should demonstrate what the code actually does.

---

# 12. STEP 8 — TUTOR CHECKS UNDERSTANDING

The tutor should occasionally stop explaining and ask the student a question.

Example:

> "Before we move on, what do you think happens to acceleration if we double the force?"

This is where the Theater changes state.

---

# 13. STEP 9 — VISUAL STAGE TRANSFORMS

The question should NOT simply appear underneath the video.

The visual stage itself should transform into an interactive playground.

Conceptually:

```text
TEACHING STATE

┌──────────────────────────────┐
│                              │
│       VISUAL EXPLANATION     │
│                              │
└──────────────────────────────┘


QUESTION STATE

┌──────────────────────────────┐
│                              │
│     What happens if F × 2?   │
│                              │
│     [ A ] acceleration × 2   │
│     [ B ] acceleration ÷ 2   │
│     [ C ] unchanged          │
│                              │
└──────────────────────────────┘
```

The transition should feel intentional.

The student should feel:

> "The lesson has become interactive."

---

# 14. STEP 10 — STUDENT RESPONSE

Supported question types should include:

### MCQ

Fast interactive selection.

### Short answer

Text response.

### Long answer

Expanded response.

### Numerical

Structured numerical response.

### Handwritten / image response

The student solves the problem on paper and submits an image.

The image is evaluated by the AI.

This is especially valuable for demonstrating realistic academic assessment.

---

# 15. STEP 11 — AI EVALUATION

The system should evaluate the response.

The result should NOT simply say:

```text
Wrong.
```

Instead:

```text
Almost.

Your answer assumes that acceleration depends
only on mass.

Let's look at what happens when force changes.
```

The system should identify the misconception whenever possible.

---

# 16. STEP 12 — ADAPTIVE EXPLANATION

This is one of the strongest judge-facing moments.

If the student struggles:

```text
Student response
      ↓
Misconception detected
      ↓
Teaching strategy changes
      ↓
Alternative explanation
      ↓
New visual
      ↓
Second attempt
```

Example:

> "Let's try this using a shopping cart instead."

The visual stage changes from an abstract equation to a real-world scenario.

This demonstrates that Lumo is **teaching**, not merely generating answers.

---

# 17. STEP 13 — STUDENT ASKS A DOUBT

During the lesson, the student can interrupt:

> "Wait, why does mass matter?"

The system must support true conversational interruption.

The active tutor speech should stop.

The active visual timeline should invalidate safely.

The new request should enter the unified orchestration system.

---

# 18. STEP 14 — LUMO AI OPENS

The student can explicitly open the Lumo AI workspace.

The interface should resemble a compact modern AI assistant.

Conceptually:

```text
┌──────────────────────────────────────┐
│ Lumo AI                         ×    │
├──────────────────────────────────────┤
│                                      │
│ You are learning Newton's Laws.      │
│                                      │
│ ───────────────────────────────────  │
│                                      │
│ Student                              │
│ Why does mass matter?                │
│                                      │
│ Lumo                                 │
│ Think about pushing an empty cart... │
│                                      │
├──────────────────────────────────────┤
│ [ Ask anything...             ]      │
│                                      │
│ Model: Lumo Light ▼                  │
└──────────────────────────────────────┘
```

---

# 19. CONTEXT AWARENESS

Lumo AI must know relevant context from the Theater.

Context may include:

- current subject
- current topic
- current concept
- recent explanation
- current visual
- student's recent responses
- uploaded document
- relevant RAG context
- current assessment state

The student should not have to repeat:

> "I'm talking about the thing you just explained."

The system should already understand.

---

# 20. MODEL SELECTION

The Lumo AI workspace may expose:

```text
Lumo Fast
Lumo Light
Lumo Pro
```

These represent different reasoning/latency profiles.

The interface should make the choice understandable.

Example:

```text
Lumo Fast
Quick answers

Lumo Light
Balanced

Lumo Pro
Deep reasoning
```

The model selector should not expose unnecessary provider implementation details.

The student should interact with **Lumo**, not Gemini/Groq infrastructure.

---

# 21. STEP 15 — RETURN TO THEATER

Closing the Lumo AI workspace should return the student to the exact lesson state.

The Theater should preserve:

- lesson position
- current concept
- visual state
- progress
- assessment state
- conversation context

The interruption should feel like part of the lesson rather than navigating away from it.

---

# 22. STEP 16 — ASSESSMENT

The student may enter the dedicated Assessment experience.

Assessment should feel like:

> **Practice designed around what you need to improve.**

Not:

> Generic exam form.

The student can:

```text
Choose topic
     ↓
Select document
     ↓
Choose practice mode
     ↓
Start assessment
```

Existing documents should be selectable.

New documents can be uploaded directly.

---

# 23. ASSESSMENT DEMO

The ideal demonstration:

```text
Student completes question
        ↓
AI evaluates
        ↓
Misconception identified
        ↓
Difficulty adjusted
        ↓
Next question changes
        ↓
Final mastery result
        ↓
Revision recommendation
```

Example:

> Resistance is still causing difficulty.

> Recommended:
> Review Ohm's Law → Practice 3 targeted questions.

---

# 24. STEP 17 — ADAPTIVE RESULT

The final result should not primarily focus on marks.

Instead:

```text
Your understanding

✓ Voltage
✓ Current

◐ Resistance
○ Circuit combinations

Recommended next:

1. Review resistance
2. Practice Ohm's Law
3. Retry circuit problems
```

The system should communicate:

> **What should I learn next?**

rather than simply:

> **You scored 72%.**

---

# 25. TARGET DEMO SUBJECTS

The demo must prove that Lumo is not restricted to a single subject.

The goal is NOT to build the entire curriculum.

Instead, create one strong showcase scenario for each major category.

---

# 26. BIOLOGY SHOWCASE

## Topic

Cell Structure

## Required experience

```text
Start lesson
    ↓
Tutor introduces cell
    ↓
Cell visualization appears
    ↓
3D / interactive cell
    ↓
Tutor explains organelles
    ↓
Nucleus highlighted
    ↓
Mitochondria highlighted
    ↓
Student asked a question
    ↓
Interactive response
```

## Quality target

The cell should feel alive and visually impressive.

This should be one of the strongest 3D demonstrations in the product.

---

# 27. PHYSICS SHOWCASE

## Topic

Newton's Laws / Force and Motion

## Required experience

```text
Tutor explanation
      ↓
Cart / object visualization
      ↓
Force vector animation
      ↓
Equation appears
      ↓
Variables change
      ↓
Tutor asks:
"What happens if force doubles?"
      ↓
Interactive question
      ↓
Evaluation
      ↓
Adaptive explanation
```

This should demonstrate the relationship between:

**voice + animation + simulation + interaction.**

---

# 28. CHEMISTRY SHOWCASE

## Topic

Atomic structure / Chemical bonding

## Required experience

```text
Atom visualization
      ↓
Electron explanation
      ↓
Interactive structure
      ↓
Tutor asks question
      ↓
Student response
      ↓
Evaluation
```

If possible, show a visually strong molecular or electron interaction.

---

# 29. ASTRONOMY SHOWCASE

## Topic

Solar System

## Required experience

```text
Solar system appears
      ↓
Tutor explains orbital relationships
      ↓
Planet selected
      ↓
Camera focuses
      ↓
Scale / movement visualization
      ↓
Question
```

This is a high-value visual showcase.

---

# 30. MATHEMATICS SHOWCASE

## Topic

Geometry / Algebra

## Required experience

A mathematical relationship should be visually constructed.

Example:

```text
Triangle
      ↓
Angles change
      ↓
Measurements update
      ↓
Formula emerges
      ↓
Tutor explains derivation
```

Avoid relying only on static equations.

---

# 31. PROGRAMMING SHOWCASE

## Topic

A programming concept such as loops, recursion or functions.

The demo should show:

```text
Code
 ↓
Execution
 ↓
State changes
 ↓
Output
```

The student should be able to understand what is happening visually.

This is especially important for demonstrating that Lumo can teach technical subjects rather than only school science.

---

# 32. DOCUMENT / RAG SHOWCASE

At least one demo should use an uploaded document.

Example:

```text
Upload textbook / notes
       ↓
Document processed
       ↓
Student selects topic
       ↓
RAG retrieves relevant context
       ↓
Lumo builds lesson
       ↓
Tutor teaches from document
       ↓
Student asks:
"Explain this part."
       ↓
Lumo answers using document context
```

This proves that Lumo can personalize teaching around the student's own material.

---

# 33. VOICE DEMONSTRATION

Voice interaction should feel natural.

The demonstration should include:

```text
Tutor speaks
     ↓
Student interrupts
     ↓
Tutor stops immediately
     ↓
Student speaks
     ↓
System understands
     ↓
Tutor responds
```

This is a major part of the "human-like tutor" experience.

Barge-in must remain reliable.

---

# 34. VOICE CONFIGURATION

Before the session begins, the student should be able to control:

- tutor voice
- narration speed
- captions
- microphone
- possibly speaking style where supported

Example:

```text
Voice
[ Select voice ▼ ]

Speed
0.8x ───●──── 1.2x

Captions
[ OFF ]

Start →
```

The UI should communicate personalization without exposing technical complexity.

---

# 35. VISUAL CHOREOGRAPHY REQUIREMENT

The AI should not randomly generate a sequence of visuals.

The lesson system should conceptually plan:

```text
Concept
 ↓
Teaching objective
 ↓
Explanation
 ↓
Visual strategy
 ↓
Scene
 ↓
Animation beats
 ↓
Narration
 ↓
Question moment
 ↓
Interaction
 ↓
Evaluation
 ↓
Adaptation
```

The final experience should feel deliberately choreographed.

Every major visual transition should have a pedagogical reason.

---

# 36. REMOTION ROLE

Remotion should primarily handle:

- cinematic lesson sequences
- 2D educational animations
- equations
- timelines
- diagrams
- transitions
- synchronized narration
- caption timing
- visual storytelling

Remotion is the primary engine for deterministic lesson visuals where timeline control is important.

---

# 37. REACT THREE FIBER / THREE.JS ROLE

R3F / Three.js should primarily handle:

- interactive 3D models
- scientific structures
- spatial concepts
- simulations
- environments
- manipulable objects
- camera-controlled exploration

It should NOT be used for every interface element.

The goal is:

> **Use 3D where 3D creates genuine educational value.**

---

# 38. VISUAL ASSET LIBRARY

Over time, Lumo should develop a reusable asset library.

Potential assets:

- humans
- vehicles
- objects
- buildings
- trees
- laboratory objects
- scientific structures
- planets
- cells
- molecules
- geometric objects
- classroom objects
- environments

The asset library allows generated lessons to become more visually consistent and premium.

The hackathon does NOT require a massive library.

A small number of highly polished assets are preferable.

---

# 39. TARGET ASSET STRATEGY

For the demo, prioritize assets required for:

### Biology

- cell
- organelles

### Physics

- cart
- blocks
- force vectors
- ramp
- basic environment

### Chemistry

- atom
- molecule

### Astronomy

- sun
- planets
- orbital paths

### Mathematics

- geometric shapes

### Programming

- code editor
- execution/output representation

These assets should be reusable across multiple lesson scenarios.

---

# 40. FAILURE STATES

The demo must remain believable even when external services fail.

Important cases:

### AI provider failure

Automatically use configured fallback.

### TTS failure

Preserve transcript and visual lesson state.

### STT failure

Preserve session state.

### Visual asset missing

Use graceful fallback visualization.

### Network interruption

Do not corrupt session state.

### Barge-in

Immediately invalidate stale turns.

### Model timeout

Display a concise recovery state.

The student should never see raw backend errors.

---

# 41. WHAT THE JUDGES SHOULD REMEMBER

After watching the demo, the ideal judge reaction is:

> "It understands what the student is learning."

Then:

> "It actually teaches instead of just chatting."

Then:

> "The visuals are part of the explanation."

Then:

> "It can interact with the student."

Then:

> "It notices when the student doesn't understand."

Then:

> "It adapts."

Finally:

> "This could actually become a real learning product."

---

# 42. THE FIVE WOW MOMENTS

The demo should deliberately contain at least five memorable moments.

## WOW #1 — Theater Entry

The interface transitions from the product into the Learning Theater.

The visual stage becomes dominant.

---

## WOW #2 — Premium Visualization

A concept comes alive through an impressive visual.

Example:

> Interactive 3D cell

or

> Physics simulation

or

> Solar system.

---

## WOW #3 — Stage Transformation

The lesson stops explaining.

The visual stage transforms into an interactive question.

This demonstrates that the environment itself is interactive.

---

## WOW #4 — Adaptive Teaching

The student gives an incorrect or incomplete response.

Lumo identifies the problem and changes the explanation.

Example:

> "Let's try this with a real-world example."

The visual changes accordingly.

---

## WOW #5 — Context-Aware Lumo AI

The student opens Lumo AI and asks a contextual question.

Lumo already understands:

- the topic
- current concept
- previous explanation
- uploaded material
- recent difficulty

The student gets an answer without re-explaining the context.

---

# 43. OPTIONAL SIXTH WOW — VOICE INTERRUPTION

If reliable:

```text
Tutor speaking
      ↓
Student:
"Wait!"
      ↓
Tutor stops immediately
      ↓
Student asks question
      ↓
Tutor responds
```

This should be included because it strongly communicates conversational intelligence.

---

# 44. WHAT NOT TO SPEND TIME ON

Do NOT spend major development time on:

- enormous dashboards
- complex gamification
- leaderboards
- social profiles
- huge course catalogs
- elaborate settings pages
- excessive analytics
- dozens of themes
- hundreds of assets
- complex onboarding flows
- decorative 3D backgrounds
- unnecessary AI animations
- features that do not appear in the demo

If a feature does not improve the core learning experience or hackathon judging criteria, it is lower priority.

---

# 45. IMPLEMENTATION PRIORITY

Recommended implementation sequence:

```text
1. Learning Theater foundation
        ↓
2. Theater visual stage
        ↓
3. Tutor / voice experience
        ↓
4. Visual choreography
        ↓
5. Interactive question transformation
        ↓
6. Evaluation + adaptive teaching
        ↓
7. R3F showcase visualization
        ↓
8. Lumo AI context workspace
        ↓
9. Assessment experience
        ↓
10. Document / RAG integration
        ↓
11. Landing page polish
        ↓
12. Dashboard polish
        ↓
13. Responsive refinement
        ↓
14. Demo hardening
```

The Theater receives the largest share of implementation and polish effort.

---

# 46. DEMO QUALITY BAR

A feature should not be considered demo-ready merely because:

> "It works."

It should pass three levels.

### Level 1 — Functional

The feature works technically.

### Level 2 — Reliable

The feature works repeatedly without obvious failures.

### Level 3 — Presentable

The feature looks and behaves like a real product.

The final demo should prioritize Level 3 for the core path.

---

# 47. FINAL TARGET

The final hackathon demo should communicate the following transformation:

```text
Traditional learning

Textbook
   ↓
Read
   ↓
Memorize
   ↓
Answer questions
```

versus:

```text
Lumo

Student goal
      ↓
Personalized lesson
      ↓
AI explanation
      ↓
Visual demonstration
      ↓
Interactive exploration
      ↓
Question
      ↓
Student response
      ↓
AI evaluation
      ↓
Adaptive explanation
      ↓
Mastery
```

This loop is the essence of Lumo.

---

# 48. FINAL PRINCIPLE

The target is NOT:

> "Build an AI tutor that has every feature."

The target is:

> **Build one learning experience so convincing that the judge immediately understands why an AI-native tutor is different from a chatbot and different from traditional ed-tech.**

The Theater is the centerpiece.

The visuals are the differentiator.

The interaction is the proof.

The adaptation is the intelligence.

The context-aware Lumo AI is the assistant layer.

The assessment is the evidence of learning.

Everything else exists to support these experiences.

---

# 49. TARGET DEMO CHECKLIST

Before final submission, verify:

## Core

- [ ] Landing page feels premium
- [ ] Student can start learning quickly
- [ ] Topic can be selected
- [ ] Document can be uploaded
- [ ] Existing document can be selected
- [ ] Theater opens reliably
- [ ] Tutor speaks
- [ ] Voice can be configured
- [ ] Narration speed can be configured
- [ ] Visuals synchronize with narration
- [ ] Student can interrupt tutor
- [ ] Barge-in works
- [ ] Visual stage responds to teaching state
- [ ] Tutor can ask questions
- [ ] Stage transforms into interactive playground
- [ ] MCQ works
- [ ] Short answer works
- [ ] Numerical works
- [ ] Handwritten/image submission works
- [ ] AI evaluation works
- [ ] Misconceptions can be detected
- [ ] Tutor can adapt
- [ ] Lumo AI opens contextually
- [ ] Lumo AI understands Theater context
- [ ] Assessment works
- [ ] Results provide revision guidance

## Visual

- [ ] At least one premium Biology visualization
- [ ] At least one premium Physics visualization
- [ ] At least one premium Chemistry visualization
- [ ] At least one premium Astronomy visualization
- [ ] At least one premium Mathematics visualization
- [ ] At least one premium Programming visualization
- [ ] At least one R3F / Three.js showcase
- [ ] Remotion visuals look polished
- [ ] Tutor visual looks alive
- [ ] Animations are purposeful
- [ ] No unnecessary visual clutter

## Reliability

- [ ] Gemini fallback works
- [ ] Voice failure preserves state
- [ ] STT failure preserves state
- [ ] Stale turns are rejected
- [ ] Visual race conditions are prevented
- [ ] Session state persists
- [ ] RAG context works
- [ ] Assessment state is isolated
- [ ] No raw backend errors reach the student

---

# 50. THE NORTH STAR

Every design and engineering decision should ultimately answer one question:

> **Does this make Lumo feel more like a brilliant personal teacher and less like software?**

If yes:

**Prioritize it.**

If no:

**Question it.**

If it only makes the interface prettier but does not improve the learning experience:

**Keep it secondary.**

If it makes the demo impressive but makes learning harder:

**Remove it.**

Lumo wins when the technology disappears behind the experience.

The student should simply feel:

> **"This tutor gets how I learn."**

```

```
````
