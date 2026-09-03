import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { createApp } from '../app.js';
import * as firebaseConfig from '../config/firebase.js';
import { connectDatabase } from '../config/db.js';
import { TeachingSessionModel } from '../models/teaching-session.model.js';
import { evaluateAssessmentTrigger } from './assessment-triggers.util.js';
import type { TeachingState, TeacherResponse } from '@ai-tutor/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

let server: http.Server;
let baseUrl: string;

const TEST_USER = 'student_phase15_alpha';

const setupMockAuth = () => {
  firebaseConfig.setCustomAuthProvider({
    verifyIdToken: async (token: string) => {
      if (token === 'TOKEN_STUDENT_ALPHA') {
        return {
          uid: TEST_USER,
          email: 'alpha@phase15.edu',
          name: 'Student Alpha',
          auth_time: Math.floor(Date.now() / 1000),
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
          aud: 'ai-tutor-test',
          iss: 'https://securetoken.google.com/ai-tutor-test',
          sub: TEST_USER,
        };
      }
      throw new Error('Invalid Firebase ID token');
    },
  });
};

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
};

async function runPhase15Verification() {
  console.log('\n===============================================================');
  console.log('RUNNING PHASE 1.5 CONVERSATIONAL VS FORMAL ASSESSMENT SUITE');
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
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      baseUrl = `http://localhost:${port}`;
      console.log(`[OK] Real HTTP Test Server listening on ${baseUrl}`);
      resolve();
    });
  });

  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer TOKEN_STUDENT_ALPHA',
  };

  const defaultTeachingState: TeachingState = {
    currentConcept: 'Light Refraction',
    understanding: 'developing',
    confidence: 0.6,
    misconceptions: [],
    conceptsMastered: ['Reflection'],
    conceptsNeedingWork: [],
    lastStudentAction: 'answer',
    recommendedNextAction: 'ask_question',
  };

  try {
    // --- TEST A: Trigger Logic — Conversational Question Guard ---
    console.log('\n--- 1. Test A: Conversational Question Guard in Trigger Evaluator ---');
    const conversationalTeacherResponse: TeacherResponse = {
      responseText: 'What do you think happens when light enters glass from air?',
      language: 'english',
      intent: 'question',
      teachingAction: 'explain',
      action: {
        type: 'ASK_CONVERSATIONAL',
        reason: 'checking intuition',
      },
    };

    const triggerConversational = evaluateAssessmentTrigger({
      studentMessage: 'Teach me about refraction',
      currentMode: 'TEACHING',
      assessmentStatus: 'NONE',
      teachingState: defaultTeachingState,
      conversationHistory: [],
      teacherResponse: conversationalTeacherResponse,
    });

    assert(triggerConversational.shouldAssess === false, 'Conversational question does NOT trigger assessment');
    assert(
      triggerConversational.reason === 'conversational_question_not_assessment',
      'Reason correctly identified as conversational_question_not_assessment'
    );

    // --- TEST B: Explicit Assessment Request ---
    console.log('\n--- 2. Test B: Explicit Student Request Triggers Assessment ---');
    const triggerExplicit = evaluateAssessmentTrigger({
      studentMessage: 'Test me on refraction with an MCQ',
      currentMode: 'TEACHING',
      assessmentStatus: 'NONE',
      teachingState: defaultTeachingState,
      conversationHistory: [],
      teacherResponse: {
        responseText: 'Alright, let us test your understanding with a quick problem!',
        language: 'english',
        intent: 'explanation',
        teachingAction: 'assess',
        action: {
          type: 'ASK_ASSESSMENT',
          questionType: 'MCQ',
        },
      },
    });

    assert(triggerExplicit.shouldAssess === true, 'Explicit student request triggers assessment');
    assert(triggerExplicit.reason === 'student_explicit_request', 'Reason is student_explicit_request');
    assert(triggerExplicit.questionType === 'MCQ', 'Question type is inferred as MCQ');

    // --- TEST C: Guard Against Duplicate / Hijacked Questions ---
    console.log('\n--- 3. Test C: Guard Against Duplicate / Simultaneous Questions ---');
    const triggerHijackCheck = evaluateAssessmentTrigger({
      studentMessage: 'I understand reflection now',
      currentMode: 'TEACHING',
      assessmentStatus: 'NONE',
      teachingState: {
        ...defaultTeachingState,
        recommendedNextAction: 'ask_question',
      },
      conversationHistory: [],
      teacherResponse: {
        responseText: 'Great! What do you think happens when the light hits water at an angle?',
        language: 'english',
        intent: 'question',
        teachingAction: 'explain',
        action: {
          type: 'ASK_CONVERSATIONAL',
        },
      },
    });

    assert(triggerHijackCheck.shouldAssess === false, 'Teaching question is NOT hijacked into an assessment');
    assert(
      triggerHijackCheck.reason === 'conversational_question_not_assessment',
      'Trigger guard strictly protects conversational questions'
    );

    // --- TEST D: Formal Assessment Isolation Guard ---
    console.log('\n--- 4. Test D: Formal Assessment Isolation Guard ---');
    const triggerActiveGuard = evaluateAssessmentTrigger({
      studentMessage: 'Can you give me another question?',
      currentMode: 'ASSESSMENT',
      assessmentStatus: 'WAITING_FOR_STUDENT',
      teachingState: defaultTeachingState,
      conversationHistory: [{ role: 'tutor', type: 'assessment', questionId: 'q_123' }],
    });

    assert(triggerActiveGuard.shouldAssess === false, 'Active assessment strictly blocks new assessment');
    assert(triggerActiveGuard.reason === 'assessment_already_active', 'Reason is assessment_already_active');

    // --- TEST E: End-to-End Live Session — Conversational Dialogue Loop ---
    console.log('\n--- 5. Test E: End-to-End Live Session — Conversational Turn ---');
    const createRes = await fetch(`${baseUrl}/api/teaching/sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        subject: 'Physics',
        topic: 'Refraction of Light',
        language: 'english',
      }),
    });
    assert(createRes.status === 201, 'POST /api/teaching/sessions returns 201 Created');
    const createData = (await createRes.json()) as any;
    const sessionId = createData.data.id || createData.data.sessionId;

    const turn1Res = await fetch(`${baseUrl}/api/teaching/sessions/${sessionId}/respond`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: 'What is refraction and why does it happen?',
      }),
    });
    assert(turn1Res.status === 200, 'POST /sessions/:id/respond returns 200 OK');
    const turn1Data = (await turn1Res.json()) as any;

    assert(turn1Data.data.sessionContext.currentMode === 'TEACHING', 'Session remains in TEACHING mode');
    assert(
      turn1Data.data.assessmentQuestion === undefined,
      'Conversational turn has NO assessmentQuestion payload'
    );
    assert(
      turn1Data.data.tutorAction.type !== 'ASK_ASSESSMENT',
      'Tutor action is NOT ASK_ASSESSMENT'
    );

    const sessionInDb = await TeachingSessionModel.findById(sessionId);
    assert(Boolean(sessionInDb), 'Session found in database');
    const lastTutorTurn = sessionInDb?.conversationHistory.filter((t) => t.role === 'tutor').pop();
    assert(Boolean(lastTutorTurn), 'Tutor turn recorded in conversation history');
    assert(
      lastTutorTurn?.type !== 'assessment',
      'Conversational turn is NOT recorded as type="assessment"'
    );
    assert(
      lastTutorTurn?.questionId === undefined,
      'Conversational turn does not have a questionId'
    );

    // --- TEST F: End-to-End Live Session — Explicit Assessment Trigger & Coexistence ---
    console.log('\n--- 6. Test F: End-to-End Live Session — Explicit Assessment Request ---');
    const turn2Res = await fetch(`${baseUrl}/api/teaching/sessions/${sessionId}/respond`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: 'Test me on this topic with an MCQ question.',
      }),
    });
    assert(turn2Res.status === 200, 'POST /sessions/:id/respond returns 200 OK');
    const turn2Data = (await turn2Res.json()) as any;

    assert(turn2Data.data.sessionContext.currentMode === 'ASSESSMENT', 'Session transitioned to ASSESSMENT mode');
    assert(
      turn2Data.data.sessionContext.assessmentStatus === 'WAITING_FOR_STUDENT',
      'Session status is WAITING_FOR_STUDENT'
    );
    assert(
      turn2Data.data.tutorAction.type === 'ASK_ASSESSMENT',
      'Tutor action is ASK_ASSESSMENT'
    );
    assert(
      Boolean(turn2Data.data.assessmentQuestion),
      'Formal assessmentQuestion payload is returned'
    );
    assert(
      Boolean(turn2Data.data.assessmentQuestion.questionId),
      'Assessment question has a valid questionId'
    );
    assert(
      !turn2Data.data.teacherResponse.responseText.includes('Question:'),
      'Spoken text does not duplicate formal question body'
    );

    // --- TEST G: Submitting the Formal Assessment & Resuming Teaching ---
    const questionId = turn2Data.data.assessmentQuestion.questionId;
    const optionId = turn2Data.data.assessmentQuestion.options?.[0]?.id || 'opt_1';
    const submitRes = await fetch(`${baseUrl}/api/assessments/questions/${questionId}/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        questionId,
        questionType: 'MCQ',
        selectedOption: optionId,
        answer: optionId,
      }),
    });
    const submitText = await submitRes.text();
    if (submitRes.status !== 200) {
      console.error(`[Submit Failed] Status: ${submitRes.status}, Body: ${submitText}`);
    }
    assert(submitRes.status === 200, 'POST /questions/:id/submit returns 200 OK');
    const submitData = JSON.parse(submitText);
    assert(submitData.data.status === 'EVALUATED', 'Answer evaluated with status EVALUATED');
    assert(typeof submitData.data.score === 'number', 'Answer evaluated with numerical score');

    const turn3Res = await fetch(`${baseUrl}/api/teaching/sessions/${sessionId}/respond`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: 'Can you explain why that answer was correct or incorrect?',
      }),
    });
    assert(turn3Res.status === 200, 'Teaching turn after assessment returns 200 OK');
    const turn3Data = (await turn3Res.json()) as any;
    assert(
      turn3Data.data.sessionContext.currentMode === 'TEACHING',
      'Session cleanly returns to TEACHING mode after assessment submission'
    );

    console.log('\n===============================================================');
    console.log('🎉 ALL PHASE 1.5 CONVERSATIONAL VS FORMAL TESTS PASSED CLEANLY!');
    console.log('===============================================================\n');
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
  }
}

runPhase15Verification().catch((err) => {
  console.error('\n[FATAL] Phase 1.5 verification suite encountered an uncaught error:', err);
  if (server) {
    server.close();
  }
  mongoose.disconnect();
  process.exit(1);
});
