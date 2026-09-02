import type {
  ApiResponse,
  CreateSessionRequest,
  TeachingSession,
  VoiceInteractionRequest,
  VoiceInteractionResponse,
} from '@ai-tutor/shared';

export class LiveTutorApiClient {
  private getHeaders(idToken: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    };
  }

  async createSession(
    idToken: string,
    request: CreateSessionRequest
  ): Promise<TeachingSession> {
    const res = await fetch('/api/teaching/sessions', {
      method: 'POST',
      headers: this.getHeaders(idToken),
      body: JSON.stringify(request),
    });

    const json: ApiResponse<TeachingSession> = await res.json();
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error?.message || `Failed to create session (HTTP ${res.status})`);
    }

    return json.data;
  }

  async sendVoiceInteraction(
    idToken: string,
    sessionId: string,
    request: VoiceInteractionRequest
  ): Promise<VoiceInteractionResponse> {
    const res = await fetch(`/api/teaching/sessions/${sessionId}/voice`, {
      method: 'POST',
      headers: this.getHeaders(idToken),
      body: JSON.stringify(request),
    });

    const json: ApiResponse<VoiceInteractionResponse> = await res.json();
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error?.message || `Failed to process voice interaction (HTTP ${res.status})`);
    }

    return json.data;
  }
}

export const liveTutorApiClient = new LiveTutorApiClient();
