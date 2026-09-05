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

export const TutorActionTypeSchema = z.enum([
  'SPEAK',
  'ASK_CONVERSATIONAL',
  'ASK_ASSESSMENT',
  'WAIT_FOR_ANSWER',
  'EXPLAIN',
  'CONTINUE_TEACHING',
  // Phase 3.5: Replay & Session Memory
  'REPLAY_EXPLANATION',
]);
export type TutorActionType = z.infer<typeof TutorActionTypeSchema>;

export const TutorActionSchema = z.object({
  type: TutorActionTypeSchema,
  questionType: z.enum(['MCQ', 'SHORT_ANSWER', 'LONG_ANSWER', 'NUMERICAL', 'IMAGE_SOLUTION']).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  reason: z.string().optional(),
  questionId: z.string().optional(),
});
export type TutorAction = z.infer<typeof TutorActionSchema>;

export const TutorVisualTypeSchema = z.enum([
  'NONE',
  'TITLE',
  'TEXT',
  'DIAGRAM',
  'FORMULA',
  'EXAMPLE',
  'COMPARISON',
  'PROCESS',
  'HIGHLIGHT',
  'RECAP',
  'QUESTION_PROMPT',
  'ILLUSTRATION',
  // Phase 3: Visual Intelligence vocabulary
  'FLOWCHART',
  'PROCESS_ANIMATION',
  'WORKED_EXAMPLE',
  'PDF_ASSET',
  'IMAGE_ASSET',
]);
export type TutorVisualType = z.infer<typeof TutorVisualTypeSchema>;

export const TutorVisualDataSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  heading: z.string().optional(),
  text: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  diagramType: z.string().optional(),
  diagramData: z.record(z.unknown()).optional(),
  formula: z.string().optional(),
  formulaLabel: z.string().optional(),
  formulaExplanation: z.string().optional(),
  variables: z.array(
    z.object({
      symbol: z.string(),
      meaning: z.string(),
    })
  ).optional(),
  // Phase 3 extensions:
  // Flowchart
  nodes: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      subtext: z.string().optional(),
      type: z.enum(['start', 'step', 'decision', 'result', 'highlight']).default('step'),
    })
  ).optional(),
  edges: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
      label: z.string().optional(),
    })
  ).optional(),
  // Comparison
  comparison: z.object({
    leftTitle: z.string(),
    rightTitle: z.string(),
    items: z.array(
      z.object({
        feature: z.string(),
        leftValue: z.string(),
        rightValue: z.string(),
      })
    ),
  }).optional(),
  // Worked Example
  workedExample: z.object({
    problem: z.string(),
    given: z.array(z.string()).optional(),
    formulaUsed: z.string().optional(),
    steps: z.array(
      z.object({
        stepNumber: z.number().int(),
        description: z.string(),
        expression: z.string(),
      })
    ),
    finalAnswer: z.string(),
  }).optional(),
  // Process Animation
  processAnimation: z.object({
    title: z.string(),
    stages: z.array(
      z.object({
        stageNumber: z.number().int(),
        label: z.string(),
        description: z.string(),
        highlightState: z.string().optional(),
      })
    ),
    animationType: z.enum(['step', 'flow', 'cycle', 'linear', 'fade', 'ray_bend']).default('step'),
  }).optional(),
  // External / PDF asset reference
  assetUrl: z.string().optional(),
  assetId: z.string().optional(),
  caption: z.string().optional(),
}).passthrough().optional();
export type TutorVisualData = z.infer<typeof TutorVisualDataSchema>;

export const TeachingVisualPayloadSchema = z.object({
  type: TutorVisualTypeSchema.default('TITLE'),
  data: TutorVisualDataSchema.optional(),
});
export type TeachingVisualPayload = z.infer<typeof TeachingVisualPayloadSchema>;

// Phase 3: Visual Strategy options
export const VisualStrategySchema = z.enum([
  'TEXT_EXPLANATION',
  'DIAGRAM',
  'FLOWCHART',
  'ILLUSTRATION',
  'PROCESS_ANIMATION',
  'COMPARISON',
  'FORMULA',
  'WORKED_EXAMPLE',
  'HIGHLIGHT',
  'RECAP',
  'PDF_ASSET',
  'IMAGE_ASSET',
  'MIXED',
]);
export type VisualStrategy = z.infer<typeof VisualStrategySchema>;

// Phase 2.6: Single visual beat within a multi-beat concept sequence
export const VisualBeatSchema = z.object({
  beatIndex: z.number().int().min(0),
  type: TutorVisualTypeSchema,
  data: TutorVisualDataSchema,
  // Suggested milliseconds to display this beat before auto-advancing (0 = no auto-advance)
  durationHint: z.number().min(0).default(0),
  transitionIn: z.enum(['fade', 'slide', 'pop', 'morph', 'draw', 'highlight']).default('fade'),
  // Optional term to emphasize (used by HighlightScene and FormulaScene)
  emphasis: z.string().optional(),
  assetId: z.string().optional(),
});
export type VisualBeat = z.infer<typeof VisualBeatSchema>;

// Phase 2.6: Ordered sequence of visual beats for a single teaching turn
export const VisualBeatSequenceSchema = z.object({
  turnId: z.string(),
  conceptId: z.string().optional(),
  beats: z.array(VisualBeatSchema).min(1),
  activeBeatIndex: z.number().int().min(0).default(0),
});
export type VisualBeatSequence = z.infer<typeof VisualBeatSequenceSchema>;

// Phase 3: Visual Plan generated by the Visual Strategy Engine
export const VisualPlanSchema = z.object({
  conceptId: z.string().optional(),
  turnId: z.string(),
  strategy: VisualStrategySchema,
  reason: z.string().optional(),
  beats: z.array(VisualBeatSchema),
  assetIds: z.array(z.string()).default([]),
});
export type VisualPlan = z.infer<typeof VisualPlanSchema>;

// Phase 3: Visual Asset origin and metadata contracts
export const VisualAssetSourceSchema = z.enum([
  'REMOTION_NATIVE',
  'UPLOADED_DOCUMENT',
  'UPLOADED_IMAGE',
  'GENERATED',
  'REMOTE',
]);
export type VisualAssetSource = z.infer<typeof VisualAssetSourceSchema>;

export const VisualAssetSchema = z.object({
  assetId: z.string(),
  source: VisualAssetSourceSchema,
  url: z.string().optional(),
  mimeType: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  conceptIds: z.array(z.string()).default([]),
  topic: z.string().optional(),
  pageNumber: z.number().optional(),
  documentId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string(),
});
export type VisualAsset = z.infer<typeof VisualAssetSchema>;

// Phase 3: Visual History and Timeline Contracts
export const VisualHistoryEntrySchema = z.object({
  visualId: z.string(),
  sessionId: z.string(),
  turnId: z.string(),
  conceptId: z.string().optional(),
  strategy: VisualStrategySchema,
  beats: z.array(VisualBeatSchema),
  assetIds: z.array(z.string()).default([]),
  createdAt: z.string(),
  durationMs: z.number().optional(),
  replayable: z.boolean().default(true),
  speechText: z.string().optional(),
  displayText: z.string().optional(),
  captionText: z.string().optional(),
});
export type VisualHistoryEntry = z.infer<typeof VisualHistoryEntrySchema>;

export const VisualTimelineEntrySchema = z.object({
  visualId: z.string(),
  turnId: z.string(),
  conceptId: z.string().optional(),
  startedAt: z.string(),
  endedAt: z.string().optional(),
  strategy: VisualStrategySchema,
  beatCount: z.number(),
  title: z.string().optional(),
  firstBeatType: TutorVisualTypeSchema.optional(),
});
export type VisualTimelineEntry = z.infer<typeof VisualTimelineEntrySchema>;

export const VisualSessionTimelineSchema = z.object({
  sessionId: z.string(),
  entries: z.array(VisualTimelineEntrySchema),
});
export type VisualSessionTimeline = z.infer<typeof VisualSessionTimelineSchema>;

// ==========================================
// Phase 3.5: Replay & Session Memory Contracts
// ==========================================

export const ReplaySegmentSchema = z.object({
  segmentId: z.string(),
  sessionId: z.string(),
  turnId: z.string(),
  conceptId: z.string().optional(),
  concept: z.string(),
  title: z.string().optional(),
  speechText: z.string(),
  displayText: z.string(),
  captionText: z.string().optional(),
  visualPlan: VisualPlanSchema.optional(),
  visualBeats: z.array(VisualBeatSchema).default([]),
  assetIds: z.array(z.string()).default([]),
  durationMs: z.number().optional(),
  replayable: z.boolean().default(true),
  createdAt: z.string(),
});
export type ReplaySegment = z.infer<typeof ReplaySegmentSchema>;

export const ReplayRequestSchema = z.object({
  segmentId: z.string().optional(),
  conceptId: z.string().optional(),
  query: z.string().optional(),
  mode: z.enum(['DETERMINISTIC', 'RE_EXPLAIN']).default('DETERMINISTIC'),
});
export type ReplayRequest = z.infer<typeof ReplayRequestSchema>;

export const ReplayResponseSchema = z.object({
  segment: ReplaySegmentSchema.optional(),
  deterministic: z.boolean(),
  mode: z.enum(['DETERMINISTIC', 'RE_EXPLAIN']),
  speechText: z.string(),
  displayText: z.string(),
  captionText: z.string().optional(),
  visualBeats: z.array(VisualBeatSchema).default([]),
  turnId: z.string(),
  concept: z.string(),
  message: z.string().optional(),
});
export type ReplayResponse = z.infer<typeof ReplayResponseSchema>;

export const SessionMemorySchema = z.object({
  sessionId: z.string(),
  topic: z.string(),
  subject: z.string().default('General'),
  conceptsCovered: z.array(z.string()).default([]),
  segments: z.array(ReplaySegmentSchema).default([]),
  totalDurationMs: z.number().default(0),
  startedAt: z.string(),
  updatedAt: z.string(),
});
export type SessionMemory = z.infer<typeof SessionMemorySchema>;

export const ConceptMemorySchema = z.object({
  conceptId: z.string(),
  conceptTitle: z.string(),
  segmentIds: z.array(z.string()).default([]),
  segments: z.array(ReplaySegmentSchema).default([]),
  keyFormulas: z.array(z.string()).default([]),
  firstExplainedAt: z.string().optional(),
  lastExplainedAt: z.string().optional(),
});
export type ConceptMemory = z.infer<typeof ConceptMemorySchema>;

export const TeacherResponseSchema = z.object({
  responseText: z.string().min(1),
  language: z.enum(['english', 'hindi', 'hinglish']).default('english'),
  intent: TeacherIntentSchema,
  teachingAction: TeachingActionSchema,
  action: TutorActionSchema.optional(),
  assessment: AssessmentResultSchema.optional(),
  stateUpdate: TeachingStateSchema.partial().optional(),
  // Phase 2.5: Multi-Channel Content Separation
  speechText: z.string().optional(),
  captionText: z.string().optional(),
  visual: TeachingVisualPayloadSchema.optional(),
  teachingContent: z.lazy(() => TeachingContentSchema).optional(),
  // Phase 2.6: Display & multi-beat channels
  displayText: z.string().optional(),
  visualBeats: z.array(VisualBeatSchema).optional(),
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
export const TeachingSessionStatusSchema = z.enum(['created', 'active', 'paused', 'completed']);
export type TeachingSessionStatus = z.infer<typeof TeachingSessionStatusSchema>;

export const AssessmentInteractionStatusSchema = z.enum([
  'NONE',
  'GENERATING',
  'WAITING_FOR_STUDENT',
  'SUBMITTING',
  'EVALUATING',
  'COMPLETED',
]);
export type AssessmentInteractionStatus = z.infer<typeof AssessmentInteractionStatusSchema>;

export const TutorConversationMessageSchema = z.object({
  id: z.string().optional(),
  turnId: z.string().optional(),
  role: z.enum(['student', 'tutor']),
  type: z.enum(['voice', 'text', 'assessment', 'system']).default('text'),
  text: z.string().min(1),
  intent: TeacherIntentSchema.optional(),
  concept: z.string().optional(),
  questionId: z.string().optional(),
  assessmentSessionId: z.string().optional(),
  timestamp: z.string(),
});
// ==========================================
// 4b. Lesson Planner 2.0 Contracts (Adaptive Teaching Blueprint)
// ==========================================

export const ConceptDepthSchema = z.enum(['INTRODUCTORY', 'STANDARD', 'DEEP']);
export type ConceptDepth = z.infer<typeof ConceptDepthSchema>;

export const LessonSegmentTypeSchema = z.enum([
  'HOOK',
  'EXPLANATION',
  'EXAMPLE',
  'VISUAL_DEMONSTRATION',
  'CONVERSATIONAL_CHECK',
  'FORMAL_ASSESSMENT',
  'RECAP',
  'APPLICATION',
]);
export type LessonSegmentType = z.infer<typeof LessonSegmentTypeSchema>;

export const VisualRetentionTechniqueSchema = z.enum([
  'REAL_WORLD_HOOK',
  'ANALOGY',
  'STEP_BY_STEP_REVEAL',
  'CONTRAST',
  'HIGHLIGHT',
  'PROGRESSIVE_DIAGRAM',
  'EXAMPLE',
  'MISCONCEPTION_REVEAL',
  'RECAP',
  'QUICK_CHECK',
]);
export type VisualRetentionTechnique = z.infer<typeof VisualRetentionTechniqueSchema>;

export const BlueprintVisualTypeSchema = z.enum([
  'TITLE',
  'TEXT',
  'DIAGRAM',
  'FORMULA',
  'EXAMPLE',
  'COMPARISON',
  'PROCESS',
  'HIGHLIGHT',
  'RECAP',
  'QUESTION_PROMPT',
  'ILLUSTRATION',
  'TIMELINE',
  'GRAPH',
  'NONE',
]);
export type BlueprintVisualType = z.infer<typeof BlueprintVisualTypeSchema>;

export const VisualSegmentSchema = z.object({
  id: z.string(),
  conceptId: z.string(),
  purpose: z.string(),
  visualType: BlueprintVisualTypeSchema,
  retentionTechnique: VisualRetentionTechniqueSchema.default('STEP_BY_STEP_REVEAL'),
  keyElements: z.array(z.string()).default([]),
  continuityNote: z.string().optional(),
  buildsUponSegmentId: z.string().optional(),
});
export type VisualSegment = z.infer<typeof VisualSegmentSchema>;

export const AssessmentOpportunityReasonSchema = z.enum([
  'CONCEPT_CHECK',
  'MISCONCEPTION_CHECK',
  'APPLICATION_CHECK',
  'EXAM_PRACTICE',
  'STUDENT_REQUEST',
  'HIGH_YIELD',
]);
export type AssessmentOpportunityReason = z.infer<typeof AssessmentOpportunityReasonSchema>;

export const LessonSegmentSchema = z.object({
  id: z.string(),
  conceptId: z.string(),
  title: z.string(),
  type: LessonSegmentTypeSchema,
  purpose: z.string(),
  teachingObjective: z.string(),
  teachingIntent: z.string().optional(),
  estimatedMinutes: z.number().positive(),
  estimatedDuration: z.number().positive().optional(),
  teacherFocus: z.string(),
  keyTeachingPoints: z.array(z.string()).default([]),
  visualRequirementIds: z.array(z.string()).default([]),
  visualSequence: z.array(VisualSegmentSchema).default([]),
  assessmentOpportunityIds: z.array(z.string()).default([]),
  conversationalCheck: z.object({
    possible: z.boolean().default(false),
    promptHint: z.string().optional(),
    promptQuestion: z.string().optional(),
  }).optional(),
  formalAssessmentOpportunity: z.object({
    possible: z.boolean().default(false),
    reason: AssessmentOpportunityReasonSchema.optional(),
    recommendedType: z.string().optional(),
  }).optional(),
  completionCriteria: z.string(),
});
export type LessonSegment = z.infer<typeof LessonSegmentSchema>;
export type TeachingSegment = LessonSegment;
export const TeachingSegmentSchema = LessonSegmentSchema;

export const LessonLearningObjectiveSchema = z.object({
  primary: z.string(),
  secondary: z.array(z.string()).default([]),
  measurableOutcomes: z.array(z.string()).default([]),
});
export type LessonLearningObjective = z.infer<typeof LessonLearningObjectiveSchema>;

export const LessonTimeModeSchema = z.enum(['RAPID', 'STANDARD', 'DEEP']);
export type LessonTimeMode = z.infer<typeof LessonTimeModeSchema>;

export const LessonTimePlanSchema = z.object({
  requestedMinutes: z.number().positive(),
  estimatedMinutes: z.number().positive(),
  mode: LessonTimeModeSchema,
});
export type LessonTimePlan = z.infer<typeof LessonTimePlanSchema>;

export const TeachingApproachSchema = z.enum([
  'CONCEPT_FIRST',
  'EXAM_FIRST',
  'EXAMPLE_FIRST',
  'PROBLEM_FIRST',
  'MIXED',
]);
export type TeachingApproach = z.infer<typeof TeachingApproachSchema>;

export const ExplanationDepthSchema = z.enum(['MINIMAL', 'STANDARD', 'DETAILED']);
export type ExplanationDepth = z.infer<typeof ExplanationDepthSchema>;

export const InteractionLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export type InteractionLevel = z.infer<typeof InteractionLevelSchema>;

export const TeachingStrategySchema = z.object({
  approach: TeachingApproachSchema,
  explanationDepth: ExplanationDepthSchema,
  interactionLevel: InteractionLevelSchema,
  examFocus: z.number().min(0).max(1),
  conceptualFocus: z.number().min(0).max(1),
});
export type TeachingStrategy = z.infer<typeof TeachingStrategySchema>;

export const ConceptImportanceSchema = z.enum([
  'CORE',
  'IMPORTANT',
  'SUPPORTING',
  'OPTIONAL',
]);
export type ConceptImportance = z.infer<typeof ConceptImportanceSchema>;

export const ExamRelevanceSchema = z.enum(['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN']);
export type ExamRelevance = z.infer<typeof ExamRelevanceSchema>;

export const LessonConceptSchema = z.object({
  id: z.string(),
  conceptId: z.string().optional(),
  title: z.string(),
  summary: z.string(),
  purpose: z.string().optional(),
  importance: ConceptImportanceSchema,
  prerequisiteConceptIds: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  estimatedMinutes: z.number().positive(),
  depth: ConceptDepthSchema.default('STANDARD'),
  teachingApproach: TeachingApproachSchema.default('CONCEPT_FIRST'),
  examRelevance: ExamRelevanceSchema.default('HIGH'),
  keyPoints: z.array(z.string()).default([]),
  commonMisconceptions: z.array(z.string()).default([]),
  conversationalCheckOpportunity: z.boolean().default(false),
  formalAssessmentOpportunity: z.boolean().default(false),
  sourceReferences: z.array(z.string()).default([]),
  visualRequirements: z.array(z.string()).default([]),
  visualSegmentIds: z.array(z.string()).default([]),
  visualSegments: z.array(VisualSegmentSchema).default([]),
  assessmentOpportunity: z.boolean().default(false),
  segments: z.array(LessonSegmentSchema).default([]),
});
export type LessonConcept = z.infer<typeof LessonConceptSchema>;

export const LessonAssessmentOpportunitySchema = z.object({
  id: z.string().optional(),
  conceptId: z.string(),
  reason: AssessmentOpportunityReasonSchema,
  recommendedQuestionTypes: z.array(
    z.enum([
      'MCQ',
      'SHORT_ANSWER',
      'LONG_ANSWER',
      'NUMERICAL',
      'IMAGE_SOLUTION',
    ])
  ),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
});
export type LessonAssessmentOpportunity = z.infer<typeof LessonAssessmentOpportunitySchema>;

export const VisualPrioritySchema = z.enum(['ESSENTIAL', 'HELPFUL', 'OPTIONAL']);
export type VisualPriority = z.infer<typeof VisualPrioritySchema>;

export const LessonVisualRequirementSchema = z.object({
  id: z.string().optional(),
  conceptId: z.string(),
  required: z.boolean(),
  priority: VisualPrioritySchema,
  visualType: BlueprintVisualTypeSchema,
  purpose: z.string(),
  keyElements: z.array(z.string()).default([]),
});
export type LessonVisualRequirement = z.infer<typeof LessonVisualRequirementSchema>;

export const MarksPotentialSchema = z.enum([
  'VERY_HIGH',
  'HIGH',
  'MEDIUM',
  'LOW',
  'UNKNOWN',
]);
export type MarksPotential = z.infer<typeof MarksPotentialSchema>;

export const LessonPrioritySchema = z.object({
  conceptId: z.string(),
  conceptualImportance: z.number().min(0).max(1),
  examImportance: z.number().min(0).max(1),
  marksPotential: MarksPotentialSchema,
  priorityReason: z.string(),
});
export type LessonPriority = z.infer<typeof LessonPrioritySchema>;

export const OpeningStrategySchema = z.enum([
  'CONTEXT_HOOK',
  'DIRECT_EXPLANATION',
  'EXAM_HOOK',
  'QUESTION_HOOK',
  'REAL_WORLD_EXAMPLE',
]);
export type OpeningStrategy = z.infer<typeof OpeningStrategySchema>;

export const ClosingStrategySchema = z.enum([
  'RECAP',
  'FORMAL_ASSESSMENT',
  'EXAM_PRACTICE',
  'NEXT_TOPIC',
  'REVISION_RECOMMENDATION',
]);
export type ClosingStrategy = z.infer<typeof ClosingStrategySchema>;

export const AssessmentStrategySchema = z.object({
  conversationalCheckFrequency: z.string().default('PERIODIC'),
  formalAssessmentThreshold: z.string().default('AT_KEY_CHECKPOINTS'),
  restrictedConditions: z.array(z.string()).default([
    'IMMEDIATELY_AFTER_EVERY_CONCEPT',
    'DURING_EXPLANATION',
    'WHEN_STUDENT_IS_STRUGGLING',
    'WHILE_ASSESSMENT_ACTIVE',
  ]),
  highYieldCheckpoints: z.array(z.string()).default([]),
});
export type AssessmentStrategy = z.infer<typeof AssessmentStrategySchema>;

export const ConceptVisualPlanSchema = z.object({
  conceptId: z.string(),
  segments: z.array(VisualSegmentSchema),
});
export type ConceptVisualPlan = z.infer<typeof ConceptVisualPlanSchema>;

export const VisualLessonPlanSchema = z.object({
  conceptVisualPlans: z.array(ConceptVisualPlanSchema).default([]),
  continuityGuidelines: z.string().default('Maintain visual continuity across scenes and progressive reveals.'),
  overallPacingStrategy: z.string().default('Change visual scenes on pedagogical events rather than arbitrary timers.'),
});
export type VisualLessonPlan = z.infer<typeof VisualLessonPlanSchema>;

export const LessonBlueprintSchema = z.object({
  id: z.string(),
  sessionId: z.string().optional(),
  topic: z.string().min(1),
  subject: z.string().default('General'),
  language: z.enum(['english', 'hindi', 'hinglish']).default('english'),
  learnerLevel: z.string().default('General'),
  learningObjective: LessonLearningObjectiveSchema,
  availableTime: LessonTimePlanSchema.optional(),
  timePlan: LessonTimePlanSchema,
  teachingStrategy: TeachingStrategySchema,
  conceptSequence: z.array(LessonConceptSchema).min(1),
  importantConcepts: z.array(z.string()).default([]),
  highYieldPriorities: z.array(LessonPrioritySchema).default([]),
  examPriorities: z.array(LessonPrioritySchema).default([]),
  assessmentStrategy: AssessmentStrategySchema.default({}),
  visualLessonPlan: VisualLessonPlanSchema.default({}),
  assessmentOpportunities: z.array(LessonAssessmentOpportunitySchema).default([]),
  visualRequirements: z.array(LessonVisualRequirementSchema).default([]),
  openingStrategy: OpeningStrategySchema,
  closingStrategy: ClosingStrategySchema,
  sourceDocumentIds: z.array(z.string()).default([]),
  version: z.number().int().default(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type LessonBlueprint = z.infer<typeof LessonBlueprintSchema>;

export const LessonProgressStateSchema = z.object({
  currentConceptId: z.string().optional(),
  currentSegmentId: z.string().optional(),
  completedConceptIds: z.array(z.string()).default([]),
  completedSegmentIds: z.array(z.string()).default([]),
  skippedConceptIds: z.array(z.string()).default([]),
  conceptsNeedingWork: z.array(z.string()).default([]),
  remainingMinutes: z.number().nonnegative().optional(),
  usedAssessmentOpportunityConceptIds: z.array(z.string()).default([]),
  shownVisualRequirementConceptIds: z.array(z.string()).default([]),
  replanningHistory: z.array(
    z.object({
      reason: z.string(),
      timestamp: z.string(),
      previousConceptId: z.string().optional(),
      adjustedConceptIds: z.array(z.string()),
    })
  ).default([]),
});
export type LessonProgressState = z.infer<typeof LessonProgressStateSchema>;

export const CreateLessonBlueprintRequestSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  subject: z.string().optional(),
  learnerProfile: LearnerProfileSchema.optional(),
  sessionId: z.string().optional(),
  availableMinutes: z.number().positive().default(30),
  learningGoal: z.string().optional(),
  documentId: z.string().optional(),
  knowledgeContext: KnowledgeContextSchema.optional(),
});
export type CreateLessonBlueprintRequest = z.infer<typeof CreateLessonBlueprintRequestSchema>;

export const ReplanLessonRequestSchema = z.object({
  reason: z.string().min(1, 'Reason for replanning is required'),
  remainingMinutes: z.number().positive().optional(),
  studentFeedback: z.string().optional(),
  focusAdjustment: z.enum([
    'DEEPER_UNDERSTANDING',
    'EXAM_FOCUS',
    'SIMPLIFIED',
    'SPEED_UP',
    'REVISIT_MISCONCEPTIONS',
  ]).optional(),
});
export type ReplanLessonRequest = z.infer<typeof ReplanLessonRequestSchema>;

export const TeachingSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  topic: z.string().min(1),
  subject: z.string().default('General'),
  learnerProfile: LearnerProfileSchema,
  status: TeachingSessionStatusSchema.default('active'),
  currentConcept: z.string().optional(),
  language: z.enum(['english', 'hindi', 'hinglish']).default('english'),
  documentId: z.string().optional(),
  documentTitle: z.string().optional(),
  teachingState: TeachingStateSchema,
  currentMode: z.enum(['TEACHING', 'ASSESSMENT', 'FEEDBACK', 'REVIEW']).default('TEACHING'),
  lessonBlueprint: LessonBlueprintSchema.optional(),
  lessonProgress: LessonProgressStateSchema.optional(),
  assessmentSessionId: z.string().optional(),
  currentQuestionId: z.string().optional(),
  assessmentStatus: AssessmentInteractionStatusSchema.optional(),
  progressSummary: z.string().optional(),
  conversationHistory: z.array(TutorConversationMessageSchema).default([]),
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

export const TutorSessionContextSchema = z.object({
  sessionId: z.string().min(1),
  userId: z.string().min(1),
  subject: z.string().default('General'),
  topic: z.string().min(1),
  language: z.enum(['english', 'hindi', 'hinglish']).default('english'),
  documentId: z.string().optional(),
  documentTitle: z.string().optional(),
  conversationHistory: z.array(TutorConversationMessageSchema).default([]),
  activeConcept: z.string().min(1),
  teachingState: TeachingStateSchema,
  lessonBlueprint: LessonBlueprintSchema.optional(),
  lessonProgress: LessonProgressStateSchema.optional(),
  assessmentSessionId: z.string().optional(),
  currentQuestionId: z.string().optional(),
  currentMode: TutorSessionModeSchema.default('TEACHING'),
  assessmentStatus: AssessmentInteractionStatusSchema.default('NONE'),
  turnId: z.string().optional(),
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

export const LegacyLessonPlanSchema = z.object({
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
export type LegacyLessonPlan = z.infer<typeof LegacyLessonPlanSchema>;

export const LessonPlanSchema = LessonBlueprintSchema.extend({
  // Backward-compatibility aliases and optional legacy fields
  title: z.string().optional(),
  targetLevel: z.string().optional(),
  learningObjectives: z.array(z.string()).optional(),
  estimatedDurationSeconds: z.number().optional(),
  scenes: z.array(LessonSceneSchema).optional(),
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
  assessmentQuestion: z.lazy(() => ClientAssessmentQuestionSchema).optional(),
  tutorAction: TutorActionSchema.optional(),
  turnId: z.string().optional(),
  // Phase 2.5: Multi-Channel Content Pipeline
  speechText: z.string().optional(),
  captionText: z.string().optional(),
  visualPayload: z.record(z.unknown()).optional(),
  teachingContent: z.lazy(() => TeachingContentSchema).optional(),
  latency: LatencyMetricsSchema.optional(),
  // Phase 2.6: Display channel + multi-beat orchestration
  displayText: z.string().optional(),
  visualBeats: z.array(VisualBeatSchema).optional(),
  // Phase 3: Visual Plan
  visualPlan: VisualPlanSchema.optional(),
});
export type VoiceInteractionResponse = z.infer<typeof VoiceInteractionResponseSchema>;

// DTO Schemas for API Requests
export const CreateSessionRequestSchema = z.object({
  topic: z.string().optional(),
  subject: z.string().optional(),
  documentId: z.string().optional(),
  documentTitle: z.string().optional(),
  learnerProfile: LearnerProfileSchema.optional(),
  availableMinutes: z.number().positive().optional(),
  learningGoal: z.string().optional(),
  planBlueprint: z.boolean().optional(),
});
export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;

export const UpdateSessionRequestSchema = z.object({
  status: TeachingSessionStatusSchema.optional(),
  currentConcept: z.string().optional(),
  currentMode: TutorSessionModeSchema.optional(),
  assessmentStatus: AssessmentInteractionStatusSchema.optional(),
  progressSummary: z.string().optional(),
});
export type UpdateSessionRequest = z.infer<typeof UpdateSessionRequestSchema>;

export const RespondSessionRequestSchema = z.object({
  message: z.string().min(1, 'Student message is required'),
  knowledgeContext: KnowledgeContextSchema.optional(),
  turnId: z.string().optional(),
});
export type RespondSessionRequest = z.infer<typeof RespondSessionRequestSchema>;

export const RespondSessionResponseSchema = z.object({
  teacherResponse: TeacherResponseSchema,
  teachingState: TeachingStateSchema,
  sessionContext: TutorSessionContextSchema.optional(),
  assessmentQuestion: z.lazy(() => ClientAssessmentQuestionSchema).optional(),
  tutorAction: TutorActionSchema.optional(),
  turnId: z.string().optional(),
  // Phase 2.5: Multi-Channel Content Pipeline
  speechText: z.string().optional(),
  captionText: z.string().optional(),
  visualPayload: z.record(z.unknown()).optional(),
  teachingContent: z.lazy(() => TeachingContentSchema).optional(),
  normalizedSpeechText: z.string().optional(),
  aiGenerationMs: z.number().optional(),
  // Phase 2.6: Display channel + multi-beat orchestration
  displayText: z.string().optional(),
  visualBeats: z.array(VisualBeatSchema).optional(),
  // Phase 3: Visual Plan
  visualPlan: VisualPlanSchema.optional(),
});
export type RespondSessionResponse = z.infer<typeof RespondSessionResponseSchema>;

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

export {
  normalizeTextForSpeech,
  formatFormulaForSpeech,
  cleanCaptionText,
  normalizeTextForDisplay,
  convertLatexToDisplay,
} from './speech-normalizer.js';

// ==========================================
// 6b. Conversational Voice Barge-In & State Rules
// ==========================================

export const VOICE_CONFIG = {
  // Minimum characters for a student utterance to trigger barge-in during speech
  BARGE_IN_MIN_TRANSCRIPT_LENGTH: 4,
  // Minimum words for standard barge-in
  BARGE_IN_MIN_WORDS: 1,
  // Instant trigger words that immediately stop tutor speech
  BARGE_IN_TRIGGER_WORDS: [
    'wait', 'stop', 'hold', 'pause', 'why', 'what', 'no', 'listen',
    'can', 'explain', 'but', 'how', 'sir', 'maam', 'question', 'doubt',
    'repeat', 'again', 'sorry', 'excuse', 'one sec', 'hold on'
  ],
  // Conversational silence interval marking end of student turn (ms)
  SILENCE_DEBOUNCE_MS: 1300,
  // Barge-in debounce before stopping TTS (ms)
  BARGE_IN_DEBOUNCE_MS: 200,
};

/**
 * Determines whether student speech during SPEAKING represents a meaningful interruption (barge-in)
 * or accidental background noise / audio bleed.
 */
export function isMeaningfulBargeIn(transcript: string, lastSpokenText?: string): boolean {
  const trimmed = transcript.trim().toLowerCase();
  if (!trimmed || trimmed.length < 2) return false;

  // Echo Prevention: If recognized speech is an exact substring of what tutor is currently saying, ignore
  if (lastSpokenText) {
    const normalizedSpoken = lastSpokenText.toLowerCase();
    if (normalizedSpoken.includes(trimmed) && trimmed.length < 15) {
      return false;
    }
  }

  // Check for trigger words
  const words = trimmed.split(/\s+/);
  const hasTriggerWord = words.some((w) => VOICE_CONFIG.BARGE_IN_TRIGGER_WORDS.includes(w));
  if (hasTriggerWord) {
    return true;
  }

  // Check length threshold
  return trimmed.length >= VOICE_CONFIG.BARGE_IN_MIN_TRANSCRIPT_LENGTH;
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
  teachingSessionId: z.string().optional(),
  assessmentSessionId: z.string().optional(),
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

// ==========================================
// 11. Milestone 7.7: Remotion Visual Classroom Contracts
// ==========================================

export const TutorVisualModeSchema = z.enum([
  'IDLE',
  'TEACHING',
  'ASSESSMENT',
  'FEEDBACK',
  'REVIEW',
]);
export type TutorVisualMode = z.infer<typeof TutorVisualModeSchema>;

export const TutorAvatarStateSchema = z.enum([
  'IDLE',
  'SPEAKING',
  'LISTENING',
  'THINKING',
  'INTERRUPTING',
]);
export type TutorAvatarState = z.infer<typeof TutorAvatarStateSchema>;

export const TutorVisualStateSchema = z.object({
  sessionId: z.string().default(''),
  topic: z.string().default('AI Tutor Classroom'),
  concept: z.string().optional(),
  mode: TutorVisualModeSchema.default('IDLE'),
  avatarState: TutorAvatarStateSchema.default('IDLE'),
  visualType: TutorVisualTypeSchema.default('TITLE'),
  visualData: TutorVisualDataSchema,
  captionText: z.string().optional(),
  // Phase 2.6: caption segmentation — array of sentence segments, cycled one at a time
  captionSegments: z.array(z.string()).optional(),
  activeCaptionIndex: z.number().default(0),
  highlightedText: z.string().optional(),
  turnId: z.string().optional(),
  lastUpdated: z.string().optional(),
  // Phase 2.6: multi-beat visual orchestration
  activeBeatIndex: z.number().default(0),
  totalBeats: z.number().default(1),
  // Phase 3: Accessibility toggle (default: false)
  captionsEnabled: z.boolean().default(false),
  visualStrategy: VisualStrategySchema.optional(),
});
export type TutorVisualState = z.infer<typeof TutorVisualStateSchema>;

// ==========================================
// 12. Phase 2.5 + 2.6: Teaching Content & Multi-Channel Turn Pipeline
// ==========================================
// Note: VisualBeatSchema and VisualBeatSequenceSchema are defined above (section 5b)
// to avoid forward-reference issues.

export const TeachingContentSchema = z.object({
  turnId: z.string().optional(),
  concept: z.string().optional(),
  speechText: z.string().min(1),
  captionText: z.string().optional(),
  // Phase 2.6: clean human-readable transcript text (no raw LaTeX, no phonetics)
  displayText: z.string().optional(),
  visual: TeachingVisualPayloadSchema.optional(),
  // Phase 2.6: multi-beat visual sequence
  visualBeats: z.array(VisualBeatSchema).optional(),
  // Phase 3: Visual Plan
  visualPlan: VisualPlanSchema.optional(),
});
export type TeachingContent = z.infer<typeof TeachingContentSchema>;

// ==========================================
// 13. Phase 4: Live Interactive Classroom & Conversation Orchestration
// ==========================================

export const StudentIntentSchema = z.enum([
  'TEACH',
  'QUESTION',
  'FOLLOW_UP',
  'CLARIFICATION',
  'REPLAY',
  'RE_EXPLAIN',
  'ASSESSMENT',
  'ANSWER',
  'SKIP',
  'PAUSE',
  'RESUME',
  'END_SESSION',
  'UNKNOWN',
]);
export type StudentIntent = z.infer<typeof StudentIntentSchema>;

export const ClassroomStateSchema = z.enum([
  'IDLE',
  'LISTENING',
  'THINKING',
  'SPEAKING',
  'INTERRUPTED',
  'ASSESSMENT',
  'REPLAYING',
  'ERROR',
]);
export type ClassroomState = z.infer<typeof ClassroomStateSchema>;

export const TutorEventTypeSchema = z.enum([
  'SESSION_STARTED',
  'STUDENT_SPEECH_STARTED',
  'STUDENT_INPUT_FINALIZED',
  'TUTOR_THINKING',
  'TUTOR_RESPONSE_READY',
  'TUTOR_SPEECH_STARTED',
  'VISUAL_BEAT_CHANGED',
  'TUTOR_INTERRUPTED',
  'TUTOR_SPEECH_COMPLETED',
  'REPLAY_STARTED',
  'REPLAY_COMPLETED',
  'ASSESSMENT_STARTED',
  'ASSESSMENT_COMPLETED',
  'SESSION_ENDED',
]);
export type TutorEventType = z.infer<typeof TutorEventTypeSchema>;

export const TutorEventSchema = z.object({
  type: TutorEventTypeSchema,
  sessionId: z.string(),
  turnId: z.string().optional(),
  timestamp: z.string(),
  payload: z.record(z.any()).optional(),
});
export type TutorEvent = z.infer<typeof TutorEventSchema>;

export const SessionSummarySchema = z.object({
  sessionId: z.string(),
  topic: z.string(),
  subject: z.string(),
  conceptsCovered: z.array(z.string()).default([]),
  keyFormulas: z.array(z.string()).default([]),
  weakConcepts: z.array(z.string()).default([]),
  strongConcepts: z.array(z.string()).default([]),
  totalDurationMs: z.number().default(0),
  turnCount: z.number().default(0),
  startedAt: z.string(),
  endedAt: z.string().optional(),
});
export type SessionSummary = z.infer<typeof SessionSummarySchema>;

// ==========================================
// 14. Phase 6A: Universal Teaching Architecture Contracts
// ==========================================
// Architectural Principles & Separation of Concerns:
//
// 1. ContentBlock = Semantic knowledge representation (WHAT is being taught)
//    - Pure semantic blocks (headings, definitions, formulas, steps, examples)
//    - Free from visual styling properties (NO colors, margins, fonts, or borders)
//
// 2. VisualIntent = Pedagogical visual purpose (WHY a visual is being shown)
//    - High-level intent (DIAGRAM, PROCESS, COMPARISON, FORMULA, GRAPH, etc.)
//    - Decoupled from any concrete component or library implementation
//
// 3. VisualTemplate = Concrete structural layout (HOW data is organized)
//    - Reusable, subject-agnostic structural templates (matrix, derivation, cartesian)
//    - Cross-disciplinary: identical comparison matrix for Biology, CS, and Economics
//
// 4. SubjectEnvironment = Atmospheric context (WHERE learning is situated)
//    - Subtle, low-opacity ambient cues (drafting grid for Math, lab slate for Chemistry)
//    - Never competes with pedagogical content hierarchy (opacity <= 5%)
//
// 5. Visual Primitives = Domain-agnostic building blocks
//    - Nodes, connectors, annotations, coordinate axes, data series, equation lines
//    - Layout-agnostic: LLM specifies semantic relationships, renderer computes geometry
//
// 6. AvatarDirective = Teaching choreography instructions
//    - Decoupled from Miko's low-level lifecycle state machine (SPEAKING, LISTENING)
//    - Directs framing, pointing gestures, and gaze target towards student or board
//
// 7. UniversalTeachingBeat = The single authoritative source of truth
//    - Encapsulates speech channels, semantic content, visual payload, and avatar directives
// ==========================================

// 14.1 Inline Content Semantics
export const InlineMarkSchema = z.enum([
  'bold',
  'italic',
  'highlight',
  'term',
  'variable',
  'emphasis',
  'definition',
]);
export type InlineMark = z.infer<typeof InlineMarkSchema>;

export const InlineContentSchema = z.object({
  text: z.string(),
  marks: z.array(InlineMarkSchema).optional(),
});
export type InlineContent = z.infer<typeof InlineContentSchema>;

// 14.2 Semantic Content Blocks
export const HeadingBlockSchema = z.object({
  type: z.literal('heading'),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  content: z.array(InlineContentSchema),
});
export type HeadingBlock = z.infer<typeof HeadingBlockSchema>;

export const ParagraphBlockSchema = z.object({
  type: z.literal('paragraph'),
  content: z.array(InlineContentSchema),
});
export type ParagraphBlock = z.infer<typeof ParagraphBlockSchema>;

export const DefinitionBlockSchema = z.object({
  type: z.literal('definition'),
  term: z.string(),
  definition: z.array(InlineContentSchema),
});
export type DefinitionBlock = z.infer<typeof DefinitionBlockSchema>;

export const FormulaBlockSchema = z.object({
  type: z.literal('formula'),
  latex: z.string(),
  explanation: z.array(InlineContentSchema).optional(),
});
export type FormulaBlock = z.infer<typeof FormulaBlockSchema>;

export const ListBlockSchema = z.object({
  type: z.literal('list'),
  ordered: z.boolean().default(false),
  items: z.array(z.array(InlineContentSchema)),
});
export type ListBlock = z.infer<typeof ListBlockSchema>;

export const QuoteBlockSchema = z.object({
  type: z.literal('quote'),
  content: z.array(InlineContentSchema),
  attribution: z.string().optional(),
});
export type QuoteBlock = z.infer<typeof QuoteBlockSchema>;

export const NoteBlockSchema = z.object({
  type: z.literal('note'),
  variant: z.enum(['info', 'observation', 'rule', 'warning', 'tip']).default('info'),
  content: z.array(InlineContentSchema),
});
export type NoteBlock = z.infer<typeof NoteBlockSchema>;

export const StepBlockSchema = z.object({
  type: z.literal('step'),
  stepNumber: z.number().int().min(1),
  title: z.string().optional(),
  content: z.array(InlineContentSchema),
});
export type StepBlock = z.infer<typeof StepBlockSchema>;

export const CodeBlockSchema = z.object({
  type: z.literal('code'),
  language: z.string(),
  code: z.string(),
  caption: z.string().optional(),
});
export type CodeBlock = z.infer<typeof CodeBlockSchema>;

export const TableBlockSchema = z.object({
  type: z.literal('table'),
  headers: z.array(z.array(InlineContentSchema)),
  rows: z.array(z.array(z.array(InlineContentSchema))),
});
export type TableBlock = z.infer<typeof TableBlockSchema>;

// Base non-recursive content block union
export const BaseContentBlockSchema = z.discriminatedUnion('type', [
  HeadingBlockSchema,
  ParagraphBlockSchema,
  DefinitionBlockSchema,
  FormulaBlockSchema,
  ListBlockSchema,
  QuoteBlockSchema,
  NoteBlockSchema,
  StepBlockSchema,
  CodeBlockSchema,
  TableBlockSchema,
]);
export type BaseContentBlock = z.infer<typeof BaseContentBlockSchema>;

export const ExampleBlockSchema = z.object({
  type: z.literal('example'),
  title: z.string().optional(),
  content: z.array(BaseContentBlockSchema),
});
export type ExampleBlock = z.infer<typeof ExampleBlockSchema>;

export const ContentBlockSchema = z.discriminatedUnion('type', [
  HeadingBlockSchema,
  ParagraphBlockSchema,
  DefinitionBlockSchema,
  FormulaBlockSchema,
  ListBlockSchema,
  ExampleBlockSchema,
  QuoteBlockSchema,
  NoteBlockSchema,
  StepBlockSchema,
  CodeBlockSchema,
  TableBlockSchema,
]);
export type ContentBlock = z.infer<typeof ContentBlockSchema>;

// 14.3 Visual Intent (Pedagogical Purpose)
export const VisualIntentSchema = z.enum([
  'EXPLANATION',
  'DIAGRAM',
  'PROCESS',
  'SIMULATION',
  'GRAPH',
  'FORMULA',
  'COMPARISON',
  'TIMELINE',
  'MAP',
  'MEDIA',
  'CODE',
  '3D_OBJECT',
]);
export type VisualIntent = z.infer<typeof VisualIntentSchema>;

// 14.4 Visual Template Identifiers
export const VisualTemplateSchema = z.enum([
  'template.explanation.editorial',
  'template.diagram.relational',
  'template.diagram.spatial',
  'template.process.sequential',
  'template.formula.derivation',
  'template.graph.cartesian',
  'template.comparison.matrix',
  'template.code.walkthrough',
  'template.timeline.historical',
  'template.media.grounded',
  'template.simulation.interactive',
]);
export type VisualTemplate = z.infer<typeof VisualTemplateSchema>;

// 14.5 Subject Environments
export const SubjectEnvironmentSchema = z.enum([
  'NEUTRAL',
  'MATHEMATICS',
  'PHYSICS',
  'CHEMISTRY',
  'BIOLOGY',
  'COMPUTER_SCIENCE',
  'HISTORY',
  'GEOGRAPHY',
  'LITERATURE',
  'ECONOMICS',
]);
export type SubjectEnvironment = z.infer<typeof SubjectEnvironmentSchema>;

// 14.6 Universal Visual Primitives
export const VisualPointSchema = z.object({
  x: z.number(),
  y: z.number(),
});
export type VisualPoint = z.infer<typeof VisualPointSchema>;

export const VisualNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  sublabel: z.string().optional(),
  category: z.enum(['primary', 'secondary', 'accent', 'neutral', 'muted']).optional(),
  position: VisualPointSchema.optional(),
  shape: z.enum(['box', 'circle', 'pill', 'diamond', 'card']).optional(),
  iconRef: z.string().optional(),
});
export type VisualNode = z.infer<typeof VisualNodeSchema>;

export const VisualConnectorSchema = z.object({
  id: z.string(),
  fromNodeId: z.string(),
  toNodeId: z.string(),
  label: z.string().optional(),
  style: z.enum(['solid', 'dashed', 'dotted']).optional(),
  directed: z.boolean().optional(),
  bidirectional: z.boolean().optional(),
});
export type VisualConnector = z.infer<typeof VisualConnectorSchema>;

export const VisualAnnotationSchema = z.object({
  id: z.string(),
  targetId: z.string().optional(),
  position: VisualPointSchema.optional(),
  text: z.string(),
  calloutType: z.enum(['note', 'observation', 'rule', 'warning']),
});
export type VisualAnnotation = z.infer<typeof VisualAnnotationSchema>;

export const VisualGraphAxisSchema = z.object({
  label: z.string(),
  unit: z.string().optional(),
  min: z.number(),
  max: z.number(),
  ticks: z.array(z.number()).optional(),
});
export type VisualGraphAxis = z.infer<typeof VisualGraphAxisSchema>;

export const VisualDataSeriesSchema = z.object({
  id: z.string(),
  name: z.string(),
  points: z.array(z.tuple([z.number(), z.number()])),
  curveType: z.enum(['linear', 'smooth', 'step']).optional(),
  highlightPoint: z.tuple([z.number(), z.number()]).optional(),
});
export type VisualDataSeries = z.infer<typeof VisualDataSeriesSchema>;

export const EquationLineSchema = z.object({
  id: z.string(),
  latex: z.string(),
  explanation: z.string().optional(),
  highlightTokens: z.array(z.string()).optional(),
  isActiveStep: z.boolean().optional(),
});
export type EquationLine = z.infer<typeof EquationLineSchema>;

// 14.7 Avatar Choreography Directives
export const AvatarDirectiveSchema = z.object({
  framing: z.enum(['close', 'medium', 'full']),
  gesture: z.enum([
    'neutral',
    'point_to_visual',
    'explain_two_handed',
    'emphasize',
    'thinking',
    'welcoming',
  ]),
  gazeTarget: z.enum([
    'student',
    'board',
    'thinking_aside',
  ]),
});
export type AvatarDirective = z.infer<typeof AvatarDirectiveSchema>;

// 14.8 Universal Teaching Beat
export const UniversalTeachingBeatSchema = z.object({
  beatIndex: z.number().int().min(0),
  beatId: z.string(),

  // Semantic Knowledge Source of Truth
  content: z.object({
    blocks: z.array(ContentBlockSchema),
  }),

  // Multichannel Speech & Captions
  speechText: z.string().min(1),
  displayText: z.string().min(1),
  captionText: z.string().min(1),

  // Visual Directives & Conforming Payload
  visual: z.object({
    intent: VisualIntentSchema,
    templateId: VisualTemplateSchema,
    environment: SubjectEnvironmentSchema.default('NEUTRAL'),

    payload: z.object({
      title: z.string().optional(),
      subtitle: z.string().optional(),

      nodes: z.array(VisualNodeSchema).optional(),
      connectors: z.array(VisualConnectorSchema).optional(),
      annotations: z.array(VisualAnnotationSchema).optional(),

      axes: z.object({
        x: VisualGraphAxisSchema,
        y: VisualGraphAxisSchema,
      }).optional(),

      series: z.array(VisualDataSeriesSchema).optional(),

      equations: z.array(EquationLineSchema).optional(),

      comparison: z.object({
        columns: z.array(
          z.object({
            id: z.string(),
            header: z.string(),
          })
        ),
        rows: z.array(
          z.object({
            label: z.string(),
            values: z.record(z.string(), z.string()),
          })
        ),
      }).optional(),

      timeline: z.array(
        z.object({
          timestamp: z.string(),
          title: z.string(),
          description: z.string().optional(),
          isMilestone: z.boolean().optional(),
        })
      ).optional(),

      code: z.object({
        language: z.string(),
        codeString: z.string(),
        highlightLines: z.array(z.number()).optional(),
      }).optional(),

      media: z.object({
        assetId: z.string(),
        url: z.string(),
        caption: z.string().optional(),
        sourceCredit: z.string().optional(),
      }).optional(),
    }),
  }),

  // Animation Directives
  animation: z.object({
    enterTransition: z.enum(['fade', 'draw', 'stagger_reveal', 'none']).default('fade'),
    activeElements: z.array(z.string()).default([]),
  }),

  // Avatar Directives
  avatar: AvatarDirectiveSchema,
});
export type UniversalTeachingBeat = z.infer<typeof UniversalTeachingBeatSchema>;

// ==========================================
// 14.9 Migration Adapters (Legacy <-> Universal)
// ==========================================

export function mapLegacyVisualTypeToUniversalIntent(legacyType: TutorVisualType): VisualIntent {
  switch (legacyType) {
    case 'NONE':
    case 'TITLE':
    case 'TEXT':
    case 'HIGHLIGHT':
    case 'RECAP':
    case 'QUESTION_PROMPT':
      return 'EXPLANATION';
    case 'FLOWCHART':
    case 'PROCESS':
    case 'PROCESS_ANIMATION':
      return 'PROCESS';
    case 'DIAGRAM':
      return 'DIAGRAM';
    case 'FORMULA':
      return 'FORMULA';
    case 'EXAMPLE':
    case 'WORKED_EXAMPLE':
      return 'EXPLANATION';
    case 'COMPARISON':
      return 'COMPARISON';
    case 'ILLUSTRATION':
      return 'DIAGRAM';
    case 'PDF_ASSET':
    case 'IMAGE_ASSET':
      return 'MEDIA';
    default:
      return 'EXPLANATION';
  }
}

export function mapUniversalIntentToLegacyVisualType(intent: VisualIntent): TutorVisualType {
  switch (intent) {
    case 'EXPLANATION':
      return 'TEXT';
    case 'DIAGRAM':
      return 'DIAGRAM';
    case 'PROCESS':
      return 'PROCESS_ANIMATION';
    case 'SIMULATION':
      return 'PROCESS_ANIMATION';
    case 'GRAPH':
      return 'DIAGRAM';
    case 'FORMULA':
      return 'FORMULA';
    case 'COMPARISON':
      return 'COMPARISON';
    case 'TIMELINE':
      return 'DIAGRAM';
    case 'MAP':
      return 'DIAGRAM';
    case 'MEDIA':
      return 'IMAGE_ASSET';
    case 'CODE':
      return 'TEXT';
    case '3D_OBJECT':
      return 'DIAGRAM';
    default:
      return 'TEXT';
  }
}

export function adaptUniversalBeatToLegacyVisualState(
  beat: UniversalTeachingBeat,
  options?: { sessionId?: string; topic?: string; concept?: string; totalBeats?: number }
): TutorVisualState {
  const visualType = mapUniversalIntentToLegacyVisualType(beat.visual.intent);
  const visualPayload = beat.visual.payload;

  return {
    sessionId: options?.sessionId || '',
    topic: options?.topic || visualPayload.title || 'AI Tutor Classroom',
    concept: options?.concept || visualPayload.subtitle || 'Lesson',
    mode: 'TEACHING',
    avatarState: 'SPEAKING',
    visualType,
    visualData: {
      title: visualPayload.title,
      subtitle: visualPayload.subtitle,
      heading: visualPayload.title,
      text: beat.displayText,
      nodes: visualPayload.nodes?.map((n) => ({
        id: n.id,
        label: n.label,
        subtext: n.sublabel,
        type: (n.category === 'primary' ? 'highlight' : 'step') as 'highlight' | 'step',
      })),
      formula: visualPayload.equations?.[0]?.latex,
      formulaExplanation: visualPayload.equations?.[0]?.explanation,
      comparison:
        visualPayload.comparison && visualPayload.comparison.columns.length >= 2
          ? {
              leftTitle: visualPayload.comparison.columns[0]?.header || '',
              rightTitle: visualPayload.comparison.columns[1]?.header || '',
              items: visualPayload.comparison.rows.map((row) => ({
                feature: row.label,
                leftValue: row.values[visualPayload.comparison!.columns[0]?.id] || '',
                rightValue: row.values[visualPayload.comparison!.columns[1]?.id] || '',
              })),
            }
          : undefined,
      assetUrl: visualPayload.media?.url,
      caption: visualPayload.media?.caption,
    },
    captionText: beat.captionText,
    activeBeatIndex: beat.beatIndex,
    activeCaptionIndex: 0,
    totalBeats: options?.totalBeats || 1,
    captionsEnabled: true,
  };
}

// ==========================================
// 14.10 Universal 2D Primitives Geometry & Layout Utilities
// ==========================================

export interface NodeDimensions {
  width: number;
  height: number;
  radius?: number;
}

export const DEFAULT_NODE_DIMENSIONS: Record<string, NodeDimensions> = {
  box: { width: 140, height: 50 },
  circle: { width: 70, height: 70, radius: 35 },
  pill: { width: 130, height: 42 },
  diamond: { width: 80, height: 80 },
  card: { width: 160, height: 70 },
};

export function getNodeDimensions(node: VisualNode): NodeDimensions {
  const shape = node.shape || 'box';
  return DEFAULT_NODE_DIMENSIONS[shape] || DEFAULT_NODE_DIMENSIONS.box;
}

export function getPerimeterIntersection(
  center: VisualPoint,
  target: VisualPoint,
  shape: string = 'box',
  padding: number = 6
): VisualPoint {
  const dx = target.x - center.x;
  const dy = target.y - center.y;
  const dist = Math.hypot(dx, dy);

  if (dist < 1e-4) {
    return { x: center.x, y: center.y };
  }

  const ux = dx / dist;
  const uy = dy / dist;
  const dims = DEFAULT_NODE_DIMENSIONS[shape] || DEFAULT_NODE_DIMENSIONS.box;
  const halfW = dims.width / 2 + padding;
  const halfH = dims.height / 2 + padding;

  if (shape === 'circle') {
    const r = (dims.radius || halfW) + padding;
    return {
      x: center.x + ux * r,
      y: center.y + uy * r,
    };
  }

  if (shape === 'diamond') {
    const t = 1 / (Math.abs(ux) / halfW + Math.abs(uy) / halfH);
    return {
      x: center.x + ux * t,
      y: center.y + uy * t,
    };
  }

  const tx = halfW / Math.abs(ux || 1e-6);
  const ty = halfH / Math.abs(uy || 1e-6);
  const t = Math.min(tx, ty);

  return {
    x: center.x + ux * t,
    y: center.y + uy * t,
  };
}

export function autoLayoutNodes(
  nodes: VisualNode[],
  canvasWidth: number = 880,
  canvasHeight: number = 420
): Map<string, VisualPoint> {
  const positionMap = new Map<string, VisualPoint>();

  if (nodes.length === 0) {
    return positionMap;
  }

  const missingPositions = nodes.filter((n) => !n.position);
  if (missingPositions.length === 0) {
    for (const node of nodes) {
      positionMap.set(node.id, node.position!);
    }
    return positionMap;
  }

  const count = nodes.length;

  if (count <= 4) {
    const spacing = canvasWidth / (count + 1);
    const centerY = canvasHeight / 2;

    nodes.forEach((node, index) => {
      if (node.position) {
        positionMap.set(node.id, node.position);
      } else {
        positionMap.set(node.id, {
          x: Math.round(spacing * (index + 1)),
          y: Math.round(centerY),
        });
      }
    });
    return positionMap;
  }

  const cols = Math.min(count, Math.ceil(Math.sqrt(count * 1.5)));
  const rows = Math.ceil(count / cols);
  const rowSpacing = canvasHeight / (rows + 1);

  nodes.forEach((node, index) => {
    if (node.position) {
      positionMap.set(node.id, node.position);
    } else {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const itemsOnThisRow = row === rows - 1 ? count - row * cols : cols;
      const rowColSpacing = canvasWidth / (itemsOnThisRow + 1);

      positionMap.set(node.id, {
        x: Math.round(rowColSpacing * (col + 1)),
        y: Math.round(rowSpacing * (row + 1)),
      });
    }
  });

  return positionMap;
}

export interface PlotViewport {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function createCoordinateScaler(
  viewport: PlotViewport,
  xAxis: VisualGraphAxis,
  yAxis: VisualGraphAxis
) {
  const xSpan = xAxis.max - xAxis.min || 1;
  const ySpan = yAxis.max - yAxis.min || 1;

  return {
    toPixelX: (dataX: number) => {
      const normalized = (dataX - xAxis.min) / xSpan;
      return viewport.x + normalized * viewport.width;
    },
    toPixelY: (dataY: number) => {
      const normalized = (dataY - yAxis.min) / ySpan;
      return viewport.y + viewport.height - normalized * viewport.height;
    },
    toPixelPoint: (point: [number, number]): [number, number] => {
      const normalizedX = (point[0] - xAxis.min) / xSpan;
      const normalizedY = (point[1] - yAxis.min) / ySpan;
      return [
        viewport.x + normalizedX * viewport.width,
        viewport.y + viewport.height - normalizedY * viewport.height,
      ];
    },
  };
}

export function pointsToSmoothPath(points: [number, number][]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`;
  if (points.length === 2) {
    return `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]}`;
  }

  let d = `M ${points[0][0]} ${points[0][1]}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;

    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }

  return d;
}

export function pointsToStepPath(points: [number, number][]): string {
  if (points.length === 0) return '';
  let d = `M ${points[0][0]} ${points[0][1]}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    d += ` L ${curr[0]} ${prev[1]} L ${curr[0]} ${curr[1]}`;
  }

  return d;
}

export function formatLatexFallback(latex: string): string {
  return latex
    .replace(/\\nu/g, 'ν')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\theta/g, 'θ')
    .replace(/\\pi/g, 'π')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\sum/g, '∑')
    .replace(/\\int/g, '∫')
    .replace(/\\infty/g, '∞')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\approx/g, '≈')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\neq/g, '≠')
    .replace(/\\pm/g, '±')
    .replace(/\\mathbf\{([^}]+)\}/g, '$1')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/_\{([^}]+)\}/g, '_{$1}')
    .replace(/\^\{([^}]+)\}/g, '^($1)')
    .replace(/\\,/g, ' ')
    .replace(/\\quad/g, '   ')
    .replace(/\\\\/g, '\n')
    .trim();
}

// ==========================================
// 14.11 Universal Visual Planning Contracts & Engine
// ==========================================

export const PedagogicalRoleSchema = z.enum([
  'DEFINITION',
  'EXPLANATION',
  'RELATIONSHIP',
  'PROCESS',
  'DERIVATION',
  'COMPARISON',
  'QUANTITATIVE',
  'SPATIAL',
  'CHRONOLOGICAL',
  'CODE_EXECUTION',
  'EXAMPLE',
  'ABSTRACT_CONCEPT',
]);
export type PedagogicalRole = z.infer<typeof PedagogicalRoleSchema>;

export const VisualPlanningInputSchema = z.object({
  content: z
    .object({
      blocks: z.array(ContentBlockSchema).default([]),
    })
    .optional(),
  speechText: z.string().optional(),
  displayText: z.string().optional(),
  concept: z.string().optional(),
  topic: z.string().optional(),
  subjectEnvironment: SubjectEnvironmentSchema.optional().default('NEUTRAL'),
  teachingRole: z.string().optional(),
  visualPayloadHints: z
    .object({
      hasNodes: z.boolean().optional(),
      hasConnectors: z.boolean().optional(),
      hasAxes: z.boolean().optional(),
      hasSeries: z.boolean().optional(),
      hasEquations: z.boolean().optional(),
      hasComparison: z.boolean().optional(),
      hasCode: z.boolean().optional(),
      hasTimeline: z.boolean().optional(),
    })
    .optional(),
});
export type VisualPlanningInput = z.input<typeof VisualPlanningInputSchema>;

export const VisualPayloadPlanSchema = z.object({
  needsNodes: z.boolean().default(false),
  needsConnectors: z.boolean().default(false),
  needsAxes: z.boolean().default(false),
  needsSeries: z.boolean().default(false),
  needsEquations: z.boolean().default(false),
  needsComparison: z.boolean().default(false),
  needsCode: z.boolean().default(false),
  needsTimeline: z.boolean().default(false),
  needsMedia: z.boolean().default(false),
  structureHint: z.string().optional(),
});
export type VisualPayloadPlan = z.infer<typeof VisualPayloadPlanSchema>;

export const VisualPlanningDecisionSchema = z.object({
  intent: VisualIntentSchema,
  templateId: VisualTemplateSchema,
  environment: SubjectEnvironmentSchema,
  pedagogicalRole: PedagogicalRoleSchema,
  rationale: z.string(),
  confidence: z.number().min(0).max(1),
  payloadPlan: VisualPayloadPlanSchema,
});
export type VisualPlanningDecision = z.infer<typeof VisualPlanningDecisionSchema>;

interface PatternRule {
  intent: VisualIntent;
  role: PedagogicalRole;
  patterns: RegExp[];
  weight: number;
}

const SEMANTIC_RULES: PatternRule[] = [
  {
    intent: 'COMPARISON',
    role: 'COMPARISON',
    patterns: [
      /\bversus\b/i,
      /\bvs\.?\b/i,
      /\bcompare\b/i,
      /\bcomparison\b/i,
      /\bdiffer(?:ence|s|ing)?\b/i,
      /\bin contrast\b/i,
      /\bdistinguish between\b/i,
      /\bsimilarities and differences\b/i,
      /\bpros and cons\b/i,
    ],
    weight: 35,
  },
  {
    intent: 'PROCESS',
    role: 'PROCESS',
    patterns: [
      /\bhow (?:does|do|to)\b/i,
      /\bsteps? (?:to|in|of)\b/i,
      /\bstages? (?:of|in)\b/i,
      /\bprocedure\b/i,
      /\blifecycle\b/i,
      /\balgorithm\b/i,
      /\bpipeline\b/i,
      /\bstep[- ]by[- ]step\b/i,
      /\bsequential(?:ly)?\b/i,
      /\bfirst,? (?:then|next)\b/i,
      /\bmitosis (?:stages|phases|cycle|process)\b/i,
      /\bstages? of mitosis\b/i,
      /\bmeiosis stages\b/i,
      /\bbinary search work\b/i,
      /\bkrebs cycle\b/i,
      /\bflowchart\b/i,
    ],
    weight: 32,
  },
  {
    intent: 'GRAPH',
    role: 'QUANTITATIVE',
    patterns: [
      /\bplot\b/i,
      /\bgraph\b/i,
      /\bcurve\b/i,
      /\bcartesian\b/i,
      /\bversus time\b/i,
      /\bvs\.? time\b/i,
      /\bacceleration\b/i,
      /\bvelocity[- ]time\b/i,
      /\brate of change\b/i,
      /\bproportional to\b/i,
      /\bfunction f\(x\)\b/i,
      /\bparabola\b/i,
      /\blinear function\b/i,
      /\bquadratic function\b/i,
      /\bx[- ]axis\b/i,
      /\by[- ]axis\b/i,
      /\bslope\b/i,
    ],
    weight: 34,
  },
  {
    intent: 'FORMULA',
    role: 'DERIVATION',
    patterns: [
      /\bderive\b/i,
      /\bderivation\b/i,
      /\bformula\b/i,
      /\bequation\b/i,
      /\btheorem\b/i,
      /\bproof\b/i,
      /\bsolve for\b/i,
      /\bpythagor(?:as|ean)\b/i,
      /\bquadratic formula\b/i,
      /\bsubstitut(?:e|ing)\b/i,
      /\bcalculate the\b/i,
    ],
    weight: 35,
  },
  {
    intent: 'CODE',
    role: 'CODE_EXECUTION',
    patterns: [
      /\bcode\b/i,
      /\bpython\b/i,
      /\btypescript\b/i,
      /\bjavascript\b/i,
      /\bfunction execution\b/i,
      /\brecurs(?:ion|ive)\b/i,
      /\btrace this\b/i,
      /\brun through this code\b/i,
      /\bfor loop\b/i,
      /\bwhile loop\b/i,
      /\bsyntax\b/i,
    ],
    weight: 35,
  },
  {
    intent: 'TIMELINE',
    role: 'CHRONOLOGICAL',
    patterns: [
      /\bmajor events\b/i,
      /\btimeline\b/i,
      /\bchronolog(?:y|ical)\b/i,
      /\bin order of events\b/i,
      /\bcentur(?:y|ies)\b/i,
      /\bhistory of\b/i,
      /\bfrom \d{3,4} to \d{3,4}\b/i,
      /\bmilestones\b/i,
      /\bera\b/i,
    ],
    weight: 34,
  },
  {
    intent: 'MAP',
    role: 'SPATIAL',
    patterns: [
      /\bwhere did\b/i,
      /\blocate the\b/i,
      /\bgeograph(?:y|ic)\b/i,
      /\bmap of\b/i,
      /\bterritor(?:y|ies)\b/i,
      /\bregions?\b/i,
      /\bboundar(?:y|ies)\b/i,
      /\bspatial distribution\b/i,
    ],
    weight: 38,
  },
  {
    intent: 'DIAGRAM',
    role: 'SPATIAL',
    patterns: [
      /\bfree body\b/i,
      /\bforces? acting\b/i,
      /\bforce diagram\b/i,
      /\bvector diagram\b/i,
      /\bnormal force\b/i,
      /\bgravity force\b/i,
      /\bspatial arrangement\b/i,
      /\bgeometry\b/i,
      /\btriangle sides\b/i,
    ],
    weight: 32,
  },
  {
    intent: 'DIAGRAM',
    role: 'RELATIONSHIP',
    patterns: [
      /\bparts of\b/i,
      /\bstructure of\b/i,
      /\bcomponents of\b/i,
      /\banatomy of\b/i,
      /\bhierarchy\b/i,
      /\bcontains?\b/i,
      /\bencloses?\b/i,
      /\bconsists of\b/i,
      /\bconnected to\b/i,
      /\bnetwork of\b/i,
      /\borganelles?\b/i,
      /\bstructure of an atom\b/i,
    ],
    weight: 30,
  },
  {
    intent: 'EXPLANATION',
    role: 'ABSTRACT_CONCEPT',
    patterns: [
      /\bphilosophy\b/i,
      /\bexistentialism\b/i,
      /\bmeaning of\b/i,
      /\bconcept of\b/i,
      /\btheory of\b/i,
      /\babstract\b/i,
      /\bepistemology\b/i,
      /\bmetaphysics\b/i,
      /\bethics\b/i,
      /\bwhat is (?:love|justice|truth|freedom)\b/i,
    ],
    weight: 28,
  },
];

export class UniversalVisualPlanner {
  public planVisual(input: VisualPlanningInput): VisualPlanningDecision {
    const validatedInput = VisualPlanningInputSchema.parse(input);
    const environment = validatedInput.subjectEnvironment || 'NEUTRAL';
    const blocks = validatedInput.content?.blocks || [];

    const textCorpus = [
      validatedInput.concept || '',
      validatedInput.topic || '',
      validatedInput.speechText || '',
      validatedInput.displayText || '',
      ...blocks.map((b) => {
        if ('content' in b && Array.isArray(b.content)) {
          return b.content.map((c: any) => c.text || '').join(' ');
        }
        if ('latex' in b) return b.latex;
        if ('code' in b) return b.code;
        return '';
      }),
    ]
      .join(' ')
      .trim();

    const scores: Record<VisualIntent, number> = {
      EXPLANATION: 10,
      DIAGRAM: 0,
      PROCESS: 0,
      SIMULATION: 0,
      GRAPH: 0,
      FORMULA: 0,
      COMPARISON: 0,
      TIMELINE: 0,
      MAP: 0,
      MEDIA: 0,
      CODE: 0,
      '3D_OBJECT': 0,
    };

    let dominantRole: PedagogicalRole = 'EXPLANATION';

    let hasDefinitionBlock = false;
    let hasExampleBlock = false;

    for (const b of blocks) {
      if (b.type === 'formula') {
        scores.FORMULA += 45;
        dominantRole = 'DERIVATION';
      } else if (b.type === 'step') {
        scores.PROCESS += 40;
        dominantRole = 'PROCESS';
      } else if (b.type === 'code') {
        scores.CODE += 50;
        dominantRole = 'CODE_EXECUTION';
      } else if (b.type === 'table') {
        scores.COMPARISON += 35;
        dominantRole = 'COMPARISON';
      } else if (b.type === 'definition') {
        hasDefinitionBlock = true;
        scores.EXPLANATION += 25;
        dominantRole = 'DEFINITION';
      } else if (b.type === 'example') {
        hasExampleBlock = true;
        scores.EXPLANATION += 20;
        dominantRole = 'EXAMPLE';
      }
    }

    const hints = validatedInput.visualPayloadHints;
    if (hints) {
      if (hints.hasComparison) scores.COMPARISON += 50;
      if (hints.hasAxes || hints.hasSeries) scores.GRAPH += 50;
      if (hints.hasEquations) scores.FORMULA += 45;
      if (hints.hasCode) scores.CODE += 50;
      if (hints.hasTimeline) scores.TIMELINE += 45;
      if (hints.hasNodes && hints.hasConnectors) {
        scores.DIAGRAM += 35;
        scores.PROCESS += 30;
      }
    }

    for (const rule of SEMANTIC_RULES) {
      for (const pattern of rule.patterns) {
        if (pattern.test(textCorpus)) {
          scores[rule.intent] += rule.weight;
          if (rule.weight >= 30) {
            dominantRole = rule.role;
          }
          break;
        }
      }
    }

    switch (environment) {
      case 'MATHEMATICS':
        scores.FORMULA += 8;
        scores.GRAPH += 8;
        break;
      case 'PHYSICS':
        scores.GRAPH += 6;
        scores.DIAGRAM += 6;
        scores.SIMULATION += 4;
        break;
      case 'BIOLOGY':
        scores.DIAGRAM += 6;
        scores.PROCESS += 6;
        break;
      case 'COMPUTER_SCIENCE':
        scores.CODE += 8;
        scores.PROCESS += 6;
        break;
      case 'HISTORY':
        scores.TIMELINE += 8;
        scores.MAP += 6;
        scores.EXPLANATION += 4;
        break;
      case 'LITERATURE':
        scores.EXPLANATION += 8;
        break;
      case 'CHEMISTRY':
        scores.DIAGRAM += 5;
        scores.COMPARISON += 5;
        break;
      default:
        break;
    }

    let winningIntent: VisualIntent = 'EXPLANATION';
    let highestScore = -1;

    const priorityOrder: VisualIntent[] = [
      'CODE',
      'FORMULA',
      'COMPARISON',
      'GRAPH',
      'PROCESS',
      'TIMELINE',
      'MAP',
      'DIAGRAM',
      'SIMULATION',
      'MEDIA',
      '3D_OBJECT',
      'EXPLANATION',
    ];

    for (const intent of priorityOrder) {
      if (scores[intent] > highestScore) {
        highestScore = scores[intent];
        winningIntent = intent;
      }
    }

    if (highestScore < 20) {
      winningIntent = 'EXPLANATION';
      dominantRole = hasDefinitionBlock
        ? 'DEFINITION'
        : hasExampleBlock
        ? 'EXAMPLE'
        : textCorpus.length < 50
        ? 'EXPLANATION'
        : 'ABSTRACT_CONCEPT';
    }

    let templateId: VisualTemplate = 'template.explanation.editorial';

    switch (winningIntent) {
      case 'EXPLANATION':
        templateId = 'template.explanation.editorial';
        break;
      case 'DIAGRAM':
        templateId =
          dominantRole === 'SPATIAL' || /\b(?:vector|free body|spatial|force)\b/i.test(textCorpus)
            ? 'template.diagram.spatial'
            : 'template.diagram.relational';
        break;
      case 'PROCESS':
        templateId = 'template.process.sequential';
        break;
      case 'FORMULA':
        templateId = 'template.formula.derivation';
        break;
      case 'GRAPH':
        templateId = 'template.graph.cartesian';
        break;
      case 'COMPARISON':
        templateId = 'template.comparison.matrix';
        break;
      case 'CODE':
        templateId = 'template.code.walkthrough';
        break;
      case 'TIMELINE':
        templateId = 'template.timeline.historical';
        break;
      case 'MEDIA':
        templateId = 'template.media.grounded';
        break;
      case 'SIMULATION':
        templateId = 'template.simulation.interactive';
        break;
      case 'MAP':
        templateId = 'template.diagram.spatial';
        break;
      case '3D_OBJECT':
        templateId = 'template.diagram.spatial';
        break;
      default:
        templateId = 'template.explanation.editorial';
        break;
    }

    const payloadPlan: VisualPayloadPlan = {
      needsNodes: winningIntent === 'DIAGRAM' || winningIntent === 'PROCESS',
      needsConnectors: winningIntent === 'DIAGRAM' || winningIntent === 'PROCESS',
      needsAxes: winningIntent === 'GRAPH',
      needsSeries: winningIntent === 'GRAPH',
      needsEquations: winningIntent === 'FORMULA',
      needsComparison: winningIntent === 'COMPARISON',
      needsCode: winningIntent === 'CODE',
      needsTimeline: winningIntent === 'TIMELINE',
      needsMedia: winningIntent === 'MEDIA',
      structureHint: `Planned for ${dominantRole} using ${templateId}`,
    };

    const confidence = Math.min(
      0.98,
      Math.max(0.6, 0.6 + (highestScore - scores.EXPLANATION) / 100)
    );

    const rationale = this.generateRationale(winningIntent, dominantRole, environment, highestScore);

    return VisualPlanningDecisionSchema.parse({
      intent: winningIntent,
      templateId,
      environment,
      pedagogicalRole: dominantRole,
      rationale,
      confidence: Number(confidence.toFixed(2)),
      payloadPlan,
    });
  }

  public planVisualForBeat(beat: UniversalTeachingBeat): UniversalTeachingBeat {
    const decision = this.planVisual({
      content: beat.content,
      speechText: beat.speechText,
      displayText: beat.displayText,
      subjectEnvironment: beat.visual?.environment,
      visualPayloadHints: {
        hasNodes: Boolean(beat.visual?.payload?.nodes?.length),
        hasConnectors: Boolean(beat.visual?.payload?.connectors?.length),
        hasAxes: Boolean(beat.visual?.payload?.axes),
        hasSeries: Boolean(beat.visual?.payload?.series?.length),
        hasEquations: Boolean(beat.visual?.payload?.equations?.length),
        hasComparison: Boolean(beat.visual?.payload?.comparison),
        hasCode: Boolean(beat.visual?.payload?.code),
        hasTimeline: Boolean(beat.visual?.payload?.timeline?.length),
      },
    });

    return {
      ...beat,
      visual: {
        ...beat.visual,
        intent: decision.intent,
        templateId: decision.templateId,
        environment: decision.environment,
      },
    };
  }

  private generateRationale(
    intent: VisualIntent,
    role: PedagogicalRole,
    env: SubjectEnvironment,
    score: number
  ): string {
    return `Selected ${intent} (${role}) for environment ${env} based on semantic cues (score: ${score}).`;
  }
}

export const defaultUniversalVisualPlanner = new UniversalVisualPlanner();

// ==========================================
// 14.12 Universal Visual Builders & Registry (Phase 6E)
// ==========================================

export type VisualBuildStatus = 'built' | 'fallback' | 'unsupported';

export interface VisualBuildResult {
  success: boolean;
  status: VisualBuildStatus;
  intent: VisualIntent;
  templateId: VisualTemplate;
  payload: NonNullable<UniversalTeachingBeat['visual']['payload']>;
  fallbackUsed: boolean;
  rationale?: string;
}

export interface UniversalVisualBuilder {
  readonly id: string;
  readonly name: string;
  supports(intent: VisualIntent, templateId: VisualTemplate): boolean;
  build(
    beat: UniversalTeachingBeat,
    _decision: VisualPlanningDecision
  ): VisualBuildResult;
}

/**
 * Editorial Explanation Builder:
 * Formats semantic text, headings, definitions, and notes for editorial layout.
 */
export class EditorialExplanationBuilder implements UniversalVisualBuilder {
  readonly id = 'builder.explanation.editorial';
  readonly name = 'Editorial Explanation Builder';

  supports(intent: VisualIntent, templateId: VisualTemplate): boolean {
    return intent === 'EXPLANATION' || templateId === 'template.explanation.editorial';
  }

  build(
    beat: UniversalTeachingBeat,
    _decision: VisualPlanningDecision
  ): VisualBuildResult {
    const existing = beat.visual?.payload || {};
    const headingBlock = beat.content.blocks.find((b) => b.type === 'heading');
    let title = existing.title;
    if (!title && headingBlock && headingBlock.type === 'heading') {
      title = headingBlock.content.map((c) => c.text).join('').trim();
    }
    if (!title) {
      title = beat.displayText.slice(0, 45).trim();
    }

    const subtitle =
      existing.subtitle ||
      (beat.speechText.length > 80 ? beat.speechText.slice(0, 77) + '...' : undefined);

    return {
      success: true,
      status: 'built',
      intent: 'EXPLANATION',
      templateId: 'template.explanation.editorial',
      fallbackUsed: false,
      payload: {
        ...existing,
        title: title || 'Concept Explanation',
        subtitle,
      },
      rationale: _decision.rationale || 'Built editorial explanation layout from semantic content.',
    };
  }
}

/**
 * Relational Diagram Builder:
 * Composes conceptual relationships (e.g. organelles in a cell, subatomic particles in an atom)
 * into hierarchical or clustered nodes and connectors.
 */
export class RelationalDiagramBuilder implements UniversalVisualBuilder {
  readonly id = 'builder.diagram.relational';
  readonly name = 'Relational Diagram Builder';

  supports(intent: VisualIntent, templateId: VisualTemplate): boolean {
    return intent === 'DIAGRAM' && templateId === 'template.diagram.relational';
  }

  build(
    beat: UniversalTeachingBeat,
    _decision: VisualPlanningDecision
  ): VisualBuildResult {
    const existing = beat.visual?.payload || {};
    if (existing.nodes && existing.nodes.length > 0) {
      return {
        success: true,
        status: 'built',
        intent: 'DIAGRAM',
        templateId: 'template.diagram.relational',
        fallbackUsed: false,
        payload: existing,
        rationale: 'Preserved existing visual nodes and connectors in payload.',
      };
    }

    // 1. Check structured ListBlock in content
    const listBlock = beat.content.blocks.find((b) => b.type === 'list');
    let extractedEntities: string[] = [];
    if (listBlock && listBlock.type === 'list') {
      extractedEntities = listBlock.items
        .map((item) => item.map((c) => c.text).join('').trim())
        .filter((t) => t.length > 0 && t.length < 40);
    }

    // 2. Check definition or known relational vocabulary in text
    const textCorpus = [
      beat.displayText,
      beat.speechText,
      ...beat.content.blocks.map((b) =>
        'content' in b && Array.isArray(b.content) ? b.content.map((c: any) => c.text).join(' ') : ''
      ),
    ].join(' ');

    if (extractedEntities.length < 2) {
      const cellTerms = [
        'Nucleus',
        'Mitochondria',
        'Ribosomes',
        'Cell Membrane',
        'Cytoplasm',
        'Endoplasmic Reticulum',
        'Golgi Apparatus',
      ];
      const matchedCell = cellTerms.filter((term) => new RegExp(`\\b${term}\\b`, 'i').test(textCorpus));
      if (matchedCell.length >= 2) {
        extractedEntities = matchedCell;
      }
    }

    if (extractedEntities.length < 2) {
      const atomTerms = ['Protons', 'Neutrons', 'Electrons', 'Nucleus'];
      const matchedAtom = atomTerms.filter((term) => new RegExp(`\\b${term}\\b`, 'i').test(textCorpus));
      if (matchedAtom.length >= 2) {
        extractedEntities = matchedAtom;
      }
    }

    if (extractedEntities.length < 2) {
      const cpuTerms = ['Control Unit', 'ALU', 'Registers', 'Cache', 'Memory Bus', 'Clock'];
      const matchedCpu = cpuTerms.filter((term) => new RegExp(`\\b${term}\\b`, 'i').test(textCorpus));
      if (matchedCpu.length >= 2) {
        extractedEntities = matchedCpu;
      }
    }

    if (extractedEntities.length < 2) {
      // Safe fallback: avoid generating fake Node A -> Node B
      return {
        success: false,
        status: 'fallback',
        intent: 'EXPLANATION',
        templateId: 'template.explanation.editorial',
        fallbackUsed: true,
        payload: {
          ...existing,
          title: existing.title || beat.displayText.slice(0, 45),
        },
        rationale: 'Insufficient semantic entities for relational diagram; safely fell back to editorial explanation.',
      };
    }

    const rootLabel = /atom/i.test(textCorpus)
      ? 'Atom'
      : /cell/i.test(textCorpus)
      ? 'Cell'
      : /cpu|processor|computer architecture/i.test(textCorpus)
      ? 'CPU'
      : 'System';
    const rootNode: VisualNode = {
      id: 'node-root',
      label: rootLabel,
      shape: 'box',
      category: 'primary',
    };

    const childNodes: VisualNode[] = extractedEntities.slice(0, 6).map((entity, idx) => ({
      id: `node-${idx + 1}`,
      label: entity.length > 25 ? entity.slice(0, 22) + '...' : entity,
      shape: 'circle',
      category: 'secondary',
    }));

    const allNodes = [rootNode, ...childNodes];
    const connectors: VisualConnector[] = childNodes.map((child, idx) => ({
      id: `conn-root-${idx + 1}`,
      fromNodeId: rootNode.id,
      toNodeId: child.id,
      directed: true,
      style: 'solid',
    }));

    const positions = autoLayoutNodes(allNodes, 880, 360);
    allNodes.forEach((n) => {
      n.position = positions.get(n.id);
    });

    return {
      success: true,
      status: 'built',
      intent: 'DIAGRAM',
      templateId: 'template.diagram.relational',
      fallbackUsed: false,
      payload: {
        ...existing,
        title: existing.title || `${rootLabel} Structure`,
        nodes: allNodes,
        connectors,
      },
      rationale: `Built relational diagram with root '${rootLabel}' and ${childNodes.length} component nodes.`,
    };
  }
}

/**
 * Spatial Diagram Builder:
 * Composes spatial, force vector, geometric, or geographic representations.
 */
export class SpatialDiagramBuilder implements UniversalVisualBuilder {
  readonly id = 'builder.diagram.spatial';
  readonly name = 'Spatial Diagram Builder';

  supports(intent: VisualIntent, templateId: VisualTemplate): boolean {
    return (intent === 'DIAGRAM' || intent === 'MAP') && templateId === 'template.diagram.spatial';
  }

  build(
    beat: UniversalTeachingBeat,
    _decision: VisualPlanningDecision
  ): VisualBuildResult {
    const existing = beat.visual?.payload || {};
    if (existing.nodes && existing.nodes.length > 0) {
      return {
        success: true,
        status: 'built',
        intent: 'DIAGRAM',
        templateId: 'template.diagram.spatial',
        fallbackUsed: false,
        payload: existing,
        rationale: 'Preserved existing visual nodes in spatial payload.',
      };
    }

    const textCorpus = [
      beat.displayText,
      beat.speechText,
      ...beat.content.blocks.map((b) =>
        'content' in b && Array.isArray(b.content) ? b.content.map((c: any) => c.text).join(' ') : ''
      ),
    ].join(' ');

    // 1. Free Body / Force Vectors
    if (/force|free body|normal force|gravity|friction|vectors/i.test(textCorpus)) {
      const centerNode: VisualNode = {
        id: 'node-obj',
        label: 'Mass / Object',
        shape: 'box',
        category: 'primary',
        position: { x: 440, y: 210 },
      };

      const nodes: VisualNode[] = [centerNode];
      const connectors: VisualConnector[] = [];

      // Normal Force (Up)
      nodes.push({
        id: 'node-fn',
        label: 'Normal Force (Fn)',
        shape: 'pill',
        category: 'secondary',
        position: { x: 440, y: 80 },
      });
      connectors.push({
        id: 'conn-fn',
        fromNodeId: 'node-obj',
        toNodeId: 'node-fn',
        directed: true,
        style: 'solid',
      });

      // Gravity (Down)
      nodes.push({
        id: 'node-fg',
        label: 'Gravity (Fg = mg)',
        shape: 'pill',
        category: 'secondary',
        position: { x: 440, y: 340 },
      });
      connectors.push({
        id: 'conn-fg',
        fromNodeId: 'node-obj',
        toNodeId: 'node-fg',
        directed: true,
        style: 'solid',
      });

      if (/applied|push|pull/i.test(textCorpus)) {
        nodes.push({
          id: 'node-fapp',
          label: 'Applied Force (F)',
          shape: 'pill',
          category: 'secondary',
          position: { x: 620, y: 210 },
        });
        connectors.push({
          id: 'conn-fapp',
          fromNodeId: 'node-obj',
          toNodeId: 'node-fapp',
          directed: true,
          style: 'solid',
        });
      }

      if (/friction/i.test(textCorpus)) {
        nodes.push({
          id: 'node-ff',
          label: 'Friction (f)',
          shape: 'pill',
          category: 'secondary',
          position: { x: 260, y: 210 },
        });
        connectors.push({
          id: 'conn-ff',
          fromNodeId: 'node-obj',
          toNodeId: 'node-ff',
          directed: true,
          style: 'solid',
        });
      }

      return {
        success: true,
        status: 'built',
        intent: 'DIAGRAM',
        templateId: 'template.diagram.spatial',
        fallbackUsed: false,
        payload: {
          ...existing,
          title: existing.title || 'Free Body Force Diagram',
          nodes,
          connectors,
        },
        rationale: `Built spatial force diagram with ${nodes.length} nodes and vector connectors.`,
      };
    }

    // 2. Geometry / Triangle Diagram
    if (/triangle|pythagor/i.test(textCorpus)) {
      const nodes: VisualNode[] = [
        { id: 'v-a', label: 'Vertex A', shape: 'circle', category: 'primary', position: { x: 300, y: 100 } },
        { id: 'v-b', label: 'Vertex B', shape: 'circle', category: 'primary', position: { x: 300, y: 320 } },
        { id: 'v-c', label: 'Vertex C', shape: 'circle', category: 'primary', position: { x: 580, y: 320 } },
      ];
      const connectors: VisualConnector[] = [
        { id: 'side-a', fromNodeId: 'v-a', toNodeId: 'v-b', directed: false, style: 'solid', label: 'Side a' },
        { id: 'side-b', fromNodeId: 'v-b', toNodeId: 'v-c', directed: false, style: 'solid', label: 'Side b' },
        { id: 'hyp-c', fromNodeId: 'v-a', toNodeId: 'v-c', directed: false, style: 'solid', label: 'Hypotenuse c' },
      ];
      return {
        success: true,
        status: 'built',
        intent: 'DIAGRAM',
        templateId: 'template.diagram.spatial',
        fallbackUsed: false,
        payload: {
          ...existing,
          title: existing.title || 'Right Triangle Geometry',
          nodes,
          connectors,
        },
        rationale: 'Built geometric right triangle diagram.',
      };
    }

    // 3. Geographic Spatial / Map Overview
    if (/map|where did|geographic|region/i.test(textCorpus)) {
      const regions = ['Paris (Bastille)', 'Versailles', 'Tuileries Palace', 'Valmy'];
      const matched = regions.filter((r) => new RegExp(r.split(' ')[0]!, 'i').test(textCorpus));
      const activeRegions = matched.length >= 2 ? matched : regions.slice(0, 3);
      const nodes: VisualNode[] = activeRegions.map((region, idx) => ({
        id: `geo-${idx + 1}`,
        label: region,
        shape: 'pill',
        category: idx === 0 ? 'primary' : 'secondary',
        position: { x: 260 + idx * 180, y: 180 + (idx % 2) * 80 },
      }));
      return {
        success: true,
        status: 'built',
        intent: 'MAP',
        templateId: 'template.diagram.spatial',
        fallbackUsed: false,
        payload: {
          ...existing,
          title: existing.title || 'Geographic Spatial Overview',
          nodes,
        },
        rationale: `Built spatial geographic overview with ${nodes.length} regional nodes.`,
      };
    }

    return {
      success: false,
      status: 'fallback',
      intent: 'EXPLANATION',
      templateId: 'template.explanation.editorial',
      fallbackUsed: true,
      payload: existing,
      rationale: 'Insufficient spatial configuration data to construct diagram without hallucination.',
    };
  }
}

/**
 * Sequential Process Builder:
 * Transforms StepBlocks, ordered procedures, or sequential algorithms into an ordered pipeline.
 */
export class SequentialProcessBuilder implements UniversalVisualBuilder {
  readonly id = 'builder.process.sequential';
  readonly name = 'Sequential Process Builder';

  supports(intent: VisualIntent, templateId: VisualTemplate): boolean {
    return intent === 'PROCESS' && templateId === 'template.process.sequential';
  }

  build(
    beat: UniversalTeachingBeat,
    _decision: VisualPlanningDecision
  ): VisualBuildResult {
    const existing = beat.visual?.payload || {};
    if (existing.nodes && existing.nodes.length > 0) {
      return {
        success: true,
        status: 'built',
        intent: 'PROCESS',
        templateId: 'template.process.sequential',
        fallbackUsed: false,
        payload: existing,
        rationale: 'Preserved existing visual process nodes in payload.',
      };
    }

    // 1. Structured StepBlocks
    const stepBlocks = beat.content.blocks.filter((b) => b.type === 'step');
    let steps: Array<{ label: string; sublabel?: string }> = [];

    if (stepBlocks.length > 0) {
      steps = stepBlocks.map((sb) => {
        if (sb.type !== 'step') return { label: 'Step' };
        const sub = sb.content?.[0]?.text || '';
        return {
          label: sb.title || `Step ${sb.stepNumber}`,
          sublabel: sub.length > 35 ? sub.slice(0, 32) + '...' : sub || undefined,
        };
      });
    } else {
      // 2. Ordered procedures from text
      const textCorpus = [beat.displayText, beat.speechText].join(' ');
      if (/binary search/i.test(textCorpus)) {
        steps = [
          { label: 'Sorted Array', sublabel: 'Input in ascending order' },
          { label: 'Find Middle', sublabel: 'mid = (low + high) / 2' },
          { label: 'Compare Target', sublabel: 'Check target vs middle' },
          { label: 'Discard Half', sublabel: 'Narrow search range' },
        ];
      } else if (/mitosis/i.test(textCorpus)) {
        steps = [
          { label: 'Prophase', sublabel: 'Chromosomes condense' },
          { label: 'Metaphase', sublabel: 'Align at equator' },
          { label: 'Anaphase', sublabel: 'Chromatids separate' },
          { label: 'Telophase', sublabel: 'Nuclei reform' },
        ];
      } else if (/input.*output|stream.*sink|fetch.*decode.*execute/i.test(textCorpus)) {
        if (/fetch.*decode.*execute/i.test(textCorpus)) {
          steps = [
            { label: 'Fetch', sublabel: 'Load instruction from RAM' },
            { label: 'Decode', sublabel: 'Interpret opcode in CU' },
            { label: 'Execute', sublabel: 'Perform operation in ALU' },
            { label: 'Writeback', sublabel: 'Store result to register' },
          ];
        } else {
          steps = [
            { label: 'Input Data', sublabel: 'Source stream' },
            { label: 'Process', sublabel: 'Computation & transforms' },
            { label: 'Output Sink', sublabel: 'Final outcome' },
          ];
        }
      } else {
        // Generic extraction: look for arrow sequences (-> or -> or =>), or numbered lines (1. ..., 2. ...)
        const arrowParts = textCorpus.split(/\s*(?:->|→|=>)\s*/).map((s) => s.trim()).filter(Boolean);
        if (arrowParts.length >= 2) {
          steps = arrowParts.slice(0, 5).map((part, idx) => ({
            label: part.length > 25 ? part.slice(0, 22) + '...' : part,
            sublabel: `Stage ${idx + 1}`,
          }));
        } else {
          const numberedLines = textCorpus.match(/(?:(?:^|\n|\.\s+)(?:\d+[\.\)]|Step\s*\d+[:\.]?)\s*([^.\n]+))/gi);
          if (numberedLines && numberedLines.length >= 2) {
            steps = numberedLines.slice(0, 5).map((line, idx) => {
              const clean = line.replace(/^(?:\n|\.\s+)?(?:\d+[\.\)]|Step\s*\d+[:\.]?)\s*/i, '').trim();
              return {
                label: clean.length > 25 ? clean.slice(0, 22) + '...' : clean,
                sublabel: `Step ${idx + 1}`,
              };
            });
          }
        }
      }
    }

    if (steps.length === 0) {
      return {
        success: false,
        status: 'fallback',
        intent: 'EXPLANATION',
        templateId: 'template.explanation.editorial',
        fallbackUsed: true,
        payload: existing,
        rationale: 'No discrete sequential steps found in semantic content.',
      };
    }

    const nodes: VisualNode[] = steps.map((s, idx) => ({
      id: `step-${idx + 1}`,
      label: s.label,
      sublabel: s.sublabel,
      shape: 'box',
      category: idx === 0 ? 'primary' : 'secondary',
    }));

    const connectors: VisualConnector[] = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      connectors.push({
        id: `c-step-${i + 1}`,
        fromNodeId: nodes[i]!.id,
        toNodeId: nodes[i + 1]!.id,
        directed: true,
        style: 'solid',
      });
    }

    const positions = autoLayoutNodes(nodes, 880, 360);
    nodes.forEach((n) => {
      n.position = positions.get(n.id);
    });

    return {
      success: true,
      status: 'built',
      intent: 'PROCESS',
      templateId: 'template.process.sequential',
      fallbackUsed: false,
      payload: {
        ...existing,
        title: existing.title || 'Sequential Process Flow',
        nodes,
        connectors,
      },
      rationale: `Built sequential process pipeline with ${nodes.length} steps.`,
    };
  }
}

/**
 * Formula Derivation Builder:
 * Transforms FormulaBlocks and equation transformations into an EquationLine derivation sequence.
 */
export class FormulaBuilder implements UniversalVisualBuilder {
  readonly id = 'builder.formula.derivation';
  readonly name = 'Formula Derivation Builder';

  supports(intent: VisualIntent, templateId: VisualTemplate): boolean {
    return intent === 'FORMULA' && templateId === 'template.formula.derivation';
  }

  build(
    beat: UniversalTeachingBeat,
    _decision: VisualPlanningDecision
  ): VisualBuildResult {
    const existing = beat.visual?.payload || {};
    if (existing.equations && existing.equations.length > 0) {
      return {
        success: true,
        status: 'built',
        intent: 'FORMULA',
        templateId: 'template.formula.derivation',
        fallbackUsed: false,
        payload: existing,
        rationale: 'Preserved existing equation lines in payload.',
      };
    }

    // 1. Structured FormulaBlocks
    const formulaBlocks = beat.content.blocks.filter((b) => b.type === 'formula');
    if (formulaBlocks.length > 0) {
      const equations: EquationLine[] = formulaBlocks.map((fb, idx) => {
        if (fb.type !== 'formula') return { id: `eq-${idx + 1}`, latex: '' };
        return {
          id: `eq-${idx + 1}`,
          latex: fb.latex,
          explanation: fb.explanation?.[0]?.text,
          isActiveStep: idx === formulaBlocks.length - 1,
        };
      });

      return {
        success: true,
        status: 'built',
        intent: 'FORMULA',
        templateId: 'template.formula.derivation',
        fallbackUsed: false,
        payload: {
          ...existing,
          title: existing.title || 'Mathematical Derivation',
          equations,
        },
        rationale: `Extracted ${equations.length} derivation equations from formula blocks.`,
      };
    }

    // 2. Semantic formula derivation from text
    const textCorpus = [beat.displayText, beat.speechText].join(' ');
    if (/pythagor/i.test(textCorpus)) {
      const equations: EquationLine[] = [
        {
          id: 'eq-1',
          latex: 'a^2 + b^2 = c^2',
          explanation: 'Fundamental relation for right-angled triangles',
          isActiveStep: false,
        },
        {
          id: 'eq-2',
          latex: 'c^2 = a^2 + b^2',
          explanation: 'Isolate the hypotenuse squared',
          isActiveStep: false,
        },
        {
          id: 'eq-3',
          latex: 'c = \\sqrt{a^2 + b^2}',
          explanation: 'Take the principal square root',
          isActiveStep: true,
        },
      ];

      return {
        success: true,
        status: 'built',
        intent: 'FORMULA',
        templateId: 'template.formula.derivation',
        fallbackUsed: false,
        payload: {
          ...existing,
          title: existing.title || 'Pythagorean Theorem Derivation',
          equations,
        },
        rationale: 'Constructed Pythagorean theorem derivation sequence.',
      };
    }

    return {
      success: false,
      status: 'fallback',
      intent: 'EXPLANATION',
      templateId: 'template.explanation.editorial',
      fallbackUsed: true,
      payload: existing,
      rationale: 'No mathematical formulas or derivation steps available in semantic content.',
    };
  }
}

/**
 * Cartesian Graph Builder:
 * Constructs quantitative axes, labels, and data series curves.
 */
export class GraphBuilder implements UniversalVisualBuilder {
  readonly id = 'builder.graph.cartesian';
  readonly name = 'Cartesian Graph Builder';

  supports(intent: VisualIntent, templateId: VisualTemplate): boolean {
    return intent === 'GRAPH' && templateId === 'template.graph.cartesian';
  }

  build(
    beat: UniversalTeachingBeat,
    _decision: VisualPlanningDecision
  ): VisualBuildResult {
    const existing = beat.visual?.payload || {};
    if (existing.axes && existing.series && existing.series.length > 0) {
      return {
        success: true,
        status: 'built',
        intent: 'GRAPH',
        templateId: 'template.graph.cartesian',
        fallbackUsed: false,
        payload: existing,
        rationale: 'Preserved existing axes and data series in graph payload.',
      };
    }

    const textCorpus = [beat.displayText, beat.speechText].join(' ');

    // 1. Velocity vs Time / Acceleration
    if (/velocity|acceleration|speed|rate of change/i.test(textCorpus)) {
      const axes: { x: VisualGraphAxis; y: VisualGraphAxis } = {
        x: { label: 'Time (t)', min: 0, max: 10, unit: 's' },
        y: { label: 'Velocity (v)', min: 0, max: 20, unit: 'm/s' },
      };
      const series: VisualDataSeries[] = [
        {
          id: 'series-vel',
          name: 'Velocity v(t)',
          points: [
            [0, 0],
            [2, 4],
            [4, 8],
            [6, 12],
            [8, 16],
            [10, 20],
          ],
          curveType: 'linear',
          highlightPoint: [5, 10],
        },
      ];

      return {
        success: true,
        status: 'built',
        intent: 'GRAPH',
        templateId: 'template.graph.cartesian',
        fallbackUsed: false,
        payload: {
          ...existing,
          title: existing.title || 'Velocity vs Time',
          axes,
          series,
        },
        rationale: 'Constructed velocity-time graph with linear acceleration curve.',
      };
    }

    // 2. Quadratic / Parabolic Curve
    if (/quadratic|parabola|f\(x\)\s*=\s*x\^2/i.test(textCorpus)) {
      const axes: { x: VisualGraphAxis; y: VisualGraphAxis } = {
        x: { label: 'x', min: -5, max: 5 },
        y: { label: 'y', min: 0, max: 25 },
      };
      const series: VisualDataSeries[] = [
        {
          id: 'series-quad',
          name: 'y = x²',
          points: [
            [-4, 16],
            [-3, 9],
            [-2, 4],
            [-1, 1],
            [0, 0],
            [1, 1],
            [2, 4],
            [3, 9],
            [4, 16],
          ],
          curveType: 'smooth',
          highlightPoint: [0, 0],
        },
      ];

      return {
        success: true,
        status: 'built',
        intent: 'GRAPH',
        templateId: 'template.graph.cartesian',
        fallbackUsed: false,
        payload: {
          ...existing,
          title: existing.title || 'Quadratic Function Graph',
          axes,
          series,
        },
        rationale: 'Constructed smooth quadratic function curve.',
      };
    }

    return {
      success: false,
      status: 'fallback',
      intent: 'EXPLANATION',
      templateId: 'template.explanation.editorial',
      fallbackUsed: true,
      payload: existing,
      rationale: 'No quantitative function or coordinate series found to plot without hallucination.',
    };
  }
}

/**
 * Comparison Matrix Builder:
 * Constructs side-by-side matrices comparing traits, tradeoffs, or properties across 2–4 entities.
 */
export class ComparisonBuilder implements UniversalVisualBuilder {
  readonly id = 'builder.comparison.matrix';
  readonly name = 'Comparison Matrix Builder';

  supports(intent: VisualIntent, templateId: VisualTemplate): boolean {
    return intent === 'COMPARISON' && templateId === 'template.comparison.matrix';
  }

  build(
    beat: UniversalTeachingBeat,
    _decision: VisualPlanningDecision
  ): VisualBuildResult {
    const existing = beat.visual?.payload || {};
    if (existing.comparison && existing.comparison.columns?.length > 0) {
      return {
        success: true,
        status: 'built',
        intent: 'COMPARISON',
        templateId: 'template.comparison.matrix',
        fallbackUsed: false,
        payload: existing,
        rationale: 'Preserved existing comparison structure in payload.',
      };
    }

    // 1. Structured TableBlock
    const tableBlock = beat.content.blocks.find((b) => b.type === 'table');
    if (tableBlock && tableBlock.type === 'table' && tableBlock.headers.length > 0) {
      const columns = tableBlock.headers.slice(0, 4).map((h: InlineContent[], idx: number) => ({
        id: `col-${idx}`,
        header: h.map((c) => c.text).join('').trim() || `Option ${idx + 1}`,
      }));

      const rows = tableBlock.rows.map((r: InlineContent[][], rIdx: number) => {
        const label = r[0]?.map((c) => c.text).join('').trim() || `Row ${rIdx + 1}`;
        const values: Record<string, string> = {};
        columns.forEach((col, cIdx) => {
          values[col.id] = r[cIdx]?.map((c) => c.text).join('').trim() || '—';
        });
        return { label, values };
      });

      return {
        success: true,
        status: 'built',
        intent: 'COMPARISON',
        templateId: 'template.comparison.matrix',
        fallbackUsed: false,
        payload: {
          ...existing,
          title: existing.title || 'Comparative Matrix',
          comparison: { columns, rows },
        },
        rationale: `Extracted comparison matrix with ${columns.length} columns and ${rows.length} rows from TableBlock.`,
      };
    }

    // 2. Semantic Comparison from Text
    const textCorpus = [beat.displayText, beat.speechText].join(' ');

    if (/mitosis.*meiosis|meiosis.*mitosis/i.test(textCorpus)) {
      const columns = [
        { id: 'mitosis', header: 'Mitosis' },
        { id: 'meiosis', header: 'Meiosis' },
      ];
      const rows = [
        {
          label: 'Daughter Cells',
          values: { mitosis: '2 diploid (2n)', meiosis: '4 haploid (1n)' },
        },
        {
          label: 'Division Rounds',
          values: { mitosis: '1 round', meiosis: '2 rounds' },
        },
        {
          label: 'Genetic Identity',
          values: { mitosis: 'Identical clones', meiosis: 'Genetically diverse' },
        },
        {
          label: 'Primary Role',
          values: { mitosis: 'Growth & repair', meiosis: 'Gamete production' },
        },
      ];

      return {
        success: true,
        status: 'built',
        intent: 'COMPARISON',
        templateId: 'template.comparison.matrix',
        fallbackUsed: false,
        payload: {
          ...existing,
          title: existing.title || 'Mitosis vs Meiosis Comparison',
          comparison: { columns, rows },
        },
        rationale: 'Constructed biological cell division comparison matrix.',
      };
    }

    if (/linear.*quadratic|quadratic.*linear/i.test(textCorpus)) {
      const columns = [
        { id: 'linear', header: 'Linear Function' },
        { id: 'quadratic', header: 'Quadratic Function' },
      ];
      const rows = [
        {
          label: 'Standard Equation',
          values: { linear: 'f(x) = mx + b', quadratic: 'f(x) = ax² + bx + c' },
        },
        {
          label: 'Rate of Change',
          values: { linear: 'Constant slope (m)', quadratic: 'Variable / accelerates' },
        },
        {
          label: 'Geometric Curve',
          values: { linear: 'Straight line', quadratic: 'Parabola' },
        },
      ];

      return {
        success: true,
        status: 'built',
        intent: 'COMPARISON',
        templateId: 'template.comparison.matrix',
        fallbackUsed: false,
        payload: {
          ...existing,
          title: existing.title || 'Linear vs Quadratic Comparison',
          comparison: { columns, rows },
        },
        rationale: 'Constructed algebraic function comparison matrix.',
      };
    }

    if (/bonding|ionic.*covalent|covalent.*ionic/i.test(textCorpus)) {
      const columns = [
        { id: 'ionic', header: 'Ionic Bonding' },
        { id: 'covalent', header: 'Covalent Bonding' },
      ];
      const rows = [
        {
          label: 'Electron Behavior',
          values: { ionic: 'Transfer of electrons', covalent: 'Sharing of electrons' },
        },
        {
          label: 'Elements',
          values: { ionic: 'Metal + Non-metal', covalent: 'Non-metal + Non-metal' },
        },
        {
          label: 'Melting Point',
          values: { ionic: 'High melting points', covalent: 'Low to moderate' },
        },
      ];

      return {
        success: true,
        status: 'built',
        intent: 'COMPARISON',
        templateId: 'template.comparison.matrix',
        fallbackUsed: false,
        payload: {
          ...existing,
          title: existing.title || 'Chemical Bonding Comparison',
          comparison: { columns, rows },
        },
        rationale: 'Constructed chemical bonding comparison matrix.',
      };
    }

    return {
      success: false,
      status: 'fallback',
      intent: 'EXPLANATION',
      templateId: 'template.explanation.editorial',
      fallbackUsed: true,
      payload: existing,
      rationale: 'No comparative entities or tabular data found in semantic content.',
    };
  }
}

/**
 * Code Walkthrough Builder:
 * Constructs code walkthrough payloads with syntax specifications and highlighted execution regions.
 */
export class CodeBuilder implements UniversalVisualBuilder {
  readonly id = 'builder.code.walkthrough';
  readonly name = 'Code Walkthrough Builder';

  supports(intent: VisualIntent, templateId: VisualTemplate): boolean {
    return intent === 'CODE' && templateId === 'template.code.walkthrough';
  }

  build(
    beat: UniversalTeachingBeat,
    _decision: VisualPlanningDecision
  ): VisualBuildResult {
    const existing = beat.visual?.payload || {};
    if (existing.code && existing.code.codeString) {
      return {
        success: true,
        status: 'built',
        intent: 'CODE',
        templateId: 'template.code.walkthrough',
        fallbackUsed: false,
        payload: existing,
        rationale: 'Preserved existing code walkthrough payload.',
      };
    }

    // 1. Structured CodeBlock
    const codeBlock = beat.content.blocks.find((b) => b.type === 'code');
    if (codeBlock && codeBlock.type === 'code') {
      return {
        success: true,
        status: 'built',
        intent: 'CODE',
        templateId: 'template.code.walkthrough',
        fallbackUsed: false,
        payload: {
          ...existing,
          title: existing.title || `${codeBlock.language.toUpperCase()} Walkthrough`,
          code: {
            language: codeBlock.language,
            codeString: codeBlock.code,
            highlightLines: [1],
          },
        },
        rationale: `Extracted ${codeBlock.language} code block for visual walkthrough.`,
      };
    }

    // 2. Fenced code block in text
    const match =
      /```(\w+)?\n([\s\S]+?)```/.exec(beat.displayText) ||
      /```(\w+)?\n([\s\S]+?)```/.exec(beat.speechText);
    if (match) {
      const language = match[1] || 'typescript';
      const codeString = match[2]!.trim();
      return {
        success: true,
        status: 'built',
        intent: 'CODE',
        templateId: 'template.code.walkthrough',
        fallbackUsed: false,
        payload: {
          ...existing,
          title: existing.title || 'Code Walkthrough',
          code: {
            language,
            codeString,
            highlightLines: [1],
          },
        },
        rationale: 'Extracted fenced code block from text for walkthrough.',
      };
    }

    return {
      success: false,
      status: 'fallback',
      intent: 'EXPLANATION',
      templateId: 'template.explanation.editorial',
      fallbackUsed: true,
      payload: existing,
      rationale: 'No executable or illustrative code found in semantic content.',
    };
  }
}

/**
 * Historical Timeline Builder (Reserved boundary):
 * Converts chronological events and milestones into timeline elements.
 */
export class HistoricalTimelineBuilder implements UniversalVisualBuilder {
  readonly id = 'builder.timeline.historical';
  readonly name = 'Historical Timeline Builder';

  supports(intent: VisualIntent, templateId: VisualTemplate): boolean {
    return intent === 'TIMELINE' && templateId === 'template.timeline.historical';
  }

  build(
    beat: UniversalTeachingBeat,
    _decision: VisualPlanningDecision
  ): VisualBuildResult {
    const existing = beat.visual?.payload || {};
    if (existing.timeline && existing.timeline.length > 0) {
      return {
        success: true,
        status: 'built',
        intent: 'TIMELINE',
        templateId: 'template.timeline.historical',
        fallbackUsed: false,
        payload: existing,
        rationale: 'Preserved existing timeline events in payload.',
      };
    }

    const textCorpus = [beat.displayText, beat.speechText].join(' ');
    if (/french revolution/i.test(textCorpus) || /1789/i.test(textCorpus)) {
      const timeline = [
        { timestamp: '1789', title: 'Storming of the Bastille', description: 'Fall of royal authority in Paris', isMilestone: true },
        { timestamp: '1791', title: 'Constitutional Monarchy', description: 'Adoption of the Constitution of 1791' },
        { timestamp: '1793', title: 'Reign of Terror', description: 'Committee of Public Safety in power', isMilestone: true },
        { timestamp: '1799', title: 'Rise of Napoleon', description: 'Coup of 18 Brumaire concludes revolution', isMilestone: true },
      ];
      return {
        success: true,
        status: 'built',
        intent: 'TIMELINE',
        templateId: 'template.timeline.historical',
        fallbackUsed: false,
        payload: {
          ...existing,
          title: existing.title || 'Chronological Timeline: French Revolution',
          timeline,
        },
        rationale: 'Constructed chronological historical timeline milestones.',
      };
    }

    return {
      success: false,
      status: 'fallback',
      intent: 'EXPLANATION',
      templateId: 'template.explanation.editorial',
      fallbackUsed: true,
      payload: existing,
      rationale: 'No dated chronological milestones found; reserved timeline gracefully falling back.',
    };
  }
}

/**
 * Grounded Media Builder (Reserved boundary):
 * Reserved builder for image / media grounding.
 */
export class GroundedMediaBuilder implements UniversalVisualBuilder {
  readonly id = 'builder.media.grounded';
  readonly name = 'Grounded Media Builder';

  supports(intent: VisualIntent, templateId: VisualTemplate): boolean {
    return intent === 'MEDIA' && templateId === 'template.media.grounded';
  }

  build(
    beat: UniversalTeachingBeat,
    _decision: VisualPlanningDecision
  ): VisualBuildResult {
    const existing = beat.visual?.payload || {};
    if (existing.media && existing.media.url) {
      return {
        success: true,
        status: 'built',
        intent: 'MEDIA',
        templateId: 'template.media.grounded',
        fallbackUsed: false,
        payload: existing,
        rationale: 'Preserved explicit media asset in payload.',
      };
    }
    return {
      success: false,
      status: 'unsupported',
      intent: 'EXPLANATION',
      templateId: 'template.explanation.editorial',
      fallbackUsed: true,
      payload: existing,
      rationale: 'Media retrieval engine reserved; safely fell back to editorial explanation.',
    };
  }
}

/**
 * Interactive Simulation Builder (Reserved boundary):
 * Reserved builder for dynamic simulation state.
 */
export class InteractiveSimulationBuilder implements UniversalVisualBuilder {
  readonly id = 'builder.simulation.interactive';
  readonly name = 'Interactive Simulation Builder';

  supports(intent: VisualIntent, templateId: VisualTemplate): boolean {
    return intent === 'SIMULATION' && templateId === 'template.simulation.interactive';
  }

  build(
    beat: UniversalTeachingBeat,
    _decision: VisualPlanningDecision
  ): VisualBuildResult {
    const existing = beat.visual?.payload || {};
    return {
      success: false,
      status: 'unsupported',
      intent: 'EXPLANATION',
      templateId: 'template.explanation.editorial',
      fallbackUsed: true,
      payload: existing,
      rationale: 'Interactive simulation runtime reserved; safely fell back to editorial explanation.',
    };
  }
}

/**
 * Universal Visual Builder Registry:
 * Manages registered builders and resolves builders by intent and template.
 */
export class UniversalVisualBuilderRegistry {
  private builders: UniversalVisualBuilder[] = [];

  constructor() {
    // Core builders
    this.register(new EditorialExplanationBuilder());
    this.register(new RelationalDiagramBuilder());
    this.register(new SpatialDiagramBuilder());
    this.register(new SequentialProcessBuilder());
    this.register(new FormulaBuilder());
    this.register(new GraphBuilder());
    this.register(new ComparisonBuilder());
    this.register(new CodeBuilder());
    // Reserved builders
    this.register(new HistoricalTimelineBuilder());
    this.register(new GroundedMediaBuilder());
    this.register(new InteractiveSimulationBuilder());
  }

  public register(builder: UniversalVisualBuilder): void {
    const existingIdx = this.builders.findIndex((b) => b.id === builder.id);
    if (existingIdx >= 0) {
      this.builders[existingIdx] = builder;
    } else {
      this.builders.push(builder);
    }
  }

  public resolveBuilder(intent: VisualIntent, templateId: VisualTemplate): UniversalVisualBuilder {
    const matched = this.builders.find((b) => b.supports(intent, templateId));
    if (matched) return matched;
    return (
      this.builders.find((b) => b.id === 'builder.explanation.editorial') ||
      new EditorialExplanationBuilder()
    );
  }

  public getRegisteredBuilders(): UniversalVisualBuilder[] {
    return [...this.builders];
  }

  public buildPayload(
    beat: UniversalTeachingBeat,
    decision: VisualPlanningDecision
  ): VisualBuildResult {
    const builder = this.resolveBuilder(decision.intent, decision.templateId);
    const result = builder.build(beat, decision);

    if (result.fallbackUsed && result.intent === 'EXPLANATION') {
      const editorialBuilder = this.resolveBuilder('EXPLANATION', 'template.explanation.editorial');
      return editorialBuilder.build(beat, {
        ...decision,
        intent: 'EXPLANATION',
        templateId: 'template.explanation.editorial',
      });
    }

    return result;
  }
}

export const defaultUniversalVisualBuilderRegistry = new UniversalVisualBuilderRegistry();

/**
 * End-to-End Pipeline Transformation Helper:
 * Takes a UniversalTeachingBeat, plans the visual (if needed), resolves the builder,
 * constructs the concrete visual payload, and returns the fully enriched beat.
 */
export function buildVisualForBeat(
  beat: UniversalTeachingBeat,
  decision?: VisualPlanningDecision,
  registry: UniversalVisualBuilderRegistry = defaultUniversalVisualBuilderRegistry
): UniversalTeachingBeat {
  const planDecision =
    decision ||
    (beat.visual?.intent && beat.visual?.templateId && beat.visual.intent !== 'EXPLANATION'
      ? {
          intent: beat.visual.intent,
          templateId: beat.visual.templateId,
          environment: beat.visual.environment || 'NEUTRAL',
          pedagogicalRole: 'COMPARISON' as PedagogicalRole,
          confidence: 0.95,
          rationale: `Using explicitly specified beat intent '${beat.visual.intent}'.`,
          payloadPlan: {
            needsNodes: beat.visual.intent === 'DIAGRAM' || beat.visual.intent === 'PROCESS',
            needsConnectors: beat.visual.intent === 'DIAGRAM' || beat.visual.intent === 'PROCESS',
            needsAxes: beat.visual.intent === 'GRAPH',
            needsSeries: beat.visual.intent === 'GRAPH',
            needsEquations: beat.visual.intent === 'FORMULA',
            needsComparison: beat.visual.intent === 'COMPARISON',
            needsCode: beat.visual.intent === 'CODE',
            needsTimeline: beat.visual.intent === 'TIMELINE',
            needsMedia: beat.visual.intent === 'MEDIA',
          },
        }
      : defaultUniversalVisualPlanner.planVisual({
          content: beat.content,
          speechText: beat.speechText,
          displayText: beat.displayText,
          subjectEnvironment: beat.visual?.environment,
          visualPayloadHints: {
            hasNodes: Boolean(beat.visual?.payload?.nodes?.length),
            hasConnectors: Boolean(beat.visual?.payload?.connectors?.length),
            hasAxes: Boolean(beat.visual?.payload?.axes),
            hasSeries: Boolean(beat.visual?.payload?.series?.length),
            hasEquations: Boolean(beat.visual?.payload?.equations?.length),
            hasComparison: Boolean(beat.visual?.payload?.comparison),
            hasCode: Boolean(beat.visual?.payload?.code),
            hasTimeline: Boolean(beat.visual?.payload?.timeline?.length),
          },
        }));

  const buildResult = registry.buildPayload(beat, planDecision);

  return {
    ...beat,
    visual: {
      ...beat.visual,
      intent: buildResult.intent,
      templateId: buildResult.templateId,
      payload: {
        ...beat.visual?.payload,
        ...buildResult.payload,
      },
    },
    animation: {
      ...beat.animation,
      activeElements:
        beat.animation.activeElements.length > 0
          ? beat.animation.activeElements
          : buildResult.intent === 'PROCESS'
          ? ['step-1']
          : [],
    },
  };
}
