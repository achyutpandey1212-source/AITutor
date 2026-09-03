import type { TeacherResponse, TeachingState } from '@ai-tutor/shared';

export interface AssessmentTriggerCheckParams {
  studentMessage: string;
  currentMode: string;
  assessmentStatus?: string;
  teachingState: TeachingState;
  conversationHistory: Array<{ role: string; type?: string; questionId?: string }>;
  teacherResponse?: TeacherResponse;
  isMistakeDue?: boolean;
}

export interface AssessmentTriggerResult {
  shouldAssess: boolean;
  questionType: 'MCQ' | 'SHORT_ANSWER' | 'LONG_ANSWER' | 'NUMERICAL' | 'IMAGE_SOLUTION';
  difficulty: 'easy' | 'medium' | 'hard';
  reason: string;
}

/**
 * Deterministically evaluates whether the AssessmentEngine should be invoked.
 * Combines explicit student requests, pedagogical state heuristics, turn intervals,
 * and LLM recommendations while strictly preventing re-triggering during active assessments.
 */
export function evaluateAssessmentTrigger(params: {
  studentMessage: string;
  currentMode: string;
  assessmentStatus?: string;
  teachingState: TeachingState;
  conversationHistory: Array<{ role: string; type?: string; questionId?: string }>;
  teacherResponse?: TeacherResponse;
  isMistakeDue?: boolean;
}): AssessmentTriggerResult {
  const {
    studentMessage,
    currentMode,
    assessmentStatus,
    teachingState,
    conversationHistory,
    teacherResponse,
    isMistakeDue,
  } = params;

  // 1. GUARD: Never trigger a new assessment if an assessment is already active or waiting for answer
  if (currentMode === 'ASSESSMENT' || assessmentStatus === 'WAITING_FOR_STUDENT' || assessmentStatus === 'GENERATING') {
    return {
      shouldAssess: false,
      questionType: 'MCQ',
      difficulty: 'medium',
      reason: 'assessment_already_active',
    };
  }

  // 1b. GUARD: Teacher asking a conversational question in teaching dialogue must NEVER trigger formal assessment
  if (teacherResponse?.action?.type === 'ASK_CONVERSATIONAL') {
    return {
      shouldAssess: false,
      questionType: 'MCQ',
      difficulty: 'medium',
      reason: 'conversational_question_not_assessment',
    };
  }

  const normalizedMsg = studentMessage.trim().toLowerCase();

  // Helper to determine question type from text context
  const inferQuestionType = (text: string): 'MCQ' | 'SHORT_ANSWER' | 'LONG_ANSWER' | 'NUMERICAL' | 'IMAGE_SOLUTION' => {
    if (/\b(diagram|draw|graph|circuit|ray diagram|sketch|on paper|handwritten)\b/i.test(text)) {
      return 'IMAGE_SOLUTION';
    }
    if (/\b(numerical|calculate|formula|value of|solve for|math|equation)\b/i.test(text)) {
      return 'NUMERICAL';
    }
    if (/\b(short answer|explain briefly|one sentence|define)\b/i.test(text)) {
      return 'SHORT_ANSWER';
    }
    return 'MCQ';
  };

  // Helper to determine difficulty based on current confidence
  const inferDifficulty = (state: TeachingState): 'easy' | 'medium' | 'hard' => {
    if (state.confidence < 0.4 || state.understanding === 'weak') return 'easy';
    if (state.confidence > 0.75 && state.understanding === 'strong') return 'hard';
    return 'medium';
  };

  // 2. TRIGGER A: Student explicitly asks for a question/test/quiz/practice
  const explicitRequestRegex = /\b(ask (me )?(a )?(question|problem|mcq|numerical)|test me|quiz me|give me (a |an )?(question|problem|mcq|numerical)|practice (a |some )?(question|problem)|check my understanding|check if i understand)\b/i;
  if (explicitRequestRegex.test(normalizedMsg)) {
    return {
      shouldAssess: true,
      questionType: inferQuestionType(normalizedMsg),
      difficulty: inferDifficulty(teachingState),
      reason: 'student_explicit_request',
    };
  }

  // 3. TRIGGER B: Due mistake review needs reinforcement
  if (isMistakeDue) {
    return {
      shouldAssess: true,
      questionType: 'MCQ',
      difficulty: inferDifficulty(teachingState),
      reason: 'due_mistake_review',
    };
  }

  // 4. TRIGGER C: TeacherEngine explicitly recommended an assessment
  if (teacherResponse?.action?.type === 'ASK_ASSESSMENT') {
    return {
      shouldAssess: true,
      questionType: teacherResponse.action.questionType || inferQuestionType(teachingState.currentConcept),
      difficulty: teacherResponse.action.difficulty || inferDifficulty(teachingState),
      reason: teacherResponse.action.reason || 'teacher_engine_recommendation',
    };
  }

  const isTeacherAskingConversational =
    teacherResponse?.intent === 'question' ||
    (typeof teacherResponse?.responseText === 'string' && /\?\s*$/i.test(teacherResponse.responseText.trim()));

  // 5. TRIGGER D: Weak understanding or recommendedNextAction is 'ask_question' (when not in conversational dialogue)
  if (!isTeacherAskingConversational && (teachingState.recommendedNextAction === 'ask_question' || teachingState.understanding === 'weak')) {
    // Check if we haven't assessed in the last 2 turns
    const recentAssessments = conversationHistory
      .slice(-3)
      .filter((t) => t.type === 'assessment' || Boolean(t.questionId));

    if (recentAssessments.length === 0) {
      return {
        shouldAssess: true,
        questionType: 'MCQ',
        difficulty: 'easy',
        reason: 'weak_understanding_check',
      };
    }
  }

  // 6. TRIGGER E: Periodic concept validation (> 5 student-tutor conversation turns without an assessment, when not in conversational dialogue)
  const turnsSinceLastAssessment = [...conversationHistory].reverse().findIndex((t) => t.type === 'assessment' || Boolean(t.questionId));
  const effectiveTurnsCount = turnsSinceLastAssessment === -1 ? conversationHistory.length : turnsSinceLastAssessment;

  if (!isTeacherAskingConversational && effectiveTurnsCount >= 6 && conversationHistory.length >= 6) {
    return {
      shouldAssess: true,
      questionType: inferQuestionType(teachingState.currentConcept),
      difficulty: inferDifficulty(teachingState),
      reason: 'periodic_concept_check',
    };
  }

  return {
    shouldAssess: false,
    questionType: 'MCQ',
    difficulty: 'medium',
    reason: 'none',
  };
}
