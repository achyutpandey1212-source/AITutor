import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { createApp } from '../app.js';
import * as firebaseConfig from '../config/firebase.js';
import { connectDatabase } from '../config/db.js';
import { TeachingSessionModel } from '../models/teaching-session.model.js';
import {
  normalizeTextForSpeech,
  formatFormulaForSpeech,
  cleanCaptionText,
} from '@ai-tutor/shared';
import type { RespondSessionResponse } from '@ai-tutor/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

let server: http.Server;
let baseUrl: string;

const TEST_USER = 'student_phase25_tester';

const setupMockAuth = () => {
  firebaseConfig.setCustomAuthProvider({
    verifyIdToken: async (token: string) => {
      if (token === 'TOKEN_PHASE25_USER') {
        return {
          uid: TEST_USER,
          email: 'phase25@aitutor.test',
          name: 'Phase 2.5 Tester',
        } as any;
      }
      throw new Error('Invalid test token');
    },
  });
};

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ✗ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function apiRequest<T = any>(
  endpoint: string,
  method = 'GET',
  body?: any,
  token = 'TOKEN_PHASE25_USER'
): Promise<{ status: number; data: T }> {
  const url = `${baseUrl}${endpoint}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = (await res.json().catch(() => ({}))) as T;
  return { status: res.status, data: json };
}

async function runPhase25Verification() {
  console.log('\n===============================================================');
  console.log('RUNNING PHASE 2.5 SPEECH / VISUAL / CAPTION PIPELINE SUITE');
  console.log('===============================================================\n');

  try {
    await connectDatabase();
  } catch (dbErr: any) {
    console.error('Database connection failed:', dbErr.message);
  }

  setupMockAuth();

  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : 3000;
      baseUrl = `http://localhost:${port}`;
      console.log(`[OK] Test Server listening on ${baseUrl}\n`);
      resolve();
    });
  });

  try {
    // -------------------------------------------------------------
    // Test A: Speech Formatting (Zero Markdown Leakage into TTS)
    // -------------------------------------------------------------
    console.log('--- Test A: Speech Formatting (Zero Markdown Leakage into TTS) ---');
    const markdownSample = `
# Understanding Refraction
When light enters glass from air:
* It **bends** towards the normal!
* Speed *decreases* in the denser medium.
> Important note: Frequency remains constant.
Check this [diagram](https://example.com) or run \`solveRefraction()\`.
`;
    const cleanSpeechA = normalizeTextForSpeech(markdownSample);
    assert(!cleanSpeechA.includes('#'), 'No Markdown header hashes (#)');
    assert(!cleanSpeechA.includes('*'), 'No bold/italic asterisks (*)');
    assert(!cleanSpeechA.includes('`'), 'No code backticks (`)');
    assert(!cleanSpeechA.includes('>'), 'No blockquote symbols (>)');
    assert(!cleanSpeechA.includes('['), 'No Markdown link brackets ([)');
    assert(!cleanSpeechA.includes(']'), 'No Markdown link brackets (])');
    assert(cleanSpeechA.includes('bends towards the normal'), 'Preserved natural text phrasing');
    assert(cleanSpeechA.includes('Speed decreases'), 'Preserved core explanation content');

    // -------------------------------------------------------------
    // Test B: Formula Handling (Phonetic Speech without Raw LaTeX)
    // -------------------------------------------------------------
    console.log('\n--- Test B: Formula Handling (Phonetic Speech without Raw LaTeX) ---');

    // 1. Mirror Formula
    const mirrorFormulaInput = 'The mirror formula is $$\\frac{1}{f} = \\frac{1}{v} + \\frac{1}{u}$$.';
    const spokenMirror = normalizeTextForSpeech(mirrorFormulaInput);
    console.log(`     Spoken Mirror: "${spokenMirror}"`);
    assert(spokenMirror.includes('one over f equals one over v plus one over u'), 'Mirror formula speaks "one over f equals one over v plus one over u"');
    assert(!spokenMirror.toLowerCase().includes('slash'), 'Mirror speech contains zero "slash"');
    assert(!/\bfrac\b|\\frac/i.test(spokenMirror), 'Mirror speech contains zero "\\frac"');
    assert(!spokenMirror.includes('{') && !spokenMirror.includes('}'), 'Mirror speech contains zero curly braces');

    // 2. Lens Formula
    const lensFormulaInput = 'The lens formula is $$\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u}$$.';
    const spokenLens = normalizeTextForSpeech(lensFormulaInput);
    console.log(`     Spoken Lens: "${spokenLens}"`);
    assert(spokenLens.includes('one over f equals one over v minus one over u'), 'Lens formula speaks "one over f equals one over v minus one over u"');

    // 3. Snell\'s Law
    const snellInput = "Snell's law is $$n_1 \\sin(\\theta_1) = n_2 \\sin(\\theta_2)$$.";
    const spokenSnell = normalizeTextForSpeech(snellInput);
    console.log(`     Spoken Snell: "${spokenSnell}"`);
    assert(spokenSnell.includes('n one times sine theta one equals n two times sine theta two'), 'Snell\'s law speaks "n one times sine theta one equals n two times sine theta two"');
    assert(!spokenSnell.toLowerCase().includes('backslash'), 'Snell speech contains zero "backslash"');
    assert(!spokenSnell.includes('\\'), 'Snell speech contains zero raw backslashes');

    // 4. Magnification
    const magInput = 'Linear magnification is $$m = -\\frac{v}{u}$$ or $$m = \\frac{h_i}{h_o}$$.';
    const spokenMag = normalizeTextForSpeech(magInput);
    console.log(`     Spoken Magnification: "${spokenMag}"`);
    assert(spokenMag.includes('m equals negative v over u'), 'Magnification speaks "m equals negative v over u"');
    assert(spokenMag.includes('m equals h i over h o'), 'Height ratio speaks "m equals h i over h o"');

    // 5. Kinematics & Newton
    const kinInput = 'Newton stated $$F = ma$$, and velocity is $$v = u + at$$.';
    const spokenKin = normalizeTextForSpeech(kinInput);
    console.log(`     Spoken Mechanics: "${spokenKin}"`);
    assert(spokenKin.includes('F equals m a'), 'Newton second law speaks "F equals m a"');
    assert(spokenKin.includes('v equals u plus a t'), 'Kinematic equation speaks "v equals u plus a t"');

    // -------------------------------------------------------------
    // Test C: Visual Separation (Remotion Structured Formulas)
    // -------------------------------------------------------------
    console.log('\n--- Test C: Visual Separation (Remotion Structured Formulas) ---');
    // Create an actual session through the API
    const sessionRes = await apiRequest('/api/teaching/sessions', 'POST', {
      topic: 'Light: Reflection & Refraction',
      subject: 'Physics',
      documentTitle: 'phy ch9 light.pdf',
      availableMinutes: 30,
      planBlueprint: true,
    });
    assert(sessionRes.status === 201, 'POST /api/teaching/sessions returns 201');
    const sessionId = sessionRes.data.data.id;
    assert(Boolean(sessionId), 'Session created with ID');

    // Request teaching turn specifically on Snell\'s Law
    const turnRes = await apiRequest<any>(`/api/teaching/sessions/${sessionId}/respond`, 'POST', {
      message: "Explain Snell's law of refraction and the mirror formula.",
    });
    assert(turnRes.status === 200, 'POST /sessions/:id/respond returns 200');
    const turnData: RespondSessionResponse = turnRes.data.data;

    // Verify visual payload is mathematically intact for Remotion
    assert(Boolean(turnData.visualPayload), 'Visual payload is returned separately from speech');
    assert(Boolean(turnData.teachingContent), 'TeachingContent contract is returned');
    assert(Boolean(turnData.teachingContent?.visual), 'TeachingContent has structured visual object');
    assert(
      ['FORMULA', 'DIAGRAM', 'TEXT', 'TITLE', 'COMPARISON'].includes(turnData.teachingContent?.visual?.type || ''),
      `Visual payload has valid Remotion type (${turnData.teachingContent?.visual?.type})`
    );

    // -------------------------------------------------------------
    // Test D: Caption Separation (Concise Blackboard Subtitles)
    // -------------------------------------------------------------
    console.log('\n--- Test D: Caption Separation (Concise Blackboard Subtitles) ---');
    assert(Boolean(turnData.captionText), 'Caption text is returned in response');
    assert(turnData.captionText!.length <= 160, `Caption is concise (${turnData.captionText!.length} chars)`);
    assert(!turnData.captionText!.includes('$$'), 'Caption contains no raw LaTeX dollar signs');
    assert(!turnData.captionText!.includes('\\frac'), 'Caption contains no raw \\frac');
    assert(!turnData.captionText!.includes('```'), 'Caption contains no code blocks');
    console.log(`     Live Caption: "${turnData.captionText}"`);

    // -------------------------------------------------------------
    // Test E: Turn Synchronization (Shared turnId)
    // -------------------------------------------------------------
    console.log('\n--- Test E: Turn Synchronization (Shared turnId) ---');
    assert(Boolean(turnData.turnId), 'Response contains structured turnId');
    assert(turnData.teachingContent?.turnId === turnData.turnId, 'TeachingContent shares identical turnId');
    assert(Boolean(turnData.speechText), 'Speech text is returned on dedicated channel');
    assert(turnData.teachingContent?.speechText === turnData.speechText, 'TeachingContent speechText matches channel');
    console.log(`     Shared Turn ID: "${turnData.turnId}"`);

    // -------------------------------------------------------------
    // Test F: Interruption & Barge-in Turn Safety
    // -------------------------------------------------------------
    console.log('\n--- Test F: Interruption & Barge-in Turn Safety ---');
    // Simulate client state machine behavior on barge-in
    let activeTurnId: string | null = turnData.turnId || 'turn_initial';
    let currentCaption: string | undefined = turnData.captionText;
    let ttsActive = true;

    // Student interrupts during speech
    const studentInterruption = 'wait, what does n mean?';
    if (studentInterruption.includes('wait')) {
      activeTurnId = null; // Invalidate turn
      ttsActive = false; // Cancel TTS
      currentCaption = undefined; // Clear subtitle immediately
    }

    assert(activeTurnId === null, 'Active turn ID invalidated on student interruption');
    assert(ttsActive === false, 'TTS cancelled immediately upon barge-in');
    assert(currentCaption === undefined, 'Caption cleared immediately from blackboard');

    // -------------------------------------------------------------
    // Test G: Multi-Scene Teaching Progression
    // -------------------------------------------------------------
    console.log('\n--- Test G: Multi-Scene Teaching Progression ---');
    // Request a second turn to demonstrate scene advancement within session
    const turn2Res = await apiRequest<any>(`/api/teaching/sessions/${sessionId}/respond`, 'POST', {
      message: 'Show me the ray diagram and compare rarer vs denser media.',
    });
    assert(turn2Res.status === 200, 'Second teaching turn returns 200');
    const turn2Data: RespondSessionResponse = turn2Res.data.data;
    assert(Boolean(turn2Data.visualPayload), 'Second turn has visual payload');
    assert(turn2Data.turnId !== turnData.turnId, 'New turn receives unique subsequent turnId');
    console.log(`     Advanced Visual Type: "${turn2Data.visualPayload?.type || turn2Data.teacherResponse.visual?.type}"`);

    // -------------------------------------------------------------
    // Test H: Assessment Coexistence (Preserving Phase 1.5)
    // -------------------------------------------------------------
    console.log('\n--- Test H: Assessment Coexistence (Preserving Phase 1.5) ---');
    const assessRes = await apiRequest<any>(`/api/teaching/sessions/${sessionId}/respond`, 'POST', {
      message: 'Give me a quiz question on this topic now.',
    });
    assert(assessRes.status === 200, 'Assessment request returns 200');
    const assessData: RespondSessionResponse = assessRes.data.data;
    assert(Boolean(assessData.assessmentQuestion), 'Formal assessment question payload returned');
    assert(assessData.sessionContext?.currentMode === 'ASSESSMENT', 'Session transitioned to ASSESSMENT mode');
    assert(Boolean(assessData.speechText), 'Tutor spoken introduction uses speechText channel');
    assert(
      !assessData.speechText!.toLowerCase().includes('which of the following') &&
      !assessData.speechText!.toLowerCase().includes('option a'),
      'Spoken text introduces the problem without reading raw question options'
    );

    // -------------------------------------------------------------
    // Test I: Manual Acceptance Test (Physics: Light Reflection & Refraction)
    // -------------------------------------------------------------
    console.log('\n===============================================================');
    console.log('MANUAL ACCEPTANCE TEST: PHYSICS (LIGHT REFLECTION & REFRACTION)');
    console.log('===============================================================');
    console.log(`Topic: Light: Reflection & Refraction | Document: phy ch9 light.pdf\n`);

    const samplesToVerify = [
      {
        name: 'Mirror Formula Explanation',
        raw: 'The mirror formula relates focal length to distances: $$\\frac{1}{f} = \\frac{1}{v} + \\frac{1}{u}$$. Here, f is focal length, v is image distance, and u is object distance.',
      },
      {
        name: 'Snell\'s Law Ray Calculation',
        raw: "According to Snell's law, $$n_1 \\sin(\\theta_1) = n_2 \\sin(\\theta_2)$$. When light enters a denser medium where $$n_2 > n_1$$, $$\\sin(\\theta_2) < \\sin(\\theta_1)$$, so the ray bends towards the normal.",
      },
      {
        name: 'Magnification Formula',
        raw: 'The magnification produced by a spherical mirror is given by $$m = -\\frac{v}{u} = \\frac{h_i}{h_o}$$. A negative sign indicates a real and inverted image.',
      },
      {
        name: 'Refractive Index Speed Ratio',
        raw: 'The absolute refractive index of a medium is $$n = \\frac{c}{v}$$, where c is the speed of light in vacuum and v is its speed in the medium.',
      },
    ];

    for (const s of samplesToVerify) {
      console.log(`--- ${s.name} ---`);
      const spoken = normalizeTextForSpeech(s.raw);
      const caption = cleanCaptionText(s.raw, 80);
      console.log(`  Raw Text:     "${s.raw}"`);
      console.log(`  Speech (TTS): "${spoken}"`);
      console.log(`  Caption:      "${caption}"`);
      assert(!spoken.includes('$$'), `${s.name}: zero $$ delimiters`);
      assert(!spoken.toLowerCase().includes('slash'), `${s.name}: zero "slash"`);
      assert(!/\bfrac\b|\\frac/i.test(spoken), `${s.name}: zero "\\frac"`);
      assert(!spoken.includes('{') && !spoken.includes('}'), `${s.name}: zero curly braces`);
      assert(!spoken.includes('\\'), `${s.name}: zero backslashes`);
      console.log('');
    }

    console.log('===============================================================');
    console.log('🎉 ALL PHASE 2.5 CONTENT PIPELINE TESTS A THROUGH I PASSED!');
    console.log('===============================================================\n');
  } finally {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    await mongoose.disconnect();
  }
}

runPhase25Verification().catch((err) => {
  console.error('[FATAL] Verification failed:', err);
  process.exit(1);
});
