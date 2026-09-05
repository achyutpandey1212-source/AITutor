export type CameraFramingState = 'close' | 'medium' | 'full';

export type ProductionInteractionState =
  | 'READY'
  | 'LISTENING'
  | 'THINKING'
  | 'SPEAKING'
  | 'INTERRUPTED'
  | 'PAUSED'
  | 'ERROR';

export interface ProductionAvatarViewportProps {
  interactionState?: ProductionInteractionState;
  framing?: CameraFramingState;
  className?: string;
  style?: React.CSSProperties;
  onLoaded?: () => void;
  onError?: (error: Error) => void;
}
