# AI TEACHER — DECISION & ARCHITECTURE LOCK

### Hackathon 2026 — Architecture v1.0

**Status:** Pre-Implementation Lock
**Development Constraint:** ₹0 budget
**Development Model:** Solo developer + AI engineering assistants
**Primary Implementation Agent:** Antigravity
**Architecture & Product Planning:** Achyut + ChatGPT

---

# 1. PURPOSE OF THIS DOCUMENT

This document establishes the current architectural and product decisions for the AI Teacher hackathon project.

It serves as the **source of truth before implementation begins**.

The purpose is to:

- prevent unnecessary feature expansion;
- establish the core system architecture;
- identify the hardest technical components;
- define the order in which they will be implemented;
- establish technology choices and fallback strategies;
- give Antigravity clear implementation boundaries;
- ensure the project remains feasible within a **5-day development window and ₹0 budget**.

Technology choices that have not yet been experimentally validated are explicitly marked as **POC Required** rather than being treated as guaranteed.

---

# 2. PROBLEM WE ARE SOLVING

The challenge requires an AI Teacher that goes beyond conventional chatbot behavior.

The system must be able to understand educational material or a topic, plan a lesson, teach progressively, interact with the learner, evaluate understanding, identify misconceptions, adapt its teaching strategy, and provide personalized feedback.

The challenge explicitly describes the desired teaching loop as:

**Understand → Plan → Explain → Demonstrate → Question → Evaluate → Adapt → Continue.**

It also explicitly states that a basic question-answer chatbot is not considered a complete solution.

The final product therefore must be designed around the concept of a **teacher**, not a chatbot.

---

# 3. WINNING PRODUCT PRINCIPLE

Our product should demonstrate one coherent experience:

> **The AI understands the learner, plans what to teach, teaches through a visual lesson, interacts with the learner, detects when understanding breaks, changes its teaching strategy, and remembers the resulting learning state.**

We will prioritize **depth of teaching intelligence over the number of features**.

A smaller system that visibly demonstrates genuine adaptation is preferable to a large system containing many shallow features.

This aligns directly with the judging emphasis: **Human-Like Teaching and Adaptation carries the highest weight at 20%, followed by AI/ML, RAG, and AI Teaching Video Generation at 15% each.**

---

# 4. FINAL SYSTEM ARCHITECTURE

The system is divided into three major systems.

## SYSTEM A — TEACHER BRAIN

Responsible for:

- knowledge retrieval;
- learner understanding;
- lesson planning;
- teaching decisions;
- question generation;
- response evaluation;
- misconception detection;
- adaptive teaching;
- assessment;
- learning-state updates.

## SYSTEM B — TEACHING VIDEO ENGINE

Responsible for:

- converting an AI-generated lesson specification into scenes;
- generating/assembling narration;
- displaying diagrams, equations, text and other visuals;
- inserting teacher/avatar segments;
- composing everything into a final teaching video.

## SYSTEM C — LIVE INTERACTION ENGINE

Responsible for:

- microphone input;
- speech-to-text;
- real-time conversational interaction;
- passing student responses to the Teacher Brain;
- receiving adaptive teacher responses;
- text-to-speech and audio playback.

The three systems share the same **Teacher Brain and Student State** rather than behaving as independent applications.

---

# 5. SYSTEM A — TEACHER BRAIN

## 5.1 Knowledge Engine

The system must support:

- uploaded educational material;
- direct topic-based teaching.

The challenge explicitly supports books, textbooks, PDFs, notes, DOC/DOCX, PPT/PPTX, research papers and other educational resources.

The knowledge pipeline will conceptually be:

**Material → Parsing → Chunking → Embeddings → Retrieval → Grounded Context → Teacher Brain**

RAG will be used to reduce unsupported answers and ground teaching in uploaded material.

### Decision

**RAG is a core feature, not an optional enhancement.**

---

# 5.2 Student Model

The Teacher Brain maintains structured learner state.

The state should eventually contain information such as:

- educational level;
- existing knowledge;
- learning objective;
- preferred teaching style;
- preferred language;
- available time;
- topics studied;
- strong concepts;
- weak concepts;
- misconceptions;
- assessment history;
- learning progress;
- current learning path.

The challenge specifically encourages maintaining a student learning profile and using it to personalize future sessions.

---

# 5.3 Lesson Planner

The planner receives:

**Topic/material + learner profile + learning objective + available time + language + desired depth**

and produces a structured lesson.

The planner determines:

1. what should be taught;
2. what should be taught first;
3. how deeply concepts should be explained;
4. what examples/visuals should be used;
5. when the learner should be questioned;
6. where assessment should occur;
7. what should happen if the learner struggles.

This directly reflects the challenge requirements.

---

# 5.4 Adaptive Teacher

This is the most important intelligence component.

The Teacher Brain must not simply determine:

**Correct / Incorrect**

It should determine:

**What does the student's response tell us about their understanding, and what should the teacher do next?**

Possible actions:

- continue;
- simplify;
- explain again;
- use an analogy;
- provide another example;
- show a visual;
- change difficulty;
- ask another question;
- practice the concept;
- reassess;
- move to the next concept.

The challenge specifically gives misconception detection and alternative explanations as examples of advanced adaptive behavior.

---

# 5.5 Assessment Engine

The Teacher Brain can generate:

- conceptual questions;
- MCQs;
- short-answer questions;
- practical problems;
- application questions;
- teach-back questions.

After a lesson it should produce:

- score;
- concepts understood;
- weak areas;
- incorrect concepts;
- recommended revision;
- suggested next topic.

This directly matches the challenge's assessment and feedback requirements.

---

# 6. SYSTEM B — TEACHING VIDEO ENGINE

## 6.1 Core Architectural Decision

**We will NOT generate an entire AI video from scratch.**

Instead:

> **AI plans the lesson. React/Remotion deterministically renders the lesson.**

The AI acts as the **lesson director**.

The renderer acts as the **production engine**.

---

# 6.2 LessonPlan as the Core Contract

The Teacher Brain produces a structured `LessonPlan`.

Conceptually:

```text
LessonPlan
│
├── metadata
├── learner profile
├── learning objectives
├── concepts
├── scenes[]
├── questions[]
├── assessments[]
└── adaptation rules
```

Each scene may contain:

```text
Scene
│
├── id
├── type
├── duration
├── objective
├── narration/script
├── visual specification
├── avatar requirement
├── interaction point
└── transition
```

The exact schema will be finalized during the Technical Architecture phase.

---

# 6.3 Scene-Based Generation

A lesson might become:

```text
Scene 1
Teacher introduction
        ↓
Scene 2
Diagram / visual explanation
        ↓
Scene 3
Equation / formula animation
        ↓
Scene 4
Worked example
        ↓
Scene 5
Teacher explanation
        ↓
Scene 6
Question
        ↓
Scene 7
Assessment
```

The planner decides **what appears, when it appears and why**.

---

# 6.4 Subject-Aware Visuals

The challenge specifically expects subject-aware visual explanations, including:

**Mathematics**

- equations;
- graphs;
- step-by-step solutions.

**Physics**

- diagrams;
- formulas;
- processes;
- simulations.

**Biology**

- labelled diagrams;
- biological processes;
- structures.

**History**

- timelines;
- maps;
- events.

**Programming**

- code;
- output;
- execution flow;
- architecture diagrams.

Therefore the LessonPlan will contain a structured visual specification rather than simply requesting "make the video look good."

---

# 6.5 Remotion

Remotion + React will be responsible for assembling:

- avatar segments;
- narration;
- diagrams;
- equations;
- text;
- images;
- animations;
- transitions;
- timing.

Conceptually:

**LessonPlan → Scene Renderer → React Components → Remotion Timeline → Final Video**

### Decision

**Remotion is the chosen video composition engine.**

---

# 6.6 Avatar Strategy

The avatar is **not realtime**.

Avatar generation will be treated as a pre-generated media asset.

The system may generate a teacher segment such as:

**Script → TTS audio → Avatar/lip-sync generation → Video segment**

That segment is then inserted into the Remotion timeline.

This prevents expensive/slow avatar generation from becoming part of the realtime interaction loop.

### Current candidate

**MuseTalk**

### Status

**POC Required.**

It is not a guaranteed dependency until quality, generation time and deployment feasibility are tested.

---

# 7. SYSTEM C — LIVE INTERACTION ENGINE

The interactive teacher will use:

**Student speech → STT → Teacher Brain → TTS → Student**

The challenge explicitly requires student questioning, response evaluation, follow-up questions and adaptive responses.

---

# 7.1 Speech-to-Text

### Current decision

**Groq Whisper**

The heavy speech-recognition computation should remain cloud-based rather than running locally.

This protects the development machine and avoids adding a large local model dependency.

---

# 7.2 Realtime Transport

### Current candidate

**Pipecat + SmallWebRTC**

Pipecat is currently the leading candidate for realtime voice infrastructure.

However, its server-side Python requirement means it is an exception to our TypeScript-first architecture.

### Rule

Python may be introduced as a **specialized voice worker**, not as the main backend.

### Status

**POC Required.**

If deployment/integration becomes disproportionately difficult during the POC, Pipecat will be reconsidered rather than allowed to consume the hackathon schedule.

---

# 7.3 Text-to-Speech

### Current preferred engine

**Kokoro-82M**

Important architectural decision:

> **Kokoro is a preferred TTS engine, not a required Render-hosted service.**

We will first investigate browser execution through available WebAssembly/WebGPU/Transformers-based implementations.

This avoids the Render Free memory constraint.

---

# 7.4 TTS Fallback

If browser Kokoro proves unreliable, we will evaluate a genuinely free alternative.

As an emergency demo fallback, browser-native speech synthesis may be used.

The product should not completely fail merely because the preferred TTS engine becomes unavailable.

---

# 8. AI PROVIDER LAYER

Only two AI providers are permitted in the core architecture.

```text
AIProvider
│
├── Gemini — Primary
│
└── Groq — Fallback
```

### Gemini

Primary intelligence provider for:

- lesson planning;
- reasoning;
- structured lesson generation;
- evaluation;
- adaptation;
- grounded teaching.

### Groq

Fallback provider and infrastructure for fast tasks such as:

- fallback LLM inference;
- Whisper STT.

### Explicit decision

We will **not** add Mistral, Cohere or additional providers unless a specific technical blocker makes one necessary.

This prevents provider sprawl and simplifies implementation.

---

# 9. STRUCTURED AI OUTPUT

Gemini's structured output capability will be used wherever possible.

The Teacher Brain should produce validated structured objects rather than relying on free-form model output.

Conceptually:

**Gemini → Structured LessonPlan → Zod validation → Application**

This allows the AI layer and rendering layer to remain cleanly separated.

---

# 10. ORCHESTRATION

### Decision

**LangGraph.js**

LangGraph.js will orchestrate the Teacher Brain.

The intended adaptive flow is:

```text
START
  ↓
Understand Request
  ↓
Retrieve Knowledge
  ↓
Understand Student
  ↓
Plan Lesson
  ↓
Teach
  ↓
Question
  ↓
Evaluate
  ↓
Diagnose
  ↓
 ┌─────────────────┐
 │                 │
Understood      Struggling
 │                 │
 ↓                 ↓
Continue       Change Strategy
 │                 │
 │              Reteach
 │                 │
 └───────→ Reassess
             ↓
         Continue
```

The graph should maintain explicit state rather than treating every interaction as an isolated chatbot request.

---

# 11. MAIN TECHNOLOGY STACK

## Frontend

**React + TypeScript**

Deployment:

**Vercel**

---

## Backend

**Node.js + Express + TypeScript**

Deployment:

**Render Free**

---

## Authentication

**Firebase Authentication**

---

## Database

**MongoDB Atlas**

---

## AI

**Gemini — Primary**

**Groq — Fallback**

---

## Orchestration

**LangGraph.js**

---

## Validation

**Zod**

---

## RAG

**RAG pipeline — implementation choice to be finalized during POC**

MongoDB Vector Search will be investigated before introducing a separate vector database.

---

## STT

**Groq Whisper**

---

## TTS

**Kokoro-82M — first choice**

Browser execution to be tested.

---

## Realtime Voice

**Pipecat + SmallWebRTC — candidate**

---

## Video

**React + Remotion**

---

## Avatar

**MuseTalk — candidate**

Pre-generated segments only.

---

# 12. PYTHON POLICY

Python is **not** part of the main application architecture.

Main application:

**React/TypeScript + Node/TypeScript**

Python may be introduced only when a specialist open-source component provides substantial value and cannot reasonably be replaced.

Potential Python-only specialist workers:

- Pipecat server;
- Docling document ingestion;
- avatar generation.

### Rule

> **TypeScript by default. Python by necessity.**

Python must not become a second full backend unless there is a compelling technical reason.

---

# 13. DATABASE STRATEGY

MongoDB is the primary persistent data store.

Expected high-level collections:

```text
users
student_profiles
documents
document_chunks
lessons
learning_sessions
concept_mastery
assessments
learning_history
```

The exact schema will be finalized later.

We will avoid introducing multiple databases unless a concrete requirement appears.

---

# 14. DEPLOYMENT STRATEGY

## Frontend

```text
React + TypeScript
        ↓
      Vercel
```

## Main Backend

```text
Node + Express + TypeScript
        ↓
      Render
```

## Database

```text
MongoDB Atlas
```

## Authentication

```text
Firebase
```

## Voice

```text
Browser
   ↕
Realtime transport
   ↕
Voice service
```

The exact voice deployment architecture will be determined after the Pipecat POC.

---

# 15. ₹0 BUDGET POLICY

The project will be developed and demonstrated with a **zero-rupee budget**.

No paid services should become required dependencies.

Preferred infrastructure:

- Vercel free tier;
- Render free tier;
- MongoDB Atlas free tier;
- Firebase free tier;
- Gemini available free usage;
- Groq available free usage;
- open-source models/tools;
- browser-side inference where practical.

Free-tier limits must be treated as engineering constraints.

The architecture should avoid placing heavy models on Render Free.

---

# 16. LAPTOP / LOCAL COMPUTATION POLICY

The development laptop must not be treated as production infrastructure.

The available RTX 3050 may be used for controlled experiments if necessary, but:

- heavy local inference should not become a dependency;
- realtime inference should not depend on the laptop;
- large models should not be required for the deployed prototype;
- the laptop should not be continuously stressed during development.

The goal is:

> **Cloud APIs + browser computation + lightweight backend + specialized workers only where necessary.**

---

# 17. FEATURE PRIORITY

## TIER 1 — MUST WORK

These are essential to the submission:

1. Topic-based teaching.
2. Uploaded-material learning.
3. RAG/knowledge grounding.
4. AI-generated lesson structure.
5. Personalized teaching.
6. Time-aware lesson planning.
7. AI teaching video.
8. AI voice.
9. Human-like avatar.
10. Multilingual capability.
11. Questions during teaching.
12. Response evaluation.
13. Adaptive teaching.
14. Final assessment.
15. Personalized learning feedback.
16. Working prototype.

These align with the challenge's mandatory requirements.

---

# 18. TIER 2 — OUR DIFFERENTIATORS

Rather than trying to implement every advanced feature, we prioritize a small number of meaningful differentiators.

## 18.1 Misconception Detection

Instead of:

**Wrong → show correct answer**

we aim for:

**Wrong → identify misunderstanding → change explanation → reassess**

---

## 18.2 Adaptive Teaching Strategy

The AI should be able to change:

- explanation complexity;
- analogy;
- example;
- visual;
- difficulty;
- questioning style.

---

## 18.3 AI-Directed Visual Lessons

The AI does not merely generate a script.

It determines:

**what should be shown + when it should be shown + why it should be shown.**

---

## 18.4 Shared Student State

The video teacher and realtime teacher should operate using the same student state.

Therefore the system can eventually know:

> "The student struggled with resistance during the video."

and use that information during the interactive session.

---

# 19. TIER 3 — OPTIONAL

Only after the core system works:

- teach-back mode;
- learning analytics;
- revision mode;
- flashcards;
- concept maps;
- personalized homework;
- exam mode;
- study planner;
- multiple teacher personalities;
- emotion-aware interaction.

The challenge lists these as advanced features rather than mandatory requirements.

They must never compromise the core teaching loop.

---

# 20. SIX-PHASE IMPLEMENTATION STRATEGY

The project will be developed in six phases.

---

## PHASE 1 — TEACHER BRAIN

Build and validate:

- Gemini;
- Groq fallback;
- LangGraph.js;
- Zod;
- StudentState;
- LessonPlan;
- RAG;
- lesson planning;
- assessment logic;
- adaptive decision logic.

### Exit condition

Given a topic/material and learner profile, the system produces a valid structured lesson plan.

---

## PHASE 2 — VIDEO ENGINE

Build:

- LessonPlan → scenes;
- React visual components;
- Remotion timeline;
- narration;
- diagrams;
- equations;
- text;
- transitions.

Start with a hardcoded LessonPlan.

Then connect the real AI-generated LessonPlan.

### Exit condition

The system automatically produces a polished teaching video from structured lesson data.

---

## PHASE 3 — VOICE ENGINE

Build:

- microphone input;
- STT;
- TTS;
- realtime transport;
- conversational response.

Initially ignore sophisticated adaptation.

### Exit condition

Student can speak and receive a spoken AI teacher response.

---

## PHASE 4 — ADAPTIVE TEACHER

Connect:

**Voice → Teacher Brain → Student State**

Implement:

- response evaluation;
- misconception detection;
- adaptive decisions;
- alternative explanations;
- retesting;
- mastery updates.

### Exit condition

A visible student mistake causes a demonstrably different teaching response.

---

## PHASE 5 — AVATAR + POLISH

Integrate:

- avatar;
- TTS;
- scene assets;
- visual polish;
- transitions;
- timing;
- teaching presentation.

### Exit condition

The lesson looks and feels like an actual AI-led teaching session rather than a generated slideshow.

---

## PHASE 6 — PRODUCT WRAPPING

Only after the hard components work:

- Firebase Auth;
- MongoDB persistence;
- complete React UI;
- upload interface;
- student profile;
- lesson history;
- progress dashboard;
- error handling;
- deployment;
- final integration.

### Exit condition

All validated components operate together as one coherent product.

---

# 21. WHY THE IMPLEMENTATION ORDER IS DELIBERATE

The project will **not** begin by building the entire MERN application.

The difficult components are:

- Teacher Brain;
- RAG;
- adaptive reasoning;
- structured lesson generation;
- Remotion video generation;
- realtime voice;
- avatar generation.

These must be de-risked first.

The conventional application layer:

- React pages;
- Express APIs;
- MongoDB persistence;
- Firebase;
- dashboards;

will be integrated afterward because these technologies are already familiar and comparatively low-risk.

The objective is to avoid reaching Day 4 with a beautiful UI surrounding components that do not actually work.

---

# 22. PROOF-OF-CONCEPT GATES

Before full implementation, three major POCs must be completed.

## POC 1 — Kokoro

Test:

- browser execution;
- model loading;
- English;
- Hindi;
- Hinglish;
- latency;
- memory usage;
- Chrome compatibility.

### Decision

If reliable → browser Kokoro becomes preferred TTS.

If unreliable → select a free fallback.

---

## POC 2 — Realtime Voice

Test:

**Browser → realtime transport → STT → Teacher Brain → TTS → Browser**

Measure:

- latency;
- interruption behavior;
- deployment;
- free-tier feasibility;
- reliability.

### Decision

If Pipecat is practical → retain.

If integration becomes disproportionately expensive → simplify the voice architecture.

---

## POC 3 — LessonPlan → Remotion

Test:

**Gemini → structured LessonPlan → Zod → Remotion → MP4**

The test lesson should contain:

- teacher scene;
- diagram;
- equation;
- example;
- narration;
- question.

### Decision

If successful, the core video architecture is validated.

---

# 23. CRITICAL RISKS

## Risk 1 — Realtime Voice Deployment

**Severity: High**

Mitigation:

- POC early;
- keep voice architecture isolated;
- allow simplified fallback.

---

## Risk 2 — TTS Hosting

**Severity: Medium**

Mitigation:

- do not host Kokoro on Render Free;
- test browser execution first;
- maintain fallback TTS.

---

## Risk 3 — Avatar Generation

**Severity: Medium**

Mitigation:

- pre-generate avatar segments;
- never place avatar generation inside realtime interaction;
- use only a few polished segments for the demo.

---

## Risk 4 — Scope Explosion

**Severity: Critical**

Mitigation:

> No optional feature is allowed to delay a Tier 1 feature.

---

## Risk 5 — Integration Failure

**Severity: High**

Mitigation:

Build each difficult component independently before integration.

---

# 24. ARCHITECTURAL RULES FOR ANTIGRAVITY

Antigravity is the primary implementation agent.

It must follow these rules:

### Rule 1

Do not independently change the core architecture.

### Rule 2

Do not introduce a new framework/library merely because it is convenient.

### Rule 3

Prefer existing project technologies and lightweight dependencies.

### Rule 4

Do not add paid APIs/services.

### Rule 5

Do not introduce Python into the main backend.

### Rule 6

Python may be used for an isolated specialist worker when explicitly approved.

### Rule 7

Every major feature must have a clear acceptance criterion.

### Rule 8

Do not build optional features before Tier 1 functionality works.

### Rule 9

Keep AI output structured and validated.

### Rule 10

The Teacher Brain must remain separate from rendering and UI concerns.

---

# 25. SEPARATION OF RESPONSIBILITIES

The architecture should maintain these boundaries:

```text
AI / Teacher Brain
        │
        │ LessonPlan
        ↓
Video Engine
```

and:

```text
Voice Engine
        │
        │ Student Response
        ↓
Teacher Brain
        │
        │ Teacher Decision
        ↓
Voice Engine
```

The AI should not directly manipulate React components.

The video engine should not contain teaching logic.

The voice engine should not independently decide what the student needs to learn.

The Teacher Brain owns teaching decisions.

---

# 26. FINAL PRODUCT FLOW

The complete intended journey is:

```text
STUDENT
   ↓
Topic / Upload Material
   ↓
Learner Profile
   ↓
RAG / Knowledge Processing
   ↓
TEACHER BRAIN
   ↓
Personalized LessonPlan
   ↓
VIDEO ENGINE
   ↓
AI Teaching Video
   ↓
Student Interaction
   ↓
STT
   ↓
TEACHER BRAIN
   ↓
Evaluate Response
   ↓
Detect Misconception
   ↓
Adapt Teaching Strategy
   ↓
Alternative Explanation
   ↓
Re-evaluate
   ↓
Final Assessment
   ↓
Learning Report
   ↓
Student State Updated
   ↓
Recommended Next Learning
```

This matches the challenge's recommended demo journey:

**Upload/Topic → Lesson Planning → AI Teaching Video → Student Interaction → Adaptation → Assessment → Learning Feedback.**

---

# 27. THE DEMO-FIRST PRINCIPLE

The final product should ultimately demonstrate a single powerful teaching story rather than dozens of disconnected features.

The ideal demonstration:

1. Student selects a topic or uploads material.
2. Student specifies level, language and available time.
3. AI analyzes the material.
4. AI creates a lesson plan.
5. AI teaching video begins.
6. Teacher avatar introduces the concept.
7. Visual explanation appears.
8. Formula/diagram/example is shown.
9. Teacher asks a question.
10. Student gives an incorrect response.
11. AI identifies the misconception.
12. AI changes its explanation strategy.
13. New visual/analogy/example appears.
14. Student answers again.
15. AI confirms understanding.
16. Final assessment is conducted.
17. Learning report appears.
18. Student's next recommended learning step is generated.

The judges should be able to **see the adaptation happen**, not merely hear that the system is adaptive.

---

# 28. WHAT IS CURRENTLY LOCKED

## Architecture

- System A: Teacher Brain
- System B: Teaching Video Engine
- System C: Live Interaction Engine

## Core stack

- React
- TypeScript
- Node.js
- Express
- Firebase
- MongoDB
- LangGraph.js
- Zod
- Gemini
- Groq
- Remotion

## Architecture principles

- AI plans; deterministic renderer renders.
- Teacher Brain owns teaching decisions.
- Shared Student State connects video and interaction.
- TypeScript is the default language.
- Python is specialist-only.
- No heavy local inference dependency.
- No paid infrastructure.
- Hard components are built before UI wrapping.
- Optional features cannot delay core functionality.

---

# 29. WHAT IS NOT YET LOCKED

The following require POCs:

- exact RAG parser;
- exact embedding model;
- MongoDB Vector Search implementation;
- browser Kokoro implementation;
- exact TTS fallback;
- Pipecat deployment;
- exact realtime architecture;
- avatar implementation;
- Docling necessity;
- final free-tier deployment configuration.

These are intentionally **not treated as architectural failures or commitments until tested.**

---

# 30. FINAL DEVELOPMENT PHILOSOPHY

This is a five-day solo build.

The project should therefore optimize for:

**Maximum judge-visible intelligence per engineering hour.**

We are not trying to build the largest system.

We are trying to build the most convincing demonstration that the system actually **teaches**.

The core loop is:

> **Understand → Plan → Explain → Demonstrate → Question → Evaluate → Adapt → Continue.**

Everything else exists to support that loop.

---

# 31. WORKING MODEL

## Achyut + ChatGPT

Responsible for:

- product strategy;
- architecture;
- research;
- technology decisions;
- feature prioritization;
- schemas;
- prompts;
- documentation;
- implementation specifications;
- debugging strategy;
- demo strategy.

## Antigravity

Responsible for:

- project implementation;
- code generation;
- integration;
- testing;
- refactoring;
- deployment implementation;
- execution of approved technical specifications.

Major architectural decisions remain outside autonomous implementation.

---

# 32. NEXT STEP

This document is **not the implementation document**.

The next immediate step is:

### POC Phase

1. **Kokoro browser TTS**
2. **Realtime voice / Pipecat**
3. **Gemini → LessonPlan → Remotion**

Once these three gates are passed, the following document will be produced:

> **AI Teacher — Technical Architecture & Implementation Specification v1**

That document will contain the exact:

- repository structure;
- services;
- database schema;
- API contracts;
- LangGraph state;
- Zod schemas;
- RAG pipeline;
- LessonPlan schema;
- scene schema;
- voice interfaces;
- environment variables;
- deployment configuration;
- implementation tasks;
- Antigravity prompts;
- acceptance criteria.

**No full implementation begins until the critical POCs have been validated.**
