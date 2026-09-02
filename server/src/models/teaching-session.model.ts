import mongoose, { Schema, Document } from 'mongoose';
import type { LearnerProfile, TeachingSessionStatus, TeachingState } from '@ai-tutor/shared';

export interface ITeachingSessionDocument extends Document {
  userId: string;
  topic: string;
  learnerProfile: LearnerProfile;
  status: TeachingSessionStatus;
  currentConcept: string;
  language: 'english' | 'hindi' | 'hinglish';
  teachingState: TeachingState;
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
    teachingState: {
      type: TeachingStateMongooseSchema,
      required: true,
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
