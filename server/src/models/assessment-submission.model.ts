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
  questionType: AssessmentQuestionType;
  evaluationMode: AssessmentEvaluationMode;
  selectedOption?: string;
  answer?: string;
  imageReference?: string;
  status: AssessmentSubmissionStatus;
  submittedAt: Date;
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

// Compound unique index to prevent duplicate submissions per user and question
AssessmentSubmissionMongooseSchema.index({ userId: 1, questionId: 1 }, { unique: true });

export const AssessmentSubmissionModel = mongoose.model<IAssessmentSubmissionDocument>(
  'AssessmentSubmission',
  AssessmentSubmissionMongooseSchema
);
