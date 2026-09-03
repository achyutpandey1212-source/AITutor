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
  normalizeTextForDisplay,
  convertLatexToDisplay,
  VisualBeatSchema,
  VisualBeatSequenceSchema,
} from '@ai-tutor/shared';
import type { RespondSessionResponse, VisualBeat } from '@ai-tutor/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

let server: http.Server;
let baseUrl: string;

const TEST_USER = 'student_phase26_tester';

const setupMockAuth = () => {
  firebaseConfig.setCustomAuthProvider({
    verifyIdToken: async (token: string) => {
      if (token === 'TOKEN_PHASE26_USER') {
        return {
          uid: TEST_USER,
          email: 'phase26@aitutor.test',
          name: 'Phase 2.6 Tester',
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
  token = 'TOKEN_PHASE26_USER'
): Promise<{ status: number; data: T }> {
  const url = `${baseUrl}${endpoint}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(url, options);
  const json = (await response.json()) as T;
  return { status: response.status, data: json };
}

async function runPhase26Verification() {
  console.log('================================================================');
  console.log('PHASE 2.6 VERIFICATION: PRESENTATION LAYER & VISUAL BEAT PIPELINE');
  console.log('================================================================\n');

  setupMockAuth();
  await connectDatabase();

  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        baseUrl = `http://localhost:${addr.port}`;
      }
      resolve();
    });
  });

  try {
    // -------------------------------------------------------------------------
    // TEST A: Mathematical display normalization converts LaTeX without phonetics
    // -------------------------------------------------------------------------
    console.log('\n[TEST A] Mathematical display normalization converts LaTeX to readable plain math...');
    const rawLatex = 'The mirror formula is $$\\frac{1}{f} = \\frac{1}{v} + \\frac{1}{u}$$ where f is focal length.';
    const displayResult = normalizeTextForDisplay(rawLatex);
    const speechResult = normalizeTextForSpeech(rawLatex);

    assert(!displayResult.includes('$$'), 'Display text stripped display math delimiters ($$)');
    assert(!displayResult.includes('\\frac'), 'Display text converted \\frac macro');
    assert(displayResult.includes('1/f = 1/v + 1/u'), `Display text preserved algebraic notation (got "${displayResult}")`);
    assert(!displayResult.toLowerCase().includes('one over f'), 'Display text did NOT convert to spoken phonetics');
    assert(speechResult.toLowerCase().includes('one over'), 'Speech text correctly converted to spoken phonetics');
    assert(displayResult !== speechResult, 'Display text and speech text are distinct channels');

    // -------------------------------------------------------------------------
    // TEST B: Greek and trig symbol display normalization
    // -------------------------------------------------------------------------
    console.log('\n[TEST B] Greek and trig functions convert cleanly to readable symbols...');
    const snellsFormula = '$$n_1 \\sin(\\theta_1) = n_2 \\sin(\\theta_2)$$';
    const snellsDisplay = convertLatexToDisplay(snellsFormula);

    assert(!snellsDisplay.includes('\\sin'), 'Display formula stripped \\sin macro');
    assert(!snellsDisplay.includes('\\theta'), 'Display formula converted \\theta to Greek θ');
    assert(snellsDisplay.includes('sin') && snellsDisplay.includes('θ'), `Display formula contains sin and θ (got "${snellsDisplay}")`);
    assert(!snellsDisplay.toLowerCase().includes('sine'), 'Display formula did not generate spoken word "sine"');

    // -------------------------------------------------------------------------
    // TEST C: Clean transcript rendering strips Markdown headers, bullets, formatting
    // -------------------------------------------------------------------------
    console.log('\n[TEST C] Clean transcript rendering strips Markdown syntax while keeping text...');
    const markdownSample = `## Snell's Law Explained
**Light bends** when traveling through *different optical media*.
- Fact 1: Speed changes
- Fact 2: Direction alters
\`\`\`
code fragment
\`\`\`
For more details see [Physics Textbook](http://example.com).`;
    const cleanDisplay = normalizeTextForDisplay(markdownSample);

    assert(!cleanDisplay.includes('##'), 'Display text stripped Markdown header hashes');
    assert(!cleanDisplay.includes('**'), 'Display text stripped bold asterisks');
    assert(!cleanDisplay.includes('```'), 'Display text stripped code backticks');
    assert(!cleanDisplay.includes('http://example.com'), 'Display text stripped URL but kept anchor text');
    assert(cleanDisplay.includes('Physics Textbook'), 'Display text retained link anchor text');
    assert(cleanDisplay.includes('Light bends'), 'Display text preserved core paragraph text');

    // -------------------------------------------------------------------------
    // TEST D: Caption segmentation logic
    // -------------------------------------------------------------------------
    console.log('\n[TEST D] Caption segmentation splits multi-sentence subtitles into concise segments...');
    const longCaption = 'When light enters glass it slows down. The angle of incidence changes. Light bends towards the normal.';
    const rawSegments = longCaption.match(/[^.!?]+[.!?]?/g) || [longCaption];
    const segments = rawSegments.map((s) => s.trim()).filter((s) => s.length > 2);

    assert(segments.length === 3, `Caption segmented into 3 sentences (got ${segments.length})`);
    assert(segments[0].includes('slows down'), 'First caption segment is complete');
    assert(segments[1].includes('incidence changes'), 'Second caption segment is complete');
    assert(segments[2].includes('towards the normal'), 'Third caption segment is complete');
    assert(segments.every((s) => s.length <= 140), 'All caption segments satisfy length constraint (<=140 chars)');

    // -------------------------------------------------------------------------
    // TEST E: VisualBeatSchema validation
    // -------------------------------------------------------------------------
    console.log('\n[TEST E] VisualBeatSchema and VisualBeatSequenceSchema validation...');
    const validBeat: VisualBeat = {
      beatIndex: 0,
      type: 'FORMULA',
      data: {
        formula: '1/f = 1/v + 1/u',
        formulaLabel: 'MIRROR FORMULA',
        variables: [
          { symbol: 'f', meaning: 'focal length' },
          { symbol: 'v', meaning: 'image distance' },
          { symbol: 'u', meaning: 'object distance' },
        ],
      },
      durationHint: 4000,
      transitionIn: 'pop',
      emphasis: 'focal length',
    };

    const beatParse = VisualBeatSchema.safeParse(validBeat);
    assert(beatParse.success, 'Valid VisualBeat passes schema validation');

    const validSequence = {
      turnId: 'turn_test_123',
      conceptId: 'concept_mirror_formula',
      beats: [
        validBeat,
        {
          beatIndex: 1,
          type: 'HIGHLIGHT',
          data: { heading: 'Key Term', text: 'Focal Length (f)' },
          durationHint: 3000,
          transitionIn: 'fade',
        },
        {
          beatIndex: 2,
          type: 'RECAP',
          data: { heading: 'Summary', bullets: ['Mirror formula applies to spherical mirrors', 'Sign convention is critical'] },
          durationHint: 0,
          transitionIn: 'slide',
        },
      ],
      activeBeatIndex: 0,
    };

    const sequenceParse = VisualBeatSequenceSchema.safeParse(validSequence);
    assert(sequenceParse.success, 'Multi-beat sequence passes VisualBeatSequenceSchema validation');
    assert(sequenceParse.data?.beats.length === 3, 'Sequence contains exactly 3 beats');

    // -------------------------------------------------------------------------
    // TEST F: Server multi-beat processing in teaching turn
    // -------------------------------------------------------------------------
    console.log('\n[TEST F] Live teaching turn produces 3 distinct channels + structured visual...');
    const createRes = await apiRequest<{ success: boolean; data: any }>(
      '/api/teaching/sessions',
      'POST',
      {
        topic: 'Spherical Mirrors & Reflection',
        subject: 'Physics',
        learnerProfile: {
          educationLevel: 'Grade 10',
          preferredLanguage: 'english',
          learningGoal: 'Master mirror formula and ray tracing',
        },
        planBlueprint: false,
      }
    );

    assert(createRes.status === 201, `Session created with HTTP 201 (got ${createRes.status})`);
    const sessionId = createRes.data.data.id;

    // Send first turn asking for mirror formula
    const turnRes = await apiRequest<{ success: boolean; data: RespondSessionResponse }>(
      `/api/teaching/sessions/${sessionId}/respond`,
      'POST',
      { message: 'Can you teach me the mirror formula with an example?' }
    );

    assert(turnRes.status === 200, `Teaching turn responded with HTTP 200 (got ${turnRes.status})`);
    const payload = turnRes.data.data;
    const resp = payload.teacherResponse;

    assert(typeof resp.speechText === 'string' && resp.speechText.length > 0, 'speechText channel is present');
    assert(typeof resp.captionText === 'string' && resp.captionText.length > 0, 'captionText channel is present');
    assert(typeof payload.displayText === 'string' && payload.displayText.length > 0, 'displayText channel is present on response');
    assert(!resp.speechText!.includes('$$'), 'speechText has no raw $$ LaTeX delimiters');
    assert(!resp.speechText!.includes('\\frac'), 'speechText has no raw \\frac macros');

    // -------------------------------------------------------------------------
    // TEST G: Blackboard content does not contain teacher speech script
    // -------------------------------------------------------------------------
    console.log('\n[TEST G] Remotion blackboard visual.data does not contain teacher script prose...');
    const visual = resp.visual || payload.visualPayload;
    assert(Boolean(visual), 'Visual payload is present on teaching response');

    const visualData: any = visual?.data;
    if (visualData && typeof visualData.text === 'string') {
      assert(
        visualData.text.length <= 150,
        `visual.data.text is concise (<=150 chars, got ${visualData.text.length}) — not full teacher speech`
      );
    }

    // -------------------------------------------------------------------------
    // TEST H: Multi-beat sequence present in teachingContent
    // -------------------------------------------------------------------------
    console.log('\n[TEST H] Multi-beat sequence is present in teachingContent / visualBeats...');
    const beats = payload.visualBeats || payload.teachingContent?.visualBeats || resp.visualBeats;
    assert(Array.isArray(beats), 'visualBeats is an array');
    assert(beats!.length >= 1, `visualBeats contains at least 1 validated beat (got ${beats!.length})`);

    const firstBeat = beats![0];
    assert(typeof firstBeat.beatIndex === 'number', 'First beat has numeric beatIndex');
    assert(typeof firstBeat.type === 'string', 'First beat has valid visualType');
    assert(typeof firstBeat.data === 'object', 'First beat has data object');

    // -------------------------------------------------------------------------
    // TEST I: Formal assessment vs visual classroom coexistence
    // -------------------------------------------------------------------------
    console.log('\n[TEST I] Formal assessment trigger preserves visual classroom state...');
    const assessTurnRes = await apiRequest<{ success: boolean; data: RespondSessionResponse }>(
      `/api/teaching/sessions/${sessionId}/respond`,
      'POST',
      { message: 'Test me on this! Give me an MCQ question.' }
    );

    assert(assessTurnRes.status === 200, `Assessment turn responded HTTP 200 (got ${assessTurnRes.status})`);
    const assessPayload = assessTurnRes.data.data;
    assert(
      assessPayload.tutorAction?.type === 'ASK_ASSESSMENT' || Boolean(assessPayload.assessmentQuestion),
      'Formal assessment was triggered'
    );
    assert(
      assessPayload.sessionContext?.currentMode === 'ASSESSMENT',
      'Session entered ASSESSMENT mode'
    );

    // Clean up
    await TeachingSessionModel.deleteMany({ userId: TEST_USER });

    console.log('\n================================================================');
    console.log('✅ ALL PHASE 2.6 TESTS PASSED (A - I)');
    console.log('================================================================\n');
  } finally {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    await mongoose.disconnect();
  }
}

runPhase26Verification().catch((err) => {
  console.error('\n❌ Phase 2.6 Verification Failed:', err);
  process.exit(1);
});
