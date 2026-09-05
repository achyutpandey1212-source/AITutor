import React, { useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRM, VRMUtils } from '@pixiv/three-vrm';

interface HeroMikoCanvasProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * HeroMikoCanvas
 * 
 * High-performance 3D canvas rendering Miko's VRM model.
 * Requirements strictly fulfilled:
 * 1. Zoomable on scroll up and down (mouse wheel zoom clamped within safe portrait bounds).
 * 2. On drag, user gets a 360° view of Miko.
 * 3. Horizontal-only rotation on drag (yaw/Y-axis only, no pitch/vertical tilting).
 * 4. On drag release / mouse leave, Miko smoothly returns (springs back) to her original forward-facing position.
 * 5. Subtle organic idle breathing and natural blinking.
 */
export const HeroMikoCanvas: React.FC<HeroMikoCanvasProps> = ({ className, style }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);

  // References for Three.js lifecycle
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const vrmRef = useRef<VRM | null>(null);
  const modelRootRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  // Interaction State Refs
  const isDraggingRef = useRef(false);
  const previousPointerXRef = useRef(0);
  const currentRotationYRef = useRef(0);
  const targetRotationYRef = useRef(0);

  // Camera zoom bounds and state
  // Fully fits Miku head-to-toe inside container at default, with portrait zoom-in capability
  const minCamDistance = 1.30; // Portrait close-up
  const maxCamDistance = 3.60; // Wide full-body view
  const defaultCamDistance = 3.20; // Default: perfectly frames full body with margins
  const currentCamDistanceRef = useRef(defaultCamDistance);
  const targetCamDistanceRef = useRef(defaultCamDistance);

  // Camera vertical offset refs for dynamic adjustment
  // Default centers around mid-body (y ~ 0.76) so head and feet both have breathing room
  const cameraYRef = useRef(0.78);
  const lookAtYRef = useRef(0.74);
  const targetCameraYRef = useRef(0.78);
  const targetLookAtYRef = useRef(0.74);

  // Idle animation timings
  const blinkTimerRef = useRef(2.5);
  const blinkStateRef = useRef<'idle' | 'closing' | 'opening'>('idle');
  const blinkProgressRef = useRef(0);

  // Initialize Three.js scene and load Miko
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 540;
    const height = container.clientHeight || 640;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera: target center around mid-body so head and feet are completely visible
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 20);
    camera.position.set(0, cameraYRef.current, defaultCamDistance);
    camera.lookAt(0, lookAtYRef.current, 0);
    cameraRef.current = camera;

    // 3. Renderer with transparent background and high craft tone mapping
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    rendererRef.current = renderer;

    // 4. Lighting: Crisp, flattering studio lighting with soft lavender rim
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambientLight);

    // Key front light
    const keyLight = new THREE.DirectionalLight(0xfff7ee, 1.8);
    keyLight.position.set(1.5, 2.5, 2.5);
    scene.add(keyLight);

    // Soft cool fill light from left
    const fillLight = new THREE.DirectionalLight(0xccdcff, 1.1);
    fillLight.position.set(-2, 1.5, 1.5);
    scene.add(fillLight);

    // Subtle violet rim light from behind (matches Linear purple glow)
    const rimLight = new THREE.DirectionalLight(0xa588f7, 1.5);
    rimLight.position.set(0, 2, -2.5);
    scene.add(rimLight);

    // Model group anchor
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelRootRef.current = modelGroup;

    // 5. Load Miko VRM
    let isMounted = true;
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      '/avatars/miko/miko.vrm',
      (gltf) => {
        if (!isMounted) return;
        const vrm = gltf.userData.vrm as VRM;
        if (!vrm) return;

        vrmRef.current = vrm;
        VRMUtils.rotateVRM0(vrm);

        // Position Miko grounded gracefully
        vrm.scene.position.set(0, 0, 0);
        modelGroup.add(vrm.scene);

        // Configure relaxing natural standing pose
        try {
          if (vrm.humanoid) {
            const leftUpperArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
            const rightUpperArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
            const leftLowerArm = vrm.humanoid.getNormalizedBoneNode('leftLowerArm');
            const rightLowerArm = vrm.humanoid.getNormalizedBoneNode('rightLowerArm');

            if (leftUpperArm) leftUpperArm.rotation.z = 1.18;
            if (rightUpperArm) rightUpperArm.rotation.z = -1.18;
            if (leftLowerArm) leftLowerArm.rotation.y = 0.2;
            if (rightLowerArm) rightLowerArm.rotation.y = -0.2;
          }
        } catch (e) {
          console.warn('[HeroMiko] Humanoid pose init notice:', e);
        }

        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.error('[HeroMiko] Failed to load Miko VRM:', error);
        setIsLoading(false);
      }
    );

    // 6. Resize Observer
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth === 0 || newHeight === 0) return;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // 7. Render Animation Loop
    const clock = clockRef.current;
    clock.start();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Smooth camera zoom interpolation
      currentCamDistanceRef.current = THREE.MathUtils.lerp(
        currentCamDistanceRef.current,
        targetCamDistanceRef.current,
        0.12
      );
      camera.position.z = currentCamDistanceRef.current;

      // Smooth camera vertical interpolation
      cameraYRef.current = THREE.MathUtils.lerp(
        cameraYRef.current,
        targetCameraYRef.current,
        0.10
      );
      lookAtYRef.current = THREE.MathUtils.lerp(
        lookAtYRef.current,
        targetLookAtYRef.current,
        0.10
      );
      camera.position.y = cameraYRef.current;
      camera.lookAt(0, lookAtYRef.current, 0);

      // Smooth horizontal rotation interpolation
      if (!isDraggingRef.current) {
        // Smoothly spring back to 0 (forward facing) when not dragging
        targetRotationYRef.current = THREE.MathUtils.lerp(
          targetRotationYRef.current,
          0,
          0.09
        );
      }

      currentRotationYRef.current = THREE.MathUtils.lerp(
        currentRotationYRef.current,
        targetRotationYRef.current,
        0.14
      );

      if (modelRootRef.current) {
        // Horizontal rotation only (pure Y-axis)
        modelRootRef.current.rotation.y = currentRotationYRef.current;
      }

      // VRM updates (breathing + natural blinking)
      if (vrmRef.current) {
        const vrm = vrmRef.current;

        // Subtle idle breathing motion
        if (vrm.humanoid) {
          const spine = vrm.humanoid.getNormalizedBoneNode('spine');
          const chest = vrm.humanoid.getNormalizedBoneNode('chest');
          const breathCycle = Math.sin(elapsed * 1.8) * 0.018;
          if (spine) spine.rotation.x = breathCycle * 0.4;
          if (chest) chest.rotation.x = breathCycle * 0.6;
        }

        // Natural periodic blinking
        blinkTimerRef.current -= delta;
        if (blinkTimerRef.current <= 0 && blinkStateRef.current === 'idle') {
          blinkStateRef.current = 'closing';
          blinkProgressRef.current = 0;
        }

        if (blinkStateRef.current === 'closing') {
          blinkProgressRef.current += delta * 12; // fast close
          if (blinkProgressRef.current >= 1) {
            blinkProgressRef.current = 1;
            blinkStateRef.current = 'opening';
          }
        } else if (blinkStateRef.current === 'opening') {
          blinkProgressRef.current -= delta * 8; // smooth open
          if (blinkProgressRef.current <= 0) {
            blinkProgressRef.current = 0;
            blinkStateRef.current = 'idle';
            blinkTimerRef.current = 2.5 + Math.random() * 2.5;
          }
        }

        if (vrm.expressionManager) {
          try {
            vrm.expressionManager.setValue('blink', blinkProgressRef.current);
          } catch {
            // ignore
          }
        }

        vrm.update(delta);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Native Wheel Listener for reliable non-passive scroll capture
    // By attaching with { passive: false }, e.preventDefault() blocks the whole page from scrolling
    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const zoomSpeed = 0.0022;
      const newDistance = targetCamDistanceRef.current + e.deltaY * zoomSpeed;
      targetCamDistanceRef.current = THREE.MathUtils.clamp(
        newDistance,
        minCamDistance,
        maxCamDistance
      );

      // Dynamically adjust camera vertical framing based on zoom level
      // When zoomed in (portrait), focus higher up on head/bust (y ~ 1.05 to 1.15)
      // When zoomed out (full body), focus at mid-body (y ~ 0.74 to 0.78)
      const t = (targetCamDistanceRef.current - minCamDistance) / (maxCamDistance - minCamDistance);
      const wideCameraY = 0.78;
      const narrowCameraY = 1.15;
      const wideLookAtY = 0.74;
      const narrowLookAtY = 1.08;
      targetCameraYRef.current = narrowCameraY + t * (wideCameraY - narrowCameraY);
      targetLookAtYRef.current = narrowLookAtY + t * (wideLookAtY - narrowLookAtY);
    };

    container.addEventListener('wheel', handleNativeWheel, { passive: false });

    return () => {
      isMounted = false;
      container.removeEventListener('wheel', handleNativeWheel);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
      scene.clear();
    };
  }, []);

  // -------------------------------------------------------------
  // Pointer Events: Horizontal-only drag rotation + auto reset
  // -------------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousPointerXRef.current = e.clientX;
    setIsInteracting(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousPointerXRef.current;
    previousPointerXRef.current = e.clientX;

    // Rotate horizontally based on mouse movement (horizontal only)
    const sensitivity = 0.008;
    targetRotationYRef.current += deltaX * sensitivity;
  };

  const handlePointerUpOrLeave = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsInteracting(false);
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUpOrLeave}
      onPointerCancel={handlePointerUpOrLeave}
      onPointerLeave={handlePointerUpOrLeave}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '520px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isInteracting ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
        overscrollBehavior: 'none',
        ...style,
      }}
      aria-label="3D Interactive Miko Avatar: Drag to rotate horizontally, scroll to zoom"
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          position: 'relative',
          zIndex: 2,
        }}
      />

      {/* Stage Presentation Glow — layered spotlight effect */}
      {/* Layer 1: Wide soft outer glow */}
      <div
        className="lumo-miko-glow-outer"
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '560px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, var(--color-purple-soft) 0%, transparent 65%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        aria-hidden="true"
      />

      {/* Layer 2: Medium spotlight body */}
      <div
        className="lumo-miko-glow-medium"
        style={{
          position: 'absolute',
          bottom: '36px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '420px',
          height: '100px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.28) 0%, rgba(168, 85, 247, 0.08) 50%, transparent 72%)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
        aria-hidden="true"
      />

      {/* Layer 3: Tight bright core ring underneath Miku's feet */}
      <div
        className="lumo-miko-glow-core"
        style={{
          position: 'absolute',
          bottom: '56px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '260px',
          height: '36px',
          borderRadius: '50%',
          border: '1.5px solid rgba(168, 85, 247, 0.55)',
          background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.35) 0%, rgba(168, 85, 247, 0.05) 60%, transparent 80%)',
          boxShadow: '0 0 48px rgba(168, 85, 247, 0.45), 0 0 120px rgba(168, 85, 247, 0.20), inset 0 0 28px rgba(168, 85, 247, 0.30)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
        aria-hidden="true"
      />

      {/* Layer 4: Vertical beam / spotlight cone behind Miku */}
      <div
        className="lumo-miko-glow-beam"
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '320px',
          height: '520px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.10) 0%, rgba(168, 85, 247, 0.03) 35%, transparent 70%)',
          filter: 'blur(28px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        aria-hidden="true"
      />

      {/* Minimal micro-hint badge for drag & scroll interaction */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '11px',
          fontFamily: 'var(--font-family-base)',
          fontWeight: 500,
          letterSpacing: '0.04em',
          color: 'var(--color-text-muted)',
          background: 'rgba(15, 16, 19, 0.72)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
          backdropFilter: 'blur(8px)',
          pointerEvents: 'none',
          zIndex: 3,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          opacity: isInteracting ? 0.9 : 0.65,
          transition: 'opacity 0.2s ease',
          whiteSpace: 'nowrap',
        }}
      >
        <span>360° Drag</span>
        <span style={{ opacity: 0.4 }}>•</span>
        <span>Scroll to Zoom</span>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            zIndex: 4,
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '2px solid var(--color-border)',
              borderTopColor: 'var(--color-text-primary)',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        </div>
      )}

      {/* Theme overrides for Miko canvas elements */}
      <style>{`
        [data-theme="light"] .lumo-miko-glow-core {
          border-color: rgba(232, 89, 46, 0.55) !important;
          background: radial-gradient(ellipse at center, rgba(232, 89, 46, 0.35) 0%, rgba(232, 89, 46, 0.05) 60%, transparent 80%) !important;
          box-shadow: 0 0 48px rgba(232, 89, 46, 0.45), 0 0 120px rgba(232, 89, 46, 0.20), inset 0 0 28px rgba(232, 89, 46, 0.30) !important;
        }
        [data-theme="light"] .lumo-miko-glow-medium {
          background: radial-gradient(ellipse at center, rgba(232, 89, 46, 0.28) 0%, rgba(232, 89, 46, 0.08) 50%, transparent 72%) !important;
        }
        [data-theme="light"] .lumo-miko-glow-outer {
          background: radial-gradient(ellipse at center, rgba(232, 89, 46, 0.18) 0%, transparent 65%) !important;
        }
        [data-theme="light"] .lumo-miko-glow-beam {
          background: radial-gradient(ellipse at center, rgba(232, 89, 46, 0.10) 0%, rgba(232, 89, 46, 0.03) 35%, transparent 70%) !important;
        }
      `}</style>
    </div>
  );
};
