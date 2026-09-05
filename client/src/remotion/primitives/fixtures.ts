import type {
  VisualNode,
  VisualConnector,
  VisualAnnotation,
  VisualGraphAxis,
  VisualDataSeries,
  EquationLine,
} from '@ai-tutor/shared';

// ==========================================
// 1. MATHEMATICS FIXTURE (Coordinate Graph: Quadratic Parabola)
// ==========================================
export const mathFixture = {
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

// ==========================================
// 2. PHYSICS FIXTURE (Force & Free-Body Vector Diagram)
// ==========================================
export const physicsFixture = {
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

// ==========================================
// 3. BIOLOGY FIXTURE (Cell Organelles Hierarchy)
// ==========================================
export const biologyFixture = {
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

// ==========================================
// 4. COMPUTER SCIENCE FIXTURE (Input -> Process -> Output)
// ==========================================
export const csFixture = {
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

// ==========================================
// 5. HISTORY FIXTURE (Causal Event Succession)
// ==========================================
export const historyFixture = {
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
