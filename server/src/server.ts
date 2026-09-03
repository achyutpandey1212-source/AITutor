import dotenv from 'dotenv';
import { createApp } from './app.js';
import { connectDatabase } from './config/db.js';
import { initializeFirebaseAdmin } from './config/firebase.js';

dotenv.config();

const startServer = async () => {
  // Initialize Firebase Admin SDK
  initializeFirebaseAdmin();

  // Connect to MongoDB
  try {
    await connectDatabase();
  } catch (err) {
    console.error('Failed to connect to MongoDB on startup. Continuing, but DB routes will fail.', err);
  }

  const app = createApp();
  const PORT = process.env.PORT || 4000;

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Auth verification: http://localhost:${PORT}/api/auth/me`);
  });
};

startServer();
