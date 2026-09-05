import {
  defaultUniversalVisualPlanner,
  defaultUniversalVisualBuilderRegistry,
  buildVisualForBeat,
  UniversalTeachingBeatSchema,
  type UniversalTeachingBeat,
  EditorialExplanationBuilder,
  RelationalDiagramBuilder,
  SpatialDiagramBuilder,
  SequentialProcessBuilder,
  FormulaBuilder,
  GraphBuilder,
  ComparisonBuilder,
  CodeBuilder,
} from '@ai-tutor/shared';

export function runVisualBuildersVerification(): boolean {
  console.log('\n==================================================');
  console.log('PHASE 6E: UNIVERSAL VISUAL BUILDERS VALIDATION');
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

  const registry = defaultUniversalVisualBuilderRegistry;

  // Helper to create a minimal valid base beat
  function createBaseBeat(overrides: Partial<UniversalTeachingBeat> = {}): UniversalTeachingBeat {
    return UniversalTeachingBeatSchema.parse({
      beatIndex: 0,
      beatId: 'test-beat',
      content: { blocks: [] },
      speechText: 'Explanation speech text for this beat.',
      displayText: 'Explanation display text for this beat.',
      captionText: 'Explanation caption.',
      visual: {
        intent: 'EXPLANATION',
        templateId: 'template.explanation.editorial',
        environment: 'NEUTRAL',
        payload: {},
      },
      animation: {
        enterTransition: 'fade',
        activeElements: [],
      },
      avatar: {
        framing: 'medium',
        gesture: 'neutral',
        gazeTarget: 'student',
      },
      ...overrides,
    });
  }

  // ----------------------------------------------------
  // 1. Builder Registry Resolution
  // ----------------------------------------------------
  console.log('--- 1. Builder Registry Resolution ---');
  const editorial = registry.resolveBuilder('EXPLANATION', 'template.explanation.editorial');
  assert(editorial instanceof EditorialExplanationBuilder, 'Resolves EditorialExplanationBuilder for EXPLANATION');

  const relational = registry.resolveBuilder('DIAGRAM', 'template.diagram.relational');
  assert(relational instanceof RelationalDiagramBuilder, 'Resolves RelationalDiagramBuilder for DIAGRAM relational');

  const spatial = registry.resolveBuilder('DIAGRAM', 'template.diagram.spatial');
  assert(spatial instanceof SpatialDiagramBuilder, 'Resolves SpatialDiagramBuilder for DIAGRAM spatial');

  const processBuilder = registry.resolveBuilder('PROCESS', 'template.process.sequential');
  assert(processBuilder instanceof SequentialProcessBuilder, 'Resolves SequentialProcessBuilder for PROCESS');

  const formula = registry.resolveBuilder('FORMULA', 'template.formula.derivation');
  assert(formula instanceof FormulaBuilder, 'Resolves FormulaBuilder for FORMULA');

  const graph = registry.resolveBuilder('GRAPH', 'template.graph.cartesian');
  assert(graph instanceof GraphBuilder, 'Resolves GraphBuilder for GRAPH');

  const comparison = registry.resolveBuilder('COMPARISON', 'template.comparison.matrix');
  assert(comparison instanceof ComparisonBuilder, 'Resolves ComparisonBuilder for COMPARISON');

  const code = registry.resolveBuilder('CODE', 'template.code.walkthrough');
  assert(code instanceof CodeBuilder, 'Resolves CodeBuilder for CODE');

  // ----------------------------------------------------
  // 2. Editorial Explanation Builder
  // ----------------------------------------------------
  console.log('\n--- 2. Editorial Explanation Builder ---');
  const beatEditorial = createBaseBeat({
    content: {
      blocks: [
        { type: 'heading', level: 1, content: [{ text: 'Existential Philosophy' }] },
        { type: 'paragraph', content: [{ text: 'Key exploration of human freedom and authenticity.' }] },
      ],
    },
    displayText: 'Existentialism explores human purpose, freedom, and radical authenticity.',
    speechText: 'Existentialism explores human purpose, freedom, and radical authenticity.',
  });
  const builtEditorial = buildVisualForBeat(beatEditorial);
  assert(
    builtEditorial.visual.intent === 'EXPLANATION' &&
    builtEditorial.visual.templateId === 'template.explanation.editorial' &&
    builtEditorial.visual.payload.title === 'Existential Philosophy',
    'Editorial builder formats title and preserves semantic block hierarchy'
  );

  // ----------------------------------------------------
  // 3. Relational Diagram Builder (Biology Fixture)
  // ----------------------------------------------------
  console.log('\n--- 3. Relational Diagram Builder ---');
  const beatBioRelational = createBaseBeat({
    displayText: 'What are the main parts of a cell? We study the nucleus, mitochondria, ribosomes, and cell membrane.',
    speechText: 'The cell contains a nucleus, mitochondria, ribosomes, and a protective cell membrane.',
    content: {
      blocks: [
        {
          type: 'list',
          ordered: false,
          items: [
            [{ text: 'Nucleus' }],
            [{ text: 'Mitochondria' }],
            [{ text: 'Ribosomes' }],
            [{ text: 'Cell Membrane' }],
          ],
        },
      ],
    },
    visual: {
      intent: 'DIAGRAM',
      templateId: 'template.diagram.relational',
      environment: 'BIOLOGY',
      payload: {},
    },
  });
  const builtBio = buildVisualForBeat(beatBioRelational);
  const bioNodes = builtBio.visual.payload.nodes || [];
  const bioConnectors = builtBio.visual.payload.connectors || [];
  assert(
    bioNodes.length === 5 && bioNodes[0]?.label === 'Cell',
    `Relational builder constructed root 'Cell' node + 4 organelles (got ${bioNodes.length} nodes)`
  );
  assert(
    bioConnectors.length === 4 && bioConnectors.every((c) => c.fromNodeId === 'node-root'),
    `Relational builder connected root to all child nodes (${bioConnectors.length} connectors)`
  );
  assert(
    bioNodes.every((n) => n.position && typeof n.position.x === 'number' && typeof n.position.y === 'number'),
    'All relational nodes have deterministic layout coordinates assigned'
  );

  // ----------------------------------------------------
  // 4. Spatial Diagram Builder (Physics Force Fixture)
  // ----------------------------------------------------
  console.log('\n--- 4. Spatial Diagram Builder ---');
  const beatPhysSpatial = createBaseBeat({
    displayText: 'Free body diagram: forces acting on an object include normal force, gravity, and applied force.',
    speechText: 'A mass rests on a surface with normal force upward, gravity downward, and an applied force.',
    visual: {
      intent: 'DIAGRAM',
      templateId: 'template.diagram.spatial',
      environment: 'PHYSICS',
      payload: {},
    },
  });
  const builtPhysSpatial = buildVisualForBeat(beatPhysSpatial);
  const physNodes = builtPhysSpatial.visual.payload.nodes || [];
  const physConnectors = builtPhysSpatial.visual.payload.connectors || [];
  assert(
    physNodes.some((n) => n.id === 'node-obj') &&
    physNodes.some((n) => n.id === 'node-fn') &&
    physNodes.some((n) => n.id === 'node-fg'),
    `Spatial builder generated central mass with normal force and gravity nodes (${physNodes.length} nodes)`
  );
  assert(
    physConnectors.some((c) => c.toNodeId === 'node-fn') &&
    physConnectors.some((c) => c.toNodeId === 'node-fg'),
    'Spatial builder generated directional vector connectors from central object'
  );

  // ----------------------------------------------------
  // 5. Sequential Process Builder (CS Fixture)
  // ----------------------------------------------------
  console.log('\n--- 5. Sequential Process Builder ---');
  const beatCSProcess = createBaseBeat({
    displayText: 'How does binary search work step-by-step?',
    speechText: 'Binary search repeatedly divides the search interval in half.',
    content: {
      blocks: [
        { type: 'step', stepNumber: 1, title: 'Sorted Array', content: [{ text: 'Array must be sorted' }] },
        { type: 'step', stepNumber: 2, title: 'Find Middle', content: [{ text: 'Calculate mid index' }] },
        { type: 'step', stepNumber: 3, title: 'Compare Target', content: [{ text: 'Check against target' }] },
        { type: 'step', stepNumber: 4, title: 'Discard Half', content: [{ text: 'Eliminate non-matching half' }] },
      ],
    },
    visual: {
      intent: 'PROCESS',
      templateId: 'template.process.sequential',
      environment: 'COMPUTER_SCIENCE',
      payload: {},
    },
  });
  const builtCS = buildVisualForBeat(beatCSProcess);
  const csNodes = builtCS.visual.payload.nodes || [];
  const csConnectors = builtCS.visual.payload.connectors || [];
  assert(
    csNodes.length === 4 && csNodes[0]?.label === 'Sorted Array',
    `Process builder extracted 4 structured StepBlocks into sequential nodes (got ${csNodes.length})`
  );
  assert(
    csConnectors.length === 3 && csConnectors[0]?.fromNodeId === 'step-1' && csConnectors[0]?.toNodeId === 'step-2',
    'Process builder chained sequential steps with directed connectors'
  );
  assert(
    builtCS.animation.activeElements.includes('step-1'),
    'Process builder marked initial step as active in animation directives'
  );

  // ----------------------------------------------------
  // 6. Formula Builder (Math Derivation Fixture)
  // ----------------------------------------------------
  console.log('\n--- 6. Formula Derivation Builder ---');
  const beatMathFormula = createBaseBeat({
    displayText: 'Derive the Pythagorean relationship.',
    speechText: 'We start from a squared plus b squared equals c squared and solve for c.',
    content: {
      blocks: [
        { type: 'formula', latex: 'a^2 + b^2 = c^2', explanation: [{ text: 'Base Pythagorean theorem' }] },
        { type: 'formula', latex: 'c^2 = a^2 + b^2', explanation: [{ text: 'Symmetric property' }] },
        { type: 'formula', latex: 'c = \\sqrt{a^2 + b^2}', explanation: [{ text: 'Principal square root' }] },
      ],
    },
    visual: {
      intent: 'FORMULA',
      templateId: 'template.formula.derivation',
      environment: 'MATHEMATICS',
      payload: {},
    },
  });
  const builtMath = buildVisualForBeat(beatMathFormula);
  const equations = builtMath.visual.payload.equations || [];
  assert(
    equations.length === 3 && equations[2]?.latex === 'c = \\sqrt{a^2 + b^2}',
    `Formula builder built 3 equation lines (got ${equations.length})`
  );
  assert(
    equations[2]?.isActiveStep === true && equations[0]?.isActiveStep === false,
    'Final derivation line is designated as active step'
  );

  // ----------------------------------------------------
  // 7. Graph Builder (Physics Velocity-Time Fixture)
  // ----------------------------------------------------
  console.log('\n--- 7. Cartesian Graph Builder ---');
  const beatPhysGraph = createBaseBeat({
    displayText: 'Velocity changes with time under constant acceleration.',
    speechText: 'Graphing velocity over time reveals a straight line with slope equal to acceleration.',
    visual: {
      intent: 'GRAPH',
      templateId: 'template.graph.cartesian',
      environment: 'PHYSICS',
      payload: {},
    },
  });
  const builtPhysGraph = buildVisualForBeat(beatPhysGraph);
  const axes = builtPhysGraph.visual.payload.axes;
  const series = builtPhysGraph.visual.payload.series || [];
  assert(
    axes !== undefined && axes.x.label === 'Time (t)' && axes.y.label === 'Velocity (v)',
    'Graph builder configured time and velocity Cartesian axes'
  );
  assert(
    series.length > 0 && series[0]?.points.length === 6 && series[0]?.curveType === 'linear',
    `Graph builder generated linear acceleration data series (${series[0]?.points.length} points)`
  );

  // ----------------------------------------------------
  // 8. Comparison Builder (Biology Mitosis vs Meiosis Fixture)
  // ----------------------------------------------------
  console.log('\n--- 8. Comparison Matrix Builder ---');
  const beatBioComparison = createBaseBeat({
    displayText: 'Compare mitosis vs meiosis in terms of daughter cells and genetic identity.',
    speechText: 'Mitosis results in two identical diploid cells, whereas meiosis yields four diverse haploid cells.',
    visual: {
      intent: 'COMPARISON',
      templateId: 'template.comparison.matrix',
      environment: 'BIOLOGY',
      payload: {},
    },
  });
  const builtComparison = buildVisualForBeat(beatBioComparison);
  const comp = builtComparison.visual.payload.comparison;
  assert(
    comp !== undefined && comp.columns.length === 2 && comp.columns[0]?.header === 'Mitosis',
    'Comparison builder structured Mitosis and Meiosis columns'
  );
  assert(
    comp !== undefined && comp.rows.length >= 3 && comp.rows.some((r) => r.label === 'Daughter Cells'),
    `Comparison builder structured comparison rows with traits (rows: ${comp?.rows.length})`
  );

  // ----------------------------------------------------
  // 9. Code Walkthrough Builder (CS Recursive Function Fixture)
  // ----------------------------------------------------
  console.log('\n--- 9. Code Walkthrough Builder ---');
  const beatCSCode = createBaseBeat({
    displayText: 'Trace this recursive factorial implementation in python.',
    speechText: 'Observe how each recursive call pauses until the base case is reached.',
    content: {
      blocks: [
        {
          type: 'code',
          language: 'python',
          code: 'def factorial(n):\n  if n <= 1:\n    return 1\n  return n * factorial(n - 1)',
        },
      ],
    },
    visual: {
      intent: 'CODE',
      templateId: 'template.code.walkthrough',
      environment: 'COMPUTER_SCIENCE',
      payload: {},
    },
  });
  const builtCode = buildVisualForBeat(beatCSCode);
  const codePayload = builtCode.visual.payload.code;
  assert(
    codePayload !== undefined && codePayload.language === 'python',
    'Code builder captured python language'
  );
  assert(
    Boolean(
      codePayload !== undefined &&
      codePayload.codeString.includes('def factorial') &&
      codePayload.highlightLines?.includes(1)
    ),
    'Code builder formatted code string and initial execution highlight'
  );

  // ----------------------------------------------------
  // 10. Reserved Builders & Safe Fallbacks
  // ----------------------------------------------------
  console.log('\n--- 10. Reserved Builders & Fallbacks ---');
  // Simulation builder -> safely unsupported
  const beatSim = createBaseBeat({
    displayText: 'Run this interactive simulation.',
    visual: {
      intent: 'SIMULATION',
      templateId: 'template.simulation.interactive',
      environment: 'PHYSICS',
      payload: {},
    },
  });
  const builtSim = buildVisualForBeat(beatSim);
  assert(
    builtSim.visual.intent === 'EXPLANATION' && builtSim.visual.templateId === 'template.explanation.editorial',
    'InteractiveSimulationBuilder safely falls back to editorial explanation'
  );

  // Media builder without media asset -> safely unsupported
  const beatMedia = createBaseBeat({
    displayText: 'Display this external microscope image.',
    visual: {
      intent: 'MEDIA',
      templateId: 'template.media.grounded',
      environment: 'BIOLOGY',
      payload: {},
    },
  });
  const builtMedia = buildVisualForBeat(beatMedia);
  assert(
    builtMedia.visual.intent === 'EXPLANATION',
    'GroundedMediaBuilder without pre-existing asset safely falls back to editorial'
  );

  // ----------------------------------------------------
  // 11. Semantic ContentBlock Priority Over Text Scraping
  // ----------------------------------------------------
  console.log('\n--- 11. ContentBlock Priority ---');
  // FormulaBlock forces formula payload even if text mentions other things
  const beatFormulaPriority = createBaseBeat({
    displayText: 'Comparing different mathematical concepts while deriving the theorem.',
    content: {
      blocks: [
        { type: 'formula', latex: 'E = m c^2', explanation: [{ text: 'Mass-energy equivalence' }] },
      ],
    },
  });
  const builtFormulaPriority = buildVisualForBeat(beatFormulaPriority);
  assert(
    builtFormulaPriority.visual.intent === 'FORMULA' &&
    builtFormulaPriority.visual.payload.equations?.[0]?.latex === 'E = m c^2',
    'FormulaBlock takes priority over generic comparative text'
  );

  // ----------------------------------------------------
  // 12. Missing Data Fallback (Zero Hallucination)
  // ----------------------------------------------------
  console.log('\n--- 12. Missing Data Fallback & Zero Hallucination ---');
  // Empty diagram input without entities must NOT hallucinate fake "Node A -> Node B"
  const beatEmptyDiagram = createBaseBeat({
    displayText: 'Let us talk about an abstract concept without specific components.',
    visual: {
      intent: 'DIAGRAM',
      templateId: 'template.diagram.relational',
      environment: 'NEUTRAL',
      payload: {},
    },
  });
  const builtEmptyDiagram = buildVisualForBeat(beatEmptyDiagram);
  assert(
    builtEmptyDiagram.visual.intent === 'EXPLANATION' &&
    (builtEmptyDiagram.visual.payload.nodes === undefined || builtEmptyDiagram.visual.payload.nodes.length === 0),
    'Empty relational diagram safely falls back to EXPLANATION without generating fake placeholder nodes'
  );

  // ----------------------------------------------------
  // 13. Existing Visual Payload Preservation
  // ----------------------------------------------------
  console.log('\n--- 13. Existing Visual Payload Preservation ---');
  const existingNode = { id: 'pre-existing-node', label: 'Custom Node', shape: 'box' as const };
  const beatExisting = createBaseBeat({
    visual: {
      intent: 'DIAGRAM',
      templateId: 'template.diagram.relational',
      environment: 'BIOLOGY',
      payload: {
        title: 'Custom Preserved Title',
        nodes: [existingNode],
      },
    },
  });
  const builtPreserved = buildVisualForBeat(beatExisting);
  assert(
    builtPreserved.visual.payload.title === 'Custom Preserved Title' &&
    builtPreserved.visual.payload.nodes?.[0]?.id === 'pre-existing-node',
    'Explicit pre-existing visual payload is 100% preserved and not overwritten'
  );

  // ----------------------------------------------------
  // 14. Deterministic Reproducibility
  // ----------------------------------------------------
  console.log('\n--- 14. Deterministic Reproducibility ---');
  let isStrictlyDeterministic = true;
  const initialBuilt = JSON.stringify(buildVisualForBeat(beatCSProcess));
  for (let i = 0; i < 10; i++) {
    const repeatBuilt = JSON.stringify(buildVisualForBeat(beatCSProcess));
    if (repeatBuilt !== initialBuilt) {
      isStrictlyDeterministic = false;
      break;
    }
  }
  assert(isStrictlyDeterministic, 'Builder pipeline produces exact identical output across 10 consecutive runs');

  // ----------------------------------------------------
  // 15. Schema Validation of All Output Beats
  // ----------------------------------------------------
  console.log('\n--- 15. Conforming Universal Schema Validation ---');
  try {
    UniversalTeachingBeatSchema.parse(builtBio);
    UniversalTeachingBeatSchema.parse(builtPhysSpatial);
    UniversalTeachingBeatSchema.parse(builtCS);
    UniversalTeachingBeatSchema.parse(builtMath);
    UniversalTeachingBeatSchema.parse(builtPhysGraph);
    UniversalTeachingBeatSchema.parse(builtComparison);
    UniversalTeachingBeatSchema.parse(builtCode);
    assert(true, 'All builder-produced beats strictly conform to UniversalTeachingBeatSchema');
  } catch (err: any) {
    assert(false, 'Schema validation failed for built beats', err?.message);
  }

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  console.log('\n==================================================');
  console.log(`VALIDATION RESULT: ${passed} / ${total} TESTS PASSED`);
  console.log('==================================================\n');

  return passed === total;
}

const success = runVisualBuildersVerification();
if (!success) {
  process.exit(1);
}
