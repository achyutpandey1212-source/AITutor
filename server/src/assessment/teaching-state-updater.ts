import mongoose from 'mongoose';
import type {
  AssessmentQuestion,
  EvaluationResult,
  LearnerAssessmentState,
  LearnerConceptMastery,
  LearnerConceptSkills,
} from '@ai-tutor/shared';
import { LearnerAssessmentStateSchema } from '@ai-tutor/shared';
import { LearnerAssessmentStateModel } from '../models/learner-assessment-state.model.js';

export interface MasteryPolicyConfig {
  learningRate: number; // EMA alpha weight for recent performance (e.g. 0.35)
  understandingWeight: number;
  methodSelectionWeight: number;
  minConfidenceThreshold: number; // Minimum confidence to accept evaluation updates
  currentWeight?: number;
  previousWeight?: number;
  highConfidenceThreshold?: number;
  mediumConfidenceThreshold?: number;
  maxHistoryLength?: number;
}

export const DEFAULT_MASTERY_POLICY: MasteryPolicyConfig = {
  learningRate: 0.35,
  understandingWeight: 0.4,
  methodSelectionWeight: 0.3,
  minConfidenceThreshold: 0.5,
};

export class TeachingStateUpdater {
  private policy: MasteryPolicyConfig;
  private inMemoryStates = new Map<string, LearnerAssessmentState>();

  constructor(customPolicy?: Partial<MasteryPolicyConfig> & { currentWeight?: number; previousWeight?: number }) {
    const learningRate = customPolicy?.learningRate ?? customPolicy?.currentWeight ?? DEFAULT_MASTERY_POLICY.learningRate;
    this.policy = { ...DEFAULT_MASTERY_POLICY, ...customPolicy, learningRate };
  }

  private isMongoConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Retrieves the current LearnerAssessmentState for a user, or initializes an empty state.
   */
  async getLearnerState(userId: string): Promise<LearnerAssessmentState> {
    if (this.isMongoConnected()) {
      try {
        const doc = await LearnerAssessmentStateModel.findOne({ userId });
        if (doc) {
          const conceptsObj: Record<string, LearnerConceptMastery> = {};
          if (doc.concepts) {
            if (doc.concepts instanceof Map || typeof (doc.concepts as any).entries === 'function') {
              for (const [key, value] of (doc.concepts as any).entries()) {
                conceptsObj[key] = value;
              }
            } else {
              Object.assign(conceptsObj, doc.concepts);
            }
          }

          return LearnerAssessmentStateSchema.parse({
            userId: doc.userId,
            concepts: conceptsObj,
            overallMastery: doc.overallMastery,
            updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString(),
          });
        }
      } catch {
        // fallback
      }
    }

    const inMem = this.inMemoryStates.get(userId);
    if (inMem) return inMem;

    return {
      userId,
      concepts: {},
      updatedAt: new Date().toISOString(),
    };
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

    if (this.isMongoConnected()) {
      try {
        await LearnerAssessmentStateModel.findOneAndUpdate(
          { userId },
          {
            userId,
            concepts: currentState.concepts,
            overallMastery: currentState.overallMastery,
          },
          { upsert: true, new: true }
        );
      } catch {
        this.inMemoryStates.set(userId, currentState);
      }
    } else {
      this.inMemoryStates.set(userId, currentState);
    }

    return currentState;
  }

  /**
   * Pure deterministic calculation of updated concept mastery according to confidence gate and skill breakdown.
   */
  public computeUpdatedConceptMastery(
    current: LearnerConceptMastery,
    question: AssessmentQuestion,
    evaluation: EvaluationResult
  ): LearnerConceptMastery {
    // 1. Confidence Safeguard:
    // If evaluation failed or has low confidence, do NOT penalize or update learner state!
    if (
      evaluation.confidence < this.policy.minConfidenceThreshold ||
      evaluation.evaluationStatus === 'NEEDS_REVIEW' ||
      (evaluation.failureReason && evaluation.failureReason !== 'NONE')
    ) {
      console.warn(
        `[TeachingStateUpdater] Evaluation confidence low (${evaluation.confidence}) or NEEDS_REVIEW or failureReason=${evaluation.failureReason} on question ${question.questionId}. Skipping mastery degradation.`
      );
      return {
        ...current,
        confidence: Number((current.confidence * 0.9).toFixed(2)),
      };
    }

    // 2. Score Normalization
    const scoreFraction = Math.max(0, Math.min(1, evaluation.score / evaluation.maxScore));

    // 3. Update Skills Breakdown
    const updatedSkills: LearnerConceptSkills = { ...current.skills };
    if (evaluation.conceptAssessment) {
      const ca = evaluation.conceptAssessment;

      if (ca.understanding) {
        updatedSkills.understanding = this.updateSkillEMA(
          updatedSkills.understanding,
          ca.understanding
        );
      }
      if (ca.methodSelection) {
        updatedSkills.method_selection = this.updateSkillEMA(
          updatedSkills.method_selection,
          ca.methodSelection
        );
      }
      if (ca.calculation) {
        updatedSkills.calculation = this.updateSkillEMA(
          updatedSkills.calculation || 0.5,
          ca.calculation
        );
      }
      if (ca.reasoning) {
        updatedSkills.reasoning = this.updateSkillEMA(
          updatedSkills.reasoning || 0.5,
          ca.reasoning
        );
      }
      if (ca.completeness) {
        updatedSkills.completeness = this.updateSkillEMA(
          updatedSkills.completeness || 0.5,
          ca.completeness
        );
      }
    }

    // 4. Update Overall Mastery via Exponential Moving Average (EMA)
    // Difficulty weighting: solving a hard problem gives higher weight than an easy problem
    const difficultyMultiplier =
      question.difficulty === 'hard' ? 1.15 : question.difficulty === 'easy' ? 0.85 : 1.0;
    const adjustedPerformance = Math.min(1.0, scoreFraction * difficultyMultiplier);

    const newMastery =
      (1 - this.policy.learningRate) * current.mastery +
      this.policy.learningRate * adjustedPerformance;

    // 5. Update Misconceptions (deduplicate, max 10 recent)
    const existingMisconceptions = current.misconceptions || [];
    const newMisconceptions = evaluation.misconceptions || [];
    const combinedMisconceptions = [
      ...new Set([...newMisconceptions, ...existingMisconceptions]),
    ].slice(0, 10);

    // 6. Update Recent Performance History (FIFO max 5 items)
    const recentItem = {
      questionId: question.questionId,
      difficulty: question.difficulty,
      scorePercentage: evaluation.percentage,
      evaluatedAt: evaluation.evaluatedAt,
      questionType: question.questionType,
    };
    const updatedRecent = [recentItem, ...(current.recentPerformance || [])].slice(0, 5);

    // 7. Confidence Calculation based on number of evaluated questions
    const evaluationCount = updatedRecent.length;
    const newConfidence = Math.min(1.0, Number((0.4 + evaluationCount * 0.12).toFixed(2)));

    return {
      concept: question.concept,
      subject: question.subject,
      mastery: Number(newMastery.toFixed(2)),
      confidence: newConfidence,
      skills: updatedSkills,
      recentPerformance: updatedRecent,
      misconceptions: combinedMisconceptions,
      lastEvaluatedAt: evaluation.evaluatedAt,
    };
  }

  /**
   * Helper to update a skill score between 0 and 1 based on qualitative level.
   */
  private updateSkillEMA(currentVal: number, level: 'strong' | 'moderate' | 'weak' | 'unclear' | string): number {
    const target = level === 'strong' ? 1.0 : level === 'moderate' ? 0.6 : level === 'weak' ? 0.15 : 0.5;
    const updated = (1 - this.policy.learningRate) * currentVal + this.policy.learningRate * target;
    return Number(updated.toFixed(2));
  }
}

export const teachingStateUpdater = new TeachingStateUpdater();
