import mongoose, { Schema, Document } from 'mongoose';

export interface IAssessmentBookmarkDocument extends Document {
  userId: string;
  questionId: string;
  savedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentBookmarkMongooseSchema = new Schema<IAssessmentBookmarkDocument>(
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
    savedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index: a student can bookmark a question only once
AssessmentBookmarkMongooseSchema.index({ userId: 1, questionId: 1 }, { unique: true });

export const AssessmentBookmarkModel = mongoose.model<IAssessmentBookmarkDocument>(
  'AssessmentBookmark',
  AssessmentBookmarkMongooseSchema
);
