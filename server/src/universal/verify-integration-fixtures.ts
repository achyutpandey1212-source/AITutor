import {
  buildVisualForBeat,
  UniversalTeachingBeatSchema,
  mapLegacyVisualTypeToUniversalIntent,
  type UniversalTeachingBeat,
} from '@ai-tutor/shared';

export function runIntegrationFixturesVerification(): boolean {
  console.log('\n==================================================');
  console.log('FINAL INTEGRATION VERIFICATION: TEACHING FIXTURES A-G');
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

  // ----------------------------------------------------
  // FIXTURE A: Prominent Definition ("What is acceleration?")
  // ----------------------------------------------------
  console.log('--- Fixture A: Prominent Definition ---');
  const defBeat: UniversalTeachingBeat = UniversalTeachingBeatSchema.parse({
    beatIndex: 0,
    beatId: 'def-accel',
    content: {
      blocks: [
        {
          type: 'definition',
          term: 'Acceleration',
          definition: [
            { text: 'The rate of change of ' },
            { text: 'velocity', marks: ['term'] },
            { text: ' per unit time: ' },
            { text: 'a = dv/dt', marks: ['variable', 'highlight'] },
            { text: '.' },
          ],
        },
      ],
    },
    speechText: 'Acceleration is defined as the rate at which an object changes its velocity over time.',
    displayText: 'Acceleration: rate of change of velocity per unit time (a = Δv/Δt).',
    captionText: 'Acceleration is the rate of change of velocity.',
    visual: {
      intent: 'EXPLANATION',
      templateId: 'template.explanation.editorial',
      environment: 'NEUTRAL',
      payload: {
        title: 'Definition of Acceleration',
      },
    },
    animation: { enterTransition: 'fade', activeElements: [] },
    avatar: { framing: 'medium', gesture: 'neutral', gazeTarget: 'student' },
  });

  const builtDef = buildVisualForBeat(defBeat);
  assert(builtDef.visual.intent === 'EXPLANATION', 'Fixture A produces EXPLANATION intent');
  assert(builtDef.content.blocks[0]?.type === 'definition', 'Fixture A contains definition block');
  const defBlock = builtDef.content.blocks[0] as any;
  assert(defBlock.term === 'Acceleration', 'Fixture A term is Acceleration');
  assert(defBlock.definition.some((d: any) => d.marks?.includes('highlight')), 'Fixture A has highlight mark');

  // ----------------------------------------------------
  // FIXTURE B: Flowchart / Sequential Process ("Binary Search")
  // ----------------------------------------------------
  console.log('\n--- Fixture B: Flowchart / Sequential Process ---');
  const processBeat: UniversalTeachingBeat = UniversalTeachingBeatSchema.parse({
    beatIndex: 0,
    beatId: 'proc-bs',
    content: { blocks: [] },
    speechText: 'In binary search we start with a sorted array, find middle, compare target, and discard half.',
    displayText: 'Binary Search Algorithm Steps',
    captionText: 'Binary Search process flow.',
    visual: {
      intent: 'PROCESS',
      templateId: 'template.process.sequential',
      environment: 'NEUTRAL',
      payload: {
        title: 'Binary Search Algorithm',
      },
    },
    animation: { enterTransition: 'stagger_reveal', activeElements: [] },
    avatar: { framing: 'medium', gesture: 'neutral', gazeTarget: 'student' },
  });

  const builtProc = buildVisualForBeat(processBeat);
  assert(builtProc.visual.intent === 'PROCESS', 'Fixture B produces PROCESS intent');
  assert(builtProc.visual.templateId === 'template.process.sequential', 'Fixture B uses sequential template');
  const procNodes = builtProc.visual.payload?.nodes || [];
  const procConnectors = builtProc.visual.payload?.connectors || [];
  assert(procNodes.length >= 3, `Fixture B generated ${procNodes.length} sequential nodes (>=3)`);
  assert(procConnectors.length >= 2, `Fixture B generated ${procConnectors.length} connectors (>=2)`);
  assert(procConnectors.every((c: any) => c.directed), 'Fixture B connectors are directed arrows');

  // ----------------------------------------------------
  // FIXTURE C: Relational Diagram ("Cell Structure")
  // ----------------------------------------------------
  console.log('\n--- Fixture C: Relational Diagram ---');
  const cellBeat: UniversalTeachingBeat = UniversalTeachingBeatSchema.parse({
    beatIndex: 0,
    beatId: 'diag-cell',
    content: { blocks: [] },
    speechText: 'The cell contains a nucleus, mitochondria, ribosomes, and cell membrane working together.',
    displayText: 'Eukaryotic Cell Internal Structure',
    captionText: 'Cell organelles and structures.',
    visual: {
      intent: 'DIAGRAM',
      templateId: 'template.diagram.relational',
      environment: 'NEUTRAL',
      payload: {
        title: 'Cell Organelle Organization',
      },
    },
    animation: { enterTransition: 'fade', activeElements: [] },
    avatar: { framing: 'medium', gesture: 'neutral', gazeTarget: 'student' },
  });

  const builtCell = buildVisualForBeat(cellBeat);
  assert(builtCell.visual.intent === 'DIAGRAM', 'Fixture C produces DIAGRAM intent');
  const cellNodes = builtCell.visual.payload?.nodes || [];
  const cellConnectors = builtCell.visual.payload?.connectors || [];
  assert(cellNodes.length >= 4, `Fixture C generated ${cellNodes.length} relational nodes (>=4)`);
  assert(cellNodes[0]?.id === 'node-root', 'Fixture C has root cell node');
  assert(cellConnectors.length >= 3, `Fixture C connects root to organelles (${cellConnectors.length} connectors)`);

  // ----------------------------------------------------
  // FIXTURE D: Cartesian Graph ("Velocity vs Time")
  // ----------------------------------------------------
  console.log('\n--- Fixture D: Cartesian Graph ---');
  const graphBeat: UniversalTeachingBeat = UniversalTeachingBeatSchema.parse({
    beatIndex: 0,
    beatId: 'graph-vt',
    content: { blocks: [] },
    speechText: 'For constant acceleration, velocity increases linearly with time v = u + at.',
    displayText: 'Velocity vs Time under Constant Acceleration',
    captionText: 'Linear velocity graph over time.',
    visual: {
      intent: 'GRAPH',
      templateId: 'template.graph.cartesian',
      environment: 'NEUTRAL',
      payload: {
        title: 'Velocity-Time Relationship',
      },
    },
    animation: { enterTransition: 'fade', activeElements: [] },
    avatar: { framing: 'medium', gesture: 'neutral', gazeTarget: 'student' },
  });

  const builtGraph = buildVisualForBeat(graphBeat);
  assert(builtGraph.visual.intent === 'GRAPH', 'Fixture D produces GRAPH intent');
  assert(Boolean(builtGraph.visual.payload?.axes?.x), 'Fixture D includes X axis');
  assert(Boolean(builtGraph.visual.payload?.axes?.y), 'Fixture D includes Y axis');
  const series = builtGraph.visual.payload?.series || [];
  assert(series.length > 0 && series[0].points.length >= 4, 'Fixture D includes data series with points');

  // ----------------------------------------------------
  // FIXTURE E: Formula Derivation ("Pythagorean Theorem")
  // ----------------------------------------------------
  console.log('\n--- Fixture E: Formula Derivation ---');
  const formulaBeat: UniversalTeachingBeat = UniversalTeachingBeatSchema.parse({
    beatIndex: 0,
    beatId: 'form-pyth',
    content: {
      blocks: [
        {
          type: 'formula',
          latex: 'a^2 + b^2 = c^2',
          explanation: [{ text: 'Right triangle hypotenuse relationship' }],
        },
        {
          type: 'formula',
          latex: 'c = \\sqrt{a^2 + b^2}',
          explanation: [{ text: 'Solving for hypotenuse c' }],
        },
      ],
    },
    speechText: 'In any right triangle, the square of the hypotenuse equals the sum of squares of both sides.',
    displayText: 'Pythagorean theorem derivation: a² + b² = c².',
    captionText: 'Pythagorean formula derivation.',
    visual: {
      intent: 'FORMULA',
      templateId: 'template.formula.derivation',
      environment: 'NEUTRAL',
      payload: {
        title: 'Pythagorean Theorem Derivation',
      },
    },
    animation: { enterTransition: 'fade', activeElements: [] },
    avatar: { framing: 'medium', gesture: 'neutral', gazeTarget: 'student' },
  });

  const builtFormula = buildVisualForBeat(formulaBeat);
  assert(builtFormula.visual.intent === 'FORMULA', 'Fixture E produces FORMULA intent');
  const eqList = builtFormula.visual.payload?.equations || [];
  assert(eqList.length >= 2, `Fixture E generated ${eqList.length} equations (>=2)`);
  assert(eqList[eqList.length - 1]?.isActiveStep === true, 'Fixture E active step is marked');

  // ----------------------------------------------------
  // FIXTURE F: Comparison Matrix ("Mitosis vs Meiosis")
  // ----------------------------------------------------
  console.log('\n--- Fixture F: Comparison Matrix ---');
  const compBeat: UniversalTeachingBeat = UniversalTeachingBeatSchema.parse({
    beatIndex: 0,
    beatId: 'comp-div',
    content: { blocks: [] },
    speechText: 'Compare mitosis and meiosis in terms of divisions, daughter cells, and genetic identity.',
    displayText: 'Mitosis vs Meiosis Cell Division',
    captionText: 'Comparison of cellular division types.',
    visual: {
      intent: 'COMPARISON',
      templateId: 'template.comparison.matrix',
      environment: 'NEUTRAL',
      payload: {
        title: 'Mitosis vs Meiosis',
      },
    },
    animation: { enterTransition: 'fade', activeElements: [] },
    avatar: { framing: 'medium', gesture: 'neutral', gazeTarget: 'student' },
  });

  const builtComp = buildVisualForBeat(compBeat);
  assert(builtComp.visual.intent === 'COMPARISON', 'Fixture F produces COMPARISON intent');
  const compPayload = builtComp.visual.payload?.comparison;
  assert(compPayload?.columns?.length === 2, 'Fixture F comparison has 2 columns');
  assert((compPayload?.rows?.length || 0) >= 3, `Fixture F has ${(compPayload?.rows?.length || 0)} comparison rows`);

  // ----------------------------------------------------
  // FIXTURE G: Legacy VisualType Adapter
  // ----------------------------------------------------
  console.log('\n--- Fixture G: Legacy VisualType Mapping ---');
  assert(mapLegacyVisualTypeToUniversalIntent('FLOWCHART') === 'PROCESS', 'FLOWCHART maps to PROCESS');
  assert(mapLegacyVisualTypeToUniversalIntent('DIAGRAM') === 'DIAGRAM', 'DIAGRAM maps to DIAGRAM');
  assert(mapLegacyVisualTypeToUniversalIntent('FORMULA') === 'FORMULA', 'FORMULA maps to FORMULA');
  assert(mapLegacyVisualTypeToUniversalIntent('COMPARISON') === 'COMPARISON', 'COMPARISON maps to COMPARISON');
  assert(mapLegacyVisualTypeToUniversalIntent('HIGHLIGHT') === 'EXPLANATION', 'HIGHLIGHT maps to EXPLANATION');

  console.log(`\n==================================================`);
  console.log(`INTEGRATION VALIDATION RESULT: ${passed} / ${total} TESTS PASSED`);
  console.log(`==================================================\n`);

  return passed === total;
}

runIntegrationFixturesVerification();
