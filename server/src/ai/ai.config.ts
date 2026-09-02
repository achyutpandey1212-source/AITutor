import type { AIProviderName } from '@ai-tutor/shared';

/**
 * Supported task categories for task-based model routing.
 */
export type AITaskType =
  | 'reasoning'
  | 'structured_reasoning'
  | 'assessment_generation'
  | 'assessment_evaluation'
  | 'document_understanding'
  | 'vision'
  | 'general_secondary'
  | 'lightweight'
  | 'fallback_reasoning';

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
 * Task-based model resolution mapping
 */
export interface TaskModelConfig {
  provider: AIProviderName;
  modelChain: readonly string[];
  temperature?: number;
  maxTokens?: number;
}

export const TASK_MODEL_MAPPINGS: Record<AITaskType, TaskModelConfig> = {
  reasoning: {
    provider: 'gemini',
    modelChain: GEMINI_REASONING_MODEL_CHAIN,
    temperature: 0.3,
    maxTokens: 3000,
  },
  structured_reasoning: {
    provider: 'gemini',
    modelChain: GEMINI_REASONING_MODEL_CHAIN,
    temperature: 0.2,
    maxTokens: 4000,
  },
  assessment_generation: {
    provider: 'gemini',
    modelChain: GEMINI_REASONING_MODEL_CHAIN,
    temperature: 0.2,
    maxTokens: 4000,
  },
  assessment_evaluation: {
    provider: 'gemini',
    modelChain: GEMINI_REASONING_MODEL_CHAIN,
    temperature: 0.1,
    maxTokens: 4000,
  },
  document_understanding: {
    provider: 'gemini',
    modelChain: GEMINI_REASONING_MODEL_CHAIN,
    temperature: 0.1,
    maxTokens: 4000,
  },
  vision: {
    provider: 'gemini',
    modelChain: GEMINI_REASONING_MODEL_CHAIN,
    temperature: 0.1,
    maxTokens: 4000,
  },
  general_secondary: {
    provider: 'gemini',
    modelChain: [AI_MODELS.GEMINI.GENERAL_SECONDARY, AI_MODELS.GEMINI.FALLBACK_REASONING_1],
    temperature: 0.4,
    maxTokens: 2500,
  },
  lightweight: {
    provider: 'gemini',
    modelChain: [AI_MODELS.GEMINI.LIGHTWEIGHT, AI_MODELS.GEMINI.GENERAL_SECONDARY],
    temperature: 0.3,
    maxTokens: 1500,
  },
  fallback_reasoning: {
    provider: 'groq',
    modelChain: GROQ_MODEL_CHAIN,
    temperature: 0.2,
    maxTokens: 3000,
  },
};

/**
 * Operational limits & timeouts
 */
export const AI_CONFIG = {
  REQUEST_TIMEOUT_MS: 7000, // 7s bounded request timeout per attempt
  MAX_KEY_ATTEMPTS_PER_PROVIDER: 2, // Hard bounded limit: max 2 key/model attempts per request
  DEFAULT_KEY_COOLDOWN_MS: 60000, // 60s cooldown for rate-limited/exhausted keys

  MAX_STRUCTURED_REPAIR_ATTEMPTS: 2,
  QDRANT: {
    DEFAULT_COLLECTION: 'ai_tutor_knowledge_v2',
    VECTOR_DIMENSION: AI_MODELS.COHERE.EMBEDDING_DIMENSION,
  },
} as const;

