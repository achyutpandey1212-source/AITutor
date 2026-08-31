import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<typeof mongoose | null> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('⚠️ MONGODB_URI is not set in environment variables. Database features will be disabled or fail.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    throw error;
  }
};
