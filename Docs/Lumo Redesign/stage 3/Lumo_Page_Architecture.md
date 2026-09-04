# LUMO — PAGE ARCHITECTURE

**Document:** LUMO_PAGE_ARCHITECTURE.md  
**Stage:** 3 — Product Experience Architecture  
**Status:** LOCKED  
**Purpose:** Defines Lumo's information architecture, routes, navigation, page hierarchy, workflow ownership, document/RAG entry points, authentication flow, and dashboard scope.

---

# 1. PURPOSE

Lumo is an AI-native learning environment, not a conventional educational dashboard.

The page architecture must therefore be organized around the student's learning journey rather than around technical features.

The primary product loop is:

> Discover → Learn → Interact → Practice → Understand → Continue

The architecture must make this loop obvious.

The product should avoid unnecessary pages, duplicated workflows, and feature-heavy dashboards.

The most important experience is the **Learning Theater**.

The Theater receives the highest design and implementation priority because it is the primary demonstration of Lumo's core capabilities:

- AI teaching
- Voice interaction
- Visual explanations
- Interactive learning
- Adaptive teaching
- Document/RAG context
- Real-time interruption
- Assessment within a lesson
- Subject-aware visual generation
- 2D / 3D / simulation-based explanations

---

# 2. CORE INFORMATION ARCHITECTURE

Lumo is structured into six major product areas:

1. Landing
2. Authentication
3. Learning Home
4. Learning Theater
5. Assessment
6. Lumo AI

Documents and RAG are treated as **learning resources**, not as a completely separate product experience.

The primary architecture is:

```text
LUMO
│
├── Landing
│
├── Authentication
│   ├── Sign In
│   └── Sign Up
│
└── Application
    │
    ├── Home
    │
    ├── Learn
    │   └── Learning Theater
    │
    ├── Practice
    │   └── Assessment
    │
    └── Lumo AI
         └── Contextual Doubt Solver
```

Documents/RAG are accessible contextually from:

```text
Learning Theater
        ↓
Document / Resource Selection
        ↓
RAG Context
        ↓
Lesson

Assessment
        ↓
Document / Resource Selection
        ↓
RAG Context
        ↓
Practice
```

There should NOT be a mandatory standalone:

```text
Documents
```

page in the primary navigation.

A document library may exist internally or as a secondary management surface, but students should primarily encounter documents when they are trying to learn or practice.

---

# 3. ROUTE ARCHITECTURE

Recommended route structure:

```text
/
```

Landing page.

```text
/signin
```

Sign-in page.

```text
/signup
```

Sign-up page.

```text
/app
```

Authenticated learning home.

```text
/app/learn
```

Learning entry point / lesson discovery.

```text
/app/theater/:sessionId
```

Active Learning Theater session.

```text
/app/assessment
```

Assessment / practice hub.

```text
/app/assessment/:sessionId
```

Active assessment session.

```text
/app/ai
```

Lumo AI contextual assistant.

Optional future route:

```text
/app/documents
```

Document/resource management.

This route should remain secondary and should not dominate the current MVP.

Optional future route:

```text
/app/progress
```

Detailed learning analytics and mastery history.

This is intentionally deferred unless required by the hackathon or future product development.

---

# 4. PRIMARY VS SECONDARY PAGES

## PRIMARY

These are the pages that define the product.

### 1. Landing

Purpose:

- Introduce Lumo
- Demonstrate the core concept
- Establish brand identity
- Show AI teaching visually
- Convert visitors into users

Priority:

**HIGH**

---

### 2. Learning Home

Purpose:

- Give the student a starting point
- Continue previous learning
- Start a new lesson
- Start practice
- Surface relevant learning recommendations

Priority:

**MEDIUM**

The dashboard must remain intentionally lightweight.

---

### 3. Learning Theater

Purpose:

- Deliver the actual AI teaching experience
- Combine voice, visuals, interaction and adaptive teaching

Priority:

**EXTREME**

This is Lumo's flagship experience.

---

### 4. Assessment

Purpose:

- Allow students to deliberately practice
- Run mock tests
- Answer structured questions
- Evaluate answers
- Receive adaptive feedback

Priority:

**HIGH**

Assessment should feel like a dedicated learning/practice environment rather than an ordinary form.

---

### 5. Lumo AI

Purpose:

- Resolve doubts
- Ask follow-up questions
- Explore concepts
- Interact with the AI outside the main lesson
- Provide contextual assistance

Priority:

**HIGH**

The interface should resemble a compact modern AI assistant rather than a traditional educational page.

---

# 5. SECONDARY PAGES

Secondary experiences support the primary learning loop.

Examples:

```text
Document Management
Profile
Settings
Detailed Progress
Preferences
```

These should not compete visually or structurally with the primary learning experiences.

For the hackathon MVP, secondary pages should remain minimal unless a requirement explicitly demands them.

---

# 6. GLOBAL NAVIGATION

The authenticated application should use a simple primary navigation.

Recommended structure:

```text
Lumo

Home
Learn
Practice
Lumo AI
```

Potential future items:

```text
Progress
Documents
```

These should not be added to the primary navigation unless they provide clear value.

---

# 7. NAVIGATION PHILOSOPHY

Navigation must answer:

> "What can I do next?"

It should not attempt to expose every feature.

Avoid navigation such as:

```text
Dashboard
AI
Videos
Documents
RAG
Lessons
Visuals
Assessments
Analytics
Models
Settings
Resources
```

This exposes implementation concepts rather than student goals.

Instead:

```text
Home
Learn
Practice
Lumo AI
```

The product should feel simple even though the underlying system is sophisticated.

---

# 8. LEARNING HOME / DASHBOARD

The dashboard exists to orient the student.

It is NOT the main product experience.

The dashboard should answer four questions:

1. What was I learning?
2. Where did I stop?
3. What can I learn next?
4. Can I start something immediately?

Recommended structure:

```text
Good morning.

What would you like to learn?

[ Start learning ]

Continue learning
┌──────────────────────────────┐
│ Physics                      │
│ Newton's Laws                │
│ ████████████░░ 78%           │
│ Continue →                   │
└──────────────────────────────┘

Recommended
[ Electricity ] [ Biology ] [ Algebra ]

Practice
[ Start an assessment → ]
```

The dashboard should NOT become a statistics-heavy analytics center.

Avoid making these dominant:

```text
Total Hours
Total Sessions
Average Score
XP
Streaks
Leaderboard
Badges
Charts
```

Learning should remain the hero.

---

# 9. LEARNING ENTRY POINT

The Learn workflow should allow a student to begin a teaching session with minimal friction.

The student should be able to provide:

- Topic
- Subject
- Optional document/resource
- Optional learning goal
- Optional preferred language
- Optional teaching preferences

The system should avoid presenting a large configuration form.

Instead, use progressive disclosure.

Example:

```text
What would you like to learn?

[ Newton's Laws ]

Subject

[ Physics ]

Use a resource?

[ None ▼ ]
[ My Physics Textbook ▼ ]
[ Upload a document ]

[ Start learning ]
```

Additional advanced controls may appear only when useful.

---

# 10. DOCUMENT / RAG ENTRY POINTS

Documents should be integrated directly into learning workflows.

A student should NOT have to think:

> "I need to go to the Documents page before I can teach this topic."

Instead:

## Theater entry

```text
Start a lesson

Topic:
[ Newton's Laws ]

Resource:
[ Choose a document ▼ ]

Existing documents:
• Physics Chapter 3
• NCERT Physics
• My Notes

[ Upload new document ]

[ Start lesson ]
```

The student may either:

1. Select an existing document.
2. Upload a new document.
3. Continue without a document.

---

# 11. DOCUMENT REUSE

Previously uploaded documents must be reusable.

Example:

```text
Resource

[ NCERT Physics — Class 9 ▼ ]
```

If the student uploaded the document ten days ago, they should not need to upload it again.

The system should associate documents with the user's account and expose available resources through selection controls.

The student should be able to:

```text
Select existing document
        OR
Upload new document
```

without leaving the learning workflow.

---

# 12. DOCUMENT + TOPIC WORKFLOW

When a document is selected, the student should be able to specify what they want from it.

Example:

```text
Document:
NCERT Physics

What should we learn?

[ Motion and Force ]

How should Lumo teach it?

[ Teach me interactively ]

[ Start ]
```

The RAG system should retrieve only the relevant information required for the selected learning task.

The interface should not expose technical terms such as:

```text
RAG
Embeddings
Vector Search
Retrieval
Chunks
Context Window
```

These are implementation details.

The student should experience:

> "Lumo knows my material."

---

# 13. LEARNING THEATER ROUTE

The Learning Theater is the central product experience.

Route:

```text
/app/theater/:sessionId
```

The Theater should behave like a dedicated learning environment rather than a normal webpage.

Its structure is approximately:

```text
┌──────────────────────────────────────────────┐
│ Lesson context / controls                    │
├──────────────────────────────────────────────┤
│                                              │
│                                              │
│              VISUAL LESSON STAGE             │
│                                              │
│        diagrams / animations / scenes        │
│        formulas / simulations / code         │
│                                              │
│                            ┌────────────┐    │
│                            │ AI TUTOR   │    │
│                            │            │    │
│                            └────────────┘    │
│                                              │
├──────────────────────────────────────────────┤
│ lesson progression / interaction state       │
├──────────────────────────────────────────────┤
│ voice / microphone / captions / controls     │
└──────────────────────────────────────────────┘
```

The visual lesson stage is the dominant area.

The AI tutor should remain visually important but subordinate to the teaching visualization.

---

# 14. THEATER PRE-SESSION STATE

Before the lesson begins, the student should be able to configure important preferences.

Examples:

```text
Start your lesson

Topic
Subject
Resource

Tutor voice
[ Voice A ▼ ]

Narration speed
[ 1.0x ]

Language
[ English ▼ ]

Captions
[ Off / On ]

Learning mode
[ Interactive ]
```

Only relevant controls should be exposed.

Advanced settings should be progressively disclosed.

The pre-session screen should feel calm and intentional rather than like a technical configuration panel.

---

# 15. THEATER ACTIVE SESSION

Once the session begins, the student should have access to controls such as:

```text
Pause
Stop
Microphone
Captions
Replay
Explain differently
Voice
Speed
Lumo AI / Doubt Solver
```

Controls should remain visually subordinate to the lesson.

The student must never feel that they are operating a complicated media-production application.

---

# 16. IN-LESSON QUESTIONS

Questions generated during a lesson should not simply appear underneath the video.

When Lumo decides that the student should answer something, the Learning Theater should transition from:

```text
Teaching Mode
```

to:

```text
Interactive Mode
```

The main visual stage itself becomes the interaction surface.

Example:

```text
┌────────────────────────────────────────────┐
│                                            │
│             QUESTION                      │
│                                            │
│   What happens to current when             │
│   resistance increases?                    │
│                                            │
│   ┌────────────┐ ┌────────────┐            │
│   │ Increases  │ │ Decreases  │            │
│   └────────────┘ └────────────┘            │
│                                            │
└────────────────────────────────────────────┘
```

The visual lesson should transform into the appropriate interaction rather than forcing the student to look somewhere else.

---

# 17. QUESTION TYPES

The Theater and Assessment systems should support the existing question capabilities:

### Multiple Choice

```text
MCQ
```

### Short Answer

```text
Short textual response
```

### Long Answer

```text
Structured written response
```

### Numerical

```text
Numerical input
```

### Handwritten / Image Response

For selected heavy-weight numerical or written questions, the student may be asked to solve on paper and submit an image.

The system can then evaluate the uploaded answer.

This mode is particularly useful for:

- Mathematics
- Physics
- Chemistry
- Board-style preparation
- Numerical problem solving
- Handwritten answer practice

The UI should clearly explain what the student is expected to submit.

---

# 18. LUMO AI ROUTE

Route:

```text
/app/ai
```

Lumo AI is a focused AI assistant.

It should resemble a modern compact AI interface rather than an educational dashboard.

Core interface:

```text
┌─────────────────────────────────────────┐
│ Lumo AI                                 │
│                                         │
│ Context: Newton's Laws                  │
│                                         │
│  How can I help?                        │
│                                         │
│                                         │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Ask Lumo anything...                │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Model: Lumo Fast ▼                      │
└─────────────────────────────────────────┘
```

---

# 19. CONTEXT-AWARE LUMO AI

When launched from the Theater, Lumo AI should inherit relevant session context.

Example:

Student is learning:

```text
Physics
Newton's Laws
Current concept: Inertia
```

The student opens Lumo AI and asks:

> "Why does the passenger move forward when the bus stops?"

Lumo should understand the current lesson context without requiring the student to repeat it.

The contextual assistant should therefore be connected to:

- Current subject
- Current concept
- Recent lesson turns
- Relevant document context
- Active assessment context where appropriate

Context should remain compact and relevant.

---

# 20. LUMO AI MODEL SELECTOR

The Lumo AI interface may expose simplified model tiers.

Recommended conceptual naming:

```text
Lumo Fast
Lumo Light
Lumo Pro
```

These names represent experience tiers rather than exposing provider/model implementation details.

For example:

```text
Lumo Fast
Fast responses for everyday questions.

Lumo Light
Balanced speed and reasoning.

Lumo Pro
Deeper reasoning for complex questions.
```

The actual provider/model mapping remains an implementation detail.

The user should not see:

```text
Gemini
Groq
API Key 4
Fallback Provider
Model ID
```

unless a developer/debug interface is explicitly being used.

---

# 21. ASSESSMENT ARCHITECTURE

Route:

```text
/app/assessment
```

Assessment is a dedicated first-class experience.

It exists because a student may want to:

- Take a mock test
- Practice a topic
- Test understanding
- Prepare for an examination
- Identify weak concepts

without entering a full teaching session.

---

# 22. ASSESSMENT ENTRY FLOW

Assessment should use progressive disclosure.

Instead of showing a huge configuration form:

```text
Subject
Topic
Document
Question count
Difficulty
Question types
Mode
Time
...
```

use a guided sequence.

Example:

```text
Let's build your practice session.

What are we practicing?

[ Physics ]

Topic?

[ Electricity ]

Use a resource?

[ NCERT Physics ▼ ]
[ Upload document ]

How do you want to practice?

[ Quick Practice ]
[ Mock Test ]
[ Deep Practice ]

Challenge

[ Easy ] [ Medium ] [ Hard ]

[ Start practice ]
```

---

# 23. ASSESSMENT + DOCUMENTS

Assessment should support the same document strategy as Theater.

The student can:

```text
Select an existing document
OR
Upload a new document
OR
Practice without a document
```

Example:

```text
Source material

[ My Physics Notes ▼ ]

Upload new document
```

The student should never be forced into a separate document-management workflow.

---

# 24. ASSESSMENT SESSION

Route:

```text
/app/assessment/:sessionId
```

The assessment interface should focus on:

```text
Question
Answer
Progress
Feedback
Navigation
```

The visual design should remain consistent with Lumo while being more practice-oriented than the Theater.

The system should support adaptive behavior.

For example:

```text
Student struggles with:
Resistance

↓
Assessment identifies weakness

↓
Lumo adapts

↓
Provides clarification / easier question

↓
Re-evaluates understanding
```

---

# 25. POST-ASSESSMENT EXPERIENCE

The result page should not merely display:

```text
Score: 78%
```

Instead it should answer:

```text
What did I understand?

What am I struggling with?

What should I learn next?
```

Example:

```text
Your practice session

Strong
✓ Voltage
✓ Current

Needs practice
◐ Resistance
◐ Circuit analysis

Lumo recommends:

"Let's strengthen resistance before moving on."

[ Learn this with Lumo ]
```

The result should naturally connect back to the learning loop.

---

# 26. AUTHENTICATION ARCHITECTURE

Public:

```text
/
```

User chooses:

```text
Sign In
Sign Up
```

↓

Authentication

↓

Authenticated application:

```text
/app
```

Recommended flow:

```text
Landing
   ↓
Sign Up / Sign In
   ↓
Authentication
   ↓
Learning Home
   ↓
Learn / Practice / Lumo AI
```

If an unauthenticated user attempts to access:

```text
/app/*
```

they should be redirected to authentication.

---

# 27. AUTH PAGE PHILOSOPHY

Authentication should be extremely simple.

No excessive educational graphics.

No feature grid.

No giant marketing copy.

No unnecessary onboarding questionnaire.

Example:

```text
Lumo

Learn anything. Your way.

Email
[                       ]

Password
[                       ]

[ Continue ]

──────── or ────────

[ Continue with Google ]

Don't have an account?
Create one
```

The product experience begins after authentication.

---

# 28. LANDING PAGE ARCHITECTURE

The landing page is not a product dashboard.

Its job is to communicate Lumo's value immediately.

Recommended hierarchy:

```text
Navigation

Hero
    ↓
Product demonstration
    ↓
How Lumo teaches
    ↓
Visual intelligence
    ↓
Adaptive learning
    ↓
Subject examples
    ↓
Call to action
```

The landing page should use substantial negative space.

The first viewport should NOT contain a competition of:

- Cards
- Statistics
- Testimonials
- Feature badges
- Floating elements
- Gradients
- Multiple CTAs
- Excessive animations

The primary message and product demonstration should dominate.

---

# 29. TARGET DEMO ARCHITECTURE

The hackathon does not require every possible subject or visual capability to be fully implemented.

Therefore the product architecture must distinguish between:

```text
PRODUCT SYSTEM
```

and:

```text
TARGET DEMO CAPABILITIES
```

The target demo should showcase representative high-quality experiences across subjects.

Priority examples include:

### Biology

Interactive cell visualization / simulation.

### Physics

Force, motion, electricity or another visually demonstrable concept.

### Chemistry

Molecular / reaction / structure visualization.

### Mathematics

Dynamic equation or geometry visualization.

### Astronomy

Solar system / celestial visualization.

### Programming

Code → execution → output / architecture visualization.

### History / Geography

Timeline, map or environmental visualization.

The architecture should allow these experiences to expand later without requiring separate product pages for every subject.

---

# 30. SUBJECT EXPERIENCE MODEL

Subjects should NOT become separate routes.

Avoid:

```text
/physics
/chemistry
/biology
/maths
/coding
/history
```

Instead:

```text
/app/theater/:sessionId
```

The same Theater adapts its visual language and teaching strategy according to the subject.

For example:

```text
Physics
→ force diagrams
→ simulations
→ vectors
→ motion

Biology
→ cell models
→ anatomical diagrams
→ biological processes

Chemistry
→ molecules
→ reactions
→ structures

Programming
→ code
→ execution
→ architecture
→ data flow

Astronomy
→ 3D celestial scenes
→ orbital relationships
→ spatial visualization
```

This keeps Lumo unified while allowing rich subject-specific experiences.

---

# 31. VISUAL ENGINE ARCHITECTURE

Visual generation should remain an underlying capability rather than a separate student-facing page.

The system may internally select:

```text
2D illustration
3D visualization
React Three Fiber / Three.js
Remotion animation
Interactive simulation
Diagram
Timeline
Map
Code visualization
Environmental scene
```

based on the lesson plan and subject.

The student should simply experience:

> "Lumo is showing me."

They should not need to understand which rendering technology produced it.

---

# 32. PAGE OWNERSHIP

Each major capability has one primary home.

| Capability                   | Primary Location     |
| ---------------------------- | -------------------- |
| Product introduction         | Landing              |
| Authentication               | Auth                 |
| Continue learning            | Home                 |
| Start lesson                 | Home / Learn         |
| AI teaching                  | Theater              |
| Voice interaction            | Theater              |
| Lesson visuals               | Theater              |
| Interactive lesson questions | Theater              |
| Replay                       | Theater              |
| Explain differently          | Theater              |
| Real-time interruption       | Theater              |
| Doubt solving                | Lumo AI              |
| General AI questions         | Lumo AI              |
| Mock tests                   | Assessment           |
| Topic practice               | Assessment           |
| Handwritten evaluation       | Assessment           |
| Document selection           | Theater / Assessment |
| Document upload              | Theater / Assessment |
| Document reuse               | Theater / Assessment |
| Detailed analytics           | Future / Secondary   |
| Profile / settings           | Secondary            |

This prevents feature duplication.

---

# 33. CROSS-PAGE TRANSITIONS

Lumo should encourage movement between learning modes.

Examples:

### Home → Theater

```text
Continue learning
        ↓
Theater
```

### Home → Assessment

```text
Practice
        ↓
Assessment
```

### Theater → Lumo AI

```text
Student has a doubt
        ↓
Lumo AI
        ↓
Return to Theater
```

### Assessment → Theater

```text
Weak concept detected
        ↓
Learn this concept
        ↓
Theater
```

### Assessment → Lumo AI

```text
Need clarification
        ↓
Lumo AI
```

These transitions should preserve relevant context.

---

# 34. STATE PRESERVATION

When moving between experiences, Lumo should preserve relevant state.

For example:

```text
Theater
    ↓
Lumo AI
    ↓
Return
```

The active lesson should remain intact.

Likewise:

```text
Assessment
    ↓
Lumo AI
    ↓
Return
```

The current question and assessment state should remain intact.

The user should never feel that they "left" the lesson merely because they opened a supporting tool.

---

# 35. MOBILE / RESPONSIVE ARCHITECTURE

The route architecture remains identical across devices.

Only the presentation changes.

Desktop:

```text
Sidebar / top navigation
        ↓
Large Theater stage
```

Tablet:

```text
Compact navigation
        ↓
Reduced Theater stage
```

Mobile:

```text
Compact header
        ↓
Vertical lesson stage
        ↓
Tutor
        ↓
Controls
```

The Theater must remain usable on smaller screens, but desktop is the primary target for the hackathon demonstration.

---

# 36. PRIMARY USER JOURNEY

The ideal first-time user journey is:

```text
Landing
   ↓
"Start learning"
   ↓
Sign Up / Sign In
   ↓
Learning Home
   ↓
Choose topic
   ↓
Optional document selection/upload
   ↓
Configure lesson preferences
   ↓
Learning Theater
   ↓
AI teaches
   ↓
Visual explanation
   ↓
Student interaction
   ↓
Question
   ↓
Feedback
   ↓
Adaptive explanation
   ↓
Mastery
```

This is the core Lumo experience.

---

# 37. RETURNING USER JOURNEY

A returning student should have an even shorter path:

```text
Sign In
   ↓
Home
   ↓
Continue learning
   ↓
Theater
```

or:

```text
Home
   ↓
Practice
   ↓
Assessment
```

or:

```text
Home
   ↓
Lumo AI
```

The product should minimize unnecessary setup for returning users.

---

# 38. DESIGN PRIORITY BY PAGE

Implementation and design effort should be allocated approximately as follows:

### 1. Learning Theater

**Highest priority**

This is the flagship.

It deserves the most detailed design, interaction choreography, visual work and testing.

---

### 2. Landing

**High priority**

This creates the first impression and demonstrates the product.

---

### 3. Assessment

**High priority**

This is the second major interactive learning environment and a strong demonstration of adaptive intelligence.

---

### 4. Lumo AI

**Medium-high priority**

It should feel polished, modern and context-aware but does not require the complexity of the Theater.

---

### 5. Learning Home

**Medium priority**

Keep it useful and elegant, but intentionally lightweight.

---

### 6. Authentication

**Low complexity**

Polished but simple.

---

# 39. WHAT SHOULD NOT BECOME A PAGE

The following should generally remain capabilities/components rather than independent pages:

```text
Voice settings
Caption settings
Tutor controls
Visual generation
Replay
Explain differently
Document upload
Model selection
Lesson planning
RAG retrieval
AI reasoning
Visual strategy
Turn management
Teacher engine
Assessment engine
```

These belong inside their relevant experiences.

---

# 40. ANTI-PATTERNS

Lumo should avoid:

### Feature fragmentation

Creating a page for every technical capability.

### Dashboard bloat

Turning Home into an analytics control center.

### Document isolation

Forcing students to manage documents before learning.

### Chat-first architecture

Making Lumo look like ChatGPT with educational branding.

### Video-first architecture

Reducing the Theater to an AI avatar sitting beside a video.

### Configuration overload

Showing every possible setting before a lesson.

### Subject fragmentation

Creating completely separate product experiences for every subject.

### Technical leakage

Showing users model names, providers, RAG terminology, API concepts or internal architecture.

---

# 41. THE ARCHITECTURAL NORTH STAR

The entire product should feel like one coherent system.

The student should be able to move naturally between:

```text
LEARN
  ↓
ASK
  ↓
PRACTICE
  ↓
UNDERSTAND
  ↓
LEARN MORE
```

without feeling like they are switching applications.

The visual language remains consistent.

The AI context remains connected.

The user's learning state remains persistent.

The major experiences are:

```text
HOME
  ↓
THEATER
  ↓
ASSESSMENT
  ↕
LUMO AI
```

---

# 42. FINAL PAGE MAP

The current Lumo MVP should therefore be considered:

```text
PUBLIC
│
├── /
│   └── Landing
│
├── /signin
│   └── Sign In
│
└── /signup
    └── Sign Up


AUTHENTICATED
│
└── /app
    │
    ├── /app
    │   └── Learning Home
    │
    ├── /app/learn
    │   └── Learning Entry
    │
    ├── /app/theater/:sessionId
    │   └── Learning Theater
    │
    ├── /app/assessment
    │   └── Assessment Hub
    │
    ├── /app/assessment/:sessionId
    │   └── Active Assessment
    │
    └── /app/ai
        └── Lumo AI
```

Future / secondary:

```text
/app/documents
/app/progress
/app/settings
```

These should not be allowed to expand the MVP unnecessarily.

---

# 43. FINAL PRINCIPLE

Lumo's architecture must reflect its central promise:

> **Lumo is a place where learning happens, not a collection of educational tools.**

The student should never need to understand the underlying architecture.

They should simply be able to:

> **Choose something → Learn it → Ask questions → Interact → Practice → Improve.**

The complexity belongs inside Lumo.

The experience presented to the student should remain:

**clear, calm, intelligent and effortless.**

```

```
