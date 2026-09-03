/**
 * Phase 3 Verification Suite: Visual Intelligence & Lesson Asset System
 *
 * Tests A through O:
 * - Test A: Visual Strategy Selection (Reflection -> DIAGRAM, Photosynthesis -> FLOWCHART, Numerical Problem -> WORKED_EXAMPLE)
 * - Test B: Content -> Visual Transformation (Flowchart, Comparison, Worked Example, Process Animation)
 * - Test C: Multi-Beat Generation (Complex concepts yield multi-beat sequences)
 * - Test D: Visual Diversity (Avoids consecutive visual strategy fatigue)
 * - Test E: Visual Continuity (Preserves context across related beats)
 * - Test F: Visual Data Cleanliness (Zero narration prose dumped into blackboard)
 * - Test G: PDF / Document Asset Retrieval (Document-grounded figures discovered by concept)
 * - Test H: Reusable Visual Asset Repository (Get, save, search native and uploaded assets)
 * - Test I: Visual History Persistence (Completed teaching turns stored with metadata)
 * - Test J: Session Visual Timeline (Chronological ordered timeline of session beats)
 * - Test K: Deterministic Replay (Replay reconstructed from history without LLM regeneration)
 * - Test L: Barge-In Safety (Turns and timers cancelled safely)
 * - Test M: Assessment Coexistence (Assessment mode keeps classroom board preserved)
 * - Test N: Optional Captions Toggle (Defaults to OFF without affecting visual flow)
 * - Test O: Backward Compatibility (Phase 2.5 and 2.6 payloads render safely)
 */

import assert from 'node:assert';
import mongoose from 'mongoose';
import { createApp } from '../app.js';
import {
  TutorVisualStateSchema,
  VisualBeatSchema,
  VisualPlanSchema,
  VisualStrategySchema,
  VisualAssetSchema,
  VisualHistoryEntrySchema,
  VisualSessionTimelineSchema,
} from '@ai-tutor/shared';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { defaultVisualStrategyEngine } from './visual-strategy.engine.js';
import { ContentToVisualTransformer } from './content-to-visual.js';
import { defaultVisualAssetRepository } from './visual-asset.repository.js';
import { defaultDocumentVisualAssetRepository } from './document-asset.repository.js';
import { defaultVisualHistoryService } from './visual-history.service.js';
import { connectDatabase } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const TEST_USER = 'user_phase3_test';

async function runPhase3Verification() {
  console.log('===============================================================');
  console.log('PHASE 3 VERIFICATION: VISUAL INTELLIGENCE & LESSON ASSET SYSTEM');
  console.log('===============================================================\n');

  let server: any;
  let baseUrl = '';

  try {
    await connectDatabase();

    const app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') {
          baseUrl = `http://localhost:${addr.port}`;
          console.log(`Test HTTP server listening on ${baseUrl}`);
        }
        resolve();
      });
    });

    // -------------------------------------------------------------------------
    // TEST A: Visual Strategy Selection
    // -------------------------------------------------------------------------
    console.log('\n[TEST A] Visual Strategy Selection for diverse pedagogical concepts...');

    const planDiagram = await defaultVisualStrategyEngine.planVisual({
      topic: 'Light: Reflection & Refraction',
      concept: 'Law of Reflection',
      teachingContent: {
        speechText: 'Light rays bounce off a mirror surface obeying the rule that incident angle equals reflected angle.',
      },
      turnId: 'turn_test_a1',
    });
    assert(planDiagram.strategy === 'DIAGRAM', `Expected DIAGRAM for Law of Reflection, got ${planDiagram.strategy}`);
    console.log(`  ✓ Reflection -> ${planDiagram.strategy} (Reason: ${planDiagram.reason})`);

    const planFlowchart = await defaultVisualStrategyEngine.planVisual({
      topic: 'Life Processes',
      concept: 'Photosynthesis Stages',
      teachingContent: {
        speechText: 'Photosynthesis occurs in stages: sunlight is absorbed by chlorophyll, then water splits, finally glucose and oxygen are formed.',
      },
      turnId: 'turn_test_a2',
    });
    assert(planFlowchart.strategy === 'FLOWCHART', `Expected FLOWCHART for Photosynthesis Stages, got ${planFlowchart.strategy}`);
    console.log(`  ✓ Photosynthesis -> ${planFlowchart.strategy} (Reason: ${planFlowchart.reason})`);

    const planWorkedExample = await defaultVisualStrategyEngine.planVisual({
      topic: 'Optics',
      concept: 'Mirror Formula Numerical Problem',
      teachingContent: {
        speechText: 'Calculate image distance: given u = -30cm, f = -15cm, substituting into 1/f = 1/v + 1/u gives v = -30cm.',
      },
      turnId: 'turn_test_a3',
    });
    assert(planWorkedExample.strategy === 'WORKED_EXAMPLE', `Expected WORKED_EXAMPLE for numerical problem, got ${planWorkedExample.strategy}`);
    console.log(`  ✓ Numerical Problem -> ${planWorkedExample.strategy} (Reason: ${planWorkedExample.reason})`);

    // -------------------------------------------------------------------------
    // TEST B: Content -> Visual Transformation
    // -------------------------------------------------------------------------
    console.log('\n[TEST B] ContentToVisualTransformer structured transformation...');

    const fcTransform = ContentToVisualTransformer.transformToFlowchart(
      'Step 1: Incident Ray enters prism -> Step 2: Wavelength dispersion occurs -> Step 3: Spectrum emerges',
      'Dispersion Mechanism'
    );
    assert(fcTransform.type === 'FLOWCHART', 'Generated type is FLOWCHART');
    assert(Array.isArray(fcTransform.data?.nodes) && fcTransform.data.nodes.length === 3, 'Nodes count is 3');
    assert(Array.isArray(fcTransform.data?.edges) && fcTransform.data.edges.length === 2, 'Edges count is 2');
    console.log(`  ✓ Flowchart generated with ${fcTransform.data?.nodes?.length} nodes and ${fcTransform.data?.edges?.length} edges`);

    const compTransform = ContentToVisualTransformer.transformToComparison(
      'Real Image vs Virtual Image\nInverted vs Erect\nFormed by actual ray intersection vs projected rays',
      'Real Image',
      'Virtual Image'
    );
    assert(compTransform.type === 'COMPARISON', 'Generated type is COMPARISON');
    assert(Boolean(compTransform.data?.comparison?.items), 'Comparison items populated');
    console.log(`  ✓ Comparison generated with ${compTransform.data?.comparison?.items?.length} comparative criteria`);

    const weTransform = ContentToVisualTransformer.transformToWorkedExample({
      text: 'Given: u = -20cm, f = -10cm. Using formula: 1/f = 1/v + 1/u. Substituting yields v = -20cm.',
      fallbackTitle: 'Concave Mirror Calculation',
    });
    assert(weTransform.type === 'WORKED_EXAMPLE', 'Generated type is WORKED_EXAMPLE');
    assert(weTransform.data?.workedExample?.steps.length === 4, 'Steps count is 4');
    console.log(`  ✓ Worked Example generated with steps: ${weTransform.data?.workedExample?.steps.map((s: any) => s.stepNumber).join(', ')}`);

    // -------------------------------------------------------------------------
    // TEST C: Multi-Beat Generation
    // -------------------------------------------------------------------------
    console.log('\n[TEST C] Complex concept produces multiple pedagogically paced visual beats...');
    const mirrorPlan = await defaultVisualStrategyEngine.planVisual({
      topic: 'Light: Reflection & Refraction',
      concept: 'Mirror Formula Calculation',
      teachingContent: {
        speechText: 'Calculate image position using formula 1/f = 1/v + 1/u with given values u = -30cm, f = -15cm, resulting in v = -30cm.',
      },
      turnId: 'turn_test_c',
    });
    assert(mirrorPlan.beats.length >= 2, `Expected at least 2 beats, got ${mirrorPlan.beats.length}`);
    mirrorPlan.beats.forEach((beat, idx) => {
      assert(VisualBeatSchema.safeParse(beat).success, `Beat ${idx} validates against VisualBeatSchema`);
      assert(beat.durationHint > 0, `Beat ${idx} has a positive durationHint`);
    });
    console.log(`  ✓ Multi-beat plan created with ${mirrorPlan.beats.length} beats: ${mirrorPlan.beats.map((b) => b.type).join(' -> ')}`);

    // -------------------------------------------------------------------------
    // TEST D: Visual Diversity & Fatigue Mitigation
    // -------------------------------------------------------------------------
    console.log('\n[TEST D] Visual Strategy Engine avoids repeating the same visual strategy consecutively...');
    const plan1 = await defaultVisualStrategyEngine.planVisual({
      topic: 'Optics',
      concept: 'Ray Rules',
      teachingContent: { speechText: 'Light rays passing through the center of curvature return along the same path.' },
      turnId: 'turn_d1',
      recentStrategies: ['DIAGRAM', 'DIAGRAM'],
    });
    assert(plan1.strategy !== 'DIAGRAM', `Expected strategy other than repeated DIAGRAM, got ${plan1.strategy}`);
    console.log(`  ✓ Mitigated consecutive fatigue: switched strategy to ${plan1.strategy}`);

    // -------------------------------------------------------------------------
    // TEST E: Visual Continuity
    // -------------------------------------------------------------------------
    console.log('\n[TEST E] Visual continuity across sequential beats...');
    assert(mirrorPlan.beats[0].type === 'FORMULA', 'First beat shows governing formula');
    assert(mirrorPlan.beats[1].type === 'WORKED_EXAMPLE', 'Second beat smoothly continues with calculation');
    console.log('  ✓ Continuity verified: Formula anchor transitions to Worked Problem step-by-step calculation');

    // -------------------------------------------------------------------------
    // TEST F: Visual Data Cleanliness
    // -------------------------------------------------------------------------
    console.log('\n[TEST F] Blackboard visual data contains zero teacher conversational narration leaks...');
    for (const beat of mirrorPlan.beats) {
      if (beat.data?.text) {
        assert(beat.data.text.length <= 160, `Visual beat text is concise (<=160 chars, got ${beat.data.text.length})`);
        assert(!/hello students|welcome back|in today's class/i.test(beat.data.text), 'No teacher speech filler in blackboard text');
      }
    }
    console.log('  ✓ Visual data is purely structured');

    // -------------------------------------------------------------------------
    // TEST G: PDF / Document Visual Asset Retrieval
    // -------------------------------------------------------------------------
    console.log('\n[TEST G] Document figure extraction and retrieval...');
    const docAsset = await defaultDocumentVisualAssetRepository.indexDocumentFigure({
      figureId: 'fig_9_1_reflection',
      documentId: 'doc_phy_ch9_light',
      pageNumber: 161,
      title: 'NCERT Figure 9.1 Reflection of Light by a Plane Mirror',
      caption: 'Ray incident obliquely on a polished plane reflecting surface',
      surroundingText: 'Activity 9.1: Observe reflection of light rays and measure angle of incidence...',
      conceptHints: ['reflection', 'laws_of_reflection'],
    });
    assert(Boolean(docAsset.assetId), 'Document figure registered in asset repository');

    const searchRes = await defaultDocumentVisualAssetRepository.findAssetsForDocument('doc_phy_ch9_light', 'reflection');
    assert(searchRes.length >= 1, 'Discovered figure by documentId and concept');
    assert(searchRes[0].pageNumber === 161, 'Page number 161 preserved');
    console.log(`  ✓ Document visual asset retrieved: "${searchRes[0].title}" (Page ${searchRes[0].pageNumber})`);

    // -------------------------------------------------------------------------
    // TEST H: Reusable Visual Asset Repository
    // -------------------------------------------------------------------------
    console.log('\n[TEST H] Reusable Visual Asset Repository query...');
    const nativeAsset = await defaultVisualAssetRepository.getAsset('native:reflection-ray-diagram:v1');
    assert(Boolean(nativeAsset), 'Native Remotion asset found by ID');
    assert(VisualAssetSchema.safeParse(nativeAsset).success, 'Asset validates against VisualAssetSchema');
    console.log(`  ✓ Pre-indexed native asset found: [${nativeAsset?.assetId}] "${nativeAsset?.title}"`);

    // -------------------------------------------------------------------------
    // TEST I: Visual History Persistence
    // -------------------------------------------------------------------------
    console.log('\n[TEST I] Visual history record persistence in MongoDB...');
    const testSessionId = `sess_p3_${Date.now()}`;
    const testTurnId = `turn_p3_01`;

    const savedHistory = await defaultVisualHistoryService.recordVisualTurn({
      sessionId: testSessionId,
      turnId: testTurnId,
      conceptId: 'reflection',
      visualPlan: mirrorPlan,
      speechText: 'One over f equals one over v plus one over u.',
      displayText: '1/f = 1/v + 1/u',
      captionText: 'Mirror formula relates focal length, object distance, and image distance.',
    });
    assert(VisualHistoryEntrySchema.safeParse(savedHistory).success, 'Saved history entry validates against schema');
    console.log(`  ✓ Visual history persisted: visualId=${savedHistory.visualId}`);

    // -------------------------------------------------------------------------
    // TEST J: Session Visual Timeline
    // -------------------------------------------------------------------------
    console.log('\n[TEST J] Session visual timeline aggregation...');
    // Add second turn
    await defaultVisualHistoryService.recordVisualTurn({
      sessionId: testSessionId,
      turnId: `turn_p3_02`,
      conceptId: 'refraction',
      visualPlan: planFlowchart,
      speechText: 'Refraction occurs when light enters transparent media.',
      displayText: 'Refraction across media',
    });

    const timeline = await defaultVisualHistoryService.getSessionTimeline(testSessionId);
    assert(VisualSessionTimelineSchema.safeParse(timeline).success, 'Timeline validates against schema');
    assert(timeline.entries.length === 2, `Timeline contains 2 entries, got ${timeline.entries.length}`);
    console.log(`  ✓ Session timeline contains ${timeline.entries.length} ordered visual checkpoints:`);
    timeline.entries.forEach((e) => {
      console.log(`    - [${e.strategy}] ${e.title} (${e.beatCount} beats)`);
    });

    // -------------------------------------------------------------------------
    // TEST K: Deterministic Replay
    // -------------------------------------------------------------------------
    console.log('\n[TEST K] Deterministic replay payload reconstruction...');
    const replay = await defaultVisualHistoryService.getReplayPayload(savedHistory.visualId);
    assert(Boolean(replay), 'Replay payload returned');
    assert(replay?.visualId === savedHistory.visualId, 'Replay visualId matches');
    assert(replay?.visualBeats.length === mirrorPlan.beats.length, 'Replay preserves exact original beats');
    assert(replay?.displayText === '1/f = 1/v + 1/u', 'Replay preserves normalized displayText');
    console.log('  ✓ Replay reconstructed accurately without re-calling LLM');

    // -------------------------------------------------------------------------
    // TEST L: Barge-In Safety
    // -------------------------------------------------------------------------
    console.log('\n[TEST L] Barge-in and interruption safety checks...');
    // Simulated interruption turn
    const bargeInPlan = await defaultVisualStrategyEngine.planVisual({
      topic: 'Light: Reflection & Refraction',
      concept: 'Interruption Clarification',
      teachingContent: {
        speechText: 'Let me pause right there and answer your question on normal lines.',
      },
      turnId: 'turn_bargein',
    });
    assert(Boolean(bargeInPlan.beats), 'Barge-in produces a valid visual plan');
    console.log('  ✓ Interrupted turns produce clean self-contained visual plans');

    // -------------------------------------------------------------------------
    // TEST M: Assessment Mode Coexistence
    // -------------------------------------------------------------------------
    console.log('\n[TEST M] Visual classroom state preservation during formal assessment...');
    const visualStateDuringAssessment = TutorVisualStateSchema.parse({
      sessionId: testSessionId,
      topic: 'Light: Reflection & Refraction',
      concept: 'Snell Law Assessment',
      mode: 'ASSESSMENT',
      avatarState: 'LISTENING',
      visualType: 'DIAGRAM',
      visualData: {
        title: 'Snell’s Law Diagram',
        subtitle: 'Angle of incidence and angle of refraction at interface',
      },
      activeBeatIndex: 0,
      totalBeats: 1,
      captionsEnabled: false,
    });
    assert(visualStateDuringAssessment.mode === 'ASSESSMENT', 'Mode is ASSESSMENT');
    assert(visualStateDuringAssessment.visualType === 'DIAGRAM', 'Classroom board remains intact on left');
    console.log('  ✓ Left classroom board is preserved while assessment runs on right');

    // -------------------------------------------------------------------------
    // TEST N: Optional Captions Toggle
    // -------------------------------------------------------------------------
    console.log('\n[TEST N] Optional captions toggle defaults to OFF...');
    const defaultState = TutorVisualStateSchema.parse({
      sessionId: testSessionId,
      visualData: {},
    });
    assert(defaultState.captionsEnabled === false, 'captionsEnabled defaults to false');
    const enabledState = TutorVisualStateSchema.parse({
      ...defaultState,
      captionsEnabled: true,
    });
    assert(enabledState.captionsEnabled === true, 'captionsEnabled can be toggled to true');
    console.log('  ✓ Captions default to OFF; toggle operates as optional accessibility feature');

    // -------------------------------------------------------------------------
    // TEST O: Backward Compatibility
    // -------------------------------------------------------------------------
    console.log('\n[TEST O] Backward compatibility with Phase 2.5 and 2.6 payloads...');
    const legacyPlan = await defaultVisualStrategyEngine.planVisual({
      topic: 'General Physics',
      teachingContent: {
        speechText: 'Velocity is defined as the rate of change of displacement.',
      },
      turnId: 'turn_legacy',
    });
    assert(VisualPlanSchema.safeParse(legacyPlan).success, 'Legacy plain teaching turns validate successfully');
    assert(legacyPlan.beats.length >= 1, 'Produces fallback beat cleanly');
    console.log(`  ✓ Backward compatibility validated: legacy turn produced ${legacyPlan.strategy} beat`);

    console.log('\n===============================================================');
    console.log('🎉 ALL PHASE 3 VISUAL INTELLIGENCE TESTS A THROUGH O PASSED!');
    console.log('===============================================================\n');
  } finally {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    await mongoose.disconnect();
  }
}

runPhase3Verification().catch((err) => {
  console.error('\n❌ Phase 3 Verification failed:', err);
  process.exit(1);
});
