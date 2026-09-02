import mongoose, { Schema, Document } from 'mongoose';
import type {
  AssessmentDifficulty,
  AssessmentEvaluationMode,
  AssessmentQuestionType,
  MCQOption,
  QuestionRubric,
} from '@ai-tutor/shared';

export interface IAssessmentQuestionDocument extends Document {
  questionId: string;
  userId: string;
  sessionId?: string;
  assessmentId?: string;
  concept: string;
  subject: string;
  grade?: string;
  difficulty: AssessmentDifficulty;
  questionType: AssessmentQuestionType;
  evaluationMode: AssessmentEvaluationMode;
  marks: number;
  question: string;
  context?: string;
  options?: MCQOption[];
  correctOptionId?: string;
  expectedAnswer?: string;
  rubric?: QuestionRubric;
  submissionGuidance?: string;
  requiresImageUpload: boolean;
  ragGrounded: boolean;
  groundingSources?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const MCQOptionMongooseSchema = new Schema<MCQOption>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
  },
  { _id: false }
);

const QuestionRubricMongooseSchema = new Schema<QuestionRubric>(
  {
    method: { type: String },
    steps: { type: [String] },
    calculation: { type: String },
    criteria: { type: [String] },
    finalAnswer: { type: String },
  },
  { _id: false }
);

const AssessmentQuestionMongooseSchema = new Schema<IAssessmentQuestionDocument>(
  {
    questionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    assessmentId: {
      type: String,
      index: true,
    },
    concept: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
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
    evaluationMode: {
      type: String,
      enum: ['MCQ', 'TEXT', 'NUMERICAL', 'IMAGE_SOLUTION'],
      required: true,
    },
    marks: {
      type: Number,
      required: true,
      min: 1,
    },
    question: {
      type: String,
      required: true,
    },
    context: {
      type: String,
    },
    options: {
      type: [MCQOptionMongooseSchema],
    },
    correctOptionId: {
      type: String,
    },
    expectedAnswer: {
      type: String,
    },
    rubric: {
      type: QuestionRubricMongooseSchema,
    },
    submissionGuidance: {
      type: String,
    },
    requiresImageUpload: {
      type: Boolean,
      default: false,
    },
    ragGrounded: {
      type: Boolean,
      default: false,
    },
    groundingSources: {
      type: [String],
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export const AssessmentQuestionModel = mongoose.model<IAssessmentQuestionDocument>(
  'AssessmentQuestion',
  AssessmentQuestionMongooseSchema
);
