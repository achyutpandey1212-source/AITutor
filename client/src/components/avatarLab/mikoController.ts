import * as THREE from 'three';
import { VRM } from '@pixiv/three-vrm';
import { AvatarLabState } from './types';

export interface MeshMorphBinding {
  mesh: THREE.Mesh;
  index: number;
  meshName: string;
}

export interface MorphMeshDetail {
  id: string;
  meshName: string;
  materialName: string;
  targetCount: number;
}

export interface ModelMorphRegistry {
  bindings: Map<string, MeshMorphBinding[]>;
  allTargetNames: string[];
  morphMeshes: MorphMeshDetail[];
  semanticMap: Record<string, string[]>;
}

export type VowelKey = 'A' | 'I' | 'U' | 'E' | 'O';

export interface SemanticWeights {
  mouthOpen: number;
  smile: number;
  sad: number;
  surprised: number;
  blink: number;
  blinkLeft: number;
  blinkRight: number;
  vowelA: number;
  vowelI: number;
  vowelU: number;
  vowelE: number;
  vowelO: number;
  neutral: number;
}

// Miko's verified exact morph target mappings
export const MIKO_EXACT_TARGETS: Record<keyof SemanticWeights, string[]> = {
  mouthOpen: ['Fcl_MTH_A'],
  smile: ['Fcl_MTH_Joy', 'Fcl_EYE_Joy'],
  sad: ['Fcl_MTH_Sorrow', 'Fcl_BRW_Sorrow'],
  surprised: ['Fcl_MTH_Surprised', 'Fcl_EYE_Surprised'],
  blink: ['Fcl_EYE_Close'],
  blinkLeft: ['Fcl_EYE_Close_L'],
  blinkRight: ['Fcl_EYE_Close_R'],
  vowelA: ['Fcl_MTH_A'],
  vowelI: ['Fcl_MTH_I'],
  vowelU: ['Fcl_MTH_U'],
  vowelE: ['Fcl_MTH_E'],
  vowelO: ['Fcl_MTH_O'],
  neutral: ['Fcl_ALL_Neutral'],
};

// Fallback mappings for other avatars (e.g. Orion, Aurora)
export const GENERIC_CANDIDATES: Record<keyof SemanticWeights, string[]> = {
  mouthOpen: ['Fcl_MTH_A', 'aa', 'a', 'mouthopen', 'jawopen'],
  smile: ['Fcl_MTH_Joy', 'Fcl_ALL_Joy', 'happy', 'joy', 'smile'],
  sad: ['Fcl_MTH_Sorrow', 'Fcl_ALL_Sorrow', 'sad', 'sorrow'],
  surprised: ['Fcl_MTH_Surprised', 'Fcl_ALL_Surprised', 'surprised'],
  blink: ['Fcl_EYE_Close', 'blink', 'eye_close', 'eyelid_close'],
  blinkLeft: ['Fcl_EYE_Close_L', 'blinkleft', 'blink_l'],
  blinkRight: ['Fcl_EYE_Close_R', 'blinkright', 'blink_r'],
  vowelA: ['Fcl_MTH_A', 'aa', 'a'],
  vowelI: ['Fcl_MTH_I', 'ih', 'i'],
  vowelU: ['Fcl_MTH_U', 'ou', 'u'],
  vowelE: ['Fcl_MTH_E', 'ee', 'e'],
  vowelO: ['Fcl_MTH_O', 'oh', 'o'],
  neutral: ['Fcl_ALL_Neutral', 'neutral'],
};

/**
 * Builds the morph target binding registry for all meshes in the avatar scene.
 */
export function buildMorphRegistry(root: THREE.Object3D, vrm: VRM | null): ModelMorphRegistry {
  const bindings = new Map<string, MeshMorphBinding[]>();
  const morphMeshes: MorphMeshDetail[] = [];
  const targetNamesSet = new Set<string>();

  let meshIndex = 0;
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh && mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
      meshIndex++;
      const mat = mesh.material;
      const matName = Array.isArray(mat)
        ? mat.map((m) => m.name).join(', ')
        : (mat as THREE.Material)?.name || 'Default';

      const targetCount = Object.keys(mesh.morphTargetDictionary).length;
      morphMeshes.push({
        id: `mesh_${meshIndex}`,
        meshName: mesh.name || `SkinnedMesh_${meshIndex}`,
        materialName: matName,
        targetCount,
      });

      for (const [targetName, targetIdx] of Object.entries(mesh.morphTargetDictionary)) {
        targetNamesSet.add(targetName);
        if (!bindings.has(targetName)) {
          bindings.set(targetName, []);
        }
        bindings.get(targetName)!.push({
          mesh,
          index: targetIdx,
          meshName: mesh.name || `Mesh_${meshIndex}`,
        });
      }
    }
  });

  if (vrm?.expressionManager?.expressions) {
    vrm.expressionManager.expressions.forEach((expr) => {
      if (expr.expressionName) {
        targetNamesSet.add(expr.expressionName);
      }
    });
  }

  const allTargetNames = Array.from(targetNamesSet);

  // Pre-resolve semantic map
  const semanticMap: Record<string, string[]> = {};
  const isMikoModel = allTargetNames.some((t) => t.startsWith('Fcl_'));
  const candidateSource = isMikoModel ? MIKO_EXACT_TARGETS : GENERIC_CANDIDATES;
  for (const [k, cands] of Object.entries(candidateSource)) {
    semanticMap[k] = [];
    for (const cand of cands) {
      if (allTargetNames.includes(cand)) {
        semanticMap[k].push(cand);
      } else {
        const found = allTargetNames.find((t) => t.toLowerCase() === cand.toLowerCase());
        if (found && !semanticMap[k].includes(found)) {
          semanticMap[k].push(found);
        }
      }
    }
  }

  return {
    bindings,
    allTargetNames,
    morphMeshes,
    semanticMap,
  };
}

/**
 * Production-ready Miko Expression Controller.
 * Owns all facial deformation, smoothing, interpolation, speaking mouth cycle,
 * natural blink scheduling, and post-vrm.update multi-mesh application.
 */
export class MikoExpressionController {
  private registry: ModelMorphRegistry;
  private isMiko: boolean;

  // Resolved mapping of semantic key -> array of actual target names in this model
  private resolvedMap: Record<keyof SemanticWeights, string[]>;

  // Target and Current weights for smoothing/interpolation
  private targetWeights: SemanticWeights;
  private currentWeights: SemanticWeights;

  // Individual morph overrides from developer diagnostic sliders (targetName -> target weight)
  private individualTargets: Map<string, number> = new Map();
  private individualCurrents: Map<string, number> = new Map();

  // Natural blink state machine
  private nextBlinkTime: number = 2.0;
  private blinkState: 'idle' | 'closing' | 'holding' | 'opening' = 'idle';
  private blinkPhaseTimer: number = 0;
  private blinkWeight: number = 0;

  // Speaking mouth driver state
  private isSpeaking: boolean = false;
  private speechElapsed: number = 0;
  private currentVowelIndex: number = 0;
  private nextVowelSwitchTime: number = 0;

  constructor(registry: ModelMorphRegistry, isMiko: boolean = true) {
    this.registry = registry;
    this.isMiko = isMiko;

    this.targetWeights = this.createEmptyWeights();
    this.currentWeights = this.createEmptyWeights();
    this.resolvedMap = this.resolveSemanticMap();
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
          // Case-insensitive lookup fallback
          const found = this.registry.allTargetNames.find((t) => t.toLowerCase() === cand.toLowerCase());
          if (found && !res[key].includes(found)) {
            res[key].push(found);
          }
        }
      }
    }
    return res;
  }

  // -------------------------------------------------------------
  // Semantic Expression API
  // -------------------------------------------------------------
  public neutral(): void {
    this.targetWeights.mouthOpen = 0;
    this.targetWeights.smile = 0;
    this.targetWeights.sad = 0;
    this.targetWeights.surprised = 0;
    this.targetWeights.vowelA = 0;
    this.targetWeights.vowelI = 0;
    this.targetWeights.vowelU = 0;
    this.targetWeights.vowelE = 0;
    this.targetWeights.vowelO = 0;
    this.targetWeights.neutral = 1.0;
  }

  public blink(weight: number): void {
    this.targetWeights.blink = Math.max(0, Math.min(1, weight));
  }

  public mouthOpen(weight: number): void {
    this.targetWeights.mouthOpen = Math.max(0, Math.min(1, weight));
    if (weight > 0) this.targetWeights.neutral = 0;
  }

  public smile(weight: number): void {
    this.targetWeights.smile = Math.max(0, Math.min(1, weight));
    if (weight > 0) this.targetWeights.neutral = 0;
  }

  public sad(weight: number): void {
    this.targetWeights.sad = Math.max(0, Math.min(1, weight));
    if (weight > 0) this.targetWeights.neutral = 0;
  }

  public surprised(weight: number): void {
    this.targetWeights.surprised = Math.max(0, Math.min(1, weight));
    if (weight > 0) this.targetWeights.neutral = 0;
  }

  public setVowel(vowel: VowelKey, weight: number): void {
    const clamped = Math.max(0, Math.min(1, weight));
    switch (vowel) {
      case 'A':
        this.targetWeights.vowelA = clamped;
        break;
      case 'I':
        this.targetWeights.vowelI = clamped;
        break;
      case 'U':
        this.targetWeights.vowelU = clamped;
        break;
      case 'E':
        this.targetWeights.vowelE = clamped;
        break;
      case 'O':
        this.targetWeights.vowelO = clamped;
        break;
    }
    if (clamped > 0) this.targetWeights.neutral = 0;
  }

  public setIndividualMorph(targetName: string, weight: number): void {
    this.individualTargets.set(targetName, Math.max(0, Math.min(1, weight)));
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

  public resetAll(): void {
    const keys = Object.keys(this.targetWeights) as (keyof SemanticWeights)[];
    for (const k of keys) {
      this.targetWeights[k] = 0;
      this.currentWeights[k] = 0;
    }
    this.individualTargets.clear();
    this.individualCurrents.clear();
    this.isSpeaking = false;
    this.blinkState = 'idle';
    this.blinkWeight = 0;
  }

  // -------------------------------------------------------------
  // Speech Driver Lifecycle
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
    }
  }

  // -------------------------------------------------------------
  // Internal Updates: Natural Blink & Speaking Driver
  // -------------------------------------------------------------
  private updateNaturalBlink(delta: number, elapsed: number): void {
    // If manual blink is commanded, let manual take over
    if (this.targetWeights.blink > 0.01) {
      this.blinkState = 'idle';
      this.blinkWeight = 0;
      return;
    }

    if (this.blinkState === 'idle') {
      if (elapsed > this.nextBlinkTime) {
        this.blinkState = 'closing';
        this.blinkPhaseTimer = 0;
      }
    } else if (this.blinkState === 'closing') {
      // Fast eyelid closing: ~80-100ms
      this.blinkPhaseTimer += delta;
      const progress = Math.min(1, this.blinkPhaseTimer / 0.09);
      this.blinkWeight = progress;
      if (progress >= 1.0) {
        this.blinkState = 'holding';
        this.blinkPhaseTimer = 0;
      }
    } else if (this.blinkState === 'holding') {
      // Brief closed pause: ~20ms
      this.blinkPhaseTimer += delta;
      this.blinkWeight = 1.0;
      if (this.blinkPhaseTimer >= 0.02) {
        this.blinkState = 'opening';
        this.blinkPhaseTimer = 0;
      }
    } else if (this.blinkState === 'opening') {
      // Reopen eyelids: ~100-140ms
      this.blinkPhaseTimer += delta;
      const progress = Math.min(1, this.blinkPhaseTimer / 0.12);
      this.blinkWeight = 1.0 - progress;
      if (progress >= 1.0) {
        this.blinkState = 'idle';
        this.blinkWeight = 0;
        // Schedule next blink in 2.8s to 5.5s
        this.nextBlinkTime = elapsed + 2.8 + Math.random() * 2.7;
      }
    }
  }

  private updateSpeakingDriver(delta: number): void {
    if (!this.isSpeaking) return;

    this.speechElapsed += delta;

    // Vowel sequence order: A -> O -> E -> I -> U with natural cadence
    const vowels: VowelKey[] = ['A', 'O', 'E', 'I', 'U'];

    if (this.speechElapsed >= this.nextVowelSwitchTime) {
      // Advance to next vowel with randomized duration (110ms - 220ms)
      this.currentVowelIndex = (this.currentVowelIndex + 1) % vowels.length;
      const duration = 0.11 + Math.random() * 0.11;
      this.nextVowelSwitchTime = this.speechElapsed + duration;
    }

    // Dynamic syllabic rhythm
    const syllableWave = Math.sin(this.speechElapsed * 11.0);
    const openness = Math.max(0.15, Math.min(0.85, 0.45 + syllableWave * 0.35));

    const activeVowel = vowels[this.currentVowelIndex];
    this.targetWeights.vowelA = activeVowel === 'A' ? openness : 0;
    this.targetWeights.vowelO = activeVowel === 'O' ? openness * 0.8 : 0;
    this.targetWeights.vowelE = activeVowel === 'E' ? openness * 0.7 : 0;
    this.targetWeights.vowelI = activeVowel === 'I' ? openness * 0.65 : 0;
    this.targetWeights.vowelU = activeVowel === 'U' ? openness * 0.6 : 0;
  }

  // -------------------------------------------------------------
  // Frame Update & Multi-Mesh Application (Called AFTER vrm.update)
  // -------------------------------------------------------------
  public update(
    delta: number,
    elapsed: number,
    labState: AvatarLabState,
    isManualOverride: boolean
  ): void {
    // 1. Natural blink update
    this.updateNaturalBlink(delta, elapsed);

    // 2. Speaking driver update
    if (labState === 'SPEAKING' && !isManualOverride) {
      if (!this.isSpeaking) {
        this.startSpeaking();
      }
      this.updateSpeakingDriver(delta);
    } else {
      if (this.isSpeaking) {
        this.stopSpeaking(labState === 'INTERRUPTED');
      }
    }

    // 3. Smooth interpolation towards target weights
    // Emotional expressions: ~150-250ms smoothing
    // Blink: fast smoothing
    const dt = Math.min(delta, 0.1);
    const normalSmooth = 1.0 - Math.exp(-12.0 * dt);
    const blinkSmooth = 1.0 - Math.exp(-25.0 * dt);

    const keys = Object.keys(this.targetWeights) as (keyof SemanticWeights)[];
    for (const k of keys) {
      const isBlinkKey = k === 'blink' || k === 'blinkLeft' || k === 'blinkRight';
      const factor = isBlinkKey ? blinkSmooth : normalSmooth;
      this.currentWeights[k] += (this.targetWeights[k] - this.currentWeights[k]) * factor;
    }

    // Smooth individual morph overrides
    for (const [name, targetVal] of this.individualTargets.entries()) {
      const cur = this.individualCurrents.get(name) || 0;
      const next = cur + (targetVal - cur) * normalSmooth;
      this.individualCurrents.set(name, next);
    }

    // 4. Apply all weights to the Three.js mesh instances post-update
    this.applyToScene();
  }

  private applyToScene(): void {
    // Collect active weight map by target name
    const finalTargetWeights = new Map<string, number>();

    // Semantic targets
    const keys = Object.keys(this.currentWeights) as (keyof SemanticWeights)[];
    for (const key of keys) {
      let weight = this.currentWeights[key];

      // Blend natural blink into blink target
      if (key === 'blink' && this.blinkWeight > weight) {
        weight = this.blinkWeight;
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

    // Apply to every bound SkinnedMesh across all primitives
    for (const [targetName, bindings] of this.registry.bindings.entries()) {
      const weight = finalTargetWeights.get(targetName) || 0;
      for (const b of bindings) {
        if (b.mesh.morphTargetInfluences) {
          b.mesh.morphTargetInfluences[b.index] = weight;
        }
      }
    }
  }

  /**
   * Diagnostic helper to read the actual live influence from the outer face skin mesh.
   */
  public getLiveInfluences(): { mouthA: number; eyeClose: number } {
    const mouthBindings = this.registry.bindings.get('Fcl_MTH_A');
    const eyeBindings = this.registry.bindings.get('Fcl_EYE_Close');

    const mouthA = mouthBindings && mouthBindings[0]?.mesh.morphTargetInfluences
      ? mouthBindings[0].mesh.morphTargetInfluences[mouthBindings[0].index]
      : 0;

    const eyeClose = eyeBindings && eyeBindings[0]?.mesh.morphTargetInfluences
      ? eyeBindings[0].mesh.morphTargetInfluences[eyeBindings[0].index]
      : 0;

    return { mouthA, eyeClose };
  }
}
