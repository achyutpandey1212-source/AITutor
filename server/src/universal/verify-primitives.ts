import {
  VisualNodeSchema,
  VisualConnectorSchema,
  VisualAnnotationSchema,
  VisualGraphAxisSchema,
  VisualDataSeriesSchema,
  EquationLineSchema,
  type VisualNode,
  type VisualPoint,
  type VisualGraphAxis,
  type VisualConnector,
  type VisualAnnotation,
  type VisualDataSeries,
  type EquationLine,
  getPerimeterIntersection,
  autoLayoutNodes,
  createCoordinateScaler,
  pointsToSmoothPath,
  pointsToStepPath,
  formatLatexFallback,
  DEFAULT_NODE_DIMENSIONS,
} from '@ai-tutor/shared';

// ==========================================
// 5 CROSS-DOMAIN FIXTURES
// ==========================================
const mathFixture = {
  axes: {
    x: {
      label: 'x',
      min: -5,
      max: 5,
      ticks: [-4, -2, 0, 2, 4],
    } as VisualGraphAxis,
    y: {
      label: 'f(x)',
      min: -2,
      max: 10,
      ticks: [0, 2, 4, 6, 8, 10],
    } as VisualGraphAxis,
  },
  series: [
    {
      id: 'parabola',
      name: 'f(x) = x²',
      points: [
        [-3, 9],
        [-2, 4],
        [-1, 1],
        [0, 0],
        [1, 1],
        [2, 4],
        [3, 9],
      ] as [number, number][],
      curveType: 'smooth' as const,
      highlightPoint: [0, 0] as [number, number],
    } as VisualDataSeries,
  ],
  equations: [
    {
      id: 'eq-quad',
      latex: 'f(x) = a x^2 + b x + c',
      explanation: 'General quadratic form with vertex at (0, 0)',
      isActiveStep: true,
    } as EquationLine,
  ],
  annotations: [
    {
      id: 'ann-vertex',
      text: 'Minimum vertex at origin',
      calloutType: 'observation' as const,
      position: { x: 520, y: 380 },
    } as VisualAnnotation,
  ],
};

const physicsFixture = {
  nodes: [
    {
      id: 'mass-m',
      label: 'Mass (m)',
      sublabel: 'm = 5.0 kg',
      category: 'primary' as const,
      shape: 'box' as const,
      position: { x: 480, y: 260 },
    } as VisualNode,
    {
      id: 'target-f',
      label: 'F_applied',
      sublabel: '50 N [Right]',
      category: 'accent' as const,
      shape: 'pill' as const,
      position: { x: 720, y: 260 },
    } as VisualNode,
    {
      id: 'target-n',
      label: 'Normal (N)',
      category: 'secondary' as const,
      shape: 'pill' as const,
      position: { x: 480, y: 120 },
    } as VisualNode,
    {
      id: 'target-g',
      label: 'Gravity (mg)',
      category: 'secondary' as const,
      shape: 'pill' as const,
      position: { x: 480, y: 400 },
    } as VisualNode,
  ],
  connectors: [
    {
      id: 'c-applied',
      fromNodeId: 'mass-m',
      toNodeId: 'target-f',
      label: 'F = m·a',
      directed: true,
      style: 'solid' as const,
    } as VisualConnector,
    {
      id: 'c-normal',
      fromNodeId: 'mass-m',
      toNodeId: 'target-n',
      directed: true,
      style: 'dashed' as const,
    } as VisualConnector,
    {
      id: 'c-gravity',
      fromNodeId: 'mass-m',
      toNodeId: 'target-g',
      directed: true,
      style: 'dashed' as const,
    } as VisualConnector,
  ],
  annotations: [
    {
      id: 'ann-f-net',
      text: 'Vertical forces cancel out (N = mg)',
      calloutType: 'rule' as const,
      position: { x: 80, y: 80 },
      targetId: 'mass-m',
    } as VisualAnnotation,
  ],
};

const biologyFixture = {
  nodes: [
    {
      id: 'cell',
      label: 'Eukaryotic Cell',
      sublabel: 'Basic unit of structure',
      category: 'primary' as const,
      shape: 'card' as const,
      position: { x: 480, y: 140 },
    } as VisualNode,
    {
      id: 'nucleus',
      label: 'Nucleus',
      sublabel: 'Genetic material storage',
      category: 'accent' as const,
      shape: 'box' as const,
      position: { x: 300, y: 320 },
    } as VisualNode,
    {
      id: 'mitochondria',
      label: 'Mitochondria',
      sublabel: 'ATP aerobic synthesis',
      category: 'secondary' as const,
      shape: 'box' as const,
      position: { x: 660, y: 320 },
    } as VisualNode,
  ],
  connectors: [
    {
      id: 'c-nuc',
      fromNodeId: 'cell',
      toNodeId: 'nucleus',
      label: 'Contains',
      directed: true,
    } as VisualConnector,
    {
      id: 'c-mito',
      fromNodeId: 'cell',
      toNodeId: 'mitochondria',
      label: 'Contains',
      directed: true,
    } as VisualConnector,
  ],
  annotations: [
    {
      id: 'ann-membrane',
      text: 'Bound by double phospholipid bilayer',
      calloutType: 'observation' as const,
      position: { x: 120, y: 440 },
      targetId: 'nucleus',
    } as VisualAnnotation,
  ],
};

const csFixture = {
  nodes: [
    {
      id: 'input',
      label: 'Input Data',
      sublabel: 'Raw stream / buffer',
      category: 'neutral' as const,
      shape: 'pill' as const,
      position: { x: 200, y: 260 },
    } as VisualNode,
    {
      id: 'process',
      label: 'Transform & Filter',
      sublabel: 'Pure functional pipeline',
      category: 'primary' as const,
      shape: 'box' as const,
      position: { x: 480, y: 260 },
    } as VisualNode,
    {
      id: 'output',
      label: 'Result Sink',
      sublabel: 'Structured schema record',
      category: 'accent' as const,
      shape: 'pill' as const,
      position: { x: 760, y: 260 },
    } as VisualNode,
  ],
  connectors: [
    {
      id: 'pipe-1',
      fromNodeId: 'input',
      toNodeId: 'process',
      label: 'Stream',
      directed: true,
      style: 'solid' as const,
    } as VisualConnector,
    {
      id: 'pipe-2',
      fromNodeId: 'process',
      toNodeId: 'output',
      label: 'Yield',
      directed: true,
      style: 'solid' as const,
    } as VisualConnector,
  ],
  annotations: [
    {
      id: 'ann-pure',
      text: 'Deterministic: Same input yields same output',
      calloutType: 'rule' as const,
      position: { x: 380, y: 120 },
      targetId: 'process',
    } as VisualAnnotation,
  ],
};

const historyFixture = {
  nodes: [
    {
      id: 'event-1',
      label: 'Printing Press',
      sublabel: 'c. 1440 (Gutenberg)',
      category: 'secondary' as const,
      shape: 'box' as const,
      position: { x: 180, y: 260 },
    } as VisualNode,
    {
      id: 'event-2',
      label: 'Scientific Revolution',
      sublabel: '1543 - late 17th c.',
      category: 'primary' as const,
      shape: 'box' as const,
      position: { x: 480, y: 260 },
    } as VisualNode,
    {
      id: 'event-3',
      label: 'The Enlightenment',
      sublabel: '18th century Europe',
      category: 'accent' as const,
      shape: 'box' as const,
      position: { x: 780, y: 260 },
    } as VisualNode,
  ],
  connectors: [
    {
      id: 'hist-c1',
      fromNodeId: 'event-1',
      toNodeId: 'event-2',
      label: 'Dissemination',
      directed: true,
      style: 'solid' as const,
    } as VisualConnector,
    {
      id: 'hist-c2',
      fromNodeId: 'event-2',
      toNodeId: 'event-3',
      label: 'Empiricism',
      directed: true,
      style: 'solid' as const,
    } as VisualConnector,
  ],
  annotations: [
    {
      id: 'ann-hist-shift',
      text: 'Massive literacy growth enabled rapid peer replication',
      calloutType: 'observation' as const,
      position: { x: 180, y: 400 },
      targetId: 'event-1',
    } as VisualAnnotation,
  ],
};

export function runPrimitivesVerification(): boolean {
  console.log('\n==================================================');
  console.log('PHASE 6B: UNIVERSAL 2D PRIMITIVES VALIDATION');
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
  // 1. Fixture Schema Acceptance Tests
  // ----------------------------------------------------
  console.log('--- 1. Cross-Domain Fixture Schema Acceptance ---');

  // Math Fixture
  try {
    VisualGraphAxisSchema.parse(mathFixture.axes.x);
    VisualGraphAxisSchema.parse(mathFixture.axes.y);
    VisualDataSeriesSchema.parse(mathFixture.series[0]);
    EquationLineSchema.parse(mathFixture.equations[0]);
    VisualAnnotationSchema.parse(mathFixture.annotations[0]);
    assert(true, 'Math Fixture: Axes, series, equation, and annotation conform to schemas');
  } catch (err: any) {
    assert(false, 'Math Fixture schema validation failed', err?.message);
  }

  // Physics Fixture
  try {
    physicsFixture.nodes.forEach((n: VisualNode) => VisualNodeSchema.parse(n));
    physicsFixture.connectors.forEach((c: VisualConnector) => VisualConnectorSchema.parse(c));
    VisualAnnotationSchema.parse(physicsFixture.annotations[0]);
    assert(true, 'Physics Fixture: Force nodes, vector connectors, and annotation conform to schemas');
  } catch (err: any) {
    assert(false, 'Physics Fixture schema validation failed', err?.message);
  }

  // Biology Fixture
  try {
    biologyFixture.nodes.forEach((n: VisualNode) => VisualNodeSchema.parse(n));
    biologyFixture.connectors.forEach((c: VisualConnector) => VisualConnectorSchema.parse(c));
    VisualAnnotationSchema.parse(biologyFixture.annotations[0]);
    assert(true, 'Biology Fixture: Organelle hierarchy nodes and connectors conform to schemas');
  } catch (err: any) {
    assert(false, 'Biology Fixture schema validation failed', err?.message);
  }

  // Computer Science Fixture
  try {
    csFixture.nodes.forEach((n: VisualNode) => VisualNodeSchema.parse(n));
    csFixture.connectors.forEach((c: VisualConnector) => VisualConnectorSchema.parse(c));
    VisualAnnotationSchema.parse(csFixture.annotations[0]);
    assert(true, 'CS Fixture: Pipeline nodes, stream connectors, and annotation conform to schemas');
  } catch (err: any) {
    assert(false, 'CS Fixture schema validation failed', err?.message);
  }

  // History Fixture
  try {
    historyFixture.nodes.forEach((n: VisualNode) => VisualNodeSchema.parse(n));
    historyFixture.connectors.forEach((c: VisualConnector) => VisualConnectorSchema.parse(c));
    VisualAnnotationSchema.parse(historyFixture.annotations[0]);
    assert(true, 'History Fixture: Causal succession nodes and connectors conform to schemas');
  } catch (err: any) {
    assert(false, 'History Fixture schema validation failed', err?.message);
  }

  // ----------------------------------------------------
  // 2. Node Shapes & Dimensions
  // ----------------------------------------------------
  console.log('\n--- 2. Node Dimensions & Shapes ---');
  const expectedShapes = ['box', 'circle', 'pill', 'diamond', 'card'];
  const allShapesPresent = expectedShapes.every((s) => Boolean(DEFAULT_NODE_DIMENSIONS[s]));
  assert(allShapesPresent, 'All 5 required node shapes have explicit dimensions defined');

  // ----------------------------------------------------
  // 3. Connector Geometry & Boundary Clipping
  // ----------------------------------------------------
  console.log('\n--- 3. Connector Geometry & Perimeter Clipping ---');
  const centerA: VisualPoint = { x: 100, y: 100 };
  const centerB: VisualPoint = { x: 300, y: 100 };

  const clippedA = getPerimeterIntersection(centerA, centerB, 'box', 2);
  const clippedB = getPerimeterIntersection(centerB, centerA, 'box', 2);

  assert(
    Math.abs(clippedA.x - 172) < 1 && Math.abs(clippedA.y - 100) < 1,
    `Source box perimeter clipping: expected x≈172, got ${clippedA.x}`
  );
  assert(
    Math.abs(clippedB.x - 228) < 1 && Math.abs(clippedB.y - 100) < 1,
    `Target box perimeter clipping: expected x≈228, got ${clippedB.x}`
  );
  assert(
    clippedA.x < clippedB.x && clippedA.x > centerA.x && clippedB.x < centerB.x,
    'Connector line is clipped strictly between outer node perimeters (no arrowhead body overlap)'
  );

  // Circle perimeter clipping
  const circleCenter: VisualPoint = { x: 200, y: 200 };
  const targetPt: VisualPoint = { x: 200, y: 300 };
  const clippedCircle = getPerimeterIntersection(circleCenter, targetPt, 'circle', 2);
  assert(
    Math.abs(clippedCircle.y - 237) < 1 && Math.abs(clippedCircle.x - 200) < 1,
    `Circle perimeter clipping: expected y≈237, got ${clippedCircle.y}`
  );

  // ----------------------------------------------------
  // 4. Automatic Node Layout
  // ----------------------------------------------------
  console.log('\n--- 4. Automatic Deterministic Node Layout ---');
  const unpositionedNodes: VisualNode[] = [
    { id: 'node-1', label: 'Step 1' },
    { id: 'node-2', label: 'Step 2' },
    { id: 'node-3', label: 'Step 3' },
  ];

  const layoutMap = autoLayoutNodes(unpositionedNodes, 900, 500);
  assert(layoutMap.size === 3, 'Auto-layout allocated positions for all 3 nodes');

  const p1 = layoutMap.get('node-1')!;
  const p2 = layoutMap.get('node-2')!;
  const p3 = layoutMap.get('node-3')!;

  assert(
    p1.x < p2.x && p2.x < p3.x,
    `Sequential nodes arranged horizontally in ascending order (${p1.x} < ${p2.x} < ${p3.x})`
  );
  assert(
    p1.y === p2.y && p2.y === p3.y,
    'Sequential nodes share centered horizontal baseline in single-row layout'
  );

  // Balanced grid layout for larger set
  const sixNodes: VisualNode[] = Array.from({ length: 6 }, (_, i) => ({
    id: `grid-node-${i}`,
    label: `Item ${i}`,
  }));
  const gridMap = autoLayoutNodes(sixNodes, 900, 600);
  assert(gridMap.size === 6, 'Auto-layout allocated positions for 6-node grid');

  const positions: VisualPoint[] = Array.from(gridMap.values());
  let overlaps = false;
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const posI = positions[i]!;
      const posJ = positions[j]!;
      const dist = Math.hypot(posI.x - posJ.x, posI.y - posJ.y);
      if (dist < 50) overlaps = true;
    }
  }
  assert(!overlaps, 'All 6 nodes are spaced with non-overlapping minimum distances');

  // ----------------------------------------------------
  // 5. Graph Axis Coordinate Mapping
  // ----------------------------------------------------
  console.log('\n--- 5. Graph Axis Coordinate Scaling ---');
  const viewport = { x: 100, y: 50, width: 800, height: 400 };
  const xAxis: VisualGraphAxis = { label: 'Time', min: 0, max: 10 };
  const yAxis: VisualGraphAxis = { label: 'Velocity', min: 0, max: 100 };

  const scaler = createCoordinateScaler(viewport, xAxis, yAxis);

  const pixelOrigin = scaler.toPixelPoint([0, 0]);
  const pixelMax = scaler.toPixelPoint([10, 100]);
  const pixelMid = scaler.toPixelPoint([5, 50]);

  assert(
    pixelOrigin[0] === 100 && pixelOrigin[1] === 450,
    `Coordinate origin maps to bottom-left: expected [100, 450], got [${pixelOrigin[0]}, ${pixelOrigin[1]}]`
  );
  assert(
    pixelMax[0] === 900 && pixelMax[1] === 50,
    `Coordinate max maps to top-right: expected [900, 50], got [${pixelMax[0]}, ${pixelMax[1]}]`
  );
  assert(
    pixelMid[0] === 500 && pixelMid[1] === 250,
    `Coordinate midpoint maps to center: expected [500, 250], got [${pixelMid[0]}, ${pixelMid[1]}]`
  );

  // ----------------------------------------------------
  // 6. Data Series Path Generation
  // ----------------------------------------------------
  console.log('\n--- 6. Data Series Path Generation ---');
  const testPts: [number, number][] = [
    [100, 450],
    [300, 300],
    [500, 200],
    [700, 100],
  ];

  const smoothPath = pointsToSmoothPath(testPts);
  assert(
    smoothPath.startsWith('M') && smoothPath.includes('C'),
    'Smooth curve generates valid cubic Bezier SVG path (Catmull-Rom spline)'
  );

  const stepPath = pointsToStepPath(testPts);
  assert(
    stepPath.startsWith('M') && stepPath.includes('L'),
    'Step curve generates valid horizontal/vertical step SVG path'
  );

  // ----------------------------------------------------
  // 7. Equation Typography Fallback Formatting
  // ----------------------------------------------------
  console.log('\n--- 7. Safe Equation Typography Formatting ---');
  const rawLatex = 'E = h \\nu = \\frac{h c}{\\lambda} \\quad \\text{where } \\lambda \\approx 500 \\times 10^{-9}';
  const formatted = formatLatexFallback(rawLatex);

  assert(formatted.includes('ν'), `LaTeX macro \\nu converted to Unicode Greek ν: "${formatted}"`);
  assert(formatted.includes('λ'), `LaTeX macro \\lambda converted to Unicode Greek λ`);
  assert(formatted.includes('×'), `LaTeX macro \\times converted to Unicode multiplication symbol ×`);
  assert(formatted.includes('≈'), `LaTeX macro \\approx converted to Unicode almost-equal ≈`);
  assert(!formatted.includes('\\frac'), 'LaTeX \\frac converted to clean ratio notation');

  // ----------------------------------------------------
  // 8. Negative Schema Rejection Tests
  // ----------------------------------------------------
  console.log('\n--- 8. Negative / Schema Rejection Tests ---');

  // Invalid Node: Missing id
  try {
    VisualNodeSchema.parse({ label: 'Missing ID' } as any);
    assert(false, 'Node with missing ID accepted, should fail');
  } catch {
    assert(true, 'Node with missing ID correctly rejected');
  }

  // Invalid Node: Unknown shape
  try {
    VisualNodeSchema.parse({ id: '1', label: 'Test', shape: 'pentagon' } as any);
    assert(false, 'Node with unknown shape accepted, should fail');
  } catch {
    assert(true, 'Node with unknown shape correctly rejected');
  }

  // Invalid Connector: Missing fromNodeId
  try {
    VisualConnectorSchema.parse({ id: 'c1', toNodeId: 'node-2' } as any);
    assert(false, 'Connector missing fromNodeId accepted, should fail');
  } catch {
    assert(true, 'Connector missing fromNodeId correctly rejected');
  }

  // Invalid Axis: Non-numeric min/max
  try {
    VisualGraphAxisSchema.parse({ label: 'X', min: 'zero', max: 10 } as any);
    assert(false, 'Axis with string min accepted, should fail');
  } catch {
    assert(true, 'Axis with non-numeric min correctly rejected');
  }

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  console.log('\n==================================================');
  console.log(`VALIDATION RESULT: ${passed} / ${total} TESTS PASSED`);
  console.log('==================================================\n');

  return passed === total;
}

const success = runPrimitivesVerification();
if (!success) {
  process.exit(1);
}
