import * as THREE from 'three';
import { VRM } from '@pixiv/three-vrm';
import { AvatarLabState } from './types';

export type TeachingPose =
  | 'OPEN_EXPLANATION'
  | 'RIGHT_EMPHASIS'
  | 'LEFT_PRESENT'
  | 'BOTH_HAND_FRAME'
  | 'COUNT_EMPHASIS'
  | 'ACKNOWLEDGEMENT';

// Backward compatible alias
export type GestureType =
  | TeachingPose
  | 'EXPLANATION'
  | 'EMPHASIS'
  | 'PRESENT'
  | 'ACKNOWLEDGE';

export interface PoseBoneOffsets {
  leftUpperArm?: [number, number, number];
  rightUpperArm?: [number, number, number];
  leftLowerArm?: [number, number, number];
  rightLowerArm?: [number, number, number];
  leftHand?: [number, number, number];
  rightHand?: [number, number, number];
  chest?: [number, number, number];
  head?: [number, number, number];
}

export interface TeachingPhraseDef {
  duration: number;
  attackRatio: number;
  holdRatio: number;
  bones: PoseBoneOffsets;
}

/**
 * Teaching pose library.
 * Verified coordinate deltas against Miko's VRM 0.0 humanoid rig.
 * Each pose lifts hands visibly in front of the torso and coordinates
 * head, chest, and arm movements for an authentic teacher performance.
 */
export const TEACHING_PHRASE_DEFINITIONS: Record<TeachingPose, TeachingPhraseDef> = {
  OPEN_EXPLANATION: {
    // Both hands move forward and outward from torso (~1.25s)
    duration: 1.25,
    attackRatio: 0.28,
    holdRatio: 0.42,
    bones: {
      leftUpperArm: [0.20, 0.10, -0.24],
      rightUpperArm: [0.20, -0.10, 0.24],
      leftLowerArm: [0.10, -0.40, -0.10],
      rightLowerArm: [0.10, 0.40, 0.10],
      chest: [0.015, 0, 0],
      head: [0.018, 0, 0],
    },
  },
  RIGHT_EMPHASIS: {
    // Right hand lifted into chest/mid view for controlled emphasis (~0.95s)
    duration: 0.95,
    attackRatio: 0.26,
    holdRatio: 0.40,
    bones: {
      rightUpperArm: [0.30, -0.15, 0.37],
      rightLowerArm: [0.15, 0.50, 0.15],
      rightHand: [0.00, 0.12, 0.00],
      chest: [0.012, -0.010, 0],
      head: [0.024, -0.015, 0],
    },
  },
  LEFT_PRESENT: {
    // Left hand opens toward side/front: "Consider this" (~1.15s)
    duration: 1.15,
    attackRatio: 0.28,
    holdRatio: 0.42,
    bones: {
      leftUpperArm: [0.17, 0.25, -0.32],
      leftLowerArm: [0.10, -0.35, -0.05],
      leftHand: [0.00, -0.12, -0.08],
      chest: [0.010, 0.012, 0],
      head: [0.012, 0.038, 0],
    },
  },
  BOTH_HAND_FRAME: {
    // Both hands brought forward in front of torso framing a concept (~1.40s)
    duration: 1.40,
    attackRatio: 0.28,
    holdRatio: 0.44,
    bones: {
      leftUpperArm: [0.20, 0.08, -0.17],
      rightUpperArm: [0.20, -0.08, 0.17],
      leftLowerArm: [0.10, -0.57, -0.25],
      rightLowerArm: [0.10, 0.57, 0.25],
      chest: [0.018, 0, 0],
      head: [0.016, 0, 0],
    },
  },
  COUNT_EMPHASIS: {
    // Short crisp point / enumeration accent ("First... second...") (~0.80s)
    duration: 0.80,
    attackRatio: 0.25,
    holdRatio: 0.40,
    bones: {
      rightUpperArm: [0.27, -0.05, 0.27],
      rightLowerArm: [0.10, 0.35, 0.05],
      rightHand: [0.00, 0.08, 0.00],
      head: [0.022, 0, 0],
    },
  },
  ACKNOWLEDGEMENT: {
    // Subtle affirmation hand lift with warm nod (~0.65s)
    duration: 0.65,
    attackRatio: 0.25,
    holdRatio: 0.45,
    bones: {
      rightUpperArm: [0.14, -0.02, 0.12],
      rightLowerArm: [0.05, 0.20, 0.00],
      head: [0.020, 0, 0],
    },
  },
};

interface ChoreographyStep {
  pose: TeachingPose;
  stillAfter: number;
}

const PERFORMANCE_ROUTINES: ChoreographyStep[][] = [
  // Routine 1: Conceptual explanation & emphasis
  [
    { pose: 'OPEN_EXPLANATION', stillAfter: 1.4 },
    { pose: 'RIGHT_EMPHASIS', stillAfter: 1.8 },
    { pose: 'BOTH_HAND_FRAME', stillAfter: 1.5 },
    { pose: 'LEFT_PRESENT', stillAfter: 2.0 },
    { pose: 'COUNT_EMPHASIS', stillAfter: 1.4 },
    { pose: 'RIGHT_EMPHASIS', stillAfter: 1.7 },
    { pose: 'ACKNOWLEDGEMENT', stillAfter: 1.9 },
  ],
  // Routine 2: Structured framing & demonstration
  [
    { pose: 'BOTH_HAND_FRAME', stillAfter: 1.6 },
    { pose: 'LEFT_PRESENT', stillAfter: 1.5 },
    { pose: 'RIGHT_EMPHASIS', stillAfter: 2.2 },
    { pose: 'OPEN_EXPLANATION', stillAfter: 1.4 },
    { pose: 'COUNT_EMPHASIS', stillAfter: 1.8 },
    { pose: 'ACKNOWLEDGEMENT', stillAfter: 1.6 },
  ],
  // Routine 3: Analytical walkthrough
  [
    { pose: 'RIGHT_EMPHASIS', stillAfter: 1.5 },
    { pose: 'OPEN_EXPLANATION', stillAfter: 2.0 },
    { pose: 'COUNT_EMPHASIS', stillAfter: 1.3 },
    { pose: 'BOTH_HAND_FRAME', stillAfter: 1.8 },
    { pose: 'LEFT_PRESENT', stillAfter: 1.5 },
    { pose: 'RIGHT_EMPHASIS', stillAfter: 1.6 },
  ],
];

function normalizePose(type: GestureType): TeachingPose {
  if (type === 'EXPLANATION') return 'OPEN_EXPLANATION';
  if (type === 'EMPHASIS') return 'RIGHT_EMPHASIS';
  if (type === 'PRESENT') return 'LEFT_PRESENT';
  if (type === 'ACKNOWLEDGE') return 'ACKNOWLEDGEMENT';
  return type as TeachingPose;
}

/**
 * 3-Stage Teaching Gesture Envelope:
 * Anticipation/Attack (smoothstep) -> Apex Hold (1.0) -> Release/Return (smoothstep)
 */
function computePhraseWeight(t: number, totalDuration: number, attackRatio: number, holdRatio: number): number {
  if (totalDuration <= 0) return 0;
  const normT = Math.max(0, Math.min(1, t / totalDuration));
  const attackEnd = attackRatio;
  const holdEnd = attackRatio + holdRatio;

  if (normT < attackEnd) {
    const p = normT / attackEnd;
    return p * p * (3 - 2 * p);
  } else if (normT <= holdEnd) {
    return 1.0;
  } else {
    const p = (normT - holdEnd) / (1.0 - holdEnd);
    return 1.0 - p * p * (3 - 2 * p);
  }
}


/**
 * Authoritative Miko Body Controller.
 * 
 * Implements a 3-Layer Motion System:
 * 1. BASE: Gentle breathing on chest and spine.
 * 2. POSTURE: Grounded resting tutor posture and state-specific head/neck/torso alignments.
 * 3. GESTURE: Sparse, restrained conversational hand gestures during speech.
 * 
 * Uses the standard VRM normalized humanoid rig with graceful degradation.
 */
export class MikoBodyController {
  private vrm: VRM | null;

  // Normalized humanoid bone nodes
  private headNode: THREE.Object3D | null = null;
  private neckNode: THREE.Object3D | null = null;
  private chestNode: THREE.Object3D | null = null;
  private spineNode: THREE.Object3D | null = null;
  private leftShoulderNode: THREE.Object3D | null = null;
  private rightShoulderNode: THREE.Object3D | null = null;
  private leftUpperArmNode: THREE.Object3D | null = null;
  private rightUpperArmNode: THREE.Object3D | null = null;
  private leftLowerArmNode: THREE.Object3D | null = null;
  private rightLowerArmNode: THREE.Object3D | null = null;
  private leftHandNode: THREE.Object3D | null = null;
  private rightHandNode: THREE.Object3D | null = null;

  // Current interpolated posture rotations
  private curHead = new THREE.Vector3();
  private curNeck = new THREE.Vector3();
  private curChest = new THREE.Vector3();
  private curSpine = new THREE.Vector3();
  private curLeftUpperArm = new THREE.Vector3(0.08, 0.10, 1.22);
  private curRightUpperArm = new THREE.Vector3(0.08, -0.10, -1.22);
  private curLeftLowerArm = new THREE.Vector3(0.00, -0.35, -0.15);
  private curRightLowerArm = new THREE.Vector3(0.00, 0.35, 0.15);
  private curLeftHand = new THREE.Vector3();
  private curRightHand = new THREE.Vector3();

  // Target posture rotations
  private tgtHead = new THREE.Vector3();
  private tgtNeck = new THREE.Vector3();
  private tgtChest = new THREE.Vector3();
  private tgtSpine = new THREE.Vector3();
  private tgtLeftUpperArm = new THREE.Vector3(0.08, 0.10, 1.22);
  private tgtRightUpperArm = new THREE.Vector3(0.08, -0.10, -1.22);
  private tgtLeftLowerArm = new THREE.Vector3(0.00, -0.35, -0.15);
  private tgtRightLowerArm = new THREE.Vector3(0.00, 0.35, 0.15);
  private tgtLeftHand = new THREE.Vector3();
  private tgtRightHand = new THREE.Vector3();

  // Gesture offset rotations (temporary contribution)
  private gestLeftUpperArm = new THREE.Vector3();
  private gestRightUpperArm = new THREE.Vector3();
  private gestLeftLowerArm = new THREE.Vector3();
  private gestRightLowerArm = new THREE.Vector3();
  private gestLeftHand = new THREE.Vector3();
  private gestRightHand = new THREE.Vector3();
  private gestChest = new THREE.Vector3();
  private gestHead = new THREE.Vector3();

  // Active gesture state
  private activePose: TeachingPose | null = null;
  private gestureTimer: number = 0;
  private gestureDuration: number = 0;
  private gestureAttackRatio: number = 0.28;
  private gestureHoldRatio: number = 0.42;

  // Performance Director State (Speaking Choreography)
  private directorPhase: 'INITIAL_REST' | 'PLAYING_PHRASE' | 'STILLNESS' = 'INITIAL_REST';
  private currentRoutineIndex: number = 0;
  private stepIndex: number = 0;
  private directorTimer: number = 0;
  private directorWaitDuration: number = 0.8;
  private wasSpeechActive: boolean = false;

  // Listening micro-nod state
  private nextListeningNodTime: number = 4.0;
  private listeningNodTimer: number = 0;
  private isListeningNodding: boolean = false;

  // Conversational head rhythm state (Speaking)
  private nextHeadRhythmTime: number = 0;
  private speakingHeadTarget = new THREE.Vector3();

  constructor(vrm: VRM | null) {
    this.vrm = vrm;
    this.bindHumanoidBones();
  }

  private bindHumanoidBones(): void {
    if (!this.vrm || !this.vrm.humanoid) return;
    const h = this.vrm.humanoid;

    this.headNode = h.getNormalizedBoneNode('head');
    this.neckNode = h.getNormalizedBoneNode('neck');
    this.chestNode = h.getNormalizedBoneNode('chest');
    this.spineNode = h.getNormalizedBoneNode('spine');
    this.leftShoulderNode = h.getNormalizedBoneNode('leftShoulder');
    this.rightShoulderNode = h.getNormalizedBoneNode('rightShoulder');
    this.leftUpperArmNode = h.getNormalizedBoneNode('leftUpperArm');
    this.rightUpperArmNode = h.getNormalizedBoneNode('rightUpperArm');
    this.leftLowerArmNode = h.getNormalizedBoneNode('leftLowerArm');
    this.rightLowerArmNode = h.getNormalizedBoneNode('rightLowerArm');
    this.leftHandNode = h.getNormalizedBoneNode('leftHand');
    this.rightHandNode = h.getNormalizedBoneNode('rightHand');

    // Initialize resting pose immediately
    this.resetBody();
  }

  public getAvailableBonesReport(): Record<string, boolean> {
    return {
      head: Boolean(this.headNode),
      neck: Boolean(this.neckNode),
      chest: Boolean(this.chestNode),
      spine: Boolean(this.spineNode),
      leftShoulder: Boolean(this.leftShoulderNode),
      rightShoulder: Boolean(this.rightShoulderNode),
      leftUpperArm: Boolean(this.leftUpperArmNode),
      rightUpperArm: Boolean(this.rightUpperArmNode),
      leftLowerArm: Boolean(this.leftLowerArmNode),
      rightLowerArm: Boolean(this.rightLowerArmNode),
      leftHand: Boolean(this.leftHandNode),
      rightHand: Boolean(this.rightHandNode),
    };
  }

  /**
   * Reset all bone targets to natural tutor resting posture.
   */
  public resetBody(): void {
    this.cancelGesture();
    this.isListeningNodding = false;
    this.directorPhase = 'INITIAL_REST';
    this.directorTimer = 0;
    this.directorWaitDuration = 0.8;
    this.wasSpeechActive = false;

    // Resting arm angles (hands comfortably near waist/torso, elbows slightly forward)
    this.tgtLeftUpperArm.set(0.08, 0.10, 1.22);
    this.tgtRightUpperArm.set(0.08, -0.10, -1.22);
    this.tgtLeftLowerArm.set(0.00, -0.35, -0.15);
    this.tgtRightLowerArm.set(0.00, 0.35, 0.15);
    this.tgtLeftHand.set(0, 0, 0);
    this.tgtRightHand.set(0, 0, 0);

    this.tgtHead.set(0, 0, 0);
    this.tgtNeck.set(0, 0, 0);
    this.tgtChest.set(0, 0, 0);
    this.tgtSpine.set(0, 0, 0);

    this.curLeftUpperArm.copy(this.tgtLeftUpperArm);
    this.curRightUpperArm.copy(this.tgtRightUpperArm);
    this.curLeftLowerArm.copy(this.tgtLeftLowerArm);
    this.curRightLowerArm.copy(this.tgtRightLowerArm);
    this.curLeftHand.set(0, 0, 0);
    this.curRightHand.set(0, 0, 0);
    this.curHead.set(0, 0, 0);
    this.curNeck.set(0, 0, 0);
    this.curChest.set(0, 0, 0);
    this.curSpine.set(0, 0, 0);

    this.applyBonesDirectly();
  }

  /**
   * Manually trigger a teaching pose (for testing or scripted events).
   */
  public triggerGesture(type: GestureType): void {
    const pose = normalizePose(type);
    const def = TEACHING_PHRASE_DEFINITIONS[pose];
    if (!def) return;
    this.activePose = pose;
    this.gestureTimer = 0;
    this.gestureDuration = def.duration;
    this.gestureAttackRatio = def.attackRatio;
    this.gestureHoldRatio = def.holdRatio;
  }

  /**
   * Immediately cancel any running gesture and return arms towards resting posture.
   */
  public cancelGesture(): void {
    this.activePose = null;
    this.gestureTimer = 0;
    this.gestureDuration = 0;
    this.gestLeftUpperArm.set(0, 0, 0);
    this.gestRightUpperArm.set(0, 0, 0);
    this.gestLeftLowerArm.set(0, 0, 0);
    this.gestRightLowerArm.set(0, 0, 0);
    this.gestLeftHand.set(0, 0, 0);
    this.gestRightHand.set(0, 0, 0);
    this.gestChest.set(0, 0, 0);
    this.gestHead.set(0, 0, 0);
  }

  /**
   * Main per-frame update loop.
   * Called once per frame BEFORE vrm.update(delta).
   */
  public update(
    delta: number,
    elapsed: number,
    state: AvatarLabState,
    isSpeechActive: boolean
  ): void {
    if (!this.vrm || !this.vrm.humanoid) return;

    // -------------------------------------------------------------
    // LAYER 1: Base Breathing Layer (~3.5s period)
    // -------------------------------------------------------------
    const breathSin = Math.sin(elapsed * 1.8);
    const breathChest = breathSin * 0.010;
    const breathSpine = breathSin * 0.005;

    // -------------------------------------------------------------
    // LAYER 2: Posture Layer (State-dependent)
    // -------------------------------------------------------------
    let transitionLerp = 0.06;

    switch (state) {
      case 'READY': {
        this.cancelGesture();
        this.directorPhase = 'INITIAL_REST';
        this.tgtHead.set(0, 0, 0);
        this.tgtNeck.set(0, 0, 0);
        this.tgtChest.set(0, 0, 0);
        this.tgtSpine.set(0, 0, 0);
        this.tgtLeftUpperArm.set(0.08, 0.10, 1.22);
        this.tgtRightUpperArm.set(0.08, -0.10, -1.22);
        this.tgtLeftLowerArm.set(0.00, -0.35, -0.15);
        this.tgtRightLowerArm.set(0.00, 0.35, 0.15);
        this.tgtLeftHand.set(0, 0, 0);
        this.tgtRightHand.set(0, 0, 0);
        break;
      }

      case 'LISTENING': {
        this.cancelGesture();
        this.directorPhase = 'INITIAL_REST';
        // Attentive slight forward head inclination
        let nodBonus = 0;
        if (this.isListeningNodding) {
          this.listeningNodTimer += delta;
          const p = Math.min(1, this.listeningNodTimer / 0.40);
          nodBonus = Math.sin(Math.PI * p) * 0.024;
          if (p >= 1.0) {
            this.isListeningNodding = false;
            this.nextListeningNodTime = elapsed + 4.5 + Math.random() * 3.5;
          }
        } else if (elapsed > this.nextListeningNodTime) {
          this.isListeningNodding = true;
          this.listeningNodTimer = 0;
        }

        this.tgtHead.set(0.032 + nodBonus, 0.0, 0.008);
        this.tgtNeck.set(0.012, 0.0, 0.004);
        this.tgtChest.set(0.010, 0, 0);
        this.tgtSpine.set(0.005, 0, 0);
        this.tgtLeftUpperArm.set(0.08, 0.10, 1.22);
        this.tgtRightUpperArm.set(0.08, -0.10, -1.22);
        this.tgtLeftLowerArm.set(0.00, -0.35, -0.15);
        this.tgtRightLowerArm.set(0.00, 0.35, 0.15);
        break;
      }

      case 'THINKING': {
        this.cancelGesture();
        this.directorPhase = 'INITIAL_REST';
        // Thoughtful upward & side tilt with slight neck twist
        this.tgtHead.set(-0.042, 0.052, 0.036);
        this.tgtNeck.set(-0.010, 0.020, 0.012);
        this.tgtChest.set(0, 0, 0.006);
        this.tgtSpine.set(0, 0, 0.004);
        this.tgtLeftUpperArm.set(0.06, 0.08, 1.20);
        this.tgtRightUpperArm.set(0.06, -0.08, -1.20);
        this.tgtLeftLowerArm.set(0.00, -0.32, -0.12);
        this.tgtRightLowerArm.set(0.00, 0.32, 0.12);
        transitionLerp = 0.04;
        break;
      }

      case 'SPEAKING': {
        // Conversational head rhythm: non-mechanical orientation updates
        if (elapsed > this.nextHeadRhythmTime) {
          const hasMicroNod = Math.random() < 0.45;
          const tiltZ = (Math.random() - 0.5) * 0.014;
          const turnY = (Math.random() - 0.5) * 0.020;
          const pitchX = hasMicroNod ? (Math.random() * 0.020 + 0.006) : (Math.random() - 0.5) * 0.012;
          this.speakingHeadTarget.set(pitchX, turnY, tiltZ);

          const pauseDuration = 1.8 + Math.random() * 2.0;
          this.nextHeadRhythmTime = elapsed + pauseDuration;
        }

        this.tgtHead.copy(this.speakingHeadTarget);
        this.tgtNeck.set(this.speakingHeadTarget.x * 0.3, this.speakingHeadTarget.y * 0.3, 0);
        this.tgtChest.set(0.008, 0, 0);
        this.tgtSpine.set(0.004, 0, 0);
        this.tgtLeftUpperArm.set(0.08, 0.10, 1.22);
        this.tgtRightUpperArm.set(0.08, -0.10, -1.22);
        this.tgtLeftLowerArm.set(0.00, -0.35, -0.15);
        this.tgtRightLowerArm.set(0.00, 0.35, 0.15);
        transitionLerp = 0.07;
        break;
      }

      case 'INTERRUPTED': {
        // Instant cutoff: clean halt, fast transition towards listening posture
        this.cancelGesture();
        this.directorPhase = 'INITIAL_REST';
        this.tgtHead.set(0.020, 0, 0);
        this.tgtNeck.set(0.008, 0, 0);
        this.tgtChest.set(0, 0, 0);
        this.tgtSpine.set(0, 0, 0);
        this.tgtLeftUpperArm.set(0.08, 0.10, 1.22);
        this.tgtRightUpperArm.set(0.08, -0.10, -1.22);
        this.tgtLeftLowerArm.set(0.00, -0.35, -0.15);
        this.tgtRightLowerArm.set(0.00, 0.35, 0.15);
        transitionLerp = 0.22; // Fast snap (~160ms)
        break;
      }

      case 'PAUSED': {
        this.cancelGesture();
        this.directorPhase = 'INITIAL_REST';
        this.tgtHead.set(0, 0, 0);
        this.tgtNeck.set(0, 0, 0);
        this.tgtChest.set(0, 0, 0);
        this.tgtSpine.set(0, 0, 0);
        this.tgtLeftUpperArm.set(0.08, 0.10, 1.22);
        this.tgtRightUpperArm.set(0.08, -0.10, -1.22);
        this.tgtLeftLowerArm.set(0.00, -0.35, -0.15);
        this.tgtRightLowerArm.set(0.00, 0.35, 0.15);
        break;
      }

      case 'ERROR': {
        this.cancelGesture();
        this.directorPhase = 'INITIAL_REST';
        this.tgtHead.set(0.015, 0, 0.015);
        this.tgtNeck.set(0.005, 0, 0.005);
        this.tgtChest.set(0, 0, 0);
        this.tgtSpine.set(0, 0, 0);
        this.tgtLeftUpperArm.set(0.08, 0.10, 1.22);
        this.tgtRightUpperArm.set(0.08, -0.10, -1.22);
        this.tgtLeftLowerArm.set(0.00, -0.35, -0.15);
        this.tgtRightLowerArm.set(0.00, 0.35, 0.15);
        break;
      }
    }

    // -------------------------------------------------------------
    // LAYER 3: Performance Director (Choreographed Speaking Loop)
    // -------------------------------------------------------------
    if (state === 'SPEAKING' && isSpeechActive) {
      // If speech just started, initialize new choreography session
      if (!this.wasSpeechActive) {
        this.wasSpeechActive = true;
        this.directorPhase = 'INITIAL_REST';
        this.directorTimer = 0;
        this.directorWaitDuration = 0.8;
        this.currentRoutineIndex = Math.floor(Math.random() * PERFORMANCE_ROUTINES.length);
        this.stepIndex = 0;
      }

      const activeRoutine = PERFORMANCE_ROUTINES[this.currentRoutineIndex] || PERFORMANCE_ROUTINES[0];

      if (this.directorPhase === 'INITIAL_REST') {
        this.directorTimer += delta;
        if (this.directorTimer >= this.directorWaitDuration) {
          // Launch first phrase of routine
          const step = activeRoutine[this.stepIndex];
          this.triggerGesture(step.pose);
          this.directorPhase = 'PLAYING_PHRASE';
        }
      } else if (this.directorPhase === 'STILLNESS') {
        this.directorTimer += delta;
        if (this.directorTimer >= this.directorWaitDuration) {
          // Launch next phrase of routine
          this.stepIndex = (this.stepIndex + 1) % activeRoutine.length;
          const step = activeRoutine[this.stepIndex];
          this.triggerGesture(step.pose);
          this.directorPhase = 'PLAYING_PHRASE';
        }
      }
    } else {
      if (this.wasSpeechActive) {
        this.wasSpeechActive = false;
        this.cancelGesture();
        this.directorPhase = 'INITIAL_REST';
      }
    }

    // Process active teaching gesture (3-stage envelope: attack -> hold -> release)
    if (this.activePose) {
      this.gestureTimer += delta;
      const weight = computePhraseWeight(
        this.gestureTimer,
        this.gestureDuration,
        this.gestureAttackRatio,
        this.gestureHoldRatio
      );

      const def = TEACHING_PHRASE_DEFINITIONS[this.activePose];
      if (def) {
        this.applyPhraseBoneWeights(def.bones, weight);
      }

      if (this.gestureTimer >= this.gestureDuration) {
        this.cancelGesture();
        if (state === 'SPEAKING' && isSpeechActive) {
          const activeRoutine = PERFORMANCE_ROUTINES[this.currentRoutineIndex] || PERFORMANCE_ROUTINES[0];
          const currentStep = activeRoutine[this.stepIndex];
          this.directorPhase = 'STILLNESS';
          this.directorTimer = 0;
          this.directorWaitDuration = currentStep ? currentStep.stillAfter : 1.5;
        }
      }
    }

    // Smoothly lerp posture rotations towards targets
    this.curHead.lerp(this.tgtHead, transitionLerp);
    this.curNeck.lerp(this.tgtNeck, transitionLerp);
    this.curChest.lerp(this.tgtChest, transitionLerp);
    this.curSpine.lerp(this.tgtSpine, transitionLerp);
    this.curLeftUpperArm.lerp(this.tgtLeftUpperArm, transitionLerp);
    this.curRightUpperArm.lerp(this.tgtRightUpperArm, transitionLerp);
    this.curLeftLowerArm.lerp(this.tgtLeftLowerArm, transitionLerp);
    this.curRightLowerArm.lerp(this.tgtRightLowerArm, transitionLerp);
    this.curLeftHand.lerp(this.tgtLeftHand, transitionLerp);
    this.curRightHand.lerp(this.tgtRightHand, transitionLerp);

    // -------------------------------------------------------------
    // COMBINE ALL 3 LAYERS AND WRITE DIRECTLY TO VRM HUMANOID BONES
    // finalBoneRotation = baseBreathing + statePosture + gestureOffset
    // -------------------------------------------------------------
    if (this.chestNode) {
      this.chestNode.rotation.set(
        this.curChest.x + breathChest + this.gestChest.x,
        this.curChest.y + this.gestChest.y,
        this.curChest.z + this.gestChest.z
      );
    }

    if (this.spineNode) {
      this.spineNode.rotation.set(
        this.curSpine.x + breathSpine,
        this.curSpine.y,
        this.curSpine.z
      );
    }

    if (this.headNode) {
      this.headNode.rotation.set(
        this.curHead.x + this.gestHead.x,
        this.curHead.y + this.gestHead.y,
        this.curHead.z + this.gestHead.z
      );
    }

    if (this.neckNode) {
      this.neckNode.rotation.set(
        this.curNeck.x,
        this.curNeck.y,
        this.curNeck.z
      );
    }

    if (this.leftUpperArmNode) {
      this.leftUpperArmNode.rotation.set(
        this.curLeftUpperArm.x + this.gestLeftUpperArm.x,
        this.curLeftUpperArm.y + this.gestLeftUpperArm.y,
        this.curLeftUpperArm.z + this.gestLeftUpperArm.z
      );
    }

    if (this.rightUpperArmNode) {
      this.rightUpperArmNode.rotation.set(
        this.curRightUpperArm.x + this.gestRightUpperArm.x,
        this.curRightUpperArm.y + this.gestRightUpperArm.y,
        this.curRightUpperArm.z + this.gestRightUpperArm.z
      );
    }

    if (this.leftLowerArmNode) {
      this.leftLowerArmNode.rotation.set(
        this.curLeftLowerArm.x + this.gestLeftLowerArm.x,
        this.curLeftLowerArm.y + this.gestLeftLowerArm.y,
        this.curLeftLowerArm.z + this.gestLeftLowerArm.z
      );
    }

    if (this.rightLowerArmNode) {
      this.rightLowerArmNode.rotation.set(
        this.curRightLowerArm.x + this.gestRightLowerArm.x,
        this.curRightLowerArm.y + this.gestRightLowerArm.y,
        this.curRightLowerArm.z + this.gestRightLowerArm.z
      );
    }

    if (this.leftHandNode) {
      this.leftHandNode.rotation.set(
        this.curLeftHand.x + this.gestLeftHand.x,
        this.curLeftHand.y + this.gestLeftHand.y,
        this.curLeftHand.z + this.gestLeftHand.z
      );
    }

    if (this.rightHandNode) {
      this.rightHandNode.rotation.set(
        this.curRightHand.x + this.gestRightHand.x,
        this.curRightHand.y + this.gestRightHand.y,
        this.curRightHand.z + this.gestRightHand.z
      );
    }
  }

  private applyPhraseBoneWeights(bones: PoseBoneOffsets, weight: number): void {
    const lua = bones.leftUpperArm;
    if (lua) this.gestLeftUpperArm.set(lua[0] * weight, lua[1] * weight, lua[2] * weight);
    else this.gestLeftUpperArm.set(0, 0, 0);

    const rua = bones.rightUpperArm;
    if (rua) this.gestRightUpperArm.set(rua[0] * weight, rua[1] * weight, rua[2] * weight);
    else this.gestRightUpperArm.set(0, 0, 0);

    const lla = bones.leftLowerArm;
    if (lla) this.gestLeftLowerArm.set(lla[0] * weight, lla[1] * weight, lla[2] * weight);
    else this.gestLeftLowerArm.set(0, 0, 0);

    const rla = bones.rightLowerArm;
    if (rla) this.gestRightLowerArm.set(rla[0] * weight, rla[1] * weight, rla[2] * weight);
    else this.gestRightLowerArm.set(0, 0, 0);

    const lh = bones.leftHand;
    if (lh) this.gestLeftHand.set(lh[0] * weight, lh[1] * weight, lh[2] * weight);
    else this.gestLeftHand.set(0, 0, 0);

    const rh = bones.rightHand;
    if (rh) this.gestRightHand.set(rh[0] * weight, rh[1] * weight, rh[2] * weight);
    else this.gestRightHand.set(0, 0, 0);

    const ch = bones.chest;
    if (ch) this.gestChest.set(ch[0] * weight, ch[1] * weight, ch[2] * weight);
    else this.gestChest.set(0, 0, 0);

    const hd = bones.head;
    if (hd) this.gestHead.set(hd[0] * weight, hd[1] * weight, hd[2] * weight);
    else this.gestHead.set(0, 0, 0);
  }

  private applyBonesDirectly(): void {
    if (this.leftUpperArmNode) this.leftUpperArmNode.rotation.set(this.curLeftUpperArm.x, this.curLeftUpperArm.y, this.curLeftUpperArm.z);
    if (this.rightUpperArmNode) this.rightUpperArmNode.rotation.set(this.curRightUpperArm.x, this.curRightUpperArm.y, this.curRightUpperArm.z);
    if (this.leftLowerArmNode) this.leftLowerArmNode.rotation.set(this.curLeftLowerArm.x, this.curLeftLowerArm.y, this.curLeftLowerArm.z);
    if (this.rightLowerArmNode) this.rightLowerArmNode.rotation.set(this.curRightLowerArm.x, this.curRightLowerArm.y, this.curRightLowerArm.z);
    if (this.leftHandNode) this.leftHandNode.rotation.set(0, 0, 0);
    if (this.rightHandNode) this.rightHandNode.rotation.set(0, 0, 0);
    if (this.headNode) this.headNode.rotation.set(0, 0, 0);
    if (this.neckNode) this.neckNode.rotation.set(0, 0, 0);
    if (this.chestNode) this.chestNode.rotation.set(0, 0, 0);
    if (this.spineNode) this.spineNode.rotation.set(0, 0, 0);
  }
}
