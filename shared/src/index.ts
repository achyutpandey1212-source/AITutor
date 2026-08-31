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
