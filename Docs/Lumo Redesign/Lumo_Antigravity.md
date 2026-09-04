# LUMO — ANTIGRAVITY IMPLEMENTATION GUIDE

> Master implementation instructions for redesigning and evolving the Lumo AI Tutor product.

---

# 1. PURPOSE

You are working on **Lumo**, an AI-powered learning environment designed to provide personalized, interactive, multimodal teaching.

Lumo is not intended to feel like:

- a generic ed-tech dashboard
- a chatbot with an educational skin
- a talking AI avatar
- a collection of disconnected AI features
- a children's gamification app
- a generic SaaS template

Lumo should feel like:

> **A calm, intelligent, AI-native learning environment where difficult concepts become visually understandable.**

The redesign must preserve the existing product's functional capabilities while transforming its visual quality, interaction design, and overall product experience.

The redesign is not merely cosmetic.

The interface must make Lumo's underlying intelligence visible.

---

# 2. CORE PRODUCT PHILOSOPHY

The most important principle is:

> **Design a place where learning happens, not a website about learning.**

The UX should embody the learning process:

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

The teaching loop should feel like:

```text
UNDERSTAND
   ↓
PLAN
   ↓
EXPLAIN
   ↓
DEMONSTRATE
   ↓
QUESTION
   ↓
EVALUATE
   ↓
ADAPT
   ↓
CONTINUE
```

Every major product decision should reinforce this.

---

# 3. DOCUMENTATION IS THE SOURCE OF TRUTH

The repository contains a dedicated Lumo redesign documentation system.

Before implementing significant UI/UX changes, read the relevant documentation.

The documentation is not a collection of loose suggestions.

Treat it as the product specification.

---

# 4. DESIGN DOCUMENT HIERARCHY

The following hierarchy determines how the documents should be interpreted.

## Level 1 — Brand + Design Foundation

Located under:

```text
Lumo Redesign/stage 1/
```

Documents:

```text
Lumo_Brand_Guidelines.md
Lumo_Design_System.md
Lumo_Component_System.md
Lumo_Motion_Guidelines.md
Lumo_Illustration_Guidelines.md
Lumo_UX_Principles.md
```

These define the fundamental visual and interaction language of Lumo.

They should be treated as global rules.

---

## Level 2 — Product Architecture

Located under:

```text
Lumo Redesign/stage 2/
```

Documents:

```text
Lumo_Product_Architecture.md
Lumo_UX_Blueprint.md
Lumo_Learning_Theater.md
Lumo_AI_Orchestration.md
Lumo_Responsive_States.md
```

These define how the product behaves as a system.

They should guide architecture and interaction decisions.

---

## Level 3 — Page Specifications

Located under:

```text
Lumo Redesign/stage 3/
```

Documents:

```text
Lumo_Page_Architecture.md
Lumo_Landing_Page.md
Lumo_Dashboard.md
Lumo_Live_Theater_Spec.md
Lumo_AI_Workspace.md
Lumo_Assessment_Experience.md
Lumo_Target_Demo.md
```

These define page-specific behavior and priorities.

---

## Level 4 — Existing Technical Architecture

The existing repository itself is also a source of truth.

Existing working functionality must not be destroyed merely to achieve visual improvements.

Before changing architecture:

1. inspect the existing implementation
2. understand the current contracts
3. identify reusable components
4. identify existing APIs
5. identify existing orchestration
6. identify existing data models
7. identify existing tests
8. identify existing AI capabilities
9. identify dependencies between frontend and backend

Do not assume the current implementation is disposable.

---

# 5. IMPORTANT: AUDIT BEFORE MODIFYING

Before making substantial changes, inspect the existing repository.

Do not immediately rewrite the application.

First understand:

```text
Frontend
Backend
Shared package
Routes
Components
Hooks
State management
API contracts
AI providers
Teacher Engine
Assessment Engine
Visual Strategy Engine
Session Memory
Replay system
Turn management
RAG pipeline
MongoDB models
Firebase authentication
Remotion integration
Existing tests
Existing build configuration
```

The objective is:

> **Improve and evolve the existing system, not blindly replace it.**

If an existing implementation already solves a requirement correctly, prefer integrating the redesign with it.

---

# 6. EXISTING TECHNICAL ARCHITECTURE

The current project already contains significant functionality.

Important existing capabilities include:

- React 18
- TypeScript
- Vite
- Node.js
- Express
- MongoDB
- Firebase Authentication
- Gemini AI provider
- Groq fallback
- API key pooling/rotation
- TeacherEngine
- LessonPlan contracts
- Hybrid state architecture
- Teaching session persistence
- AssessmentEngine
- VisualStrategyEngine
- SessionMemoryService
- ReplayService
- ConversationOrchestrator
- IntentRouter
- ClassroomTurnManager
- ContextBuilder
- ClassroomEventEmitter
- Remotion-based lesson visuals
- RAG/document pipeline
- Voice interaction
- STT
- TTS
- Barge-in handling
- Typed and voice input through unified orchestration

These systems are valuable.

Do not rebuild them without first determining whether the existing implementation can be extended.

---

# 7. REDESIGN DEVELOPMENT PROCESS

The entire redesign will be completed through exactly four major phases.

```text
PHASE 1
FOUNDATION + PRODUCT SHELL

        ↓

PHASE 2
CORE PRODUCT EXPERIENCE

        ↓

PHASE 3
LIVE THEATER

        ↓

PHASE 4
INTEGRATION + POLISH + DEMO HARDENING
```

Do not create unnecessary additional implementation phases.

Individual subtasks may exist within a phase, but the overall redesign remains within these four phases.

---

# 8. PHASE 1 — FOUNDATION + PRODUCT SHELL

## Objective

Make the application visually become Lumo before implementing the complex Theater.

Implement the global design language first.

---

## Scope

Implement:

- Lumo branding
- Logo
- Light theme
- Dark theme
- Fruity light-theme identity
- Typography
- Color tokens
- Spacing
- Radius
- Borders
- Shadows
- Elevation
- Buttons
- Inputs
- Cards
- Tabs
- Dropdowns
- Modals
- Toasts
- Progress indicators
- Loading states
- AI states
- Navigation
- Responsive foundations
- Global motion primitives

---

## Pages

Redesign:

### Landing

Direction:

> Premium, minimal, negative-space-heavy, cinematic.

The landing page should communicate the product quickly without visual clutter.

### Authentication

Authentication should be:

- clean
- minimal
- premium
- easy to understand

Landing and authentication may be implemented together.

---

## Do NOT

Do not begin the Theater redesign during the initial foundation work.

Do not introduce complex 3D systems globally.

Do not add animations simply because they look impressive.

Do not fill negative space unnecessarily.

---

# 9. PHASE 2 — CORE PRODUCT EXPERIENCE

## Objective

Transform the supporting product surfaces around the actual learning experience.

---

## Dashboard

Keep the dashboard intentionally lightweight.

The hackathon does not justify turning the dashboard into an enormous analytics platform.

The dashboard should answer:

> **What should I learn next?**

Prioritize:

- Continue Learning
- Recent Documents
- Recommended Learning
- Lightweight mastery/progress
- Quick actions
- Existing document selection
- Document upload entry points

Do not overload the page with:

- unnecessary charts
- vanity metrics
- excessive statistics
- gamification
- decorative cards

---

# 10. DOCUMENT / RAG EXPERIENCE

Documents should not be treated as a separate isolated workflow only.

Users should be able to access document/RAG functionality contextually.

Important entry points include:

```text
Theater
Assessment
Dashboard
```

The user should be able to:

1. select an existing document
2. upload a new document
3. specify the relevant topic
4. begin the learning or assessment experience

If the user uploaded a document previously, they should not be forced to upload it again.

Use an existing-document selector/dropdown where appropriate.

Reuse the existing RAG pipeline.

Do not rebuild RAG merely as part of the UI redesign.

---

# 11. LUMO AI WORKSPACE

Build the Lumo AI experience as a compact, modern AI workspace.

The intended interaction model is inspired by the clarity of modern AI products such as ChatGPT/Claude, but the design must remain distinctly Lumo.

Core capabilities:

- text input
- conversation
- model selector
- Lumo Fast
- Lumo Light
- Lumo Pro
- context awareness
- Theater context
- document context
- responsive behavior

Lumo AI should be straightforward.

The user opened it to ask a question.

Do not bury the input behind unnecessary UI.

---

# 12. ASSESSMENT

Assessment is a dedicated product experience.

It should support:

- assessment landing
- practice modes
- topic selection
- document selection
- existing-document dropdown
- document upload
- MCQ
- short answer
- long answer
- numerical questions
- handwritten/image submissions
- AI evaluation
- adaptive difficulty
- misconception identification
- adaptive clarification
- results
- revision recommendations
- board/CBT-oriented experience

However:

> Assessment is important, but the Live Theater is the primary showcase experience.

Do not allow assessment complexity to consume the majority of redesign effort before Theater is exceptional.

---

# 13. PHASE 3 — LIVE THEATER

# THIS IS THE FLAGSHIP EXPERIENCE

The Live Theater receives the highest design, interaction, engineering, and polish priority.

Do not treat it as another normal page.

It is the core demonstration of Lumo's intelligence.

The Theater should feel like:

> **A Learning Theater**

not:

- a chat window
- a video player
- an avatar demo
- a dashboard
- a generic lesson page

---

# 14. THEATER STRUCTURE

The Theater should contain:

```text
PRE-SESSION CONFIGURATION
        ↓
LEARNING THEATER
        ↓
INTERACTIVE TEACHING
        ↓
ASSESSMENT MOMENTS
        ↓
ADAPTATION
        ↓
SESSION COMPLETION
```

---

# 15. PRE-SESSION CONFIGURATION

Before starting the session, the user should be able to configure relevant preferences.

Potential controls include:

- topic
- existing document
- upload document
- language
- voice
- narration speed
- captions
- learning preferences

The UI should make these controls understandable.

Do not present them like technical configuration.

Prefer language such as:

> Let's set up your lesson.

rather than:

> Configure Session Parameters.

---

# 16. THEATER LAYOUT

The visual stage is the primary area.

The tutor is important but should occupy a relatively smaller area.

The core hierarchy is:

```text
VISUAL LESSON
      ↓
TUTOR
      ↓
CONTROLS
```

The visual explanation should remain the hero.

---

# 17. VISUAL STAGE

The visual stage can contain:

- diagrams
- formulas
- animated explanations
- timelines
- maps
- scientific models
- simulations
- environmental scenes
- code
- architecture diagrams
- 2D illustrations
- 3D scenes
- interactive models

The visual stage should evolve according to what is being taught.

It should not simply display generic text.

---

# 18. QUESTIONS SHOULD TRANSFORM THE STAGE

When the tutor decides that the student should answer a question, do not simply place a question underneath the video.

The main visual stage should be capable of transforming into an interactive learning playground.

Example:

```text
TUTOR EXPLAINS
      ↓
VISUAL DEMONSTRATION
      ↓
TUTOR ASKS QUESTION
      ↓
VISUAL STAGE TRANSFORMS
      ↓
INTERACTIVE PLAYGROUND
      ↓
STUDENT ANSWERS
      ↓
AI EVALUATES
      ↓
TUTOR ADAPTS
      ↓
LESSON CONTINUES
```

This transformation should feel intentional and cinematic.

---

# 19. QUESTION TYPES

The Theater may support:

- MCQ
- short answer
- long answer
- numerical
- handwritten/image submission

For handwritten/image submissions:

The student may solve the problem physically and submit an image.

AI evaluation should remain compatible with the existing implementation.

This is particularly useful for board/CBT-oriented learning and clean-answer practice.

---

# 20. 2D VS 3D

Do not use Three.js / React Three Fiber everywhere.

Use technologies according to educational value.

---

## Use normal React/CSS/SVG when:

- UI interaction is simple
- the visual is primarily text
- a diagram can be represented efficiently with SVG
- motion is lightweight
- 3D provides no educational advantage

---

## Use Remotion when:

- the sequence is predetermined
- educational animation is cinematic
- formulas need choreography
- diagrams need timed transitions
- narration and visual beats need synchronization
- the lesson is primarily a rendered visual sequence

---

## Use React Three Fiber / Three.js when:

3D materially improves understanding.

Examples:

- cell models
- molecular structures
- solar system
- spatial geometry
- 3D physics
- interactive scientific models
- objects that need spatial manipulation

The purpose is:

> **Use 3D to explain something that benefits from spatial understanding.**

Never use 3D merely to show off.

---

# 21. AI CHOREOGRAPHY

This is one of Lumo's most important systems.

The AI should not merely generate an explanation.

It should orchestrate the experience.

Conceptually:

```text
CONCEPT
   ↓
TEACHING PLAN
   ↓
VISUAL STRATEGY
   ↓
ASSET / TOOL SELECTION
   ↓
VISUAL BEATS
   ↓
NARRATION
   ↓
TIMING
   ↓
QUESTION
   ↓
EVALUATION
   ↓
ADAPTATION
```

The AI should determine:

- what to explain
- what visual representation is appropriate
- when to show it
- when to highlight
- when to ask a question
- when to transform the stage
- when to use an interactive visualization
- when to continue
- when to re-explain
- when to remediate

The choreography should be calculated rather than random.

---

# 22. MODEL SPECIALIZATION

Do not waste the strongest model on every trivial interaction.

The AI system should use model specialization.

Conceptually:

```text
FAST INTERACTIONS
        ↓
FAST / LIGHT MODEL

NORMAL TEACHING INTERACTIONS
        ↓
LIGHT MODEL

COMPLEX REASONING
        ↓
STRONG MODEL

LESSON PLANNING
        ↓
STRONG MODEL

VISUAL / SCENE PLANNING
        ↓
STRONG MODEL

FAILURE
        ↓
FALLBACK PROVIDER
```

The exact models must follow the actual provider availability and implementation constraints in the repository.

Do not hardcode a model simply because this document mentions a conceptual role.

Inspect the existing AI provider layer first.

---

# 23. TUTOR DIRECTION

The AI tutor should eventually feel alive.

The desired direction is:

```text
VOICE
 +
LIP SYNCHRONIZATION
 +
FACIAL EXPRESSION
 +
APPROPRIATE GESTURES
 +
EMOTIONAL STATE
```

The tutor may be:

- realistic
- stylized
- 3D
- high-quality cartoon/illustrated

But it must feel like it is actually communicating.

The tutor is a guide.

The lesson visual is the primary teaching surface.

Do not allow the avatar to dominate the Theater.

---

# 24. VOICE EXPERIENCE

The voice should feel natural and configurable.

Support where technically feasible:

- voice selection
- narration speed
- language
- speaking state
- interruption
- playback control

Avoid robotic delivery.

The architecture should allow future TTS upgrades without requiring a complete Theater rewrite.

---

# 25. CONTROLS

During an active lesson, provide clear controls such as:

- pause
- stop
- microphone on/off
- captions
- replay
- explain differently
- interruption/barge-in

Controls should remain discoverable without dominating the interface.

---

# 26. BARGE-IN

Barge-in is a core interaction capability.

When the student interrupts:

```text
Student starts speaking
        ↓
Cancel active speech
        ↓
Cancel active visual transitions
        ↓
Invalidate current turn
        ↓
Discard stale async results
        ↓
Process new student input
```

Do not introduce zombie turns.

Do not allow stale visual events or stale AI responses to mutate the current Theater state.

Preserve the existing ClassroomTurnManager behavior unless a verified improvement is required.

---

# 27. VISUAL SYNCHRONIZATION

Speech and visuals should work together.

When narration describes a concept, the corresponding visual should react at the appropriate moment.

Example:

```text
Narration:
"As resistance increases..."

Visual:
Resistance ↑
        ↓
Current ↓
```

Do not duplicate narration with huge blocks of identical text.

Use visuals to demonstrate concepts.

---

# 28. AI QUESTIONS SHOULD FEEL LIKE PART OF TEACHING

Questions should not feel like abrupt forms appearing inside a lesson.

The transition should feel intentional.

Example:

```text
Tutor explains
       ↓
Visual pauses
       ↓
Tutor asks
       ↓
Stage transforms
       ↓
Student interacts
       ↓
Feedback
       ↓
Stage resumes
```

This should become one of Lumo's signature interactions.

---

# 29. LUMO AI INSIDE THE THEATER

Students should be able to open Lumo AI from the Theater when they have a doubt.

The interface should be compact and context-aware.

It should understand:

- current concept
- current lesson
- recent conversation
- active document
- relevant visual
- assessment state where appropriate

The student should not need to repeat the entire context.

---

# 30. TARGET DEMO PRIORITY

The project does NOT need every theoretical feature to be perfect before demonstration.

The priority is:

> **Make representative experiences exceptionally good.**

At minimum, create a strong demonstration for multiple subjects.

Examples may include:

### Biology

Interactive cell visualization.

### Physics

Real-world force / motion visualization or simulation.

### Chemistry

Molecular or reaction visualization.

### Mathematics

Dynamic geometry, graphs, or equation visualization.

### Astronomy

Solar system / orbital visualization.

### Coding

Code → execution → output visualization.

The exact scenarios should follow:

```text
Lumo_Target_Demo.md
```

Do not spread effort equally across every theoretical subject.

Create excellent representative examples.

---

# 31. PHASE 4 — INTEGRATION + POLISH + DEMO HARDENING

Once the major experiences are implemented, stop adding unnecessary features.

Focus on:

## Integration

Ensure:

```text
Landing
 ↓
Auth
 ↓
Dashboard
 ↓
Document
 ↓
Theater
 ↓
Interactive lesson
 ↓
Lumo AI
 ↓
Assessment
 ↓
Results
```

feels like one coherent product.

---

## Visual polish

Review:

- spacing
- typography
- hierarchy
- transitions
- hover states
- focus states
- loading states
- empty states
- error states
- responsive behavior
- light/dark consistency
- animation timing
- component consistency

---

# 32. PERFORMANCE

Pay particular attention to:

- Three.js / R3F
- Remotion
- video
- audio
- large assets
- model calls
- bundle size
- lazy loading
- unnecessary re-renders

A visually impressive experience that performs badly is not acceptable.

Use heavy technologies only where they materially improve the experience.

---

# 33. RESPONSIVENESS

Lumo must remain coherent across:

```text
Mobile
Tablet
Desktop
Large desktop
```

Do not simply shrink desktop layouts.

Design responsive states intentionally.

Follow:

```text
Lumo_Responsive_States.md
```

---

# 34. ACCESSIBILITY

Maintain:

- sufficient contrast
- keyboard accessibility
- visible focus states
- readable typography
- non-color-only feedback
- accessible controls
- reduced-motion behavior

Accessibility must not be sacrificed for visual polish.

---

# 35. MOTION RULE

Animation should communicate something.

Good:

```text
Equation builds progressively
Diagram highlights relevant component
Stage transitions into question mode
Progress updates
Tutor speaking state changes
```

Bad:

```text
Random floating elements
Excessive particles
Constant parallax
Unnecessary bouncing
Animations on every component
```

The product should feel alive.

Not noisy.

---

# 36. VISUAL QUALITY BAR

Do not settle for:

- generic gradients
- generic AI dashboards
- stock educational illustrations
- random 3D blobs
- excessive glassmorphism
- excessive neon
- childish gamification
- generic avatar demos
- excessive cards
- unnecessary visual competition
- decorative animation with no purpose

The visual identity should be:

```text
CALM
+
CURIOUS
+
CINEMATIC
```

The product should feel:

> premium, intelligent, warm, modern, visual, and purposeful.

---

# 37. NEGATIVE SPACE

Negative space is intentional.

Do not fill empty space simply because it appears empty.

If a composition already has:

- clear hierarchy
- strong focal point
- appropriate spacing

leave it alone.

Premium design often comes from restraint.

---

# 38. LIGHT THEME

The light theme should feel:

> **fruity, fresh, expressive, warm, and premium.**

It should NOT become:

- childish
- rainbow-heavy
- overly saturated
- visually chaotic

Use the exact palette defined by:

```text
Lumo_Design_System.md
```

Do not invent a competing palette.

---

# 39. DARK THEME

The dark theme should preserve the same identity.

The logo may switch appropriately for contrast.

Do not create a completely different product in dark mode.

The same design language should remain recognizable.

---

# 40. BRAND RULE

The Lumo logo and brand identity are locked.

Do not redesign the brand mark unless explicitly instructed.

The product name is:

> **Lumo**

Do not introduce alternative names or rebrand the product during implementation.

---

# 41. COMPONENT REUSE

Build reusable components where appropriate.

Prefer:

```text
Design tokens
 ↓
Primitive components
 ↓
Shared components
 ↓
Page-specific compositions
```

Avoid creating five slightly different versions of the same button.

The component system should remain coherent.

---

# 42. DO NOT CREATE A GOD COMPONENT

Avoid giant components that contain:

- layout
- AI logic
- animation
- API calls
- business logic
- state management
- visual rendering

all together.

Keep responsibilities modular.

This is particularly important for Theater.

The Theater should be composed of focused systems.

---

# 43. DO NOT BREAK BACKEND CONTRACTS CASUALLY

Before changing an API:

1. inspect consumers
2. inspect shared types
3. inspect validation
4. inspect tests
5. inspect backend behavior
6. determine whether the change is actually necessary

Prefer adapting the frontend to existing contracts when possible.

If a backend change is necessary, make it deliberately and verify all affected flows.

---

# 44. TESTING RULE

After meaningful implementation changes:

```text
TYPECHECK
BUILD
UNIT / INTEGRATION TESTS
EXISTING VERIFICATION SUITES
```

must be considered.

Existing tests include verification across:

- Phase 2.5
- Phase 2.6
- Phase 3
- Phase 3.5
- Phase 4

Do not assume a visually successful change is technically successful.

---

# 45. VISUAL VERIFICATION

After each major page implementation:

1. run the application
2. inspect the actual UI
3. check desktop
4. check responsive states
5. check light mode
6. check dark mode
7. test interactions
8. compare against the relevant documentation
9. identify visual inconsistencies
10. refine before moving on

Do not implement the entire redesign blindly.

Use:

> **Plan → Implement → Run → Inspect → Critique → Refine → Lock**

---

# 46. IMPLEMENTATION ORDER

The intended implementation sequence is:

```text
PHASE 1
│
├── Repository audit
├── Design tokens
├── Global components
├── Navigation
├── Landing
└── Auth
        ↓
PHASE 2
│
├── Dashboard
├── Document/RAG entry points
├── Lumo AI
└── Assessment
        ↓
PHASE 3
│
├── Theater shell
├── Pre-session
├── Visual stage
├── Tutor
├── Controls
├── Voice
├── Barge-in
├── Interactive questions
├── Remotion
├── R3F/Three.js where justified
├── AI choreography
└── Target Demo scenarios
        ↓
PHASE 4
│
├── Integration
├── Performance
├── Responsive QA
├── Accessibility
├── Regression testing
├── Visual polish
└── Final demo hardening
```

---

# 47. WHAT NOT TO DO

Never:

- blindly rewrite the repository
- replace working systems without justification
- add features just because they look cool
- add 3D everywhere
- add GSAP everywhere
- add animation everywhere
- turn the dashboard into an analytics monster
- turn Lumo into a children's game
- copy ChatGPT visually
- copy Duolingo visually
- copy Notion visually
- use generic AI gradients
- sacrifice performance for visual effects
- sacrifice functionality for visual polish
- duplicate existing backend systems unnecessarily
- introduce unnecessary dependencies
- ignore existing tests
- assume a design looks good without running it
- finish all pages before visually reviewing the result

---

# 48. TECHNOLOGY DECISION RULES

Technology should be selected based on the problem.

## React

Default UI framework.

## CSS / existing styling system

Use for normal interface composition.

## Framer Motion

Use where appropriate for UI transitions and micro-interactions.

## GSAP

Use only when complex choreography genuinely benefits from timeline-based animation.

Do not introduce GSAP merely because it is popular.

## SVG

Preferred for many educational diagrams and lightweight visualizations.

## Remotion

Preferred for structured, synchronized educational video/animation.

## React Three Fiber / Three.js

Use selectively for genuinely spatial/3D educational experiences.

## Other libraries

Introduce only when there is a clear benefit.

Every new dependency should have a reason.

---

# 49. PERFORMANCE-FIRST 3D RULE

Before introducing a 3D scene ask:

```text
Does 3D improve understanding?
        │
        ├── NO → use 2D
        │
        └── YES
             ↓
        Is it interactive?
             │
             ├── NO → consider Remotion/SVG
             │
             └── YES → consider R3F
```

This keeps Lumo technically impressive without turning it into an unnecessarily heavy application.

---

# 50. TARGET DEMO IS THE NORTH STAR

When time or resources become constrained:

Prioritize:

```text
DEMO QUALITY
>
FEATURE COUNT
```

A small number of excellent experiences is better than dozens of unfinished features.

The final product should demonstrate that Lumo can:

```text
Teach
 ↓
Visualize
 ↓
Interact
 ↓
Question
 ↓
Evaluate
 ↓
Adapt
 ↓
Handle doubts
 ↓
Continue
```

---

# 51. DEFINITION OF DONE

A redesign phase is complete only when:

### Visual

- page matches the relevant Lumo documentation
- light mode works
- dark mode works
- responsive behavior works
- components are consistent
- motion is purposeful

### Functional

- existing functionality remains operational
- user flows work
- API contracts remain valid
- AI interactions work
- document flows work
- assessment flows work
- Theater interactions work where implemented

### Technical

- typecheck passes
- build passes
- relevant tests pass
- no obvious runtime errors
- performance is acceptable

### Product

The interface communicates:

> **This is Lumo.**

not:

> "This is the old app with prettier CSS."

---

# 52. FINAL PRINCIPLE

The goal is not to make Lumo the application with the most features.

The goal is to make Lumo the application where the intelligence of the system is most visible through the experience.

The judge should be able to understand the product without reading the architecture.

They should see:

```text
Student
   ↓
Lumo understands
   ↓
Lumo teaches
   ↓
Lumo visualizes
   ↓
Student interacts
   ↓
Lumo evaluates
   ↓
Lumo adapts
```

And the experience should make them think:

> **"This isn't just an AI chatbot that teaches. This is an AI learning environment."**

That is the standard.

---

# 53. FIRST ACTION — DO NOT MODIFY CODE

When beginning the redesign, your first task is NOT implementation.

Your first task is:

> **AUDIT THE EXISTING REPOSITORY.**

Read this document and the relevant Lumo redesign documents.

Then inspect the repository.

Determine:

1. What currently exists
2. What is already working
3. What can be reused
4. What needs visual redesign
5. What needs architectural modification
6. What existing APIs/contracts must remain untouched
7. What existing components can become part of the Lumo design system
8. What the current Theater implementation looks like
9. What the current RAG/document workflow looks like
10. What the current assessment workflow looks like
11. What the current AI orchestration supports
12. What gaps exist relative to the redesign documentation

Produce an audit/report first.

**Do not begin making broad code changes until the audit is complete.**

After the audit, implementation begins with:

> **PHASE 1 — FOUNDATION + PRODUCT SHELL**

---

# END OF LUMO ANTIGRAVITY IMPLEMENTATION GUIDE

```

```
