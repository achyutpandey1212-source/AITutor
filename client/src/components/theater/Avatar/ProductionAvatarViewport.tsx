import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRM, VRMUtils } from '@pixiv/three-vrm';
import { MikoAvatarEngine } from '../../avatarLab/mikoAvatarEngine';
import type { CameraFramingState, ProductionAvatarViewportProps, ProductionInteractionState } from './types';

// Camera target coordinates per programmatic framing state
const CAMERA_PRESETS: Record<CameraFramingState, { position: [number, number, number]; target: [number, number, number] }> = {
  close: {
    position: [0, 1.38, 0.72],
    target: [0, 1.34, 0],
  },
  medium: {
    position: [0, 1.18, 1.68],
    target: [0, 1.10, 0],
  },
  full: {
    position: [0, 0.95, 2.75],
    target: [0, 0.85, 0],
  },
};

const MIKO_ASSET_URL = '/avatars/miko/miko.vrm';

export const ProductionAvatarViewport: React.FC<ProductionAvatarViewportProps> = ({
  interactionState = 'READY',
  framing = 'medium',
  className,
  style,
  onLoaded,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const avatarGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const currentVrmRef = useRef<VRM | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const animationFrameIdRef = useRef<number | null>(null);
  const loadSessionIdRef = useRef<number>(0);

  // Authoritative Miko Avatar Engine instance ref
  const engineRef = useRef<MikoAvatarEngine | null>(null);

  // Dynamic props kept in refs to avoid stale closures in RAF loop
  const interactionStateRef = useRef<ProductionInteractionState>(interactionState);
  interactionStateRef.current = interactionState;

  const prevInteractionStateRef = useRef<ProductionInteractionState>(interactionState);

  // Camera lerp targets
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(...CAMERA_PRESETS[framing].position));
  const targetCamLookRef = useRef<THREE.Vector3>(new THREE.Vector3(...CAMERA_PRESETS[framing].target));
  const currentCamLookRef = useRef<THREE.Vector3>(new THREE.Vector3(...CAMERA_PRESETS[framing].target));

  // Loading state
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // 1. Initialize Three.js Scene, Locked Camera & Neutral Studio Lighting
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 300;
    const height = containerRef.current.clientHeight || 450;

    // Scene with transparent background to blend natively into theater stage
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Perspective camera with dynamic aspect-based FOV calculation
    const aspect = width / height;
    const baseFov = 32;
    let initialFov = baseFov;
    if (aspect < 1.0) {
      // In portrait / vertical companion framing, widen vertical FOV to maintain horizontal gesture envelope
      const targetHFovRad = 2 * Math.atan(Math.tan((baseFov * Math.PI) / 360) * 1.0);
      initialFov = (2 * Math.atan(Math.tan(targetHFovRad / 2) / aspect) * 180) / Math.PI;
    }
    const camera = new THREE.PerspectiveCamera(initialFov, aspect, 0.1, 20.0);
    const initialPreset = CAMERA_PRESETS[framing] || CAMERA_PRESETS.medium;
    camera.position.set(...initialPreset.position);
    camera.lookAt(...initialPreset.target);
    cameraRef.current = camera;

    // WebGL Renderer with ACES ToneMapping & soft shadows
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
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

    // -------------------------------------------------------------------------
    // Neutral Studio Lighting (Exact Avatar Lab Specification)
    // -------------------------------------------------------------------------
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
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.22 });
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

    // Resize Observer for responsive stage adaptation
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          const newAspect = w / h;
          cameraRef.current.aspect = newAspect;
          const baseFovVal = 32;
          if (newAspect < 1.0) {
            const targetHFov = 2 * Math.atan(Math.tan((baseFovVal * Math.PI) / 360) * 1.0);
            cameraRef.current.fov = (2 * Math.atan(Math.tan(targetHFov / 2) / newAspect) * 180) / Math.PI;
          } else {
            cameraRef.current.fov = baseFovVal;
          }
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    // -------------------------------------------------------------------------
    // Single Authoritative Animation / Render Loop
    // -------------------------------------------------------------------------
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clockRef.current.getDelta();
      const elapsed = clockRef.current.getElapsedTime();

      // Smooth programmatic camera interpolation towards active framing preset
      if (cameraRef.current) {
        cameraRef.current.position.lerp(targetCamPosRef.current, 0.06);
        currentCamLookRef.current.lerp(targetCamLookRef.current, 0.06);
        cameraRef.current.lookAt(currentCamLookRef.current);
      }

      const engine = engineRef.current;
      const vrm = currentVrmRef.current;
      const state = interactionStateRef.current;

      // 1. Update full body posture, breathing & Speaking Performance Director
      if (engine) {
        engine.updateBody(delta, elapsed, state as any);
      }

      // 2. Call vrm.update(delta) for humanoid rig update
      if (vrm) {
        vrm.update(delta);
      }

      // 3. Apply Miko multi-mesh morph engine output (ALWAYS post vrm.update)
      if (engine) {
        engine.updateFacial(delta, elapsed, state as any);
      }

      // 4. Render pass
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    clockRef.current.start();
    animate();

    // -------------------------------------------------------------------------
    // 2. Load Miko VRM Model (Deduplicated with monotonic session tracking)
    // -------------------------------------------------------------------------
    loadSessionIdRef.current++;
    const currentSessionId = loadSessionIdRef.current;

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      MIKO_ASSET_URL,
      (gltf) => {
        // Discard stale load if a newer load session has already begun or unmounted
        if (currentSessionId !== loadSessionIdRef.current) {
          if (gltf.userData.vrm) {
            VRMUtils.deepDispose(gltf.userData.vrm.scene);
          } else if (gltf.scene) {
            VRMUtils.deepDispose(gltf.scene);
          }
          return;
        }

        const vrm: VRM | undefined = gltf.userData.vrm;
        if (!vrm) {
          const err = new Error('Loaded asset is not a valid VRM model');
          setLoadError(err.message);
          onError?.(err);
          return;
        }

        // Clean previous children if any exist
        if (avatarGroupRef.current) {
          while (avatarGroupRef.current.children.length > 0) {
            const child = avatarGroupRef.current.children[0];
            avatarGroupRef.current.remove(child);
            VRMUtils.deepDispose(child);
          }
        }

        // Rotate VRM 0.0 to face +Z (toward camera)
        VRMUtils.rotateVRM0(vrm);

        // Enable shadow casting
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

        // Synchronize speaking state immediately if mounted during speaking
        if (interactionStateRef.current === 'SPEAKING') {
          engine.startSpeaking();
        }

        setIsLoaded(true);
        onLoaded?.();
      },
      undefined,
      (err) => {
        if (currentSessionId === loadSessionIdRef.current) {
          console.error('[ProductionAvatarViewport] Failed to load Miko VRM:', err);
          const errorObj = err instanceof Error ? err : new Error(String(err));
          setLoadError(errorObj.message);
          onError?.(errorObj);
        }
      }
    );

    // -------------------------------------------------------------------------
    // Cleanup on unmount (Full WebGL / Three.js deep resource disposal)
    // -------------------------------------------------------------------------
    return () => {
      // Invalidate current load session
      loadSessionIdRef.current++;

      resizeObserver.disconnect();

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

      // Dispose lights, shadows, and root scene objects
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else if (mesh.material) {
            mesh.material.dispose();
          }
        }
      });

      renderer.dispose();
      currentVrmRef.current = null;
      engineRef.current = null;
      sceneRef.current = null;
    };
  }, []); // Run once on mount

  // ---------------------------------------------------------------------------
  // 3. Programmatic Camera Framing Updates (Internal only)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const targetConfig = CAMERA_PRESETS[framing] || CAMERA_PRESETS.medium;
    targetCamPosRef.current.set(...targetConfig.position);
    targetCamLookRef.current.set(...targetConfig.target);
  }, [framing]);

  // ---------------------------------------------------------------------------
  // 4. Live Tutor State Lifecycle & Speech Synchronization
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const prevState = prevInteractionStateRef.current;
    prevInteractionStateRef.current = interactionState;
    const engine = engineRef.current;
    if (!engine) return;

    if (interactionState === 'SPEAKING') {
      engine.startSpeaking();
    } else if (interactionState === 'INTERRUPTED') {
      // Immediate cancellation: zeroes mouth morphs and aborts gestures instantly
      engine.stopSpeaking(true);
    } else if (prevState === 'SPEAKING') {
      // Speech finished normally: smooth transition back to resting pose
      engine.stopSpeaking(false);
    }
  }, [interactionState]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'visible', // Must not clip Miko's gestures or head
        pointerEvents: 'none', // Strictly non-interactive: students cannot drag/orbit the camera
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.35s ease',
        }}
      />

      {/* Subtle, restrained loading placeholder */}
      {!isLoaded && !loadError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--theater-text-muted, #66666A)',
              opacity: 0.5,
              animation: 'lumo-pulse 1.4s ease-in-out infinite',
            }}
          />
        </div>
      )}

      {/* Graceful fallback notification on load error */}
      {loadError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--theater-text-muted, #66666A)',
          }}
        >
          <span>Avatar unavailable</span>
        </div>
      )}
    </div>
  );
};

export default ProductionAvatarViewport;
