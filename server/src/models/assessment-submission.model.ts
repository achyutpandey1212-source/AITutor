import mongoose, { Schema, Document } from 'mongoose';
import type {
  AssessmentEvaluationMode,
  AssessmentQuestionType,
  AssessmentSubmissionStatus,
} from '@ai-tutor/shared';

export interface IAssessmentSubmissionDocument extends Document {
  userId: string;
  questionId: string;
  assessmentId?: string;
  sessionId?: string;
  attemptNumber?: number;
  questionType: AssessmentQuestionType;
  evaluationMode: AssessmentEvaluationMode;
  selectedOption?: string;
  answer?: string;
  imageReference?: string;
  status: AssessmentSubmissionStatus;
  submittedAt: Date;
  questionStartedAt?: Date;
  timeTakenMs?: number;
  score?: number;
  feedback?: string;
  evaluation?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentSubmissionMongooseSchema = new Schema<IAssessmentSubmissionDocument>(
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
    assessmentId: {
      type: String,
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    questionType: {
      type: String,
      enum: ['MCQ', 'SHORT_ANSWER', 'LONG_ANSWER', 'NUMERICAL', 'IMAGE_SOLUTION'],
      required: true,
    },
    evaluationMode: {
      type: String,
      enum: ['MCQ', 'TEXT', 'NUMERICAL', 'IMAGE_SOLUTION'],
      required: true,
    },
    selectedOption: {
      type: String,
    },
    answer: {
      type: String,
    },
    imageReference: {
      type: String,
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'EVALUATING', 'EVALUATED', 'NEEDS_REVIEW', 'FAILED'],
      default: 'SUBMITTED',
      index: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    questionStartedAt: {
      type: Date,
    },
    timeTakenMs: {
      type: Number,
      min: 0,
    },
    score: {
      type: Number,
    },
    feedback: {
      type: String,
    },
    evaluation: {
      type: Schema.Types.Mixed,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Compound non-unique index to support multiple attempts history per user and question
AssessmentSubmissionMongooseSchema.index({ userId: 1, questionId: 1, createdAt: -1 });

export const AssessmentSubmissionModel = mongoose.model<IAssessmentSubmissionDocument>(
  'AssessmentSubmission',
  AssessmentSubmissionMongooseSchema
);
