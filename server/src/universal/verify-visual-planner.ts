import {
  UniversalVisualPlanner,
  defaultUniversalVisualPlanner,
  VisualPlanningInputSchema,
  VisualPlanningDecisionSchema,
  type VisualPlanningInput,
  type VisualIntent,
  type VisualTemplate,
} from '@ai-tutor/shared';

export function runVisualPlannerVerification(): boolean {
  console.log('\n==================================================');
  console.log('PHASE 6D: UNIVERSAL VISUAL PLANNER VALIDATION');
  console.log('==================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}${detail ? `: ${detail}` : ''}`);
    }
  }

  const planner = defaultUniversalVisualPlanner;

  // ----------------------------------------------------
  // 1. Cross-Domain Fixture Suite (Section 14)
  // ----------------------------------------------------
  console.log('--- 1. Section 14 Cross-Domain Fixtures ---');

  // Math 1: Pythagorean Theorem -> FORMULA
  const math1 = planner.planVisual({
    concept: 'What is the Pythagorean theorem?',
    displayText: 'The Pythagorean theorem states that a^2 + b^2 = c^2 for right triangles.',
    subjectEnvironment: 'MATHEMATICS',
    content: {
      blocks: [{ type: 'formula', latex: 'a^2 + b^2 = c^2' }],
    },
  });
  assert(
    math1.intent === 'FORMULA' && math1.templateId === 'template.formula.derivation',
    `Math 1 (Pythagorean Theorem): Planned as FORMULA / formula.derivation (got ${math1.intent} / ${math1.templateId})`
  );

  // Math 2: Compare linear and quadratic functions -> COMPARISON
  const math2 = planner.planVisual({
    concept: 'Compare linear and quadratic functions.',
    displayText: 'Comparing the rates of change and parabolic vs straight line graphs.',
    subjectEnvironment: 'MATHEMATICS',
  });
  assert(
    math2.intent === 'COMPARISON' && math2.templateId === 'template.comparison.matrix',
    `Math 2 (Compare functions): Planned as COMPARISON / comparison.matrix (got ${math2.intent})`
  );

  // Physics 1: What is acceleration? -> GRAPH
  const phys1 = planner.planVisual({
    concept: 'What is acceleration?',
    displayText: 'Acceleration is the rate of change of velocity versus time.',
    subjectEnvironment: 'PHYSICS',
  });
  assert(
    math1.intent === 'FORMULA' && (phys1.intent === 'GRAPH' || phys1.intent === 'SIMULATION'),
    `Physics 1 (What is acceleration?): Planned as GRAPH/SIMULATION candidate (got ${phys1.intent})`
  );

  // Physics 2: How do forces act on an object? -> DIAGRAM (spatial)
  const phys2 = planner.planVisual({
    concept: 'How do forces act on an object?',
    displayText: 'Free body vector diagram of forces acting on an object: normal force and gravity.',
    subjectEnvironment: 'PHYSICS',
  });
  assert(
    phys2.intent === 'DIAGRAM' && phys2.templateId === 'template.diagram.spatial',
    `Physics 2 (Forces acting on an object): Planned as DIAGRAM / diagram.spatial (got ${phys2.intent} / ${phys2.templateId})`
  );

  // Biology 1: What are the parts of a cell? -> DIAGRAM (relational)
  const bio1 = planner.planVisual({
    concept: 'What are the parts of a cell?',
    displayText: 'Anatomy and structure of a cell: contains nucleus, mitochondria, and cytoplasm.',
    subjectEnvironment: 'BIOLOGY',
  });
  assert(
    bio1.intent === 'DIAGRAM' && bio1.templateId === 'template.diagram.relational',
    `Biology 1 (Parts of a cell): Planned as DIAGRAM / diagram.relational (got ${bio1.intent} / ${bio1.templateId})`
  );

  // Biology 2: Stages of mitosis -> PROCESS
  const bio2 = planner.planVisual({
    concept: 'Stages of mitosis',
    displayText: 'Step-by-step lifecycle and stages of mitosis: prophase, metaphase, anaphase, telophase.',
    subjectEnvironment: 'BIOLOGY',
  });
  assert(
    bio2.intent === 'PROCESS' && bio2.templateId === 'template.process.sequential',
    `Biology 2 (Stages of mitosis): Planned as PROCESS / process.sequential (got ${bio2.intent})`
  );

  // Chemistry 1: Structure of an atom -> DIAGRAM (relational)
  const chem1 = planner.planVisual({
    concept: 'Explain the structure of an atom.',
    displayText: 'Components and structure of an atom: protons, neutrons, and electron cloud.',
    subjectEnvironment: 'CHEMISTRY',
  });
  assert(
    chem1.intent === 'DIAGRAM' && chem1.templateId === 'template.diagram.relational',
    `Chemistry 1 (Structure of an atom): Planned as DIAGRAM / diagram.relational (got ${chem1.intent})`
  );

  // Chemistry 2: Compare ionic and covalent bonding -> COMPARISON
  const chem2 = planner.planVisual({
    concept: 'Compare ionic and covalent bonding.',
    displayText: 'Comparison of electron transfer versus electron sharing in chemical bonding.',
    subjectEnvironment: 'CHEMISTRY',
  });
  assert(
    chem2.intent === 'COMPARISON' && chem2.templateId === 'template.comparison.matrix',
    `Chemistry 2 (Compare bonding): Planned as COMPARISON / comparison.matrix (got ${chem2.intent})`
  );

  // CS 1: How does binary search work? -> PROCESS
  const cs1 = planner.planVisual({
    concept: 'How does binary search work?',
    displayText: 'Binary search algorithm step-by-step: divide the sorted array in halves.',
    subjectEnvironment: 'COMPUTER_SCIENCE',
  });
  assert(
    cs1.intent === 'PROCESS' && cs1.templateId === 'template.process.sequential',
    `CS 1 (How binary search works): Planned as PROCESS / process.sequential (got ${cs1.intent})`
  );

  // CS 2: Trace this recursive function -> CODE
  const cs2 = planner.planVisual({
    concept: 'Trace this recursive function.',
    displayText: 'Run through this code showing recursive call stack execution in python.',
    subjectEnvironment: 'COMPUTER_SCIENCE',
    content: {
      blocks: [{ type: 'code', language: 'python', code: 'def rec(n):\n  if n==0: return 1' }],
    },
  });
  assert(
    cs2.intent === 'CODE' && cs2.templateId === 'template.code.walkthrough',
    `CS 2 (Trace recursive function): Planned as CODE / code.walkthrough (got ${cs2.intent})`
  );

  // History 1: Major events of the French Revolution -> TIMELINE
  const hist1 = planner.planVisual({
    concept: 'Major events of the French Revolution.',
    displayText: 'Chronological timeline of major events from 1789 to 1799.',
    subjectEnvironment: 'HISTORY',
  });
  assert(
    hist1.intent === 'TIMELINE' && hist1.templateId === 'template.timeline.historical',
    `History 1 (Major events): Planned as TIMELINE / timeline.historical (got ${hist1.intent})`
  );

  // History 2: Where did these events happen? -> MAP / spatial
  const hist2 = planner.planVisual({
    concept: 'Where did the major events happen?',
    displayText: 'Locate the geographic regions and map of major events in France.',
    subjectEnvironment: 'HISTORY',
  });
  assert(
    hist2.intent === 'MAP' && hist2.templateId === 'template.diagram.spatial',
    `History 2 (Where events happened): Planned as MAP candidate with spatial fallback (got ${hist2.intent})`
  );

  // Literature / Humanities: What is existentialism? -> EXPLANATION / EDITORIAL
  const lit1 = planner.planVisual({
    concept: 'What is existentialism?',
    displayText: 'Existentialism is a philosophical theory concerning human freedom, authenticity, and meaning.',
    subjectEnvironment: 'LITERATURE',
  });
  assert(
    lit1.intent === 'EXPLANATION' && lit1.templateId === 'template.explanation.editorial',
    `Literature (What is existentialism?): Planned as EXPLANATION / editorial (got ${lit1.intent})`
  );

  // ----------------------------------------------------
  // 2. Semantic Content Block Priority Tests (Section 8)
  // ----------------------------------------------------
  console.log('\n--- 2. Content Block Priority Over Keyword Fallback ---');

  // Explicit FormulaBlock forces FORMULA even with minimal text
  const blockFormula = planner.planVisual({
    content: {
      blocks: [{ type: 'formula', latex: 'E = m c^2' }],
    },
  });
  assert(blockFormula.intent === 'FORMULA', 'FormulaBlock directly drives FORMULA intent');

  // Explicit CodeBlock forces CODE
  const blockCode = planner.planVisual({
    content: {
      blocks: [{ type: 'code', language: 'typescript', code: 'const x = 1;' }],
    },
  });
  assert(blockCode.intent === 'CODE', 'CodeBlock directly drives CODE intent');

  // Multiple StepBlocks force PROCESS
  const blockProcess = planner.planVisual({
    content: {
      blocks: [
        { type: 'step', stepNumber: 1, content: [{ text: 'Init' }] },
        { type: 'step', stepNumber: 2, content: [{ text: 'Execute' }] },
      ],
    },
  });
  assert(blockProcess.intent === 'PROCESS', 'StepBlocks directly drive PROCESS intent');

  // ----------------------------------------------------
  // 3. Subject as Prior, NOT Decision (Section 7)
  // ----------------------------------------------------
  console.log('\n--- 3. Subject Prior vs Decision Independence ---');

  // Physics can produce EXPLANATION, GRAPH, and DIAGRAM
  const physExplain = planner.planVisual({
    concept: 'What is force conceptually?',
    displayText: 'A philosophical definition of push and pull.',
    subjectEnvironment: 'PHYSICS',
  });
  assert(physExplain.intent === 'EXPLANATION', 'Physics produces EXPLANATION when concept is purely definitional');
  assert(phys1.intent === 'GRAPH', 'Physics produces GRAPH when concept is quantitative');
  assert(phys2.intent === 'DIAGRAM', 'Physics produces DIAGRAM when concept is vector/spatial');

  // History can produce EXPLANATION, TIMELINE, and MAP
  const histExplain = planner.planVisual({
    concept: 'What caused the French Revolution?',
    displayText: 'Philosophical ideas of the Enlightenment and social inequality.',
    subjectEnvironment: 'HISTORY',
  });
  assert(histExplain.intent === 'EXPLANATION', 'History produces EXPLANATION for causal/conceptual questions');
  assert(hist1.intent === 'TIMELINE', 'History produces TIMELINE for chronological milestones');
  assert(hist2.intent === 'MAP', 'History produces MAP for spatial/geographic questions');

  // Same intent produced by different subjects (Convergence)
  assert(
    math2.intent === 'COMPARISON' && chem2.intent === 'COMPARISON',
    'Mathematics and Chemistry both converge to COMPARISON when comparative semantics are present'
  );
  assert(
    bio2.intent === 'PROCESS' && cs1.intent === 'PROCESS',
    'Biology and Computer Science both converge to PROCESS when procedural semantics are present'
  );

  // ----------------------------------------------------
  // 4. Determinism Test (Section 12)
  // ----------------------------------------------------
  console.log('\n--- 4. Deterministic Reproducibility ---');
  const sampleInput: VisualPlanningInput = {
    concept: 'How does binary search work?',
    displayText: 'Step by step algorithmic division of sorted elements.',
    subjectEnvironment: 'COMPUTER_SCIENCE',
  };

  const initialPlan = planner.planVisual(sampleInput);
  let isStrictlyDeterministic = true;
  for (let i = 0; i < 10; i++) {
    const repeatPlan = planner.planVisual(sampleInput);
    if (
      repeatPlan.intent !== initialPlan.intent ||
      repeatPlan.templateId !== initialPlan.templateId ||
      repeatPlan.confidence !== initialPlan.confidence ||
      repeatPlan.pedagogicalRole !== initialPlan.pedagogicalRole
    ) {
      isStrictlyDeterministic = false;
      break;
    }
  }
  assert(isStrictlyDeterministic, 'Planner produces exact identical output across 10 consecutive runs');

  // ----------------------------------------------------
  // 5. Negative Resilience & Fallback (Section 13)
  // ----------------------------------------------------
  console.log('\n--- 5. Negative Resilience & Universal Fallback ---');

  // Empty input -> EXPLANATION fallback
  const emptyPlan = planner.planVisual({});
  assert(
    emptyPlan.intent === 'EXPLANATION' && emptyPlan.templateId === 'template.explanation.editorial',
    'Empty input safely falls back to EXPLANATION / template.explanation.editorial'
  );

  // Minimal non-informative text -> EXPLANATION fallback
  const gibberishPlan = planner.planVisual({ displayText: 'Random short text without clues.' });
  assert(
    gibberishPlan.intent === 'EXPLANATION',
    'Unrecognized semantic text safely defaults to EXPLANATION'
  );

  // Valid decision contract
  try {
    VisualPlanningDecisionSchema.parse(initialPlan);
    assert(true, 'Planning decision strictly adheres to VisualPlanningDecisionSchema');
  } catch (err: any) {
    assert(false, 'Decision failed schema parse', err?.message);
  }

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  console.log('\n==================================================');
  console.log(`VALIDATION RESULT: ${passed} / ${total} TESTS PASSED`);
  console.log('==================================================\n');

  return passed === total;
}

const success = runVisualPlannerVerification();
if (!success) {
  process.exit(1);
}
