<div align="center">
  <img src="client/public/logo/Lumo_Logo.png" alt="Lumo Logo" width="88" />

  <h1>Lumo</h1>

  <p><strong>Adaptive AI Teacher — Not Just Another Chatbot</strong></p>

  <p>
    An intelligent learning platform that plans lessons, teaches interactively with visual & voice guidance, detects misconceptions, and dynamically adapts to how you learn.
  </p>

  <p>
    <a href="https://ai-tutor-client-psi.vercel.app/"><strong>🌐 Live Application</strong></a> •
    <a href="https://drive.google.com/drive/folders/1sBFvXm1T-3GL3e7jdJf1PaP3pAlOgl5X?usp=drive_link"><strong>🎬 Demo Walkthrough</strong></a>
  </p>
</div>

---

## What is Lumo?

**Lumo** is an adaptive, context-aware AI teacher designed for deep conceptual understanding.

Most educational AI tools act as conversational search engines: a learner asks a question, receives a wall of text, skims it, and forgets it within hours. Lumo approaches education from first principles. Rather than generating answers to be passively consumed, Lumo acts as an active educator—building structured mental models through voice dialogue, synchronized visual timelines, interactive thought experiments, and adaptive practice.

---

## Why Lumo?

Traditional conversational bots fail learners in fundamental ways:

| Conversational Chatbots | The Lumo Adaptive Teacher |
| :--- | :--- |
| **Passive Text Dumps**<br>Generates dense walls of text with zero visual scaffolding. | **Multi-Sensory Teaching**<br>Pairs spoken voice narration with synchronized visual boards and timeline stages. |
| **No Retention or Misconception Checks**<br>Assumes prompt delivery equals student mastery. | **Socratic Check-Ins**<br>Probes intuition using targeted questions before advancing to higher concepts. |
| **Static Explanations**<br>Repeats the same logic or tone if the student remains confused. | **Dynamic Pedagogical Calibration**<br>Detects root misconceptions, shifts analogies, and recalibrates teaching difficulty. |
| **Ephemeral Chat Context**<br>Lacks durable memory of learner state, struggles, or document grounding. | **Continuous Knowledge & State**<br>Maintains session memory, vector-grounded notes (RAG), and targeted practice tracking. |

---

## The Learning Loop

Lumo structures every topic through an active pedagogical cycle:

```text
  ┌─────────────────────────────────────────────────────────┐
  │ 1. Learner Context & Objective                          │
  │    Student selects topic or uploads study documents     │
  └────────────────────────────┬────────────────────────────┘
                               ▼
  ┌─────────────────────────────────────────────────────────┐
  │ 2. Pedagogical Lesson Blueprint                         │
  │    Structures concepts, detects pitfalls, plans stages  │
  └────────────────────────────┬────────────────────────────┘
                               ▼
  ┌─────────────────────────────────────────────────────────┐
  │ 3. Multi-Sensory Teaching Stage                         │
  │    Voice dialogue paired with dynamic visual whiteboard │
  └────────────────────────────┬────────────────────────────┘
                               ▼
  ┌─────────────────────────────────────────────────────────┐
  │ 4. Socratic Check-In & Reasoning                        │
  │    Dynamic in-session probes test mental model clarity  │
  └────────────────────────────┬────────────────────────────┘
                               ▼
  ┌─────────────────────────────────────────────────────────┐
  │ 5. Adaptive Re-Calibration                              │
  │    Re-angles explanations upon hesitation or confusion │
  └────────────────────────────┬────────────────────────────┘
                               ▼
  ┌─────────────────────────────────────────────────────────┐
  │ 6. Targeted Assessment & Practice                       │
  │    MCQ, numerical, conceptual & image-solution feedback │
  └─────────────────────────────────────────────────────────┘
```

1. **Context & Ingestion** — Learner sets goals, chooses language preference, or attaches course materials (PDF/text).
2. **Pedagogical Planning** — The Teacher Engine creates a multi-scene blueprint with prerequisites, core analogies, and predicted misconceptions.
3. **Voice & Visual Delivery** — Spoken interaction works in lockstep with stage visuals, diagrams, and timeline checkpoints.
4. **Intuition Probing** — Lumo asks conceptual questions rather than rote multiple-choice quizzes to verify the underlying mental model.
5. **Dynamic Adaptation** — If the learner struggles, the engine shifts analogies, breaks down prerequisite steps, or simplifies the model before moving forward.
6. **Continuous Mastery** — Practice questions, saved session timelines, and document-grounded doubt clearing solidify long-term retention.

---

## Core Capabilities

### 🎓 Adaptive Teaching Engine
- **Misconception Detection**: Diagnostic prompts analyze student reasoning to catch flawed intuitions early.
- **Pedagogical Blueprints**: Lessons are structured systematically into digestible concepts rather than unstructured essays.
- **Contextual Re-explanations**: Automatically alters explanatory depth, pacing, and tone when confusion is detected.

### 🎙️ Live Classroom Experience
- **Voice-Enabled Learning**: Natural spoken interaction with normalized speech synthesis and low-latency audio delivery.
- **Multilingual Support**: Native learning support in **English**, **Hindi**, or conversational **Hinglish**.
- **Interactive Visual Timeline**: Synchronized visual states, key formula highlights, and replayable learning stages.
- **3D Interactive Avatar**: Three.js VRM avatar companion for visual classroom presence.

### ⚡ Context-Aware AI Workspace
- **Three Precision Model Tiers**:
  - `⚡ Fast` (`gemini-3.5-flash-lite`): Ultra-low latency for instant definitions and follow-ups.
  - `◐ Light` (`gemini-3.5-flash-lite`): Balanced speed and pedagogical reasoning for standard study sessions.
  - `✦ Pro` (`gemini-3.7-flash`): Maximum depth for multi-step derivations, complex proofs, and rigorous problem-solving.
- **Durable Session Memory**: Full conversation context and timeline preservation across learning sessions.

### 📚 Knowledge & Document RAG
- **Multi-Format Uploads**: Ingest study guides, lecture notes, and textbook excerpts in PDF or raw text.
- **Deterministic Extraction & Vision Fallback**: Hybrid document extraction using `pdf-parse` with OCR fallback for complex scans.
- **Dense Vector Search**: Powered by **Qdrant** with strict per-user tenant isolation.
- **Cohere Embedding & Rerank**: Batched embeddings (`embed-english-v3.0`) and reranking (`rerank-english-v3.0`) ensure answers remain grounded directly in your syllabus.

### 📝 Assessment & Deep Evaluation
- **Diverse Question Types**: Multiple Choice (MCQ), Short Conceptual, Long Analytical, Numerical, and Image Solution evaluation.
- **Rubric-Based Evaluation**: Grades mathematical reasoning, step validity, and conceptual integrity—not just final answers.
- **Wrong Answer & Bookmark Queues**: Automatically surfaces weak spots for targeted spaced revision.

---

## Technical Architecture

```mermaid
flowchart TB
    subgraph Client["Frontend Layer (React + Vite + TypeScript)"]
        UI["Lumo Web UI & Dashboard"]
        VoiceIO["Voice / Audio Interface"]
        Timeline["Visual Classroom & Stage Player"]
        Avatar["Three.js VRM Avatar / Remotion"]
    end

    subgraph Gateway["Server API Layer (Node.js + Express)"]
        AuthMid["Auth Middleware (Firebase Admin)"]
        Router["Express Routers (/teaching, /knowledge, /assessments, /ai)"]
    end

    subgraph Intelligence["Teacher Brain & Orchestration"]
        TeacherEngine["Teacher Engine (Pedagogical Logic & Misconceptions)"]
        LessonPlanner["Lesson Planner (Multi-Scene Blueprints)"]
        AssessmentEngine["Assessment & Evaluation Engine"]
        Orchestrator["Conversation & Session Orchestrator"]
    end

    subgraph AIProviders["AI Provider Routing Layer"]
        AIService["AI Service (Key Pool & Failover)"]
        Gemini["Google Gemini (3.5 Flash / 3.7 Flash)"]
        Groq["Groq (Qwen / Llama Fallbacks)"]
    end

    subgraph DataRAG["Knowledge & Persistence"]
        Mongo[("MongoDB\n(Users, Sessions, History, Analytics)")]
        Qdrant[("Qdrant Vector DB\n(User Document Embeddings)")]
        Cohere["Cohere API\n(Embed v3 & Rerank v3)"]
    end

    UI --> AuthMid
    VoiceIO --> AuthMid
    Timeline --> AuthMid
    AuthMid --> Router

    Router --> Orchestrator
    Router --> TeacherEngine
    Router --> LessonPlanner
    Router --> AssessmentEngine

    TeacherEngine --> AIService
    LessonPlanner --> AIService
    AssessmentEngine --> AIService
    Orchestrator --> AIService

    AIService --> Gemini
    AIService -.->|Automatic Fallback| Groq

    Router --> Mongo
    Router --> Cohere
    Cohere --> Qdrant
    Qdrant --> TeacherEngine
```

---

## Tech Stack

| Layer | Technologies | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite | Fast client SPA with modular design system and CSS variables |
| **Graphics & Media** | Three.js, `@pixiv/three-vrm`, Remotion | 3D interactive avatar rendering and video preview timeline |
| **Backend** | Node.js, Express, TypeScript, tsx | RESTful API services with comprehensive runtime validation |
| **Shared Contracts** | Zod, TypeScript | Monorepo package sharing unified schemas and type contracts |
| **Primary AI** | Google Gemini (`@google/genai`) | `gemini-3.5-flash-lite`, `gemini-3.7-flash` for reasoning |
| **Fallback AI** | Groq SDK (`groq-sdk`) | High-speed open-weight fallback models with key cooldown pooling |
| **Vector DB** | Qdrant (`@qdrant/js-client-rest`) | Multi-tenant isolated semantic vector search (Cosine, 1024/1536 dims) |
| **Embed & Rerank** | Cohere (`cohere-ai`) | Document chunk embedding (`embed-english-v3.0`) & search reranking |
| **Primary Database** | MongoDB & Mongoose | Storage for users, learning sessions, timelines, and assessment states |
| **Authentication** | Firebase Authentication & Admin SDK | Secure token verification on both client and server |

---

## Project Structure

```text
ai-tutor/
├── client/                     # React + Vite client
│   ├── src/
│   │   ├── components/         # Classroom, Assessment, Avatar, Landing & Dashboard UI
│   │   ├── services/           # API and Firebase client service integrations
│   │   └── theme/              # Typography, design system tokens, and theme provider
│   └── public/                 # Static assets, fonts, videos, and logo assets
├── server/                     # Node.js + Express backend
│   └── src/
│       ├── ai/                 # Gemini/Groq providers, multi-key pooling & fallback handling
│       ├── assessment/         # Dynamic question generators, rubrics & multi-modal evaluators
│       ├── engine/             # Teacher brain, pedagogical prompts & misconception detection
│       ├── knowledge/          # RAG ingestion, PDF extraction, Cohere embeddings & Qdrant vector DB
│       ├── lesson/             # Structured lesson blueprints & scene generation
│       ├── memory/             # Session replay services & timeline memory
│       ├── models/             # Mongoose schemas (Sessions, Documents, Assessments)
│       └── routes/             # Express API route handlers
├── shared/                     # Shared monorepo library
│   └── src/                    # Zod schemas, API DTOs, speech normalizers & TypeScript contracts
├── Docs/                       # System architecture specs and design guidelines
├── package.json                # Root npm workspace configuration
└── tsconfig.base.json          # Shared compiler configuration
```

---

## Getting Started

### Prerequisites

- **Node.js**: `v20.x` or `v22.x` (Tested on `v22.12.0`)
- **npm**: `v10.x` or `v11.x`
- **Docker** *(optional, for local Qdrant)*: or access to a cloud Qdrant cluster
- **MongoDB**: Local MongoDB instance or MongoDB Atlas connection URI

---

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/ai-tutor.git
   cd ai-tutor
   ```

2. **Install all monorepo dependencies**:
   ```bash
   npm install
   ```

---

### Environment Configuration

#### 1. Backend Configuration (`server/.env`)

Create `server/.env` based on `server/.env.example`:

```env
# Server
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ai-tutor

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"

# AI Providers (Supports comma-separated keys for automatic pooling)
GEMINI_API_KEYS=your-gemini-api-key-1,your-gemini-api-key-2
GROQ_API_KEYS=your-groq-api-key-1
AI_KEY_COOLDOWN_MS=60000

# Cohere (Embeddings & Reranking)
COHERE_API_KEY=your-cohere-api-key
COHERE_EMBED_MODEL=embed-english-v3.0
COHERE_RERANK_MODEL=rerank-english-v3.0

# Qdrant Vector DB
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=
QDRANT_COLLECTION=ai_tutor_knowledge
```

#### 2. Frontend Configuration (`client/.env`)

Create `client/.env` based on `client/.env.example`:

```env
VITE_FIREBASE_API_KEY=your-firebase-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

---

### Running Locally

1. **Start Qdrant** (if running locally via Docker):
   ```bash
   docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
   ```

2. **Start Development Servers** (runs both client and server concurrently):
   ```bash
   npm run dev
   ```

   - **Frontend App**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:4000](http://localhost:4000)
   - **API Health Check**: [http://localhost:4000/api/health](http://localhost:4000/api/health)

---

### Build & Verification

Run static type verification across all packages:
```bash
npm run typecheck
```

Compile all workspaces (`shared`, `server`, and `client`):
```bash
npm run build
```

Execute end-to-end knowledge and integration verification:
```bash
npm run verify:e2e --workspace=server
```

---

## Deployment Setup

- **Frontend**: Hosted on **Vercel** (`client/dist` build output).
- **Backend**: Deployed on modern Node.js cloud hosting environments (**Render**, **Railway**, or containerized VPS).
- **Databases**: Managed cloud clusters using **MongoDB Atlas** and **Qdrant Cloud**.

---

<div align="center">
  <sub>Built with care for learners everywhere.</sub>
</div>
