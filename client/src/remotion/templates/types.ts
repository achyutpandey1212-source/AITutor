import type React from 'react';
import type { UniversalTeachingBeat, VisualTemplate } from '@ai-tutor/shared';

export interface UniversalTemplateContext {
  beat: UniversalTeachingBeat;
  width: number;
  height: number;
  frame?: number;
}

export interface UniversalTemplateRenderer {
  id: VisualTemplate;
  name: string;
  description: string;
  render(context: UniversalTemplateContext): React.ReactNode;
}
