import mongoose, { Schema, Document } from 'mongoose';
import { VisualStrategy, VisualBeat } from '@ai-tutor/shared';

export interface IVisualHistory extends Document {
  visualId: string;
  sessionId: string;
  turnId: string;
  conceptId?: string;
  strategy: VisualStrategy;
  beats: VisualBeat[];
  assetIds: string[];
  durationMs?: number;
  replayable: boolean;
  speechText?: string;
  displayText?: string;
  captionText?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VisualHistorySchema = new Schema<IVisualHistory>(
  {
    visualId: { type: String, required: true, unique: true, index: true },
    sessionId: { type: String, required: true, index: true },
    turnId: { type: String, required: true, index: true },
    conceptId: { type: String },
    strategy: {
      type: String,
      required: true,
      enum: [
        'TEXT_EXPLANATION',
        'DIAGRAM',
        'FLOWCHART',
        'ILLUSTRATION',
        'PROCESS_ANIMATION',
        'COMPARISON',
        'FORMULA',
        'WORKED_EXAMPLE',
        'HIGHLIGHT',
        'RECAP',
        'PDF_ASSET',
        'IMAGE_ASSET',
        'MIXED',
      ],
    },
    beats: { type: Schema.Types.Mixed, default: [] },
    assetIds: { type: [String], default: [] },
    durationMs: { type: Number },
    replayable: { type: Boolean, default: true },
    speechText: { type: String },
    displayText: { type: String },
    captionText: { type: String },
  },
  {
    timestamps: true,
  }
);

VisualHistorySchema.index({ sessionId: 1, createdAt: 1 });

export const VisualHistoryModel =
  mongoose.models.VisualHistory ||
  mongoose.model<IVisualHistory>('VisualHistory', VisualHistorySchema);
