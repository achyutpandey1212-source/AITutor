import type {
  AssessmentEvaluationMode,
  AssessmentQuestion,
  AssessmentSubmission,
  EvaluationFailureReason,
  EvaluationResult,
  RecommendedAction,
  StepEvaluation,
} from '@ai-tutor/shared';
import { EvaluationResultSchema } from '@ai-tutor/shared';
import type { RawAIEvaluationData } from './evaluation.types.js';

export class EvaluationNormalizer {
  /**
   * Deterministically normalizes raw AI evaluation data into a valid EvaluationResult contract.
   */
  static normalize(
    raw: RawAIEvaluationData,
    question: AssessmentQuestion,
    submission: AssessmentSubmission,
    evaluationMode: AssessmentEvaluationMode | 'DETERMINISTIC'
  ): EvaluationResult {
    const maxScore = question.marks || 1;
    let score = typeof raw.score === 'number' ? Math.max(0, Math.min(raw.score, maxScore)) : 0;
    const confidence = typeof raw.confidence === 'number' ? Math.max(0, Math.min(raw.confidence, 1.0)) : 1.0;

    // Determine status
    let evaluationStatus: 'EVALUATED' | 'NEEDS_REVIEW' | 'FAILED' = 'EVALUATED';
    if (
      confidence < 0.5 ||
      raw.recommendedAction === 'NEEDS_REVIEW' ||
      (raw.failureReason && raw.failureReason !== 'NONE')
    ) {
      evaluationStatus = 'NEEDS_REVIEW';
    }

    const percentage = Math.round((score / maxScore) * 100);
    const correct = typeof raw.correct === 'boolean' ? raw.correct : percentage >= 80;

    // Determine failureReason
    let failureReason: EvaluationFailureReason = 'NONE';
    if (evaluationStatus === 'NEEDS_REVIEW') {
      if (
        raw.failureReason &&
        [
          'IMAGE_UNREADABLE',
          'IMAGE_INCOMPLETE',
          'PROVIDER_UNAVAILABLE',
          'MODEL_FAILURE',
          'TIMEOUT',
          'MALFORMED_OUTPUT',
          'LOW_CONFIDENCE',
          'NONE',
        ].includes(raw.failureReason)
      ) {
        failureReason = raw.failureReason;
      } else {
        failureReason = 'LOW_CONFIDENCE';
      }
    }

    // Normalize recommendedAction
    let recommendedAction: RecommendedAction = 'CONTINUE';
    if (evaluationStatus === 'NEEDS_REVIEW') {
      recommendedAction = 'NEEDS_REVIEW';
    } else if (
      raw.recommendedAction &&
      [
        'CONTINUE',
        'INCREASE_DIFFICULTY',
        'TARGETED_PRACTICE',
        'REMEDIAL_PRACTICE',
        'RETRY',
        'NEEDS_REVIEW',
      ].includes(raw.recommendedAction)
    ) {
      recommendedAction = raw.recommendedAction as RecommendedAction;
    } else {
      if (percentage >= 85) {
        recommendedAction = 'INCREASE_DIFFICULTY';
      } else if (percentage <= 50) {
        recommendedAction =
          raw.misconceptions && raw.misconceptions.length > 0
            ? 'REMEDIAL_PRACTICE'
            : 'TARGETED_PRACTICE';
      } else {
        recommendedAction = 'CONTINUE';
      }
    }

    // Normalize StepEvaluations
    const stepEvaluation: StepEvaluation[] = [];
    if (Array.isArray(raw.stepEvaluation) && raw.stepEvaluation.length > 0) {
      raw.stepEvaluation.forEach((step, idx) => {
        const stepStatus = ['correct', 'partially_correct', 'incorrect', 'unclear'].includes(step.status)
          ? step.status
          : 'correct';
        stepEvaluation.push({
          step: step.step || idx + 1,
          criterion: step.criterion || undefined,
          status: stepStatus,
          score: typeof step.score === 'number' ? Math.max(0, step.score) : undefined,
          maxScore: typeof step.maxScore === 'number' ? Math.max(0, step.maxScore) : undefined,
          feedback: step.feedback || 'Evaluated step.',
        });
      });
    }

    // Concept assessment breakdown
    const conceptAssessment = raw.conceptAssessment || {
      understanding: correct ? 'strong' : percentage >= 50 ? 'moderate' : 'weak',
      methodSelection: 'strong',
      calculation: percentage < 100 && evaluationMode === 'NUMERICAL' ? 'weak' : 'strong',
    };

    // Construct student friendly feedback
    let feedback = (raw.feedback || '').trim();
    if (!feedback) {
      if (evaluationStatus === 'NEEDS_REVIEW') {
        if (failureReason === 'TIMEOUT') {
          feedback =
            'Our evaluation service timed out while analyzing your handwritten solution. Your submission is saved securely. Please try checking again in a moment.';
        } else if (failureReason === 'PROVIDER_UNAVAILABLE') {
          feedback =
            'Our AI evaluation provider is temporarily unavailable. Your solution is saved securely. Please check back shortly.';
        } else {
          feedback =
            'Your solution is partly difficult to read. Please upload a clear, well-lit photo of your notebook page with all steps visible.';
        }
      } else if (correct) {
        feedback = `Excellent job! You earned ${score}/${maxScore} marks. Your solution is correct and well explained.`;
      } else if (percentage >= 50) {
        feedback = `Good attempt! You scored ${score}/${maxScore} marks. Let's review the intermediate steps to polish your accuracy.`;
      } else {
        feedback = `You scored ${score}/${maxScore} marks. Let's practice this concept to strengthen your core understanding.`;
      }
    }

    const result: EvaluationResult = {
      questionId: question.questionId,
      submissionId: submission.id,
      correct,
      score,
      maxScore,
      percentage,
      evaluationStatus,
      evaluationMode,
      stepEvaluation: stepEvaluation.length > 0 ? stepEvaluation : undefined,
      conceptAssessment: {
        understanding: conceptAssessment.understanding || 'moderate',
        methodSelection: conceptAssessment.methodSelection || undefined,
        calculation: conceptAssessment.calculation || undefined,
        completeness: conceptAssessment.completeness || undefined,
        reasoning: conceptAssessment.reasoning || undefined,
      },
      misconceptions: Array.isArray(raw.misconceptions) ? raw.misconceptions.filter(Boolean) : [],
      strengths: Array.isArray(raw.strengths) ? raw.strengths.filter(Boolean) : [],
      weaknesses: Array.isArray(raw.weaknesses) ? raw.weaknesses.filter(Boolean) : [],
      recommendedAction,
      failureReason,
      confidence,
      feedback,
      evaluatedAt: new Date().toISOString(),
    };

    return EvaluationResultSchema.parse(result);
  }
}
