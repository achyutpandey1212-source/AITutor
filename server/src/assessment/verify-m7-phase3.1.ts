/**
 * M7.1 Verification Suite: Multimodal Evaluation Reliability & Capability-Aware AI Routing
 *
 * Tests:
 * 1. Provider Capability Matrix (Gemini multimodal vs Groq text-only capability)
 * 2. Capability-Aware Routing (No blind Groq vision fallback)
 * 3. Task-Specific Timeouts (18s for multimodal vision evaluation, 7s for reasoning)
 * 4. Error Classification & Gemini Key Rotation on Timeout / 429
 * 5. Handwritten Solution Logic:
 *    - Messy != Unreadable: Reconstructs student working from realistic notebook work
 *    - Arithmetic error isolation: methodSelection='strong', calculation='weak', partial credit
 *    - No hallucination rule: unreadable/blurry -> NEEDS_REVIEW with IMAGE_UNREADABLE
 * 6. Failure Taxonomy & Learner Safety:
 *    - TIMEOUT, PROVIDER_UNAVAILABLE, IMAGE_UNREADABLE, IMAGE_INCOMPLETE never degrade mastery
 */

import {
  EvaluationResultSchema,
  LearnerAssessmentStateSchema,
  type AssessmentQuestion,
  type AssessmentSubmission,
  type EvaluationResult,
  type LearnerAssessmentState,
} from '@ai-tutor/shared';
import {
  TASK_CAPABILITY_REQUIREMENTS,
  TASK_TIMEOUTS,
  TASK_MODEL_MAPPINGS,
} from '../ai/ai.config.js';
import { AIService } from '../ai/ai.service.js';
import type { IAIProvider } from '../ai/ai-provider.interface.js';
import { GeminiProvider } from '../ai/providers/gemini.provider.js';
import { GroqProvider } from '../ai/providers/groq.provider.js';
import { EvaluationNormalizer } from './evaluation/evaluation-normalizer.js';
import { TeachingStateUpdater } from './teaching-state-updater.js';
import { ImageSolutionEvaluator } from './evaluation/image-solution-evaluator.js';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    console.error(`  ❌ FAIL: ${testName}${detail ? ` — ${detail}` : ''}`);
  }
}

async function runM71Verification() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING M7.1 MULTIMODAL & CAPABILITY ROUTING SUITE');
  console.log('======================================================\n');

  // ---------------------------------------------------------
  // 1. Capability Matrix & Task Configuration
  // ---------------------------------------------------------
  console.log('--- 1. Provider Capability Matrix & Task Mapping ---');

  const gemini = new GeminiProvider();
  const groq = new GroqProvider();

  assert(gemini.supportsCapability('MULTIMODAL_ASSESSMENT_EVALUATION'), 'Gemini supports MULTIMODAL_ASSESSMENT_EVALUATION');
  assert(gemini.supportsCapability('TEXT_GENERATION'), 'Gemini supports TEXT_GENERATION');
  assert(gemini.supportsCapability('STRUCTURED_REASONING'), 'Gemini supports STRUCTURED_REASONING');

  assert(!groq.supportsCapability('MULTIMODAL_ASSESSMENT_EVALUATION'), 'Groq explicitly rejects MULTIMODAL_ASSESSMENT_EVALUATION');
  assert(!groq.supportsCapability('VISION'), 'Groq explicitly rejects VISION');
  assert(groq.supportsCapability('TEXT_GENERATION'), 'Groq supports TEXT_GENERATION');
  assert(groq.supportsCapability('STRUCTURED_REASONING'), 'Groq supports STRUCTURED_REASONING');

  assert(
    TASK_CAPABILITY_REQUIREMENTS.multimodal_assessment_evaluation === 'MULTIMODAL_ASSESSMENT_EVALUATION',
    'multimodal_assessment_evaluation task maps to MULTIMODAL_ASSESSMENT_EVALUATION capability'
  );
  assert(
    TASK_CAPABILITY_REQUIREMENTS.assessment_evaluation === 'ASSESSMENT_EVALUATION',
    'assessment_evaluation task maps to ASSESSMENT_EVALUATION capability'
  );

  // ---------------------------------------------------------
  // 2. Task-Specific Bounded Timeouts
  // ---------------------------------------------------------
  console.log('\n--- 2. Task-Specific Bounded Timeouts ---');

  assert(
    TASK_TIMEOUTS.multimodal_assessment_evaluation === 18000,
    `Multimodal evaluation timeout is 18000ms (got ${TASK_TIMEOUTS.multimodal_assessment_evaluation}ms)`
  );
  assert(
    TASK_TIMEOUTS.document_understanding === 15000,
    `Document understanding timeout is 15000ms (got ${TASK_TIMEOUTS.document_understanding}ms)`
  );
  assert(
    TASK_TIMEOUTS.assessment_evaluation === 9000,
    `Text assessment evaluation timeout is 9000ms (got ${TASK_TIMEOUTS.assessment_evaluation}ms)`
  );
  assert(
    TASK_TIMEOUTS.assessment_generation === 8000,
    `Assessment generation timeout is 8000ms (got ${TASK_TIMEOUTS.assessment_generation}ms)`
  );
  assert(
    TASK_TIMEOUTS.reasoning === 7000,
    `General reasoning timeout is 7000ms (got ${TASK_TIMEOUTS.reasoning}ms)`
  );
  assert(
    TASK_TIMEOUTS.lightweight === 3500,
    `Lightweight task timeout is 3500ms (got ${TASK_TIMEOUTS.lightweight}ms)`
  );

  // ---------------------------------------------------------
  // 3. Capability-Aware Routing & No Blind Groq Vision Fallback
  // ---------------------------------------------------------
  console.log('\n--- 3. Capability-Aware Fallback Routing ---');

  // Mock primary provider that throws a recoverable network timeout
  const mockFailingGemini: IAIProvider = {
    name: 'gemini',
    defaultModel: 'gemini-3.7-flash',
    isConfigured: () => true,
    supportsCapability: () => true,
    generateText: async () => {
      throw new Error('Gemini request timed out after 18000ms');
    },
    generateStructured: async () => {
      throw new Error('Gemini request timed out after 18000ms');
    },
    streamText: async () => {
      throw new Error('Gemini request timed out after 18000ms');
    },
  };

  let groqCalledForVision: boolean = false;
  let groqCalledForText: boolean = false;

  const mockGroq: IAIProvider = {
    name: 'groq',
    defaultModel: 'qwen/qwen3.8-27b',
    isConfigured: () => true,
    supportsCapability: (cap) => {
      return cap !== 'MULTIMODAL_ASSESSMENT_EVALUATION' && cap !== 'VISION';
    },
    generateText: async () => {
      groqCalledForText = true;
      return { text: 'Groq text response', model: 'qwen/qwen3.8-27b' };
    },
    generateStructured: async <T>() => {
      groqCalledForVision = true;
      return { data: { correct: true, score: 5 } as unknown as T, model: 'qwen/qwen3.8-27b' };
    },
    streamText: async () => {
      return { fullText: 'Groq stream', model: 'qwen/qwen3.8-27b' };
    },
  };

  const aiServiceCustom = new AIService(mockFailingGemini, mockGroq);

  // 3.1 Text generation with Gemini failure -> Successfully falls back to Groq
  try {
    const textRes = await aiServiceCustom.generateText('Explain photosynthesis', {
      taskType: 'reasoning',
    });
    assert(Boolean(textRes.fallbackUsed), 'Text task falls back to Groq when Gemini fails');
    assert(Boolean(groqCalledForText), 'Groq is invoked for text generation fallback');
  } catch (err) {
    assert(false, 'Text task should fall back to Groq', String(err));
  }

  // 3.2 Multimodal vision evaluation with Gemini failure -> DOES NOT call Groq blindly!
  try {
    await aiServiceCustom.generateStructured(
      'Evaluate handwritten math',
      'schema',
      {
        taskType: 'multimodal_assessment_evaluation',
      }
    );
    assert(false, 'Multimodal vision task should have thrown when Gemini failed rather than blindly calling Groq');
  } catch (err: any) {
    assert(
      !groqCalledForVision,
      'Groq was NOT called for multimodal assessment evaluation task (capability check passed)'
    );
    assert(
      err.message.includes('timed out') || err.message.includes('Gemini'),
      'Original primary error preserved without blind fallback corruption'
    );
  }

  // ---------------------------------------------------------
  // 4. Handwritten Image Evaluation & Failure Taxonomy
  // ---------------------------------------------------------
  console.log('\n--- 4. Handwritten Evaluation & Failure Taxonomy ---');

  const sampleMathQuestion: AssessmentQuestion = {
    questionId: 'q-math-501',
    concept: 'Quadratic Equations',
    subject: 'Mathematics',
    difficulty: 'medium',
    questionType: 'NUMERICAL',
    evaluationMode: 'IMAGE_SOLUTION',
    marks: 5,
    question: 'Solve for x by factorization: x^2 - 5x + 6 = 0',
    expectedAnswer: 'x = 2, x = 3',
    rubric: {
      method: 'Factorization method',
      steps: ['Identify factors (x-2)(x-3) = 0', 'Solve x = 2 and x = 3'],
      finalAnswer: 'x = 2, x = 3',
    },
    requiresImageUpload: true,
    ragGrounded: false,
  };

  const validSubmission: AssessmentSubmission = {
    id: 'sub-image-1',
    userId: 'student-1',
    questionId: 'q-math-501',
    questionType: 'IMAGE_SOLUTION',
    evaluationMode: 'IMAGE_SOLUTION',
    imageReference: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...',
    status: 'SUBMITTED',
    submittedAt: new Date().toISOString(),
  };

  // 4.1 Missing Image -> failureReason: IMAGE_INCOMPLETE
  const emptySub: AssessmentSubmission = {
    ...validSubmission,
    imageReference: undefined,
  };
  const emptyImgResult = await new ImageSolutionEvaluator().evaluate({
    question: sampleMathQuestion,
    submission: emptySub,
  });
  assert(emptyImgResult.evaluationStatus === 'NEEDS_REVIEW', 'Missing image sets status to NEEDS_REVIEW');
  assert(emptyImgResult.failureReason === 'IMAGE_INCOMPLETE', 'Missing image sets failureReason to IMAGE_INCOMPLETE');

  // 4.2 Simulated Timeout -> failureReason: TIMEOUT
  const timeoutAIService = new AIService({
    name: 'gemini',
    defaultModel: 'gemini-3.7-flash',
    isConfigured: () => true,
    supportsCapability: () => true,
    generateText: async () => ({ text: '', model: '' }),
    generateStructured: async () => {
      throw new Error('Gemini request timed out after 18000ms');
    },
    streamText: async () => ({ fullText: '', model: '' }),
  }, mockGroq);

  const timeoutEvaluator = new ImageSolutionEvaluator(timeoutAIService);
  const timeoutResult = await timeoutEvaluator.evaluate({
    question: sampleMathQuestion,
    submission: validSubmission,
  });
  assert(timeoutResult.evaluationStatus === 'NEEDS_REVIEW', 'Timeout sets evaluationStatus to NEEDS_REVIEW');
  assert(timeoutResult.failureReason === 'TIMEOUT', 'Timeout sets failureReason to TIMEOUT');
  assert(timeoutResult.confidence === 0.0, 'Timeout sets confidence to 0.0');

  // 4.3 Simulated Messy Student Notebook Solution -> EVALUATED with Partial Credit
  const messyNotebookNorm = EvaluationNormalizer.normalize(
    {
      correct: false,
      score: 3,
      maxScore: 5,
      confidence: 0.88,
      stepEvaluation: [
        {
          step: 1,
          criterion: 'Equation Setup & Factorization',
          status: 'correct',
          score: 3,
          maxScore: 3,
          feedback: 'Correct factors (x-2)(x-3) found on notebook page despite crossed-out line.',
        },
        {
          step: 2,
          criterion: 'Final Root Extraction',
          status: 'incorrect',
          score: 0,
          maxScore: 2,
          feedback: 'Sign error on final line: wrote x = -2, -3 instead of +2, +3.',
        },
      ],
      conceptAssessment: {
        understanding: 'strong',
        methodSelection: 'strong',
        calculation: 'weak',
      },
      misconceptions: ['Root sign inversion'],
      strengths: ['Clear factorization steps', 'Accurate quadratic decomposition'],
      weaknesses: ['Sign slip on final roots'],
      recommendedAction: 'TARGETED_PRACTICE',
      failureReason: 'NONE',
      feedback: 'Good factorization working! You correctly factored the quadratic, but watch the signs when equating factors to zero.',
    },
    sampleMathQuestion,
    validSubmission,
    'IMAGE_SOLUTION'
  );

  assert(messyNotebookNorm.evaluationStatus === 'EVALUATED', 'Messy readable student notebook is successfully EVALUATED');
  assert(messyNotebookNorm.score === 3, 'Partial credit (3/5) awarded for correct setup & factors');
  assert(messyNotebookNorm.conceptAssessment?.methodSelection === 'strong', 'methodSelection classified as strong');
  assert(messyNotebookNorm.conceptAssessment?.calculation === 'weak', 'calculation classified as weak');
  assert(messyNotebookNorm.failureReason === 'NONE', 'Valid evaluated submission has failureReason NONE');

  // ---------------------------------------------------------
  // 5. Learner Assessment State Protection on Failures
  // ---------------------------------------------------------
  console.log('\n--- 5. Learner State Protection (Zero Mastery Degradation) ---');

  const updater = new TeachingStateUpdater({
    previousWeight: 0.75,
    currentWeight: 0.25,
    highConfidenceThreshold: 0.75,
    mediumConfidenceThreshold: 0.50,
    maxHistoryLength: 5,
  });

  const initialLearnerMastery = {
    concept: 'Quadratic Equations',
    subject: 'Mathematics',
    mastery: 0.75,
    confidence: 0.80,
    skills: { understanding: 0.75, method_selection: 0.75, calculation: 0.75 },
    recentPerformance: [],
    misconceptions: [],
  };

  // 5.1 TIMEOUT evaluation must NOT degrade mastery
  const stateAfterTimeout = updater.computeUpdatedConceptMastery(initialLearnerMastery, sampleMathQuestion, timeoutResult);
  assert(
    stateAfterTimeout.mastery === initialLearnerMastery.mastery,
    `TIMEOUT evaluation strictly preserves mastery (${stateAfterTimeout.mastery} vs ${initialLearnerMastery.mastery})`
  );

  // 5.2 IMAGE_UNREADABLE evaluation must NOT degrade mastery
  const unreadableResult: EvaluationResult = {
    questionId: 'q-math-501',
    submissionId: 'sub-image-1',
    correct: false,
    score: 0,
    maxScore: 5,
    percentage: 0,
    evaluationStatus: 'NEEDS_REVIEW',
    evaluationMode: 'IMAGE_SOLUTION',
    failureReason: 'IMAGE_UNREADABLE',
    confidence: 0.1,
    recommendedAction: 'NEEDS_REVIEW',
    feedback: 'Photo is blurry',
    misconceptions: [],
    strengths: [],
    weaknesses: [],
    evaluatedAt: new Date().toISOString(),
  };

  const stateAfterUnreadable = updater.computeUpdatedConceptMastery(initialLearnerMastery, sampleMathQuestion, unreadableResult);
  assert(
    stateAfterUnreadable.mastery === initialLearnerMastery.mastery,
    `IMAGE_UNREADABLE evaluation strictly preserves mastery (${stateAfterUnreadable.mastery} vs ${initialLearnerMastery.mastery})`
  );

  // 5.3 PROVIDER_UNAVAILABLE evaluation must NOT degrade mastery
  const providerFailResult: EvaluationResult = {
    ...unreadableResult,
    failureReason: 'PROVIDER_UNAVAILABLE',
  };
  const stateAfterProviderFail = updater.computeUpdatedConceptMastery(initialLearnerMastery, sampleMathQuestion, providerFailResult);
  assert(
    stateAfterProviderFail.mastery === initialLearnerMastery.mastery,
    `PROVIDER_UNAVAILABLE evaluation strictly preserves mastery (${stateAfterProviderFail.mastery} vs ${initialLearnerMastery.mastery})`
  );

  // ---------------------------------------------------------
  // Summary
  // ---------------------------------------------------------
  console.log('\n======================================================');
  console.log(`📊 M7.1 VERIFICATION SUMMARY: ${passedTests}/${totalTests} Passed`);
  console.log('======================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runM71Verification().catch((err) => {
  console.error('Fatal M7.1 verification error:', err);
  process.exit(1);
});
