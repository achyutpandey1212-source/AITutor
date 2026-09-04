import type { LumoModelTier } from '../../services/api.service';

export type ModelTier = LumoModelTier;

export interface WorkspaceContext {
  subject?: string;
  topic?: string;
  concept?: string;
  documentId?: string;
  documentTitle?: string;
}

export interface WorkspaceMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  modelTier?: ModelTier;
  modelName?: string;
  suggestions?: string[];
  hasDocumentContext?: boolean;
}

export interface ModelTierOption {
  id: ModelTier;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  recommendedFor: string;
}

export const MODEL_TIER_OPTIONS: ModelTierOption[] = [
  {
    id: 'fast',
    name: 'Lumo Fast',
    badge: '⚡',
    tagline: 'Instant answers',
    description: 'Ultra-low latency for definitions, quick facts, and short follow-ups.',
    recommendedFor: 'Quick everyday doubts',
  },
  {
    id: 'light',
    name: 'Lumo Light',
    badge: '◐',
    tagline: 'Balanced learning',
    description: 'Balanced speed and pedagogical reasoning for everyday study.',
    recommendedFor: 'Default conceptual learning',
  },
  {
    id: 'pro',
    name: 'Lumo Pro',
    badge: '✦',
    tagline: 'Deep reasoning',
    description: 'Maximum depth for complex multi-step proofs, difficult problem solving, and document analysis.',
    recommendedFor: 'Advanced problems & proofs',
  },
];
