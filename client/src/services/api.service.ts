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

  async evaluateAssessmentQuestion(
    idToken: string,
    questionId: string
  ): Promise<import('@ai-tutor/shared').EvaluationResult> {
    const res = await fetch(`/api/assessments/questions/${questionId}/evaluate`, {
      method: 'POST',
      headers: this.getHeaders(idToken),
    });

    const json: import('@ai-tutor/shared').EvaluationResultResponse = await res.json();
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error?.message || `Evaluation request failed (HTTP ${res.status})`);
    }

    return json.data;
  }

  // ==========================================
  // M7 Phase 4: Sessions, Bookmarks, Mistakes & Analytics
  // ==========================================

  async createAssessmentSession(
    idToken: string,
    req: import('@ai-tutor/shared').CreateAssessmentSessionRequest
  ): Promise<import('@ai-tutor/shared').AssessmentSession> {
    const res = await fetch('/api/assessments/sessions', {
      method: 'POST',
      headers: this.getHeaders(idToken),
      body: JSON.stringify(req),
    });

    const json: import('@ai-tutor/shared').AssessmentSessionResponse = await res.json();
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error?.message || `Failed to create session (HTTP ${res.status})`);
    }

    return json.data;
  }

  async listAssessmentSessions(
    idToken: string
  ): Promise<import('@ai-tutor/shared').AssessmentSession[]> {
    const res = await fetch('/api/assessments/sessions', {
      headers: this.getHeaders(idToken),
    });

    const json: import('@ai-tutor/shared').AssessmentSessionListResponse = await res.json();
    if (!res.ok || !json.success || !json.data) {
      return [];
    }

    return json.data;
  }

  async getAssessmentSession(
    idToken: string,
    sessionId: string
  ): Promise<import('@ai-tutor/shared').AssessmentSession | null> {
    const res = await fetch(`/api/assessments/sessions/${sessionId}`, {
      headers: this.getHeaders(idToken),
    });

    const json: import('@ai-tutor/shared').AssessmentSessionResponse = await res.json();
    if (!res.ok || !json.success || !json.data) {
      return null;
    }

    return json.data;
  }

  async completeAssessmentSession(
    idToken: string,
    sessionId: string
  ): Promise<import('@ai-tutor/shared').AssessmentSession> {
    const res = await fetch(`/api/assessments/sessions/${sessionId}/complete`, {
      method: 'POST',
      headers: this.getHeaders(idToken),
    });

    const json: import('@ai-tutor/shared').AssessmentSessionResponse = await res.json();
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error?.message || `Failed to complete session (HTTP ${res.status})`);
    }

    return json.data;
  }

  async bookmarkQuestion(
    idToken: string,
    questionId: string,
    notes?: string
  ): Promise<import('@ai-tutor/shared').AssessmentBookmark> {
    const res = await fetch(`/api/assessments/questions/${questionId}/bookmark`, {
      method: 'POST',
      headers: this.getHeaders(idToken),
      body: JSON.stringify({ notes }),
    });

    const json: import('@ai-tutor/shared').AssessmentBookmarkResponse = await res.json();
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error?.message || `Failed to bookmark question (HTTP ${res.status})`);
    }

    return json.data;
  }

  async unbookmarkQuestion(
    idToken: string,
    questionId: string
  ): Promise<boolean> {
    const res = await fetch(`/api/assessments/questions/${questionId}/bookmark`, {
      method: 'DELETE',
      headers: this.getHeaders(idToken),
    });

    const json = await res.json();
    return Boolean(json.success);
  }

  async getBookmarks(
    idToken: string
  ): Promise<import('@ai-tutor/shared').AssessmentBookmark[]> {
    const res = await fetch('/api/assessments/bookmarks', {
      headers: this.getHeaders(idToken),
    });

    const json: import('@ai-tutor/shared').AssessmentBookmarkListResponse = await res.json();
    if (!res.ok || !json.success || !json.data) {
      return [];
    }

    return json.data;
  }

  async isQuestionBookmarked(
    idToken: string,
    questionId: string
  ): Promise<boolean> {
    const res = await fetch(`/api/assessments/questions/${questionId}/bookmark`, {
      headers: this.getHeaders(idToken),
    });

    const json = await res.json();
    return Boolean(json.data?.bookmarked);
  }

  async getWrongQuestions(
    idToken: string
  ): Promise<import('@ai-tutor/shared').WrongAssessmentQuestion[]> {
    const res = await fetch('/api/assessments/wrong', {
      headers: this.getHeaders(idToken),
    });

    const json: import('@ai-tutor/shared').WrongQuestionListResponse = await res.json();
    if (!res.ok || !json.success || !json.data) {
      return [];
    }

    return json.data;
  }

  async getDueReviews(
    idToken: string
  ): Promise<import('@ai-tutor/shared').WrongAssessmentQuestion[]> {
    const res = await fetch('/api/assessments/reviews/due', {
      headers: this.getHeaders(idToken),
    });

    const json: import('@ai-tutor/shared').WrongQuestionListResponse = await res.json();
    if (!res.ok || !json.success || !json.data) {
      return [];
    }

    return json.data;
  }

  async getTeachingSession(
    idToken: string,
    sessionId: string
  ): Promise<{ session: TeachingSession; context: import('@ai-tutor/shared').TutorSessionContext } | null> {
    const res = await fetch(`/api/teaching/sessions/${sessionId}`, {
      headers: this.getHeaders(idToken),
    });

    const json: ApiResponse<{ session: TeachingSession; context: import('@ai-tutor/shared').TutorSessionContext }> = await res.json();
    if (!res.ok || !json.success || !json.data) {
      return null;
    }

    return json.data;
  }

  async listTeachingSessions(
    idToken: string
  ): Promise<TeachingSession[]> {
    const res = await fetch('/api/teaching/sessions', {
      headers: this.getHeaders(idToken),
    });

    const json: ApiResponse<TeachingSession[]> = await res.json();
    if (!res.ok || !json.success || !json.data) {
      return [];
    }

    return json.data;
  }

  async updateTeachingSession(
    idToken: string,
    sessionId: string,
    data: import('@ai-tutor/shared').UpdateSessionRequest
  ): Promise<TeachingSession | null> {
    const res = await fetch(`/api/teaching/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: this.getHeaders(idToken),
      body: JSON.stringify(data),
    });

    const json: ApiResponse<TeachingSession> = await res.json();
    if (!res.ok || !json.success || !json.data) {
      return null;
    }

    return json.data;
  }

  async resumeTeachingSession(
    idToken: string,
    sessionId: string
  ): Promise<{ session: TeachingSession; context: import('@ai-tutor/shared').TutorSessionContext }> {
    const res = await fetch(`/api/teaching/sessions/${sessionId}/resume`, {
      method: 'POST',
      headers: this.getHeaders(idToken),
    });

    const json: ApiResponse<{ session: TeachingSession; context: import('@ai-tutor/shared').TutorSessionContext }> = await res.json();
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error?.message || `Failed to resume session (HTTP ${res.status})`);
    }

    return json.data;
  }

  async getQuestion(
    idToken: string,
    questionId: string
  ): Promise<import('@ai-tutor/shared').ClientAssessmentQuestion> {
    const res = await fetch(`/api/assessments/questions/${questionId}`, {
      headers: this.getHeaders(idToken),
    });

    const json: ApiResponse<import('@ai-tutor/shared').ClientAssessmentQuestion> = await res.json();
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error?.message || `Failed to fetch question (HTTP ${res.status})`);
    }

    return json.data;
  }

  async getQuestionHistory(
    idToken: string,
    filter?: { subject?: string; concept?: string; sessionId?: string }
  ): Promise<Array<{ question: import('@ai-tutor/shared').AssessmentQuestion; latestSubmission?: import('@ai-tutor/shared').AssessmentSubmission }>> {
    const params = new URLSearchParams();
    if (filter?.subject) params.append('subject', filter.subject);
    if (filter?.concept) params.append('concept', filter.concept);
    if (filter?.sessionId) params.append('sessionId', filter.sessionId);

    const res = await fetch(`/api/assessments/history?${params.toString()}`, {
      headers: this.getHeaders(idToken),
    });

    const json: ApiResponse<Array<{ question: import('@ai-tutor/shared').AssessmentQuestion; latestSubmission?: import('@ai-tutor/shared').AssessmentSubmission }>> = await res.json();
    if (!res.ok || !json.success || !json.data) {
      return [];
    }

    return json.data;
  }

  async getAssessmentAnalytics(
    idToken: string
  ): Promise<import('@ai-tutor/shared').AssessmentAnalytics | null> {
    const res = await fetch('/api/assessments/analytics', {
      headers: this.getHeaders(idToken),
    });

    const json: import('@ai-tutor/shared').AssessmentAnalyticsResponse = await res.json();
    if (!res.ok || !json.success || !json.data) {
      return null;
    }

    return json.data;
  }
}

export const liveTutorApiClient = new LiveTutorApiClient();

