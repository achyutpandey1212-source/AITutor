# LUMO DASHBOARD

## Learning Home Specification

**Product:** Lumo  
**Document:** Dashboard UX Specification  
**Stage:** 3 — Page & Experience Design  
**Status:** Design Specification  
**Primary Goal:** Provide a calm, lightweight learning home that helps students decide what to do next without competing with the Learning Theater.

---

# 1. Purpose

The Lumo Dashboard is the student's **Learning Home**.

It is not an analytics dashboard.

It is not a control center.

It is not intended to expose every feature of the product.

Its primary purpose is to answer three questions immediately:

1. **What was I learning?**
2. **What should I do next?**
3. **How can I start learning right now?**

The Dashboard should therefore remain intentionally lightweight.

The **Learning Theater is the flagship experience** of Lumo and receives significantly more visual and interaction complexity.

The Dashboard exists primarily to guide the student toward that experience.

---

# 2. Core Philosophy

The Dashboard should feel like:

> **A personal learning desk.**

Not:

> **A productivity analytics dashboard.**

The interface should prioritize:

- clarity
- continuation
- discovery
- progress
- action

while minimizing:

- unnecessary metrics
- excessive cards
- dense charts
- gamification
- configuration
- visual noise

---

# 3. Dashboard Hierarchy

The recommended hierarchy is:

```text
LUMO

Learning Home
│
├── Continue Learning
│
├── Quick Actions
│
├── Recent Documents
│
├── Recommended Learning
│
└── Lightweight Progress / Mastery
```

````

The order may adapt slightly depending on whether the student has existing learning history.

For returning students:

```text
Continue Learning
        ↓
Quick Actions
        ↓
Progress
        ↓
Recommendations
        ↓
Recent Documents
```

For new students:

```text
Welcome / Start Learning
        ↓
Quick Actions
        ↓
Upload / Select Document
        ↓
Recommended Learning
```

---

# 4. Primary Dashboard Objective

The Dashboard should encourage the student to begin a meaningful learning action within seconds.

The primary CTA should therefore generally be:

> **Continue Learning**

or, for a new student:

> **Start Learning**

Secondary actions may include:

- Ask Lumo
- Start Assessment
- Upload Document

The interface should never present a wall of equal-priority actions.

---

# 5. Header

The Dashboard header should remain simple.

Recommended structure:

```text
┌─────────────────────────────────────────────────────┐
│ Lumo        Learn        Assessments       [Profile]│
└─────────────────────────────────────────────────────┘
```

Depending on the final navigation system, the header may additionally contain:

- theme control
- notifications
- profile menu

These should remain secondary.

The header should not consume excessive vertical space.

---

# 6. Dashboard Greeting

A short personalized greeting may appear near the top.

Example:

```text
Good morning.

What would you like to learn today?
```

For returning users:

```text
Welcome back.

Ready to continue where you left off?
```

Avoid exaggerated motivational language.

Do not use:

```text
🔥 LET'S CRUSH YOUR GOALS!
🚀 YOU'RE ON FIRE!
🏆 CHAMPION!
```

Lumo's personality is intelligent, calm and encouraging.

---

# 7. Continue Learning

## Priority

This is the most important Dashboard component for returning users.

It should provide a single obvious path back into an unfinished or recently active learning experience.

Example:

```text
Continue learning

┌──────────────────────────────────────────────┐
│                                              │
│  Physics                                     │
│  Newton's Laws                                │
│                                              │
│  Continue from: Force and Acceleration       │
│                                              │
│  ███████████████░░░░                         │
│  72%                                          │
│                                              │
│                         Continue →            │
└──────────────────────────────────────────────┘
```

The component should communicate:

- subject
- topic
- current concept
- approximate progress
- continuation action

---

# 8. Continue Learning Behavior

Clicking **Continue** should take the student directly into the appropriate experience.

Examples:

```text
Incomplete lesson
        ↓
Learning Theater
```

```text
Incomplete assessment
        ↓
Assessment
```

The student should not have to navigate through multiple intermediate pages.

---

# 9. Quick Actions

Quick actions provide immediate access to Lumo's core workflows.

Recommended actions:

```text
[ Start Learning ]

[ Ask Lumo ]

[ Take an Assessment ]

[ Upload a Document ]
```

However, these should not necessarily appear as four visually equal giant cards.

Prefer a hierarchy such as:

```text
What do you want to do?

[ Start Learning ]

Ask Lumo     Take an Assessment     Upload Document
```

The main learning action should remain visually dominant.

---

# 10. Document / RAG Entry Point

Documents are an important part of Lumo because they can provide context for personalized learning.

However, document upload should **not require a dedicated Dashboard page**.

The Dashboard may expose:

> **Upload a document**

as a quick action.

After selecting a document, the student should be able to:

```text
Upload / Select Document
        ↓
Choose Topic
        ↓
Choose Learning Mode
        ↓
Start Learning
```

The same document workflow should also be available directly inside:

- Learning Theater setup
- Assessment setup

The student should not be forced to return to the Dashboard to use RAG.

---

# 11. Recent Documents

Show recently uploaded or used learning documents.

Example:

```text
Recent documents

Physics — NCERT Class 10
Used 2 days ago

Biology — Human Cell
Used 5 days ago

JavaScript Notes
Used 1 week ago
```

Each document may expose actions such as:

```text
Open
Start Learning
Practice
```

Keep this section compact.

---

# 12. Document Selection Philosophy

A student may have uploaded a document previously.

Lumo should therefore support:

```text
Upload new document
        OR
Select existing document
```

This selection pattern should be consistent throughout the product.

For example:

```text
Choose your source

[ + Upload new document ]

Existing documents
────────────────────

Physics Notes
Biology Textbook
JavaScript Notes
```

The student should never be forced to upload the same document again.

---

# 13. Recommended Learning

Recommendations should answer:

> **What would be useful for me to learn next?**

They should not look like an advertisement feed.

Example:

```text
Recommended for you

┌───────────────┐
│ Resistance    │
│ Physics       │
│ ~12 min       │
└───────────────┘

┌───────────────┐
│ Cell Division │
│ Biology       │
│ ~15 min       │
└───────────────┘

┌───────────────┐
│ Arrays        │
│ Programming   │
│ ~10 min       │
└───────────────┘
```

Recommendations may be based on:

- recently studied concepts
- incomplete lessons
- assessment performance
- identified misconceptions
- uploaded documents
- subject interests
- learning history

The AI should eventually be able to explain why something is recommended.

Example:

> **Recommended because you struggled with resistance in your last session.**

This makes adaptation visible.

---

# 14. Recommendation Priority

Recommendations should prioritize **learning value** over engagement metrics.

Do not optimize recommendations primarily for:

- session length
- number of clicks
- streaks
- arbitrary XP
- addictive behavior

The product exists to improve learning.

---

# 15. Mastery / Progress

Progress should remain lightweight.

The Dashboard does not need a giant analytics system.

Instead, show a compact representation of learning mastery.

Example:

```text
Your progress

Physics
██████████████░░  78%

Mathematics
███████████░░░░░  64%

Biology
████████████░░░░  71%
```

Or:

```text
Concepts strengthened this week

Physics       8
Mathematics   5
Biology       6
```

The exact metric should depend on what the backend reliably supports.

Do not fabricate precision.

---

# 16. Mastery Philosophy

Progress should communicate:

> **What I understand**

rather than:

> **How much time I spent inside the app**

Prefer:

```text
Voltage        ✓ Strong
Current        ✓ Strong
Resistance     ◐ Developing
Circuits       ○ Not started
```

over:

```text
Total Study Time
14h 37m
```

Time can be shown as secondary information but should not define progress.

---

# 17. Adaptive Progress

Where supported by the learning engine, the Dashboard should surface meaningful adaptation.

Example:

```text
Suggested focus

Resistance

Lumo noticed this concept needs a little more practice.
```

CTA:

```text
Practice Resistance →
```

This demonstrates one of Lumo's most important capabilities:

> The system observes learning and adapts what comes next.

---

# 18. Empty State — New Student

A new student should not see a dashboard full of empty charts.

Instead:

```text
Welcome to Lumo.

What would you like to learn?

[ Start Learning ]

You can also upload a textbook,
notes or study material and learn from it.
```

Optional secondary actions:

```text
Upload document
Take an assessment
Ask Lumo
```

The empty state should feel inviting rather than incomplete.

---

# 19. Empty State — No Documents

Example:

```text
Your learning library is empty.

Upload a textbook, notes or study material
to let Lumo teach from your own material.

[ Upload Document ]
```

Do not display:

```text
0 Documents
0 Sessions
0 Hours
0 Topics
```

Empty analytics create unnecessary pressure.

---

# 20. Empty State — No Recommendations

If insufficient learning history exists:

```text
Your recommendations will appear here
as Lumo learns how you learn.
```

Do not invent recommendations without meaningful context.

---

# 21. Dashboard Card Philosophy

Cards should be used only when they improve organization.

Every card should have a clear purpose.

Avoid:

```text
Card
Card
Card
Card
Card
Card
```

Instead create a visual hierarchy:

```text
                Continue Learning
               ┌─────────────────┐
               │                 │
               │      HERO       │
               │                 │
               └─────────────────┘

        Quick actions

     [ Learn ] [ Ask ] [ Assess ]

        Your progress

        ────────────────

        Recommended
```

The Dashboard should breathe.

---

# 22. Negative Space

Negative space is an important part of Lumo's premium identity.

Do not attempt to fill every empty area.

Whitespace should separate:

- different learning contexts
- primary and secondary actions
- information groups
- sections

The Dashboard should feel comfortable rather than compressed.

---

# 23. Light Theme

The light theme should follow Lumo's established **fruity** visual direction.

Characteristics:

- warm/light background
- colorful but controlled accents
- soft surfaces
- subtle borders
- friendly visual details
- generous whitespace
- expressive but restrained color usage

The light theme should feel:

> fresh, optimistic and approachable.

It should not become childish.

---

# 24. Dark Theme

The dark theme should preserve the same information architecture.

It should feel:

> focused, immersive and premium.

The logo may switch to white for contrast.

Accent colors should remain recognizable while being adjusted for sufficient contrast.

The dark Dashboard should not simply be the light Dashboard with inverted colors.

Surfaces, borders and elevation should be intentionally adapted.

---

# 25. Dashboard Motion

Motion should be subtle.

Recommended:

- page entrance fade/slide
- card hover elevation
- progress bar animation
- soft CTA transitions
- document selection feedback
- recommendation appearance

Avoid:

- excessive floating animations
- continuous background motion
- bouncing cards
- distracting decorative particles

Motion should communicate:

> state change

rather than:

> decoration.

---

# 26. Responsive Behavior

The Dashboard must work across:

- desktop
- laptop
- tablet
- mobile

The information hierarchy should remain consistent.

---

## Desktop

Recommended layout:

```text
┌──────────────────────────────────────────────┐
│ Header                                       │
├──────────────────────────────────────────────┤
│ Greeting                                     │
│                                              │
│ Continue Learning                            │
│ ┌──────────────────────────────┐             │
│ │                              │             │
│ │                              │             │
│ └──────────────────────────────┘             │
│                                              │
│ Quick Actions                                │
│                                              │
│ Progress              Recommendations        │
│                                              │
│ Recent Documents                             │
└──────────────────────────────────────────────┘
```

Use multiple columns only where they improve scanning.

---

## Tablet

Reduce simultaneous columns.

Example:

```text
Continue Learning

Quick Actions

Progress

Recommendations

Recent Documents
```

Two-column layouts may still be used for secondary sections.

---

## Mobile

Use a single-column hierarchy.

Recommended order:

```text
Header

Greeting

Continue Learning

Quick Actions

Progress

Recommendations

Recent Documents
```

Avoid squeezing desktop cards into mobile widths.

---

# 27. Mobile Navigation

On mobile, primary navigation may become:

```text
Home
Learn
Assess
Lumo
Profile
```

The exact labels should remain consistent with the final product architecture.

The Learning Theater should remain easily reachable.

---

# 28. Accessibility

Dashboard interactions must not rely solely on color.

Examples:

Correct:

```text
✓ Strong
```

instead of:

```text
green bar only
```

Important states should use:

- icons
- text
- labels
- contrast
- accessible focus states

Interactive elements must have clear keyboard focus.

Touch targets should be sufficiently large on mobile.

---

# 29. Dashboard vs Learning Theater

The distinction is critical.

## Dashboard

Purpose:

> Decide what to learn.

Characteristics:

- lightweight
- calm
- informational
- navigational
- minimal interaction

## Learning Theater

Purpose:

> Actually learn.

Characteristics:

- immersive
- interactive
- cinematic
- adaptive
- visually rich
- voice-driven
- simulation-capable

The Dashboard should never compete with the Theater.

---

# 30. Dashboard vs Assessment

Assessment is a dedicated experience.

The Dashboard may provide:

> **Start an Assessment**

but should not attempt to embed the entire assessment workflow.

Assessment configuration belongs inside the Assessment experience.

---

# 31. Dashboard vs Lumo AI

The Dashboard may provide:

> **Ask Lumo**

but the conversational interface belongs to the dedicated Lumo AI experience.

The Dashboard should not become a giant chat interface.

---

# 32. Recommended Final Dashboard Structure

The default returning-user Dashboard should approximately follow:

```text
┌─────────────────────────────────────────────────────┐
│ Lumo              Learn    Assess    [Profile]      │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Good morning.                                       │
│ What would you like to learn today?                 │
│                                                     │
│ Continue learning                                   │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Physics                                         │ │
│ │ Newton's Laws                                   │ │
│ │ Force and Acceleration                          │ │
│ │                                                 │ │
│ │ ███████████████░░░ 72%                          │ │
│ │                            Continue →           │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Quick actions                                       │
│                                                     │
│ [ Start Learning ]                                  │
│                                                     │
│ [ Ask Lumo ] [ Assessment ] [ Upload Document ]     │
│                                                     │
│ Your progress                                       │
│                                                     │
│ Physics       █████████████░░ 78%                   │
│ Biology       ███████████░░░░ 71%                   │
│ Programming   ██████████████ 91%                   │
│                                                     │
│ Recommended for you                                │
│                                                     │
│ [ Resistance ] [ Cell Division ] [ Arrays ]        │
│                                                     │
│ Recent documents                                    │
│                                                     │
│ Physics Notes       Biology Textbook                │
│ JavaScript Notes                                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

This is a **reference structure**, not a rigid pixel-perfect layout.

---

# 33. What the Dashboard Must NOT Become

Do not turn the Dashboard into:

### A statistics dashboard

Avoid:

```text
Sessions: 42
Hours: 127
Accuracy: 82.7%
XP: 14,920
Rank: #428
```

### A gamification dashboard

Avoid:

```text
🔥 27 DAY STREAK
💎 8,420 XP
🏆 LEVEL 17
```

### A content marketplace

Avoid excessive:

```text
Recommended
Trending
Popular
Most Viewed
Featured
Sponsored
```

### A ChatGPT clone

Avoid making the Dashboard primarily a chat window.

### A control panel

Avoid exposing advanced AI configuration on the Dashboard.

---

# 34. Design Priority

When implementing the Dashboard, prioritize in this order:

```text
1. Continue Learning
2. Start Learning
3. Clear navigation
4. Document access
5. Lightweight progress
6. Useful recommendations
7. Secondary actions
8. Decorative elements
```

Decorative elements should always come last.

---

# 35. Relationship to Lumo's Core Learning Loop

The Dashboard represents the beginning and end of the learning loop.

```text
Dashboard
    ↓
Choose learning goal
    ↓
Learning Theater
    ↓
Explanation
    ↓
Interaction
    ↓
Assessment
    ↓
Feedback
    ↓
Mastery
    ↓
Dashboard
    ↓
Next recommended action
```

The Dashboard should therefore make the next step obvious.

---

# 36. Final Design Principle

The Dashboard should make the student think:

> **"I know exactly what I can do next."**

Not:

> **"Wow, there are so many things on this screen."**

Lumo's intelligence should reduce complexity rather than expose it.

The Dashboard is the **calm front door** to Lumo.

The Learning Theater is the **main experience**.

The Dashboard should guide students toward it, then get out of the way.

```

```
````
