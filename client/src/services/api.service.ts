import type {
  ApiResponse,
  CreateSessionRequest,
  Document,
  DocumentListResponse,
  DocumentUploadResponse,
  RAGQueryRequest,
  RAGSearchResult,
  RAGSearchResponse,
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

  // ==========================================
  // Knowledge & Document Ingestion API Methods
  // ==========================================

  async uploadDocument(idToken: string, file: File): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/knowledge/documents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      body: formData,
    });

    const json: DocumentUploadResponse = await res.json();
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error?.message || `Failed to upload document (HTTP ${res.status})`);
    }

    return json.data;
  }

  async listDocuments(idToken: string): Promise<Document[]> {
    const res = await fetch('/api/knowledge/documents', {
      headers: this.getHeaders(idToken),
    });

    const json: DocumentListResponse = await res.json();
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error?.message || `Failed to list documents (HTTP ${res.status})`);
    }

    return json.data;
  }

  async getDocument(idToken: string, documentId: string): Promise<Document> {
    const res = await fetch(`/api/knowledge/documents/${documentId}`, {
      headers: this.getHeaders(idToken),
    });

    const json: ApiResponse<Document> = await res.json();
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error?.message || `Failed to fetch document status (HTTP ${res.status})`);
    }

    return json.data;
  }

  async deleteDocument(idToken: string, documentId: string): Promise<boolean> {
    const res = await fetch(`/api/knowledge/documents/${documentId}`, {
      method: 'DELETE',
      headers: this.getHeaders(idToken),
    });

    const json: ApiResponse<{ deleted: boolean }> = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || `Failed to delete document (HTTP ${res.status})`);
    }

    return json.data?.deleted ?? true;
  }

  async searchKnowledge(
    idToken: string,
    request: RAGQueryRequest
  ): Promise<RAGSearchResult> {
    const res = await fetch('/api/knowledge/search', {
      method: 'POST',
      headers: this.getHeaders(idToken),
      body: JSON.stringify(request),
    });

    const json: RAGSearchResponse = await res.json();
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error?.message || `RAG search failed (HTTP ${res.status})`);
    }

    return json.data;
  }

  // ==========================================
  // Milestone 7: Assessment & Submission API Methods
  // ==========================================

  async generateAssessmentQuestion(
    idToken: string,
    request: import('@ai-tutor/shared').CreateAssessmentRequest
  ): Promise<import('@ai-tutor/shared').ClientAssessmentQuestion> {
    const res = await fetch('/api/assessments/generate', {
      method: 'POST',
      headers: this.getHeaders(idToken),
      body: JSON.stringify(request),
    });

    const json: import('@ai-tutor/shared').AssessmentQuestionResponse = await res.json();
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error?.message || `Failed to generate question (HTTP ${res.status})`);
    }

    return json.data;
  }

  async submitAssessmentAnswer(
    idToken: string,
    questionId: string,
    request: import('@ai-tutor/shared').AssessmentSubmissionRequest
  ): Promise<import('@ai-tutor/shared').AssessmentSubmission> {
    const res = await fetch(`/api/assessments/questions/${questionId}/submit`, {
      method: 'POST',
      headers: this.getHeaders(idToken),
      body: JSON.stringify(request),
    });

    const json: import('@ai-tutor/shared').AssessmentSubmissionResponse = await res.json();
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error?.message || `Submission failed (HTTP ${res.status})`);
    }

    return json.data;
  }

  async submitAssessmentImage(
    idToken: string,
    questionId: string,
    file: File
  ): Promise<import('@ai-tutor/shared').AssessmentSubmission> {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`/api/assessments/questions/${questionId}/submit-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      body: formData,
    });

    const json: import('@ai-tutor/shared').AssessmentSubmissionResponse = await res.json();
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error?.message || `Image submission failed (HTTP ${res.status})`);
    }

    return json.data;
  }

  async getAssessmentSubmission(
    idToken: string,
    questionId: string
  ): Promise<import('@ai-tutor/shared').AssessmentSubmission | null> {
    const res = await fetch(`/api/assessments/questions/${questionId}/submission`, {
      headers: this.getHeaders(idToken),
    });

    if (res.status === 404) {
      return null;
    }

    const json: import('@ai-tutor/shared').AssessmentSubmissionResponse = await res.json();
    if (!res.ok || !json.success || !json.data) {
      return null;
    }

    return json.data;
  }
}

export const liveTutorApiClient = new LiveTutorApiClient();

