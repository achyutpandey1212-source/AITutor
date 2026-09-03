import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import * as firebaseConfig from './config/firebase.js';
import { connectDatabase } from './config/db.js';
import { TeachingSessionModel } from './models/teaching-session.model.js';
import { AssessmentQuestionModel } from './models/assessment-question.model.js';
import { evaluateAssessmentTrigger } from './assessment/assessment-triggers.util.js';
import { assessmentSubmissionService } from './assessment/assessment-submission.service.js';
import type { AssessmentQuestion, TeachingState } from '@ai-tutor/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

let server: http.Server;
let baseUrl: string;

const USER_A = 'student_m76_alpha';
const USER_B = 'student_m76_beta';

const setupMockAuth = () => {
  firebaseConfig.setCustomAuthProvider({
    verifyIdToken: async (token: string) => {
      if (token === 'TOKEN_STUDENT_A') {
        return {
          uid: USER_A,
          email: 'alpha@school.edu',
          name: 'Student Alpha',
          auth_time: Math.floor(Date.now() / 1000),
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
          aud: 'ai-tutor-test',
          iss: 'https://securetoken.google.com/ai-tutor-test',
          sub: USER_A,
        };
      }
      if (token === 'TOKEN_STUDENT_B') {
        return {
          uid: USER_B,
          email: 'beta@school.edu',
          name: 'Student Beta',
          auth_time: Math.floor(Date.now() / 1000),
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
          aud: 'ai-tutor-test',
          iss: 'https://securetoken.google.com/ai-tutor-test',
          sub: USER_B,
        };
      }
      throw new Error('Invalid Firebase ID token');
    },
  });
};

async function runM76Verification() {
  console.log('\n===============================================================');
  console.log('RUNNING M7.6 PERSISTENT SESSIONS & ASSESSMENT ORCHESTRATION SUITE');
  console.log('===============================================================\n');

  setupMockAuth();

  try {
    await connectDatabase();
    console.log('[OK] Connected to MongoDB database');
  } catch (err) {
    console.warn('[WARN] MongoDB connection skipped; proceeding in memory/mock fallback mode');
  }

  const app = createApp();
  server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, () => {
      const port = (server.address() as any).port;
      baseUrl = `http://localhost:${port}`;
      console.log(`[OK] Real HTTP Test Server listening on ${baseUrl}`);
      resolve();
    });
  });

  let passedAssertions = 0;
  function assert(condition: boolean, message: string) {
    if (!condition) {
      console.error(`[FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
    passedAssertions++;
    console.log(`  ✓ ${message}`);
  }

  try {
    // =========================================================================
    // TEST AREA 1: Deterministic Assessment Trigger Unit Evaluator
    // =========================================================================
    console.log('\n--- 1. Testing Deterministic Assessment Trigger Evaluator ---');
    const baseTeachingState: TeachingState = {
      currentConcept: 'Conservation of Momentum',
      understanding: 'developing',
      confidence: 0.6,
      misconceptions: [],
      conceptsMastered: [],
      conceptsNeedingWork: [],
      lastStudentAction: 'request_explanation',
      recommendedNextAction: 'explain',
    };

    // Test 1A: Explicit Student Request
    const trigger1 = evaluateAssessmentTrigger({
      studentMessage: 'Can you ask me a question on this?',
      currentMode: 'TEACHING',
      assessmentStatus: 'NONE',
      teachingState: baseTeachingState,
      conversationHistory: [],
    });
    assert(trigger1.shouldAssess === true, 'Explicit student question request triggers assessment');
    assert(trigger1.reason === 'student_explicit_request', 'Trigger reason correctly identified as student_explicit_request');

    // Test 1B: Explicit Numerical Request
    const trigger2 = evaluateAssessmentTrigger({
      studentMessage: 'Give me a numerical problem to calculate the value',
      currentMode: 'TEACHING',
      assessmentStatus: 'NONE',
      teachingState: baseTeachingState,
      conversationHistory: [],
    });
    assert(trigger2.shouldAssess === true, 'Numerical request triggers assessment');
    assert(trigger2.questionType === 'NUMERICAL', 'Question type is inferred as NUMERICAL');

    // Test 1C: Weak Understanding Trigger
    const weakState: TeachingState = {
      ...baseTeachingState,
      understanding: 'weak',
      confidence: 0.3,
      recommendedNextAction: 'ask_question',
    };
    const trigger3 = evaluateAssessmentTrigger({
      studentMessage: 'I still do not get why momentum is conserved',
      currentMode: 'TEACHING',
      assessmentStatus: 'NONE',
      teachingState: weakState,
      conversationHistory: [],
    });
    assert(trigger3.shouldAssess === true, 'Weak understanding triggers assessment');
    assert(trigger3.difficulty === 'easy', 'Weak understanding generates easy difficulty check');

    // Test 1D: Guard Protection - Already Active Assessment Must NOT Trigger Another
    const triggerGuard = evaluateAssessmentTrigger({
      studentMessage: 'Ask me another question right now',
      currentMode: 'ASSESSMENT',
      assessmentStatus: 'WAITING_FOR_STUDENT',
      teachingState: baseTeachingState,
      conversationHistory: [],
    });
    assert(triggerGuard.shouldAssess === false, 'GUARD: Active assessment strictly prevents duplicate question generation');
    assert(triggerGuard.reason === 'assessment_already_active', 'Guard correctly reasons assessment_already_active');

    // Test 1E: Periodic Concept Check (6 turns without assessment)
    const longHistory = [
      { role: 'student', text: 'turn 1' },
      { role: 'tutor', text: 'turn 2' },
      { role: 'student', text: 'turn 3' },
      { role: 'tutor', text: 'turn 4' },
      { role: 'student', text: 'turn 5' },
      { role: 'tutor', text: 'turn 6' },
    ];
    const triggerPeriodic = evaluateAssessmentTrigger({
      studentMessage: 'Let us continue our discussion',
      currentMode: 'TEACHING',
      assessmentStatus: 'NONE',
      teachingState: baseTeachingState,
      conversationHistory: longHistory,
    });
    assert(triggerPeriodic.shouldAssess === true, 'Periodic check triggers after 6 uninterrupted turns');
    assert(triggerPeriodic.reason === 'periodic_concept_check', 'Reason is periodic_concept_check');

    // =========================================================================
    // TEST AREA 2: Persistent Session Lifecycle & Resume HTTP Boundaries
    // =========================================================================
    console.log('\n--- 2. Testing Session Lifecycle (Created -> Paused -> Resumed) ---');

    // Step 2A: Create session
    const createRes = await fetch(`${baseUrl}/api/teaching/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer TOKEN_STUDENT_A',
      },
      body: JSON.stringify({
        topic: 'Optics & Lenses',
        subject: 'Physics',
      }),
    });
    assert(createRes.status === 201, 'POST /api/teaching/sessions returns 201 Created');
    const createData: any = await createRes.json();
    assert(createData.success === true, 'Session created successfully');
    const sessionId = createData.data.id;
    assert(createData.data.status === 'active', 'Initial session status is active');

    // Step 2B: Pause session via PATCH
    const patchRes = await fetch(`${baseUrl}/api/teaching/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer TOKEN_STUDENT_A',
      },
      body: JSON.stringify({
        status: 'paused',
      }),
    });
    assert(patchRes.status === 200, 'PATCH /api/teaching/sessions/:id returns 200');
    const patchData: any = await patchRes.json();
    assert(patchData.data.status === 'paused', 'Session status updated to paused');

    // Step 2C: List user sessions
    const listRes = await fetch(`${baseUrl}/api/teaching/sessions`, {
      headers: { Authorization: 'Bearer TOKEN_STUDENT_A' },
    });
    assert(listRes.status === 200, 'GET /api/teaching/sessions returns 200');
    const listData: any = await listRes.json();
    assert(Array.isArray(listData.data), 'Returns array of teaching sessions');
    const found = listData.data.find((s: any) => s.id === sessionId);
    assert(Boolean(found), 'Newly created session appears in user sessions list');
    assert(found.status === 'paused', 'Listed session reflects paused status');

    // Step 2D: Unauthorized / Cross-user security check
    const crossRes = await fetch(`${baseUrl}/api/teaching/sessions/${sessionId}/resume`, {
      method: 'POST',
      headers: { Authorization: 'Bearer TOKEN_STUDENT_B' },
    });
    assert(crossRes.status === 403, 'Cross-user session resume strictly rejected with 403 Forbidden');

    // Step 2E: Resume session via POST /resume
    const resumeRes = await fetch(`${baseUrl}/api/teaching/sessions/${sessionId}/resume`, {
      method: 'POST',
      headers: { Authorization: 'Bearer TOKEN_STUDENT_A' },
    });
    assert(resumeRes.status === 200, 'POST /api/teaching/sessions/:id/resume returns 200 OK');
    const resumeData: any = await resumeRes.json();
    assert(resumeData.data.session.status === 'active', 'Resumed session status is restored to active');
    assert(resumeData.data.context.sessionId === sessionId, 'Context sessionId matches resumed session');

    // =========================================================================
    // TEST AREA 3: Question Retrieval by ID API
    // =========================================================================
    console.log('\n--- 3. Testing Question Retrieval API (GET /questions/:id) ---');
    const dummyQuestion: AssessmentQuestion = {
      questionId: `q_test_${Date.now()}`,
      subject: 'Physics',
      concept: 'Snell’s Law',
      difficulty: 'medium',
      questionType: 'MCQ',
      evaluationMode: 'MCQ',
      marks: 1,
      question: 'What is the refractive index formula according to Snell’s Law?',
      options: [
        { id: 'A', text: 'sin(i) / sin(r)' },
        { id: 'B', text: 'sin(r) / sin(i)' },
        { id: 'C', text: 'cos(i) / cos(r)' },
        { id: 'D', text: 'tan(i) / tan(r)' },
      ],
      correctOptionId: 'A',
      expectedAnswer: 'sin(i) / sin(r)',
      submissionGuidance: 'Snell’s Law states n = sin(i) / sin(r).',
      requiresImageUpload: false,
      ragGrounded: false,
    };
    await assessmentSubmissionService.saveQuestion(dummyQuestion, USER_A, sessionId);

    const getQRes = await fetch(`${baseUrl}/api/assessments/questions/${dummyQuestion.questionId}`, {
      headers: { Authorization: 'Bearer TOKEN_STUDENT_A' },
    });
    assert(getQRes.status === 200, 'GET /api/assessments/questions/:id returns 200');
    const getQData: any = await getQRes.json();
    assert(getQData.data.questionId === dummyQuestion.questionId, 'Question ID matches requested question');
    assert(getQData.data.question === dummyQuestion.question, 'Question text matches');
    assert(getQData.data.correctAnswer === undefined, 'Sanitization: correctAnswer is omitted from client payload');

    // =========================================================================
    // TEST AREA 4: Live Tutor Session Assessment Orchestration
    // =========================================================================
    console.log('\n--- 4. Testing Tutor Assessment Orchestration in Session Turn ---');
    const turnRes = await fetch(`${baseUrl}/api/teaching/sessions/${sessionId}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer TOKEN_STUDENT_A',
      },
      body: JSON.stringify({
        message: 'Please test me with a question on Snell’s Law',
      }),
    });
    assert(turnRes.status === 200, 'POST /sessions/:id/respond returns 200 OK');
    const turnData: any = await turnRes.json();
    assert(turnData.success === true, 'Turn processed successfully');
    assert(turnData.data.sessionContext.currentMode === 'ASSESSMENT', 'Session transitioned to ASSESSMENT mode');
    assert(turnData.data.sessionContext.assessmentStatus === 'WAITING_FOR_STUDENT', 'Session status is WAITING_FOR_STUDENT');
    assert(turnData.data.tutorAction?.type === 'ASK_ASSESSMENT', 'TutorAction is ASK_ASSESSMENT');
    assert(Boolean(turnData.data.assessmentQuestion), 'ClientAssessmentQuestion payload is included in turn response');
    assert(Boolean(turnData.data.turnId), 'Structured turnId is generated and returned');

    // =========================================================================
    // TEST AREA 5: Assessment Mode Hint Flow (No duplicate question, No wrong record)
    // =========================================================================
    console.log('\n--- 5. Testing Hint Request during WAITING_FOR_STUDENT ---');
    const hintRes = await fetch(`${baseUrl}/api/teaching/sessions/${sessionId}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer TOKEN_STUDENT_A',
      },
      body: JSON.stringify({
        message: 'Can you give me a hint? I am confused about the angles',
      }),
    });
    assert(hintRes.status === 200, 'Hint request returns 200 OK');
    const hintData: any = await hintRes.json();
    assert(hintData.data.sessionContext.currentMode === 'ASSESSMENT', 'Session remains in ASSESSMENT mode after hint');
    assert(hintData.data.sessionContext.assessmentStatus === 'WAITING_FOR_STUDENT', 'Session remains WAITING_FOR_STUDENT after hint');
    assert(hintData.data.tutorAction?.type === 'WAIT_FOR_ANSWER', 'TutorAction is WAIT_FOR_ANSWER');

    // =========================================================================
    // TEST AREA 6: Assessment Mode Give-Up / Solution Flow
    // =========================================================================
    console.log('\n--- 6. Testing Give-Up Flow during WAITING_FOR_STUDENT ---');
    const giveUpRes = await fetch(`${baseUrl}/api/teaching/sessions/${sessionId}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer TOKEN_STUDENT_A',
      },
      body: JSON.stringify({
        message: 'I give up, please explain the solution to me',
      }),
    });
    assert(giveUpRes.status === 200, 'Give-up request returns 200 OK');
    const giveUpData: any = await giveUpRes.json();
    assert(giveUpData.data.sessionContext.currentMode === 'TEACHING', 'Session smoothly returns to TEACHING mode');
    assert(giveUpData.data.sessionContext.assessmentStatus === 'COMPLETED', 'Assessment status set to COMPLETED');
    assert(giveUpData.data.tutorAction?.type === 'EXPLAIN', 'TutorAction is EXPLAIN');

    // =========================================================================
    // TEST AREA 7: Structured Turn History Verification
    // =========================================================================
    console.log('\n--- 7. Verifying Structured Conversation History in DB ---');
    const sessionDetailRes = await fetch(`${baseUrl}/api/teaching/sessions/${sessionId}`, {
      headers: { Authorization: 'Bearer TOKEN_STUDENT_A' },
    });
    const detailData: any = await sessionDetailRes.json();
    const history = detailData.data.session.conversationHistory;
    assert(Array.isArray(history) && history.length >= 4, 'History contains multiple recorded turns');
    const assessmentTurn = history.find((t: any) => t.type === 'assessment');
    assert(Boolean(assessmentTurn), 'Structured history records turn type="assessment"');

    console.log(`\n===============================================================`);
    console.log(`M7.6 INTEGRATION SUITE PASSED ALL ${passedAssertions} ASSERTIONS CLEANLY!`);
    console.log(`===============================================================\n`);
  } finally {
    server.close();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

runM76Verification().catch((err) => {
  console.error('\n[FATAL] Verification suite encountered an uncaught error:', err);
  process.exit(1);
});
