import React, { useState, useEffect, useMemo } from 'react';
import {
  AvatarAssetConfig,
  AvatarCapabilities,
  AvatarId,
  AvatarLabState,
  CameraPreset,
  IndividualMorphValues,
  LoadDiagnostics,
  ManualExpressionValues,
  MeshDiagnosticItem,
  GeometryDeltaReport,
  EngineTelemetryData,
  AvatarStressTestResult,
  VisualIsolationMode,
} from './types';
import { AvatarViewport } from './AvatarViewport';
import { MikoAvatarEngine } from './mikoAvatarEngine';
import { textToSpeechService } from '../../services/tts.service';

const AVATAR_CATALOG: AvatarAssetConfig[] = [
  {
    id: 'miko',
    name: 'Miko',
    url: '/avatars/miko/miko.vrm',
    fileSizeBytes: 15379048,
    formatDescription: 'VRM (.vrm)',
  },
  {
    id: 'orion',
    name: 'Orion',
    url: '/avatars/orion/Orion.vrm',
    fileSizeBytes: 6148340,
    formatDescription: 'VRM (.vrm)',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    url: '/avatars/aurora/Aurora.vrm',
    fileSizeBytes: 7633108,
    formatDescription: 'VRM (.vrm)',
  },
];

interface AvatarLabPageProps {
  onNavigate?: (path: string) => void;
}

export const AvatarLabPage: React.FC<AvatarLabPageProps> = ({ onNavigate }) => {
  // Active Avatar Selection — Default to Miko as primary candidate
  const [selectedAvatarId, setSelectedAvatarId] = useState<AvatarId>('miko');
  const currentAvatar = AVATAR_CATALOG.find((a) => a.id === selectedAvatarId) || AVATAR_CATALOG[0];

  // Camera Preset
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('medium');

  // Avatar Lab States
  const [labState, setLabState] = useState<AvatarLabState>('READY');

  // Capabilities & Diagnostics State
  const [capabilities, setCapabilities] = useState<AvatarCapabilities | null>(null);
  const [diagnostics, setDiagnostics] = useState<LoadDiagnostics>({ status: 'idle' });

  // Inspector Panel Open/Close
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(true);

  // Manual Semantic Expression Controls
  const [isManualOverrideActive, setIsManualOverrideActive] = useState<boolean>(false);
  const [manualExpressions, setManualExpressions] = useState<ManualExpressionValues>({
    mouthOpen: 0,
    smile: 0,
    sad: 0,
    surprised: 0,
    blink: 0,
    neutral: 0,
  });

  // Developer Diagnostics Panel Collapsible Toggle
  const [devDiagnosticsOpen, setDevDiagnosticsOpen] = useState<boolean>(false);

  // Individual Morph Target Overrides (Developer Diagnostic Section)
  const [individualMorphValues, setIndividualMorphValues] = useState<IndividualMorphValues>({});
  const [morphCategoryTab, setMorphCategoryTab] = useState<'vowels' | 'eyes' | 'emotions' | 'all'>('vowels');
  const [morphSearchFilter, setMorphSearchFilter] = useState<string>('');

  // Speech Testing State
  const [isSpeakingAudio, setIsSpeakingAudio] = useState<boolean>(false);

  // Hard Runtime Diagnostic States (Steps 1 - 7)
  const [freezeVrmUpdate, setFreezeVrmUpdate] = useState<boolean>(false);
  const [rawLockTarget, setRawLockTarget] = useState<string | null>(null);
  const [rawLockWeight, setRawLockWeight] = useState<number>(1.0);
  const [hiddenMeshNames, setHiddenMeshNames] = useState<string[]>([]);
  const [meshList, setMeshList] = useState<MeshDiagnosticItem[]>([]);
  const [deltaReports, setDeltaReports] = useState<GeometryDeltaReport[]>([]);
  const [liveMthA, setLiveMthA] = useState<number>(0);
  const [liveBlink, setLiveBlink] = useState<number>(0);

  // Authoritative Engine & Real-Time Telemetry
  const [engine, setEngine] = useState<MikoAvatarEngine | null>(null);
  const [telemetry, setTelemetry] = useState<EngineTelemetryData | null>(null);

  // Automated Repeatability Stress Test State
  const [stressTestState, setStressTestState] = useState<AvatarStressTestResult>({
    running: false,
    progress: 0,
    cyclesCompleted: 0,
    totalCycles: 10,
    passed: null,
    logs: [],
  });

  // Visual Layer Isolation Mode (Part 2 & Part 7)
  const [visualIsolationMode, setVisualIsolationMode] = useState<VisualIsolationMode>('ALL');

  // Stop TTS when leaving page or switching avatar
  useEffect(() => {
    return () => {
      textToSpeechService.cancel();
    };
  }, []);

  const handleAvatarChange = (id: AvatarId) => {
    textToSpeechService.cancel();
    setIsSpeakingAudio(false);
    setSelectedAvatarId(id);
    setIsManualOverrideActive(false);
    setManualExpressions({ mouthOpen: 0, smile: 0, sad: 0, surprised: 0, blink: 0, neutral: 0 });
    setIndividualMorphValues({});
    setRawLockTarget(null);
    setRawLockWeight(1.0);
    setFreezeVrmUpdate(false);
    setHiddenMeshNames([]);
    setVisualIsolationMode('ALL');
    setLabState('READY');
    engine?.resetAll();
  };

  const handleStateSelect = (state: AvatarLabState) => {
    setIsManualOverrideActive(false);
    setRawLockTarget(null);
    engine?.setManualOverride(false);
    if (state === 'INTERRUPTED') {
      textToSpeechService.cancel();
      setIsSpeakingAudio(false);
      engine?.stopSpeaking(true);
    } else if (state === 'SPEAKING') {
      engine?.startSpeaking();
    } else {
      if (isSpeakingAudio) {
        textToSpeechService.cancel();
        setIsSpeakingAudio(false);
      }
      engine?.stopSpeaking(false);
    }
    setLabState(state);
  };

  const handleResetAll = () => {
    setIsManualOverrideActive(true);
    setRawLockTarget(null);
    setManualExpressions({ mouthOpen: 0, smile: 0, sad: 0, surprised: 0, blink: 0, neutral: 1 });
    setIndividualMorphValues({});
    engine?.neutral();
  };

  // 100% Reliable Minimal Facial Action Triggers
  const handleQuickOpen = () => {
    setIsManualOverrideActive(true);
    setRawLockTarget(null);
    setManualExpressions((prev) => ({ ...prev, mouthOpen: 1.0, neutral: 0 }));
    engine?.open(1.0);
  };

  const handleQuickBlink = () => {
    setIsManualOverrideActive(true);
    setRawLockTarget(null);
    setManualExpressions((prev) => ({ ...prev, blink: 1.0 }));
    engine?.blink(1.0);
  };

  const handleQuickSmile = () => {
    setIsManualOverrideActive(true);
    setRawLockTarget(null);
    setManualExpressions((prev) => ({ ...prev, smile: 1.0, neutral: 0 }));
    engine?.smile(1.0);
  };

  const handleQuickNeutral = () => {
    setIsManualOverrideActive(true);
    setRawLockTarget(null);
    setManualExpressions({ mouthOpen: 0, smile: 0, sad: 0, surprised: 0, blink: 0, neutral: 1.0 });
    setIndividualMorphValues({});
    engine?.neutral();
  };

  const handleIndividualMorphChange = (targetName: string, value: number) => {
    setIsManualOverrideActive(true);
    setManualExpressions((prev) => ({ ...prev, neutral: 0 }));
    setIndividualMorphValues((prev) => ({
      ...prev,
      [targetName]: value,
    }));
    engine?.setIndividualMorph(targetName, value);
  };

  const handleRunStressTest = async () => {
    if (!engine || stressTestState.running) return;
    await engine.runStressTest((res) => {
      setStressTestState(res);
    });
  };

  const handleTestSpeech = () => {
    if (isSpeakingAudio) {
      textToSpeechService.cancel();
      setIsSpeakingAudio(false);
      setLabState('INTERRUPTED');
      engine?.stopSpeaking(true);
      return;
    }

    setIsManualOverrideActive(false);
    setLabState('SPEAKING');
    setIsSpeakingAudio(true);
    engine?.startSpeaking();

    const testText = "Hello! I am your AI tutor. Today we will explore quantum mechanics together.";

    textToSpeechService.speak(
      testText,
      'english',
      {
        onStart: () => {
          setIsSpeakingAudio(true);
          setLabState('SPEAKING');
          engine?.startSpeaking();
        },
        onEnd: () => {
          setIsSpeakingAudio(false);
          setLabState('READY');
          engine?.stopSpeaking(false);
        },
        onError: () => {
          setIsSpeakingAudio(false);
          setLabState('READY');
          engine?.stopSpeaking(true);
        },
      }
    );
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Filtered morph targets for developer diagnostics
  const filteredMorphTargets = useMemo(() => {
    if (!capabilities?.allMorphTargetNames) return [];
    const all = capabilities.allMorphTargetNames;

    return all.filter((targetName) => {
      const lower = targetName.toLowerCase();
      if (morphSearchFilter && !lower.includes(morphSearchFilter.toLowerCase())) {
        return false;
      }

      if (morphCategoryTab === 'vowels') {
        return (
          lower.includes('mth') ||
          lower.includes('mouth') ||
          lower.includes('jaw') ||
          ['aa', 'ih', 'ou', 'ee', 'oh', 'a', 'i', 'u', 'e', 'o'].some((v) => lower === v)
        );
      }
      if (morphCategoryTab === 'eyes') {
        return (
          lower.includes('eye') ||
          lower.includes('brw') ||
          lower.includes('brow') ||
          lower.includes('blink')
        );
      }
      if (morphCategoryTab === 'emotions') {
        return (
          lower.includes('all') ||
          lower.includes('joy') ||
          lower.includes('angry') ||
          lower.includes('sorrow') ||
          lower.includes('surprised') ||
          lower.includes('fun') ||
          lower.includes('happy') ||
          lower.includes('sad')
        );
      }
      return true; // 'all'
    });
  }, [capabilities?.allMorphTargetNames, morphCategoryTab, morphSearchFilter]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        background: '#0B0C0E',
        color: '#F5F5F5',
        fontFamily: 'var(--theater-font-sans, -apple-system, BlinkMacSystemFont, sans-serif)',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* -------------------------------------------------------------
          TOP BAR: Identity, Avatar Switcher, Camera Presets, Back
          ------------------------------------------------------------- */}
      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '56px',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 30,
          background: 'linear-gradient(180deg, rgba(11, 12, 14, 0.95) 0%, rgba(11, 12, 14, 0.6) 80%, transparent 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Left: Brand / Lab Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {onNavigate && (
            <button
              onClick={() => onNavigate('/dashboard')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#A1A1A5',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 8px',
                borderRadius: '6px',
                transition: 'color 120ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#A1A1A5')}
              title="Return to Dashboard"
            >
              ← Back
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontWeight: 600,
                fontSize: '13px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#FFFFFF',
              }}
            >
              Lumo.AI
            </span>
            <span style={{ color: '#444448' }}>/</span>
            <span
              style={{
                fontFamily: 'var(--theater-font-mono, monospace)',
                fontSize: '12px',
                letterSpacing: '0.04em',
                color: '#A1A1A5',
              }}
            >
              Avatar Lab
            </span>
          </div>
        </div>

        {/* Center: Avatar Selector Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(20, 21, 24, 0.85)',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            gap: '2px',
          }}
        >
          {AVATAR_CATALOG.map((avatar) => {
            const isSelected = avatar.id === selectedAvatarId;
            return (
              <button
                key={avatar.id}
                onClick={() => handleAvatarChange(avatar.id)}
                style={{
                  background: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  border: isSelected ? '1px solid rgba(255, 255, 255, 0.16)' : '1px solid transparent',
                  color: isSelected ? '#FFFFFF' : '#A1A1A5',
                  padding: '5px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: isSelected ? 500 : 400,
                  cursor: 'pointer',
                  transition: 'all 120ms ease',
                }}
              >
                {avatar.name} {avatar.id === 'miko' ? '★' : ''}
              </button>
            );
          })}
        </div>

        {/* Right: Camera Presets & Inspector Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(20, 21, 24, 0.85)',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              gap: '2px',
            }}
          >
            {(['close', 'medium', 'full'] as CameraPreset[]).map((preset) => {
              const isSelected = cameraPreset === preset;
              return (
                <button
                  key={preset}
                  onClick={() => setCameraPreset(preset)}
                  style={{
                    background: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                    border: isSelected ? '1px solid rgba(255, 255, 255, 0.16)' : '1px solid transparent',
                    color: isSelected ? '#FFFFFF' : '#88888E',
                    padding: '4px 10px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    fontFamily: 'var(--theater-font-mono, monospace)',
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                  }}
                >
                  {preset}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setInspectorOpen((prev) => !prev)}
            style={{
              background: inspectorOpen ? 'rgba(255, 255, 255, 0.12)' : 'rgba(20, 21, 24, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: inspectorOpen ? '#FFFFFF' : '#A1A1A5',
              padding: '5px 12px',
              borderRadius: '7px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {inspectorOpen ? 'Hide Info' : 'Show Info'}
          </button>
        </div>
      </header>

      {/* -------------------------------------------------------------
          MAIN 3D VIEWPORT
          ------------------------------------------------------------- */}
      <div style={{ width: '100%', height: '100%' }}>
        <AvatarViewport
          currentAvatar={currentAvatar}
          labState={labState}
          cameraPreset={cameraPreset}
          manualExpressions={manualExpressions}
          individualMorphValues={individualMorphValues}
          isManualOverrideActive={isManualOverrideActive}
          freezeVrmUpdate={freezeVrmUpdate}
          rawLockTarget={rawLockTarget}
          rawLockWeight={rawLockWeight}
          hiddenMeshNames={hiddenMeshNames}
          visualIsolationMode={visualIsolationMode}
          onCapabilitiesDetected={setCapabilities}
          onDiagnosticsUpdate={setDiagnostics}
          onMeshListUpdated={(meshes, deltas) => {
            setMeshList(meshes);
            setDeltaReports(deltas);
          }}
          onLiveInfluenceUpdated={(mthA, eyeClose) => {
            setLiveMthA(mthA);
            setLiveBlink(eyeClose);
          }}
          onEngineReady={setEngine}
          onTelemetryUpdate={setTelemetry}
        />
      </div>

      {/* -------------------------------------------------------------
          BOTTOM FLOATING DOCK: State Harness & Speech Test
          ------------------------------------------------------------- */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 30,
          background: 'rgba(14, 15, 18, 0.88)',
          padding: '6px 10px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.10)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Lab State Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          {(['READY', 'LISTENING', 'THINKING', 'SPEAKING', 'INTERRUPTED', 'PAUSED', 'ERROR'] as AvatarLabState[]).map((state) => {
            const isActive = labState === state && !isManualOverrideActive;
            return (
              <button
                key={state}
                onClick={() => handleStateSelect(state)}
                style={{
                  background: isActive ? '#FFFFFF' : 'transparent',
                  color: isActive ? '#0B0C0E' : '#A1A1A5',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '7px',
                  fontSize: '12px',
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: '0.02em',
                  cursor: 'pointer',
                  transition: 'all 120ms ease',
                }}
              >
                {state}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '20px', background: 'rgba(255, 255, 255, 0.12)' }} />

        {/* Audio Speech Test Button */}
        <button
          onClick={handleTestSpeech}
          style={{
            background: isSpeakingAudio ? 'rgba(229, 83, 75, 0.18)' : 'rgba(255, 255, 255, 0.08)',
            border: isSpeakingAudio ? '1px solid rgba(229, 83, 75, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
            color: isSpeakingAudio ? '#FF7870' : '#FFFFFF',
            padding: '6px 14px',
            borderRadius: '7px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 120ms ease',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isSpeakingAudio ? '#FF554A' : '#55C98A',
            }}
          />
          {isSpeakingAudio ? 'Stop Speech' : 'Test Speech'}
        </button>
      </div>

      {/* -------------------------------------------------------------
          RIGHT INSPECTOR DRAWER: Model Status, Capabilities, Expressions
          ------------------------------------------------------------- */}
      {inspectorOpen && (
        <aside
          style={{
            position: 'absolute',
            top: '72px',
            right: '20px',
            bottom: '24px',
            width: '350px',
            background: 'rgba(17, 18, 22, 0.90)',
            backdropFilter: 'blur(16px)',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 25,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
              Model Diagnostics
            </span>
            <span
              style={{
                fontFamily: 'var(--theater-font-mono, monospace)',
                fontSize: '11px',
                color: diagnostics.status === 'loaded' ? '#55C98A' : diagnostics.status === 'error' ? '#E5534B' : '#F5B942',
              }}
            >
              {diagnostics.status.toUpperCase()}
            </span>
          </div>

          {/* Scrollable Content */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              fontSize: '12px',
            }}
          >
            {/* 1. Model Status Section */}
            <div>
              <div
                style={{
                  fontFamily: 'var(--theater-font-mono, monospace)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#89909D',
                  marginBottom: '8px',
                }}
              >
                Model Specification
              </div>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#89909D' }}>Model:</span>
                  <span style={{ fontWeight: 500, color: '#F5F5F5' }}>{currentAvatar.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#89909D' }}>Format:</span>
                  <span style={{ color: '#F5F5F5' }}>{capabilities?.vrmVersion || currentAvatar.formatDescription}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#89909D' }}>File Size:</span>
                  <span style={{ color: '#F5F5F5' }}>{formatFileSize(currentAvatar.fileSizeBytes)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#89909D' }}>Load Duration:</span>
                  <span style={{ color: '#F5F5F5' }}>
                    {diagnostics.loadTimeMs ? `${diagnostics.loadTimeMs} ms` : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Runtime Capabilities Section */}
            <div>
              <div
                style={{
                  fontFamily: 'var(--theater-font-mono, monospace)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#89909D',
                  marginBottom: '8px',
                }}
              >
                Runtime Capabilities
              </div>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#89909D' }}>VRM Architecture:</span>
                  <span style={{ color: capabilities?.isVRM ? '#55C98A' : '#E5534B' }}>
                    {capabilities ? (capabilities.isVRM ? 'Yes' : 'No') : 'Detecting…'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#89909D' }}>Humanoid Rig:</span>
                  <span style={{ color: capabilities?.hasHumanoid ? '#55C98A' : '#E5534B' }}>
                    {capabilities ? (capabilities.hasHumanoid ? 'Detected' : 'No') : 'Detecting…'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#89909D' }}>Bones Detected:</span>
                  <span style={{ color: '#F5F5F5' }}>
                    {capabilities ? `${capabilities.boneCount} bones` : '—'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#89909D' }}>Meshes / Primitives:</span>
                  <span style={{ color: '#F5F5F5' }}>
                    {capabilities ? `${capabilities.meshCount} meshes` : '—'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#89909D' }}>Total Morph Targets:</span>
                  <span style={{ color: '#55C98A', fontWeight: 500 }}>
                    {capabilities ? `${capabilities.morphTargetCount} targets` : '—'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#89909D' }}>Mouth Controls:</span>
                  <span style={{ color: capabilities?.hasMouthControls ? '#55C98A' : '#E5534B' }}>
                    {capabilities
                      ? capabilities.hasMouthControls
                        ? `Yes (${capabilities.mouthExpressionNames.length})`
                        : 'None'
                      : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* COLLAPSIBLE DEVELOPER DIAGNOSTICS (Closed by default to keep lab clean) */}
            <div
              style={{
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.02)',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setDevDiagnosticsOpen((prev) => !prev)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  color: '#A1A1A5',
                  fontSize: '11px',
                  fontWeight: 600,
                  fontFamily: 'var(--theater-font-mono, monospace)',
                  letterSpacing: '0.06em',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{devDiagnosticsOpen ? '▼' : '▶'}</span>
                  <span>Developer Diagnostics</span>
                </div>
                {rawLockTarget && (
                  <span
                    style={{
                      fontSize: '9px',
                      color: '#FFD166',
                      background: 'rgba(255, 209, 102, 0.15)',
                      padding: '2px 5px',
                      borderRadius: '3px',
                    }}
                  >
                    LOCK ACTIVE
                  </span>
                )}
              </button>

              {devDiagnosticsOpen && (
                <div
                  style={{
                    padding: '12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    background: 'rgba(0, 0, 0, 0.25)',
                  }}
                >
                  {/* Engine Instance & Telemetry Overview */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                      fontFamily: 'var(--theater-font-mono, monospace)',
                      fontSize: '11px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#89909D' }}>Engine Instance:</span>
                      <span style={{ color: '#55C98A', fontWeight: 600 }}>
                        {telemetry?.instanceId || 'Initializing...'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#89909D' }}>Bound Face Meshes:</span>
                      <span style={{ color: '#F5F5F5' }}>
                        {telemetry?.boundMeshCount ? `${telemetry.boundMeshCount} meshes` : '8 meshes'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#89909D' }}>Engine Rate:</span>
                      <span style={{ color: '#F5F5F5' }}>{telemetry?.fps ?? 60} fps</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#89909D' }}>Natural Blink State:</span>
                      <span style={{ color: '#FFD166', textTransform: 'uppercase' }}>
                        {telemetry?.blinkState || 'idle'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#89909D' }}>Miko VRM Roots in Scene:</span>
                      <span
                        style={{
                          color: (telemetry?.vrmRootsInScene ?? 1) === 1 ? '#55C98A' : '#E5534B',
                          fontWeight: 700,
                          background: (telemetry?.vrmRootsInScene ?? 1) === 1 ? 'rgba(85, 201, 138, 0.15)' : 'rgba(229, 83, 75, 0.2)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          border: `1px solid ${(telemetry?.vrmRootsInScene ?? 1) === 1 ? 'rgba(85, 201, 138, 0.4)' : '#E5534B'}`,
                        }}
                      >
                        {telemetry?.vrmRootsInScene ?? 1} {(telemetry?.vrmRootsInScene ?? 1) === 1 ? '✓ (CLEAN)' : '⚠ DUPLICATE'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#89909D' }}>Speaking Driver:</span>
                      <span style={{ color: telemetry?.isSpeaking ? '#55C98A' : '#88888E' }}>
                        {telemetry?.isSpeaking
                          ? `ACTIVE (Vowel ${telemetry.activeSpeechVowel})`
                          : 'IDLE'}
                      </span>
                    </div>
                  </div>

                  {/* Visual Layer Isolation Controls (Part 2 & Part 7) */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--theater-font-mono, monospace)',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: '#89909D',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span>Visual Layer Isolation</span>
                      <span style={{ color: '#55C98A', fontSize: '9px' }}>
                        {visualIsolationMode}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <button
                        onClick={() => setVisualIsolationMode('ONLY_FACE_SKIN')}
                        style={{
                          background: visualIsolationMode === 'ONLY_FACE_SKIN' ? '#55C98A' : 'rgba(255, 255, 255, 0.06)',
                          color: visualIsolationMode === 'ONLY_FACE_SKIN' ? '#0B0C0E' : '#FFFFFF',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          padding: '6px 4px',
                          borderRadius: '5px',
                          fontSize: '10px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'var(--theater-font-mono, monospace)',
                          transition: 'all 100ms ease',
                        }}
                      >
                        [ ONLY FACE SKIN ]
                      </button>

                      <button
                        onClick={() => setVisualIsolationMode('ONLY_MOUTH')}
                        style={{
                          background: visualIsolationMode === 'ONLY_MOUTH' ? '#55C98A' : 'rgba(255, 255, 255, 0.06)',
                          color: visualIsolationMode === 'ONLY_MOUTH' ? '#0B0C0E' : '#FFFFFF',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          padding: '6px 4px',
                          borderRadius: '5px',
                          fontSize: '10px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'var(--theater-font-mono, monospace)',
                          transition: 'all 100ms ease',
                        }}
                      >
                        [ ONLY MOUTH ]
                      </button>

                      <button
                        onClick={() => setVisualIsolationMode('ONLY_EYES')}
                        style={{
                          background: visualIsolationMode === 'ONLY_EYES' ? '#55C98A' : 'rgba(255, 255, 255, 0.06)',
                          color: visualIsolationMode === 'ONLY_EYES' ? '#0B0C0E' : '#FFFFFF',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          padding: '6px 4px',
                          borderRadius: '5px',
                          fontSize: '10px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'var(--theater-font-mono, monospace)',
                          transition: 'all 100ms ease',
                        }}
                      >
                        [ ONLY EYES ]
                      </button>

                      <button
                        onClick={() => setVisualIsolationMode('ALL')}
                        style={{
                          background: visualIsolationMode === 'ALL' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                          color: visualIsolationMode === 'ALL' ? '#FFFFFF' : '#88888E',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          padding: '6px 4px',
                          borderRadius: '5px',
                          fontSize: '10px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'var(--theater-font-mono, monospace)',
                          transition: 'all 100ms ease',
                        }}
                      >
                        [ ALL FACE ]
                      </button>
                    </div>
                    <div style={{ fontSize: '9px', color: '#89909D', lineHeight: '1.3' }}>
                      {visualIsolationMode === 'ONLY_FACE_SKIN' && 'Showing ONLY outer lips & skin (Face_(merged)baked_3).'}
                      {visualIsolationMode === 'ONLY_MOUTH' && 'Showing ONLY mouth cavity/teeth + outer lips.'}
                      {visualIsolationMode === 'ONLY_EYES' && 'Showing ONLY eyes, lashes, eyelines, brows.'}
                      {visualIsolationMode === 'ALL' && 'All face primitives and meshes visible.'}
                    </div>
                  </div>

                  {/* Automated Repeatability Stress Test Suite */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div
                        style={{
                          fontFamily: 'var(--theater-font-mono, monospace)',
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: '#89909D',
                        }}
                      >
                        Avatar Stress Test (10x Cycles)
                      </div>
                      {stressTestState.passed !== null && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: stressTestState.passed
                              ? 'rgba(85, 201, 138, 0.2)'
                              : 'rgba(229, 83, 75, 0.2)',
                            color: stressTestState.passed ? '#55C98A' : '#E5534B',
                            border: `1px solid ${stressTestState.passed ? '#55C98A' : '#E5534B'}`,
                          }}
                        >
                          {stressTestState.passed ? 'PASS' : 'FAIL'}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={handleRunStressTest}
                      disabled={stressTestState.running || !engine}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: stressTestState.running
                          ? 'rgba(255, 255, 255, 0.05)'
                          : '#55C98A',
                        color: stressTestState.running ? '#89909D' : '#0B0C0E',
                        fontWeight: 700,
                        fontSize: '11px',
                        fontFamily: 'var(--theater-font-mono, monospace)',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: stressTestState.running || !engine ? 'not-allowed' : 'pointer',
                        transition: 'all 120ms ease',
                      }}
                    >
                      {stressTestState.running
                        ? `TESTING... (${stressTestState.progress}%)`
                        : '[ RUN AVATAR STRESS TEST ]'}
                    </button>

                    {/* Progress Bar */}
                    {stressTestState.running && (
                      <div
                        style={{
                          width: '100%',
                          height: '4px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '2px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${stressTestState.progress}%`,
                            height: '100%',
                            background: '#55C98A',
                            transition: 'width 80ms ease',
                          }}
                        />
                      </div>
                    )}

                    {/* Test Logs Drawer */}
                    {stressTestState.logs.length > 0 && (
                      <div
                        style={{
                          background: 'rgba(0, 0, 0, 0.5)',
                          borderRadius: '6px',
                          padding: '6px',
                          maxHeight: '100px',
                          overflowY: 'auto',
                          fontFamily: 'monospace',
                          fontSize: '9px',
                          color: '#A1A1A5',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                        }}
                      >
                        {stressTestState.logs.map((l, idx) => (
                          <div
                            key={idx}
                            style={{
                              color: l.includes('FAIL')
                                ? '#E5534B'
                                : l.includes('PASS')
                                ? '#55C98A'
                                : '#D0D0D5',
                            }}
                          >
                            {l}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Step 4: Freeze VRM Update Toggle */}
                  <div>
                    <button
                      onClick={() => setFreezeVrmUpdate((prev) => !prev)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        fontFamily: 'var(--theater-font-mono, monospace)',
                        cursor: 'pointer',
                        background: freezeVrmUpdate ? '#E5534B' : 'rgba(255, 255, 255, 0.08)',
                        color: freezeVrmUpdate ? '#FFFFFF' : '#D0D0D5',
                        border: freezeVrmUpdate ? '1px solid #FF7B72' : '1px solid rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>[ FREEZE VRM UPDATE ]</span>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase' }}>
                        {freezeVrmUpdate ? 'FROZEN' : 'RUNNING'}
                      </span>
                    </button>
                    <div style={{ fontSize: '10px', color: '#89909D', marginTop: '4px' }}>
                      Prevents vrm.update() from clearing morph weights every frame.
                    </div>
                  </div>

                  {/* Steps 1 & 2: Direct Raw Morph Buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setRawLockTarget('Fcl_MTH_A');
                        setRawLockWeight(1.0);
                        setIsManualOverrideActive(true);
                      }}
                      style={{
                        flex: 1,
                        background: rawLockTarget === 'Fcl_MTH_A' ? '#55C98A' : 'rgba(255, 255, 255, 0.06)',
                        color: rawLockTarget === 'Fcl_MTH_A' ? '#000000' : '#FFFFFF',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        padding: '8px 6px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      RAW MORPH TEST
                      <div style={{ fontSize: '9px', opacity: 0.8 }}>Fcl_MTH_A = 1.0</div>
                    </button>

                    <button
                      onClick={() => {
                        setRawLockTarget('Fcl_EYE_Close');
                        setRawLockWeight(1.0);
                        setIsManualOverrideActive(true);
                      }}
                      style={{
                        flex: 1,
                        background: rawLockTarget === 'Fcl_EYE_Close' ? '#55C98A' : 'rgba(255, 255, 255, 0.06)',
                        color: rawLockTarget === 'Fcl_EYE_Close' ? '#000000' : '#FFFFFF',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        padding: '8px 6px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      RAW BLINK TEST
                      <div style={{ fontSize: '9px', opacity: 0.8 }}>Fcl_EYE_Close = 1.0</div>
                    </button>
                  </div>

                  {rawLockTarget && (
                    <button
                      onClick={() => {
                        setRawLockTarget(null);
                        setRawLockWeight(1.0);
                      }}
                      style={{
                        background: 'transparent',
                        border: '1px dashed rgba(255, 255, 255, 0.2)',
                        color: '#A1A1A5',
                        fontSize: '10px',
                        padding: '4px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Release Raw Lock
                    </button>
                  )}

                  {/* Step 3: Direct Slider to mesh.morphTargetInfluences with live readout */}
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#F5F5F5', fontWeight: 500 }}>Direct Fcl_MTH_A Lock Slider:</span>
                      <span style={{ fontFamily: 'monospace', color: '#55C98A' }}>
                        {rawLockTarget === 'Fcl_MTH_A' ? rawLockWeight.toFixed(2) : '—'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={rawLockTarget === 'Fcl_MTH_A' ? rawLockWeight : 0}
                      onChange={(e) => {
                        setRawLockTarget('Fcl_MTH_A');
                        setRawLockWeight(parseFloat(e.target.value));
                        setIsManualOverrideActive(true);
                      }}
                      style={{ width: '100%', accentColor: '#FF6B6B', cursor: 'pointer' }}
                    />
                    <div
                      style={{
                        marginTop: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontFamily: 'monospace',
                        fontSize: '10px',
                        color: '#FFD166',
                      }}
                    >
                      <span>LIVE mesh[Fcl_MTH_A]:</span>
                      <span>{liveMthA.toFixed(3)}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontFamily: 'monospace',
                        fontSize: '10px',
                        color: '#FFD166',
                      }}
                    >
                      <span>LIVE mesh[Fcl_EYE_Close]:</span>
                      <span>{liveBlink.toFixed(3)}</span>
                    </div>
                  </div>

                  {/* Step 5: Geometry Delta Report Card */}
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--theater-font-mono, monospace)',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: '#89909D',
                        marginBottom: '4px',
                      }}
                    >
                      Geometry Deltas (Buffer Inspection)
                    </div>
                    <div
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '6px',
                        padding: '6px',
                        maxHeight: '90px',
                        overflowY: 'auto',
                        fontFamily: 'monospace',
                        fontSize: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      {deltaReports.length === 0 ? (
                        <span style={{ color: '#89909D' }}>No deltas inspected yet.</span>
                      ) : (
                        deltaReports.map((d, idx) => (
                          <div
                            key={idx}
                            style={{
                              borderBottom: '1px solid rgba(255,255,255,0.06)',
                              paddingBottom: '3px',
                            }}
                          >
                            <div style={{ color: '#55C98A', fontWeight: 600 }}>
                              {d.targetName} on {d.meshName}
                            </div>
                            <div style={{ color: '#D0D0D5', display: 'flex', justifyContent: 'space-between' }}>
                              <span>Verts: {d.vertexCount}</span>
                              <span>NonZero: {d.nonZeroDeltas}</span>
                              <span>Max: {d.maxDelta.toFixed(4)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Steps 6 & 7: Mesh Audit & Visibility Checklist */}
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--theater-font-mono, monospace)',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: '#89909D',
                        marginBottom: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>Scene Meshes ({meshList.length})</span>
                      <span style={{ color: '#55C98A' }}>Click to Toggle</span>
                    </div>
                    <div
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '6px',
                        padding: '6px',
                        maxHeight: '110px',
                        overflowY: 'auto',
                        fontFamily: 'monospace',
                        fontSize: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      {meshList.length === 0 ? (
                        <span style={{ color: '#89909D' }}>No meshes audited.</span>
                      ) : (
                        meshList.map((m, idx) => {
                          const isHidden = hiddenMeshNames.includes(m.name);
                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                setHiddenMeshNames((prev) =>
                                  prev.includes(m.name)
                                    ? prev.filter((n) => n !== m.name)
                                    : [...prev, m.name]
                                );
                              }}
                              style={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '3px 4px',
                                borderRadius: '4px',
                                background: isHidden
                                  ? 'rgba(229, 83, 75, 0.15)'
                                  : 'rgba(255, 255, 255, 0.03)',
                                border: isHidden
                                  ? '1px solid rgba(229, 83, 75, 0.3)'
                                  : '1px solid rgba(255, 255, 255, 0.05)',
                              }}
                            >
                              <span
                                style={{
                                  color: isHidden ? '#E5534B' : '#F5F5F5',
                                  textDecoration: isHidden ? 'line-through' : 'none',
                                }}
                              >
                                {m.name} ({m.materialName})
                              </span>
                              <span
                                style={{
                                  color: m.morphTargetCount > 0 ? '#55C98A' : '#89909D',
                                  fontSize: '9px',
                                }}
                              >
                                {m.morphTargetCount > 0 ? `${m.morphTargetCount} morphs` : 'no morphs'}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Morph Inspector & Individual Sliders */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '6px',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: 'var(--theater-font-mono, monospace)',
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: '#89909D',
                        }}
                      >
                        Individual Morphs ({filteredMorphTargets.length})
                      </div>
                      {Object.keys(individualMorphValues).length > 0 && (
                        <button
                          onClick={() => setIndividualMorphValues({})}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#A1A1A5',
                            fontSize: '10px',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Filter Tabs */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '4px',
                        marginBottom: '6px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        padding: '2px',
                        borderRadius: '6px',
                      }}
                    >
                      {(['vowels', 'eyes', 'emotions', 'all'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setMorphCategoryTab(tab)}
                          style={{
                            flex: 1,
                            background: morphCategoryTab === tab ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                            border: 'none',
                            color: morphCategoryTab === tab ? '#FFFFFF' : '#88888E',
                            padding: '3px 2px',
                            borderRadius: '4px',
                            fontSize: '9px',
                            textTransform: 'capitalize',
                            cursor: 'pointer',
                          }}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {/* Search */}
                    <input
                      type="text"
                      placeholder="Filter morphs…"
                      value={morphSearchFilter}
                      onChange={(e) => setMorphSearchFilter(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '4px',
                        padding: '4px 6px',
                        color: '#FFFFFF',
                        fontSize: '10px',
                        marginBottom: '6px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />

                    {/* Sliders container */}
                    <div
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '6px',
                        padding: '6px',
                        maxHeight: '120px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      {filteredMorphTargets.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#66666A', padding: '6px', fontSize: '10px' }}>
                          No matching morph targets.
                        </div>
                      ) : (
                        filteredMorphTargets.map((targetName) => {
                          const currentVal = individualMorphValues[targetName] || 0;
                          return (
                            <div key={targetName}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                <span
                                  style={{
                                    fontFamily: 'monospace',
                                    fontSize: '9px',
                                    color: currentVal > 0 ? '#55C98A' : '#A1A1A5',
                                  }}
                                  title={targetName}
                                >
                                  {targetName}
                                </span>
                                <span style={{ fontFamily: 'monospace', fontSize: '9px', color: '#F5F5F5' }}>
                                  {currentVal.toFixed(2)}
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={currentVal}
                                onChange={(e) =>
                                  handleIndividualMorphChange(targetName, parseFloat(e.target.value))
                                }
                                style={{ width: '100%', accentColor: '#FFFFFF', cursor: 'pointer' }}
                              />
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Primary Semantic Facial Controls Tester */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--theater-font-mono, monospace)',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#89909D',
                  }}
                >
                  Primary Facial Controls
                </div>
                {isManualOverrideActive && (
                  <button
                    onClick={handleResetAll}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#A1A1A5',
                      fontSize: '11px',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* 1. Four 100% Reliable Minimal Facial Action Buttons */}
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--theater-font-mono, monospace)',
                      fontSize: '9px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: '#89909D',
                      marginBottom: '6px',
                    }}
                  >
                    Quick Action Triggers
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    <button
                      onClick={handleQuickOpen}
                      style={{
                        background: manualExpressions.mouthOpen >= 0.8 ? '#55C98A' : 'rgba(255, 255, 255, 0.08)',
                        color: manualExpressions.mouthOpen >= 0.8 ? '#0B0C0E' : '#FFFFFF',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        borderRadius: '6px',
                        padding: '7px 4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        fontFamily: 'var(--theater-font-mono, monospace)',
                        cursor: 'pointer',
                        transition: 'all 100ms ease',
                      }}
                    >
                      OPEN
                    </button>
                    <button
                      onClick={handleQuickBlink}
                      style={{
                        background: manualExpressions.blink >= 0.8 ? '#55C98A' : 'rgba(255, 255, 255, 0.08)',
                        color: manualExpressions.blink >= 0.8 ? '#0B0C0E' : '#FFFFFF',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        borderRadius: '6px',
                        padding: '7px 4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        fontFamily: 'var(--theater-font-mono, monospace)',
                        cursor: 'pointer',
                        transition: 'all 100ms ease',
                      }}
                    >
                      BLINK
                    </button>
                    <button
                      onClick={handleQuickSmile}
                      style={{
                        background: manualExpressions.smile >= 0.8 ? '#55C98A' : 'rgba(255, 255, 255, 0.08)',
                        color: manualExpressions.smile >= 0.8 ? '#0B0C0E' : '#FFFFFF',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        borderRadius: '6px',
                        padding: '7px 4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        fontFamily: 'var(--theater-font-mono, monospace)',
                        cursor: 'pointer',
                        transition: 'all 100ms ease',
                      }}
                    >
                      SMILE
                    </button>
                    <button
                      onClick={handleQuickNeutral}
                      style={{
                        background: manualExpressions.neutral >= 0.8 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.08)',
                        color: manualExpressions.neutral >= 0.8 ? '#0B0C0E' : '#FFFFFF',
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        borderRadius: '6px',
                        padding: '7px 4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        fontFamily: 'var(--theater-font-mono, monospace)',
                        cursor: 'pointer',
                        transition: 'all 100ms ease',
                      }}
                    >
                      NEUTRAL
                    </button>
                  </div>
                </div>

                {/* 2. Live 5-Stage Deformation Pipeline Telemetry Card */}
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    padding: '8px',
                    fontFamily: 'var(--theater-font-mono, monospace)',
                    fontSize: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: '#89909D',
                      fontSize: '9px',
                      textTransform: 'uppercase',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                      paddingBottom: '3px',
                    }}
                  >
                    <span>5-Stage Deformation Pipeline</span>
                    <span>8 Meshes</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr 1fr', gap: '2px', color: '#A1A1A5', fontSize: '8.5px' }}>
                    <span>TARGET</span>
                    <span>UI</span>
                    <span>CMD</span>
                    <span>LERP</span>
                    <span style={{ color: '#FFFFFF' }}>MESH</span>
                    <span>BOUND</span>
                  </div>

                  {/* Fcl_MTH_A row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr 1fr', gap: '2px', color: '#55C98A', fontSize: '9.5px', fontWeight: 600 }}>
                    <span style={{ color: '#D0D0D5' }}>MTH_A</span>
                    <span>{(telemetry?.pipelineMouthA.uiValue ?? manualExpressions.mouthOpen).toFixed(2)}</span>
                    <span>{(telemetry?.pipelineMouthA.targetWeight ?? 0).toFixed(2)}</span>
                    <span>{(telemetry?.pipelineMouthA.currentWeight ?? 0).toFixed(2)}</span>
                    <span style={{ color: '#FFFFFF', background: 'rgba(85, 201, 138, 0.2)', padding: '0 2px', borderRadius: '2px' }}>
                      {(telemetry?.pipelineMouthA.meshInfluence ?? 0).toFixed(2)}
                    </span>
                    <span>{telemetry?.pipelineMouthA.meshCount ?? 8}</span>
                  </div>

                  {/* Fcl_EYE_Close row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr 1fr', gap: '2px', color: '#55C98A', fontSize: '9.5px', fontWeight: 600 }}>
                    <span style={{ color: '#D0D0D5' }}>EYE_C</span>
                    <span>{(telemetry?.pipelineBlink.uiValue ?? manualExpressions.blink).toFixed(2)}</span>
                    <span>{(telemetry?.pipelineBlink.targetWeight ?? 0).toFixed(2)}</span>
                    <span>{(telemetry?.pipelineBlink.currentWeight ?? 0).toFixed(2)}</span>
                    <span style={{ color: '#FFFFFF', background: 'rgba(85, 201, 138, 0.2)', padding: '0 2px', borderRadius: '2px' }}>
                      {(telemetry?.pipelineBlink.meshInfluence ?? 0).toFixed(2)}
                    </span>
                    <span>{telemetry?.pipelineBlink.meshCount ?? 8}</span>
                  </div>
                </div>

                {/* 3. Smooth Expression Sliders with Direct Engine Binding */}
                {/* Mouth Open Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#A1A1A5' }}>Mouth Open (Fcl_MTH_A):</span>
                    <span style={{ fontFamily: 'monospace', color: '#F5F5F5' }}>
                      {manualExpressions.mouthOpen.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={manualExpressions.mouthOpen}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setIsManualOverrideActive(true);
                      setRawLockTarget(null);
                      setManualExpressions((prev) => ({
                        ...prev,
                        mouthOpen: val,
                        neutral: 0,
                      }));
                      engine?.setMouthOpen(val);
                    }}
                    style={{ width: '100%', accentColor: '#FFFFFF', cursor: 'pointer' }}
                  />
                </div>

                {/* Smile Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#A1A1A5' }}>Smile / Joy (Fcl_MTH_Joy):</span>
                    <span style={{ fontFamily: 'monospace', color: '#F5F5F5' }}>
                      {manualExpressions.smile.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={manualExpressions.smile}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setIsManualOverrideActive(true);
                      setRawLockTarget(null);
                      setManualExpressions((prev) => ({
                        ...prev,
                        smile: val,
                        neutral: 0,
                      }));
                      engine?.setSmile(val);
                    }}
                    style={{ width: '100%', accentColor: '#FFFFFF', cursor: 'pointer' }}
                  />
                </div>

                {/* Sad Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#A1A1A5' }}>Sad / Sorrow (Fcl_MTH_Sorrow):</span>
                    <span style={{ fontFamily: 'monospace', color: '#F5F5F5' }}>
                      {(manualExpressions.sad || 0).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={manualExpressions.sad || 0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setIsManualOverrideActive(true);
                      setRawLockTarget(null);
                      setManualExpressions((prev) => ({
                        ...prev,
                        sad: val,
                        neutral: 0,
                      }));
                      engine?.setSad(val);
                    }}
                    style={{ width: '100%', accentColor: '#FFFFFF', cursor: 'pointer' }}
                  />
                </div>

                {/* Surprised Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#A1A1A5' }}>Surprised:</span>
                    <span style={{ fontFamily: 'monospace', color: '#F5F5F5' }}>
                      {(manualExpressions.surprised || 0).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={manualExpressions.surprised || 0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setIsManualOverrideActive(true);
                      setRawLockTarget(null);
                      setManualExpressions((prev) => ({
                        ...prev,
                        surprised: val,
                        neutral: 0,
                      }));
                      engine?.setSurprised(val);
                    }}
                    style={{ width: '100%', accentColor: '#FFFFFF', cursor: 'pointer' }}
                  />
                </div>

                {/* Blink Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#A1A1A5' }}>Blink Eyes (Fcl_EYE_Close):</span>
                    <span style={{ fontFamily: 'monospace', color: '#F5F5F5' }}>
                      {manualExpressions.blink.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={manualExpressions.blink}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setIsManualOverrideActive(true);
                      setRawLockTarget(null);
                      setManualExpressions((prev) => ({
                        ...prev,
                        blink: val,
                        neutral: 0,
                      }));
                      engine?.setBlink(val);
                    }}
                    style={{ width: '100%', accentColor: '#FFFFFF', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};

export default AvatarLabPage;
