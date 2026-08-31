# AI Tutor Monorepo

Clean, production-ready TypeScript monorepo for the AI Tutor project.

## Repository Architecture

```text
ai-tutor/
├── client/     # React + TypeScript + Vite frontend (Firebase Auth client)
├── server/     # Node.js + Express + TypeScript backend (Firebase Admin + MongoDB / Mongoose)
├── shared/     # Shared TypeScript contracts, DTOs & schemas
├── package.json # Root monorepo workspace configuration
└── tsconfig.base.json
```

## Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- MongoDB (local running instance or MongoDB Atlas URI)
- Firebase Project with Authentication (Email/Password provider enabled)

---

## Environment Configuration

### 1. Backend (`server/.env`)

Copy `server/.env.example` to `server/.env` and supply:

```env
PORT=4000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ai-tutor

# Firebase Admin SDK Credentials
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

### 2. Frontend (`client/.env`)

Copy `client/.env.example` to `client/.env` and supply:

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

---

## Authentication & Database Workflow

1. The frontend authenticates directly against **Firebase Auth**.
2. On successful login, the frontend receives a Firebase ID Token.
3. The frontend passes this token via the `Authorization: Bearer <ID_TOKEN>` header.
4. The backend `requireAuth` middleware validates the token with **Firebase Admin SDK** to extract the verified `uid` and profile info.
5. `GET /api/auth/me` synchronizes or retrieves the user document in **MongoDB** (`UserModel`) using the indexed `firebaseUid`.
