import { z } from 'zod';

// ==========================================
// 1. Core Health & Response Contracts
// ==========================================
export interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  database?: 'connected' | 'disconnected';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

// ==========================================
// 2. User & Auth Contracts
// ==========================================
export interface User {
  id: string;
  firebaseUid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  firebaseUser: unknown | null;
  loading: boolean;
  error: string | null;
}

// ==========================================
// 3. AI Provider Contracts
// ==========================================
export type AIProviderName = 'gemini' | 'groq';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIGenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemInstruction?: string;
}

export interface AITextResponse {
  text: string;
  provider: AIProviderName;
  model: string;
  fallbackUsed?: boolean;
}

export interface AIStructuredResponse<T = unknown> {
  data: T;
  provider: AIProviderName;
  model: string;
  fallbackUsed?: boolean;
}

export interface AITestResponse {
  prompt: string;
  response: string;
  provider: AIProviderName;
  model: string;
  fallbackUsed: boolean;
}

// ==========================================
// 4. Milestone 4: Teacher Engine & Contracts (Zod Runtime Validated)
// ==========================================

// A. Learner Profile
export const LearnerProfileSchema = z.object({
  userId: z.string().optional(),
  preferredLanguage: z.enum(['english', 'hindi', 'hinglish']).default('english'),
  educationLevel: z.string().optional(),
  learningGoal: z.string().optional(),
  explanationStyle: z.enum(['simple', 'balanced', 'detailed']).default('simple'),
});
export type LearnerProfile = z.infer<typeof LearnerProfileSchema>;

// B. Teaching State (Hybrid State)
export const TeachingUnderstandingSchema = z.enum(['unknown', 'weak', 'developing', 'strong']);
export type TeachingUnderstanding = z.infer<typeof TeachingUnderstandingSchema>;

export const StudentActionSchema = z.enum([
  'question',
  'answer',
  'request_example',
  'request_explanation',
  'unknown',
]);
export type StudentAction = z.infer<typeof StudentActionSchema>;

export const RecommendedNextActionSchema = z.enum([
  'explain',
  'give_example',
  'ask_question',
  'clarify',
  'advance',
  'review',
]);
export type RecommendedNextAction = z.infer<typeof RecommendedNextActionSchema>;

export const TeachingStateSchema = z.object({
  currentConcept: z.string().default('Introduction'),
  understanding: TeachingUnderstandingSchema.default('unknown'),
  confidence: z.number().min(0).max(1).default(0.5),
  misconceptions: z.array(z.string()).default([]),
  conceptsMastered: z.array(z.string()).default([]),
  conceptsNeedingWork: z.array(z.string()).default([]),
  lastStudentAction: StudentActionSchema.default('unknown'),
  recommendedNextAction: RecommendedNextActionSchema.default('explain'),
});
export type TeachingState = z.infer<typeof TeachingStateSchema>;

// C. Assessment Result
export const AssessmentResultSchema = z.object({
  evaluated: z.boolean(),
  correctness: z.enum(['correct', 'partially_correct', 'incorrect', 'unclear']),
  score: z.number().min(0).max(1).optional(),
  misconception: z.string().optional(),
  feedback: z.string().optional(),
});
export type AssessmentResult = z.infer<typeof AssessmentResultSchema>;

// D. Teacher Response
export const TeacherIntentSchema = z.enum([
  'explanation',
  'example',
  'question',
  'clarification',
  'feedback',
  'encouragement',
]);
export type TeacherIntent = z.infer<typeof TeacherIntentSchema>;

export const TeachingActionSchema = z.enum([
  'explain',
  'demonstrate',
  'assess',
  'clarify',
  'advance',
  'review',
]);
export type TeachingAction = z.infer<typeof TeachingActionSchema>;

export const TeacherResponseSchema = z.object({
  responseText: z.string().min(1),
  language: z.enum(['english', 'hindi', 'hinglish']).default('english'),
  intent: TeacherIntentSchema,
  teachingAction: TeachingActionSchema,
  assessment: AssessmentResultSchema.optional(),
  stateUpdate: TeachingStateSchema.partial().optional(),
});
export type TeacherResponse = z.infer<typeof TeacherResponseSchema>;

// E. Knowledge Context (Placeholder contract for future RAG)
export const KnowledgeChunkSchema = z.object({
  text: z.string(),
  source: z.string().optional(),
  relevance: z.number().min(0).max(1).optional(),
});
export type KnowledgeChunk = z.infer<typeof KnowledgeChunkSchema>;

export const KnowledgeContextSchema = z.object({
  sourceType: z.enum(['topic', 'uploaded_document']),
  sourceId: z.string().optional(),
  retrievedChunks: z.array(KnowledgeChunkSchema).optional(),
});
export type KnowledgeContext = z.infer<typeof KnowledgeContextSchema>;

// F. Teaching Session
export const TeachingSessionStatusSchema = z.enum(['active', 'completed']);
export type TeachingSessionStatus = z.infer<typeof TeachingSessionStatusSchema>;

export const TeachingSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  topic: z.string().min(1),
  learnerProfile: LearnerProfileSchema,
  status: TeachingSessionStatusSchema.default('active'),
  currentConcept: z.string().optional(),
  language: z.enum(['english', 'hindi', 'hinglish']).default('english'),
  teachingState: TeachingStateSchema,
  startedAt: z.string(),
  updatedAt: z.string(),
});
export type TeachingSession = z.infer<typeof TeachingSessionSchema>;

// G. Lesson Scene & Plan
export const SceneTypeSchema = z.enum([
  'intro',
  'explanation',
  'diagram',
  'example',
  'question',
  'summary',
]);
export type SceneType = z.infer<typeof SceneTypeSchema>;

export const VisualTypeSchema = z.enum(['avatar', 'diagram', 'text', 'equation', 'illustration']);
export type VisualType = z.infer<typeof VisualTypeSchema>;

export const LessonVisualSchema = z.object({
  type: VisualTypeSchema,
  description: z.string(),
});
export type LessonVisual = z.infer<typeof LessonVisualSchema>;

export const LessonSceneSchema = z.object({
  id: z.string(),
  order: z.number().int().min(1),
  type: SceneTypeSchema,
  durationSeconds: z.number().min(1).max(300),
  narration: z.string().min(1),
  visual: LessonVisualSchema.optional(),
  transition: z.string().optional(),
});
export type LessonScene = z.infer<typeof LessonSceneSchema>;

export const LessonPlanSchema = z.object({
  id: z.string(),
  sessionId: z.string().optional(),
  title: z.string().min(1),
  topic: z.string().min(1),
  targetLevel: z.string().default('beginner'),
  language: z.enum(['english', 'hindi', 'hinglish']).default('english'),
  learningObjectives: z.array(z.string()).min(1),
  estimatedDurationSeconds: z.number().min(10),
  scenes: z.array(LessonSceneSchema).min(1),
});
export type LessonPlan = z.infer<typeof LessonPlanSchema>;

// DTO Schemas for API Requests
export const CreateSessionRequestSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  learnerProfile: LearnerProfileSchema.optional(),
});
export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;

export const RespondSessionRequestSchema = z.object({
  message: z.string().min(1, 'Student message is required'),
  knowledgeContext: KnowledgeContextSchema.optional(),
});
export type RespondSessionRequest = z.infer<typeof RespondSessionRequestSchema>;

export const CreateLessonPlanRequestSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  learnerProfile: LearnerProfileSchema.optional(),
  sessionId: z.string().optional(),
  knowledgeContext: KnowledgeContextSchema.optional(),
});
export type CreateLessonPlanRequest = z.infer<typeof CreateLessonPlanRequestSchema>;
