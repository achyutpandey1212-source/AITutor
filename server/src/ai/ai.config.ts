import type { AIProviderName } from '@ai-tutor/shared';

/**
 * Granular AI capabilities for capability-aware provider routing.
 */
export type AICapability =
  | 'TEXT_GENERATION'
  | 'STRUCTURED_REASONING'
  | 'ASSESSMENT_GENERATION'
  | 'ASSESSMENT_EVALUATION'
  | 'MULTIMODAL_ASSESSMENT_EVALUATION'
  | 'DOCUMENT_UNDERSTANDING'
  | 'VISION'
  | 'LIGHTWEIGHT';

/**
 * Supported task categories for task-based model routing.
 */
export type AITaskType =
  | 'reasoning'
  | 'structured_reasoning'
  | 'assessment_generation'
  | 'assessment_evaluation'
  | 'multimodal_assessment_evaluation'
  | 'document_understanding'
  | 'vision'
  | 'general_secondary'
  | 'lightweight'
  | 'fallback_reasoning';

/**
 * Task to required capability mapping.
 */
export const TASK_CAPABILITY_REQUIREMENTS: Record<AITaskType, AICapability> = {
  reasoning: 'TEXT_GENERATION',
  structured_reasoning: 'STRUCTURED_REASONING',
  assessment_generation: 'ASSESSMENT_GENERATION',
  assessment_evaluation: 'ASSESSMENT_EVALUATION',
  multimodal_assessment_evaluation: 'MULTIMODAL_ASSESSMENT_EVALUATION',
  document_understanding: 'DOCUMENT_UNDERSTANDING',
  vision: 'VISION',
  general_secondary: 'TEXT_GENERATION',
  lightweight: 'LIGHTWEIGHT',
  fallback_reasoning: 'STRUCTURED_REASONING',
};

/**
 * Locked Model Stack Specifications
 */
export const AI_MODELS = {
  GEMINI: {
    PRIMARY_REASONING: 'gemini-3.7-flash',
    FALLBACK_REASONING_1: 'gemini-3.6-flash',
    FALLBACK_REASONING_2: 'gemini-3.5-flash',
    LIGHTWEIGHT: 'gemini-3.5-flash-lite',
    GENERAL_SECONDARY: 'gemini-3.5-flash',
  },
  GROQ: {
    PRIMARY: 'qwen/qwen3.8-27b',
    FALLBACK: 'qwen/qwen3.6-27b',
  },
  COHERE: {
    EMBEDDING: 'embed-v4.0',
    EMBEDDING_DIMENSION: 1536,
    RERANK: 'rerank-v4.0-fast',
  },
} as const;

/**
 * Model fallback chains per provider
 */
export const GEMINI_REASONING_MODEL_CHAIN: readonly string[] = [
  AI_MODELS.GEMINI.PRIMARY_REASONING,
  AI_MODELS.GEMINI.FALLBACK_REASONING_2,
  AI_MODELS.GEMINI.FALLBACK_REASONING_1,
];

export const GROQ_MODEL_CHAIN: readonly string[] = [
  AI_MODELS.GROQ.PRIMARY,
  AI_MODELS.GROQ.FALLBACK,
];

/**
 * Task-specific bounded timeouts (ms)
 */
export const TASK_TIMEOUTS: Record<AITaskType, number> = {
  lightweight: 3500,
  general_secondary: 5000,
  reasoning: 7000,
  fallback_reasoning: 7000,
  structured_reasoning: 7000,
  assessment_generation: 8000,
  assessment_evaluation: 9000,
  document_understanding: 15000,
  vision: 15000,
  multimodal_assessment_evaluation: 18000, // 18 seconds: ample time for multimodal vision & handwriting OCR
};

/**
 * Task-based model resolution mapping
 */
export interface TaskModelConfig {
  provider: AIProviderName;
  modelChain: readonly string[];
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export const TASK_MODEL_MAPPINGS: Record<AITaskType, TaskModelConfig> = {
  reasoning: {
    provider: 'gemini',
    modelChain: GEMINI_REASONING_MODEL_CHAIN,
    temperature: 0.3,
    maxTokens: 3000,
    timeoutMs: TASK_TIMEOUTS.reasoning,
  },
  structured_reasoning: {
    provider: 'gemini',
    modelChain: GEMINI_REASONING_MODEL_CHAIN,
    temperature: 0.2,
    maxTokens: 4000,
    timeoutMs: TASK_TIMEOUTS.structured_reasoning,
  },
  assessment_generation: {
    provider: 'gemini',
    modelChain: GEMINI_REASONING_MODEL_CHAIN,
    temperature: 0.2,
    maxTokens: 4000,
    timeoutMs: TASK_TIMEOUTS.assessment_generation,
  },
  assessment_evaluation: {
    provider: 'gemini',
    modelChain: GEMINI_REASONING_MODEL_CHAIN,
    temperature: 0.1,
    maxTokens: 4000,
    timeoutMs: TASK_TIMEOUTS.assessment_evaluation,
  },
  multimodal_assessment_evaluation: {
    provider: 'gemini',
    modelChain: GEMINI_REASONING_MODEL_CHAIN,
    temperature: 0.1,
    maxTokens: 4000,
    timeoutMs: TASK_TIMEOUTS.multimodal_assessment_evaluation,
  },
  document_understanding: {
    provider: 'gemini',
    modelChain: GEMINI_REASONING_MODEL_CHAIN,
    temperature: 0.1,
    maxTokens: 4000,
    timeoutMs: TASK_TIMEOUTS.document_understanding,
  },
  vision: {
    provider: 'gemini',
    modelChain: GEMINI_REASONING_MODEL_CHAIN,
    temperature: 0.1,
    maxTokens: 4000,
    timeoutMs: TASK_TIMEOUTS.vision,
  },
  general_secondary: {
    provider: 'gemini',
    modelChain: [AI_MODELS.GEMINI.GENERAL_SECONDARY, AI_MODELS.GEMINI.FALLBACK_REASONING_1],
    temperature: 0.4,
    maxTokens: 2500,
    timeoutMs: TASK_TIMEOUTS.general_secondary,
  },
  lightweight: {
    provider: 'gemini',
    modelChain: [AI_MODELS.GEMINI.LIGHTWEIGHT, AI_MODELS.GEMINI.GENERAL_SECONDARY],
    temperature: 0.3,
    maxTokens: 1500,
    timeoutMs: TASK_TIMEOUTS.lightweight,
  },
  fallback_reasoning: {
    provider: 'groq',
    modelChain: GROQ_MODEL_CHAIN,
    temperature: 0.2,
    maxTokens: 3000,
    timeoutMs: TASK_TIMEOUTS.fallback_reasoning,
  },
};

/**
 * Operational limits & timeouts
 */
export const AI_CONFIG = {
  DEFAULT_TIMEOUT_MS: 7000, // 7s standard timeout
  REQUEST_TIMEOUT_MS: 7000, // Backwards compatible alias
  MAX_KEY_ATTEMPTS_PER_PROVIDER: 2, // Hard bounded limit: max 2 key/model attempts per request
  DEFAULT_KEY_COOLDOWN_MS: 60000, // 60s cooldown for rate-limited/exhausted keys

  MAX_STRUCTURED_REPAIR_ATTEMPTS: 2,
  QDRANT: {
    DEFAULT_COLLECTION: 'ai_tutor_knowledge_v2',
    VECTOR_DIMENSION: AI_MODELS.COHERE.EMBEDDING_DIMENSION,
  },
} as const;
