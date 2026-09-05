import {
  UniversalTeachingBeatSchema,
  UniversalTeachingBeat,
  adaptUniversalBeatToLegacyVisualState,
  TutorVisualStateSchema,
} from '@ai-tutor/shared';

// ==========================================
// 1. PHYSICS DOMAIN (Quantum Mechanics: Wave-Particle Duality)
// ==========================================
const physicsBeat: UniversalTeachingBeat = {
  beatIndex: 0,
  beatId: 'physics-quantum-beat-1',
  content: {
    blocks: [
      {
        type: 'heading',
        level: 2,
        content: [{ text: 'Wave-Particle Duality of Light' }],
      },
      {
        type: 'paragraph',
        content: [
          { text: 'Electromagnetic radiation exhibits both ' },
          { text: 'wave-like', marks: ['bold'] },
          { text: ' and ' },
          { text: 'particle-like', marks: ['bold'] },
          { text: ' properties depending on the measurement apparatus.' },
        ],
      },
      {
        type: 'formula',
        latex: 'E = h \\nu = \\frac{h c}{\\lambda}',
        explanation: [{ text: 'Energy of a photon as a function of Planck constant and frequency' }],
      },
    ],
  },
  speechText:
    'Light behaves as both a continuous wave and discrete packets of energy known as photons. Albert Einstein demonstrated this through the photoelectric effect.',
  displayText:
    'Light demonstrates wave-particle duality: E = hν connects photon energy to frequency.',
  captionText:
    'Light demonstrates wave-particle duality: E = hν connects photon energy to frequency.',
  visual: {
    intent: 'FORMULA',
    templateId: 'template.formula.derivation',
    environment: 'PHYSICS',
    payload: {
      title: 'Planck-Einstein Relation',
      subtitle: 'Wave-Particle Energy Quantization',
      equations: [
        {
          id: 'eq-1',
          latex: 'E = h \\nu',
          explanation: 'Photon energy is proportional to frequency',
          isActiveStep: true,
        },
        {
          id: 'eq-2',
          latex: '\\nu = \\frac{c}{\\lambda}',
          explanation: 'Frequency related to speed of light and wavelength',
          isActiveStep: false,
        },
        {
          id: 'eq-3',
          latex: 'E = \\frac{h c}{\\lambda}',
          explanation: 'Combined relation in terms of wavelength',
          isActiveStep: false,
        },
      ],
    },
  },
  animation: {
    enterTransition: 'stagger_reveal',
    activeElements: ['eq-1'],
  },
  avatar: {
    framing: 'medium',
    gesture: 'explain_two_handed',
    gazeTarget: 'board',
  },
};

// ==========================================
// 2. MATHEMATICS DOMAIN (Linear Algebra: Eigenvalues & Eigenvectors)
// ==========================================
const mathBeat: UniversalTeachingBeat = {
  beatIndex: 1,
  beatId: 'math-eigen-beat-1',
  content: {
    blocks: [
      {
        type: 'heading',
        level: 2,
        content: [{ text: 'Eigenvectors and Eigenvalues' }],
      },
      {
        type: 'definition',
        term: 'Eigenvector',
        definition: [
          { text: 'A non-zero vector ' },
          { text: 'v', marks: ['variable'] },
          { text: ' whose direction remains unchanged when a linear transformation ' },
          { text: 'A', marks: ['variable'] },
          { text: ' is applied.' },
        ],
      },
      {
        type: 'formula',
        latex: 'A \\mathbf{v} = \\lambda \\mathbf{v}',
        explanation: [{ text: 'Linear transformation A scales vector v by factor lambda' }],
      },
    ],
  },
  speechText:
    'When matrix A acts on an eigenvector v, the vector only scales in magnitude by lambda, without changing its direction line.',
  displayText:
    'Eigenvalue Equation: A v = λ v where λ is the scaling eigenvalue.',
  captionText:
    'Eigenvalue Equation: A v = λ v where λ is the scaling eigenvalue.',
  visual: {
    intent: 'DIAGRAM',
    templateId: 'template.diagram.relational',
    environment: 'MATHEMATICS',
    payload: {
      title: 'Eigenvector Geometric Transformation',
      subtitle: 'Matrix Scaling Invariance',
      nodes: [
        { id: 'origin', label: '(0, 0)', category: 'neutral', position: { x: 0, y: 0 } },
        { id: 'v', label: 'Vector v', category: 'primary', position: { x: 2, y: 1 } },
        { id: 'Av', label: 'Transformed Av = λv', category: 'accent', position: { x: 4, y: 2 } },
      ],
      connectors: [
        { id: 'scale-line', fromNodeId: 'v', toNodeId: 'Av', style: 'dashed', directed: true, label: 'scaled by λ' },
      ],
    },
  },
  animation: {
    enterTransition: 'draw',
    activeElements: ['v', 'Av'],
  },
  avatar: {
    framing: 'medium',
    gesture: 'point_to_visual',
    gazeTarget: 'board',
  },
};

// ==========================================
// 3. BIOLOGY DOMAIN (Cellular Respiration: ATP Synthesis)
// ==========================================
const biologyBeat: UniversalTeachingBeat = {
  beatIndex: 2,
  beatId: 'bio-respiration-beat-1',
  content: {
    blocks: [
      {
        type: 'heading',
        level: 2,
        content: [{ text: 'Chemiosmosis and ATP Synthase' }],
      },
      {
        type: 'paragraph',
        content: [
          { text: 'Protons accumulated in the intermembrane space flow back down their electrochemical gradient via ' },
          { text: 'ATP synthase', marks: ['bold', 'term'] },
          { text: ', phosphorylating ADP to ATP.' },
        ],
      },
      {
        type: 'step',
        stepNumber: 1,
        title: 'Proton Gradient Creation',
        content: [{ text: 'Electron transport chain pumps H+ into intermembrane space.' }],
      },
      {
        type: 'step',
        stepNumber: 2,
        title: 'Proton Motive Force',
        content: [{ text: 'H+ flows back across inner mitochondrial membrane through ATP synthase rotor.' }],
      },
    ],
  },
  speechText:
    'As hydrogen ions rush through ATP synthase, the molecular rotor turns, driving the condensation of ADP and inorganic phosphate into ATP.',
  displayText:
    'ATP Synthase utilizes the proton motive force (H+ gradient) to synthesize ATP.',
  captionText:
    'ATP Synthase utilizes the proton motive force (H+ gradient) to synthesize ATP.',
  visual: {
    intent: 'PROCESS',
    templateId: 'template.process.sequential',
    environment: 'BIOLOGY',
    payload: {
      title: 'Mitochondrial ATP Synthesis',
      subtitle: 'Chemiosmotic Coupling',
      nodes: [
        { id: 'stage1', label: 'Intermembrane Space', sublabel: 'High [H+]', category: 'primary' },
        { id: 'stage2', label: 'ATP Synthase Rotor', sublabel: 'Rotational Catalysis', category: 'accent' },
        { id: 'stage3', label: 'Mitochondrial Matrix', sublabel: 'ADP + Pi → ATP', category: 'secondary' },
      ],
      connectors: [
        { id: 'c1', fromNodeId: 'stage1', toNodeId: 'stage2', label: 'H+ Flux', directed: true },
        { id: 'c2', fromNodeId: 'stage2', toNodeId: 'stage3', label: 'Energy Transfer', directed: true },
      ],
    },
  },
  animation: {
    enterTransition: 'fade',
    activeElements: ['stage2'],
  },
  avatar: {
    framing: 'close',
    gesture: 'emphasize',
    gazeTarget: 'student',
  },
};

// ==========================================
// 4. COMPUTER SCIENCE DOMAIN (Binary Search Algorithm)
// ==========================================
const csBeat: UniversalTeachingBeat = {
  beatIndex: 3,
  beatId: 'cs-binary-search-beat-1',
  content: {
    blocks: [
      {
        type: 'heading',
        level: 2,
        content: [{ text: 'Binary Search Algorithm' }],
      },
      {
        type: 'code',
        language: 'typescript',
        code: `function binarySearch(arr: number[], target: number): number {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
        caption: 'Divide and conquer search in sorted array with O(log n) complexity',
      },
    ],
  },
  speechText:
    'Because the array is sorted, comparing the target with the middle element halves our search space on every single iteration.',
  displayText:
    'Binary Search achieves O(log n) logarithmic time by eliminating half of the search range in each step.',
  captionText:
    'Binary Search achieves O(log n) logarithmic time by eliminating half of the search range in each step.',
  visual: {
    intent: 'CODE',
    templateId: 'template.code.walkthrough',
    environment: 'COMPUTER_SCIENCE',
    payload: {
      title: 'Binary Search Step-by-Step',
      subtitle: 'Logarithmic Division',
      code: {
        language: 'typescript',
        codeString: `const mid = Math.floor((low + high) / 2);`,
        highlightLines: [1],
      },
    },
  },
  animation: {
    enterTransition: 'fade',
    activeElements: ['code-mid'],
  },
  avatar: {
    framing: 'medium',
    gesture: 'explain_two_handed',
    gazeTarget: 'student',
  },
};

// ==========================================
// 5. HISTORY DOMAIN (The Industrial Revolution)
// ==========================================
const historyBeat: UniversalTeachingBeat = {
  beatIndex: 4,
  beatId: 'history-industrial-beat-1',
  content: {
    blocks: [
      {
        type: 'heading',
        level: 2,
        content: [{ text: 'The First Industrial Revolution' }],
      },
      {
        type: 'paragraph',
        content: [
          { text: 'Originating in Great Britain during the late 18th century, the transition from agrarian craft to ' },
          { text: 'mechanized manufacturing', marks: ['bold'] },
          { text: ' fundamentally restructured human society.' },
        ],
      },
      {
        type: 'quote',
        content: [{ text: 'The steam engine was the motor of modernization.' }],
        attribution: 'Economic Historians',
      },
    ],
  },
  speechText:
    'The introduction of James Watts steam engine and mechanized textile spinning transformed Britain from an agrarian society to the workshop of the world.',
  displayText:
    'The Industrial Revolution: Mechanization, steam power, and rapid urbanization in late 18th century Britain.',
  captionText:
    'The Industrial Revolution: Mechanization, steam power, and rapid urbanization in late 18th century Britain.',
  visual: {
    intent: 'TIMELINE',
    templateId: 'template.timeline.historical',
    environment: 'HISTORY',
    payload: {
      title: 'Key Milestones of Industrialization',
      subtitle: '1764 - 1804',
      timeline: [
        { timestamp: '1764', title: 'Spinning Jenny', description: 'Multi-spindle spinning frame invented by James Hargreaves' },
        { timestamp: '1776', title: 'Watt Steam Engine', description: 'Commercial deployment of condenser steam engine', isMilestone: true },
        { timestamp: '1804', title: 'First Steam Locomotive', description: 'Richard Trevithick pioneers rail transport', isMilestone: true },
      ],
    },
  },
  animation: {
    enterTransition: 'fade',
    activeElements: ['milestone-1776'],
  },
  avatar: {
    framing: 'full',
    gesture: 'welcoming',
    gazeTarget: 'student',
  },
};

// ==========================================
// TEST RUNNER
// ==========================================
export function runUniversalArchitectureVerification(): boolean {
  console.log('\n==================================================');
  console.log('PHASE 6A: UNIVERSAL TEACHING ARCHITECTURE VALIDATION');
  console.log('==================================================\n');

  const domainBeats = [
    { domain: 'PHYSICS', beat: physicsBeat },
    { domain: 'MATHEMATICS', beat: mathBeat },
    { domain: 'BIOLOGY', beat: biologyBeat },
    { domain: 'COMPUTER_SCIENCE', beat: csBeat },
    { domain: 'HISTORY', beat: historyBeat },
  ];

  let passedTests = 0;
  let totalTests = 0;

  // 1. Cross-Domain Schema Validation
  for (const { domain, beat } of domainBeats) {
    totalTests++;
    try {
      const validated = UniversalTeachingBeatSchema.parse(beat);
      console.log(`[PASS] Domain '${domain}': Successfully parsed through UniversalTeachingBeatSchema.`);
      
      // Also verify legacy adapter converts it into valid TutorVisualState
      const legacyState = adaptUniversalBeatToLegacyVisualState(validated);
      TutorVisualStateSchema.parse(legacyState);
      console.log(`       -> Legacy adapter correctly created valid TutorVisualState (visualType='${legacyState.visualType}').`);
      passedTests++;
    } catch (err: any) {
      console.error(`[FAIL] Domain '${domain}' validation failed:`, err);
    }
  }

  // 2. Negative Tests (Rejections of Invalid Schemas)
  console.log('\n--- Negative / Rejection Tests ---');

  // Test: Missing speechText
  totalTests++;
  try {
    const invalid = { ...physicsBeat, speechText: '' };
    UniversalTeachingBeatSchema.parse(invalid);
    console.error('[FAIL] Negative Test: Empty speechText was accepted, should have been rejected.');
  } catch {
    console.log('[PASS] Negative Test: Empty speechText rejected correctly.');
    passedTests++;
  }

  // Test: Invalid Visual Intent
  totalTests++;
  try {
    const invalid = {
      ...physicsBeat,
      visual: { ...physicsBeat.visual, intent: 'INVALID_RAY_TRACER_INTENT' as any },
    };
    UniversalTeachingBeatSchema.parse(invalid);
    console.error('[FAIL] Negative Test: Invalid intent accepted, should have been rejected.');
  } catch {
    console.log('[PASS] Negative Test: Unknown/invalid visual intent rejected correctly.');
    passedTests++;
  }

  // Test: Invalid Template ID
  totalTests++;
  try {
    const invalid = {
      ...physicsBeat,
      visual: { ...physicsBeat.visual, templateId: 'template.optics.air_to_glass' as any },
    };
    UniversalTeachingBeatSchema.parse(invalid);
    console.error('[FAIL] Negative Test: Hardcoded optics template accepted, should have been rejected.');
  } catch {
    console.log('[PASS] Negative Test: Hardcoded optics template rejected correctly.');
    passedTests++;
  }

  // Test: Invalid Block Type
  totalTests++;
  try {
    const invalid = {
      ...physicsBeat,
      content: {
        blocks: [{ type: 'arbitrary_card_container', content: [] } as any],
      },
    };
    UniversalTeachingBeatSchema.parse(invalid);
    console.error('[FAIL] Negative Test: Arbitrary card container accepted, should have been rejected.');
  } catch {
    console.log('[PASS] Negative Test: Arbitrary card container rejected correctly.');
    passedTests++;
  }

  console.log('\n==================================================');
  console.log(`VALIDATION RESULT: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('==================================================\n');

  return passedTests === totalTests;
}

const success = runUniversalArchitectureVerification();
if (!success) {
  process.exit(1);
}
