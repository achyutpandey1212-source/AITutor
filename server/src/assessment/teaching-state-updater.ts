import type {
  AssessmentQuestion,
  EvaluationResult,
  LearnerAssessmentState,
  LearnerConceptMastery,
  LearnerConceptSkills,
  RecentPerformanceItem,
} from '@ai-tutor/shared';
import { LearnerAssessmentStateSchema } from '@ai-tutor/shared';
import { LearnerAssessmentStateModel } from '../models/learner-assessment-state.model.js';

export interface MasteryPolicyConfig {
  previousWeight: number; // default: 0.75
  currentWeight: number; // default: 0.25
  highConfidenceThreshold: number; // default: 0.75
  mediumConfidenceThreshold: number; // default: 0.50
  maxHistoryLength: number; // default: 5
}

export const DEFAULT_MASTERY_POLICY: MasteryPolicyConfig = {
  previousWeight: 0.75,
  currentWeight: 0.25,
  highConfidenceThreshold: 0.75,
  mediumConfidenceThreshold: 0.50,
  maxHistoryLength: 5,
};

export class TeachingStateUpdater {
  private policy: MasteryPolicyConfig;

  constructor(customPolicy?: Partial<MasteryPolicyConfig>) {
    this.policy = { ...DEFAULT_MASTERY_POLICY, ...customPolicy };
  }

  /**
   * Retrieves the current LearnerAssessmentState for a user, or initializes an empty state.
   */
  async getLearnerState(userId: string): Promise<LearnerAssessmentState> {
    const doc = await LearnerAssessmentStateModel.findOne({ userId });
    if (!doc) {
      return {
        userId,
        concepts: {},
        updatedAt: new Date().toISOString(),
      };
    }

    const conceptsObj: Record<string, LearnerConceptMastery> = {};
    if (doc.concepts) {
      for (const [key, value] of (doc.concepts as any).entries()) {
        conceptsObj[key] = value;
      }
    }

    return LearnerAssessmentStateSchema.parse({
      userId: doc.userId,
      concepts: conceptsObj,
      overallMastery: doc.overallMastery,
      updatedAt: doc.updatedAt.toISOString(),
    });
  }

  /**
   * Deterministically updates a student's concept mastery and skill metrics based on an EvaluationResult.
   */
  async updateStateFromEvaluation(
    userId: string,
    question: AssessmentQuestion,
    evaluation: EvaluationResult
  ): Promise<LearnerAssessmentState> {
    const currentState = await this.getLearnerState(userId);
    const conceptName = question.concept;

    // Get or initialize concept mastery
    const existingMastery: LearnerConceptMastery = currentState.concepts[conceptName] || {
      concept: conceptName,
      subject: question.subject,
      mastery: 0.5,
      confidence: 0.5,
      skills: {
        understanding: 0.5,
        method_selection: 0.5,
      },
      recentPerformance: [],
      misconceptions: [],
    };

    const updatedConceptMastery = this.computeUpdatedConceptMastery(
      existingMastery,
      question,
      evaluation
    );

    currentState.concepts[conceptName] = updatedConceptMastery;

    // Compute overall mastery average
    const conceptValues = Object.values(currentState.concepts) as LearnerConceptMastery[];
    const totalMastery = conceptValues.reduce((sum: number, c: LearnerConceptMastery) => sum + c.mastery, 0);
    currentState.overallMastery =
      conceptValues.length > 0 ? Number((totalMastery / conceptValues.length).toFixed(2)) : 0.5;
    currentState.updatedAt = new Date().toISOString();

    // Persist to MongoDB
    await LearnerAssessmentStateModel.findOneAndUpdate(
      { userId },
      {
        userId,
        concepts: currentState.concepts,
        overallMastery: currentState.overallMastery,
      },
      { upsert: true, new: true }
    );

    return currentState;
  }

  /**
   * Pure deterministic calculation of updated concept mastery according to confidence gate and skill breakdown.
   */
  public computeUpdatedConceptMastery(
    previous: LearnerConceptMastery,
    question: AssessmentQuestion,
    evaluation: EvaluationResult
  ): LearnerConceptMastery {
    const confidence = typeof evaluation.confidence === 'number' ? evaluation.confidence : 1.0;
    const scoreFrac = Math.max(0, Math.min(1.0, evaluation.percentage / 100));

    // 1. Confidence Safeguard Check:
    // If evaluation has low confidence (< 0.5) or is marked NEEDS_REVIEW, DO NOT penalize mastery!
    if (confidence < this.policy.mediumConfidenceThreshold || evaluation.evaluationStatus === 'NEEDS_REVIEW') {
      console.info(
        `[TeachingStateUpdater] Low confidence evaluation (${confidence.toFixed(
          2
        )}). Skipping mastery update to protect student profile.`
      );
      return {
        ...previous,
        confidence: Number(
          (previous.confidence * 0.8 + confidence * 0.2).toFixed(2)
        ),
        lastEvaluatedAt: evaluation.evaluatedAt,
      };
    }

    // 2. Determine effective weight based on confidence:
    let effectiveCurrentWeight = this.policy.currentWeight;
    if (confidence < this.policy.highConfidenceThreshold) {
      // Medium confidence: apply cautious / dampened update
      effectiveCurrentWeight = this.policy.currentWeight * 0.5;
    }
    const effectivePrevWeight = 1.0 - effectiveCurrentWeight;

    // 3. Compute new mastery (bounded between 0.0 and 1.0)
    const newMastery = Number(
      Math.max(0, Math.min(1.0, previous.mastery * effectivePrevWeight + scoreFrac * effectiveCurrentWeight)).toFixed(
        2
      )
    );

    // 4. Update Skills Breakdown
    const updatedSkills: LearnerConceptSkills = { ...previous.skills };
    const conceptAssess = evaluation.conceptAssessment || { understanding: 'moderate' };

    // Understanding
    if (conceptAssess.understanding === 'strong') {
      updatedSkills.understanding = Number(
        Math.min(1.0, (updatedSkills.understanding || 0.5) * 0.7 + 1.0 * 0.3).toFixed(2)
      );
    } else if (conceptAssess.understanding === 'weak') {
      updatedSkills.understanding = Number(
        Math.max(0.0, (updatedSkills.understanding || 0.5) * 0.7 + 0.2 * 0.3).toFixed(2)
      );
    } else {
      updatedSkills.understanding = Number(
        ((updatedSkills.understanding || 0.5) * 0.7 + 0.6 * 0.3).toFixed(2)
      );
    }

    // Method Selection
    if (conceptAssess.methodSelection === 'strong') {
      updatedSkills.method_selection = Number(
        Math.min(1.0, (updatedSkills.method_selection || 0.5) * 0.7 + 1.0 * 0.3).toFixed(2)
      );
    } else if (conceptAssess.methodSelection === 'weak') {
      updatedSkills.method_selection = Number(
        Math.max(0.0, (updatedSkills.method_selection || 0.5) * 0.7 + 0.2 * 0.3).toFixed(2)
      );
    }

    // Calculation (for numerical / image math)
    if (question.questionType === 'NUMERICAL' || question.evaluationMode === 'IMAGE_SOLUTION') {
      const isCalcWeak =
        conceptAssess.calculation === 'weak' ||
        (evaluation.stepEvaluation &&
          evaluation.stepEvaluation.some(
            (s) => s.status === 'incorrect' && (s.feedback.toLowerCase().includes('arithmetic') || s.feedback.toLowerCase().includes('calculation'))
          ));

      const calcCurrent = updatedSkills.calculation ?? 0.5;
      if (isCalcWeak) {
        updatedSkills.calculation = Number(Math.max(0.1, calcCurrent * 0.5 + 0.15 * 0.5).toFixed(2));
      } else if (evaluation.correct) {
        updatedSkills.calculation = Number(Math.min(1.0, calcCurrent * 0.7 + 1.0 * 0.3).toFixed(2));
      }
    }

    // 5. Update Misconceptions List
    const misconceptionsSet = new Set(previous.misconceptions || []);
    if (evaluation.misconceptions && evaluation.misconceptions.length > 0) {
      for (const m of evaluation.misconceptions) {
        misconceptionsSet.add(m);
      }
    }
    // If student achieved 100% on a hard/medium problem, clear older misconceptions
    if (evaluation.percentage === 100 && (question.difficulty === 'medium' || question.difficulty === 'hard')) {
      misconceptionsSet.clear();
    }

    // 6. Update Recent Performance Rolling History
    const historyItem: RecentPerformanceItem = {
      questionId: question.questionId,
      difficulty: question.difficulty,
      scorePercentage: evaluation.percentage,
      evaluatedAt: evaluation.evaluatedAt,
      questionType: question.questionType,
    };

    const newHistory = [historyItem, ...(previous.recentPerformance || [])].slice(
      0,
      this.policy.maxHistoryLength
    );

    return {
      concept: previous.concept,
      subject: question.subject || previous.subject,
      mastery: newMastery,
      confidence: Number(
        Math.max(0.1, Math.min(1.0, previous.confidence * 0.7 + confidence * 0.3)).toFixed(2)
      ),
      skills: updatedSkills,
      recentPerformance: newHistory,
      misconceptions: Array.from(misconceptionsSet),
      lastEvaluatedAt: evaluation.evaluatedAt,
    };
  }
}

export const teachingStateUpdater = new TeachingStateUpdater();
