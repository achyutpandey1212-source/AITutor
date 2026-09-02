import {
  AssessmentAnalytics,
  AssessmentAnalyticsSchema,
  AssessmentDifficulty,
} from '@ai-tutor/shared';
import { AssessmentSubmissionModel } from '../models/assessment-submission.model.js';
import { AssessmentQuestionModel } from '../models/assessment-question.model.js';
import { LearnerAssessmentStateModel } from '../models/learner-assessment-state.model.js';

export class AssessmentAnalyticsService {
  /**
   * Calculates comprehensive assessment analytics for a user deterministically without LLM calls.
   */
  async getUserAnalytics(userId: string): Promise<AssessmentAnalytics> {
    let submissions: any[] = [];
    let questions: any[] = [];
    let learnerStateDoc: any = null;

    try {
      submissions = await AssessmentSubmissionModel.find({
        userId,
        status: { $in: ['EVALUATED', 'NEEDS_REVIEW'] },
      }).lean();

      if (submissions.length > 0) {
        const qIds = [...new Set(submissions.map((s) => s.questionId))];
        questions = await AssessmentQuestionModel.find({
          questionId: { $in: qIds },
        }).lean();
      }

      learnerStateDoc = await LearnerAssessmentStateModel.findOne({ userId }).lean();
    } catch {
      // fallback
    }

    return this.calculateAnalyticsFromRecords(submissions, questions, learnerStateDoc);
  }

  /**
   * Pure deterministic calculation logic for analytics.
   */
  calculateAnalyticsFromRecords(
    submissions: any[],
    questions: any[],
    learnerStateDoc?: any
  ): AssessmentAnalytics {
    const questionMap = new Map(questions.map((q) => [q.questionId, q]));

    let totalAttempts = 0;
    let correctCount = 0;
    let totalScore = 0;
    let totalMaxScore = 0;
    let totalTimeSpentMs = 0;
    let timedAttemptsCount = 0;

    const distinctQuestionIds = new Set<string>();

    const bySubject: Record<
      string,
      { attempted: number; correct: number; totalScore: number; totalMax: number }
    > = {};

    const byConcept: Record<
      string,
      { attempted: number; correct: number; totalScore: number; totalMax: number }
    > = {};

    const byDifficulty: Record<
      AssessmentDifficulty,
      { attempted: number; correct: number }
    > = {
      easy: { attempted: 0, correct: 0 },
      medium: { attempted: 0, correct: 0 },
      hard: { attempted: 0, correct: 0 },
    };

    const byQuestionType: Record<string, { attempted: number; correct: number }> = {};

    const skillTotals: Record<string, { sum: number; count: number }> = {
      understanding: { sum: 0, count: 0 },
      method_selection: { sum: 0, count: 0 },
      calculation: { sum: 0, count: 0 },
      reasoning: { sum: 0, count: 0 },
      substitution: { sum: 0, count: 0 },
      completeness: { sum: 0, count: 0 },
    };

    const misconceptionFrequency = new Map<string, number>();

    for (const sub of submissions) {
      totalAttempts++;
      distinctQuestionIds.add(sub.questionId);

      const q = questionMap.get(sub.questionId) || {};
      const subject = q.subject || sub.subject || 'General';
      const concept = q.concept || sub.concept || 'General';
      const difficulty: AssessmentDifficulty = q.difficulty || 'medium';
      const questionType = sub.questionType || q.questionType || 'SHORT_ANSWER';

      const evalData = sub.evaluation || {};
      const score = typeof sub.score === 'number' ? sub.score : evalData.score || 0;
      const maxScore = q.marks || evalData.maxScore || 1;
      const isCorrect = evalData.correct || (score / maxScore >= 0.75);

      if (isCorrect) correctCount++;
      totalScore += score;
      totalMaxScore += maxScore;

      if (typeof sub.timeTakenMs === 'number' && sub.timeTakenMs > 0) {
        totalTimeSpentMs += sub.timeTakenMs;
        timedAttemptsCount++;
      }

      // bySubject
      if (!bySubject[subject]) {
        bySubject[subject] = { attempted: 0, correct: 0, totalScore: 0, totalMax: 0 };
      }
      bySubject[subject].attempted++;
      if (isCorrect) bySubject[subject].correct++;
      bySubject[subject].totalScore += score;
      bySubject[subject].totalMax += maxScore;

      // byConcept
      if (!byConcept[concept]) {
        byConcept[concept] = { attempted: 0, correct: 0, totalScore: 0, totalMax: 0 };
      }
      byConcept[concept].attempted++;
      if (isCorrect) byConcept[concept].correct++;
      byConcept[concept].totalScore += score;
      byConcept[concept].totalMax += maxScore;

      // byDifficulty
      if (byDifficulty[difficulty]) {
        byDifficulty[difficulty].attempted++;
        if (isCorrect) byDifficulty[difficulty].correct++;
      }

      // byQuestionType
      if (!byQuestionType[questionType]) {
        byQuestionType[questionType] = { attempted: 0, correct: 0 };
      }
      byQuestionType[questionType].attempted++;
      if (isCorrect) byQuestionType[questionType].correct++;

      // Concept assessment skill values
      if (evalData.conceptAssessment) {
        const ca = evalData.conceptAssessment;
        const parseLevel = (lvl?: string) => (lvl === 'strong' ? 1.0 : lvl === 'moderate' ? 0.6 : lvl === 'weak' ? 0.3 : 0.5);

        if (ca.understanding) {
          skillTotals.understanding.sum += parseLevel(ca.understanding);
          skillTotals.understanding.count++;
        }
        if (ca.methodSelection) {
          skillTotals.method_selection.sum += parseLevel(ca.methodSelection);
          skillTotals.method_selection.count++;
        }
        if (ca.calculation) {
          skillTotals.calculation.sum += parseLevel(ca.calculation);
          skillTotals.calculation.count++;
        }
        if (ca.reasoning) {
          skillTotals.reasoning.sum += parseLevel(ca.reasoning);
          skillTotals.reasoning.count++;
        }
        if (ca.completeness) {
          skillTotals.completeness.sum += parseLevel(ca.completeness);
          skillTotals.completeness.count++;
        }
      }

      // Misconceptions
      if (Array.isArray(evalData.misconceptions)) {
        for (const misc of evalData.misconceptions) {
          if (misc && typeof misc === 'string') {
            misconceptionFrequency.set(misc, (misconceptionFrequency.get(misc) || 0) + 1);
          }
        }
      }
    }

    const overallAccuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
    const averageScore = totalMaxScore > 0 ? Number(((totalScore / totalMaxScore) * 5).toFixed(1)) : 0;
    const averageTimePerQuestionMs = timedAttemptsCount > 0 ? Math.round(totalTimeSpentMs / timedAttemptsCount) : 0;

    const formattedBySubject: Record<string, { attempted: number; correct: number; accuracy: number; avgScore: number }> = {};
    for (const [subName, data] of Object.entries(bySubject)) {
      formattedBySubject[subName] = {
        attempted: data.attempted,
        correct: data.correct,
        accuracy: data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0,
        avgScore: data.totalMax > 0 ? Number(((data.totalScore / data.totalMax) * 5).toFixed(1)) : 0,
      };
    }

    const formattedByConcept: Record<string, { attempted: number; correct: number; accuracy: number; mastery: number }> = {};
    for (const [cName, data] of Object.entries(byConcept)) {
      const storedMastery = learnerStateDoc?.concepts?.[cName]?.mastery ?? (data.totalMax > 0 ? data.totalScore / data.totalMax : 0.5);
      formattedByConcept[cName] = {
        attempted: data.attempted,
        correct: data.correct,
        accuracy: data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0,
        mastery: Number(storedMastery.toFixed(2)),
      };
    }

    const formattedByDifficulty: Record<AssessmentDifficulty, { attempted: number; correct: number; accuracy: number }> = {
      easy: {
        attempted: byDifficulty.easy.attempted,
        correct: byDifficulty.easy.correct,
        accuracy: byDifficulty.easy.attempted > 0 ? Math.round((byDifficulty.easy.correct / byDifficulty.easy.attempted) * 100) : 0,
      },
      medium: {
        attempted: byDifficulty.medium.attempted,
        correct: byDifficulty.medium.correct,
        accuracy: byDifficulty.medium.attempted > 0 ? Math.round((byDifficulty.medium.correct / byDifficulty.medium.attempted) * 100) : 0,
      },
      hard: {
        attempted: byDifficulty.hard.attempted,
        correct: byDifficulty.hard.correct,
        accuracy: byDifficulty.hard.attempted > 0 ? Math.round((byDifficulty.hard.correct / byDifficulty.hard.attempted) * 100) : 0,
      },
    };

    const formattedByQuestionType: Record<string, { attempted: number; correct: number; accuracy: number }> = {};
    for (const [qType, data] of Object.entries(byQuestionType)) {
      formattedByQuestionType[qType] = {
        attempted: data.attempted,
        correct: data.correct,
        accuracy: data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0,
      };
    }

    const skillBreakdown: Record<string, number> = {};
    for (const [skillKey, { sum, count }] of Object.entries(skillTotals)) {
      skillBreakdown[skillKey] = count > 0 ? Number((sum / count).toFixed(2)) : 0.5;
    }

    const commonMisconceptions = Array.from(misconceptionFrequency.entries())
      .map(([misconception, count]) => ({ misconception, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return AssessmentAnalyticsSchema.parse({
      totalAttempts,
      totalQuestions: distinctQuestionIds.size,
      overallAccuracy,
      averageScore,
      totalTimeSpentMs,
      averageTimePerQuestionMs,
      bySubject: formattedBySubject,
      byConcept: formattedByConcept,
      byDifficulty: formattedByDifficulty,
      byQuestionType: formattedByQuestionType,
      skillBreakdown,
      commonMisconceptions,
    });
  }
}

export const assessmentAnalyticsService = new AssessmentAnalyticsService();
