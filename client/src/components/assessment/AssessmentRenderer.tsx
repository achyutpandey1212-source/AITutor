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
}) => {
  // If evaluationMode is IMAGE_SOLUTION (e.g. 5-mark Numerical or ImageSolution), route to ImageSolutionQuestion
  if (question.evaluationMode === 'IMAGE_SOLUTION' || question.questionType === 'IMAGE_SOLUTION') {
    return (
      <ImageSolutionQuestion
        question={question}
        idToken={idToken}
        onSubmitted={onSubmitted}
        initialSubmission={initialSubmission}
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
        />
      );

    case 'SHORT_ANSWER':
      return (
        <ShortAnswerQuestion
          question={question}
          idToken={idToken}
          onSubmitted={onSubmitted}
          initialSubmission={initialSubmission}
        />
      );

    case 'LONG_ANSWER':
      return (
        <LongAnswerQuestion
          question={question}
          idToken={idToken}
          onSubmitted={onSubmitted}
          initialSubmission={initialSubmission}
        />
      );

    case 'NUMERICAL':
      return (
        <NumericalQuestion
          question={question}
          idToken={idToken}
          onSubmitted={onSubmitted}
          initialSubmission={initialSubmission}
        />
      );

    default:
      return (
        <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '6px' }}>
          Unsupported question type: {(question as any).questionType}
        </div>
      );
  }
};
