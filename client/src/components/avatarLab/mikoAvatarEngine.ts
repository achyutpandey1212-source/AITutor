import * as THREE from 'three';
import { VRM } from '@pixiv/three-vrm';
import {
  AvatarLabState,
  EngineTelemetryData,
  AvatarStressTestResult,
  ManualExpressionValues,
} from './types';
import {
  buildMorphRegistry,
  ModelMorphRegistry,
  MeshMorphBinding,
  MIKO_EXACT_TARGETS,
  GENERIC_CANDIDATES,
  SemanticWeights,
  VowelKey,
} from './mikoController';

let globalEngineCounter = 0;

/**
 * Authoritative Miko Avatar Engine.
 * 
 * Unifies:
 * - Direct multi-mesh morph deformation across all primitives (8 for Miko)
 * - Grounded humanoid posture & breathing (MikoBodyController)
 * - Deterministic natural blinking scheduler
 * - Conversational speaking vowel driver
 * - 5-stage pipeline telemetry
 * - Synchronous imperative control methods
 * - Disconnection from @pixiv/three-vrm expressionManager
 */
export class MikoAvatarEngine {
  public readonly instanceId: string;
  public readonly root: THREE.Object3D;
  private vrm: VRM | null;
  public readonly registry: ModelMorphRegistry;
  private isMiko: boolean;

  // Semantic mappings
  private resolvedMap: Record<keyof SemanticWeights, string[]>;

  // Internal weights (target vs current for smooth lerp)
  private targetWeights: SemanticWeights;
  private currentWeights: SemanticWeights;

  // Manual individual morph targets
  private individualTargets: Map<string, number> = new Map();
  private individualCurrents: Map<string, number> = new Map();

  // Natural blink scheduler
  private nextBlinkTime: number = 2.0;
  private blinkState: 'idle' | 'closing' | 'holding' | 'opening' = 'idle';
  private blinkPhaseTimer: number = 0;
  private naturalBlinkWeight: number = 0;

  // Speaking driver state
  private isSpeaking: boolean = false;
  private speechElapsed: number = 0;
  private currentVowelIndex: number = 0;
  private nextVowelSwitchTime: number = 0;
  private activeVowel: VowelKey = 'A';

  // Manual override state
  private manualOverrideActive: boolean = false;
  private manualValues: ManualExpressionValues = {
    mouthOpen: 0,
    smile: 0,
    sad: 0,
    surprised: 0,
    blink: 0,
    neutral: 0,
  };

  // Telemetry & frame profiling
  private lastFpsUpdateTime: number = 0;
  private frameCounter: number = 0;
  private currentFps: number = 60;

  // Cached bound meshes for Fcl_MTH_A and Fcl_EYE_Close
  private mouthABindings: MeshMorphBinding[] = [];
  private blinkBindings: MeshMorphBinding[] = [];

  constructor(root: THREE.Object3D, vrm: VRM | null) {
    globalEngineCounter++;
    this.instanceId = `MikoAvatarEngine #${globalEngineCounter}`;
    this.root = root;
    this.vrm = vrm;

    // Disconnect VRM expressionManager from interfering with direct morphs
    if (this.vrm && this.vrm.expressionManager) {
      try {
        // Zero out all expressionManager weights so it doesn't overwrite our morphs
        this.vrm.expressionManager.expressions.forEach((expr) => {
          expr.weight = 0;
        });
      } catch (e) {
        console.warn(`[${this.instanceId}] expressionManager reset warning:`, e);
      }
    }

    // Build authoritative morph registry across all meshes
    this.registry = buildMorphRegistry(root, vrm);
    this.isMiko = this.registry.allTargetNames.some((t) => t.startsWith('Fcl_'));

    this.targetWeights = this.createEmptyWeights();
    this.currentWeights = this.createEmptyWeights();
    this.resolvedMap = this.resolveSemanticMap();

    // Cache key bindings
    this.mouthABindings = this.registry.bindings.get('Fcl_MTH_A') || [];
    this.blinkBindings = this.registry.bindings.get('Fcl_EYE_Close') || [];

    console.log(
      `[${this.instanceId}] Initialized. isMiko=${this.isMiko}, boundMeshes(MTH_A)=${this.mouthABindings.length}, totalTargets=${this.registry.allTargetNames.length}`
    );
  }

  private createEmptyWeights(): SemanticWeights {
    return {
      mouthOpen: 0,
      smile: 0,
      sad: 0,
      surprised: 0,
      blink: 0,
      blinkLeft: 0,
      blinkRight: 0,
      vowelA: 0,
      vowelI: 0,
      vowelU: 0,
      vowelE: 0,
      vowelO: 0,
      neutral: 0,
    };
  }

  private resolveSemanticMap(): Record<keyof SemanticWeights, string[]> {
    const res = {} as Record<keyof SemanticWeights, string[]>;
    const keys = Object.keys(MIKO_EXACT_TARGETS) as (keyof SemanticWeights)[];
    const available = new Set(this.registry.allTargetNames);

    for (const key of keys) {
      res[key] = [];
      const candidates = this.isMiko ? MIKO_EXACT_TARGETS[key] : GENERIC_CANDIDATES[key];
      for (const cand of candidates) {
        if (available.has(cand)) {
          res[key].push(cand);
        } else {
          const found = this.registry.allTargetNames.find(
            (t) => t.toLowerCase() === cand.toLowerCase()
          );
          if (found && !res[key].includes(found)) {
            res[key].push(found);
          }
        }
      }
    }
    return res;
  }

  // -------------------------------------------------------------
  // Synchronous Imperative API
  // -------------------------------------------------------------
  public open(weight: number = 1.0): void {
    this.manualOverrideActive = true;
    this.manualValues.mouthOpen = weight;
    this.manualValues.neutral = 0;
    this.targetWeights.mouthOpen = weight;
    this.targetWeights.neutral = 0;
  }

  public blink(weight: number = 1.0): void {
    this.manualOverrideActive = true;
    this.manualValues.blink = weight;
    this.targetWeights.blink = weight;
  }

  public smile(weight: number = 1.0): void {
    this.manualOverrideActive = true;
    this.manualValues.smile = weight;
    this.manualValues.neutral = 0;
    this.targetWeights.smile = weight;
    this.targetWeights.neutral = 0;
  }

  public neutral(): void {
    this.manualOverrideActive = true;
    this.manualValues.mouthOpen = 0;
    this.manualValues.smile = 0;
    this.manualValues.sad = 0;
    this.manualValues.surprised = 0;
    this.manualValues.blink = 0;
    this.manualValues.neutral = 1.0;

    const keys = Object.keys(this.targetWeights) as (keyof SemanticWeights)[];
    for (const k of keys) {
      this.targetWeights[k] = 0;
    }
    this.targetWeights.neutral = 1.0;
    this.individualTargets.clear();
  }

  public setMouthOpen(weight: number): void {
    this.manualOverrideActive = true;
    this.manualValues.mouthOpen = weight;
    this.targetWeights.mouthOpen = Math.max(0, Math.min(1, weight));
    if (weight > 0) this.targetWeights.neutral = 0;
  }

  public setSmile(weight: number): void {
    this.manualOverrideActive = true;
    this.manualValues.smile = weight;
    this.targetWeights.smile = Math.max(0, Math.min(1, weight));
    if (weight > 0) this.targetWeights.neutral = 0;
  }

  public setSad(weight: number): void {
    this.manualOverrideActive = true;
    this.manualValues.sad = weight;
    this.targetWeights.sad = Math.max(0, Math.min(1, weight));
    if (weight > 0) this.targetWeights.neutral = 0;
  }

  public setSurprised(weight: number): void {
    this.manualOverrideActive = true;
    this.manualValues.surprised = weight;
    this.targetWeights.surprised = Math.max(0, Math.min(1, weight));
    if (weight > 0) this.targetWeights.neutral = 0;
  }

  public setBlink(weight: number): void {
    this.manualOverrideActive = true;
    this.manualValues.blink = weight;
    this.targetWeights.blink = Math.max(0, Math.min(1, weight));
  }

  public setIndividualMorph(targetName: string, weight: number): void {
    this.manualOverrideActive = true;
    const clamped = Math.max(0, Math.min(1, weight));
    this.individualTargets.set(targetName, clamped);
    if (!this.individualCurrents.has(targetName)) {
      this.individualCurrents.set(targetName, 0);
    }
  }

  public clearIndividualMorphs(): void {
    this.individualTargets.clear();
    for (const key of this.individualCurrents.keys()) {
      this.individualCurrents.set(key, 0);
    }
  }

  public setManualOverride(active: boolean): void {
    this.manualOverrideActive = active;
  }

  public resetAll(): void {
    this.neutral();
    this.individualTargets.clear();
    this.individualCurrents.clear();
    this.isSpeaking = false;
    this.blinkState = 'idle';
    this.naturalBlinkWeight = 0;
  }

  // -------------------------------------------------------------
  // Speaking Mouth Driver
  // -------------------------------------------------------------
  public startSpeaking(): void {
    this.isSpeaking = true;
    this.speechElapsed = 0;
    this.nextVowelSwitchTime = 0;
    this.currentVowelIndex = 0;
  }

  public stopSpeaking(immediate: boolean = false): void {
    this.isSpeaking = false;
    this.targetWeights.vowelA = 0;
    this.targetWeights.vowelI = 0;
    this.targetWeights.vowelU = 0;
    this.targetWeights.vowelE = 0;
    this.targetWeights.vowelO = 0;
    this.targetWeights.mouthOpen = 0;

    if (immediate) {
      this.currentWeights.vowelA = 0;
      this.currentWeights.vowelI = 0;
      this.currentWeights.vowelU = 0;
      this.currentWeights.vowelE = 0;
      this.currentWeights.vowelO = 0;
      this.currentWeights.mouthOpen = 0;
      this.applyToScene();
    }
  }

  private updateSpeakingDriver(delta: number): void {
    if (!this.isSpeaking) return;

    this.speechElapsed += delta;
    const vowels: VowelKey[] = ['A', 'O', 'E', 'I', 'U'];

    if (this.speechElapsed >= this.nextVowelSwitchTime) {
      this.currentVowelIndex = (this.currentVowelIndex + 1) % vowels.length;
      const duration = 0.11 + Math.random() * 0.11;
      this.nextVowelSwitchTime = this.speechElapsed + duration;
    }

    const syllableWave = Math.sin(this.speechElapsed * 11.0);
    const openness = Math.max(0.18, Math.min(0.85, 0.48 + syllableWave * 0.35));

    this.activeVowel = vowels[this.currentVowelIndex];
    this.targetWeights.vowelA = this.activeVowel === 'A' ? openness : 0;
    this.targetWeights.vowelO = this.activeVowel === 'O' ? openness * 0.8 : 0;
    this.targetWeights.vowelE = this.activeVowel === 'E' ? openness * 0.7 : 0;
    this.targetWeights.vowelI = this.activeVowel === 'I' ? openness * 0.65 : 0;
    this.targetWeights.vowelU = this.activeVowel === 'U' ? openness * 0.6 : 0;
  }

  // -------------------------------------------------------------
  // Deterministic Natural Blink Scheduler
  // -------------------------------------------------------------
  private updateNaturalBlink(delta: number, elapsed: number): void {
    // If manual blink is commanded, let manual override take precedence
    if (this.targetWeights.blink > 0.01) {
      this.blinkState = 'idle';
      this.naturalBlinkWeight = 0;
      return;
    }

    if (this.blinkState === 'idle') {
      if (elapsed > this.nextBlinkTime) {
        this.blinkState = 'closing';
        this.blinkPhaseTimer = 0;
      }
    } else if (this.blinkState === 'closing') {
      // 80-90ms close
      this.blinkPhaseTimer += delta;
      const progress = Math.min(1, this.blinkPhaseTimer / 0.085);
      this.naturalBlinkWeight = progress;
      if (progress >= 1.0) {
        this.blinkState = 'holding';
        this.blinkPhaseTimer = 0;
      }
    } else if (this.blinkState === 'holding') {
      // 20ms hold
      this.blinkPhaseTimer += delta;
      this.naturalBlinkWeight = 1.0;
      if (this.blinkPhaseTimer >= 0.02) {
        this.blinkState = 'opening';
        this.blinkPhaseTimer = 0;
      }
    } else if (this.blinkState === 'opening') {
      // 100-120ms reopen
      this.blinkPhaseTimer += delta;
      const progress = Math.min(1, this.blinkPhaseTimer / 0.11);
      this.naturalBlinkWeight = 1.0 - progress;
      if (progress >= 1.0) {
        this.blinkState = 'idle';
        this.naturalBlinkWeight = 0;
        this.nextBlinkTime = elapsed + 2.8 + Math.random() * 2.7;
      }
    }
  }

  // -------------------------------------------------------------
  // Step 1: Body Posture & Breathing (MikoBodyController)
  // -------------------------------------------------------------
  public updateBody(_delta: number, elapsed: number, labState: AvatarLabState): void {
    if (!this.vrm || !this.vrm.humanoid) return;
    const humanoid = this.vrm.humanoid;

    // Natural breathing (chest & spine cycle: ~3.5s period)
    const breathPhase = elapsed * 1.8;
    const breathSin = Math.sin(breathPhase);
    const chestAngle = breathSin * 0.012;
    const spineAngle = breathSin * 0.006;

    const chestNode = humanoid.getNormalizedBoneNode('chest');
    if (chestNode) {
      chestNode.rotation.x = chestAngle;
    }

    const spineNode = humanoid.getNormalizedBoneNode('spine');
    if (spineNode) {
      spineNode.rotation.x = spineAngle;
    }

    // State-specific grounded head and neck posture
    const headNode = humanoid.getNormalizedBoneNode('head');
    const neckNode = humanoid.getNormalizedBoneNode('neck');

    if (headNode && neckNode) {
      if (labState === 'LISTENING') {
        // Attentive micro-nod: gentle pitch forward with subtle tilt
        const nod = Math.sin(elapsed * 1.2) * 0.015 + 0.035;
        headNode.rotation.x = THREE.MathUtils.lerp(headNode.rotation.x, nod, 0.06);
        headNode.rotation.y = THREE.MathUtils.lerp(headNode.rotation.y, 0, 0.06);
        headNode.rotation.z = THREE.MathUtils.lerp(headNode.rotation.z, 0.01, 0.06);
        neckNode.rotation.x = THREE.MathUtils.lerp(neckNode.rotation.x, 0.01, 0.06);
        neckNode.rotation.y = THREE.MathUtils.lerp(neckNode.rotation.y, 0, 0.06);
        neckNode.rotation.z = THREE.MathUtils.lerp(neckNode.rotation.z, 0, 0.06);
      } else if (labState === 'THINKING') {
        // Subtle contemplative tilt upward and to the side
        headNode.rotation.x = THREE.MathUtils.lerp(headNode.rotation.x, -0.045, 0.04);
        headNode.rotation.y = THREE.MathUtils.lerp(headNode.rotation.y, 0.055, 0.04);
        headNode.rotation.z = THREE.MathUtils.lerp(headNode.rotation.z, 0.035, 0.04);
        neckNode.rotation.x = THREE.MathUtils.lerp(neckNode.rotation.x, -0.01, 0.04);
        neckNode.rotation.y = THREE.MathUtils.lerp(neckNode.rotation.y, 0.02, 0.04);
        neckNode.rotation.z = THREE.MathUtils.lerp(neckNode.rotation.z, 0.01, 0.04);
      } else if (labState === 'SPEAKING') {
        // Conversational head rhythm
        const cadenceX = Math.sin(elapsed * 2.8) * 0.020;
        const cadenceY = Math.cos(elapsed * 1.4) * 0.015;
        headNode.rotation.x = THREE.MathUtils.lerp(headNode.rotation.x, cadenceX, 0.08);
        headNode.rotation.y = THREE.MathUtils.lerp(headNode.rotation.y, cadenceY, 0.08);
        headNode.rotation.z = THREE.MathUtils.lerp(headNode.rotation.z, 0, 0.08);
        neckNode.rotation.x = THREE.MathUtils.lerp(neckNode.rotation.x, cadenceX * 0.3, 0.08);
        neckNode.rotation.y = THREE.MathUtils.lerp(neckNode.rotation.y, cadenceY * 0.3, 0.08);
      } else if (labState === 'INTERRUPTED') {
        // Clean instant/rapid return to upright attentive posture
        headNode.rotation.x = THREE.MathUtils.lerp(headNode.rotation.x, 0, 0.22);
        headNode.rotation.y = THREE.MathUtils.lerp(headNode.rotation.y, 0, 0.22);
        headNode.rotation.z = THREE.MathUtils.lerp(headNode.rotation.z, 0, 0.22);
        neckNode.rotation.x = THREE.MathUtils.lerp(neckNode.rotation.x, 0, 0.22);
        neckNode.rotation.y = THREE.MathUtils.lerp(neckNode.rotation.y, 0, 0.22);
        neckNode.rotation.z = THREE.MathUtils.lerp(neckNode.rotation.z, 0, 0.22);
      } else {
        // READY / PAUSED / ERROR: return to baseline upright posture
        headNode.rotation.x = THREE.MathUtils.lerp(headNode.rotation.x, 0, 0.05);
        headNode.rotation.y = THREE.MathUtils.lerp(headNode.rotation.y, 0, 0.05);
        headNode.rotation.z = THREE.MathUtils.lerp(headNode.rotation.z, 0, 0.05);
        neckNode.rotation.x = THREE.MathUtils.lerp(neckNode.rotation.x, 0, 0.05);
        neckNode.rotation.y = THREE.MathUtils.lerp(neckNode.rotation.y, 0, 0.05);
        neckNode.rotation.z = THREE.MathUtils.lerp(neckNode.rotation.z, 0, 0.05);
      }
    }
  }

  // -------------------------------------------------------------
  // Step 2: Facial Smoothing & Multi-Mesh Application (Post vrm.update)
  // -------------------------------------------------------------
  public updateFacial(
    delta: number,
    elapsed: number,
    labState: AvatarLabState,
    manualVals?: ManualExpressionValues,
    overrideActive?: boolean,
    individualMorphs?: Record<string, number>
  ): void {
    // Frame rate measurement
    this.frameCounter++;
    if (elapsed - this.lastFpsUpdateTime > 0.5) {
      this.currentFps = Math.round((this.frameCounter / (elapsed - this.lastFpsUpdateTime)));
      this.frameCounter = 0;
      this.lastFpsUpdateTime = elapsed;
    }

    // Sync manual override props if supplied
    if (overrideActive !== undefined) {
      this.manualOverrideActive = overrideActive;
    }
    if (manualVals) {
      this.manualValues = { ...manualVals };
    }

    // Natural blink update
    this.updateNaturalBlink(delta, elapsed);

    // Apply manual vs state-driven target weights
    if (this.manualOverrideActive) {
      if (this.manualValues.neutral > 0.5) {
        this.neutral();
      } else {
        this.targetWeights.mouthOpen = this.manualValues.mouthOpen;
        this.targetWeights.smile = this.manualValues.smile;
        this.targetWeights.sad = this.manualValues.sad;
        this.targetWeights.surprised = this.manualValues.surprised;
        this.targetWeights.blink = this.manualValues.blink;
      }
      if (individualMorphs) {
        for (const [targetName, weight] of Object.entries(individualMorphs)) {
          this.individualTargets.set(targetName, weight);
          if (!this.individualCurrents.has(targetName)) {
            this.individualCurrents.set(targetName, 0);
          }
        }
      }
    } else {
      // Lab state driven expressions
      if (labState === 'SPEAKING') {
        if (!this.isSpeaking) this.startSpeaking();
        this.updateSpeakingDriver(delta);
      } else if (labState === 'INTERRUPTED') {
        if (this.isSpeaking) this.stopSpeaking(true);
        this.targetWeights.mouthOpen = 0;
        this.targetWeights.smile = 0;
      } else if (labState === 'LISTENING') {
        if (this.isSpeaking) this.stopSpeaking(false);
        this.targetWeights.mouthOpen = 0;
        this.targetWeights.smile = 0.12;
      } else if (labState === 'THINKING') {
        if (this.isSpeaking) this.stopSpeaking(false);
        this.targetWeights.mouthOpen = 0;
        this.targetWeights.smile = 0.04;
      } else {
        // READY / PAUSED / ERROR
        if (this.isSpeaking) this.stopSpeaking(false);
        this.neutral();
      }
    }

    // Smooth interpolation towards targets
    const dt = Math.min(delta, 0.1);
    const normalSmooth = 1.0 - Math.exp(-14.0 * dt);
    const blinkSmooth = 1.0 - Math.exp(-28.0 * dt);

    const keys = Object.keys(this.targetWeights) as (keyof SemanticWeights)[];
    for (const k of keys) {
      const isBlinkKey = k === 'blink' || k === 'blinkLeft' || k === 'blinkRight';
      const factor = isBlinkKey ? blinkSmooth : normalSmooth;
      this.currentWeights[k] += (this.targetWeights[k] - this.currentWeights[k]) * factor;
    }

    // Smooth individual overrides
    for (const [name, targetVal] of this.individualTargets.entries()) {
      const cur = this.individualCurrents.get(name) || 0;
      this.individualCurrents.set(name, cur + (targetVal - cur) * normalSmooth);
    }

    // Apply to Three.js meshes
    this.applyToScene();
  }

  public applyToScene(): void {
    const finalTargetWeights = new Map<string, number>();

    const keys = Object.keys(this.currentWeights) as (keyof SemanticWeights)[];
    for (const key of keys) {
      let weight = this.currentWeights[key];

      // Blend natural blink into blink target
      if (key === 'blink' && this.naturalBlinkWeight > weight) {
        weight = this.naturalBlinkWeight;
      }

      if (weight > 0.0001) {
        const resolvedNames = this.resolvedMap[key];
        if (resolvedNames) {
          for (const name of resolvedNames) {
            const current = finalTargetWeights.get(name) || 0;
            finalTargetWeights.set(name, Math.max(current, weight));
          }
        }
      }
    }

    // Individual morph overrides
    for (const [name, weight] of this.individualCurrents.entries()) {
      if (weight > 0.0001) {
        finalTargetWeights.set(name, weight);
      }
    }

    // Apply to every bound mesh primitive
    for (const [targetName, bindings] of this.registry.bindings.entries()) {
      const weight = finalTargetWeights.get(targetName) || 0;
      for (const b of bindings) {
        if (b.mesh.morphTargetInfluences) {
          b.mesh.morphTargetInfluences[b.index] = weight;
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 5-Stage Pipeline Telemetry
  // -------------------------------------------------------------
  public getPipelineTelemetry(uiMouthA: number, uiBlink: number, vrmRootsInScene: number = 1): EngineTelemetryData {
    // Read live mesh influence directly from mesh morphTargetInfluences
    let liveMthA = 0;
    if (this.mouthABindings.length > 0) {
      const b = this.mouthABindings[0];
      if (b.mesh.morphTargetInfluences) {
        liveMthA = b.mesh.morphTargetInfluences[b.index] || 0;
      }
    }

    let liveBlink = 0;
    if (this.blinkBindings.length > 0) {
      const b = this.blinkBindings[0];
      if (b.mesh.morphTargetInfluences) {
        liveBlink = b.mesh.morphTargetInfluences[b.index] || 0;
      }
    }

    // Effective blink target including natural blink
    const effectiveBlinkTarget = Math.max(this.targetWeights.blink, this.naturalBlinkWeight);
    const effectiveBlinkCurrent = Math.max(this.currentWeights.blink, this.naturalBlinkWeight);

    return {
      instanceId: this.instanceId,
      boundMeshCount: this.mouthABindings.length,
      totalTargetCount: this.registry.allTargetNames.length,
      vrmRootsInScene,
      fps: this.currentFps,
      pipelineMouthA: {
        targetName: 'Fcl_MTH_A',
        uiValue: uiMouthA,
        targetWeight: this.targetWeights.mouthOpen || (this.targetWeights.vowelA),
        currentWeight: this.currentWeights.mouthOpen || (this.currentWeights.vowelA),
        meshInfluence: liveMthA,
        meshCount: this.mouthABindings.length,
      },
      pipelineBlink: {
        targetName: 'Fcl_EYE_Close',
        uiValue: uiBlink,
        targetWeight: effectiveBlinkTarget,
        currentWeight: effectiveBlinkCurrent,
        meshInfluence: liveBlink,
        meshCount: this.blinkBindings.length,
      },
      activeSpeechVowel: this.isSpeaking ? this.activeVowel : undefined,
      blinkState: this.blinkState,
      isSpeaking: this.isSpeaking,
      isManualOverride: this.manualOverrideActive,
    };
  }

  // -------------------------------------------------------------
  // Repeatability Stress Test Suite (10x Cycles)
  // -------------------------------------------------------------
  public async runStressTest(
    onProgress: (res: AvatarStressTestResult) => void
  ): Promise<AvatarStressTestResult> {
    const totalCycles = 10;
    const logs: string[] = [];
    const log = (msg: string) => {
      logs.push(`[${new Date().toISOString().substring(11, 19)}] ${msg}`);
      onProgress({
        running: true,
        progress: 0,
        cyclesCompleted: 0,
        totalCycles,
        passed: null,
        logs: [...logs],
      });
    };

    log(`Starting Avatar Engine Stress Test (${totalCycles} cycles)...`);
    log(`Bound meshes for Fcl_MTH_A: ${this.mouthABindings.length}`);

    if (this.mouthABindings.length === 0) {
      const failRes: AvatarStressTestResult = {
        running: false,
        progress: 0,
        cyclesCompleted: 0,
        totalCycles,
        passed: false,
        logs: [...logs, 'FAILED: Zero mesh bindings found for Fcl_MTH_A.'],
        errorMessage: 'Zero mesh bindings found for Fcl_MTH_A.',
      };
      onProgress(failRes);
      return failRes;
    }

    try {
      for (let cycle = 1; cycle <= totalCycles; cycle++) {
        // Step 1: OPEN (Mouth Open = 1.0)
        this.open(1.0);
        this.currentWeights.mouthOpen = 1.0;
        this.applyToScene();

        // Verify across all bound meshes
        for (let i = 0; i < this.mouthABindings.length; i++) {
          const b = this.mouthABindings[i];
          const val = b.mesh.morphTargetInfluences ? b.mesh.morphTargetInfluences[b.index] : -1;
          if (val < 0.99) {
            throw new Error(`Cycle ${cycle}: Mesh ${b.meshName}[${b.index}] failed OPEN. Value=${val}`);
          }
        }

        // Step 2: NEUTRAL (Mouth Open = 0)
        this.neutral();
        this.currentWeights.mouthOpen = 0;
        this.applyToScene();

        for (let i = 0; i < this.mouthABindings.length; i++) {
          const b = this.mouthABindings[i];
          const val = b.mesh.morphTargetInfluences ? b.mesh.morphTargetInfluences[b.index] : -1;
          if (val > 0.01) {
            throw new Error(`Cycle ${cycle}: Mesh ${b.meshName}[${b.index}] failed NEUTRAL. Value=${val}`);
          }
        }

        // Step 3: BLINK (1.0)
        this.blink(1.0);
        this.currentWeights.blink = 1.0;
        this.applyToScene();

        for (let i = 0; i < this.blinkBindings.length; i++) {
          const b = this.blinkBindings[i];
          const val = b.mesh.morphTargetInfluences ? b.mesh.morphTargetInfluences[b.index] : -1;
          if (val < 0.99) {
            throw new Error(`Cycle ${cycle}: Mesh ${b.meshName}[${b.index}] failed BLINK. Value=${val}`);
          }
        }

        // Step 4: SMILE (1.0)
        this.smile(1.0);
        this.currentWeights.smile = 1.0;
        this.currentWeights.blink = 0;
        this.applyToScene();

        // Step 5: Return to NEUTRAL
        this.neutral();
        this.currentWeights.smile = 0;
        this.applyToScene();

        const progress = Math.round((cycle / totalCycles) * 90);
        onProgress({
          running: true,
          progress,
          cyclesCompleted: cycle,
          totalCycles,
          passed: null,
          logs: [...logs, `Cycle ${cycle}/${totalCycles}: PASS (All ${this.mouthABindings.length} meshes verified)`],
        });

        // Small pause between cycles to allow render pass
        await new Promise((resolve) => setTimeout(resolve, 35));
      }

      // Step 6: Test Speaking Interruption Cutoff
      log('Testing Speaking State & Interruption Cutoff...');
      this.manualOverrideActive = false;
      this.startSpeaking();
      this.updateSpeakingDriver(0.05);
      this.currentWeights.vowelA = 0.7;
      this.applyToScene();

      // Interrupt
      this.stopSpeaking(true);
      const interruptedVal = this.mouthABindings[0]?.mesh.morphTargetInfluences?.[this.mouthABindings[0].index] || 0;
      if (interruptedVal > 0.05) {
        throw new Error(`Interruption failed: Mouth influence not cut to 0. Value=${interruptedVal}`);
      }
      log(`Interruption cutoff verified: Mouth influence = ${interruptedVal}`);

      this.resetAll();

      const finalRes: AvatarStressTestResult = {
        running: false,
        progress: 100,
        cyclesCompleted: totalCycles,
        totalCycles,
        passed: true,
        logs: [
          ...logs,
          `AVATAR ENGINE: PASS (${totalCycles}/${totalCycles} cycles, 0 dropouts, ${this.mouthABindings.length}/${this.mouthABindings.length} meshes verified)`,
        ],
      };
      onProgress(finalRes);
      return finalRes;
    } catch (err: any) {
      const failRes: AvatarStressTestResult = {
        running: false,
        progress: 100,
        cyclesCompleted: 0,
        totalCycles,
        passed: false,
        logs: [...logs, `STRESS TEST FAILED: ${err.message}`],
        errorMessage: err.message,
      };
      onProgress(failRes);
      return failRes;
    }
  }
}
