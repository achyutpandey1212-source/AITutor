import type {
  AssessmentQuestion,
  AssessmentSubmission,
  EvaluationResult,
  KnowledgeContext,
  TeachingState,
} from '@ai-tutor/shared';
import { EvaluationResultSchema } from '@ai-tutor/shared';
import { textEvaluator } from './evaluation/text-evaluator.js';
import { numericalEvaluator } from './evaluation/numerical-evaluator.js';
import { imageSolutionEvaluator } from './evaluation/image-solution-evaluator.js';
import { EvaluationNormalizer } from './evaluation/evaluation-normalizer.js';
import { teachingStateUpdater } from './teaching-state-updater.js';
import { wrongQuestionService } from './wrong-question.service.js';
import { assessmentSessionService } from './assessment-session.service.js';
import { AssessmentSubmissionModel } from '../models/assessment-submission.model.js';

export class AssessmentEvaluatorService {
  /**
   * Main entry point to evaluate any student submission.
   */
  async evaluateSubmission(
    userId: string,
    question: AssessmentQuestion,
    submission: AssessmentSubmission,
    options?: {
      knowledgeContext?: KnowledgeContext;
      teachingState?: Partial<TeachingState>;
    }
  ): Promise<EvaluationResult> {
    const startTime = Date.now();
    let evaluationResult: EvaluationResult;

    // 1. Deterministic MCQ Evaluation (Zero LLM calls)
    if (question.questionType === 'MCQ') {
      evaluationResult = this.evaluateMCQ(question, submission);
    }
    // 2. Numerical Evaluation
    else if (question.questionType === 'NUMERICAL' && question.evaluationMode !== 'IMAGE_SOLUTION') {
      evaluationResult = await numericalEvaluator.evaluate({
        question,
        submission,
        knowledgeContext: options?.knowledgeContext,
        teachingState: options?.teachingState,
      });
    }
    // 3. Image Solution Evaluation (Handwritten multimodal inspection)
    else if (
      question.evaluationMode === 'IMAGE_SOLUTION' ||
      submission.questionType === 'IMAGE_SOLUTION'
    ) {
      evaluationResult = await imageSolutionEvaluator.evaluate({
        question,
        submission,
        knowledgeContext: options?.knowledgeContext,
        teachingState: options?.teachingState,
      });
    }
    // 4. Text Evaluation (Short Answer & Long Answer)
    else {
      evaluationResult = await textEvaluator.evaluate({
        question,
        submission,
        knowledgeContext: options?.knowledgeContext,
        teachingState: options?.teachingState,
      });
    }

    // 5. Update submission in database atomically by submission ID (or userId + questionId)
    try {
      if (submission.id && submission.id.length > 5) {
        await AssessmentSubmissionModel.findByIdAndUpdate(
          submission.id,
          {
            status: evaluationResult.evaluationStatus,
            score: evaluationResult.score,
            feedback: evaluationResult.feedback,
            evaluation: evaluationResult,
          }
        );
      } else {
        await AssessmentSubmissionModel.findOneAndUpdate(
          { userId, questionId: question.questionId },
          {
            status: evaluationResult.evaluationStatus,
            score: evaluationResult.score,
            feedback: evaluationResult.feedback,
            evaluation: evaluationResult,
          },
          { sort: { createdAt: -1 } }
        );
      }
    } catch {
      // In-memory or fallback
    }

    // 6. Update student's persistent concept mastery & skill metrics deterministically
    await teachingStateUpdater.updateStateFromEvaluation(
      userId,
      question,
      evaluationResult
    );

    // 7. M7 Phase 4: Wrong Question Tracking & Mastery Resolution
    if (evaluationResult.correct && evaluationResult.percentage >= 75) {
      await wrongQuestionService.resolveCorrectReattempt(userId, question.questionId);
    } else if (
      !evaluationResult.correct &&
      evaluationResult.evaluationStatus === 'EVALUATED' &&
      (!evaluationResult.failureReason || evaluationResult.failureReason === 'NONE')
    ) {
      await wrongQuestionService.recordWrongQuestion(userId, question, submission, evaluationResult);
    }

    // 8. M7 Phase 4: Assessment Session Progress Update
    if (submission.sessionId) {
      await assessmentSessionService.updateSessionProgress(
        userId,
        submission.sessionId,
        evaluationResult.score,
        evaluationResult.maxScore,
        evaluationResult.correct
      );
    }

    console.info(
      `[AssessmentEvaluator] Evaluated question=${question.questionId} type=${question.questionType} status=${
        evaluationResult.evaluationStatus
      } score=${evaluationResult.score}/${evaluationResult.maxScore} durationMs=${Date.now() - startTime}`
    );

    return EvaluationResultSchema.parse(evaluationResult);
  }

  /**
   * Deterministically evaluates an MCQ submission without calling LLMs.
   */
  private evaluateMCQ(
    question: AssessmentQuestion,
    submission: AssessmentSubmission
  ): EvaluationResult {
    const selected = (submission.selectedOption || '').trim().toUpperCase();
    const correct = (question.correctOptionId || '').trim().toUpperCase();
    const maxScore = question.marks || 1;

    const isCorrect = Boolean(selected && correct && selected === correct);
    const score = isCorrect ? maxScore : 0;
    const percentage = isCorrect ? 100 : 0;

    const feedback = isCorrect
      ? `Correct! Option ${selected} is the right answer.`
      : `Incorrect. You selected option ${selected || 'none'}, but the correct option is ${correct}.`;

    const raw = {
      correct: isCorrect,
      score,
      maxScore,
      confidence: 1.0,
      recommendedAction: isCorrect ? ('INCREASE_DIFFICULTY' as const) : ('TARGETED_PRACTICE' as const),
      feedback,
      conceptAssessment: {
        understanding: isCorrect ? ('strong' as const) : ('weak' as const),
        methodSelection: isCorrect ? ('strong' as const) : ('weak' as const),
      },
    };

    return EvaluationNormalizer.normalize(raw, question, submission, 'DETERMINISTIC');
  }
}

export const assessmentEvaluatorService = new AssessmentEvaluatorService();
