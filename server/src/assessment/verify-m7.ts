/**
 * Comprehensive Milestone 7 Phase 1 Verification Suite:
 * Assessment Intelligence & Question Contracts
 *
 * Tests:
 * 1. Deterministic Strategy: Easy Concept Check (1 question, MCQ/Short, 1-2 marks)
 * 2. Deterministic Strategy: Medium Concept Understanding (Short Answer, Text, 3 marks)
 * 3. Deterministic Strategy: Strong Student Progression (Hard, Long/Reasoning, 5 marks)
 * 4. Deterministic Strategy: Weak Student / Misconception (Targeted Easy Remedial Question)
 * 5. Deterministic Subject Strategy: Maths Low-Mark Numerical (1-2 marks -> NUMERICAL / NUMERICAL)
 * 6. Deterministic Subject Strategy: Maths Substantial Numerical (5-10 marks -> NUMERICAL / IMAGE_SOLUTION)
 * 7. Deterministic Subject Strategy: English Written Assessment (SHORT/LONG_ANSWER -> TEXT)
 * 8. Deterministic Subject Strategy: SST / History Theory Assessment (SHORT/LONG_ANSWER -> TEXT)
 * 9. Adaptive Question Count: 1 for concept_check, 2-3 for medium practice, 3 for hard practice
 * 10. Question Contract: Valid MCQ Schema & 4-Option Structure
 * 11. Question Contract: Valid Short Answer & Long Answer Schemas
 * 12. Question Contract: Valid Numerical & Image Solution Schemas with Rubrics
 * 13. Image Solution UX Contract: requiresImageUpload & Cleanliness Guidance
 * 14. Business Validation: Rejects 10-Mark MCQ
 * 15. Business Validation: Rejects MCQ without valid correctOptionId
 * 16. Business Validation: Rejects MCQ with != 4 options
 * 17. Business Validation: Rejects IMAGE_SOLUTION with 1-2 marks
 * 18. Business Validation: Rejects IMAGE_SOLUTION without evaluation rubric
 * 19. Business Validation: Rejects NUMERICAL without expectedAnswer
 * 20. Client Sanitization: Answer Key & Internal Rubric Stripping (No leak)
 * 21. RAG Grounding: KnowledgeContext chunks integrated into question prompt & contract metadata
 * 22. RAG Fallback: Normal generation when no RAG documents exist
 * 23. Mocked Generator: Full End-to-End Pipeline Execution with Mock AI Service
 */

import type {
  AIStructuredResponse,
  AssessmentQuestion,
  KnowledgeContext,
  TeachingState,
} from '@ai-tutor/shared';
import {
  AssessmentQuestionSchema,
  ClientAssessmentQuestionSchema,
  DEFAULT_IMAGE_SUBMISSION_GUIDANCE,
  sanitizeQuestionForClient,
} from '@ai-tutor/shared';
import { AssessmentEngine } from './assessment.engine.js';
import { AssessmentValidator } from './assessment.validation.js';
import { AssessmentPrompts } from './assessment.prompts.js';
import { QuestionGenerator } from './question.generator.js';
import type { IAIProvider } from '../ai/ai-provider.interface.js';
import { AIService } from '../ai/ai.service.js';

class MockAIService extends AIService {
  private mockResponse: any;

  constructor(mockResponse: any) {
    super();
    this.mockResponse = mockResponse;
  }

  setMockResponse(response: any) {
    this.mockResponse = response;
  }

  override async generateStructured<T>(
    _prompt: any,
    _schemaDesc: string,
    _options?: any
  ): Promise<AIStructuredResponse<T>> {
    return {
      data: this.mockResponse as T,
      provider: 'gemini',
      model: 'mock-model',
      fallbackUsed: false,
    };
  }
}

async function runM7Verification() {
  console.log('====================================================');
  console.log('🧪 RUNNING MILESTONE 7 PHASE 1 VERIFICATION SUITE');
  console.log('   Assessment Intelligence & Question Contracts');
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

  const engine = new AssessmentEngine();

  // ----------------------------------------------------
  // 1. DETERMINISTIC STRATEGY: EASY CONCEPT CHECK
  // ----------------------------------------------------
  console.log('--- 1. Deterministic Strategy: Easy Concept Check ---');
  const planEasy = engine.planAssessment({
    concept: 'Photosynthesis',
    subject: 'Science',
    grade: 'Grade 7',
    goal: 'concept_check',
    teachingState: {
      understanding: 'developing',
      confidence: 0.4,
      misconceptions: [],
    },
  });

  assert(planEasy.totalQuestions === 1, 'Easy concept check plans exactly 1 question');
  assert(planEasy.strategies[0].difficulty === 'easy', 'Difficulty is set to easy for low confidence');
  assert(
    planEasy.strategies[0].questionType === 'SHORT_ANSWER' || planEasy.strategies[0].questionType === 'MCQ',
    'Selects quick conceptual check type (MCQ or SHORT_ANSWER)'
  );
  assert(planEasy.strategies[0].marks <= 2, 'Marks allocated are 1-2 for quick check');

  // ----------------------------------------------------
  // 2. DETERMINISTIC STRATEGY: MEDIUM CONCEPT UNDERSTANDING
  // ----------------------------------------------------
  console.log('\n--- 2. Deterministic Strategy: Medium Understanding ---');
  const planMedium = engine.planAssessment({
    concept: 'Chemical Bonding',
    subject: 'Chemistry',
    grade: 'Grade 9',
    goal: 'practice',
    teachingState: {
      understanding: 'developing',
      confidence: 0.7,
      misconceptions: [],
    },
  });

  assert(planMedium.strategies[0].difficulty === 'medium', 'Selects medium difficulty for confidence >= 0.65');
  assert(planMedium.strategies[0].questionType === 'SHORT_ANSWER', 'Selects SHORT_ANSWER for medium reasoning');
  assert(planMedium.strategies[0].evaluationMode === 'TEXT', 'Evaluation mode is TEXT for chemical explanation');
  assert(planMedium.strategies[0].marks === 3, 'Allocates 3 marks for structured medium explanation');

  // ----------------------------------------------------
  // 3. DETERMINISTIC STRATEGY: STRONG STUDENT PROGRESSION
  // ----------------------------------------------------
  console.log('\n--- 3. Deterministic Strategy: Strong Student Progression ---');
  const planStrong = engine.planAssessment({
    concept: 'Electromagnetism',
    subject: 'Physics',
    grade: 'Grade 10',
    goal: 'practice',
    teachingState: {
      understanding: 'strong',
      confidence: 0.9,
      misconceptions: [],
      conceptsMastered: ['Magnetic Fields', 'Oersted Experiment'],
    },
  });

  assert(planStrong.strategies[0].difficulty === 'hard', 'Strong mastery progresses student to hard difficulty');
  assert(planStrong.strategies[0].questionType === 'LONG_ANSWER', 'Hard concept uses LONG_ANSWER for deep analysis');
  assert(planStrong.strategies[0].marks === 5, 'Allocates 5 marks for comprehensive analysis');

  // ----------------------------------------------------
  // 4. DETERMINISTIC STRATEGY: WEAK STUDENT WITH MISCONCEPTION
  // ----------------------------------------------------
  console.log('\n--- 4. Deterministic Strategy: Weak / Misconception Handling ---');
  const planMisconception = engine.planAssessment({
    concept: 'Newton Third Law',
    subject: 'Physics',
    grade: 'Grade 9',
    goal: 'practice',
    teachingState: {
      understanding: 'weak',
      confidence: 0.3,
      misconceptions: ['Thinks action and reaction cancel each other out on the same object'],
    },
  });

  assert(planMisconception.strategies[0].difficulty === 'easy', 'Does NOT give harder question when misconceptions exist');
  assert(
    planMisconception.strategies[0].targetMisconceptions?.length === 1,
    'Target misconceptions are preserved in strategy decision'
  );

  // ----------------------------------------------------
  // 5. DETERMINISTIC SUBJECT: MATHS LOW-MARK NUMERICAL
  // ----------------------------------------------------
  console.log('\n--- 5. Deterministic Subject Strategy: Maths Low-Mark Numerical ---');
  const planMathLow = engine.planAssessment({
    concept: 'Linear Equations in One Variable',
    subject: 'Mathematics',
    grade: 'Class 8',
    targetMarks: 2,
    goal: 'concept_check',
  });

  assert(planMathLow.strategies[0].questionType === 'NUMERICAL', 'Math low-mark is NUMERICAL questionType');
  assert(planMathLow.strategies[0].evaluationMode === 'NUMERICAL', 'Math low-mark uses direct NUMERICAL evaluationMode');
  assert(planMathLow.strategies[0].marks === 2, 'Marks match 2');

  // ----------------------------------------------------
  // 6. DETERMINISTIC SUBJECT: MATHS 5-10 MARK NUMERICAL (IMAGE SOLUTION)
  // ----------------------------------------------------
  console.log('\n--- 6. Deterministic Subject Strategy: Maths 5-10 Mark Numerical ---');
  const planMathHigh = engine.planAssessment({
    concept: 'Quadratic Equations',
    subject: 'Mathematics',
    grade: 'Class 10',
    targetMarks: 5,
    goal: 'practice',
  });

  assert(planMathHigh.strategies[0].questionType === 'NUMERICAL', 'Question type is NUMERICAL (not reduced to MCQ)');
  assert(planMathHigh.strategies[0].evaluationMode === 'IMAGE_SOLUTION', '5-mark math problem requires IMAGE_SOLUTION mode');
  assert(planMathHigh.strategies[0].marks === 5, 'Marks match 5');
  assert(
    Boolean(planMathHigh.strategies[0].submissionGuidance?.includes('Make sure the full page is visible')),
    'Strategy attaches image cleanliness guidance'
  );

  // ----------------------------------------------------
  // 7. DETERMINISTIC SUBJECT: ENGLISH WRITTEN ASSESSMENT
  // ----------------------------------------------------
  console.log('\n--- 7. Deterministic Subject Strategy: English Written Assessment ---');
  const planEnglish = engine.planAssessment({
    concept: 'Character Analysis in Macbeth',
    subject: 'English Literature',
    grade: 'Grade 10',
    goal: 'practice',
    preferredDifficulty: 'hard',
  });

  assert(planEnglish.strategies[0].questionType === 'LONG_ANSWER', 'English literature hard is LONG_ANSWER');
  assert(planEnglish.strategies[0].evaluationMode === 'TEXT', 'English evaluation mode is TEXT');
  assert(planEnglish.strategies[0].marks === 5, '5 marks assigned for written literary analysis');

  // ----------------------------------------------------
  // 8. DETERMINISTIC SUBJECT: SST / HISTORY THEORY ASSESSMENT
  // ----------------------------------------------------
  console.log('\n--- 8. Deterministic Subject Strategy: SST / History Assessment ---');
  const planSST = engine.planAssessment({
    concept: 'French Revolution Causes',
    subject: 'Social Studies - History',
    grade: 'Grade 9',
    goal: 'practice',
    preferredDifficulty: 'medium',
  });

  assert(planSST.strategies[0].questionType === 'SHORT_ANSWER', 'SST medium is SHORT_ANSWER');
  assert(planSST.strategies[0].evaluationMode === 'TEXT', 'SST evaluation mode is TEXT');
  assert(planSST.strategies[0].marks === 3, '3 marks assigned for cause-and-effect theory explanation');

  // ----------------------------------------------------
  // 9. ADAPTIVE QUESTION COUNT
  // ----------------------------------------------------
  console.log('\n--- 9. Adaptive Question Count ---');
  const planCountCheck = engine.planAssessment({ concept: 'Gravity', subject: 'Physics', goal: 'concept_check' });
  const planCountPracticeMed = engine.planAssessment({ concept: 'Gravity', subject: 'Physics', goal: 'practice', preferredDifficulty: 'medium' });
  const planCountPracticeHard = engine.planAssessment({ concept: 'Gravity', subject: 'Physics', goal: 'practice', preferredDifficulty: 'hard' });

  assert(planCountCheck.totalQuestions === 1, 'concept_check generates 1 question');
  assert(planCountPracticeMed.totalQuestions === 3, 'medium practice generates 3 questions');
  assert(planCountPracticeHard.totalQuestions === 3, 'hard practice generates 3 questions');

  // ----------------------------------------------------
  // 10. QUESTION CONTRACT: VALID MCQ SCHEMA & 4 OPTIONS
  // ----------------------------------------------------
  console.log('\n--- 10. Valid MCQ Contract ---');
  const validMCQ: AssessmentQuestion = {
    questionId: 'q_mcq_1',
    concept: 'Photosynthesis',
    subject: 'Science',
    difficulty: 'easy',
    questionType: 'MCQ',
    evaluationMode: 'MCQ',
    marks: 1,
    question: 'Which gas is released by plants during photosynthesis?',
    options: [
      { id: 'A', text: 'Carbon Dioxide' },
      { id: 'B', text: 'Oxygen' },
      { id: 'C', text: 'Nitrogen' },
      { id: 'D', text: 'Hydrogen' },
    ],
    correctOptionId: 'B',
    expectedAnswer: 'Oxygen',
    requiresImageUpload: false,
    ragGrounded: false,
  };

  const mcqParsed = AssessmentQuestionSchema.safeParse(validMCQ);
  const mcqVal = AssessmentValidator.validateQuestion(validMCQ);
  assert(mcqParsed.success, 'Valid MCQ passes Zod validation');
  assert(mcqVal.isValid, 'Valid MCQ passes business validation');

  // ----------------------------------------------------
  // 11. QUESTION CONTRACT: VALID SHORT & LONG ANSWER
  // ----------------------------------------------------
  console.log('\n--- 11. Valid Short & Long Answer Contracts ---');
  const validShort: AssessmentQuestion = {
    questionId: 'q_short_1',
    concept: 'Cell Membrane',
    subject: 'Biology',
    difficulty: 'medium',
    questionType: 'SHORT_ANSWER',
    evaluationMode: 'TEXT',
    marks: 3,
    question: 'Explain why the cell membrane is described as selectively permeable.',
    expectedAnswer: 'It allows certain molecules or ions to pass through by diffusion or active transport while blocking others.',
    rubric: {
      criteria: ['Defines selectively permeable correctly', 'Mentions regulation of substances entering/exiting cell'],
    },
    requiresImageUpload: false,
    ragGrounded: false,
  };

  const shortVal = AssessmentValidator.validateQuestion(validShort);
  assert(shortVal.isValid, 'Valid Short Answer passes validation');

  const validLong: AssessmentQuestion = {
    questionId: 'q_long_1',
    concept: 'Democracy vs Monarchy',
    subject: 'Civics',
    difficulty: 'hard',
    questionType: 'LONG_ANSWER',
    evaluationMode: 'TEXT',
    marks: 5,
    question: 'Compare and contrast democratic and monarchical forms of government across decision making and rights.',
    expectedAnswer: 'Democratic governments derive power from the people with protected fundamental rights, whereas monarchies concentrate power in a ruler.',
    rubric: {
      criteria: [
        'Explains source of authority in both systems (2 marks)',
        'Compares citizen rights and rule of law (2 marks)',
        'Coherent synthesis and conclusion (1 mark)',
      ],
    },
    requiresImageUpload: false,
    ragGrounded: false,
  };

  const longVal = AssessmentValidator.validateQuestion(validLong);
  assert(longVal.isValid, 'Valid Long Answer passes validation');

  // ----------------------------------------------------
  // 12. QUESTION CONTRACT: VALID NUMERICAL & IMAGE SOLUTION
  // ----------------------------------------------------
  console.log('\n--- 12. Valid Numerical & Image Solution Contracts ---');
  const validMathImg: AssessmentQuestion = {
    questionId: 'q_math_img_1',
    concept: 'Linear Equations',
    subject: 'Mathematics',
    grade: 'Grade 8',
    difficulty: 'medium',
    questionType: 'NUMERICAL',
    evaluationMode: 'IMAGE_SOLUTION',
    marks: 5,
    question: 'Solve for x: 3(2x - 5) + 4 = 2(x + 3) + 7. Show all algebraic steps clearly on paper.',
    expectedAnswer: 'x = 6',
    rubric: {
      method: 'Distribute coefficients across parentheses, isolate variable terms on one side and constants on other.',
      steps: [
        'Step 1: Expand brackets -> 6x - 15 + 4 = 2x + 6 + 7 (1 mark)',
        'Step 2: Simplify each side -> 6x - 11 = 2x + 13 (1 mark)',
        'Step 3: Transpose 2x -> 4x - 11 = 13 (1 mark)',
        'Step 4: Transpose -11 -> 4x = 24 (1 mark)',
        'Step 5: Divide by 4 -> x = 6 (1 mark)',
      ],
      calculation: 'Algebraic expansion and arithmetic transposition',
      finalAnswer: 'x = 6',
    },
    submissionGuidance: DEFAULT_IMAGE_SUBMISSION_GUIDANCE,
    requiresImageUpload: true,
    ragGrounded: false,
  };

  const mathImgVal = AssessmentValidator.validateQuestion(validMathImg);
  assert(mathImgVal.isValid, 'Valid 5-mark Numerical Image Solution passes validation');

  // ----------------------------------------------------
  // 13. IMAGE SOLUTION UX CONTRACT: CLEANLINESS GUIDANCE
  // ----------------------------------------------------
  console.log('\n--- 13. Image Solution Cleanliness Guidance ---');
  assert(validMathImg.requiresImageUpload === true, 'Image solution explicitly sets requiresImageUpload to true');
  assert(
    Boolean(validMathImg.submissionGuidance?.includes('steps are written clearly and in order')),
    'Submission guidance prompts clean student handwriting and sequential steps'
  );

  // ----------------------------------------------------
  // 14. BUSINESS VALIDATION: REJECTS 10-MARK MCQ
  // ----------------------------------------------------
  console.log('\n--- 14. Business Validation: Reject Inappropriate 10-mark MCQ ---');
  const bad10MarkMCQ: AssessmentQuestion = {
    ...validMCQ,
    marks: 10,
  };
  const val10MCQ = AssessmentValidator.validateQuestion(bad10MarkMCQ);
  assert(!val10MCQ.isValid, 'Rejects 10-mark MCQ');
  assert(val10MCQ.errors.some((e) => e.includes('should not exceed 3 marks')), 'Error mentions MCQ mark limit');

  // ----------------------------------------------------
  // 15. BUSINESS VALIDATION: REJECTS MCQ WITHOUT CORRECT OPTION ID
  // ----------------------------------------------------
  console.log('\n--- 15. Business Validation: Reject MCQ without valid correctOptionId ---');
  const badMCQOption: AssessmentQuestion = {
    ...validMCQ,
    correctOptionId: 'Z', // Invalid ID
  };
  const valBadOption = AssessmentValidator.validateQuestion(badMCQOption);
  assert(!valBadOption.isValid, 'Rejects MCQ with non-existent correctOptionId');
  assert(valBadOption.errors.some((e) => e.includes('does not match any available option IDs')), 'Detailed error message');

  // ----------------------------------------------------
  // 16. BUSINESS VALIDATION: REJECTS MCQ WITH != 4 OPTIONS
  // ----------------------------------------------------
  console.log('\n--- 16. Business Validation: Reject MCQ with != 4 Options ---');
  const badMCQCount: AssessmentQuestion = {
    ...validMCQ,
    options: [
      { id: 'A', text: 'Option A' },
      { id: 'B', text: 'Option B' },
      { id: 'C', text: 'Option C' },
    ],
  };
  const valMCQCount = AssessmentValidator.validateQuestion(badMCQCount);
  assert(!valMCQCount.isValid, 'Rejects MCQ with 3 options');
  assert(valMCQCount.errors.some((e) => e.includes('must have exactly 4 options')), 'Error mentions 4 options requirement');

  // ----------------------------------------------------
  // 17. BUSINESS VALIDATION: REJECTS IMAGE_SOLUTION WITH 1 MARK
  // ----------------------------------------------------
  console.log('\n--- 17. Business Validation: Reject 1-Mark IMAGE_SOLUTION ---');
  const badImageMark: AssessmentQuestion = {
    ...validMathImg,
    marks: 1,
  };
  const valImgMark = AssessmentValidator.validateQuestion(badImageMark);
  assert(!valImgMark.isValid, 'Rejects 1-mark IMAGE_SOLUTION');
  assert(valImgMark.errors.some((e) => e.includes('at least 3 marks')), 'Error highlights multi-step minimum requirement');

  // ----------------------------------------------------
  // 18. BUSINESS VALIDATION: REJECTS IMAGE_SOLUTION WITHOUT RUBRIC
  // ----------------------------------------------------
  console.log('\n--- 18. Business Validation: Reject IMAGE_SOLUTION without Rubric ---');
  const badImageRubric: AssessmentQuestion = {
    ...validMathImg,
    rubric: undefined,
  };
  const valImgRubric = AssessmentValidator.validateQuestion(badImageRubric);
  assert(!valImgRubric.isValid, 'Rejects IMAGE_SOLUTION lacking structured rubric');

  // ----------------------------------------------------
  // 19. BUSINESS VALIDATION: REJECTS NUMERICAL WITHOUT EXPECTED ANSWER
  // ----------------------------------------------------
  console.log('\n--- 19. Business Validation: Reject NUMERICAL without expectedAnswer ---');
  const badNumAnswer: AssessmentQuestion = {
    ...validMathImg,
    expectedAnswer: undefined,
  };
  const valNumAnswer = AssessmentValidator.validateQuestion(badNumAnswer);
  assert(!valNumAnswer.isValid, 'Rejects NUMERICAL question without expectedAnswer');

  // ----------------------------------------------------
  // 20. CLIENT SANITIZATION: NO LEAKED ANSWER KEYS
  // ----------------------------------------------------
  console.log('\n--- 20. Client Sanitization: Answer Key & Internal Rubric Stripping ---');
  const clientSanitizedMCQ = sanitizeQuestionForClient(validMCQ);
  assert(!('correctOptionId' in clientSanitizedMCQ) || (clientSanitizedMCQ as any).correctOptionId === undefined, 'correctOptionId is stripped from client MCQ');
  assert(!('expectedAnswer' in clientSanitizedMCQ) || (clientSanitizedMCQ as any).expectedAnswer === undefined, 'expectedAnswer is stripped from client MCQ');
  assert(clientSanitizedMCQ.options?.length === 4, 'Client retains the 4 option choices for rendering');

  const clientSanitizedMath = sanitizeQuestionForClient(validMathImg);
  assert(!('rubric' in clientSanitizedMath) || (clientSanitizedMath as any).rubric === undefined, 'Internal rubric is stripped from client Math problem');
  assert(clientSanitizedMath.requiresImageUpload === true, 'Client retains requiresImageUpload flag');
  assert(clientSanitizedMath.submissionGuidance !== undefined, 'Client retains submission guidance');

  const clientZodParse = ClientAssessmentQuestionSchema.safeParse(clientSanitizedMath);
  assert(clientZodParse.success, 'Sanitized question strictly satisfies ClientAssessmentQuestionSchema');

  // ----------------------------------------------------
  // 21. RAG GROUNDING INTEGRATION
  // ----------------------------------------------------
  console.log('\n--- 21. RAG Grounding in Assessment Prompt & Contract ---');
  const mockKnowledgeContext: KnowledgeContext = {
    sourceType: 'uploaded_document',
    hasUploadedDocuments: true,
    relevantContextFound: true,
    retrievedChunks: [
      {
        text: 'Mendel crossed pure breeding tall pea plants (TT) with dwarf pea plants (tt). In F1 generation, all plants were tall (Tt). In F2 generation, phenotypic ratio was 3:1 (Tall:Dwarf) and genotypic ratio was 1:2:1 (TT:Tt:tt).',
        filename: 'genetics_chapter_3.pdf',
        chunkId: 'chk_1',
        chunkIndex: 0,
        relevance: 0.94,
      },
    ],
  };

  const ragPrompt = AssessmentPrompts.buildQuestionPrompt(
    planEasy.strategies[0],
    undefined,
    mockKnowledgeContext
  );

  assert(ragPrompt.includes('RETRIEVED STUDENT STUDY MATERIAL (Grounded Source Context)'), 'Prompt injects RAG context');
  assert(ragPrompt.includes('genetics_chapter_3.pdf'), 'Prompt mentions grounded document source');
  assert(ragPrompt.includes('Ground the question strictly in the provided study material'), 'Prompt enforces document adherence');

  // ----------------------------------------------------
  // 22. RAG FALLBACK WHEN NO DOCUMENTS EXIST
  // ----------------------------------------------------
  console.log('\n--- 22. Clean Prompt without RAG Documents ---');
  const noRagPrompt = AssessmentPrompts.buildQuestionPrompt(planEasy.strategies[0], undefined, undefined);
  assert(!noRagPrompt.includes('RETRIEVED STUDENT STUDY MATERIAL'), 'Clean prompt without RAG artifacts when no docs uploaded');

  // ----------------------------------------------------
  // 23. MOCKED GENERATOR END-TO-END PIPELINE
  // ----------------------------------------------------
  console.log('\n--- 23. Mocked Generator End-to-End Pipeline ---');
  const mockAI = new MockAIService({
    question: 'In Mendel’s monohybrid cross between TT and tt pea plants, what is the genotypic ratio in the F2 generation?',
    options: [
      { id: 'A', text: '3:1' },
      { id: 'B', text: '1:2:1' },
      { id: 'C', text: '9:3:3:1' },
      { id: 'D', text: '1:1' },
    ],
    correctOptionId: 'B',
    expectedAnswer: '1:2:1',
    rubric: {
      method: 'Recall standard Mendelian monohybrid genotypic ratio (1 TT : 2 Tt : 1 tt)',
      finalAnswer: '1:2:1',
    },
  });

  const mockGen = new QuestionGenerator(mockAI);
  const generatedQuestion = await mockGen.generateQuestion({
    strategy: {
      concept: 'Mendelian Genetics',
      subject: 'Biology',
      grade: 'Grade 10',
      difficulty: 'easy',
      questionType: 'MCQ',
      evaluationMode: 'MCQ',
      marks: 1,
      questionCount: 1,
      assessmentGoal: 'concept_check',
    },
    knowledgeContext: mockKnowledgeContext,
  });

  assert(generatedQuestion.questionId.startsWith('q_'), 'Generates unique questionId with q_ prefix');
  assert(generatedQuestion.ragGrounded === true, 'Marks question as ragGrounded');
  assert(
    Boolean(generatedQuestion.groundingSources?.includes('genetics_chapter_3.pdf')),
    'Records grounding sources'
  );
  assert(generatedQuestion.options?.length === 4, 'Includes normalized 4 options');
  assert(generatedQuestion.correctOptionId === 'B', 'Preserves correctOptionId on server');

  const sanitizedGen = sanitizeQuestionForClient(generatedQuestion);
  assert(!('correctOptionId' in sanitizedGen) || (sanitizedGen as any).correctOptionId === undefined, 'Sanitizes generated question for frontend');

  console.log('\n====================================================');
  console.log(`🏁 M7 PHASE 1 VERIFICATION SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runM7Verification().catch((err) => {
  console.error('M7 Verification script error:', err);
  process.exit(1);
});
