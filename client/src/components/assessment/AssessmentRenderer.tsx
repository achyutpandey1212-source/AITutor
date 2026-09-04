import React from 'react';
import type { ClientAssessmentQuestion, AssessmentSubmission } from '@ai-tutor/shared';
import { MCQQuestion } from './MCQQuestion';
import { ShortAnswerQuestion } from './ShortAnswerQuestion';
import { LongAnswerQuestion } from './LongAnswerQuestion';
import { NumericalQuestion } from './NumericalQuestion';
import { ImageSolutionQuestion } from './ImageSolutionQuestion';

export interface AssessmentRendererProps {
  question: ClientAssessmentQuestion;
  idToken: string;
  onSubmitted?: (submission: AssessmentSubmission) => void;
  initialSubmission?: AssessmentSubmission | null;
  sessionId?: string;
  questionStartedAt?: string;
  hideEvaluation?: boolean;
  onAskLumo?: (doubtContext: {
    question?: string;
    feedback?: string;
    misconception?: string;
  }) => void;
}

/**
 * Central AssessmentRenderer component.
 * Deterministically delegates to the appropriate specialized question component
 * based on the validated question contract.
 */
export const AssessmentRenderer: React.FC<AssessmentRendererProps> = ({
  question,
  idToken,
  onSubmitted,
  initialSubmission,
  sessionId: _sessionId,
  questionStartedAt: _questionStartedAt,
  hideEvaluation = false,
  onAskLumo,
}) => {
  // If evaluationMode is IMAGE_SOLUTION (e.g. 5-mark Numerical or ImageSolution), route to ImageSolutionQuestion
  if (question.evaluationMode === 'IMAGE_SOLUTION' || question.questionType === 'IMAGE_SOLUTION') {
    return (
      <ImageSolutionQuestion
        question={question}
        idToken={idToken}
        onSubmitted={onSubmitted}
        initialSubmission={initialSubmission}
        hideEvaluation={hideEvaluation}
        onAskLumo={onAskLumo}
      />
    );
  }

  switch (question.questionType) {
    case 'MCQ':
      return (
        <MCQQuestion
          question={question}
          idToken={idToken}
          onSubmitted={onSubmitted}
          initialSubmission={initialSubmission}
          hideEvaluation={hideEvaluation}
          onAskLumo={onAskLumo}
        />
      );

    case 'SHORT_ANSWER':
      return (
        <ShortAnswerQuestion
          question={question}
          idToken={idToken}
          onSubmitted={onSubmitted}
          initialSubmission={initialSubmission}
          hideEvaluation={hideEvaluation}
          onAskLumo={onAskLumo}
        />
      );

    case 'LONG_ANSWER':
      return (
        <LongAnswerQuestion
          question={question}
          idToken={idToken}
          onSubmitted={onSubmitted}
          initialSubmission={initialSubmission}
          hideEvaluation={hideEvaluation}
          onAskLumo={onAskLumo}
        />
      );

    case 'NUMERICAL':
      return (
        <NumericalQuestion
          question={question}
          idToken={idToken}
          onSubmitted={onSubmitted}
          initialSubmission={initialSubmission}
          hideEvaluation={hideEvaluation}
          onAskLumo={onAskLumo}
        />
      );

    default:
      return (
        <div style={{ padding: '16px', background: 'var(--color-surface)', color: 'var(--color-danger, #ef4444)', borderRadius: '8px' }}>
          Unsupported question type: {(question as any).questionType}
        </div>
      );
  }
};
