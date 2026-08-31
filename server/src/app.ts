import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.routes.js';
import { authRouter } from './routes/auth.routes.js';

export const createApp = () => {
  const app = express();

  // Basic middleware
  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);

  return app;
};
