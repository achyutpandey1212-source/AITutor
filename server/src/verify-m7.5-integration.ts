import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import * as firebaseConfig from './config/firebase.js';
import { connectDatabase } from './config/db.js';
import { DocumentModel } from './models/document.model.js';
import { AssessmentQuestionModel } from './models/assessment-question.model.js';
import { isValidObjectId } from './utils/objectid.util.js';
import { isMeaningfulBargeIn } from '@ai-tutor/shared';

dotenv.config();

let server: http.Server;
let baseUrl: string;

const USER_A = 'student_m75_alpha';
const USER_B = 'student_m75_beta';

// Mock Firebase Token Verifier for Real HTTP Auth testing
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

async function runM75Verification() {
  console.log('\n===============================================================');
  console.log('RUNNING M7.5 INTEGRATION & BARGE-IN VERIFICATION SUITE');
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
  await new Promise<void>((resolve) => server.listen(0, () => resolve()));
  const port = (server.address() as any).port;
  baseUrl = `http://127.0.0.1:${port}`;
  console.log('[OK] Test HTTP Server listening on:', baseUrl);

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, desc: string) {
    totalTests++;
    if (condition) {
      console.log('  [PASS] ' + desc);
      passedTests++;
    } else {
      console.error('  [FAIL] ' + desc);
      throw new Error('Assertion failed: ' + desc);
    }
  }

  // --- SUITE 1: Safe ObjectId & String Session-ID Disambiguation ---
  console.log('\n--- Suite 1: Session-ID Disambiguation & Safe Validation ---');
  {
    assert(isValidObjectId('6a986ef8afe3abf011256601') === true, 'Valid 24-char hex recognized as ObjectId');
    assert(isValidObjectId('ses_1788411119521_zfsrw') === false, 'Assessment string ID rejected as ObjectId');
    assert(isValidObjectId('invalid-id') === false, 'Invalid string rejected as ObjectId');
    assert(isValidObjectId(null) === false, 'Null rejected as ObjectId');

    // Calling teaching session with invalid string session ID returns clean 404 without 500 CastError
    const getRes = await fetch(`${baseUrl}/api/teaching/sessions/ses_1788411119521_zfsrw`, {
      headers: { Authorization: 'Bearer TOKEN_STUDENT_A' },
    });
    const getJson: any = await getRes.json();
    assert(getRes.status === 404, 'GET /sessions/ses_... returns HTTP 404 cleanly');
    assert(getJson.error?.code === 'SESSION_NOT_FOUND', 'Error code is SESSION_NOT_FOUND without unhandled CastError');

    // Assessment Generation with string assessmentSessionId
    const assessRes = await fetch(`${baseUrl}/api/assessments/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer TOKEN_STUDENT_A',
      },
      body: JSON.stringify({
        concept: 'Newton Second Law',
        subject: 'Physics',
        goal: 'practice',
        difficulty: 'medium',
        questionType: 'MCQ',
        marks: 2,
        assessmentSessionId: 'ses_1788411119521_zfsrw',
      }),
    });
    const assessJson: any = await assessRes.json();
    assert(assessRes.status === 200, 'POST /assessments/generate succeeds with ses_... ID without CastError');
    assert(assessJson.data?.questionId !== undefined, 'Assessment question generated successfully');

    const savedQ = await AssessmentQuestionModel.findOne({ questionId: assessJson.data.questionId });
    assert(savedQ?.sessionId === 'ses_1788411119521_zfsrw', 'Question saved to assessmentSessionId in database');
  }

  // --- SUITE 2: Document Selection, Tenant Isolation & Scoped RAG ---
  console.log('\n--- Suite 2: Document Selection, Tenant Isolation & Grounding ---');
  {
    // 1. Create a ready document for Student A
    const docA = await DocumentModel.create({
      userId: USER_A,
      filename: 'Physics-NCERT-Motion.pdf',
      mimeType: 'application/pdf',
      size: 10240,
      pageCount: 12,
      chunkCount: 1,
      status: 'ready',
    });

    // 2. Student B tries to create teaching session binding Student A document -> Forbidden
    const forbiddenSessionRes = await fetch(`${baseUrl}/api/teaching/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer TOKEN_STUDENT_B',
      },
      body: JSON.stringify({
        topic: 'Motion',
        documentId: docA._id.toString(),
      }),
    });
    assert(forbiddenSessionRes.status === 403, 'Student B cannot bind Student A document (HTTP 403)');

    // 3. Student A creates teaching session binding docA
    const sessionResA = await fetch(`${baseUrl}/api/teaching/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer TOKEN_STUDENT_A',
      },
      body: JSON.stringify({
        topic: 'Force and Momentum',
        subject: 'Physics',
        documentId: docA._id.toString(),
      }),
    });
    const sessionJsonA: any = await sessionResA.json();
    assert(sessionResA.status === 201, 'Student A successfully creates document-bound session');
    assert(sessionJsonA.data.documentId === docA._id.toString(), 'Session contains correct documentId');
    assert(sessionJsonA.data.documentTitle === docA.filename, 'Session contains correct documentTitle');

    const createdSessionId = sessionJsonA.data.id;

    // 4. Student A interacts via voice - verify document-aware RAG pipeline runs without error
    const voiceRes = await fetch(`${baseUrl}/api/teaching/sessions/${createdSessionId}/voice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer TOKEN_STUDENT_A',
      },
      body: JSON.stringify({
        transcript: 'Can you explain how force is related to acceleration according to the book?',
        language: 'english',
      }),
    });
    const voiceJson: any = await voiceRes.json();
    assert(voiceRes.status === 200, 'Document-grounded voice interaction succeeds (HTTP 200)');
    assert(voiceJson.data.sessionContext.documentId === docA._id.toString(), 'Voice response returns documentId context');
    assert(voiceJson.data.sessionContext.documentTitle === docA.filename, 'Voice response returns documentTitle context');

    // 5. Assessment generation with teachingSessionId automatically grounds on session documentId
    const assessGroundedRes = await fetch(`${baseUrl}/api/assessments/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer TOKEN_STUDENT_A',
      },
      body: JSON.stringify({
        concept: 'Newton Second Law Formula',
        subject: 'Physics',
        teachingSessionId: createdSessionId,
      }),
    });
    assert(assessGroundedRes.status === 200, 'Assessment generated successfully using session document context');
  }

  // --- SUITE 3: Conversational Barge-In & Interruption Logic ---
  console.log('\n--- Suite 3: Conversational Barge-In & Voice State Machine ---');
  {
    const tutorSpokenText = 'Force is equal to the product of mass and acceleration according to Newton second law.';

    // Test 1: Immediate trigger words
    assert(isMeaningfulBargeIn('wait', tutorSpokenText) === true, '"wait" triggers immediate barge-in');
    assert(isMeaningfulBargeIn('stop', tutorSpokenText) === true, '"stop" triggers immediate barge-in');
    assert(isMeaningfulBargeIn('why', tutorSpokenText) === true, '"why" triggers immediate barge-in');
    assert(isMeaningfulBargeIn('hold on', tutorSpokenText) === true, '"hold on" triggers immediate barge-in');
    assert(isMeaningfulBargeIn('doubt', tutorSpokenText) === true, '"doubt" triggers immediate barge-in');

    // Test 2: Natural student questions
    assert(isMeaningfulBargeIn('what is momentum', tutorSpokenText) === true, '"what is momentum" triggers barge-in');
    assert(isMeaningfulBargeIn('can you give an example', tutorSpokenText) === true, '"can you give an example" triggers barge-in');

    // Test 3: Echo suppression & accidental noise
    assert(isMeaningfulBargeIn('a', tutorSpokenText) === false, 'Single character noise ignored');
    assert(isMeaningfulBargeIn('   ', tutorSpokenText) === false, 'Empty noise ignored');
    assert(isMeaningfulBargeIn('force is equal', tutorSpokenText) === false, 'Direct TTS echo bleed ignored');
  }

  console.log('\n===============================================================');
  console.log(`ALL ${passedTests}/${totalTests} INTEGRATION TESTS PASSED CLEANLY!`);
  console.log('===============================================================\n');

  if (server) server.close();
  await mongoose.disconnect();
  process.exit(0);
}

runM75Verification().catch(async (err) => {
  console.error('Fatal Verification Error:', err);
  if (server) server.close();
  await mongoose.disconnect();
  process.exit(1);
});
