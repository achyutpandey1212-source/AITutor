import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRMLoaderPlugin, VRM, VRMUtils } from '@pixiv/three-vrm';
import {
  AvatarAssetConfig,
  AvatarCapabilities,
  AvatarLabState,
  CameraPreset,
  IndividualMorphValues,
  LoadDiagnostics,
  ManualExpressionValues,
  MeshDiagnosticItem,
  GeometryDeltaReport,
  EngineTelemetryData,
  VisualIsolationMode,
} from './types';
import {
  ModelMorphRegistry,
} from './mikoController';
import { MikoAvatarEngine } from './mikoAvatarEngine';

interface AvatarViewportProps {
  currentAvatar: AvatarAssetConfig;
  labState: AvatarLabState;
  cameraPreset: CameraPreset;
  manualExpressions: ManualExpressionValues;
  individualMorphValues: IndividualMorphValues;
  isManualOverrideActive: boolean;
  freezeVrmUpdate?: boolean;
  rawLockTarget?: string | null;
  rawLockWeight?: number;
  hiddenMeshNames?: string[];
  visualIsolationMode?: VisualIsolationMode;
  onCapabilitiesDetected: (capabilities: AvatarCapabilities) => void;
  onDiagnosticsUpdate: (diagnostics: LoadDiagnostics) => void;
  onMeshListUpdated?: (meshes: MeshDiagnosticItem[], deltas: GeometryDeltaReport[]) => void;
  onLiveInfluenceUpdated?: (fclMthA: number, fclEyeClose: number) => void;
  onEngineReady?: (engine: MikoAvatarEngine) => void;
  onTelemetryUpdate?: (telemetry: EngineTelemetryData) => void;
}

// Camera target coordinates per framing preset
const CAMERA_PRESETS: Record<CameraPreset, { position: [number, number, number]; target: [number, number, number] }> = {
  close: {
    position: [0, 1.38, 0.72],
    target: [0, 1.34, 0],
  },
  medium: {
    position: [0, 1.18, 1.55],
    target: [0, 1.10, 0],
  },
  full: {
    position: [0, 0.95, 2.75],
    target: [0, 0.85, 0],
  },
};

export const AvatarViewport: React.FC<AvatarViewportProps> = ({
  currentAvatar,
  labState,
  cameraPreset,
  manualExpressions,
  individualMorphValues,
  isManualOverrideActive,
  freezeVrmUpdate = false,
  rawLockTarget = null,
  rawLockWeight = 1.0,
  hiddenMeshNames = [],
  visualIsolationMode = 'ALL',
  onCapabilitiesDetected,
  onDiagnosticsUpdate,
  onMeshListUpdated,
  onLiveInfluenceUpdated,
  onEngineReady,
  onTelemetryUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const avatarGroupRef = useRef<THREE.Group | null>(null);
  const loadSessionIdRef = useRef<number>(0);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const currentVrmRef = useRef<VRM | null>(null);
  const currentGltfSceneRef = useRef<THREE.Group | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const animationFrameIdRef = useRef<number | null>(null);
  const frameCountRef = useRef<number>(0);

  // Authoritative Miko Avatar Engine instance ref
  const engineRef = useRef<MikoAvatarEngine | null>(null);

  // Dynamic props kept in refs to eliminate stale closures in animation loop
  const labStateRef = useRef<AvatarLabState>(labState);
  labStateRef.current = labState;

  const visualIsolationModeRef = useRef<VisualIsolationMode>(visualIsolationMode);
  visualIsolationModeRef.current = visualIsolationMode;

  const manualExpressionsRef = useRef<ManualExpressionValues>(manualExpressions);
  manualExpressionsRef.current = manualExpressions;

  const individualMorphValuesRef = useRef<IndividualMorphValues>(individualMorphValues);
  individualMorphValuesRef.current = individualMorphValues;

  const isManualOverrideActiveRef = useRef<boolean>(isManualOverrideActive);
  isManualOverrideActiveRef.current = isManualOverrideActive;

  const onEngineReadyRef = useRef(onEngineReady);
  onEngineReadyRef.current = onEngineReady;

  const onTelemetryUpdateRef = useRef(onTelemetryUpdate);
  onTelemetryUpdateRef.current = onTelemetryUpdate;

  // Dynamic diagnostic refs for continuous render loop access
  const freezeVrmUpdateRef = useRef<boolean>(freezeVrmUpdate);
  freezeVrmUpdateRef.current = freezeVrmUpdate;

  const rawLockTargetRef = useRef<string | null>(rawLockTarget);
  rawLockTargetRef.current = rawLockTarget;

  const rawLockWeightRef = useRef<number>(rawLockWeight);
  rawLockWeightRef.current = rawLockWeight;

  const hiddenMeshNamesRef = useRef<string[]>(hiddenMeshNames);
  hiddenMeshNamesRef.current = hiddenMeshNames;

  const onLiveInfluenceUpdatedRef = useRef(onLiveInfluenceUpdated);
  onLiveInfluenceUpdatedRef.current = onLiveInfluenceUpdated;

  // Centralized Multi-Mesh Morph Target Registry
  const morphRegistryRef = useRef<ModelMorphRegistry | null>(null);

  // Camera lerp target
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(...CAMERA_PRESETS.medium.position));
  const targetCamLookRef = useRef<THREE.Vector3>(new THREE.Vector3(...CAMERA_PRESETS.medium.target));

  const isUserInteractingRef = useRef<boolean>(false);

  // Loading progress
  const [loadPercent, setLoadPercent] = useState<number>(0);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // -------------------------------------------------------------
  // 1. Initialize Scene, Camera, Neutral Lighting, Controls
  // -------------------------------------------------------------
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0B0C0E'); // Lumo Charcoal dark surface
    sceneRef.current = scene;

    // Camera — 32 FOV for faithful human portrait proportions
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 20.0);
    const initialPreset = CAMERA_PRESETS.medium;
    camera.position.set(...initialPreset.position);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(...initialPreset.target);
    controls.minDistance = 0.4;
    controls.maxDistance = 5.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.12; // Prevent camera sinking under floor
    controls.addEventListener('start', () => {
      isUserInteractingRef.current = true;
    });
    controls.addEventListener('end', () => {
      isUserInteractingRef.current = false;
    });
    controlsRef.current = controls;

    // -----------------------------------------------------------
    // Neutral Studio Lighting (Zero Neon/Colored Slop)
    // -----------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(1.2, 2.2, 1.8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 6.0;
    keyLight.shadow.bias = -0.0008;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.75);
    fillLight.position.set(-1.4, 1.6, 1.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.35);
    rimLight.position.set(0.0, 2.6, -2.4);
    scene.add(rimLight);

    // Ground plane shadow catcher
    const shadowPlaneGeo = new THREE.PlaneGeometry(8, 8);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.28 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Dedicated Avatar Root Container — Guarantees exactly 1 avatar instance in scene
    const avatarGroup = new THREE.Group();
    avatarGroup.name = 'AvatarRootContainer';
    scene.add(avatarGroup);
    avatarGroupRef.current = avatarGroup;

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // -----------------------------------------------------------
    // Main Render Loop
    // -----------------------------------------------------------
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      frameCountRef.current++;

      const delta = clockRef.current.getDelta();
      const elapsed = clockRef.current.getElapsedTime();

      // Smooth camera interpolation towards active framing preset
      if (cameraRef.current && controlsRef.current) {
        if (!isUserInteractingRef.current) {
          cameraRef.current.position.lerp(targetCamPosRef.current, 0.08);
          controlsRef.current.target.lerp(targetCamLookRef.current, 0.08);
        }
        controlsRef.current.update();
      }

      const engine = engineRef.current;
      const vrm = currentVrmRef.current;
      const currentLabState = labStateRef.current;
      const currentManual = manualExpressionsRef.current;
      const isManual = isManualOverrideActiveRef.current;
      const currentMorphs = individualMorphValuesRef.current;

      // 1. UPDATE NORMAL AVATAR ANIMATION (Grounded humanoid posture, breathing, subtle gestures)
      if (engine) {
        engine.updateBody(delta, elapsed, currentLabState);
      } else if (vrm) {
        applyProceduralPosture(vrm, currentLabState, elapsed);
      }

      // 2. CALL vrm.update(delta)
      // When freezeVrmUpdate is enabled, do NOT call vrm.update(delta)
      if (vrm && !freezeVrmUpdateRef.current) {
        vrm.update(delta);
      }

      // Visibility & Visual Layer Isolation (Part 2 & Part 7)
      const isolation = visualIsolationModeRef.current;
      const hiddenList = hiddenMeshNamesRef.current;
      const avatarRoot = vrm ? vrm.scene : currentGltfSceneRef.current;

      if (avatarRoot) {
        avatarRoot.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            const name = obj.name;
            let isVisible = true;

            if (isolation === 'ONLY_FACE_SKIN') {
              // Outer face skin and lips only (Face_(merged)baked_3)
              isVisible = name === 'Face_(merged)baked_3';
            } else if (isolation === 'ONLY_MOUTH') {
              // Mouth cavity/teeth and lips/outer face skin only
              isVisible = name === 'Face_(merged)baked' || name === 'Face_(merged)baked_3';
            } else if (isolation === 'ONLY_EYES') {
              // Eye components only (iris, highlights, whites, brows, eyelashes, eyelines)
              isVisible = [
                'Face_(merged)baked_1',
                'Face_(merged)baked_2',
                'Face_(merged)baked_4',
                'Face_(merged)baked_5',
                'Face_(merged)baked_6',
                'Face_(merged)baked_7',
              ].includes(name);
            } else {
              // Standard mode: check hiddenMeshNames
              isVisible = !hiddenList.includes(name);
            }

            obj.visible = isVisible;
          }
        });
      }

      // 3. APPLY MIKO MORPH ENGINE OUTPUT (ALWAYS AFTER vrm.update)
      if (rawLockTargetRef.current && vrm) {
        // Developer hard diagnostics raw lock override
        const target = rawLockTargetRef.current;
        const weight = rawLockWeightRef.current;
        vrm.scene.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (mesh.isMesh && mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
            const idx = mesh.morphTargetDictionary[target];
            if (idx !== undefined) {
              mesh.morphTargetInfluences[idx] = weight;
            }
          }
        });
      } else if (engine) {
        engine.updateFacial(
          delta,
          elapsed,
          currentLabState,
          currentManual,
          isManual,
          currentMorphs
        );
      }

      // STEP 4: Report LIVE runtime telemetry directly from authoritative engine
      if (frameCountRef.current % 4 === 0 && engine) {
        const uiMouth = isManual ? currentManual.mouthOpen : 0;
        const uiBlink = isManual ? currentManual.blink : 0;
        const vrmRoots = avatarGroupRef.current ? avatarGroupRef.current.children.length : 0;
        const telemetry = engine.getPipelineTelemetry(uiMouth, uiBlink, vrmRoots);
        onTelemetryUpdateRef.current?.(telemetry);
        onLiveInfluenceUpdatedRef.current?.(telemetry.pipelineMouthA.meshInfluence, telemetry.pipelineBlink.meshInfluence);
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    clockRef.current.start();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (avatarGroupRef.current) {
        while (avatarGroupRef.current.children.length > 0) {
          const child = avatarGroupRef.current.children[0];
          avatarGroupRef.current.remove(child);
          VRMUtils.deepDispose(child);
        }
        scene.remove(avatarGroupRef.current);
        avatarGroupRef.current = null;
      }
      controls.dispose();
      renderer.dispose();
    };
  }, []); // Run once on mount

  // -------------------------------------------------------------
  // 2. Camera Preset Switcher
  // -------------------------------------------------------------
  useEffect(() => {
    const targetConfig = CAMERA_PRESETS[cameraPreset] || CAMERA_PRESETS.medium;
    targetCamPosRef.current.set(...targetConfig.position);
    targetCamLookRef.current.set(...targetConfig.target);
  }, [cameraPreset]);

  // -------------------------------------------------------------
  // 3. Procedural Bone Animation & Posture (Gentle, grounded tutor demeanor)
  // -------------------------------------------------------------
  const applyProceduralPosture = (
    vrm: VRM,
    state: AvatarLabState,
    elapsed: number
  ) => {
    const humanoid = vrm.humanoid;
    if (!humanoid) return;

    const chestNode = humanoid.getNormalizedBoneNode('chest');
    const spineNode = humanoid.getNormalizedBoneNode('spine');
    const neckNode = humanoid.getNormalizedBoneNode('neck');
    const headNode = humanoid.getNormalizedBoneNode('head');

    // Idle breathing (gentle sine wave applied to chest & spine)
    const breathingCycle = Math.sin(elapsed * 1.5);
    if (chestNode) {
      chestNode.rotation.x = breathingCycle * 0.010;
    }
    if (spineNode) {
      spineNode.rotation.x = breathingCycle * 0.005;
    }

    switch (state) {
      case 'READY':
      case 'PAUSED':
      case 'ERROR': {
        if (headNode) headNode.rotation.set(0, 0, 0);
        if (neckNode) neckNode.rotation.set(0, 0, 0);
        break;
      }

      case 'LISTENING': {
        // Attentive, subtle forward nod, centered tutor focus
        if (headNode) {
          headNode.rotation.x = 0.025;
          headNode.rotation.y = 0.0;
          headNode.rotation.z = 0.0;
        }
        if (neckNode) {
          neckNode.rotation.x = 0.01;
        }
        break;
      }

      case 'THINKING': {
        // Subtle thoughtful head tilt and gaze deflection
        if (headNode) {
          headNode.rotation.x = -0.018; // slight lift
          headNode.rotation.y = 0.04;   // gaze shifted slightly right
          headNode.rotation.z = 0.03;   // gentle head tilt
        }
        break;
      }

      case 'SPEAKING': {
        // Conversational subtle head cadence
        if (headNode) {
          headNode.rotation.x = Math.sin(elapsed * 3.5) * 0.020;
          headNode.rotation.y = Math.sin(elapsed * 1.8) * 0.015;
          headNode.rotation.z = Math.sin(elapsed * 2.2) * 0.008;
        }
        break;
      }

      case 'INTERRUPTED': {
        // Immediate clean halt: return to attentive posture
        if (headNode) {
          headNode.rotation.set(0, 0, 0);
        }
        if (neckNode) {
          neckNode.rotation.set(0, 0, 0);
        }
        break;
      }
    }
  };

  // -------------------------------------------------------------
  // 4. Inspect Model Capabilities Runtime
  // -------------------------------------------------------------
  const inspectAvatarCapabilities = (
    gltf: any,
    vrm: VRM | null,
    registry: ModelMorphRegistry
  ): AvatarCapabilities => {
    const meta = vrm?.meta;
    let vrmVersion = 'Non-VRM GLTF';
    if (meta) {
      if ((meta as any).specVersion) {
        vrmVersion = `VRM ${(meta as any).specVersion}`;
      } else if ((meta as any).metaVersion) {
        vrmVersion = `VRM ${(meta as any).metaVersion}`;
      } else {
        vrmVersion = 'VRM 0.x / 1.x';
      }
    }

    // Humanoid Rig & Bones
    const humanoid = vrm?.humanoid;
    const hasHumanoid = Boolean(humanoid);

    const detectedKeyBones = {
      head: Boolean(humanoid?.getNormalizedBoneNode('head')),
      neck: Boolean(humanoid?.getNormalizedBoneNode('neck')),
      chest: Boolean(humanoid?.getNormalizedBoneNode('chest')),
      spine: Boolean(humanoid?.getNormalizedBoneNode('spine')),
      leftEye: Boolean(humanoid?.getNormalizedBoneNode('leftEye')),
      rightEye: Boolean(humanoid?.getNormalizedBoneNode('rightEye')),
    };

    let totalBones = 0;
    if (vrm) {
      vrm.scene.traverse((obj) => {
        if ((obj as THREE.Bone).isBone) {
          totalBones++;
        }
      });
    }

    // Count meshes and morph targets
    let totalMeshes = 0;
    let totalMorphTargets = 0;
    const root = vrm ? vrm.scene : gltf.scene;
    root.traverse((obj: THREE.Object3D) => {
      if ((obj as THREE.Mesh).isMesh) {
        totalMeshes++;
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry && mesh.geometry.morphAttributes?.position) {
          totalMorphTargets += mesh.geometry.morphAttributes.position.length;
        }
      }
    });

    const hasLookAt = Boolean(vrm?.lookAt);
    const hasSpringBones = Boolean(vrm?.springBoneManager);
    const animations = gltf.animations || [];

    const mouthTargets = Array.from(
      new Set([
        ...(registry.semanticMap['mouthOpen'] || []),
        ...(registry.semanticMap['vowelA'] || []),
        ...(registry.semanticMap['vowelI'] || []),
        ...(registry.semanticMap['vowelU'] || []),
        ...(registry.semanticMap['vowelE'] || []),
        ...(registry.semanticMap['vowelO'] || []),
      ])
    );

    const eyeTargets = Array.from(
      new Set([
        ...(registry.semanticMap['blink'] || []),
        ...(registry.semanticMap['blinkLeft'] || []),
        ...(registry.semanticMap['blinkRight'] || []),
      ])
    );

    return {
      isVRM: Boolean(vrm),
      vrmVersion,
      hasHumanoid,
      boneCount: totalBones,
      detectedKeyBones,
      hasLookAt,
      hasSpringBones,
      embeddedAnimationCount: animations.length,
      embeddedAnimationNames: animations.map((a: any) => a.name || 'Unnamed'),
      totalExpressionsCount: registry.allTargetNames.length,
      availableExpressions: registry.allTargetNames,
      hasMouthControls: mouthTargets.length > 0,
      mouthExpressionNames: mouthTargets,
      hasEyeControls: eyeTargets.length > 0,
      eyeExpressionNames: eyeTargets,
      isAnimatedByDefault: animations.length > 0,
      meshCount: totalMeshes,
      morphTargetCount: totalMorphTargets,
      morphMeshes: registry.morphMeshes,
      allMorphTargetNames: registry.allTargetNames,
      semanticMap: registry.semanticMap,
    };
  };

  const computeGeometryDeltas = (root: THREE.Object3D): { meshes: MeshDiagnosticItem[]; deltas: GeometryDeltaReport[] } => {
    const meshItems: MeshDiagnosticItem[] = [];
    const deltaReports: GeometryDeltaReport[] = [];

    root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const dict = mesh.morphTargetDictionary;
        const morphAttrs = mesh.geometry?.morphAttributes?.position;
        const basePos = mesh.geometry?.attributes?.position;

        const item: MeshDiagnosticItem = {
          name: mesh.name || 'Unnamed',
          type: mesh.type,
          visible: mesh.visible,
          renderOrder: mesh.renderOrder,
          materialName: Array.isArray(mesh.material)
            ? mesh.material.map((m) => m.name).join(', ')
            : (mesh.material as THREE.Material)?.name || 'Default',
          morphTargetCount: dict ? Object.keys(dict).length : 0,
          hasPositionMorphs: Boolean(morphAttrs && morphAttrs.length > 0),
          fclMthAIndex: dict?.['Fcl_MTH_A'],
          fclMthAInfluence: dict?.['Fcl_MTH_A'] !== undefined ? mesh.morphTargetInfluences?.[dict['Fcl_MTH_A']] : undefined,
          fclEyeCloseIndex: dict?.['Fcl_EYE_Close'],
          fclEyeCloseInfluence: dict?.['Fcl_EYE_Close'] !== undefined ? mesh.morphTargetInfluences?.[dict['Fcl_EYE_Close']] : undefined,
        };
        meshItems.push(item);

        if (dict && dict['Fcl_MTH_A'] !== undefined && morphAttrs && basePos) {
          const targetIdx = dict['Fcl_MTH_A'];
          const morphAttr = morphAttrs[targetIdx];
          if (morphAttr) {
            let nonZero = 0;
            let maxD = 0;
            const count = morphAttr.count;
            for (let i = 0; i < count; i++) {
              const dx = morphAttr.getX(i);
              const dy = morphAttr.getY(i);
              const dz = morphAttr.getZ(i);
              const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
              if (dist > 0.00001) {
                nonZero++;
                if (dist > maxD) maxD = dist;
              }
            }
            deltaReports.push({
              targetName: 'Fcl_MTH_A',
              meshName: mesh.name || item.materialName,
              vertexCount: count,
              morphAttributeExists: true,
              nonZeroDeltas: nonZero,
              maxDelta: maxD,
            });
          }
        }

        if (dict && dict['Fcl_EYE_Close'] !== undefined && morphAttrs && basePos) {
          const targetIdx = dict['Fcl_EYE_Close'];
          const morphAttr = morphAttrs[targetIdx];
          if (morphAttr) {
            let nonZero = 0;
            let maxD = 0;
            const count = morphAttr.count;
            for (let i = 0; i < count; i++) {
              const dx = morphAttr.getX(i);
              const dy = morphAttr.getY(i);
              const dz = morphAttr.getZ(i);
              const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
              if (dist > 0.00001) {
                nonZero++;
                if (dist > maxD) maxD = dist;
              }
            }
            deltaReports.push({
              targetName: 'Fcl_EYE_Close',
              meshName: mesh.name || item.materialName,
              vertexCount: count,
              morphAttributeExists: true,
              nonZeroDeltas: nonZero,
              maxDelta: maxD,
            });
          }
        }
      }
    });

    return { meshes: meshItems, deltas: deltaReports };
  };

  // -------------------------------------------------------------
  // 7. Scene Root Audit (Guarantees exactly 1 avatar in scene)
  // -------------------------------------------------------------
  const auditVrmRootsInScene = (): number => {
    let count = 0;
    if (avatarGroupRef.current) {
      count = avatarGroupRef.current.children.length;
    }
    // Extra safety sweep: purge any rogue VRM roots outside avatarGroup
    if (sceneRef.current) {
      const rogue = sceneRef.current.children.filter(
        (c) => c !== avatarGroupRef.current && (c.name === 'VRMSScene' || (c as any).userData?.vrm)
      );
      if (rogue.length > 0) {
        console.warn(`[AvatarViewport] Purging ${rogue.length} rogue VRM root(s) from sceneRef:`, rogue);
        rogue.forEach((r) => {
          sceneRef.current?.remove(r);
          VRMUtils.deepDispose(r);
        });
      }
    }
    return count;
  };

  // -------------------------------------------------------------
  // 8. Model Loader Lifecycle (Deduplicated with monotonic session ID)
  // -------------------------------------------------------------
  const loadAvatarAsset = useCallback(
    (asset: AvatarAssetConfig) => {
      if (!sceneRef.current) return;

      loadSessionIdRef.current++;
      const currentSessionId = loadSessionIdRef.current;

      setLoadingError(null);
      setLoadPercent(0);
      onDiagnosticsUpdate({ status: 'loading' });
      const startTime = performance.now();

      // Clean up previous avatar from avatarGroupRef and sceneRef
      if (avatarGroupRef.current) {
        while (avatarGroupRef.current.children.length > 0) {
          const child = avatarGroupRef.current.children[0];
          avatarGroupRef.current.remove(child);
          VRMUtils.deepDispose(child);
        }
      }
      currentVrmRef.current = null;
      currentGltfSceneRef.current = null;
      engineRef.current = null;
      morphRegistryRef.current = null;

      auditVrmRootsInScene();

      const loader = new GLTFLoader();
      loader.register((parser) => new VRMLoaderPlugin(parser));

      loader.load(
        asset.url,
        (gltf) => {
          // Discard stale load if a newer load session has already begun
          if (currentSessionId !== loadSessionIdRef.current) {
            console.warn(
              `[AvatarViewport] Discarding stale load session #${currentSessionId} (active: #${loadSessionIdRef.current})`
            );
            if (gltf.userData.vrm) {
              VRMUtils.deepDispose(gltf.userData.vrm.scene);
            } else if (gltf.scene) {
              VRMUtils.deepDispose(gltf.scene);
            }
            return;
          }

          const loadDuration = Math.round(performance.now() - startTime);
          const vrm: VRM | undefined = gltf.userData.vrm;

          // Double check: ensure avatarGroup is completely empty before adding new avatar
          if (avatarGroupRef.current) {
            while (avatarGroupRef.current.children.length > 0) {
              const child = avatarGroupRef.current.children[0];
              avatarGroupRef.current.remove(child);
              VRMUtils.deepDispose(child);
            }
          }

          if (vrm) {
            // Fix VRM 0.0 rotation so avatar faces +Z (toward camera)
            VRMUtils.rotateVRM0(vrm);

            // Enable subtle shadow casting
            vrm.scene.traverse((obj) => {
              if ((obj as THREE.Mesh).isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = false;
              }
            });

            avatarGroupRef.current?.add(vrm.scene);
            currentVrmRef.current = vrm;

            // Instantiate authoritative Miko Avatar Engine
            const engine = new MikoAvatarEngine(vrm.scene, vrm);
            engineRef.current = engine;
            morphRegistryRef.current = engine.registry;
            onEngineReadyRef.current?.(engine);

            // Inspect runtime capabilities
            const capabilities = inspectAvatarCapabilities(gltf, vrm, engine.registry);
            onCapabilitiesDetected(capabilities);

            // Compute exact runtime geometry deltas & mesh audit
            const diag = computeGeometryDeltas(vrm.scene);
            onMeshListUpdated?.(diag.meshes, diag.deltas);

            const rootsCount = auditVrmRootsInScene();
            console.log(`[AvatarViewport] Loaded ${asset.name}. Miko VRM roots in scene = ${rootsCount}`);

            onDiagnosticsUpdate({
              status: 'loaded',
              loadTimeMs: loadDuration,
              vrmRootsCount: rootsCount,
            });
          } else {
            // Fallback for standard GLTF
            avatarGroupRef.current?.add(gltf.scene);
            currentGltfSceneRef.current = gltf.scene;

            const engine = new MikoAvatarEngine(gltf.scene, null);
            engineRef.current = engine;
            morphRegistryRef.current = engine.registry;
            onEngineReadyRef.current?.(engine);

            const capabilities = inspectAvatarCapabilities(gltf, null, engine.registry);
            onCapabilitiesDetected(capabilities);

            const diag = computeGeometryDeltas(gltf.scene);
            onMeshListUpdated?.(diag.meshes, diag.deltas);

            const rootsCount = auditVrmRootsInScene();

            onDiagnosticsUpdate({
              status: 'loaded',
              loadTimeMs: loadDuration,
              vrmRootsCount: rootsCount,
            });
          }
          setLoadPercent(100);
        },
        (progress) => {
          if (progress.total > 0) {
            const pct = Math.round((progress.loaded / progress.total) * 100);
            setLoadPercent(pct);
          }
        },
        (err) => {
          const errorMsg = (err as any)?.message || 'Failed to load VRM model';
          console.error('[AvatarLab] Failed to load avatar:', err);
          setLoadingError(errorMsg);
          onDiagnosticsUpdate({
            status: 'error',
            error: errorMsg,
          });
        }
      );
    },
    [onCapabilitiesDetected, onDiagnosticsUpdate]
  );

  // Trigger load when currentAvatar changes
  useEffect(() => {
    loadAvatarAsset(currentAvatar);
  }, [currentAvatar, loadAvatarAsset]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#0B0C0E',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: 'grab',
        }}
      />

      {/* Loading Overlay */}
      {loadPercent < 100 && !loadingError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(11, 12, 14, 0.85)',
            backdropFilter: 'blur(4px)',
            gap: '12px',
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: '180px',
              height: '3px',
              background: 'rgba(255, 255, 255, 0.10)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${loadPercent}%`,
                height: '100%',
                background: '#FFFFFF',
                transition: 'width 120ms ease',
              }}
            />
          </div>
          <span
            style={{
              fontFamily: 'var(--theater-font-mono, monospace)',
              fontSize: '12px',
              color: '#A1A1A5',
              letterSpacing: '0.04em',
            }}
          >
            Loading {currentAvatar.name} ({loadPercent}%)
          </span>
        </div>
      )}

      {/* Graceful Error State */}
      {loadingError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(11, 12, 14, 0.92)',
            padding: '24px',
            gap: '8px',
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontSize: '15px',
              fontWeight: 500,
              color: '#F5F5F5',
            }}
          >
            Unable to load this avatar.
          </span>
          <span
            style={{
              fontFamily: 'var(--theater-font-mono, monospace)',
              fontSize: '12px',
              color: '#E5534B',
              maxWidth: '420px',
              textAlign: 'center',
              wordBreak: 'break-word',
            }}
          >
            {loadingError}
          </span>
        </div>
      )}
    </div>
  );
};
