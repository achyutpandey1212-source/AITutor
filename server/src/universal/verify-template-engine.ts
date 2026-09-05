import {
  UniversalTeachingBeatSchema,
  VisualTemplateSchema,
  type UniversalTeachingBeat,
  type VisualTemplate,
} from '@ai-tutor/shared';

// ==========================================
// 6 CROSS-DOMAIN FIXTURES (Phase 6C)
// ==========================================

// 1. Physics: Force Vector & Mass Object
const physicsBeat: UniversalTeachingBeat = {
  beatIndex: 0,
  beatId: 'physics-force-beat',
  content: {
    blocks: [
      {
        type: 'heading',
        level: 2,
        content: [{ text: 'Newtonian Force and Free Body Diagram' }],
      },
      {
        type: 'definition',
        term: 'Force',
        definition: [
          { text: 'An interaction that changes the motion of a mass ' },
          { text: 'm', marks: ['variable'] },
          { text: ' with acceleration ' },
          { text: 'a', marks: ['variable'] },
          { text: '.' },
        ],
      },
      {
        type: 'formula',
        latex: '\\mathbf{F}_{net} = m \\mathbf{a}',
        explanation: [{ text: 'Net force vector equals mass times acceleration vector' }],
      },
    ],
  },
  speechText: 'When a net force acts on an object, it produces an acceleration directly proportional to the magnitude of the force.',
  displayText: 'Newton’s Second Law: F_net = m · a relates applied net force to mass acceleration.',
  captionText: 'Newton’s Second Law: F_net = m · a relates force to acceleration.',
  visual: {
    intent: 'DIAGRAM',
    templateId: 'template.diagram.spatial',
    environment: 'PHYSICS',
    payload: {
      title: 'Free Body Force Vector Diagram',
      subtitle: 'Mass on Horizontal Surface',
      nodes: [
        { id: 'mass', label: 'Mass m', sublabel: '5.0 kg', category: 'primary', shape: 'box', position: { x: 480, y: 260 } },
        { id: 'f_applied', label: 'F_applied', sublabel: '25 N', category: 'accent', shape: 'pill', position: { x: 720, y: 260 } },
        { id: 'f_normal', label: 'F_normal', category: 'secondary', shape: 'pill', position: { x: 480, y: 120 } },
        { id: 'f_gravity', label: 'F_gravity', category: 'secondary', shape: 'pill', position: { x: 480, y: 400 } },
      ],
      connectors: [
        { id: 'c1', fromNodeId: 'mass', toNodeId: 'f_applied', label: 'F = ma', directed: true },
        { id: 'c2', fromNodeId: 'mass', toNodeId: 'f_normal', directed: true, style: 'dashed' },
        { id: 'c3', fromNodeId: 'mass', toNodeId: 'f_gravity', directed: true, style: 'dashed' },
      ],
      annotations: [
        { id: 'ann-equil', text: 'Vertical equilibrium: Normal force balances Gravity', calloutType: 'rule', position: { x: 80, y: 80 }, targetId: 'mass' },
      ],
    },
  },
  animation: { enterTransition: 'draw', activeElements: ['mass', 'f_applied'] },
  avatar: { framing: 'medium', gesture: 'point_to_visual', gazeTarget: 'board' },
};

// 2. Mathematics: Pythagorean Theorem Formula Derivation
const mathBeat: UniversalTeachingBeat = {
  beatIndex: 1,
  beatId: 'math-pythagoras-beat',
  content: {
    blocks: [
      {
        type: 'heading',
        level: 2,
        content: [{ text: 'The Pythagorean Theorem' }],
      },
      {
        type: 'paragraph',
        content: [
          { text: 'In any right-angled triangle, the area of the square on the ' },
          { text: 'hypotenuse', marks: ['bold', 'term'] },
          { text: ' equals the sum of the areas of the squares on the other two sides.' },
        ],
      },
    ],
  },
  speechText: 'The Pythagorean theorem states that a squared plus b squared equals c squared for any right triangle.',
  displayText: 'Pythagorean Theorem: a² + b² = c² allows solving the hypotenuse from orthogonal side lengths.',
  captionText: 'Pythagorean Theorem: a² + b² = c².',
  visual: {
    intent: 'FORMULA',
    templateId: 'template.formula.derivation',
    environment: 'MATHEMATICS',
    payload: {
      title: 'Hypotenuse Side Derivation',
      subtitle: 'Right Triangle with sides a=3, b=4',
      equations: [
        { id: 'step-1', latex: 'a^2 + b^2 = c^2', explanation: 'Pythagorean theorem definition', isActiveStep: false },
        { id: 'step-2', latex: '3^2 + 4^2 = c^2', explanation: 'Substitute given lengths a=3 and b=4', isActiveStep: false },
        { id: 'step-3', latex: '9 + 16 = c^2 \\implies c^2 = 25', explanation: 'Sum of squares calculation', isActiveStep: false },
        { id: 'step-4', latex: 'c = \\sqrt{25} = 5', explanation: 'Take square root to find hypotenuse length c', isActiveStep: true },
      ],
    },
  },
  animation: { enterTransition: 'stagger_reveal', activeElements: ['step-4'] },
  avatar: { framing: 'medium', gesture: 'explain_two_handed', gazeTarget: 'board' },
};

// 3. Biology: Cell Organelles Hierarchy
const biologyBeat: UniversalTeachingBeat = {
  beatIndex: 2,
  beatId: 'bio-organelles-beat',
  content: {
    blocks: [
      {
        type: 'heading',
        level: 2,
        content: [{ text: 'Eukaryotic Cell Structure' }],
      },
      {
        type: 'paragraph',
        content: [
          { text: 'Eukaryotic cells are defined by membrane-bound compartments that compartmentalize cellular biochemistry.' },
        ],
      },
      {
        type: 'note',
        variant: 'observation',
        content: [{ text: 'Compartmentalization increases enzymatic reaction efficiency by several orders of magnitude.' }],
      },
    ],
  },
  speechText: 'Within the eukaryotic cell, the nucleus protects genomic DNA while mitochondria synthesize cellular ATP.',
  displayText: 'Eukaryotic Cell Compartments: Nucleus stores genetic code; Mitochondria synthesize ATP.',
  captionText: 'Eukaryotic Cell Compartments: Nucleus and Mitochondria.',
  visual: {
    intent: 'DIAGRAM',
    templateId: 'template.diagram.relational',
    environment: 'BIOLOGY',
    payload: {
      title: 'Cell Organelle Functional Hierarchy',
      subtitle: 'Core Membrane-Bound Organelles',
      nodes: [
        { id: 'cell', label: 'Eukaryotic Cell', sublabel: 'Structural Unit', category: 'primary', shape: 'card' },
        { id: 'nucleus', label: 'Nucleus', sublabel: 'DNA Transcription', category: 'accent', shape: 'box' },
        { id: 'mitochondria', label: 'Mitochondria', sublabel: 'ATP Respiration', category: 'secondary', shape: 'box' },
        { id: 'ribosome', label: 'Ribosome', sublabel: 'Protein Translation', category: 'neutral', shape: 'pill' },
      ],
      connectors: [
        { id: 'c1', fromNodeId: 'cell', toNodeId: 'nucleus', label: 'Encloses', directed: true },
        { id: 'c2', fromNodeId: 'cell', toNodeId: 'mitochondria', label: 'Encloses', directed: true },
        { id: 'c3', fromNodeId: 'cell', toNodeId: 'ribosome', label: 'Suspends', directed: true },
      ],
    },
  },
  animation: { enterTransition: 'fade', activeElements: ['nucleus'] },
  avatar: { framing: 'medium', gesture: 'welcoming', gazeTarget: 'student' },
};

// 4. Computer Science: Input -> Process -> Output
const csBeat: UniversalTeachingBeat = {
  beatIndex: 3,
  beatId: 'cs-pipeline-beat',
  content: {
    blocks: [
      {
        type: 'heading',
        level: 2,
        content: [{ text: 'Data Transformation Pipeline' }],
      },
      {
        type: 'step',
        stepNumber: 1,
        title: 'Ingest & Validate',
        content: [{ text: 'Parse binary streams into structured schema records.' }],
      },
      {
        type: 'step',
        stepNumber: 2,
        title: 'Transform & Filter',
        content: [{ text: 'Execute pure functional map/reduce transformations.' }],
      },
      {
        type: 'step',
        stepNumber: 3,
        title: 'Emit & Persist',
        content: [{ text: 'Commit valid records to persistent data sink.' }],
      },
    ],
  },
  speechText: 'Every robust computing pipeline ingests raw input, applies deterministic transformations, and emits clean structured output.',
  displayText: 'Data Pipeline Architecture: Input Stream → Pure Transformations → Result Sink.',
  captionText: 'Data Pipeline Architecture: Input → Process → Output.',
  visual: {
    intent: 'PROCESS',
    templateId: 'template.process.sequential',
    environment: 'COMPUTER_SCIENCE',
    payload: {
      title: 'Sequential Pipeline Architecture',
      subtitle: 'Deterministic Stream Processing',
      nodes: [
        { id: 'in', label: 'Input Ingest', sublabel: 'Buffer Stream', category: 'neutral', shape: 'pill' },
        { id: 'trans', label: 'Transform & Filter', sublabel: 'Pure Functional', category: 'primary', shape: 'box' },
        { id: 'out', label: 'Output Sink', sublabel: 'Persisted Record', category: 'accent', shape: 'pill' },
      ],
      connectors: [
        { id: 'p1', fromNodeId: 'in', toNodeId: 'trans', label: 'Stream', directed: true },
        { id: 'p2', fromNodeId: 'trans', toNodeId: 'out', label: 'Yield', directed: true },
      ],
    },
  },
  animation: { enterTransition: 'stagger_reveal', activeElements: ['trans'] },
  avatar: { framing: 'close', gesture: 'emphasize', gazeTarget: 'student' },
};

// 5. History: Event A -> Event B -> Event C Timeline
const historyBeat: UniversalTeachingBeat = {
  beatIndex: 4,
  beatId: 'history-printing-beat',
  content: {
    blocks: [
      {
        type: 'heading',
        level: 2,
        content: [{ text: 'Information Revolutions in Early Modern Europe' }],
      },
      {
        type: 'paragraph',
        content: [
          { text: 'The dissemination of movable type revolutionized intellectual exchange across the continent.' },
        ],
      },
    ],
  },
  speechText: 'Gutenbergs printing press enabled the rapid dissemination of empirical discoveries, directly sparking the scientific revolution.',
  displayText: 'Historical Causality: Printing Press (1440) → Scientific Revolution (1543) → Enlightenment (18th c.).',
  captionText: 'Historical Causality: Printing Press to Scientific Revolution.',
  visual: {
    intent: 'TIMELINE',
    templateId: 'template.timeline.historical',
    environment: 'HISTORY',
    payload: {
      title: 'Intellectual Milestones of Early Modern Europe',
      subtitle: 'Chronological Progression from Gutenberg to Newton',
      timeline: [
        { timestamp: 'c. 1440', title: 'Gutenberg Printing Press', description: 'Movable type enables mass literacy and book replication', isMilestone: true },
        { timestamp: '1543', title: 'De revolutionibus (Copernicus)', description: 'Heliocentric model challenges Ptolemaic geocentrism', isMilestone: true },
        { timestamp: '1687', title: 'Principia Mathematica (Newton)', description: 'Universal gravitation and laws of classical motion', isMilestone: true },
      ],
    },
  },
  animation: { enterTransition: 'fade', activeElements: [] },
  avatar: { framing: 'full', gesture: 'welcoming', gazeTarget: 'student' },
};

// 6. Literature / Editorial: Semantic Blocks
const literatureBeat: UniversalTeachingBeat = {
  beatIndex: 5,
  beatId: 'lit-metaphor-beat',
  content: {
    blocks: [
      {
        type: 'heading',
        level: 1,
        content: [{ text: 'The Mechanics of Conceptual Metaphor' }],
      },
      {
        type: 'paragraph',
        content: [
          { text: 'A metaphor is not merely a stylistic ornament of language; it is a fundamental ' },
          { text: 'cognitive mechanism', marks: ['bold', 'term'] },
          { text: ' through which we comprehend abstract domains in terms of concrete physical experience.' },
        ],
      },
      {
        type: 'definition',
        term: 'Conceptual Metaphor',
        definition: [
          { text: 'The systematic mapping of knowledge from a familiar ' },
          { text: 'source domain', marks: ['emphasis'] },
          { text: ' onto an abstract ' },
          { text: 'target domain', marks: ['emphasis'] },
          { text: '.' },
        ],
      },
      {
        type: 'quote',
        content: [{ text: 'Our ordinary conceptual system, in terms of which we both think and act, is fundamentally metaphorical in nature.' }],
        attribution: 'George Lakoff & Mark Johnson, Metaphors We Live By',
      },
      {
        type: 'example',
        title: 'Time is Money',
        content: [
          {
            type: 'paragraph',
            content: [{ text: 'We spend time, waste time, save time, and invest time in projects.' }],
          },
        ],
      },
      {
        type: 'note',
        variant: 'tip',
        content: [{ text: 'Look for how physical bodily experience grounds abstract vocabulary.' }],
      },
    ],
  },
  speechText: 'Metaphor is fundamentally cognitive. We understand time, an abstract entity, through the physical vocabulary of currency and resources.',
  displayText: 'Conceptual Metaphor: Mapping concrete physical source domains onto abstract target experiences.',
  captionText: 'Conceptual Metaphor: Concrete sources ground abstract ideas.',
  visual: {
    intent: 'EXPLANATION',
    templateId: 'template.explanation.editorial',
    environment: 'LITERATURE',
    payload: {
      title: 'Conceptual Metaphor Theory',
      subtitle: 'Cognitive Linguistics and Linguistic Framing',
    },
  },
  animation: { enterTransition: 'fade', activeElements: [] },
  avatar: { framing: 'medium', gesture: 'explain_two_handed', gazeTarget: 'student' },
};

// ==========================================
// TEST SUITE
// ==========================================
export function runTemplateEngineVerification(): boolean {
  console.log('\n==================================================');
  console.log('PHASE 6C: UNIVERSAL TEMPLATE ENGINE VALIDATION');
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
  // 1. Fixture Schema Acceptance Tests (All 6 Domains)
  // ----------------------------------------------------
  console.log('--- 1. Cross-Domain Fixture Schema Acceptance ---');
  const fixtures = [
    { domain: 'PHYSICS', beat: physicsBeat },
    { domain: 'MATHEMATICS', beat: mathBeat },
    { domain: 'BIOLOGY', beat: biologyBeat },
    { domain: 'COMPUTER_SCIENCE', beat: csBeat },
    { domain: 'HISTORY', beat: historyBeat },
    { domain: 'LITERATURE', beat: literatureBeat },
  ];

  for (const { domain, beat } of fixtures) {
    try {
      UniversalTeachingBeatSchema.parse(beat);
      assert(true, `Fixture '${domain}' (${beat.visual.templateId}) passes UniversalTeachingBeatSchema`);
    } catch (err: any) {
      assert(false, `Fixture '${domain}' validation failed`, err?.message);
    }
  }

  // ----------------------------------------------------
  // 2. Registry Completeness (All 11 Template IDs)
  // ----------------------------------------------------
  console.log('\n--- 2. Template Registry Completeness ---');
  const allTemplates: VisualTemplate[] = [
    'template.explanation.editorial',
    'template.diagram.relational',
    'template.diagram.spatial',
    'template.process.sequential',
    'template.formula.derivation',
    'template.graph.cartesian',
    'template.comparison.matrix',
    'template.code.walkthrough',
    'template.timeline.historical',
    'template.media.grounded',
    'template.simulation.interactive',
  ];

  // Verify each is a valid enum value in VisualTemplateSchema
  for (const tId of allTemplates) {
    try {
      VisualTemplateSchema.parse(tId);
      assert(true, `Template ID '${tId}' is registered in canonical VisualTemplateSchema`);
    } catch {
      assert(false, `Template ID '${tId}' missing from VisualTemplateSchema`);
    }
  }

  // ----------------------------------------------------
  // 3. Content Block Semantic Hierarchy
  // ----------------------------------------------------
  console.log('\n--- 3. Semantic Content Block Hierarchy ---');
  const blocks = literatureBeat.content.blocks;
  const blockTypes = blocks.map((b) => b.type);

  assert(blockTypes.includes('heading'), 'Heading block represented in semantic content');
  assert(blockTypes.includes('paragraph'), 'Paragraph block represented in semantic content');
  assert(blockTypes.includes('definition'), 'Definition block represented in semantic content');
  assert(blockTypes.includes('quote'), 'Quote block represented in semantic content');
  assert(blockTypes.includes('example'), 'Example block represented in semantic content');
  assert(blockTypes.includes('note'), 'Note block represented in semantic content');

  // Verify inline marks on definitions and paragraphs
  const defBlock = blocks.find((b) => b.type === 'definition') as any;
  assert(defBlock.term === 'Conceptual Metaphor', 'Definition block preserves structured term string');
  assert(defBlock.definition.some((ic: any) => ic.marks?.includes('emphasis')), 'Definition block preserves inline emphasis marks');

  // ----------------------------------------------------
  // 4. Comparison Matrix Structure
  // ----------------------------------------------------
  console.log('\n--- 4. Comparison Matrix Structure ---');
  const comparisonBeat: UniversalTeachingBeat = {
    beatIndex: 6,
    beatId: 'comp-beat',
    content: { blocks: [] },
    speechText: 'Comparing mitosis and meiosis cell division mechanisms.',
    displayText: 'Mitosis vs Meiosis: Somatic cell duplication vs Gamete genetic variation.',
    captionText: 'Mitosis vs Meiosis.',
    visual: {
      intent: 'COMPARISON',
      templateId: 'template.comparison.matrix',
      environment: 'BIOLOGY',
      payload: {
        title: 'Mitosis vs. Meiosis',
        subtitle: 'Cell Division Comparison',
        comparison: {
          columns: [
            { id: 'mitosis', header: 'Mitosis' },
            { id: 'meiosis', header: 'Meiosis' },
          ],
          rows: [
            { label: 'Daughter Cells', values: { mitosis: '2 Diploid (2n)', meiosis: '4 Haploid (n)' } },
            { label: 'Genetic Identity', values: { mitosis: 'Genetically Identical', meiosis: 'Genetically Diverse (Crossing Over)' } },
            { label: 'Divisions', values: { mitosis: '1 Division', meiosis: '2 Divisions' } },
          ],
        },
      },
    },
    animation: { enterTransition: 'fade', activeElements: [] },
    avatar: { framing: 'medium', gesture: 'explain_two_handed', gazeTarget: 'student' },
  };

  try {
    UniversalTeachingBeatSchema.parse(comparisonBeat);
    assert(true, 'Comparison Matrix beat passes UniversalTeachingBeatSchema validation');
    assert(comparisonBeat.visual.payload.comparison?.columns.length === 2, 'Comparison columns structured correctly');
    assert(comparisonBeat.visual.payload.comparison?.rows.length === 3, 'Comparison rows structured correctly');
  } catch (err: any) {
    assert(false, 'Comparison Matrix validation failed', err?.message);
  }

  // ----------------------------------------------------
  // 5. Code Walkthrough Structure
  // ----------------------------------------------------
  console.log('\n--- 5. Code Walkthrough Structure ---');
  const codeBeat: UniversalTeachingBeat = {
    beatIndex: 7,
    beatId: 'code-beat',
    content: {
      blocks: [
        {
          type: 'code',
          language: 'python',
          code: 'def fib(n):\n    if n <= 1: return n\n    return fib(n-1) + fib(n-2)',
          caption: 'Recursive Fibonacci implementation',
        },
      ],
    },
    speechText: 'The base case returns immediately when n is less than or equal to one.',
    displayText: 'Recursive Fibonacci: Base condition handles n<=1, else recurses.',
    captionText: 'Recursive Fibonacci implementation.',
    visual: {
      intent: 'CODE',
      templateId: 'template.code.walkthrough',
      environment: 'COMPUTER_SCIENCE',
      payload: {
        title: 'Recursive Fibonacci',
        code: {
          language: 'python',
          codeString: 'def fib(n):\n    if n <= 1: return n\n    return fib(n-1) + fib(n-2)',
          highlightLines: [2],
        },
      },
    },
    animation: { enterTransition: 'fade', activeElements: [] },
    avatar: { framing: 'close', gesture: 'point_to_visual', gazeTarget: 'student' },
  };

  try {
    UniversalTeachingBeatSchema.parse(codeBeat);
    assert(true, 'Code Walkthrough beat passes UniversalTeachingBeatSchema validation');
    assert(codeBeat.visual.payload.code?.highlightLines?.[0] === 2, 'Highlighted code line preserved in payload');
  } catch (err: any) {
    assert(false, 'Code Walkthrough validation failed', err?.message);
  }

  // ----------------------------------------------------
  // 6. Negative Resilience & Graceful Fallbacks
  // ----------------------------------------------------
  console.log('\n--- 6. Negative Resilience & Error Recovery ---');

  // Negative: Unknown / Arbitrary Template ID
  try {
    const invalidTemplateBeat = {
      ...literatureBeat,
      visual: { ...literatureBeat.visual, templateId: 'template.unknown.arbitrary' as any },
    };
    UniversalTeachingBeatSchema.parse(invalidTemplateBeat);
    assert(false, 'Unknown template ID was accepted by schema, should fail');
  } catch {
    assert(true, 'Schema strictly rejects unregistered template IDs');
  }

  // Negative: Missing speechText rejected
  try {
    const invalidSpeechBeat = { ...physicsBeat, speechText: '' };
    UniversalTeachingBeatSchema.parse(invalidSpeechBeat);
    assert(false, 'Empty speechText was accepted by schema, should fail');
  } catch {
    assert(true, 'Schema strictly rejects beats with empty speechText');
  }

  // Negative: Missing displayText rejected
  try {
    const invalidDisplayBeat = { ...physicsBeat, displayText: '' };
    UniversalTeachingBeatSchema.parse(invalidDisplayBeat);
    assert(false, 'Empty displayText was accepted by schema, should fail');
  } catch {
    assert(true, 'Schema strictly rejects beats with empty displayText');
  }

  // Negative: Empty payload permitted (templates must provide clean fallback without crashing)
  try {
    const emptyPayloadBeat: UniversalTeachingBeat = {
      ...physicsBeat,
      visual: {
        intent: 'EXPLANATION',
        templateId: 'template.explanation.editorial',
        environment: 'NEUTRAL',
        payload: {},
      },
    };
    UniversalTeachingBeatSchema.parse(emptyPayloadBeat);
    assert(true, 'Beats with empty visual payload remain valid for fallback rendering');
  } catch (err: any) {
    assert(false, 'Empty payload beat failed schema validation', err?.message);
  }

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  console.log('\n==================================================');
  console.log(`VALIDATION RESULT: ${passed} / ${total} TESTS PASSED`);
  console.log('==================================================\n');

  return passed === total;
}

const success = runTemplateEngineVerification();
if (!success) {
  process.exit(1);
}
