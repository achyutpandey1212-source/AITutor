export type AvatarId = 'orion' | 'aurora' | 'miko';

export type CameraPreset = 'close' | 'medium' | 'full';

export type AvatarLabState = 'READY' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'INTERRUPTED' | 'PAUSED' | 'ERROR';

export type VisualIsolationMode = 'ALL' | 'ONLY_FACE_SKIN' | 'ONLY_MOUTH' | 'ONLY_EYES';

export interface AvatarAssetConfig {
  id: AvatarId;
  name: string;
  url: string;
  fileSizeBytes: number;
  formatDescription: string;
}

export interface AvatarCapabilities {
  isVRM: boolean;
  vrmVersion: string; // e.g. '0.0' | '1.0' | 'Unknown'
  hasHumanoid: boolean;
  boneCount: number;
  detectedKeyBones: {
    head: boolean;
    neck: boolean;
    chest: boolean;
    spine: boolean;
    leftEye: boolean;
    rightEye: boolean;
  };
  hasLookAt: boolean;
  hasSpringBones: boolean;
  embeddedAnimationCount: number;
  embeddedAnimationNames: string[];
  totalExpressionsCount: number;
  availableExpressions: string[];
  hasMouthControls: boolean;
  mouthExpressionNames: string[];
  hasEyeControls: boolean;
  eyeExpressionNames: string[];
  isAnimatedByDefault: boolean;
  meshCount: number;
  morphTargetCount: number;
  morphMeshes: Array<{ id: string; meshName: string; materialName: string; targetCount: number }>;
  allMorphTargetNames: string[];
  semanticMap: Record<string, string[]>;
}

export type IndividualMorphValues = Record<string, number>;

export interface MeshDiagnosticItem {
  name: string;
  type: string;
  visible: boolean;
  renderOrder: number;
  materialName: string;
  morphTargetCount: number;
  hasPositionMorphs: boolean;
  fclMthAIndex?: number;
  fclMthAInfluence?: number;
  fclEyeCloseIndex?: number;
  fclEyeCloseInfluence?: number;
}

export interface GeometryDeltaReport {
  targetName: string;
  meshName: string;
  vertexCount: number;
  morphAttributeExists: boolean;
  nonZeroDeltas: number;
  maxDelta: number;
}

export interface RuntimeDiagnosticData {
  meshes: MeshDiagnosticItem[];
  geometryDeltas: GeometryDeltaReport[];
  liveRuntimeFclMthAInfluence: number;
  liveRuntimeFclEyeCloseInfluence: number;
  vrmUpdateFrozen: boolean;
}

export interface ManualExpressionValues {
  mouthOpen: number; // 0 to 1
  smile: number;     // 0 to 1
  sad: number;       // 0 to 1
  surprised: number; // 0 to 1
  blink: number;     // 0 to 1
  neutral: number;   // 0 to 1
}

export interface LoadDiagnostics {
  status: 'idle' | 'loading' | 'loaded' | 'error';
  loadTimeMs?: number;
  error?: string;
  vrmRootsCount?: number;
}

export interface EnginePipelineTelemetry {
  targetName: string;
  uiValue: number;
  targetWeight: number;
  currentWeight: number;
  meshInfluence: number;
  meshCount: number;
}

export interface EngineTelemetryData {
  instanceId: string;
  boundMeshCount: number;
  totalTargetCount: number;
  vrmRootsInScene: number;
  fps: number;
  pipelineMouthA: EnginePipelineTelemetry;
  pipelineBlink: EnginePipelineTelemetry;
  activeSpeechVowel?: string;
  blinkState: 'idle' | 'closing' | 'holding' | 'opening';
  isSpeaking: boolean;
  isManualOverride: boolean;
}

export interface AvatarStressTestResult {
  running: boolean;
  progress: number; // 0 to 100
  cyclesCompleted: number;
  totalCycles: number;
  passed: boolean | null;
  logs: string[];
  errorMessage?: string;
}
