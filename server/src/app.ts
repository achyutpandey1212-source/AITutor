import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { aiRouter } from './routes/ai.routes.js';
import { teachingRouter } from './routes/teaching.routes.js';
import { knowledgeRouter } from './routes/knowledge.routes.js';
import { assessmentRouter } from './routes/assessment.routes.js';

export const createApp = () => {
  const app = express();

  // Basic middleware
  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/teaching', teachingRouter);
  app.use('/api/knowledge', knowledgeRouter);
  app.use('/api/assessments', assessmentRouter);

  return app;
};


