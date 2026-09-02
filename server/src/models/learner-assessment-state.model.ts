import mongoose, { Schema, Document } from 'mongoose';
import type {
  LearnerAssessmentState,
  LearnerConceptMastery,
  LearnerConceptSkills,
  RecentPerformanceItem,
} from '@ai-tutor/shared';

export interface ILearnerAssessmentStateDocument extends Document {
  userId: string;
  concepts: Map<string, LearnerConceptMastery>;
  overallMastery?: number;
  createdAt: Date;
  updatedAt: Date;
}

const RecentPerformanceMongooseSchema = new Schema(
  {
    questionId: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    scorePercentage: { type: Number, required: true, min: 0, max: 100 },
    evaluatedAt: { type: String, required: true },
    questionType: {
      type: String,
      enum: ['MCQ', 'SHORT_ANSWER', 'LONG_ANSWER', 'NUMERICAL', 'IMAGE_SOLUTION'],
      required: true,
    },
  },
  { _id: false }
);

const LearnerConceptSkillsMongooseSchema = new Schema(
  {
    understanding: { type: Number, min: 0, max: 1, default: 0.5 },
    method_selection: { type: Number, min: 0, max: 1, default: 0.5 },
    substitution: { type: Number, min: 0, max: 1 },
    calculation: { type: Number, min: 0, max: 1 },
    final_answer: { type: Number, min: 0, max: 1 },
    reasoning: { type: Number, min: 0, max: 1 },
    completeness: { type: Number, min: 0, max: 1 },
  },
  { _id: false }
);

const LearnerConceptMasteryMongooseSchema = new Schema(
  {
    concept: { type: String, required: true },
    subject: { type: String },
    mastery: { type: Number, min: 0, max: 1, default: 0.5 },
    confidence: { type: Number, min: 0, max: 1, default: 0.5 },
    skills: {
      type: LearnerConceptSkillsMongooseSchema,
      default: () => ({ understanding: 0.5, method_selection: 0.5 }),
    },
    recentPerformance: {
      type: [RecentPerformanceMongooseSchema],
      default: [],
    },
    misconceptions: {
      type: [String],
      default: [],
    },
    lastEvaluatedAt: { type: String },
  },
  { _id: false }
);

const LearnerAssessmentStateMongooseSchema = new Schema<ILearnerAssessmentStateDocument>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    concepts: {
      type: Map,
      of: LearnerConceptMasteryMongooseSchema,
      default: () => new Map(),
    },
    overallMastery: {
      type: Number,
      min: 0,
      max: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const LearnerAssessmentStateModel = mongoose.model<ILearnerAssessmentStateDocument>(
  'LearnerAssessmentState',
  LearnerAssessmentStateMongooseSchema
);
