export interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  database?: 'connected' | 'disconnected';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export interface User {
  id: string;
  firebaseUid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  firebaseUser: unknown | null;
  loading: boolean;
  error: string | null;
}

// AI Layer Types
export type AIProviderName = 'gemini' | 'groq';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIGenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemInstruction?: string;
}

export interface AITextResponse {
  text: string;
  provider: AIProviderName;
  model: string;
  fallbackUsed?: boolean;
}

export interface AIStructuredResponse<T = unknown> {
  data: T;
  provider: AIProviderName;
  model: string;
  fallbackUsed?: boolean;
}

export interface AITestResponse {
  prompt: string;
  response: string;
  provider: AIProviderName;
  model: string;
  fallbackUsed: boolean;
}
