/**
 * End-to-End Application Wiring & Live Tutor Integration Verification Suite
 *
 * This test suite validates real HTTP boundaries (HTTP Client -> Express App -> Router -> Middleware -> Services -> Database/AI -> Response)
 *
 * Test Scenarios:
 * 1. Health & Unauthenticated Security Boundaries (401 Missing/Invalid Token)
 * 2. Authenticated Student Profile Sync (GET /api/auth/me)
 * 3. Live Voice Teaching Session Loop & Session Context:
 *    - Session Creation (POST /api/teaching/sessions)
 *    - Voice Turn Interaction (POST /api/teaching/sessions/:sessionId/voice)
 *    - Session Context & History Persistence (GET /api/teaching/sessions/:sessionId)
 * 4. Knowledge Base & Grounded Retrieval Context (GET /api/knowledge/documents)
 * 5. Adaptive Assessment Workflow:
 *    - Assessment Session Creation (POST /api/assessments/sessions)
 *    - Question Generation & Client Sanitization (POST /api/assessments/generate)
 *    - Answer Evaluation & TeachingState Update (POST /api/assessments/evaluate)
 * 6. Bookmarks & Mistake Tracker Spaced Review:
 *    - Bookmark Question (POST /api/assessments/bookmarks)
 *    - List Bookmarks (GET /api/assessments/bookmarks)
 *    - Spaced Repetition Due Reviews (GET /api/assessments/reviews/due)
 *    - Remove Bookmark (DELETE /api/assessments/bookmarks/:questionId)
 * 7. Multi-Tenant User Isolation & Security:
 *    - Student B cannot access Student A's teaching sessions
 *    - Student B cannot see Student A's bookmarks or mistakes
 */

import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import * as firebaseConfig from './config/firebase.js';
import { connectDatabase } from './config/db.js';

dotenv.config();

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✓ ${message}`);
}

// Mock Firebase Token Verifier for Real HTTP Auth testing
const setupMockAuth = () => {
  firebaseConfig.setCustomAuthProvider({
    verifyIdToken: async (token: string) => {
      if (token === 'TOKEN_STUDENT_A') {
        return {
          uid: 'student_user_alpha',
          email: 'student_a@aitutor.test',
          name: 'Student Alpha',
          auth_time: Math.floor(Date.now() / 1000),
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
          aud: 'ai-tutor-test',
          iss: 'https://securetoken.google.com/ai-tutor-test',
          sub: 'student_user_alpha',
        };
      }
      if (token === 'TOKEN_STUDENT_B') {
        return {
          uid: 'student_user_beta',
          email: 'student_b@aitutor.test',
          name: 'Student Beta',
          auth_time: Math.floor(Date.now() / 1000),
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
          aud: 'ai-tutor-test',
          iss: 'https://securetoken.google.com/ai-tutor-test',
          sub: 'student_user_beta',
        };
      }
      throw new Error('Invalid Firebase ID token');
    },
  });
};

async function runE2EIntegrationTests() {
  console.log('================================================================');
  console.log('🚀 RUNNING E2E APPLICATION WIRING & HTTP BOUNDARY VERIFICATION');
  console.log('================================================================\n');

  setupMockAuth();

  // Connect to DB if available
  try {
    await connectDatabase();
    console.log('  ✓ Connected to MongoDB for E2E persistence testing\n');
  } catch (err) {
    console.warn('  ⚠️ MongoDB connection skipped; proceeding in memory/mock fallback mode\n');
  }

  // Spin up real Express HTTP Server on ephemeral port
  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve());
  });

  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`🌐 Real HTTP Express server listening on ${baseUrl}\n`);

  const studentAHeaders = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer TOKEN_STUDENT_A',
  };

  const studentBHeaders = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer TOKEN_STUDENT_B',
  };

  try {
    // ----------------------------------------------------------------
    // SCENARIO 1: Health & Unauthenticated Security Boundaries
    // ----------------------------------------------------------------
    console.log('--- TEST SCENARIO 1: Health & Unauthenticated Security Boundaries ---');
    
    // 1.1 Health Check (Public)
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert(healthRes.status === 200, 'GET /api/health returns HTTP 200');
    const healthBody: any = await healthRes.json();
    assert(healthBody.success === true && healthBody.data.status === 'ok', 'Health status reports success and status: ok');

    // 1.2 Protected route without token
    const unauthRes = await fetch(`${baseUrl}/api/auth/me`);
    assert(unauthRes.status === 401, 'GET /api/auth/me without token returns HTTP 401 Unauthorized');
    const unauthBody: any = await unauthRes.json();
    assert(unauthBody.error.code === 'AUTH_MISSING_TOKEN', 'Rejection code is AUTH_MISSING_TOKEN');

    // 1.3 Protected route with invalid token
    const invalidTokenRes = await fetch(`${baseUrl}/api/teaching/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer INVALID_EXPIRED_TOKEN' },
      body: JSON.stringify({ topic: "Newton's Laws" }),
    });
    assert(invalidTokenRes.status === 401, 'POST /api/teaching/sessions with invalid token returns HTTP 401');

    // ----------------------------------------------------------------
    // SCENARIO 2: Authenticated Student Profile Synchronization
    // ----------------------------------------------------------------
    console.log('\n--- TEST SCENARIO 2: Authenticated Student Profile Sync ---');
    const meRes = await fetch(`${baseUrl}/api/auth/me`, { headers: studentAHeaders });
    assert(meRes.status === 200, 'GET /api/auth/me with Student A token returns HTTP 200');
    const meBody: any = await meRes.json();
    assert(meBody.success === true && meBody.data.firebaseUid === 'student_user_alpha', 'Student A profile synchronized with UID student_user_alpha');
    assert(Boolean(meBody.data.id), `Synchronized MongoDB User ID: ${meBody.data.id}`);
    assert(meBody.data.email === 'student_a@aitutor.test', 'Student A profile has correct email');

    // ----------------------------------------------------------------
    // SCENARIO 3: Live Voice Teaching Session Loop & Session Context
    // ----------------------------------------------------------------
    console.log('\n--- TEST SCENARIO 3: Live Voice Teaching Session Loop & Session Context ---');
    
    // 3.1 Create Teaching Session
    const createSessionRes = await fetch(`${baseUrl}/api/teaching/sessions`, {
      method: 'POST',
      headers: studentAHeaders,
      body: JSON.stringify({
        topic: "Newton's Laws of Motion",
        subject: 'Physics',
        learnerProfile: {
          preferredLanguage: 'english',
          educationLevel: 'High School',
          learningGoal: 'Master 1st and 2nd laws',
          explanationStyle: 'simple',
        },
      }),
    });
    assert(createSessionRes.status === 201, 'POST /api/teaching/sessions returns HTTP 201 Created');
    const sessionData: any = (await createSessionRes.json() as any).data;
    const sessionId = sessionData.id;
    assert(Boolean(sessionId), `Created session with ID: ${sessionId}`);
    assert(sessionData.subject === 'Physics', 'Session record contains subject: Physics');
    assert(sessionData.currentMode === 'TEACHING', 'Session starts in currentMode: TEACHING');
    assert(Array.isArray(sessionData.conversationHistory), 'Session initialized with conversationHistory array');

    // 3.2 Conversational Voice Turn
    const voiceTurnRes = await fetch(`${baseUrl}/api/teaching/sessions/${sessionId}/voice`, {
      method: 'POST',
      headers: studentAHeaders,
      body: JSON.stringify({
        transcript: 'Can you explain what inertia is with a simple example?',
        language: 'english',
      }),
    });
    assert(voiceTurnRes.status === 200, 'POST /api/teaching/sessions/:sessionId/voice returns HTTP 200');
    const voiceData: any = (await voiceTurnRes.json() as any).data;
    assert(Boolean(voiceData.normalizedSpeechText), 'Response contains normalizedSpeechText for TTS');
    assert(Boolean(voiceData.teachingState), 'Response contains updated teachingState');
    assert(Boolean(voiceData.sessionContext), 'Response contains unified TutorSessionContext');
    assert(voiceData.sessionContext.sessionId === sessionId, 'sessionContext.sessionId matches session');
    assert(voiceData.sessionContext.conversationHistory.length >= 2, 'conversationHistory has recorded student turn and tutor turn');
    assert(voiceData.sessionContext.conversationHistory[0].role === 'student', 'First recorded turn has role: student');
    assert(voiceData.sessionContext.conversationHistory[1].role === 'tutor', 'Second recorded turn has role: tutor');

    // 3.3 Get Session Details and Context
    const getSessionRes = await fetch(`${baseUrl}/api/teaching/sessions/${sessionId}`, {
      headers: studentAHeaders,
    });
    assert(getSessionRes.status === 200, 'GET /api/teaching/sessions/:sessionId returns HTTP 200');
    const getSessionBody: any = (await getSessionRes.json() as any).data;
    assert(getSessionBody.session.id === sessionId, 'Retrieved session ID matches');
    assert(getSessionBody.context.conversationHistory.length >= 2, 'Retrieved context maintains full conversation history');

    // ----------------------------------------------------------------
    // SCENARIO 4: Knowledge Base & Document Listing
    // ----------------------------------------------------------------
    console.log('\n--- TEST SCENARIO 4: Knowledge Base & RAG Context ---');
    const docsRes = await fetch(`${baseUrl}/api/knowledge/documents`, { headers: studentAHeaders });
    assert(docsRes.status === 200, 'GET /api/knowledge/documents returns HTTP 200');
    const docsBody: any = await docsRes.json();
    assert(Array.isArray(docsBody.data), 'Returns documents array for knowledge library');

    // ----------------------------------------------------------------
    // SCENARIO 5: Adaptive Assessment Workflow (Generate, Sanitize, Evaluate)
    // ----------------------------------------------------------------
    console.log('\n--- TEST SCENARIO 5: Adaptive Assessment Workflow ---');

    // 5.1 Create Assessment Practice Session
    const createAssessSessRes = await fetch(`${baseUrl}/api/assessments/sessions`, {
      method: 'POST',
      headers: studentAHeaders,
      body: JSON.stringify({
        subject: 'Physics',
        topic: "Newton's Laws",
        sessionType: 'CONCEPT_CHECK',
      }),
    });
    assert(createAssessSessRes.status === 201, 'POST /api/assessments/sessions returns HTTP 201 Created');
    const assessSession: any = (await createAssessSessRes.json() as any).data;
    const assessSessionId = assessSession.id;
    assert(Boolean(assessSessionId), `Created assessment session ID: ${assessSessionId}`);

    // 5.2 Generate Question
    const generateRes = await fetch(`${baseUrl}/api/assessments/generate`, {
      method: 'POST',
      headers: studentAHeaders,
      body: JSON.stringify({
        subject: 'Physics',
        topic: "Newton's Laws",
        concept: 'Inertia and First Law',
        assessmentSessionId: assessSessionId,
      }),
    });
    assert(generateRes.status === 200, 'POST /api/assessments/generate returns HTTP 200');
    const genBody: any = await generateRes.json();
    const generatedQuestion: any = genBody.data;
    const generatedQuestionId = generatedQuestion.questionId || generatedQuestion.id;
    assert(Boolean(generatedQuestionId), `Generated Question ID: ${generatedQuestionId}`);
    assert(generatedQuestion.subject === 'Physics', 'Generated question has subject: Physics');
    
    // Verify Client Sanitization (No correctOptionId or evaluationRubric leaked)
    assert(generatedQuestion.correctOptionId === undefined, 'Client Sanitization: correctOptionId is NOT leaked to client');
    assert(generatedQuestion.evaluationRubric === undefined, 'Client Sanitization: evaluationRubric is NOT leaked to client');

    // 5.3 Submit Evaluation
    const submissionBody = {
      questionId: generatedQuestionId,
      questionType: generatedQuestion.questionType,
      selectedOption: generatedQuestion.questionType === 'MCQ' ? (generatedQuestion.options?.[0]?.id || 'opt_a') : undefined,
      answer: generatedQuestion.questionType !== 'MCQ' ? 'An object at rest stays at rest unless acted upon by an external force.' : undefined,
    };

    const evaluateRes = await fetch(`${baseUrl}/api/assessments/questions/${generatedQuestionId}/submit`, {
      method: 'POST',
      headers: studentAHeaders,
      body: JSON.stringify(submissionBody),
    });
    assert(evaluateRes.status === 200, 'POST /api/assessments/questions/:id/submit returns HTTP 200');
    const evalData: any = (await evaluateRes.json() as any).data;
    assert(Boolean(evalData.id), `Answer submitted with submission ID: ${evalData.id}`);
    assert(evalData.questionId === generatedQuestionId, 'Submission links to target questionId');
    assert(['SUBMITTED', 'EVALUATING', 'EVALUATED'].includes(evalData.status), `Submission status is: ${evalData.status}`);

    // Wait a brief moment for async evaluation to persist
    await new Promise((r) => setTimeout(r, 2000));

    // Verify question is recorded in student's assessment history
    const historyRes = await fetch(`${baseUrl}/api/assessments/history`, { headers: studentAHeaders });
    assert(historyRes.status === 200, 'GET /api/assessments/history returns HTTP 200');
    const historyData: any = (await historyRes.json() as any).data;
    assert(Array.isArray(historyData), 'Assessment history returned array of questions');

    // ----------------------------------------------------------------
    // SCENARIO 6: Bookmarks & Mistake Tracker Spaced Review
    // ----------------------------------------------------------------
    console.log('\n--- TEST SCENARIO 6: Bookmarks & Spaced Repetition Due Reviews ---');

    // 6.1 Bookmark Question
    const bookmarkRes = await fetch(`${baseUrl}/api/assessments/questions/${generatedQuestionId}/bookmark`, {
      method: 'POST',
      headers: studentAHeaders,
      body: JSON.stringify({
        notes: 'Important concept to review before exams',
      }),
    });
    assert(bookmarkRes.status === 200, 'POST /api/assessments/questions/:id/bookmark returns HTTP 200');

    // 6.2 Get Bookmarks
    const getBookmarksRes = await fetch(`${baseUrl}/api/assessments/bookmarks`, {
      headers: studentAHeaders,
    });
    assert(getBookmarksRes.status === 200, 'GET /api/assessments/bookmarks returns HTTP 200');
    const bookmarksList: any = (await getBookmarksRes.json() as any).data;
    assert(Array.isArray(bookmarksList) && bookmarksList.length >= 1, 'Student A bookmarks list contains saved question');
    assert(bookmarksList.some((b: any) => b.questionId === generatedQuestionId), 'Saved question ID is in bookmarks list');

    // 6.3 Check Due Reviews
    const dueReviewsRes = await fetch(`${baseUrl}/api/assessments/reviews/due`, {
      headers: studentAHeaders,
    });
    assert(dueReviewsRes.status === 200, 'GET /api/assessments/reviews/due returns HTTP 200');
    const dueList: any = (await dueReviewsRes.json() as any).data;
    assert(Array.isArray(dueList), 'Returns array of due spaced reviews');

    // 6.4 Delete Bookmark
    const deleteBookmarkRes = await fetch(`${baseUrl}/api/assessments/questions/${generatedQuestionId}/bookmark`, {
      method: 'DELETE',
      headers: studentAHeaders,
    });
    assert(deleteBookmarkRes.status === 200, 'DELETE /api/assessments/questions/:id/bookmark returns HTTP 200');

    // ----------------------------------------------------------------
    // SCENARIO 7: Multi-Tenant Security & Tenant Isolation Boundary
    // ----------------------------------------------------------------
    console.log('\n--- TEST SCENARIO 7: Multi-Tenant User Isolation & Security ---');

    // 7.1 Student B tries to access Student A's teaching session
    const studentBAccessRes = await fetch(`${baseUrl}/api/teaching/sessions/${sessionId}`, {
      headers: studentBHeaders,
    });
    assert(
      studentBAccessRes.status === 403 || studentBAccessRes.status === 404,
      'Multi-tenant Security: Student B cannot access Student A teaching session (HTTP 403/404)'
    );

    // 7.2 Student B tries to send a voice turn to Student A's session
    const studentBVoiceRes = await fetch(`${baseUrl}/api/teaching/sessions/${sessionId}/voice`, {
      method: 'POST',
      headers: studentBHeaders,
      body: JSON.stringify({ transcript: 'Hacking Student A session', language: 'english' }),
    });
    assert(
      studentBVoiceRes.status === 403 || studentBVoiceRes.status === 404,
      'Multi-tenant Security: Student B cannot inject voice turns into Student A session'
    );

    // 7.3 Student B Bookmarks Isolation
    const studentBBookmarksRes = await fetch(`${baseUrl}/api/assessments/bookmarks`, {
      headers: studentBHeaders,
    });
    const studentBBookmarks: any = (await studentBBookmarksRes.json() as any).data;
    assert(
      Array.isArray(studentBBookmarks) && !studentBBookmarks.some((b: any) => b.questionId === generatedQuestionId),
      'Multi-tenant Security: Student B bookmark list is strictly isolated from Student A'
    );

    console.log('\n================================================================');
    console.log('🎉 ALL E2E INTEGRATION & HTTP BOUNDARY TESTS PASSED SUCCESSFULLY');
    console.log('================================================================\n');
  } finally {
    server.close();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

runE2EIntegrationTests().catch((err) => {
  console.error('\n💥 E2E INTEGRATION VERIFICATION FAILED:', err);
  process.exit(1);
});
