import mongoose from 'mongoose';

/**
 * Validates whether a string is a valid 24-character hexadecimal MongoDB ObjectId.
 * Prevents Mongoose CastError exceptions when querying collections.
 */
export function isValidObjectId(id: string | null | undefined): boolean {
  if (!id || typeof id !== 'string') return false;
  return mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id;
}
