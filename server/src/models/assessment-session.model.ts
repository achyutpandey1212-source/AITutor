import mongoose, { Schema, Document } from 'mongoose';
import type {
  AssessmentDifficulty,
  AssessmentSessionStatus,
} from '@ai-tutor/shared';

export interface IAssessmentSessionDocument extends Document {
  userId: string;
  subject: string;
  grade?: string;
  topic?: string;
  concepts: string[];
  goal: string;
  mode: string;
  startingDifficulty: AssessmentDifficulty;
  currentQuestionId?: string;
  questionIds: string[];
  attemptedQuestionCount: number;
  correctCount: number;
  totalMarks: number;
  earnedMarks: number;
  accuracy: number;
  status: AssessmentSessionStatus;
  startedAt: Date;
  lastActivityAt: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentSessionMongooseSchema = new Schema<IAssessmentSessionDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      index: true,
    },
    grade: {
      type: String,
    },
    topic: {
      type: String,
    },
    concepts: {
      type: [String],
      default: [],
    },
    goal: {
      type: String,
      default: 'practice',
    },
    mode: {
      type: String,
      default: 'adaptive',
    },
    startingDifficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    currentQuestionId: {
      type: String,
    },
    questionIds: {
      type: [String],
      default: [],
    },
    attemptedQuestionCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    correctCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
      min: 0,
    },
    earnedMarks: {
      type: Number,
      default: 0,
      min: 0,
    },
    accuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['CREATED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'ABANDONED'],
      default: 'CREATED',
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

AssessmentSessionMongooseSchema.index({ userId: 1, status: 1 });
AssessmentSessionMongooseSchema.index({ userId: 1, createdAt: -1 });

export const AssessmentSessionModel = mongoose.model<IAssessmentSessionDocument>(
  'AssessmentSession',
  AssessmentSessionMongooseSchema
);
