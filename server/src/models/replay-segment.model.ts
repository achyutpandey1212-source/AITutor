import mongoose, { Schema, Document } from 'mongoose';
import type { ReplaySegment, VisualPlan, VisualBeat } from '@ai-tutor/shared';

export interface IReplaySegmentDocument extends Document {
  segmentId: string;
  sessionId: string;
  turnId: string;
  conceptId?: string;
  concept: string;
  title?: string;
  speechText: string;
  displayText: string;
  captionText?: string;
  visualPlan?: VisualPlan;
  visualBeats: VisualBeat[];
  assetIds: string[];
  durationMs?: number;
  replayable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReplaySegmentMongooseSchema = new Schema<IReplaySegmentDocument>(
  {
    segmentId: { type: String, required: true, unique: true, index: true },
    sessionId: { type: String, required: true, index: true },
    turnId: { type: String, required: true, index: true },
    conceptId: { type: String, index: true },
    concept: { type: String, required: true },
    title: { type: String },
    speechText: { type: String, required: true },
    displayText: { type: String, required: true },
    captionText: { type: String },
    visualPlan: { type: Schema.Types.Mixed },
    visualBeats: { type: Schema.Types.Mixed, default: [] },
    assetIds: { type: [String], default: [] },
    durationMs: { type: Number },
    replayable: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

ReplaySegmentMongooseSchema.index({ sessionId: 1, createdAt: 1 });
ReplaySegmentMongooseSchema.index({ sessionId: 1, conceptId: 1 });

export const ReplaySegmentModel =
  mongoose.models.ReplaySegment ||
  mongoose.model<IReplaySegmentDocument>('ReplaySegment', ReplaySegmentMongooseSchema);
