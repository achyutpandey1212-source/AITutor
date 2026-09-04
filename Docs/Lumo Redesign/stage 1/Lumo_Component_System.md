# LUMO COMPONENT SYSTEM

> Component-level UI rules for Lumo.
>
> This document defines how reusable interface components should look, behave, animate, and communicate state across the entire product.
>
> **Design principle:** Lumo should feel like a premium learning environment, not a generic SaaS dashboard, chatbot, or children's game.

---

# 1. COMPONENT PHILOSOPHY

Lumo's components should follow five principles:

1. **Clarity over decoration**
2. **Soft and friendly, not childish**
3. **Premium and expressive, not corporate**
4. **Motion with purpose, not motion for its own sake**
5. **Consistent behavior across light and dark themes**

Components should support the learning experience rather than compete with it.

The primary focus of any learning screen should remain:

**Content → Explanation → Interaction → Feedback**

Not:

**UI → UI → UI → UI**

---

# 2. GLOBAL COMPONENT RULES

## 2.1 Visual language

Components should generally use:

- Soft rounded corners
- Clean typography
- Generous internal spacing
- Subtle borders
- Very restrained shadows
- Minimal gradients
- Purposeful micro-interactions
- Strong visual hierarchy

Avoid:

- Excessive glassmorphism
- Excessive blur
- Huge shadows
- Excessive gradients
- Excessive pills
- Overly rounded "bubble" interfaces
- Constant bouncing elements
- Decorative UI with no functional purpose

---

## 2.2 Theme behavior

Lumo supports two first-class themes:

- Light
- Dark

The component structure must remain identical between themes.

Only the visual treatment changes.

### Light theme

The light theme is intentionally **fruity, warm, fresh and expressive**.

Primary characteristics:

- Warm ivory background
- White surfaces
- Orange/coral primary actions
- Green/teal secondary accents
- Yellow/amber highlights
- Soft blue where useful
- Gentle pastel decorative elements

### Dark theme

The dark theme should feel:

- Cinematic
- Premium
- Calm
- Immersive
- High contrast

The dark theme should not become a generic "AI neon" interface.

Avoid excessive:

- Neon purple
- Indigo gradients
- Cyan glow
- Cyberpunk effects

---

# 3. BUTTONS

Buttons are among the most important interactive components in Lumo.

They should feel confident, friendly and tactile.

---

## 3.1 Primary button

Used for the most important action on a page.

Examples:

- Start Learning
- Continue Lesson
- Start Practice
- Generate Lesson
- Begin Assessment
- Get Started

### Appearance

Light theme:

- Coral/orange background
- White text
- Subtle shadow or depth
- Medium rounded corners

Dark theme:

- Same orange/coral identity
- High contrast against dark surfaces

### Shape

Recommended radius:

`12px`

### Height

Standard:

`44–48px`

Large CTA:

`52–56px`

### Typography

- Medium/Semibold
- 15–16px
- Strong readability

### Interaction

Hover:

- Slight brightness increase
- Very small upward movement
- Subtle shadow increase

Active:

- Slight scale reduction
- Shadow reduction

Do not use exaggerated button animations.

---

## 3.2 Secondary button

Used for important but non-primary actions.

Examples:

- Watch Demo
- Explore
- Learn More
- View Progress

Appearance:

- Transparent or surface background
- Visible border
- Strong text

Light:

`white + neutral border`

Dark:

`dark surface + subtle light border`

---

## 3.3 Ghost button

Used for low-emphasis actions.

Examples:

- Skip
- Cancel
- Back
- Close

No heavy border or background.

Hover should provide a subtle surface highlight.

---

## 3.4 Icon button

Used for compact actions.

Examples:

- Microphone
- Send
- Settings
- More
- Play/Pause
- Close

Recommended sizes:

- `36px`
- `40px`
- `44px`
- `48px`

For important actions such as voice interaction, prefer `44–48px`.

---

## 3.5 Destructive button

Used only for genuinely destructive actions.

Examples:

- Delete
- Remove
- End Session

Use soft coral/red rather than aggressive pure red.

Destructive actions should never visually compete with the primary learning action.

---

## 3.6 Button states

Every button should support:

- Default
- Hover
- Active
- Focus
- Disabled
- Loading

Loading state should replace the action icon/text appropriately rather than allowing the user to repeatedly click the button.

---

# 4. INPUTS

Inputs should feel like an invitation to interact, not a form field from an enterprise application.

---

## 4.1 Standard input

Recommended height:

`44–48px`

Radius:

`10–12px`

Padding:

`12–16px`

Use:

- Clear label
- Helpful placeholder
- Strong focus state

---

## 4.2 Focus state

When focused:

- Border becomes primary brand color
- Subtle outer focus ring
- No excessive glow

Focus should be immediately obvious.

---

## 4.3 Search input

Search should feel lightweight.

Example:

`Search subjects, lessons, topics...`

Include a search icon where useful.

Do not make search fields unnecessarily tall.

---

## 4.4 AI prompt input

The AI tutor input is a special component.

Example:

`Ask your tutor anything...`

It may contain:

- Text input
- Microphone button
- Send button
- Voice activity indicator
- Attachment button where supported

The input should visually communicate:

> "You can talk to Lumo."

rather than:

> "Send a chat message."

---

## 4.5 Textarea

Use for:

- Questions
- Explanations
- Notes
- AI prompts

Allow natural expansion where appropriate.

Avoid giant fixed textareas.

---

# 5. CARDS

Cards should organize information without making the entire application look like a collection of floating boxes.

This is extremely important.

## Card philosophy

Use a card when it provides meaningful grouping.

Do not put every element inside a card.

---

## 5.1 Standard card

Characteristics:

- White/surface background
- Subtle border
- `12–16px` radius
- Moderate internal padding

Light theme:

- White surface
- Very subtle neutral border

Dark theme:

- Dark elevated surface
- Very subtle border

---

## 5.2 Learning card

Used for:

- Lessons
- Topics
- Recommended learning
- Practice sessions

Should communicate:

- Subject
- Topic
- Estimated time
- Progress
- Action

Example:

```text
Physics

Newton's Laws

████████████░░ 78%

12 min

Continue →
```

````

---

## 5.3 Feature card

Used on marketing pages.

Should visually communicate one product capability.

Examples:

- Human-like tutor
- Interactive visuals
- Adaptive learning
- Voice learning

Feature cards should not become overly decorative.

---

## 5.4 Interactive card

Interactive cards should clearly feel clickable.

Use:

- Hover elevation
- Small translation
- Border emphasis
- Cursor indication

Do not make an entire card clickable if only one small action is intended.

---

## 5.5 Cinematic lesson card

Used for AI-generated lesson previews.

This is allowed to be more visually expressive.

Possible elements:

- Visual lesson preview
- AI tutor
- Subject badge
- Duration
- Play button

This is one of the places where Lumo can use richer visuals.

---

# 6. NAVIGATION

Navigation should feel invisible when the student is learning.

The student should always know:

- Where they are
- What they can do next
- How to go back

---

# 6.1 Marketing navigation

Desktop structure:

```text
LUMO

Features
How It Works
Subjects
Pricing
For Schools

Log in
Get Started Free
```

The primary CTA should remain visually dominant.

Avoid excessive navigation items.

---

# 6.2 App navigation

The authenticated product can use:

```text
Home
Learn
Practice
Progress
Tutor
```

Additional items such as Settings and Profile should remain secondary.

---

# 6.3 Sidebar

Desktop sidebar should be:

- Calm
- Compact
- Spacious
- Easy to scan

Active item should use the primary brand treatment.

Do not use excessive colored backgrounds for every navigation item.

---

# 6.4 Mobile navigation

Use a bottom navigation bar for the most important destinations.

Recommended:

```text
Home
Learn
Tutor
Practice
Progress
```

Keep the number of primary navigation items limited.

---

# 6.5 Breadcrumbs

Breadcrumbs should be used where useful in lessons.

Example:

```text
Physics
›
Newton's Laws
›
Lesson 3
```

They should remain visually secondary.

---

# 7. TABS

Tabs should help users switch between related views.

They should not be used as a replacement for navigation.

---

## 7.1 Standard tabs

Example:

```text
Overview   Lessons   Practice   Progress
```

Active tab:

- Primary text
- Small underline or subtle active background

Inactive tabs:

- Secondary text

---

## 7.2 Segmented control

Use for closely related options.

Examples:

```text
Today | This Week | This Month
```

or:

```text
Easy | Medium | Hard
```

Do not use segmented controls for unrelated destinations.

---

## 7.3 Tutor tabs

Potential tutor-specific views:

```text
Lesson
Visuals
Notes
Transcript
```

The lesson itself should remain the dominant experience.

---

# 8. MODALS

Modals should be used sparingly.

Learning should not constantly be interrupted by popup interfaces.

Use modals for:

- Confirmation
- Important settings
- Upload workflows
- Destructive actions
- Focused configuration

Avoid modals for information that could naturally exist inline.

---

## 8.1 Modal structure

```text
┌──────────────────────────────┐
│ Title                    ×   │
│                              │
│ Supporting explanation       │
│                              │
│ Content                      │
│                              │
│ Cancel       Primary Action  │
└──────────────────────────────┘
```

---

## 8.2 Modal styling

Recommended radius:

`16–20px`

Backdrop:

- Dark translucent overlay

Light theme:

- White surface

Dark theme:

- Deep elevated surface

Animation:

- Fade + slight scale
- Approximately `180–250ms`

Avoid dramatic modal entrances.

---

# 9. DROPDOWNS

Dropdowns should remain simple and predictable.

Use for:

- Subject selection
- Difficulty
- Voice selection
- Language
- Preferences

---

## 9.1 Dropdown appearance

Trigger:

- Input-like surface
- Label/value
- Chevron

Menu:

- Elevated surface
- Rounded corners
- Clear separation between options

---

## 9.2 Selected state

Selected option should be obvious through:

- Checkmark
- Background treatment
- Primary text

Do not rely only on color.

---

## 9.3 Long lists

For large lists:

- Search
- Grouping
- Keyboard navigation

should be considered.

---

# 10. PROGRESS

Progress is a core part of Lumo because the product should communicate mastery rather than simply completion.

---

## 10.1 Progress bar

Use for:

- Lesson progress
- Topic mastery
- Assessment progress

Recommended height:

`6–8px`

Use rounded ends.

Avoid extremely thick progress bars.

---

## 10.2 Mastery indicator

Prefer:

```text
Electricity

██████████████░░

82% mastered
```

over:

```text
82% complete
```

Where appropriate, the product should emphasize:

**what the student understands**

rather than merely:

**what the student has opened.**

---

## 10.3 Lesson progress

Example:

```text
Introduction
●

Force
●

Mass
●

Acceleration
○

Quiz
○
```

The current step should be clearly emphasized.

---

## 10.4 Circular progress

Use sparingly.

Good for:

- Assessment score
- Overall mastery
- Completion summary

Do not fill the dashboard with circular charts.

---

# 11. TOASTS

Toasts should provide lightweight feedback without interrupting the student.

Use for:

- Saved successfully
- Lesson generated
- Settings updated
- File uploaded
- Error notifications

---

## 11.1 Success toast

Example:

```text
✓ Lesson saved
```

---

## 11.2 Informational toast

Example:

```text
Tutor adjusted your practice session.
```

---

## 11.3 Error toast

Example:

```text
Something went wrong.
Please try again.
```

Avoid technical error messages unless the user needs them.

---

## 11.4 Toast behavior

- Appear smoothly
- Remain visible long enough to read
- Auto-dismiss when appropriate
- Allow manual dismissal

Do not make toasts visually aggressive.

---

# 12. AI STATES

AI states are a major part of Lumo's identity.

The interface should make the AI feel present without pretending to be human.

---

# 12.1 AI idle

The tutor is available.

Possible visual:

```text
● Tutor ready
```

Use a subtle breathing/pulse animation.

---

# 12.2 AI listening

When the student speaks:

```text
Listening...
```

Visual indicators:

- Animated waveform
- Subtle pulse
- Microphone state

The animation should respond to actual audio activity when technically possible.

---

# 12.3 AI thinking

Avoid generic:

```text
Loading...
```

Prefer:

```text
Tutor is thinking...
```

or context-specific language:

```text
Let me work that out...
```

The visual state should communicate activity without pretending the AI has emotions it does not need to claim.

---

# 12.4 AI speaking

When the tutor speaks:

- Avatar/character should animate
- Voice activity should be visible
- Waveform or speaking indicator can react to audio
- Relevant lesson visual can animate simultaneously

This is especially important inside the Learning Theater.

---

# 12.5 AI explaining

The lesson visual becomes the primary stage.

The AI tutor becomes the guide.

Example:

```text
             F = ma

        ● ───────────→ F

       Object

             [AI Tutor]
```

The tutor should not cover the educational content.

---

# 12.6 AI asking

When the tutor asks a question:

```text
Tutor asks

Why does a heavier object
need more force to accelerate?
```

The interface should create a clear transition from:

**passive explanation**

to:

**active thinking.**

---

# 12.7 AI evaluating

After the student answers:

```text
Let's see what you understood...
```

Then evaluate.

Avoid instantly showing:

```text
WRONG ❌
```

unless the context specifically requires it.

---

# 12.8 AI correcting

Preferred language:

```text
Almost.

You identified the force correctly,
but let's reconsider what happens
when mass increases.
```

The UI should highlight the relevant concept.

---

# 12.9 AI adapting

This should be one of Lumo's signature states.

Example:

```text
Tutor noticed you're struggling
with resistance.

I've adjusted the next part
of your lesson to strengthen it.
```

Then the learning path changes.

This visually demonstrates adaptive intelligence.

---

# 12.10 AI success

Use restrained positive feedback.

Examples:

```text
✓ You've got it.
```

```text
Nice — you understood the relationship.
```

Avoid:

- Confetti everywhere
- Huge XP animations
- Excessive badges
- Loud gamification

---

# 13. LOADING STATES

Loading should always communicate what is happening when possible.

Avoid generic spinners everywhere.

---

## 13.1 Skeleton loading

Use skeletons for:

- Dashboard cards
- Lesson lists
- Progress sections
- Profile information

Skeletons should roughly match the final content structure.

---

## 13.2 Content generation

When generating a lesson:

```text
Building your lesson...

Understanding the topic
●

Planning the explanation
●

Creating visuals
○

Preparing your tutor
○
```

Where technically appropriate, stages can reflect actual backend progress.

Do not fake detailed progress if the system does not actually perform those stages.

---

## 13.3 Voice generation

Example:

```text
Preparing your tutor's voice...
```

Show a subtle waveform or pulse.

---

## 13.4 Video generation

Example:

```text
Creating your visual lesson...
```

Possible stages:

```text
Planning visuals
✓

Generating lesson scenes
●

Rendering
○
```

Again, these should correspond to real processing where possible.

---

# 14. EMPTY STATES

Empty states should guide the student toward an action.

Never simply show:

```text
No data.
```

---

## Example

```text
Your learning journey starts here.

Choose a topic, upload a resource,
or ask your tutor what you'd like to learn.

[Start Learning]
```

---

# 15. ERROR STATES

Errors should be calm and constructive.

Instead of:

```text
ERROR 500
```

Prefer:

```text
We couldn't load your lesson.

Let's try that again.

[Retry]
```

Technical information can be available through a secondary option if necessary.

---

# 16. TOOLTIPS

Use tooltips only when an icon or interaction genuinely needs explanation.

Avoid explaining obvious buttons.

Example:

- Microphone → "Talk to your tutor"
- Regenerate → "Generate another explanation"
- Bookmark → "Save for later"

Tooltips should be short.

---

# 17. BADGES

Badges should provide contextual information.

Good examples:

```text
Physics
12 min
Beginner
Recommended
```

Avoid turning every piece of metadata into a colorful pill.

Use badges sparingly.

---

# 18. AVATAR / AI TUTOR COMPONENT

The AI tutor is a major product element.

However:

> **The tutor should support the lesson, not become the lesson.**

---

## 18.1 Visual hierarchy

Inside the Learning Theater:

```text
1. Educational visual
2. Spoken explanation
3. Tutor/avatar
4. Supporting controls
```

The avatar should never obscure the main visual.

---

## 18.2 Avatar states

The avatar should eventually support:

- Idle
- Listening
- Thinking
- Speaking
- Explaining
- Asking
- Encouraging
- Correcting

Where technically possible:

- Lip synchronization
- Facial expressions
- Head movement
- Eye movement
- Gesture animation

These belong to the future AI Tutor visual system and should be implemented independently from the general UI component system.

---

# 19. VOICE CONTROL COMPONENT

Voice is a core interaction mode.

The voice interface should feel premium and simple.

Possible states:

```text
Tap to speak
      ↓
Listening
      ↓
Processing
      ↓
Tutor speaking
```

The user should always know which state is active.

---

## Voice controls

Potential controls:

- Start/stop speaking
- Mute
- Voice selection
- Playback speed
- Replay
- Interrupt
- Volume

Advanced controls should remain hidden until needed.

---

# 20. LEARNING THEATER CONTROLS

The Learning Theater is Lumo's flagship learning experience.

Recommended structure:

```text
┌──────────────────────────────────────────────┐
│ ← Physics       Newton's Laws       12 min  │
├──────────────────────────────────────────────┤
│                                              │
│                                              │
│              LESSON VISUAL                   │
│                                              │
│        diagrams / animation / formula        │
│                                              │
│                         AI TUTOR              │
│                                              │
├──────────────────────────────────────────────┤
│ Introduction   Force   Mass   Quiz           │
├──────────────────────────────────────────────┤
│ 🎙 Talk to your tutor                 ●      │
└──────────────────────────────────────────────┘
```

This should feel more like a **learning theater** than a video player.

---

# 21. INTERACTION FEEDBACK

Every meaningful interaction should provide appropriate feedback.

Examples:

### Correct answer

```text
✓ Correct

You've understood the relationship.
```

### Partial understanding

```text
You're on the right track.

Let's examine one part again.
```

### Incorrect answer

```text
Not quite.

Let's approach it from another angle.
```

### Mastery

```text
✓ Resistance mastered
```

Feedback should reinforce learning rather than merely judge the student.

---

# 22. FORM / ASSESSMENT COMPONENTS

Assessment interfaces should feel like guided practice.

Avoid the visual language of intimidating examination portals.

Instead:

```text
Let's practice

Topic
[Electricity]

Practice style
[Quick Quiz]

Challenge
[Medium]

        [Start Practice]
```

Use progressive disclosure when configuration becomes complex.

---

# 23. QUESTION COMPONENT

Questions should have a strong visual hierarchy.

```text
Question 3 of 10

Why does current decrease
when resistance increases?

○ A
○ B
○ C
○ D
```

Avoid unnecessary decorative elements.

---

# 24. ANSWER STATES

Answers should support:

- Default
- Hover
- Selected
- Correct
- Incorrect
- Disabled
- Reviewing

Color should never be the only indicator.

Use:

- ✓
- ×
- labels
- explanatory feedback
- visual emphasis

alongside color.

---

# 25. DESIGN TOKEN RELATIONSHIP

All components should consume shared design tokens rather than hard-coded styling.

Example conceptual structure:

```text
Design Tokens
      ↓
Component Tokens
      ↓
Reusable Components
      ↓
Pages
      ↓
Learning Experiences
```

This allows the entire product to evolve consistently.

---

# 26. COMPONENT MOTION

Default UI motion should be subtle.

Recommended general duration:

- Micro interaction: `120–180ms`
- Standard transition: `180–250ms`
- Larger transition: `250–400ms`

Preferred easing:

- Ease-out for entering
- Ease-in for leaving
- Smooth spring-like motion for selected interactive elements where appropriate

Avoid:

- Long unnecessary transitions
- Constant bouncing
- Excessive spring physics
- Decorative motion that competes with lesson content

---

# 27. ACCESSIBILITY

Every reusable component must consider:

- Keyboard navigation
- Visible focus states
- Screen reader labels
- Sufficient contrast
- Touch target size
- Reduced motion
- Color-independent status communication

Never communicate meaning through color alone.

For example:

Bad:

```text
Green = correct
Red = wrong
```

Better:

```text
✓ Correct
↻ Try again
```

with color as additional reinforcement.

---

# 28. RESPONSIVE BEHAVIOR

Components should adapt rather than simply shrink.

Desktop:

- More whitespace
- Multi-column layouts
- Side navigation
- Larger visual stages

Tablet:

- Reduced spacing
- Flexible columns
- Condensed navigation

Mobile:

- Single-column layout
- Bottom navigation
- Larger touch targets
- Simplified controls
- Reduced decorative elements

The Learning Theater should remain usable on smaller screens without allowing controls to cover important educational visuals.

---

# 29. COMPONENT PRIORITY

When a screen becomes visually crowded, remove or reduce components in this order:

1. Decorative elements
2. Secondary metadata
3. Secondary actions
4. Non-essential cards
5. Supporting navigation

Never sacrifice:

1. Primary learning content
2. Primary action
3. Tutor interaction
4. Feedback
5. Accessibility

---

# 30. THE LUMO COMPONENT TEST

Before adding any component, ask:

### Does it help the student understand?

If no:

### Does it help the student navigate?

If no:

### Does it help the student interact?

If no:

### Does it meaningfully communicate the Lumo brand?

If no:

**Remove it.**

The goal is not to maximize the number of components.

The goal is to create a coherent learning environment.

---

# 31. FINAL COMPONENT PRINCIPLE

Lumo should never feel like:

> "A website with lots of nice components."

It should feel like:

> **"A beautifully designed place where an intelligent tutor teaches me."**

Every component exists to support that feeling.

The interface should remain:

**Calm.**

**Clear.**

**Fruity in light mode.**

**Cinematic in dark mode.**

**Friendly without being childish.**

**Premium without becoming corporate.**

**Interactive without becoming distracting.**

And most importantly:

> **The learning experience — not the interface itself — is always the hero.**

```
````
