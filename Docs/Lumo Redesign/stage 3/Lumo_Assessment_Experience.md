# LUMO — ASSESSMENT EXPERIENCE

**Document:** `LUMO_ASSESSMENT_EXPERIENCE.md`  
**Stage:** 3 — Page & Experience Architecture  
**Status:** Design Specification  
**Product:** Lumo

---

# 1. Purpose

The Lumo Assessment experience is a dedicated environment for students who want to:

- practice a topic
- test their understanding
- prepare for examinations
- identify misconceptions
- revise weak areas
- attempt mock tests
- practice board/CBT-style examinations
- evaluate handwritten/numerical answers

Assessment is not merely a question generator.

It is an extension of Lumo's teaching loop:

> **Understand → Practice → Answer → Evaluate → Diagnose → Adapt → Revise → Master**

The Assessment experience should therefore feel like a **focused practice environment**, not a generic web form and not an intimidating examination portal.

---

# 2. Core Philosophy

Assessment should answer three questions:

1. **What does the student know?**
2. **Where does the student struggle?**
3. **What should the student do next?**

The interface should never make the student feel that a mistake is simply a failure.

Instead:

> **A wrong answer is information about what Lumo should teach next.**

The system should therefore prioritize:

- clarity
- focus
- confidence
- constructive feedback
- adaptive difficulty
- misconception detection
- actionable revision

---

# 3. Assessment Personality

The Assessment experience should feel:

- focused
- calm
- intelligent
- encouraging
- credible
- exam-ready
- responsive

It should NOT feel:

- childish
- excessively gamified
- cluttered
- overly colorful
- intimidating
- like a corporate analytics dashboard

The visual language must remain consistent with the Lumo design system.

---

# 4. Assessment Information Architecture

The Assessment experience consists of:

```text
Assessment Home
      │
      ├── Choose Practice
      │
      ├── Select Topic
      │
      ├── Select Document
      │
      ├── Configure Practice
      │
      └── Start
             │
             ▼
       Assessment Session
             │
             ├── Question
             ├── Answer
             ├── Evaluation
             ├── Feedback
             └── Next Question
                     │
                     ▼
                Assessment Results
                     │
                     ├── Performance
                     ├── Misconceptions
                     ├── Mastery
                     ├── Weak Areas
                     └── Revision Plan
```

````

---

# 5. Assessment Landing

The Assessment landing page should immediately communicate:

> **Practice until you understand.**

or an equivalent concise product message.

The page should provide clear entry points without overwhelming the student.

Primary actions:

- Quick Practice
- Topic Practice
- Mock Test
- Continue Previous Assessment

Secondary actions:

- Choose a document
- Upload a document
- Review previous results

---

# 6. Assessment Modes

Lumo should expose a small number of meaningful practice modes rather than presenting a huge configuration panel.

## 6.1 Quick Practice

Purpose:

Fast revision or spontaneous practice.

Characteristics:

- short session
- approximately 5–10 questions
- adaptive difficulty
- focused on one selected topic
- minimal configuration

Example:

```text
Quick Practice

Topic
Newton's Laws

Questions
10

Difficulty
Adaptive

[ Start Practice ]
```

---

## 6.2 Topic Practice

Purpose:

Deep practice on a specific concept or chapter.

Characteristics:

- student selects subject
- student selects topic/chapter
- document can optionally provide context
- question difficulty adapts during the session
- misconception tracking enabled

---

## 6.3 Mock Test

Purpose:

Exam preparation.

Characteristics:

- fixed number of questions
- configurable duration
- defined question distribution
- reduced tutoring during the attempt
- exam-like navigation
- final evaluation after submission

Possible configurations:

```text
Mock Test

Subject
Physics

Chapter
Electricity

Questions
30

Duration
45 min

Difficulty
Board / Exam Level

[ Start Mock Test ]
```

---

## 6.4 Board / CBT Practice

This mode is designed around the future direction of computer-based examination experiences.

It should simulate:

- timed examination
- question navigation
- section structure
- answer submission
- numerical questions
- written-answer questions
- image-based handwritten responses
- review-before-submit
- final submission

This mode should feel significantly more exam-oriented than normal practice.

---

# 7. Topic Selection

Topic selection should be simple.

Preferred hierarchy:

```text
Subject
   ↓
Chapter / Unit
   ↓
Topic
   ↓
Optional sub-topic
```

Example:

```text
Physics
  └── Mechanics
       └── Newton's Laws
            └── Friction
```

The student should not need to manually configure technical identifiers or internal curriculum structures.

---

# 8. Document-Aware Assessment

Documents are a first-class learning resource in Lumo.

The student should NOT be forced to visit a separate document-management page before starting an assessment.

Assessment should support document selection directly.

---

# 9. Existing Document Dropdown

When starting an assessment, provide:

```text
Use learning material

○ No document

▼ Select an existing document
```

The dropdown may contain:

- previously uploaded textbooks
- PDFs
- notes
- study material
- supported learning documents

Example:

```text
Learning material

[ Class 10 Physics Notes        ▼ ]

or

[ + Upload new document ]
```

The student can therefore return days later and reuse an existing document without uploading it again.

---

# 10. Document Selection Behavior

Selecting an existing document should allow Lumo to use its indexed/RAG content for:

- question generation
- topic grounding
- answer evaluation
- explanation
- misconception analysis
- revision recommendations

The UI should communicate that the document is being used as learning context.

Example:

```text
Using:

Class 10 Physics Notes.pdf

Topic:
Electricity

Questions will be based on this material.
```

---

# 11. Upload Flow

The upload flow should be lightweight.

Preferred interaction:

```text
Choose your material

┌─────────────────────────────┐
│                             │
│   Drop your document here   │
│                             │
│      or browse files        │
│                             │
└─────────────────────────────┘
```

After upload:

```text
Document ready ✓

What should we practice?

[ Electricity ▼ ]

[ Start Practice ]
```

The user should not be sent through multiple unnecessary pages.

---

# 12. RAG Integration

When a document is selected:

```text
Student
   ↓
Document
   ↓
RAG Retrieval
   ↓
Relevant Context
   ↓
Assessment Generation
   ↓
Question
```

RAG should ground questions and explanations in the selected material where appropriate.

However, the UI should not expose technical terminology such as:

- embeddings
- vector search
- chunk retrieval
- retrieval pipeline

to normal students.

The student sees:

> **Based on your study material**

not:

> RAG context injected.

---

# 13. Practice Configuration

Configuration should follow progressive disclosure.

Avoid displaying every possible setting simultaneously.

Recommended flow:

### Step 1 — What are we practicing?

Subject + topic

### Step 2 — What should I use?

Existing document / upload / general knowledge

### Step 3 — How do you want to practice?

Quick Practice / Topic Practice / Mock Test

### Step 4 — Challenge

Easy / Medium / Hard / Adaptive

### Step 5 — Start

The interface should remain visually calm throughout.

---

# 14. Difficulty

Lumo supports:

- Easy
- Medium
- Hard
- Adaptive

Adaptive should be the recommended/default option for normal practice.

Example:

```text
Challenge

Easy       Medium       Hard

             ●
          Adaptive
```

The student should understand that Adaptive means:

> Lumo changes the difficulty based on how you're performing.

---

# 15. Question Types

Lumo Assessment supports multiple answer formats.

## 15.1 MCQ

Multiple-choice questions.

Example:

```text
What happens to current when resistance increases
while voltage remains constant?

○ It increases
○ It decreases
○ It remains unchanged
○ It becomes zero
```

The interface should make the answer choices visually distinct and easy to select.

---

# 16. Short Answer

Short textual response.

Example:

```text
Why does a heavier object require more force
to produce the same acceleration?

[ Type your answer... ]
```

The student should be able to submit naturally without excessive UI.

---

# 17. Long Answer

Long-form written explanation.

The interface should provide a larger writing area.

Example:

```text
Explain Newton's three laws of motion with
suitable real-world examples.

┌─────────────────────────────────────────┐
│                                         │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘

                 [ Submit Answer ]
```

The evaluation should consider:

- conceptual correctness
- completeness
- reasoning
- relevant examples
- major misconceptions

---

# 18. Numerical Questions

Numerical questions should support mathematical notation and structured reasoning where appropriate.

Example:

```text
A force of 20 N acts on a 5 kg object.
Calculate its acceleration.

Answer:

[                  ]

Unit:
[ m/s² ▼ ]
```

For advanced numerical questions, Lumo should be capable of evaluating the student's reasoning and final answer.

---

# 19. Handwritten / Image Submission

For numerical or heavily weighted written questions, Lumo may explicitly request a handwritten solution.

Example:

```text
Solve this question on paper.

Show:
✓ Formula
✓ Working
✓ Calculation
✓ Final answer

[ Upload handwritten solution ]
```

The student captures/uploads an image.

Lumo evaluates the image using vision-capable AI.

---

# 20. Handwriting Evaluation Philosophy

The purpose is not simply to recognize the final numerical answer.

Lumo should evaluate:

- whether the correct formula was selected
- whether the correct values were substituted
- calculation steps
- units
- reasoning
- final answer
- readability where relevant

This provides students with practice for real written examinations.

A correct final answer with incorrect reasoning should not automatically be treated as fully correct.

---

# 21. Question Presentation

During normal practice, only the information necessary for the current question should dominate the screen.

Preferred hierarchy:

```text
QUESTION
    ↓
CONTEXT / DIAGRAM
    ↓
ANSWER AREA
    ↓
SUBMIT
```

Avoid:

- unnecessary sidebars
- excessive statistics
- distracting animations
- persistent analytics
- unnecessary gamification

---

# 22. Assessment Session Layout

Normal practice:

```text
┌─────────────────────────────────────────────┐
│ Physics                  4 / 10       Exit  │
├─────────────────────────────────────────────┤
│                                             │
│              QUESTION                      │
│                                             │
│        What happens when...?                │
│                                             │
│                                             │
│        ┌─────────────────────┐              │
│        │ Answer area         │              │
│        └─────────────────────┘              │
│                                             │
│                         [ Submit ]          │
│                                             │
├─────────────────────────────────────────────┤
│              Adaptive Practice              │
└─────────────────────────────────────────────┘
```

---

# 23. Mock Test Layout

Mock tests should use a more examination-oriented interface.

Possible layout:

```text
┌─────────────────────────────────────────────┐
│ Physics Mock Test          23:41 remaining  │
├───────────────────────────────┬─────────────┤
│                               │ Questions   │
│                               │             │
│          QUESTION             │ 1 ✓         │
│                               │ 2 ✓         │
│          Answer area          │ 3 ●         │
│                               │ 4 ○         │
│                               │ 5 ○         │
│                               │             │
│                               │ Review      │
├───────────────────────────────┴─────────────┤
│ Previous                  Next              │
└─────────────────────────────────────────────┘
```

The mock-test experience should intentionally feel different from conversational tutoring.

---

# 24. Assessment Feedback

After submitting an answer, Lumo should not immediately overwhelm the student with a giant explanation.

Feedback should follow a hierarchy.

### First:

```text
✓ Correct
```

or:

```text
Let's look at this one again.
```

### Then:

A concise explanation.

### Then:

Optional deeper explanation.

Example:

```text
Almost.

You correctly identified the formula,
but the substitution step has an error.

Let's check:

F = ma

20 = 5 × a

a = 4 m/s²
```

---

# 25. Constructive Correction

Never use unnecessarily harsh language.

Avoid:

```text
WRONG
INCORRECT
FAIL
```

Prefer:

```text
Not quite.

You're close.

Let's check one step.

Let's approach it differently.

Almost — there's one detail to fix.
```

The objective is to preserve student confidence while making the misconception visible.

---

# 26. Adaptive Difficulty

Normal practice should continuously evaluate performance.

Conceptually:

```text
Student answers
       ↓
Evaluation
       ↓
Performance signal
       ↓
Difficulty adjustment
       ↓
Next question
```

If the student consistently answers correctly:

> Increase difficulty.

If the student struggles:

> Reduce difficulty or provide scaffolding.

If the student repeatedly makes the same conceptual mistake:

> Detect misconception and trigger targeted clarification.

---

# 27. Misconception Detection

Misconceptions are more valuable than simply tracking wrong answers.

Example:

Student repeatedly believes:

> More resistance → more current.

Lumo should recognize the pattern.

Instead of simply serving another random question:

```text
You've made the same connection a couple of times.

Let's pause and look at how resistance
actually affects current.
```

Then Lumo can recommend:

> **Review Ohm's Law**

or optionally transition the student into the Live Theater for a targeted explanation.

---

# 28. Adaptive Clarification

When a misconception is detected, Lumo may initiate:

```text
Assessment
   ↓
Misconception detected
   ↓
Targeted explanation
   ↓
New question
   ↓
Re-evaluation
```

This preserves the core Lumo teaching loop.

Assessment therefore becomes another entry point into teaching rather than a dead-end test.

---

# 29. Optional Visual Support

Questions may include:

- diagrams
- formulas
- graphs
- maps
- scientific figures
- code
- simulations
- 3D visualizations

Visuals should only be used when they improve understanding.

Do not add visual decoration simply to make a question look impressive.

---

# 30. Subject-Aware Assessment

Question presentation should adapt to the subject.

### Physics

- equations
- force diagrams
- graphs
- numerical problems
- simulations

### Mathematics

- equations
- graphs
- geometry
- step-by-step calculations

### Biology

- labeled diagrams
- biological structures
- processes
- classification

### Chemistry

- molecular structures
- reactions
- equations
- laboratory scenarios

### History

- timelines
- maps
- source-based questions

### Geography

- maps
- graphs
- spatial data

### Programming

- code
- debugging
- output prediction
- algorithm reasoning

The underlying Assessment system remains unified while the presentation becomes subject-aware.

---

# 31. Assessment Results

Results should answer:

> **What did I learn?**

not merely:

> **What score did I get?**

Primary result information:

```text
Assessment complete

Physics — Electricity

24 / 30

80%

Strong areas
✓ Voltage
✓ Current

Needs practice
◐ Resistance
◐ Circuit combinations
```

---

# 32. Mastery Representation

Where possible, results should represent mastery rather than only percentages.

Example:

```text
Electricity

Voltage          ████████████████  Strong
Current          ██████████████░░  Strong
Resistance       ████████░░░░░░░░  Developing
Circuits         ██████░░░░░░░░░░  Needs practice
```

The exact visual treatment should remain calm and consistent with Lumo's design system.

---

# 33. Results Summary

The summary should contain:

- score
- accuracy
- questions attempted
- time used
- strong concepts
- weak concepts
- detected misconceptions
- mastery changes
- recommended next actions

Do not expose unnecessary analytics unless useful.

---

# 34. Revision Recommendations

The results page should provide actionable next steps.

Example:

```text
What should you do next?

1. Review Resistance
   ~8 min

2. Practice Ohm's Law
   ~10 min

3. Try a harder circuit problem
   ~12 min
```

Primary CTA:

> **Continue Learning**

Secondary:

> **Practice Weak Areas**

Optional:

> **Review Answers**

---

# 35. Connection to Live Theater

Assessment should integrate with Live Theater.

For example:

```text
Misconception detected:

Student struggles with
parallel circuits.

[ Ask Lumo to explain ]
```

This can open the Live Theater with a targeted teaching session.

Alternatively:

```text
Let's fix this together.

[ Start a 5-minute lesson ]
```

This creates a natural bridge:

> Assessment → Diagnosis → Teaching → Assessment

---

# 36. Assessment ↔ Lumo AI

The student may also use the Lumo AI workspace for clarification.

Example:

```text
I don't understand why my answer is wrong.

[ Ask Lumo AI ]
```

The AI workspace receives relevant assessment context:

- question
- student's answer
- expected answer
- evaluation
- misconception
- selected document
- topic

The student should not have to repeat the entire problem.

---

# 37. Assessment Context Awareness

Lumo should maintain context during the assessment.

Relevant context includes:

- current subject
- current topic
- selected document
- current question
- previous questions
- answer history
- performance
- misconceptions
- current difficulty
- session mode

This context enables adaptive behavior.

---

# 38. Session Completion

When the assessment ends:

```text
Assessment complete ✓

You practiced:
Electricity

Score:
24 / 30

Strong:
Voltage
Current

Needs work:
Resistance
Circuit combinations
```

Then:

```text
Recommended next step:

Practice Resistance

[ Start Practice ]
```

Avoid excessive celebration.

Completion should feel rewarding but mature.

---

# 39. Saving Assessment History

Assessment sessions should be persisted.

The student should be able to access:

- previous assessments
- scores
- topics
- dates
- mastery changes
- identified weak areas

However, history should remain secondary to active learning.

The dashboard may show a small recent-assessment section, but Assessment remains the primary home for detailed history.

---

# 40. Exam / CBT-Oriented Experience

The future-facing CBT experience should support:

- timer
- question navigation
- marked-for-review state
- answered/unanswered state
- section navigation
- final submission
- review screen
- automatic evaluation
- numerical responses
- written responses
- image submissions
- structured results

Potential navigation states:

```text
○ Unvisited
● Current
✓ Answered
↻ Marked for review
```

Color must never be the only indicator.

---

# 41. Mock Test Submission

Before final submission, show a review screen:

```text
Ready to submit?

30 Questions

✓ Answered: 26
○ Unanswered: 3
↻ Review marked: 1

You can return to unanswered questions.

[ Review ]
[ Submit Test ]
```

This reduces accidental submission.

---

# 42. Timer Behavior

For timed assessments:

- timer remains visible
- timer should not constantly animate
- visual urgency should increase only near the end
- accessibility should not rely solely on color
- automatic submission behavior must be clearly communicated

The timer should not become a visual distraction.

---

# 43. Error and Recovery States

Assessment must gracefully handle:

### Network failure

```text
Connection interrupted.

Your current answer has been saved locally.

[ Retry ]
```

### AI evaluation failure

```text
Lumo couldn't evaluate this answer right now.

Your response is saved.

[ Try Again ]
```

### Document retrieval failure

```text
We couldn't access the selected study material.

You can retry or continue without it.
```

### Image upload failure

```text
We couldn't process that image.

Try uploading a clearer image.
```

No failure should silently destroy student progress.

---

# 44. Loading States

Assessment loading should communicate meaningful progress.

Avoid generic:

```text
Loading...
```

Prefer:

```text
Preparing your questions...
```

or:

```text
Checking your answer...
```

or:

```text
Adapting your next question...
```

Loading states should explain what Lumo is doing when possible.

---

# 45. AI Transparency

Lumo should not pretend to be infallible.

When evaluation confidence is low:

```text
I'm not completely confident about this evaluation.

Let's review the reasoning together.
```

For image-based handwriting evaluation:

```text
I could read most of your solution,
but one step is unclear.

Please confirm this part:
...
```

This creates a more trustworthy experience.

---

# 46. Gamification Rules

Assessment should avoid excessive gamification.

Do not build the experience around:

- XP
- coins
- streak pressure
- leaderboards
- loot boxes
- constant badges
- artificial combos

Instead emphasize:

- mastery
- improvement
- confidence
- consistency
- completed concepts

Example:

```text
Resistance

Developing → Strong
```

is more aligned with Lumo than:

```text
+250 XP!
🔥 COMBO x8!
```

---

# 47. Responsive Behavior

## Desktop

Use the available space for:

- question
- answer area
- supporting visual
- optional navigation

Avoid filling every empty region.

---

## Tablet

Prioritize:

1. question
2. answer
3. navigation
4. supporting context

Secondary information may collapse.

---

## Mobile

Assessment should become a focused single-column experience.

```text
Topic
Question
Answer
Submit
```

Navigation can become a compact drawer or bottom control.

---

# 48. Mobile Mock Test

For mobile mock tests:

- timer remains visible
- question navigation becomes a drawer
- answer area receives maximum width
- review state remains accessible
- submission controls remain reachable

Do not attempt to reproduce the desktop layout literally.

---

# 49. Accessibility

Assessment must support:

- keyboard navigation
- visible focus states
- readable contrast
- accessible labels
- screen-reader-friendly controls
- non-color answer states
- sufficiently large touch targets
- reduced-motion preferences

Correct/incorrect states should use both:

- visual state
- icon/text
- color where appropriate

---

# 50. Assessment Motion

Motion should communicate state rather than decorate.

Good:

- question transition
- answer selection
- progress update
- result reveal
- misconception highlight
- mastery change

Avoid:

- constant bouncing
- excessive celebration
- distracting transitions
- unnecessary 3D effects

---

# 51. Assessment Visual Hierarchy

The most important element is always:

> **The current question.**

Hierarchy:

```text
1. Question
2. Supporting visual/context
3. Answer interaction
4. Submit/navigation
5. Progress
6. Secondary information
```

Nothing should compete with the question.

---

# 52. Demo-First Assessment Scenarios

For the hackathon demonstration, the Assessment experience should have several polished scenarios.

## Scenario A — Physics Numerical

```text
Physics
↓
Electricity
↓
Numerical
↓
Handwritten solution
↓
Image evaluation
↓
Detailed feedback
```

---

## Scenario B — Biology

```text
Biology
↓
Cell Structure
↓
MCQ
↓
Incorrect answer
↓
Misconception detected
↓
Recommended visual lesson
```

---

## Scenario C — Chemistry

```text
Chemistry
↓
Chemical Reactions
↓
Short answer
↓
AI evaluation
↓
Constructive correction
```

---

## Scenario D — Programming

```text
Programming
↓
Python
↓
Debugging question
↓
Student submits code
↓
Evaluation
↓
Explanation
```

---

## Scenario E — Board/CBT

```text
Class 10 Physics
↓
Board-style mock test
↓
Timer
↓
MCQ + numerical + written
↓
Review
↓
Submit
↓
Detailed results
```

These scenarios should demonstrate that the Assessment engine is subject-aware rather than a generic quiz generator.

---

# 53. Target Demo Priority

The hackathon does NOT require the entire assessment universe to be implemented immediately.

Priority should be:

### Tier 1 — Must look excellent

- one polished Physics numerical
- one handwritten/image evaluation flow
- one Biology misconception/adaptive flow
- one standard MCQ flow
- results + recommendations

### Tier 2

- Chemistry
- Mathematics
- Programming
- additional question formats

### Tier 3

- complete CBT simulation
- advanced examination configuration
- extensive assessment history
- deeper analytics

The architecture should support expansion without requiring the complete system during the first demo.

---

# 54. Relationship With the Rest of Lumo

Assessment is one of three primary learning experiences:

```text
                 LUMO

        ┌─────────┼─────────┐
        │         │         │
      Theater   Assessment  Lumo AI
        │         │         │
      Learn     Practice    Ask
        │         │         │
        └─────────┼─────────┘
                  │
               Memory
                  │
               Mastery
```

All three should share:

- student context
- document context
- subject/topic context
- learning memory
- mastery information

The experiences should feel like parts of one product rather than disconnected applications.

---

# 55. Core Assessment Loop

The canonical Lumo Assessment loop is:

```text
SELECT
  ↓
PRACTICE
  ↓
ANSWER
  ↓
EVALUATE
  ↓
DIAGNOSE
  ↓
ADAPT
  ↓
FEEDBACK
  ↓
REVISE
  ↓
REASSESS
  ↓
MASTER
```

This loop is more important than any individual UI component.

---

# 56. Design Rules

### DO

- make questions the visual focus
- provide immediate and constructive feedback
- adapt difficulty
- detect misconceptions
- support documents
- support handwritten answers
- connect assessment to teaching
- provide actionable revision
- support exam-style experiences
- maintain calm visual hierarchy

### DON'T

- make every assessment feel like an exam
- overload configuration screens
- use excessive gamification
- bury the question under analytics
- punish incorrect answers visually
- require unnecessary navigation
- force document re-uploading
- show technical AI/RAG internals
- overwhelm students with statistics

---

# 57. Definition of Success

The Assessment experience is successful when a student can naturally go from:

> "I want to practice this."

to:

> "I understand what I know."

and finally:

> "I know exactly what I should learn next."

The experience should demonstrate that Lumo does not merely **generate questions**.

It:

> **teaches → tests → understands → adapts → teaches again.**

That adaptive loop is the defining characteristic of Lumo's assessment experience.

```

```
````
