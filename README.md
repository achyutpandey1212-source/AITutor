# AI Tutor Monorepo

Clean, production-ready TypeScript monorepo for the AI Tutor project.

## Repository Architecture

```text
ai-tutor/
├── client/     # React + TypeScript + Vite frontend
├── server/     # Node.js + Express + TypeScript backend (Firebase Admin, MongoDB, AI Provider Layer)
├── shared/     # Shared TypeScript contracts, DTOs & AI abstractions
├── package.json # Root monorepo workspace configuration
└── tsconfig.base.json
```

## AI Provider Architecture

```text
               Client Request (/api/ai/test, /api/ai/test/stream)
                                  │
                            Auth Middleware
                                  │
                             AIService
                                  │
               ┌──────────────────┴──────────────────┐
               ▼ (Primary)                           ▼ (Fallback)
         GeminiProvider                        GroqProvider
        (gemini-2.5-flash)              (llama-3.3-70b-versatile)
               │                                     │
       [KeyPool: Gemini]                     [KeyPool: Groq]
   (Round-robin key rotation)            (Round-robin key rotation)
```

The AI layer exposes a clean contract (`generateText`, `generateStructured`, `streamText`) via `AIService` and `IAIProvider`. The rest of the application never directly imports or couples to Gemini or Groq SDKs.

- **Primary Provider:** Google Gemini (`@google/genai`)
- **Fallback Provider:** Groq (`groq-sdk`)
- **Key Pools:** Each provider maintains an isolated in-memory `KeyPool` that round-robins across configured keys.
- **Failover & Cooldown:** When a key hits a 429/quota/rate-limit error, it is temporarily marked unavailable for a cooldown period (default: 60s, configurable via `AI_KEY_COOLDOWN_MS`) and the next key in the pool is tried. If all keys in the primary pool are exhausted, `AIService` automatically falls back to Groq.

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
# Comma-separated keys for pool rotation:
GEMINI_API_KEYS=key1,key2,key3
GROQ_API_KEYS=key1,key2

# (Optional) Singular key backward-compatibility:
# GEMINI_API_KEY=your-gemini-api-key
# GROQ_API_KEY=your-groq-api-key

# Key Cooldown (in ms, default: 60000 = 60s)
AI_KEY_COOLDOWN_MS=60000
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

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run in Development Mode

```bash
npm run dev
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend:** [http://localhost:4000](http://localhost:4000)
- **Health Check:** [http://localhost:4000/api/health](http://localhost:4000/api/health)
- **AI Test Endpoint:** `POST /api/ai/test` (Protected)
- **AI Streaming Endpoint:** `POST /api/ai/test/stream` (Protected)
