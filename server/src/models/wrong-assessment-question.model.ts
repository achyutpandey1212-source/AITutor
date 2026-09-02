import mongoose, { Schema, Document } from 'mongoose';
import type {
  AssessmentDifficulty,
  AssessmentQuestionType,
  WrongQuestionReviewStatus,
} from '@ai-tutor/shared';

export interface IWrongAssessmentQuestionDocument extends Document {
  userId: string;
  questionId: string;
  submissionId: string;
  subject: string;
  concept: string;
  difficulty: AssessmentDifficulty;
  questionType: AssessmentQuestionType;
  score: number;
  maxScore: number;
  percentage: number;
  misconceptions: string[];
  weakSkills: string[];
  attemptCount: number;
  firstFailedAt: Date;
  lastAttemptedAt: Date;
  nextReviewAt?: Date;
  reviewStatus: WrongQuestionReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

const WrongAssessmentQuestionMongooseSchema = new Schema<IWrongAssessmentQuestionDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    questionId: {
      type: String,
      required: true,
      index: true,
    },
    submissionId: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      index: true,
    },
    concept: {
      type: String,
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    questionType: {
      type: String,
      enum: ['MCQ', 'SHORT_ANSWER', 'LONG_ANSWER', 'NUMERICAL', 'IMAGE_SOLUTION'],
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    maxScore: {
      type: Number,
      required: true,
      min: 0,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    misconceptions: {
      type: [String],
      default: [],
    },
    weakSkills: {
      type: [String],
      default: [],
    },
    attemptCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    firstFailedAt: {
      type: Date,
      default: Date.now,
    },
    lastAttemptedAt: {
      type: Date,
      default: Date.now,
    },
    nextReviewAt: {
      type: Date,
    },
    reviewStatus: {
      type: String,
      enum: ['ACTIVE', 'SCHEDULED', 'MASTERED', 'DISMISSED'],
      default: 'ACTIVE',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index: single review state record per user and question
WrongAssessmentQuestionMongooseSchema.index({ userId: 1, questionId: 1 }, { unique: true });
// Index for finding due reviews
WrongAssessmentQuestionMongooseSchema.index({ userId: 1, reviewStatus: 1, nextReviewAt: 1 });

export const WrongAssessmentQuestionModel = mongoose.model<IWrongAssessmentQuestionDocument>(
  'WrongAssessmentQuestion',
  WrongAssessmentQuestionMongooseSchema
);
