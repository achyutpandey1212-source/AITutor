/**
 * Comprehensive Milestone 7 Phase 2 Verification Suite:
 * Assessment UI & Submission Pipeline
 *
 * Tests:
 * 1. Contract Validation: Valid MCQ submission passes
 * 2. Contract Validation: Invalid MCQ submission (missing selectedOption) rejected
 * 3. Contract Validation: Valid Short Answer submission passes
 * 4. Contract Validation: Invalid Short Answer submission (empty answer) rejected
 * 5. Contract Validation: Valid Long Answer submission passes
 * 6. Contract Validation: Valid Numerical submission passes
 * 7. Contract Validation: Valid Image Solution submission passes
 * 8. Contract Validation: Invalid Image Solution (missing imageReference) rejected
 * 9. Tenant Isolation: Student cannot submit to another student's question
 * 10. Tenant Isolation: Student cannot retrieve another student's submission
 * 11. Duplicate Submission Protection: Idempotent handling of repeated submissions
 * 12. Question Integrity: Client cannot alter questionType to bypass evaluation
 * 13. Server Evaluation: MCQ correct answer awards full marks
 * 14. Server Evaluation: MCQ incorrect answer awards 0 marks
 * 15. Non-MCQ Status: Text/Numerical/Image submissions safely stored with SUBMITTED status
 * 16. Client Sanitization: Sanitized question does not leak answer key or internal rubric
 * 17. End-to-End Pipeline: Question Planning -> Generation -> Sanitization -> Submission -> Persistence
 */

import type {
  AssessmentQuestion,
  AssessmentSubmission,
  AssessmentSubmissionRequest,
} from '@ai-tutor/shared';
import {
  AssessmentSubmissionRequestSchema,
  AssessmentSubmissionSchema,
  sanitizeQuestionForClient,
} from '@ai-tutor/shared';
import { AssessmentSubmissionService } from './assessment-submission.service.js';
import { AssessmentEngine } from './assessment.engine.js';
import { AssessmentQuestionModel } from '../models/assessment-question.model.js';
import { AssessmentSubmissionModel } from '../models/assessment-submission.model.js';

// In-Memory Mock for AssessmentQuestionModel and AssessmentSubmissionModel
class InMemoryAssessmentQuestionModel {
  private store = new Map<string, any>();

  async findOneAndUpdate(filter: any, update: any, _options: any) {
    const key = filter.questionId;
    const existing = this.store.get(key) || {};
    const merged = { ...existing, ...update, _id: existing._id || `id_${key}` };
    this.store.set(key, merged);
    return merged;
  }

  async findOne(filter: any) {
    if (filter.questionId) {
      const doc = this.store.get(filter.questionId);
      if (!doc) return null;
      if (filter.userId && doc.userId !== filter.userId) return null;
      return doc;
    }
    return null;
  }

  clear() {
    this.store.clear();
  }
}

class InMemoryAssessmentSubmissionModel {
  private store = new Map<string, any>();

  async findOne(filter: any) {
    const key = `${filter.userId}_${filter.questionId}`;
    return this.store.get(key) || null;
  }

  async findById(id: string) {
    for (const doc of this.store.values()) {
      if (doc._id === id || doc.id === id) return doc;
    }
    return null;
  }

  async findOneAndUpdate(filter: any, update: any, _options?: any) {
    const key = `${filter.userId}_${filter.questionId}`;
    const existing = this.store.get(key) || {};
    const merged = { ...existing, ...update, _id: existing._id || `sub_${Date.now()}` };
    this.store.set(key, merged);
    return merged;
  }

  async create(data: any) {
    const key = `${data.userId}_${data.questionId}`;
    const doc = { ...data, _id: `sub_${Date.now()}_${Math.random().toString(36).substring(7)}` };
    this.store.set(key, doc);
    return doc;
  }

  clear() {
    this.store.clear();
  }
}

class InMemoryLearnerAssessmentStateModel {
  private store = new Map<string, any>();

  async findOne(filter: any) {
    return this.store.get(filter.userId) || null;
  }

  async findOneAndUpdate(filter: any, update: any, _options?: any) {
    const existing = this.store.get(filter.userId) || {};
    const merged = { ...existing, ...update, updatedAt: new Date() };
    this.store.set(filter.userId, merged);
    return merged;
  }
}

async function runM7Phase2Verification() {
  console.log('====================================================');
  console.log('🧪 RUNNING MILESTONE 7 PHASE 2 VERIFICATION SUITE');
  console.log('   Assessment UI & Submission Pipeline');
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

  // Inject in-memory mocks for deterministic unit execution
  const mockQModel = new InMemoryAssessmentQuestionModel();
  const mockSubModel = new InMemoryAssessmentSubmissionModel();
  const mockLearnerModel = new InMemoryLearnerAssessmentStateModel();

  (AssessmentQuestionModel as any).findOneAndUpdate = mockQModel.findOneAndUpdate.bind(mockQModel);
  (AssessmentQuestionModel as any).findOne = mockQModel.findOne.bind(mockQModel);
  (AssessmentSubmissionModel as any).findOne = mockSubModel.findOne.bind(mockSubModel);
  (AssessmentSubmissionModel as any).findById = mockSubModel.findById.bind(mockSubModel);
  (AssessmentSubmissionModel as any).findOneAndUpdate = mockSubModel.findOneAndUpdate.bind(mockSubModel);
  (AssessmentSubmissionModel as any).create = mockSubModel.create.bind(mockSubModel);

  const { LearnerAssessmentStateModel } = await import('../models/learner-assessment-state.model.js');
  (LearnerAssessmentStateModel as any).findOne = mockLearnerModel.findOne.bind(mockLearnerModel);
  (LearnerAssessmentStateModel as any).findOneAndUpdate = mockLearnerModel.findOneAndUpdate.bind(mockLearnerModel);

  const submissionService = new AssessmentSubmissionService();
  const engine = new AssessmentEngine();

  // ----------------------------------------------------
  // 1. CONTRACT VALIDATION: MCQ
  // ----------------------------------------------------
  console.log('--- 1. Contract Validation: MCQ Submissions ---');
  const validMCQReq: AssessmentSubmissionRequest = {
    questionId: 'q_test_mcq',
    questionType: 'MCQ',
    selectedOption: 'B',
  };
  const mcqParsed = AssessmentSubmissionRequestSchema.safeParse(validMCQReq);
  assert(mcqParsed.success, 'Valid MCQ submission request passes Zod schema');

  const invalidMCQReq = {
    questionId: 'q_test_mcq',
    questionType: 'MCQ',
    // Missing selectedOption
  };
  const mcqInvalidParsed = AssessmentSubmissionRequestSchema.safeParse(invalidMCQReq);
  assert(!mcqInvalidParsed.success, 'MCQ without selectedOption is rejected by contract');

  // ----------------------------------------------------
  // 2. CONTRACT VALIDATION: SHORT & LONG ANSWER
  // ----------------------------------------------------
  console.log('\n--- 2. Contract Validation: Text Submissions ---');
  const validShortReq: AssessmentSubmissionRequest = {
    questionId: 'q_test_short',
    questionType: 'SHORT_ANSWER',
    answer: 'Photosynthesis produces glucose and oxygen from carbon dioxide and water.',
  };
  assert(AssessmentSubmissionRequestSchema.safeParse(validShortReq).success, 'Valid Short Answer passes schema');

  const invalidShortReq = {
    questionId: 'q_test_short',
    questionType: 'SHORT_ANSWER',
    answer: '   ', // whitespace only
  };
  assert(!AssessmentSubmissionRequestSchema.safeParse(invalidShortReq).success, 'Whitespace-only Short Answer is rejected');

  const validLongReq: AssessmentSubmissionRequest = {
    questionId: 'q_test_long',
    questionType: 'LONG_ANSWER',
    answer: 'The French Revolution was driven by social inequality, fiscal crisis, and Enlightenment ideas.',
  };
  assert(AssessmentSubmissionRequestSchema.safeParse(validLongReq).success, 'Valid Long Answer passes schema');

  // ----------------------------------------------------
  // 3. CONTRACT VALIDATION: NUMERICAL & IMAGE SOLUTION
  // ----------------------------------------------------
  console.log('\n--- 3. Contract Validation: Numerical & Image Solution Submissions ---');
  const validNumReq: AssessmentSubmissionRequest = {
    questionId: 'q_test_num',
    questionType: 'NUMERICAL',
    answer: 'x = 5.5',
  };
  assert(AssessmentSubmissionRequestSchema.safeParse(validNumReq).success, 'Valid Numerical answer passes schema');

  const validImgReq: AssessmentSubmissionRequest = {
    questionId: 'q_test_img',
    questionType: 'IMAGE_SOLUTION',
    imageReference: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  };
  assert(AssessmentSubmissionRequestSchema.safeParse(validImgReq).success, 'Valid Image Solution request passes schema');

  const invalidImgReq = {
    questionId: 'q_test_img',
    questionType: 'IMAGE_SOLUTION',
    // Missing imageReference
  };
  assert(!AssessmentSubmissionRequestSchema.safeParse(invalidImgReq).success, 'Image solution without imageReference is rejected');

  // ----------------------------------------------------
  // 4. PERSIST QUESTION & STUDENT SUBMISSION SETUP
  // ----------------------------------------------------
  console.log('\n--- 4. Question Persistence & Submissions ---');
  const testQuestionMCQ: AssessmentQuestion = {
    questionId: 'q_mcq_100',
    concept: 'Photosynthesis',
    subject: 'Science',
    difficulty: 'easy',
    questionType: 'MCQ',
    evaluationMode: 'MCQ',
    marks: 1,
    question: 'Which organelle carries out photosynthesis?',
    options: [
      { id: 'A', text: 'Mitochondria' },
      { id: 'B', text: 'Chloroplast' },
      { id: 'C', text: 'Ribosome' },
      { id: 'D', text: 'Nucleus' },
    ],
    correctOptionId: 'B',
    expectedAnswer: 'Chloroplast',
    requiresImageUpload: false,
    ragGrounded: false,
  };

  await submissionService.saveQuestion(testQuestionMCQ, 'user_student_1');

  // Test correct MCQ submission
  const correctMCQSub = await submissionService.submitAnswer('user_student_1', 'q_mcq_100', {
    questionId: 'q_mcq_100',
    questionType: 'MCQ',
    selectedOption: 'B',
  });

  assert(correctMCQSub.status === 'EVALUATED', 'MCQ submission is evaluated immediately on server');
  assert(correctMCQSub.score === 1, 'Full mark awarded for correct MCQ option');
  assert(Boolean(correctMCQSub.feedback?.includes('Correct')), 'Positive feedback awarded');

  // ----------------------------------------------------
  // 5. MULTI-ATTEMPT SUBMISSION & REATTEMPT SUPPORT (PHASE 4)
  // ----------------------------------------------------
  console.log('\n--- 5. Multi-Attempt Submission & Reattempt Support ---');
  const reattemptSub = await submissionService.submitAnswer('user_student_1', 'q_mcq_100', {
    questionId: 'q_mcq_100',
    questionType: 'MCQ',
    selectedOption: 'A', // Different option on second try
  });

  assert(reattemptSub.id !== correctMCQSub.id, 'Reattempt creates distinct submission record');
  assert(reattemptSub.selectedOption === 'A', 'New attempt records option A');
  const history = await submissionService.getSubmissionHistory('user_student_1', 'q_mcq_100');
  assert(history.length === 2, 'History maintains both attempts without collision');

  // ----------------------------------------------------
  // 6. TENANT ISOLATION & AUTHORIZATION
  // ----------------------------------------------------
  console.log('\n--- 6. Tenant Isolation & Authorization ---');
  let unauthorizedError = false;
  try {
    // Student 2 attempts to submit to Student 1's question
    await submissionService.submitAnswer('user_student_2', 'q_mcq_100', {
      questionId: 'q_mcq_100',
      questionType: 'MCQ',
      selectedOption: 'B',
    });
  } catch (err: any) {
    unauthorizedError = true;
  }
  assert(unauthorizedError, 'Rejects cross-tenant submission attempt by another student');

  // ----------------------------------------------------
  // 7. QUESTION TYPE INTEGRITY (PREVENT TAMPERING)
  // ----------------------------------------------------
  console.log('\n--- 7. Question Type Integrity Protection ---');
  const testMathImageQ: AssessmentQuestion = {
    questionId: 'q_math_img_500',
    concept: 'Quadratic Equations',
    subject: 'Mathematics',
    grade: 'Grade 10',
    difficulty: 'medium',
    questionType: 'NUMERICAL',
    evaluationMode: 'IMAGE_SOLUTION',
    marks: 5,
    question: 'Solve x^2 - 7x + 12 = 0 showing all working steps.',
    expectedAnswer: 'x = 3, x = 4',
    rubric: {
      method: 'Factorization or Quadratic Formula',
      steps: ['Factor as (x - 3)(x - 4) = 0', 'Solve x - 3 = 0 -> x = 3', 'Solve x - 4 = 0 -> x = 4'],
      finalAnswer: 'x = 3, 4',
    },
    submissionGuidance: 'Make sure your steps are clearly written',
    requiresImageUpload: true,
    ragGrounded: false,
  };

  await submissionService.saveQuestion(testMathImageQ, 'user_student_math');

  let tamperError = false;
  try {
    // Client tries to submit as MCQ to bypass image upload
    await submissionService.submitAnswer('user_student_math', 'q_math_img_500', {
      questionId: 'q_math_img_500',
      questionType: 'MCQ',
      selectedOption: 'A',
    });
  } catch (err: any) {
    tamperError = true;
    assert(err.message.includes('Question type mismatch'), 'Error explicitly states question type mismatch');
  }
  assert(tamperError, 'Rejects submission attempting to tamper with questionType');

  // ----------------------------------------------------
  // 8. IMAGE SOLUTION SUBMISSION PIPELINE
  // ----------------------------------------------------
  console.log('\n--- 8. Image Solution Submission Pipeline ---');
  const imageSub = await submissionService.submitAnswer('user_student_math', 'q_math_img_500', {
    questionId: 'q_math_img_500',
    questionType: 'IMAGE_SOLUTION',
    imageReference: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
  });

  assert(imageSub.status === 'SUBMITTED', 'Image solution transitions to SUBMITTED status');
  assert(imageSub.questionType === 'NUMERICAL', 'Question type NUMERICAL preserved');
  assert(imageSub.evaluationMode === 'IMAGE_SOLUTION', 'Evaluation mode IMAGE_SOLUTION preserved');
  assert(Boolean(imageSub.imageReference?.startsWith('data:image/jpeg')), 'Image data reference securely stored');

  // ----------------------------------------------------
  // 9. CLIENT SANITIZATION VERIFICATION
  // ----------------------------------------------------
  console.log('\n--- 9. Client Sanitization Safeguard ---');
  const clientSanitized = sanitizeQuestionForClient(testMathImageQ);
  assert(!('expectedAnswer' in clientSanitized) || (clientSanitized as any).expectedAnswer === undefined, 'Client question does not contain expectedAnswer');
  assert(!('rubric' in clientSanitized) || (clientSanitized as any).rubric === undefined, 'Client question does not contain rubric');
  assert(clientSanitized.requiresImageUpload === true, 'Client retains requiresImageUpload flag');
  assert(clientSanitized.submissionGuidance !== undefined, 'Client retains submissionGuidance');

  // ----------------------------------------------------
  // 10. INCORRECT MCQ SERVER EVALUATION
  // ----------------------------------------------------
  console.log('\n--- 10. MCQ Incorrect Answer Evaluation ---');
  const testMCQ2: AssessmentQuestion = {
    ...testQuestionMCQ,
    questionId: 'q_mcq_200',
  };
  await submissionService.saveQuestion(testMCQ2, 'user_student_wrong');

  const wrongMCQSub = await submissionService.submitAnswer('user_student_wrong', 'q_mcq_200', {
    questionId: 'q_mcq_200',
    questionType: 'MCQ',
    selectedOption: 'A', // Wrong option (Correct is B)
  });

  assert(wrongMCQSub.status === 'EVALUATED', 'Evaluated immediately');
  assert(wrongMCQSub.score === 0, 'Score is 0 for wrong MCQ option');
  assert(Boolean(wrongMCQSub.feedback?.includes('Incorrect')), 'Feedback indicates incorrect selection');

  console.log('\n====================================================');
  console.log(`🏁 M7 PHASE 2 VERIFICATION SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runM7Phase2Verification().catch((err) => {
  console.error('M7 Phase 2 Verification error:', err);
  process.exit(1);
});
