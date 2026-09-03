import mongoose, { Schema, Document } from 'mongoose';
import type { LearnerProfile, TeacherIntent, TeachingSessionStatus, TeachingState } from '@ai-tutor/shared';

export interface ITeachingSessionDocument extends Document {
  userId: string;
  topic: string;
  subject: string;
  learnerProfile: LearnerProfile;
  status: TeachingSessionStatus;
  currentConcept: string;
  language: 'english' | 'hindi' | 'hinglish';
  documentId?: string;
  documentTitle?: string;
  teachingState: TeachingState;
  currentMode: 'TEACHING' | 'ASSESSMENT' | 'FEEDBACK' | 'REVIEW';
  assessmentSessionId?: string;
  currentQuestionId?: string;
  conversationHistory: Array<{
    id?: string;
    role: 'student' | 'tutor';
    text: string;
    intent?: TeacherIntent;
    timestamp: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const LearnerProfileMongooseSchema = new Schema(
  {
    userId: { type: String },
    preferredLanguage: {
      type: String,
      enum: ['english', 'hindi', 'hinglish'],
      default: 'english',
    },
    educationLevel: { type: String },
    learningGoal: { type: String },
    explanationStyle: {
      type: String,
      enum: ['simple', 'balanced', 'detailed'],
      default: 'simple',
    },
  },
  { _id: false }
);

const TeachingStateMongooseSchema = new Schema(
  {
    currentConcept: { type: String, default: 'Introduction' },
    understanding: {
      type: String,
      enum: ['unknown', 'weak', 'developing', 'strong'],
      default: 'unknown',
    },
    confidence: { type: Number, min: 0, max: 1, default: 0.5 },
    misconceptions: { type: [String], default: [] },
    conceptsMastered: { type: [String], default: [] },
    conceptsNeedingWork: { type: [String], default: [] },
    lastStudentAction: {
      type: String,
      enum: ['question', 'answer', 'request_example', 'request_explanation', 'unknown'],
      default: 'unknown',
    },
    recommendedNextAction: {
      type: String,
      enum: ['explain', 'give_example', 'ask_question', 'clarify', 'advance', 'review'],
      default: 'explain',
    },
  },
  { _id: false }
);

const ConversationMessageMongooseSchema = new Schema(
  {
    id: { type: String },
    role: { type: String, enum: ['student', 'tutor'], required: true },
    text: { type: String, required: true },
    intent: { type: String },
    timestamp: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false }
);

const TeachingSessionMongooseSchema = new Schema<ITeachingSessionDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      default: 'General',
    },
    learnerProfile: {
      type: LearnerProfileMongooseSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
    currentConcept: {
      type: String,
      default: 'Introduction',
    },
    language: {
      type: String,
      enum: ['english', 'hindi', 'hinglish'],
      default: 'english',
    },
    documentId: {
      type: String,
      index: true,
    },
    documentTitle: {
      type: String,
    },
    teachingState: {
      type: TeachingStateMongooseSchema,
      required: true,
    },
    currentMode: {
      type: String,
      enum: ['TEACHING', 'ASSESSMENT', 'FEEDBACK', 'REVIEW'],
      default: 'TEACHING',
    },
    assessmentSessionId: {
      type: String,
    },
    currentQuestionId: {
      type: String,
    },
    conversationHistory: {
      type: [ConversationMessageMongooseSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const TeachingSessionModel = mongoose.model<ITeachingSessionDocument>(
  'TeachingSession',
  TeachingSessionMongooseSchema
);
