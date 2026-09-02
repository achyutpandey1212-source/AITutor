# AI Tutor Monorepo

Clean, production-ready TypeScript monorepo for the AI Tutor project.

## Repository Architecture

```text
ai-tutor/
├── client/     # React + TypeScript + Vite frontend (Voice Tutor UI, Document Manager)
├── server/     # Node.js + Express + TypeScript backend (Firebase Admin, MongoDB, AI Provider Layer, RAG & Vector Engine)
├── shared/     # Shared TypeScript contracts, Zod schemas, DTOs & AI abstractions
├── package.json # Root monorepo workspace configuration
└── tsconfig.base.json
```

---

## Milestone 6: Knowledge & RAG Architecture

```text
DOCUMENT INGESTION PIPELINE:

Student Uploads Study PDF/Doc
             │
             ▼
   Authenticated Upload API (POST /api/knowledge/documents)
             │
             ▼
   MongoDB Record Created (status: "pending") ───► Returns 202 Accepted immediately
             │
             ▼ (Background Ingestion Worker)
   Deterministic PDF Text Extraction (PDFExtractor via pdf-parse)
             │
             ├── Good Text Extraction ────────┐
             │                                │
             └── Poor / Scanned Extraction ───┼──► Gemini Fallback OCR (GeminiExtractor)
                                              │
                                              ▼
                               Deterministic Text Cleaning
                                              │
                                              ▼
                               Structure-Aware Chunking (ChunkingService)
                               (~600 tokens, 10-15% overlap, deterministic chunk IDs)
                                              │
                                              ▼
                               Cohere Batched Embeddings (embed-english-v3.0, 1024 dims)
                                              │
                                              ▼
                               Qdrant Vector DB Storage (payload with strict userId)
                                              │
                                              ▼
                               MongoDB Document Status Updated (status: "ready")
```

```text
QUERY & LIVE TUTOR RAG RETRIEVAL FLOW:

Student Speech / Message
             │
             ▼
   Live Tutor Session (/api/teaching/sessions/:sessionId/voice or /respond)
             │
             ▼
   Deterministic Auth & Session Ownership Validation
             │
             ▼
   Query Vector Embedding via Cohere (inputType: "search_query")
             │
             ▼
   Qdrant Vector Search (top 10–15 candidates, filtered strictly by userId)
             │
             ▼
   Cohere Rerank (rerank-english-v3.0 down to top 3–5 high-relevance chunks)
   (Gracefully degrades to vector scores if reranker unavailable)
             │
             ▼
   KnowledgeContext Contract
             │
             ▼
   TeacherEngine (Pedagogical Reasoning + Misconception Detection + Grounding)
             │
             ▼
   Gemini 3.6 Flash (Primary) / Groq Llama 3.3 (Fallback)
             │
             ▼
   Validated TeacherResponse Contract
             │
             ▼
   Normalized Speech Audio Playback (TTS)
```

---

## AI & Vector Provider Architecture

```text
                               Client Request
                                     │
                               Auth Middleware
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
             AIService                                RAG Engine
                 │                                       │
        ┌────────┴────────┐                     ┌────────┴────────┐
        ▼                 ▼                     ▼                 ▼
  GeminiProvider    GroqProvider          CohereService      QdrantService
 (Gemini 3.6 Flash) (Llama 3.3 70B)    (Embed & Rerank)   (Vector Storage)
```

- **Primary AI Provider:** Google Gemini (`@google/genai`)
- **Fallback AI Provider:** Groq (`groq-sdk`)
- **Vector Database:** Qdrant (`@qdrant/js-client-rest`, Cosine distance, 1024 dimensions)
- **Embeddings:** Cohere Embed (`embed-english-v3.0`) with batched embedding calls
- **Reranking:** Cohere Rerank (`rerank-english-v3.0`)
- **Key Pooling & Cooldown:** Round-robin key pooling with automatic cooldown failover across Gemini and Groq.

---

## Environment Configuration

### 1. Backend (`server/.env`)

Copy `server/.env.example` to `server/.env`:

```env
PORT=4000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ai-tutor

# Firebase Admin SDK Credentials
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"

# AI Providers Key Pooling (Server only - NEVER expose to React)
GEMINI_API_KEYS=key1,key2,key3
GROQ_API_KEYS=key1,key2
AI_KEY_COOLDOWN_MS=60000

# Cohere Configuration (Embeddings & Rerank)
COHERE_API_KEY=your-cohere-api-key
COHERE_EMBED_MODEL=embed-english-v3.0
COHERE_RERANK_MODEL=rerank-english-v3.0

# Qdrant Vector Database
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=
QDRANT_COLLECTION=ai_tutor_knowledge
```

### 2. Frontend (`client/.env`)

Copy `client/.env.example` to `client/.env`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

---

## API Endpoints

### Knowledge & Documents (`/api/knowledge`)

- `POST   /api/knowledge/documents` — Multipart upload (.pdf, text). Initiates async ingestion, returns `status: "pending"`.
- `GET    /api/knowledge/documents` — Lists authenticated user's uploaded documents with statuses and chunk counts.
- `GET    /api/knowledge/documents/:documentId` — Returns status and metadata for a specific document.
- `DELETE /api/knowledge/documents/:documentId` — Deletes document metadata from MongoDB and points from Qdrant.
- `POST   /api/knowledge/search` — Debug & inspection endpoint for testing vector retrieval and Cohere rerank scores.

### Live Teaching & Voice (`/api/teaching`)

- `POST /api/teaching/sessions` — Creates a new interactive teaching session.
- `POST /api/teaching/sessions/:sessionId/respond` — Text response with automatic RAG grounding.
- `POST /api/teaching/sessions/:sessionId/voice` — Voice interaction endpoint with speech normalization and latency instrumentation.
- `POST /api/teaching/lesson-plan` — Generates a structured multi-scene lesson plan.

---

## Verification & Testing

### 1. Automated Verification Suite

Run the full Milestone 6 verification suite:

```bash
npx tsx server/src/knowledge/verify-m6.ts
```

Verifies:
- Deterministic PDF extraction & quality heuristics
- Gemini document understanding fallback
- Structure-aware token-based chunking & determinism
- Multi-tenant Qdrant isolation & security
- Cohere reranking & graceful degradation
- Full RAG retrieval pipeline & KnowledgeContext formulation
- TeacherEngine grounded prompt construction
- Zero-downtime no-document fallback

### 2. Monorepo Build & Typecheck

```bash
npm run typecheck
npm run build
```

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Local Qdrant (Docker)

```bash
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
```

### 3. Run Development Server

```bash
npm run dev
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend:** [http://localhost:4000](http://localhost:4000)
- **Health Check:** [http://localhost:4000/api/health](http://localhost:4000/api/health)

---

## Known Hackathon Architecture Limitations

1. **In-Memory Background Ingestion Task:** Asynchronous ingestion uses a background worker process. For high-volume production scale, this can be swapped with a durable Redis/BullMQ queue without changing any RAG interfaces.
2. **Local vs Cloud Qdrant:** Default configuration points to `http://localhost:6333`. Cloud Qdrant clusters can be connected seamlessly by setting `QDRANT_URL` and `QDRANT_API_KEY`.
