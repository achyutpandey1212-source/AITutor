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

export interface AIImagePart {
  mimeType: string;
  data: string; // Base64 encoded data or Data URI
}

export interface AIGenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemInstruction?: string;
  images?: AIImagePart[];
  timeoutMs?: number;
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
// 4. Teacher Engine Contracts (Zod Runtime Validated)
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

// E. Knowledge Context (RAG Foundation)
export const KnowledgeChunkSchema = z.object({
  text: z.string(),
  source: z.string().optional(),
  chunkId: z.string().optional(),
  documentId: z.string().optional(),
  chunkIndex: z.number().optional(),
  pageStart: z.number().optional(),
  pageEnd: z.number().optional(),
  filename: z.string().optional(),
  relevance: z.number().min(0).max(1).optional(),
  rerankScore: z.number().optional(),
});
export type KnowledgeChunk = z.infer<typeof KnowledgeChunkSchema>;

export const KnowledgeContextSchema = z.object({
  sourceType: z.enum(['topic', 'uploaded_document']),
  sourceId: z.string().optional(),
  hasUploadedDocuments: z.boolean().default(false),
  relevantContextFound: z.boolean().default(false),
  retrievedChunks: z.array(KnowledgeChunkSchema).default([]),
  rerankApplied: z.boolean().optional(),
  totalChunksFound: z.number().optional(),
  relevanceThreshold: z.number().optional(),
});
export type KnowledgeContext = z.infer<typeof KnowledgeContextSchema>;

// F. Teaching Session
export const TeachingSessionStatusSchema = z.enum(['active', 'completed']);
export type TeachingSessionStatus = z.infer<typeof TeachingSessionStatusSchema>;

export const TeachingSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  topic: z.string().min(1),
  subject: z.string().default('General'),
  learnerProfile: LearnerProfileSchema,
  status: TeachingSessionStatusSchema.default('active'),
  currentConcept: z.string().optional(),
  language: z.enum(['english', 'hindi', 'hinglish']).default('english'),
  teachingState: TeachingStateSchema,
  currentMode: z.enum(['TEACHING', 'ASSESSMENT', 'FEEDBACK', 'REVIEW']).default('TEACHING'),
  assessmentSessionId: z.string().optional(),
  currentQuestionId: z.string().optional(),
  conversationHistory: z.array(
    z.object({
      id: z.string().optional(),
      role: z.enum(['student', 'tutor']),
      text: z.string().min(1),
      intent: TeacherIntentSchema.optional(),
      timestamp: z.string(),
    })
  ).default([]),
  startedAt: z.string(),
  updatedAt: z.string(),
});
export type TeachingSession = z.infer<typeof TeachingSessionSchema>;

// F2. Tutor Session Context (The Nervous System connecting M5/M6/M7)
export const TutorSessionModeSchema = z.enum([
  'TEACHING',
  'ASSESSMENT',
  'FEEDBACK',
  'REVIEW',
]);
export type TutorSessionMode = z.infer<typeof TutorSessionModeSchema>;

export const TutorConversationMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(['student', 'tutor']),
  text: z.string().min(1),
  intent: TeacherIntentSchema.optional(),
  timestamp: z.string(),
});
export type TutorConversationMessage = z.infer<typeof TutorConversationMessageSchema>;

export const TutorSessionContextSchema = z.object({
  sessionId: z.string().min(1),
  userId: z.string().min(1),
  subject: z.string().default('General'),
  topic: z.string().min(1),
  language: z.enum(['english', 'hindi', 'hinglish']).default('english'),
  conversationHistory: z.array(TutorConversationMessageSchema).default([]),
  activeConcept: z.string().min(1),
  teachingState: TeachingStateSchema,
  assessmentSessionId: z.string().optional(),
  currentQuestionId: z.string().optional(),
  currentMode: TutorSessionModeSchema.default('TEACHING'),
  updatedAt: z.string(),
});
export type TutorSessionContext = z.infer<typeof TutorSessionContextSchema>;

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

// ==========================================
// 5. Milestone 5: Voice Interaction & Latency Contracts
// ==========================================

export const VoiceInteractionRequestSchema = z.object({
  transcript: z.string().min(1, 'Transcript is required'),
  language: z.enum(['english', 'hindi', 'hinglish']).default('english'),
  knowledgeContext: KnowledgeContextSchema.optional(),
});
export type VoiceInteractionRequest = z.infer<typeof VoiceInteractionRequestSchema>;

export const LatencyMetricsSchema = z.object({
  speechDurationMs: z.number().optional(),
  sttFinalizationMs: z.number().optional(),
  backendDurationMs: z.number().optional(),
  aiGenerationMs: z.number().optional(),
  ttsDurationMs: z.number().optional(),
  totalPerceivedLatencyMs: z.number().optional(),
});
export type LatencyMetrics = z.infer<typeof LatencyMetricsSchema>;

export const VoiceInteractionResponseSchema = z.object({
  transcript: z.string(),
  teacherResponse: TeacherResponseSchema,
  teachingState: TeachingStateSchema,
  normalizedSpeechText: z.string(),
  sessionContext: TutorSessionContextSchema.optional(),
  latency: LatencyMetricsSchema.optional(),
});
export type VoiceInteractionResponse = z.infer<typeof VoiceInteractionResponseSchema>;

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

// ==========================================
// 6. Speech Text Normalization (Deterministic, Shared & Reusable)
// ==========================================

/**
 * Deterministically strips Markdown syntax and normalizes mathematical/presentation
 * characters so that Speech Synthesis (TTS) produces clean, natural pronunciation.
 */
export function normalizeTextForSpeech(text: string): string {
  if (!text) return '';

  let sanitized = text;

  // 1. Remove code blocks (```...```) and inline code (`...`)
  sanitized = sanitized.replace(/```[\s\S]*?```/g, ' ');
  sanitized = sanitized.replace(/`([^`]+)`/g, '$1');

  // 2. Remove markdown images and links: ![alt](url) -> "" and [text](url) -> text
  sanitized = sanitized.replace(/!\[([^\]]*)\]\([^)]*\)/g, '');
  sanitized = sanitized.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

  // 3. Remove Markdown headers (#, ##, etc.)
  sanitized = sanitized.replace(/^#{1,6}\s+/gm, '');

  // 4. Remove bold / italic markers (**text**, *text*, __text__, _text_)
  sanitized = sanitized.replace(/(\*\*|__)(.*?)\1/g, '$2');
  sanitized = sanitized.replace(/(\*|_)(.*?)\1/g, '$2');

  // 5. Remove blockquotes, horizontal rules, and bullet points
  sanitized = sanitized.replace(/^\s*>\s*/gm, '');
  sanitized = sanitized.replace(/^[-*_]{3,}\s*$/gm, '');
  sanitized = sanitized.replace(/^\s*[-*+]\s+/gm, '');
  sanitized = sanitized.replace(/^\s*\d+\.\s+/gm, '');

  // 6. Normalize common math symbols and equations for speech
  // F = ma -> F equals m times a
  sanitized = sanitized.replace(/(\b[A-Za-z0-9]+)\s*=\s*([A-Za-z0-9]+)\s*[×*]\s*([A-Za-z0-9]+)/g, '$1 equals $2 times $3');
  sanitized = sanitized.replace(/(\b[A-Za-z0-9]+)\s*=\s*([A-Za-z0-9]+)/g, '$1 equals $2');
  sanitized = sanitized.replace(/×/g, ' times ');
  sanitized = sanitized.replace(/÷/g, ' divided by ');
  sanitized = sanitized.replace(/≠/g, ' is not equal to ');
  sanitized = sanitized.replace(/≤/g, ' is less than or equal to ');
  sanitized = sanitized.replace(/≥/g, ' is greater than or equal to ');
  sanitized = sanitized.replace(/\$/g, ''); // strip KaTeX / math dollar signs

  // 7. Normalize whitespace and trim
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  return sanitized;
}

// ==========================================
// 7. Milestone 6: Document Ingestion, Vectors & RAG Contracts
// ==========================================

export const DocumentStatusSchema = z.enum(['pending', 'processing', 'ready', 'failed']);
export type DocumentStatus = z.infer<typeof DocumentStatusSchema>;

export const ExtractionMethodSchema = z.enum(['pdf_text', 'gemini_fallback']);
export type ExtractionMethod = z.infer<typeof ExtractionMethodSchema>;

export const DocumentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  filename: z.string().min(1),
  mimeType: z.string().default('application/pdf'),
  size: z.number().int().nonnegative(),
  status: DocumentStatusSchema.default('pending'),
  extractionMethod: ExtractionMethodSchema.optional(),
  pageCount: z.number().int().nonnegative().optional(),
  chunkCount: z.number().int().nonnegative().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
  errorMessage: z.string().optional(),
});
export type Document = z.infer<typeof DocumentSchema>;

export const DocumentChunkMetadataSchema = z.object({
  filename: z.string().optional(),
  wordCount: z.number().optional(),
  tokenEstimate: z.number().optional(),
  extractionMethod: ExtractionMethodSchema.optional(),
}).passthrough();
export type DocumentChunkMetadata = z.infer<typeof DocumentChunkMetadataSchema>;

export const DocumentChunkSchema = z.object({
  documentId: z.string(),
  chunkId: z.string(),
  chunkIndex: z.number().int().nonnegative(),
  text: z.string().min(1),
  pageStart: z.number().int().positive().optional(),
  pageEnd: z.number().int().positive().optional(),
  metadata: DocumentChunkMetadataSchema.optional(),
});
export type DocumentChunk = z.infer<typeof DocumentChunkSchema>;

export const RAGQueryRequestSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  documentIds: z.array(z.string()).optional(),
  topK: z.number().int().positive().max(50).default(12),
  topN: z.number().int().positive().max(20).default(4),
});
export type RAGQueryRequest = z.infer<typeof RAGQueryRequestSchema>;

export const RetrievedChunkSchema = z.object({
  chunkId: z.string(),
  documentId: z.string(),
  chunkIndex: z.number(),
  text: z.string(),
  pageStart: z.number().optional(),
  pageEnd: z.number().optional(),
  filename: z.string().optional(),
  vectorScore: z.number(),
  rerankScore: z.number().optional(),
  finalScore: z.number(),
});
export type RetrievedChunk = z.infer<typeof RetrievedChunkSchema>;

export const RAGLatencyMetricsSchema = z.object({
  queryEmbeddingMs: z.number().optional(),
  vectorSearchMs: z.number().optional(),
  rerankMs: z.number().optional(),
  totalRetrievalMs: z.number(),
});
export type RAGLatencyMetrics = z.infer<typeof RAGLatencyMetricsSchema>;

export const RAGSearchResultSchema = z.object({
  query: z.string(),
  retrievedChunks: z.array(RetrievedChunkSchema),
  totalCandidates: z.number(),
  rerankApplied: z.boolean(),
  latency: RAGLatencyMetricsSchema,
});
export type RAGSearchResult = z.infer<typeof RAGSearchResultSchema>;

export type RAGSearchResponse = ApiResponse<RAGSearchResult>;
export type DocumentListResponse = ApiResponse<Document[]>;
export type DocumentUploadResponse = ApiResponse<Document>;

// ==========================================
// 8. Milestone 7: Assessment Intelligence & Question Contracts
// ==========================================

export const AssessmentQuestionTypeSchema = z.enum([
  'MCQ',
  'SHORT_ANSWER',
  'LONG_ANSWER',
  'NUMERICAL',
  'IMAGE_SOLUTION',
]);
export type AssessmentQuestionType = z.infer<typeof AssessmentQuestionTypeSchema>;

export const AssessmentEvaluationModeSchema = z.enum([
  'MCQ',
  'TEXT',
  'NUMERICAL',
  'IMAGE_SOLUTION',
]);
export type AssessmentEvaluationMode = z.infer<typeof AssessmentEvaluationModeSchema>;

export const AssessmentDifficultySchema = z.enum(['easy', 'medium', 'hard']);
export type AssessmentDifficulty = z.infer<typeof AssessmentDifficultySchema>;

export const AssessmentGoalSchema = z.enum([
  'concept_check',
  'practice',
  'diagnostic',
  'mastery_verification',
]);
export type AssessmentGoal = z.infer<typeof AssessmentGoalSchema>;

// MCQ Option
export const MCQOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
});
export type MCQOption = z.infer<typeof MCQOptionSchema>;

// Question Rubric (Method, steps, calculation, evaluation criteria, final answer)
export const QuestionRubricSchema = z.object({
  method: z.string().optional(),
  steps: z.array(z.string()).optional(),
  calculation: z.string().optional(),
  criteria: z.array(z.string()).optional(),
  finalAnswer: z.string().optional(),
});
export type QuestionRubric = z.infer<typeof QuestionRubricSchema>;

// Standard student-facing cleanliness guidance for image uploads
export const DEFAULT_IMAGE_SUBMISSION_GUIDANCE =
  'Before uploading your solution: Make sure the full page is visible, your writing is readable, and your steps are written clearly and in order. The tutor evaluates your working as well as your final answer.';

// Full Server-Side Assessment Question Contract (Contains answer key & rubric for evaluation)
export const AssessmentQuestionSchema = z.object({
  questionId: z.string().min(1),
  concept: z.string().min(1),
  subject: z.string().min(1),
  grade: z.string().optional(),
  difficulty: AssessmentDifficultySchema,
  questionType: AssessmentQuestionTypeSchema,
  evaluationMode: AssessmentEvaluationModeSchema,
  marks: z.number().int().positive(),
  question: z.string().min(1),
  context: z.string().optional(),
  options: z.array(MCQOptionSchema).optional(),
  correctOptionId: z.string().optional(),
  expectedAnswer: z.string().optional(),
  rubric: QuestionRubricSchema.optional(),
  submissionGuidance: z.string().optional(),
  requiresImageUpload: z.boolean().default(false),
  ragGrounded: z.boolean().default(false),
  groundingSources: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type AssessmentQuestion = z.infer<typeof AssessmentQuestionSchema>;

// Client-Facing Sanitized Question (Omits correctOptionId, expectedAnswer, and internal rubric)
export const ClientAssessmentQuestionSchema = z.object({
  questionId: z.string().min(1),
  concept: z.string().min(1),
  subject: z.string().min(1),
  grade: z.string().optional(),
  difficulty: AssessmentDifficultySchema,
  questionType: AssessmentQuestionTypeSchema,
  evaluationMode: AssessmentEvaluationModeSchema,
  marks: z.number().int().positive(),
  question: z.string().min(1),
  context: z.string().optional(),
  options: z.array(MCQOptionSchema).optional(),
  submissionGuidance: z.string().optional(),
  requiresImageUpload: z.boolean(),
  ragGrounded: z.boolean(),
  groundingSources: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type ClientAssessmentQuestion = z.infer<typeof ClientAssessmentQuestionSchema>;

// Assessment Strategy Decision (Deterministic plan per question/step)
export const AssessmentStrategyDecisionSchema = z.object({
  concept: z.string().min(1),
  subject: z.string().min(1),
  grade: z.string().optional(),
  difficulty: AssessmentDifficultySchema,
  questionType: AssessmentQuestionTypeSchema,
  evaluationMode: AssessmentEvaluationModeSchema,
  marks: z.number().int().positive(),
  questionCount: z.number().int().positive().default(1),
  assessmentGoal: AssessmentGoalSchema.default('concept_check'),
  targetMisconceptions: z.array(z.string()).optional(),
  rationale: z.string().optional(),
  submissionGuidance: z.string().optional(),
});
export type AssessmentStrategyDecision = z.infer<typeof AssessmentStrategyDecisionSchema>;

// Assessment Plan (Encompassing session assessment specification)
export const AssessmentPlanSchema = z.object({
  id: z.string().min(1),
  topic: z.string().min(1),
  subject: z.string().min(1),
  grade: z.string().optional(),
  goal: AssessmentGoalSchema,
  totalMarks: z.number().int().positive(),
  totalQuestions: z.number().int().positive(),
  strategies: z.array(AssessmentStrategyDecisionSchema).min(1),
  createdAt: z.string(),
});
export type AssessmentPlan = z.infer<typeof AssessmentPlanSchema>;

/**
 * Sanitizes an AssessmentQuestion for safe transmission to the client frontend.
 * Removes internal answer keys (correctOptionId), expected answers, and evaluation rubrics.
 */
export function sanitizeQuestionForClient(question: AssessmentQuestion): ClientAssessmentQuestion {
  return ClientAssessmentQuestionSchema.parse({
    questionId: question.questionId,
    concept: question.concept,
    subject: question.subject,
    grade: question.grade,
    difficulty: question.difficulty,
    questionType: question.questionType,
    evaluationMode: question.evaluationMode,
    marks: question.marks,
    question: question.question,
    context: question.context,
    options: question.options ? question.options.map((opt) => ({ id: opt.id, text: opt.text })) : undefined,
    submissionGuidance: question.submissionGuidance,
    requiresImageUpload: question.requiresImageUpload || question.evaluationMode === 'IMAGE_SOLUTION',
    ragGrounded: question.ragGrounded || false,
    groundingSources: question.groundingSources,
    metadata: question.metadata,
  });
}

// ==========================================
// 9. Milestone 7 Phase 2: Assessment Submission Contracts
// ==========================================

export const AssessmentSubmissionStatusSchema = z.enum([
  'SUBMITTED',
  'EVALUATING',
  'EVALUATED',
  'NEEDS_REVIEW',
  'FAILED',
]);
export type AssessmentSubmissionStatus = z.infer<typeof AssessmentSubmissionStatusSchema>;

// Student submission payload
export const AssessmentSubmissionRequestSchema = z
  .object({
    questionId: z.string().min(1, 'questionId is required'),
    questionType: AssessmentQuestionTypeSchema,
    selectedOption: z.string().optional(),
    answer: z.string().optional(),
    imageReference: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.questionType === 'MCQ') {
        return typeof data.selectedOption === 'string' && data.selectedOption.trim().length > 0;
      }
      return true;
    },
    {
      message: "MCQ submission requires 'selectedOption'",
      path: ['selectedOption'],
    }
  )
  .refine(
    (data) => {
      if (
        data.questionType === 'SHORT_ANSWER' ||
        data.questionType === 'LONG_ANSWER' ||
        data.questionType === 'NUMERICAL'
      ) {
        return typeof data.answer === 'string' && data.answer.trim().length > 0;
      }
      return true;
    },
    {
      message: "Text/Numerical submission requires non-empty 'answer'",
      path: ['answer'],
    }
  )
  .refine(
    (data) => {
      if (data.questionType === 'IMAGE_SOLUTION') {
        return (
          typeof data.imageReference === 'string' && data.imageReference.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Image Solution submission requires 'imageReference'",
      path: ['imageReference'],
    }
  );
export type AssessmentSubmissionRequest = z.infer<typeof AssessmentSubmissionRequestSchema>;

// ==========================================
// 10. Milestone 7 Phase 3: AI Evaluation & Adaptive State Contracts
// ==========================================

export const StepStatusSchema = z.enum([
  'correct',
  'partially_correct',
  'incorrect',
  'unclear',
]);
export type StepStatus = z.infer<typeof StepStatusSchema>;

export const StepEvaluationSchema = z.object({
  step: z.union([z.number(), z.string()]),
  criterion: z.string().optional(),
  status: StepStatusSchema,
  score: z.number().min(0).optional(),
  maxScore: z.number().min(0).optional(),
  feedback: z.string(),
});
export type StepEvaluation = z.infer<typeof StepEvaluationSchema>;

export const UnderstandingLevelSchema = z.enum([
  'strong',
  'moderate',
  'weak',
  'unclear',
]);
export type UnderstandingLevel = z.infer<typeof UnderstandingLevelSchema>;

export const ConceptAssessmentSchema = z.object({
  understanding: UnderstandingLevelSchema,
  methodSelection: UnderstandingLevelSchema.optional(),
  calculation: UnderstandingLevelSchema.optional(),
  completeness: UnderstandingLevelSchema.optional(),
  reasoning: UnderstandingLevelSchema.optional(),
});
export type ConceptAssessment = z.infer<typeof ConceptAssessmentSchema>;

export const RecommendedActionSchema = z.enum([
  'CONTINUE',
  'INCREASE_DIFFICULTY',
  'TARGETED_PRACTICE',
  'REMEDIAL_PRACTICE',
  'RETRY',
  'NEEDS_REVIEW',
]);
export type RecommendedAction = z.infer<typeof RecommendedActionSchema>;

export const EvaluationFailureReasonSchema = z.enum([
  'IMAGE_UNREADABLE',
  'IMAGE_INCOMPLETE',
  'PROVIDER_UNAVAILABLE',
  'MODEL_FAILURE',
  'TIMEOUT',
  'MALFORMED_OUTPUT',
  'LOW_CONFIDENCE',
  'NONE',
]);
export type EvaluationFailureReason = z.infer<typeof EvaluationFailureReasonSchema>;

export const EvaluationResultSchema = z.object({
  questionId: z.string().min(1),
  submissionId: z.string().min(1),
  correct: z.boolean(),
  score: z.number().min(0),
  maxScore: z.number().min(0),
  percentage: z.number().min(0).max(100),
  evaluationStatus: AssessmentSubmissionStatusSchema,
  evaluationMode: z.union([AssessmentEvaluationModeSchema, z.literal('DETERMINISTIC')]),
  stepEvaluation: z.array(StepEvaluationSchema).optional(),
  conceptAssessment: ConceptAssessmentSchema.optional(),
  misconceptions: z.array(z.string()).default([]),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  recommendedAction: RecommendedActionSchema,
  failureReason: EvaluationFailureReasonSchema.default('NONE'),
  confidence: z.number().min(0).max(1).default(1.0),
  feedback: z.string().min(1),
  evaluatedAt: z.string(),
});
export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;

// Persisted Submission Entity
export const AssessmentSubmissionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  assessmentId: z.string().optional(),
  sessionId: z.string().optional(),
  questionId: z.string().min(1),
  questionType: AssessmentQuestionTypeSchema,
  evaluationMode: AssessmentEvaluationModeSchema,
  selectedOption: z.string().optional(),
  answer: z.string().optional(),
  imageReference: z.string().optional(),
  status: AssessmentSubmissionStatusSchema.default('SUBMITTED'),
  submittedAt: z.string(),
  questionStartedAt: z.string().optional(),
  timeTakenMs: z.number().int().min(0).optional(),
  score: z.number().min(0).optional(),
  feedback: z.string().optional(),
  evaluation: EvaluationResultSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type AssessmentSubmission = z.infer<typeof AssessmentSubmissionSchema>;

// Learner Skills & Concept Mastery
export const LearnerConceptSkillsSchema = z.object({
  understanding: z.number().min(0).max(1).default(0.5),
  method_selection: z.number().min(0).max(1).default(0.5),
  substitution: z.number().min(0).max(1).optional(),
  calculation: z.number().min(0).max(1).optional(),
  final_answer: z.number().min(0).max(1).optional(),
  reasoning: z.number().min(0).max(1).optional(),
  completeness: z.number().min(0).max(1).optional(),
});
export type LearnerConceptSkills = z.infer<typeof LearnerConceptSkillsSchema>;

export const RecentPerformanceItemSchema = z.object({
  questionId: z.string(),
  difficulty: AssessmentDifficultySchema,
  scorePercentage: z.number().min(0).max(100),
  evaluatedAt: z.string(),
  questionType: AssessmentQuestionTypeSchema,
});
export type RecentPerformanceItem = z.infer<typeof RecentPerformanceItemSchema>;

export const LearnerConceptMasterySchema = z.object({
  concept: z.string().min(1),
  subject: z.string().optional(),
  mastery: z.number().min(0).max(1).default(0.5),
  confidence: z.number().min(0).max(1).default(0.5),
  skills: LearnerConceptSkillsSchema.default({
    understanding: 0.5,
    method_selection: 0.5,
  }),
  recentPerformance: z.array(RecentPerformanceItemSchema).default([]),
  misconceptions: z.array(z.string()).default([]),
  lastEvaluatedAt: z.string().optional(),
});
export type LearnerConceptMastery = z.infer<typeof LearnerConceptMasterySchema>;

export const LearnerAssessmentStateSchema = z.object({
  userId: z.string().min(1),
  concepts: z.record(LearnerConceptMasterySchema).default({}),
  overallMastery: z.number().min(0).max(1).optional(),
  updatedAt: z.string(),
});
export type LearnerAssessmentState = z.infer<typeof LearnerAssessmentStateSchema>;

// Assessment Generation Request DTO
export const CreateAssessmentRequestSchema = z.object({
  concept: z.string().min(1, 'concept is required'),
  subject: z.string().min(1, 'subject is required'),
  grade: z.string().optional(),
  difficulty: AssessmentDifficultySchema.optional(),
  questionType: AssessmentQuestionTypeSchema.optional(),
  evaluationMode: AssessmentEvaluationModeSchema.optional(),
  marks: z.number().int().positive().optional(),
  goal: AssessmentGoalSchema.optional(),
  sessionId: z.string().optional(),
  targetSkill: z.string().optional(),
  targetMisconception: z.string().optional(),
  adaptiveContext: z.record(z.unknown()).optional(),
});
export type CreateAssessmentRequest = z.infer<typeof CreateAssessmentRequestSchema>;

// ==========================================
// M7 Phase 4: Sessions, Bookmarks, Wrong Questions & Analytics
// ==========================================

export const AssessmentSessionStatusSchema = z.enum([
  'CREATED',
  'IN_PROGRESS',
  'PAUSED',
  'COMPLETED',
  'ABANDONED',
]);
export type AssessmentSessionStatus = z.infer<typeof AssessmentSessionStatusSchema>;

export const AssessmentSessionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  subject: z.string().min(1),
  grade: z.string().optional(),
  topic: z.string().optional(),
  concepts: z.array(z.string()).default([]),
  goal: z.string().default('practice'),
  mode: z.string().default('adaptive'),
  startingDifficulty: AssessmentDifficultySchema.default('medium'),
  currentQuestionId: z.string().optional(),
  questionIds: z.array(z.string()).default([]),
  attemptedQuestionCount: z.number().int().min(0).default(0),
  correctCount: z.number().int().min(0).default(0),
  totalMarks: z.number().min(0).default(0),
  earnedMarks: z.number().min(0).default(0),
  accuracy: z.number().min(0).max(100).default(0),
  status: AssessmentSessionStatusSchema.default('CREATED'),
  startedAt: z.string(),
  lastActivityAt: z.string(),
  completedAt: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type AssessmentSession = z.infer<typeof AssessmentSessionSchema>;

export const CreateAssessmentSessionRequestSchema = z.object({
  subject: z.string().min(1, 'subject is required'),
  grade: z.string().optional(),
  topic: z.string().optional(),
  concepts: z.array(z.string()).default([]),
  goal: z.string().optional(),
  mode: z.string().optional(),
  startingDifficulty: AssessmentDifficultySchema.optional(),
  totalQuestionGoal: z.number().int().positive().optional(),
});
export type CreateAssessmentSessionRequest = z.infer<typeof CreateAssessmentSessionRequestSchema>;

// Bookmark / Saved Question
export const AssessmentBookmarkSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  questionId: z.string().min(1),
  savedAt: z.string(),
  notes: z.string().optional(),
  question: AssessmentQuestionSchema.optional(),
});
export type AssessmentBookmark = z.infer<typeof AssessmentBookmarkSchema>;

// Wrong Question Collection & Spaced Reattempt Review
export const WrongQuestionReviewStatusSchema = z.enum([
  'ACTIVE',
  'SCHEDULED',
  'MASTERED',
  'DISMISSED',
]);
export type WrongQuestionReviewStatus = z.infer<typeof WrongQuestionReviewStatusSchema>;

export const WrongAssessmentQuestionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  questionId: z.string().min(1),
  submissionId: z.string().min(1),
  subject: z.string().min(1),
  concept: z.string().min(1),
  difficulty: AssessmentDifficultySchema,
  questionType: AssessmentQuestionTypeSchema,
  score: z.number().min(0),
  maxScore: z.number().min(0),
  percentage: z.number().min(0).max(100),
  misconceptions: z.array(z.string()).default([]),
  weakSkills: z.array(z.string()).default([]),
  attemptCount: z.number().int().min(1).default(1),
  firstFailedAt: z.string(),
  lastAttemptedAt: z.string(),
  nextReviewAt: z.string().optional(),
  reviewStatus: WrongQuestionReviewStatusSchema.default('ACTIVE'),
  question: AssessmentQuestionSchema.optional(),
});
export type WrongAssessmentQuestion = z.infer<typeof WrongAssessmentQuestionSchema>;

// Assessment Analytics
export const AssessmentAnalyticsSchema = z.object({
  totalAttempts: z.number().int().min(0),
  totalQuestions: z.number().int().min(0),
  overallAccuracy: z.number().min(0).max(100),
  averageScore: z.number().min(0),
  totalTimeSpentMs: z.number().min(0),
  averageTimePerQuestionMs: z.number().min(0),
  bySubject: z.record(
    z.object({
      attempted: z.number().int().min(0),
      correct: z.number().int().min(0),
      accuracy: z.number().min(0).max(100),
      avgScore: z.number().min(0),
    })
  ),
  byConcept: z.record(
    z.object({
      attempted: z.number().int().min(0),
      correct: z.number().int().min(0),
      accuracy: z.number().min(0).max(100),
      mastery: z.number().min(0).max(1),
    })
  ),
  byDifficulty: z.record(
    z.object({
      attempted: z.number().int().min(0),
      correct: z.number().int().min(0),
      accuracy: z.number().min(0).max(100),
    })
  ),
  byQuestionType: z.record(
    z.object({
      attempted: z.number().int().min(0),
      correct: z.number().int().min(0),
      accuracy: z.number().min(0).max(100),
    })
  ),
  skillBreakdown: z.record(z.number().min(0).max(1)),
  commonMisconceptions: z.array(
    z.object({
      misconception: z.string(),
      count: z.number().int().min(1),
    })
  ),
});
export type AssessmentAnalytics = z.infer<typeof AssessmentAnalyticsSchema>;

export type AssessmentSubmissionResponse = ApiResponse<AssessmentSubmission>;
export type AssessmentQuestionResponse = ApiResponse<ClientAssessmentQuestion>;
export type EvaluationResultResponse = ApiResponse<EvaluationResult>;
export type AssessmentSessionResponse = ApiResponse<AssessmentSession>;
export type AssessmentSessionListResponse = ApiResponse<AssessmentSession[]>;
export type AssessmentBookmarkResponse = ApiResponse<AssessmentBookmark>;
export type AssessmentBookmarkListResponse = ApiResponse<AssessmentBookmark[]>;
export type WrongQuestionListResponse = ApiResponse<WrongAssessmentQuestion[]>;
export type AssessmentAnalyticsResponse = ApiResponse<AssessmentAnalytics>;
