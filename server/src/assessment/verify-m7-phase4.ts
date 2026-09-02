import {
  AssessmentQuestion,
  AssessmentSubmission,
  EvaluationResult,
  LearnerAssessmentState,
} from '@ai-tutor/shared';
import { assessmentSessionService } from './assessment-session.service.js';
import { assessmentBookmarkService } from './assessment-bookmark.service.js';
import { wrongQuestionService, DEFAULT_WRONG_REVIEW_POLICY } from './wrong-question.service.js';
import { assessmentAnalyticsService } from './assessment-analytics.service.js';
import { assessmentEngine } from './assessment.engine.js';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
  }
}

async function runPhase4Verification() {
  console.log('\n======================================================');
  console.log('🧪 MILESTONE 7 PHASE 4 — VERIFICATION SUITE');
  console.log('   Sessions, History, Bookmarks, Wrong Questions & Analytics');
  console.log('======================================================\n');

  const userId = 'user_phase4_test';
  const otherUserId = 'user_other_tenant';

  // ----------------------------------------------------
  // SUITE 1: ASSESSMENT SESSION LIFECYCLE
  // ----------------------------------------------------
  console.log('--- 1. Assessment Session Lifecycle ---');

  const session = await assessmentSessionService.createSession(userId, {
    subject: 'Mathematics',
    topic: 'Linear Equations',
    concepts: ['Linear Equations in One Variable'],
    goal: 'practice',
    startingDifficulty: 'medium',
  });

  assert(Boolean(session.id && session.id.startsWith('ses_')), 'Session is created with unique ID');
  assert(session.userId === userId, 'Session has correct userId');
  assert(session.status === 'IN_PROGRESS', 'Session initializes with IN_PROGRESS status');
  assert(session.attemptedQuestionCount === 0, 'Session begins with 0 attempted questions');

  // Add question to session
  await assessmentSessionService.addQuestionToSession(userId, session.id, 'q_test_101');
  const sessionWithQ = await assessmentSessionService.getSession(userId, session.id);
  assert(Boolean(sessionWithQ?.questionIds.includes('q_test_101')), 'Question ID is linked to session');
  assert(sessionWithQ?.currentQuestionId === 'q_test_101', 'currentQuestionId is set on session');

  // Update progress
  await assessmentSessionService.updateSessionProgress(userId, session.id, 4, 5, true);
  const sessionProgress = await assessmentSessionService.getSession(userId, session.id);
  assert(sessionProgress?.attemptedQuestionCount === 1, 'attemptedQuestionCount increments to 1');
  assert(sessionProgress?.correctCount === 1, 'correctCount increments to 1');
  assert(sessionProgress?.earnedMarks === 4, 'earnedMarks increments to 4');
  assert(sessionProgress?.totalMarks === 5, 'totalMarks increments to 5');
  assert(sessionProgress?.accuracy === 100, 'accuracy correctly calculated as 100%');

  // Pause and Resume
  const paused = await assessmentSessionService.pauseSession(userId, session.id);
  assert(paused?.status === 'PAUSED', 'Session transitions to PAUSED');

  const resumed = await assessmentSessionService.resumeSession(userId, session.id);
  assert(resumed?.status === 'IN_PROGRESS', 'Session resumes to IN_PROGRESS');

  // Complete Session
  const completed = await assessmentSessionService.completeSession(userId, session.id);
  assert(completed?.status === 'COMPLETED', 'Session completes with COMPLETED status');
  assert(Boolean(completed?.completedAt), 'completedAt timestamp is populated');

  // Tenant Isolation
  const crossTenantSession = await assessmentSessionService.getSession(otherUserId, session.id);
  assert(crossTenantSession === null, 'Tenant isolation: other user cannot access session');

  // ----------------------------------------------------
  // SUITE 2: QUESTION BOOKMARKS
  // ----------------------------------------------------
  console.log('\n--- 2. Question Bookmarks ---');

  const qId1 = 'q_bmk_math_01';
  const qId2 = 'q_bmk_sci_02';

  const bmk1 = await assessmentBookmarkService.bookmarkQuestion(userId, qId1, 'Good question for algebra review');
  assert(bmk1.questionId === qId1, 'Bookmark created with question ID');
  assert(bmk1.userId === userId, 'Bookmark created with user ID');

  // Idempotency check
  const bmk1Duplicate = await assessmentBookmarkService.bookmarkQuestion(userId, qId1, 'Updated notes');
  assert(bmk1Duplicate.questionId === qId1, 'Bookmark handles duplicate save idempotently');

  const isSaved1 = await assessmentBookmarkService.isBookmarked(userId, qId1);
  assert(isSaved1 === true, 'isBookmarked returns true for saved question');

  const isSavedUnsaved = await assessmentBookmarkService.isBookmarked(userId, 'q_unrelated');
  assert(isSavedUnsaved === false, 'isBookmarked returns false for unsaved question');

  // Bookmark second question
  await assessmentBookmarkService.bookmarkQuestion(userId, qId2);
  const allBookmarks = await assessmentBookmarkService.getBookmarks(userId);
  assert(allBookmarks.length >= 2, 'getBookmarks returns all saved items for user');

  // Remove Bookmark
  const removed = await assessmentBookmarkService.unbookmarkQuestion(userId, qId1);
  assert(removed === true, 'unbookmarkQuestion removes bookmark successfully');
  const isStillSaved = await assessmentBookmarkService.isBookmarked(userId, qId1);
  assert(isStillSaved === false, 'isBookmarked returns false after deletion');

  // Tenant Isolation on Bookmarks
  const otherBookmarks = await assessmentBookmarkService.getBookmarks(otherUserId);
  assert(otherBookmarks.length === 0, 'Tenant isolation: other user has isolated bookmarks');

  // ----------------------------------------------------
  // SUITE 3: WRONG QUESTION TRACKING & SPACED REVIEW SCHEDULING
  // ----------------------------------------------------
  console.log('\n--- 3. Wrong Question Tracking & Spaced Review ---');

  const mockQuestion: AssessmentQuestion = {
    questionId: 'q_wrong_test_01',
    concept: 'Quadratic Equations',
    subject: 'Mathematics',
    difficulty: 'medium',
    questionType: 'SHORT_ANSWER',
    evaluationMode: 'TEXT',
    marks: 4,
    question: 'Solve for x: x^2 - 5x + 6 = 0',
    requiresImageUpload: false,
    ragGrounded: false,
  };

  const mockSubmission1: AssessmentSubmission = {
    id: 'sub_attempt_1',
    userId,
    questionId: mockQuestion.questionId,
    questionType: 'SHORT_ANSWER',
    evaluationMode: 'TEXT',
    answer: 'x = 1',
    status: 'EVALUATED',
    submittedAt: new Date().toISOString(),
  };

  const mockEval1: EvaluationResult = {
    questionId: mockQuestion.questionId,
    submissionId: mockSubmission1.id,
    correct: false,
    score: 1,
    maxScore: 4,
    percentage: 25,
    evaluationStatus: 'EVALUATED',
    evaluationMode: 'TEXT',
    recommendedAction: 'TARGETED_PRACTICE',
    failureReason: 'NONE',
    confidence: 0.95,
    feedback: 'Incorrect factorization.',
    misconceptions: ['Sign error in factoring quadratic terms'],
    strengths: [],
    weaknesses: ['Sign error in quadratic factorization'],
    evaluatedAt: new Date().toISOString(),
  };

  // Attempt 1: Fail (25%) -> Should be recorded with 3-day interval
  const wrong1 = await wrongQuestionService.recordWrongQuestion(
    userId,
    mockQuestion,
    mockSubmission1,
    mockEval1
  );

  assert(Boolean(wrong1), 'Wrong question record created on score < 75%');
  assert(wrong1?.attemptCount === 1, 'First attemptCount is 1');
  assert(wrong1?.reviewStatus === 'SCHEDULED', 'Initial reviewStatus is SCHEDULED');
  assert(Boolean(wrong1?.nextReviewAt), 'nextReviewAt is scheduled');

  const expectedFirstIntervalMs = DEFAULT_WRONG_REVIEW_POLICY.intervalsMs[0]; // 3 days
  const scheduledTimeMs = new Date(wrong1!.nextReviewAt!).getTime() - new Date(wrong1!.firstFailedAt).getTime();
  // Allow ±5 seconds variance for execution time
  assert(
    Math.abs(scheduledTimeMs - expectedFirstIntervalMs) < 5000,
    'First spaced review interval is scheduled in 3 days'
  );

  // Attempt 2: Fail again (50%) -> Should update attemptCount to 2 and schedule 7-day interval
  const mockSubmission2: AssessmentSubmission = {
    id: 'sub_attempt_2',
    userId,
    questionId: mockQuestion.questionId,
    questionType: 'SHORT_ANSWER',
    evaluationMode: 'TEXT',
    answer: 'x = 2',
    status: 'EVALUATED',
    submittedAt: new Date().toISOString(),
  };

  const mockEval2: EvaluationResult = {
    ...mockEval1,
    submissionId: mockSubmission2.id,
    score: 2,
    percentage: 50,
  };

  const wrong2 = await wrongQuestionService.recordWrongQuestion(
    userId,
    mockQuestion,
    mockSubmission2,
    mockEval2
  );

  assert(wrong2?.attemptCount === 2, 'attemptCount increments to 2 on repeat failure');
  const expectedSecondIntervalMs = DEFAULT_WRONG_REVIEW_POLICY.intervalsMs[1]; // 7 days
  const scheduledTime2Ms = new Date(wrong2!.nextReviewAt!).getTime() - new Date(wrong2!.lastAttemptedAt).getTime();
  assert(
    Math.abs(scheduledTime2Ms - expectedSecondIntervalMs) < 5000,
    'Second spaced review interval is scheduled in 7 days'
  );

  // NEEDS_REVIEW safeguard: Image timeout or provider failure must NEVER add to wrong question pool
  const mockEvalNeedsReview: EvaluationResult = {
    ...mockEval1,
    submissionId: 'sub_needs_review',
    evaluationStatus: 'NEEDS_REVIEW',
    failureReason: 'IMAGE_UNREADABLE',
    confidence: 0.1,
  };
  const wrongNeedsReview = await wrongQuestionService.recordWrongQuestion(
    userId,
    { ...mockQuestion, questionId: 'q_unreadable_img' },
    mockSubmission1,
    mockEvalNeedsReview
  );
  assert(wrongNeedsReview === null, 'Safeguard: NEEDS_REVIEW evaluation is ignored from wrong question pool');

  // Due Reviews query
  // Currently scheduled 7 days in the future, so asking as of now should return 0 due items
  const dueNow = await wrongQuestionService.getDueReviews(userId, new Date());
  assert(dueNow.length === 0, 'No reviews due currently when scheduled for future');

  // Asking as of 8 days in the future -> should be due
  const futureDate = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000);
  const dueFuture = await wrongQuestionService.getDueReviews(userId, futureDate);
  assert(dueFuture.length >= 1, 'getDueReviews returns question when nextReviewAt <= asOfDate');
  assert(dueFuture[0].questionId === mockQuestion.questionId, 'Due review matches expected question ID');

  // Attempt 3: Mastered on correct reattempt (score 90%)
  const resolved = await wrongQuestionService.resolveCorrectReattempt(userId, mockQuestion.questionId);
  assert(resolved === true, 'resolveCorrectReattempt resolves mastered state');
  const wrongMastered = await wrongQuestionService.getWrongQuestion(userId, mockQuestion.questionId);
  assert(wrongMastered?.reviewStatus === 'MASTERED', 'reviewStatus is updated to MASTERED');

  // ----------------------------------------------------
  // SUITE 4: DETERMINISTIC ASSESSMENT ANALYTICS
  // ----------------------------------------------------
  console.log('\n--- 4. Deterministic Assessment Analytics ---');

  const mockSubmissions = [
    {
      questionId: 'q_a1',
      subject: 'Mathematics',
      concept: 'Linear Equations',
      questionType: 'MCQ',
      score: 1,
      timeTakenMs: 15000,
      evaluation: {
        correct: true,
        score: 1,
        maxScore: 1,
        conceptAssessment: { understanding: 'strong', methodSelection: 'strong' },
      },
    },
    {
      questionId: 'q_a2',
      subject: 'Mathematics',
      concept: 'Linear Equations',
      questionType: 'SHORT_ANSWER',
      score: 3,
      timeTakenMs: 45000,
      evaluation: {
        correct: true,
        score: 3,
        maxScore: 3,
        conceptAssessment: { understanding: 'strong', methodSelection: 'strong', calculation: 'moderate' },
      },
    },
    {
      questionId: 'q_a3',
      subject: 'Science',
      concept: 'Photosynthesis',
      questionType: 'LONG_ANSWER',
      score: 2,
      timeTakenMs: 60000,
      evaluation: {
        correct: false,
        score: 2,
        maxScore: 5,
        misconceptions: ['Confusing light-dependent and light-independent reactions'],
        conceptAssessment: { understanding: 'weak', reasoning: 'moderate' },
      },
    },
  ];

  const mockQuestions = [
    { questionId: 'q_a1', subject: 'Mathematics', concept: 'Linear Equations', difficulty: 'easy', marks: 1 },
    { questionId: 'q_a2', subject: 'Mathematics', concept: 'Linear Equations', difficulty: 'medium', marks: 3 },
    { questionId: 'q_a3', subject: 'Science', concept: 'Photosynthesis', difficulty: 'hard', marks: 5 },
  ];

  const analytics = assessmentAnalyticsService.calculateAnalyticsFromRecords(mockSubmissions, mockQuestions);

  assert(analytics.totalAttempts === 3, 'Analytics totalAttempts is 3');
  assert(analytics.totalQuestions === 3, 'Analytics totalQuestions is 3');
  assert(analytics.overallAccuracy === 67, 'Analytics overallAccuracy is calculated as 67% (2/3)');
  assert(analytics.totalTimeSpentMs === 120000, 'Total time spent is 120,000ms');
  assert(analytics.averageTimePerQuestionMs === 40000, 'Average time per question is 40,000ms');

  // Breakdown by subject
  assert(Boolean(analytics.bySubject['Mathematics']), 'bySubject includes Mathematics');
  assert(analytics.bySubject['Mathematics'].attempted === 2, 'Mathematics attempted is 2');
  assert(analytics.bySubject['Mathematics'].accuracy === 100, 'Mathematics accuracy is 100%');

  assert(Boolean(analytics.bySubject['Science']), 'bySubject includes Science');
  assert(analytics.bySubject['Science'].attempted === 1, 'Science attempted is 1');
  assert(analytics.bySubject['Science'].accuracy === 0, 'Science accuracy is 0%');

  // Breakdown by concept
  assert(Boolean(analytics.byConcept['Linear Equations']), 'byConcept includes Linear Equations');
  assert(Boolean(analytics.byConcept['Photosynthesis']), 'byConcept includes Photosynthesis');

  // Common misconceptions
  assert(analytics.commonMisconceptions.length === 1, 'commonMisconceptions tracks identified misconceptions');
  assert(
    analytics.commonMisconceptions[0].misconception.includes('light-dependent'),
    'commonMisconceptions captures correct string'
  );

  // Skill proficiencies
  assert(typeof analytics.skillBreakdown.understanding === 'number', 'skillBreakdown has numeric understanding score');
  assert(typeof analytics.skillBreakdown.method_selection === 'number', 'skillBreakdown has numeric method_selection score');

  // ----------------------------------------------------
  // SUITE 5: ADAPTIVE ENGINE INTEGRATION WITH LEARNER STATE
  // ----------------------------------------------------
  console.log('\n--- 5. Adaptive Engine Strategy Planning ---');

  const weakLearnerState: LearnerAssessmentState = {
    userId,
    concepts: {
      'Linear Equations in One Variable': {
        concept: 'Linear Equations in One Variable',
        subject: 'Mathematics',
        mastery: 0.35,
        confidence: 0.8,
        skills: { understanding: 0.3, method_selection: 0.4 },
        recentPerformance: [
          { questionId: 'q1', difficulty: 'medium', scorePercentage: 30, evaluatedAt: new Date().toISOString(), questionType: 'MCQ' },
          { questionId: 'q2', difficulty: 'medium', scorePercentage: 40, evaluatedAt: new Date().toISOString(), questionType: 'SHORT_ANSWER' },
        ],
        misconceptions: ['Variable isolation confusion'],
      },
    },
    updatedAt: new Date().toISOString(),
  };

  const planWeak = assessmentEngine.planAssessment({
    concept: 'Linear Equations in One Variable',
    subject: 'Mathematics',
    goal: 'practice',
    learnerState: weakLearnerState,
  });

  assert(planWeak.strategies[0].difficulty === 'easy', 'Adaptive Engine selects EASY difficulty for struggling learner');

  const strongLearnerState: LearnerAssessmentState = {
    userId,
    concepts: {
      'Linear Equations in One Variable': {
        concept: 'Linear Equations in One Variable',
        subject: 'Mathematics',
        mastery: 0.85,
        confidence: 0.9,
        skills: { understanding: 0.9, method_selection: 0.85 },
        recentPerformance: [
          { questionId: 'q3', difficulty: 'medium', scorePercentage: 90, evaluatedAt: new Date().toISOString(), questionType: 'SHORT_ANSWER' },
          { questionId: 'q4', difficulty: 'hard', scorePercentage: 100, evaluatedAt: new Date().toISOString(), questionType: 'LONG_ANSWER' },
        ],
        misconceptions: [],
      },
    },
    updatedAt: new Date().toISOString(),
  };

  const planStrong = assessmentEngine.planAssessment({
    concept: 'Linear Equations in One Variable',
    subject: 'Mathematics',
    goal: 'practice',
    learnerState: strongLearnerState,
  });

  assert(planStrong.strategies[0].difficulty === 'hard', 'Adaptive Engine selects HARD difficulty for mastered learner');

  // Final summary
  console.log('\n======================================================');
  console.log(`📊 M7 PHASE 4 VERIFICATION RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('======================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runPhase4Verification().catch((err) => {
  console.error('Fatal error during Phase 4 verification:', err);
  process.exit(1);
});
