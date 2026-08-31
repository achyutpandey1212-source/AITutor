import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
  firebaseUid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      default: '',
    },
    photoURL: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
