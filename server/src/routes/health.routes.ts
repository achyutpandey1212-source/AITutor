import { Router } from 'express';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import type { ApiResponse, HealthStatus } from '@ai-tutor/shared';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response<ApiResponse<HealthStatus>>) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  const healthData: HealthStatus = {
    status: isDbConnected ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '0.1.0',
    database: isDbConnected ? 'connected' : 'disconnected',
  };

  res.status(200).json({
    success: true,
    data: healthData,
  });
});
