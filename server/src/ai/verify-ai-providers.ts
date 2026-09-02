/**
 * Verification Suite for M7 Pre-Phase 3:
 * AI Provider & Model Stack Hardening
 */

import { KeyPool } from './key-pool.js';
import { GeminiProvider } from './providers/gemini.provider.js';
import { GroqProvider } from './providers/groq.provider.js';
import { AIService } from './ai.service.js';
import { classifyAIError } from './ai.errors.js';
import { AI_MODELS, TASK_MODEL_MAPPINGS } from './ai.config.js';
import type { IAIProvider } from './ai-provider.interface.js';

async function runAIProviderVerification() {
  console.log('====================================================');
  console.log('🧪 RUNNING AI PROVIDER & MODEL STACK HARDENING SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${detail || 'Assertion failed'}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // 1. LOCKED MODEL STACK & TASK MAPPING
  // ----------------------------------------------------
  console.log('--- 1. Locked Model Stack & Task Routing Configuration ---');
  assert(AI_MODELS.GEMINI.PRIMARY_REASONING === 'gemini-3.7-flash', 'Primary reasoning is gemini-3.7-flash');
  assert(AI_MODELS.GEMINI.FALLBACK_REASONING_1 === 'gemini-3.6-flash', 'Gemini fallback 1 is gemini-3.6-flash');
  assert(AI_MODELS.GEMINI.FALLBACK_REASONING_2 === 'gemini-3.5-flash', 'Gemini fallback 2 is gemini-3.5-flash');
  assert(AI_MODELS.GEMINI.LIGHTWEIGHT === 'gemini-3.5-flash-lite', 'Lightweight is gemini-3.5-flash-lite');
  assert(AI_MODELS.GROQ.PRIMARY === 'qwen/qwen3.8-27b', 'Groq primary is qwen/qwen3.8-27b');
  assert(AI_MODELS.GROQ.FALLBACK === 'qwen/qwen3.6-27b', 'Groq fallback is qwen/qwen3.6-27b');
  assert(AI_MODELS.COHERE.EMBEDDING === 'embed-v4.0', 'Cohere embedding is embed-v4.0');
  assert(AI_MODELS.COHERE.EMBEDDING_DIMENSION === 1536, 'Cohere dimension is 1536');
  assert(AI_MODELS.COHERE.RERANK === 'rerank-v4.0-fast', 'Cohere rerank is rerank-v4.0-fast');

  assert(
    TASK_MODEL_MAPPINGS.assessment_generation.modelChain[0] === 'gemini-3.7-flash',
    'assessment_generation routes to gemini-3.7-flash'
  );
  assert(
    TASK_MODEL_MAPPINGS.assessment_evaluation.modelChain[0] === 'gemini-3.7-flash',
    'assessment_evaluation routes to gemini-3.7-flash'
  );
  assert(
    TASK_MODEL_MAPPINGS.reasoning.modelChain[0] === 'gemini-3.7-flash',
    'reasoning routes to gemini-3.7-flash'
  );

  // ----------------------------------------------------
  // 2. ERROR CLASSIFICATION
  // ----------------------------------------------------
  console.log('\n--- 2. Error Classification ---');
  const err429 = classifyAIError({ status: 429, message: 'Resource exhausted / rate limit' });
  assert(err429.code === 'RATE_LIMITED' && err429.isKeyRecoverable && !err429.isModelError, '429 is classified as RATE_LIMITED (key recoverable)');

  const err401 = classifyAIError({ status: 401, message: 'Invalid API key provided' });
  assert(err401.code === 'INVALID_API_KEY' && err401.isKeyRecoverable, '401 is classified as INVALID_API_KEY (key recoverable)');

  const err404 = classifyAIError({ status: 404, message: 'Model models/gemini-2.0-flash is no longer available' });
  assert(err404.code === 'MODEL_NOT_FOUND' && err404.isModelError && !err404.isKeyRecoverable, '404 is classified as MODEL_NOT_FOUND (isModelError=true, isKeyRecoverable=false)');

  const errTimeout = classifyAIError({ message: 'Request timed out after 30000ms' });
  assert(errTimeout.code === 'NETWORK_TIMEOUT' && errTimeout.isProviderRecoverable, 'Timeout is classified as NETWORK_TIMEOUT (provider recoverable)');

  const err400 = classifyAIError({ status: 400, message: 'Bad request: contents cannot be empty' });
  assert(err400.code === 'INVALID_REQUEST' && !err400.isKeyRecoverable && !err400.isProviderRecoverable, '400 is classified as INVALID_REQUEST (fails fast)');

  // ----------------------------------------------------
  // 3. KEY POOL ROTATION & HEALTH TRACKING
  // ----------------------------------------------------
  console.log('\n--- 3. KeyPool Rotation & Health Tracking ---');
  const pool = new KeyPool('test_provider', ['mock_key_1', 'mock_key_2', 'mock_key_3'], { cooldownMs: 5000 });
  assert(pool.getKeyCount() === 3, 'KeyPool initializes with 3 keys');
  assert(pool.getHealthyKeyCount() === 3, 'All 3 keys initially healthy');

  const key1 = pool.getNextKeyInfo();
  assert(key1?.key === 'mock_key_1' && key1?.slotIndex === 1, 'First key selected is slot 1');

  // Mark Key 1 unavailable
  pool.markKeyUnavailable('mock_key_1', 5000, 'RATE_LIMITED');
  assert(pool.getHealthyKeyCount() === 2, 'Healthy key count drops to 2');

  const key2 = pool.getNextKeyInfo();
  assert(key2?.key === 'mock_key_2' && key2?.slotIndex === 2, 'Rotates to key slot 2');

  const key3 = pool.getNextKeyInfo();
  assert(key3?.key === 'mock_key_3' && key3?.slotIndex === 3, 'Rotates to key slot 3');

  // Next request wraps around skipping unavailable key 1
  const keyNext = pool.getNextKeyInfo();
  assert(keyNext?.key === 'mock_key_2' && keyNext?.slotIndex === 2, 'Wraps around skipping cooled-down key 1');

  // ----------------------------------------------------
  // 4. GEMINI PROVIDER: KEY ROTATION ON RECOVERABLE FAILURE
  // ----------------------------------------------------
  console.log('\n--- 4. Provider Key Rotation on Rate Limit ---');
  let mockGenCount = 0;
  const geminiProviderTest = new GeminiProvider(['mock_k1', 'mock_k2']);

  // Override executeWithKeyAndModelRotation's internal operation or test KeyPool rotation
  (geminiProviderTest as any).getClient = (_key: string) => ({
    models: {
      generateContent: async () => {
        mockGenCount++;
        if (mockGenCount === 1) {
          throw { status: 429, message: 'Quota exceeded on key slot 1' };
        }
        return { text: 'Success on key 2' };
      },
    },
  });

  const genRes = await geminiProviderTest.generateText('Hello');
  assert(genRes.text === 'Success on key 2', 'Key 1 failed with 429 and rotated to Key 2 successfully');
  assert(mockGenCount === 2, 'Total 2 key attempts made before success');
  assert(geminiProviderTest.getKeyPool().getHealthyKeyCount() === 1, 'Key 1 marked in cooldown, 1 healthy key remains');


  // ----------------------------------------------------
  // 5. PROVIDER FALLBACK: GEMINI UNAVAILABLE -> GROQ
  // ----------------------------------------------------
  console.log('\n--- 5. Provider Fallback: Gemini Unavailable -> Groq ---');
  const mockFailingGemini: IAIProvider = {
    name: 'gemini',
    defaultModel: 'gemini-3.7-flash',
    isConfigured: () => true,
    supportsCapability: () => true,
    async generateText() {
      throw { status: 503, message: 'Gemini service temporarily overloaded' };
    },
    async generateStructured() {
      throw { status: 503, message: 'Gemini service temporarily overloaded' };
    },
    async streamText() {
      throw { status: 503, message: 'Gemini service temporarily overloaded' };
    },
  };

  const mockSuccessfulGroq: IAIProvider = {
    name: 'groq',
    defaultModel: 'qwen/qwen3.8-27b',
    isConfigured: () => true,
    supportsCapability: (cap) => cap !== 'MULTIMODAL_ASSESSMENT_EVALUATION' && cap !== 'VISION',
    async generateText() {
      return { text: 'Groq fallback response', model: 'qwen/qwen3.8-27b' };
    },
    async generateStructured<T>() {
      return { data: { message: 'Groq structured fallback' } as any, model: 'qwen/qwen3.8-27b' };
    },
    async streamText() {
      return { fullText: 'Groq stream fallback', model: 'qwen/qwen3.8-27b' };
    },
  };

  const fallbackService = new AIService(mockFailingGemini, mockSuccessfulGroq);
  const fallbackRes = await fallbackService.generateText('Test fallback');
  assert(fallbackRes.text === 'Groq fallback response', 'Failing Gemini successfully routed to Groq');
  assert(fallbackRes.provider === 'groq', 'Response provider marked as groq');
  assert(fallbackRes.fallbackUsed === true, 'fallbackUsed flag is true');

  const structFallbackRes = await fallbackService.generateStructured<any>('Test', '{}');
  assert(structFallbackRes.data.message === 'Groq structured fallback', 'Structured fallback succeeded on Groq');
  assert(structFallbackRes.fallbackUsed === true, 'Structured fallbackUsed is true');

  // ----------------------------------------------------
  // 6. MODEL ERROR: DOES NOT LOOP ALL KEYS
  // ----------------------------------------------------
  console.log('\n--- 6. Model Error: Immediate Advance Without Key Iteration ---');
  let modelCallCount = 0;
  const mockModelErrGemini: IAIProvider = {
    name: 'gemini',
    defaultModel: 'invalid-model-id',
    isConfigured: () => true,
    supportsCapability: () => true,
    async generateText() {
      modelCallCount++;
      throw { status: 404, message: 'Model invalid-model-id does not exist' };
    },
    async generateStructured() {
      throw { status: 404, message: 'Model invalid-model-id does not exist' };
    },
    async streamText() {
      throw { status: 404, message: 'Model invalid-model-id does not exist' };
    },
  };

  const modelErrService = new AIService(mockModelErrGemini, mockSuccessfulGroq);
  const modelErrRes = await modelErrService.generateText('Prompt');
  assert(modelCallCount === 1, 'Model 404 error called primary exactly once without looping remaining keys');
  assert(modelErrRes.provider === 'groq', 'Immediately fell back to Groq');

  // ----------------------------------------------------
  // 7. BOUNDED RETRIES & CLEAN FAILURE WHEN BOTH FAIL
  // ----------------------------------------------------
  console.log('\n--- 7. Bounded Retries & Clean Failure ---');
  const mockFailingGroq: IAIProvider = {
    name: 'groq',
    defaultModel: 'qwen/qwen3.8-27b',
    isConfigured: () => true,
    supportsCapability: (cap) => cap !== 'MULTIMODAL_ASSESSMENT_EVALUATION' && cap !== 'VISION',
    async generateText() {
      throw { status: 500, message: 'Groq internal error' };
    },
    async generateStructured() {
      throw { status: 500, message: 'Groq internal error' };
    },
    async streamText() {
      throw { status: 500, message: 'Groq internal error' };
    },
  };

  const bothFailingService = new AIService(mockFailingGemini, mockFailingGroq);
  let caughtError: any = null;
  try {
    await bothFailingService.generateText('Test both fail');
  } catch (err: any) {
    caughtError = err;
  }
  assert(Boolean(caughtError), 'Throws clean error when both providers fail');
  assert(
    caughtError.message.includes('AI generation failed on both primary') &&
    caughtError.message.includes('fallback'),
    'Error message clearly communicates failure on both providers without hanging'
  );

  console.log('\n====================================================');
  console.log(`🏁 AI PROVIDER HARDENING SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAIProviderVerification().catch((err) => {
  console.error('AI Provider verification suite error:', err);
  process.exit(1);
});
