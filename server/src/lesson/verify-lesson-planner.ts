import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { createApp } from '../app.js';
import * as firebaseConfig from '../config/firebase.js';
import { connectDatabase } from '../config/db.js';
import { lessonPlannerService } from './lesson-planner.service.js';
import { LessonPlannerValidation } from './lesson-planner.validation.js';
import {
  LessonBlueprintSchema,
  LessonConcept,
  KnowledgeContext,
  LearnerProfile,
} from '@ai-tutor/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

let server: http.Server;
let baseUrl: string;

const TEST_USER = 'student_phase2_planner_test';

const setupMockAuth = () => {
  firebaseConfig.setCustomAuthProvider({
    verifyIdToken: async (token: string) => {
      if (token === 'TOKEN_STUDENT_PHASE2') {
        return {
          uid: TEST_USER,
          email: 'phase2@tutor.test',
          name: 'Phase2 Tester',
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
    console.error(`  ✗ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
};

async function runLessonPlannerVerificationSuite() {
  console.log('\n===============================================================');
  console.log('RUNNING PHASE 2 LESSON PLANNER 2.0 VERIFICATION SUITE');
  console.log('===============================================================\n');

  setupMockAuth();
  await connectDatabase();
  console.log('[OK] Connected to MongoDB database');

  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        baseUrl = `http://localhost:${addr.port}`;
        console.log(`[OK] Real HTTP Test Server listening on ${baseUrl}\n`);
      }
      resolve();
    });
  });

  const mockKnowledge: KnowledgeContext = {
    sourceType: 'uploaded_document',
    hasUploadedDocuments: true,
    relevantContextFound: true,
    retrievedChunks: [
      {
        chunkId: 'chunk_refraction_01',
        text: 'Refraction is the bending of light when it passes obliquely from one transparent medium to another of different optical density. The fundamental cause of refraction is the difference in speed of light across media.',
        source: 'phy ch9 light.pdf',
        relevance: 0.96,
      },
      {
        chunkId: 'chunk_snell_02',
        text: "Snell's law of refraction states that the ratio of sine of angle of incidence to the sine of angle of refraction is a constant for light of given color and pair of media: sin(i) / sin(r) = constant = n21 (refractive index of medium 2 relative to 1).",
        source: 'phy ch9 light.pdf',
        relevance: 0.94,
      },
    ],
  };

  const sampleProfile: LearnerProfile = {
    userId: TEST_USER,
    preferredLanguage: 'english',
    educationLevel: 'Class 10 CBSE',
    learningGoal: 'Understand refraction mechanisms and solve exam ray diagrams',
    explanationStyle: 'balanced',
  };

  try {
    // -------------------------------------------------------------
    // Test A: Lesson Plan Generation
    // -------------------------------------------------------------
    console.log('--- Test A: Lesson Plan Generation ---');
    const planA = await lessonPlannerService.planLesson({
      topic: 'Light: Reflection and Refraction',
      subject: 'Physics',
      learnerProfile: sampleProfile,
      availableMinutes: 25,
      learningGoal: 'Master Snell law and understand ray diagram bending',
      knowledgeContext: mockKnowledge,
    });

    const parsedA = LessonBlueprintSchema.safeParse(planA);
    assert(parsedA.success, 'Generated blueprint strictly satisfies LessonBlueprintSchema Zod contract');
    assert(Boolean(planA.learningObjective?.primary), 'Blueprint defines primary learning objective');
    assert(Array.isArray(planA.conceptSequence) && planA.conceptSequence.length >= 2, 'Concept sequence contains multiple concepts');

    const firstConcept = planA.conceptSequence[0];
    assert(Boolean(firstConcept.purpose || firstConcept.summary), 'Concept defines pedagogical purpose');
    assert(['INTRODUCTORY', 'STANDARD', 'DEEP'].includes(firstConcept.depth), `Concept defines depth (${firstConcept.depth})`);
    assert(Array.isArray(firstConcept.keyPoints), 'Concept specifies keyPoints array');
    assert(Array.isArray(firstConcept.commonMisconceptions), 'Concept specifies commonMisconceptions array');
    assert(Array.isArray(firstConcept.visualSegmentIds), 'Concept defines visualSegmentIds');
    assert(firstConcept.segments.length >= 2, 'Concept includes fine-grained teaching segments');
    console.log(`     -> Generated ${planA.conceptSequence.length} concepts with ${planA.conceptSequence.reduce((acc, c) => acc + c.segments.length, 0)} total segments`);

    // -------------------------------------------------------------
    // Test B: Time Adaptation (RAPID vs STANDARD vs DEEP)
    // -------------------------------------------------------------
    console.log('\n--- Test B: Time Adaptation (5-10m RAPID vs 15-30m STANDARD vs 45-60m DEEP) ---');
    const planRapid = await lessonPlannerService.planLesson({
      topic: 'Snell Law Numerical',
      subject: 'Physics',
      availableMinutes: 10,
      learningGoal: 'Solve high yield numerical questions in 10 minutes',
    });
    assert(planRapid.timePlan.mode === 'RAPID', '10-minute session generates RAPID timePlan mode');
    assert(planRapid.timePlan.estimatedMinutes <= 12, '10-minute session stays tightly scoped');

    const planStandard = await lessonPlannerService.planLesson({
      topic: 'Refraction through Glass Slab',
      subject: 'Physics',
      availableMinutes: 25,
    });
    assert(planStandard.timePlan.mode === 'STANDARD', '25-minute session generates STANDARD timePlan mode');

    const planDeep = await lessonPlannerService.planLesson({
      topic: 'Complete Wave and Ray Optics',
      subject: 'Physics',
      availableMinutes: 50,
      learningGoal: 'Comprehensive theoretical foundation with derivations',
    });
    assert(planDeep.timePlan.mode === 'DEEP', '50-minute session generates DEEP timePlan mode');
    assert(planDeep.teachingStrategy.explanationDepth === 'DETAILED', 'DEEP mode selects DETAILED explanation depth');

    // -------------------------------------------------------------
    // Test C: High-Yield Prioritization without Fabricated Claims
    // -------------------------------------------------------------
    console.log('\n--- Test C: High-Yield Prioritization without Fabricated Claims ---');
    assert(Array.isArray(planA.highYieldPriorities), 'Blueprint includes highYieldPriorities array');
    assert(planA.highYieldPriorities.length > 0, 'High-yield priorities identified');

    const firstPriority = planA.highYieldPriorities[0];
    assert(typeof firstPriority.examImportance === 'number', 'Priority has numerical examImportance');
    assert(
      ['VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'].includes(firstPriority.marksPotential),
      `Marks potential is safely typed (${firstPriority.marksPotential})`
    );

    // Verify ungrounded topic does not fabricate claims
    const ungroundedPlan = await lessonPlannerService.planLesson({
      topic: 'Epistemology of Ancient Stoicism',
      subject: 'Philosophy',
      availableMinutes: 15,
    });
    const ungroundedPriority = ungroundedPlan.highYieldPriorities[0];
    assert(
      !ungroundedPriority || ['UNKNOWN', 'LOW', 'MEDIUM', 'HIGH'].includes(ungroundedPriority.marksPotential),
      'Ungrounded topic uses valid marks potential without fabricated PYQ claims'
    );

    // -------------------------------------------------------------
    // Test D: Assessment Planning (Conversational Checks vs Formal Assessments)
    // -------------------------------------------------------------
    console.log('\n--- Test D: Assessment Planning & Restricted Conditions ---');
    assert(Boolean(planA.assessmentStrategy), 'Blueprint specifies assessmentStrategy');
    assert(
      Array.isArray(planA.assessmentStrategy.restrictedConditions) && planA.assessmentStrategy.restrictedConditions.length > 0,
      'Assessment strategy lists explicit restricted conditions where NO assessment should occur'
    );
    assert(
      planA.assessmentStrategy.restrictedConditions.includes('DURING_EXPLANATION') &&
        planA.assessmentStrategy.restrictedConditions.includes('WHEN_STUDENT_IS_STRUGGLING'),
      'Restricted conditions prevent testing during explanation and when student is struggling'
    );

    // Check conversational checks in segments vs formal assessment opportunities
    const conversationalSegment = planA.conceptSequence
      .flatMap((c) => c.segments)
      .find((s) => s.type === 'CONVERSATIONAL_CHECK');
    assert(Boolean(conversationalSegment), 'Segments contain CONVERSATIONAL_CHECK for natural dialogue check-in');
    assert(
      Boolean(conversationalSegment?.conversationalCheck?.possible),
      'Conversational segment flags conversationalCheck.possible = true'
    );

    // Ensure formal assessment checkpoints do not leak raw question content
    assert(planA.assessmentOpportunities.length > 0, 'Formal assessment opportunities exist as checkpoints');
    assert(
      !('question' in planA.assessmentOpportunities[0]) && !('options' in planA.assessmentOpportunities[0]),
      'Assessment checkpoints do not generate question text (strict separation preserved)'
    );

    // -------------------------------------------------------------
    // Test E: Visual Planning & Continuity
    // -------------------------------------------------------------
    console.log('\n--- Test E: Visual Planning & Continuity ---');
    assert(Boolean(planA.visualLessonPlan), 'Blueprint contains visualLessonPlan');
    assert(
      Array.isArray(planA.visualLessonPlan.conceptVisualPlans) && planA.visualLessonPlan.conceptVisualPlans.length > 0,
      'visualLessonPlan contains conceptVisualPlans array'
    );

    const firstVisualPlan = planA.visualLessonPlan.conceptVisualPlans[0];
    assert(
      Array.isArray(firstVisualPlan.segments) && firstVisualPlan.segments.length >= 2,
      'Each concept contains multiple visual scenes rather than a single static visual'
    );

    const visualTypesUsed = new Set(
      planA.visualLessonPlan.conceptVisualPlans.flatMap((cvp) => cvp.segments.map((s) => s.visualType))
    );
    console.log(`     -> Distinct visual types planned: ${Array.from(visualTypesUsed).join(', ')}`);
    assert(visualTypesUsed.size >= 2, 'Visual lesson plan utilizes varied visual types');

    const continuitySeg = firstVisualPlan.segments.find((s) => s.continuityNote);
    assert(Boolean(continuitySeg), 'Visual segments include continuity notes explaining how scenes connect');

    // -------------------------------------------------------------
    // Test F: Retention Planning
    // -------------------------------------------------------------
    console.log('\n--- Test F: Retention Planning & Techniques ---');
    const retentionTechniquesUsed = new Set(
      planA.visualLessonPlan.conceptVisualPlans.flatMap((cvp) => cvp.segments.map((s) => s.retentionTechnique))
    );
    console.log(`     -> Retention techniques planned: ${Array.from(retentionTechniquesUsed).join(', ')}`);
    assert(
      retentionTechniquesUsed.size >= 2,
      'Visual segments incorporate diverse retention techniques (e.g. REAL_WORLD_HOOK, STEP_BY_STEP_REVEAL, CONTRAST)'
    );

    // -------------------------------------------------------------
    // Test G: Adaptive Replanning
    // -------------------------------------------------------------
    console.log('\n--- Test G: Adaptive Replanning ---');
    const initialProgress = lessonPlannerService.initializeProgress(planA);
    const completedConceptId = planA.conceptSequence[0].id;
    initialProgress.completedConceptIds = [completedConceptId];
    initialProgress.remainingMinutes = 10;

    const replanResult = await lessonPlannerService.replanLesson({
      currentBlueprint: planA,
      currentProgress: initialProgress,
      triggerReason: 'Student demonstrated confusion on ray bending towards vs away from normal',
      remainingMinutes: 10,
      focusAdjustment: 'REVISIT_MISCONCEPTIONS',
      studentFeedback: 'I get confused when light goes from glass to air',
    });

    assert(replanResult.blueprint.version === planA.version + 1, 'Replanning increments blueprint version');
    assert(
      replanResult.blueprint.conceptSequence.some((c) => c.id === completedConceptId),
      'Completed concept is preserved in replanned blueprint'
    );
    assert(
      replanResult.updatedProgress.completedConceptIds.includes(completedConceptId),
      'Completed concept remains marked in progress state'
    );
    assert(replanResult.updatedProgress.replanningHistory.length >= 1, 'Replanning recorded in history');

    // -------------------------------------------------------------
    // Test H: Persistence & Pause/Resume
    // -------------------------------------------------------------
    console.log('\n--- Test H: Persistence & Pause/Resume ---');
    const createRes = await fetch(`${baseUrl}/api/teaching/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer TOKEN_STUDENT_PHASE2',
      },
      body: JSON.stringify({
        topic: 'Refraction & Total Internal Reflection',
        subject: 'Physics',
        availableMinutes: 20,
        learningGoal: 'Concept clarity and exam questions',
        planBlueprint: true,
      }),
    });
    assert(createRes.status === 201, 'POST /api/teaching/sessions creates session with status 201');
    const createData = (await createRes.json()) as any;
    const sessionId = createData.data.id;
    assert(Boolean(sessionId), 'Session ID created');
    assert(Boolean(createData.data.lessonBlueprint), 'Session returns attached lessonBlueprint');

    // Fetch blueprint
    const getBpRes = await fetch(`${baseUrl}/api/teaching/sessions/${sessionId}/blueprint`, {
      headers: { Authorization: 'Bearer TOKEN_STUDENT_PHASE2' },
    });
    assert(getBpRes.status === 200, 'GET /sessions/:id/blueprint returns 200 OK');

    // Pause session
    const pauseRes = await fetch(`${baseUrl}/api/teaching/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer TOKEN_STUDENT_PHASE2',
      },
      body: JSON.stringify({ status: 'paused' }),
    });
    assert(pauseRes.status === 200, 'PATCH /sessions/:id pauses session');

    // Resume session
    const resumeRes = await fetch(`${baseUrl}/api/teaching/sessions/${sessionId}/resume`, {
      method: 'POST',
      headers: { Authorization: 'Bearer TOKEN_STUDENT_PHASE2' },
    });
    assert(resumeRes.status === 200, 'POST /sessions/:id/resume resumes session');
    const resumedData = (await resumeRes.json()) as any;
    assert(resumedData.data.session.status === 'active', 'Resumed session status is active');
    assert(Boolean(resumedData.data.context.lessonBlueprint), 'Resumed session context preserves lessonBlueprint');

    // -------------------------------------------------------------
    // Test I: Manual Acceptance Test on Physics: "Light Reflection & Refraction"
    // -------------------------------------------------------------
    console.log('\n--- Test I: Manual Acceptance Test (Physics: Light Reflection & Refraction) ---');
    const physicsPlan = await lessonPlannerService.planLesson({
      topic: 'Light: Reflection & Refraction',
      subject: 'Physics',
      learnerProfile: sampleProfile,
      availableMinutes: 30,
      learningGoal: 'Class 10 CBSE Board Exam Mastery of Refraction and Snell’s Law',
      knowledgeContext: mockKnowledge,
    });

    console.log('\n===============================================================');
    console.log('PEDAGOGICAL LESSON BLUEPRINT DECOMPOSITION (MANUAL ACCEPTANCE)');
    console.log('===============================================================');
    console.log(`Topic: ${physicsPlan.topic}`);
    console.log(`Subject: ${physicsPlan.subject}`);
    console.log(`Strategy: ${physicsPlan.teachingStrategy.approach} | Depth: ${physicsPlan.teachingStrategy.explanationDepth} | Mode: ${physicsPlan.timePlan.mode}`);
    console.log(`Learning Objective: ${physicsPlan.learningObjective.primary}`);
    console.log(`Assessment Strategy: Freq=${physicsPlan.assessmentStrategy.conversationalCheckFrequency}, Threshold=${physicsPlan.assessmentStrategy.formalAssessmentThreshold}`);
    console.log(`Restricted Assessment Conditions: ${physicsPlan.assessmentStrategy.restrictedConditions.join(', ')}`);
    console.log('\nConcepts Roadmap:');
    physicsPlan.conceptSequence.forEach((c, idx) => {
      console.log(`  ${idx + 1}. [${c.id}] ${c.title} (${c.estimatedMinutes}m, ${c.importance}, Depth: ${c.depth})`);
      console.log(`     Purpose: ${c.purpose || c.summary}`);
      console.log(`     Teaching Segments (${c.segments.length}):`);
      c.segments.forEach((s) => {
        console.log(`       - [${s.type}] ${s.title}: ${s.teacherFocus}`);
      });
    });

    console.log('\nVisual Lesson Plan (Multi-Scene Flow):');
    physicsPlan.visualLessonPlan.conceptVisualPlans.forEach((cvp) => {
      console.log(`  Concept [${cvp.conceptId}]:`);
      cvp.segments.forEach((vs, sIdx) => {
        console.log(`    Scene ${sIdx + 1} (${vs.visualType} / ${vs.retentionTechnique}): ${vs.purpose}`);
        if (vs.continuityNote) console.log(`      ↳ Continuity: ${vs.continuityNote}`);
      });
    });

    assert(physicsPlan.conceptSequence.length >= 2, 'Physics plan has multiple structured concepts');
    assert(physicsPlan.visualLessonPlan.conceptVisualPlans.length >= 2, 'Physics plan has visual plans for each concept');
    assert(
      physicsPlan.conceptSequence.some((c) => c.sourceReferences.some((s) => s.includes('phy ch9 light.pdf'))),
      'Physics plan concepts are grounded in phy ch9 light.pdf'
    );

    console.log('\n===============================================================');
    console.log('🎉 ALL PHASE 2 LESSON PLANNER 2.0 TESTS A THROUGH I PASSED!');
    console.log('===============================================================\n');
  } finally {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    await mongoose.disconnect();
  }
}

runLessonPlannerVerificationSuite().catch((err) => {
  console.error('\n❌ Lesson Planner Verification Failed:', err);
  process.exit(1);
});
