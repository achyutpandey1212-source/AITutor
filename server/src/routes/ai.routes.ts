import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse, AITestResponse } from '@ai-tutor/shared';
import { requireAuth } from '../middleware/auth.middleware.js';
import { aiService } from '../ai/ai.service.js';

export const aiRouter = Router();

// Protected AI test route
aiRouter.post(
  '/test',
  requireAuth,
  async (req: Request, res: Response<ApiResponse<AITestResponse>>): Promise<void> => {
    try {
      const { prompt } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            message: 'Invalid request: "prompt" string is required in request body',
            code: 'INVALID_PROMPT',
          },
        });
        return;
      }

      const aiResult = await aiService.generateText(prompt, {
        temperature: 0.7,
        maxTokens: 250,
      });

      res.status(200).json({
        success: true,
        data: {
          prompt,
          response: aiResult.text,
          provider: aiResult.provider,
          model: aiResult.model,
          fallbackUsed: !!aiResult.fallbackUsed,
        },
      });
    } catch (error: any) {
      console.error('Error in /api/ai/test:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'AI generation failed',
          code: 'AI_GENERATION_FAILED',
        },
      });
    }
  }
);

// Protected AI streaming test route (SSE / chunked text)
aiRouter.post(
  '/test/stream',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { prompt } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            message: 'Invalid request: "prompt" string is required in request body',
            code: 'INVALID_PROMPT',
          },
        });
        return;
      }

      // Set headers for Server-Sent Events (SSE)
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const result = await aiService.streamText(prompt, (chunk: string) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      });

      res.write(`data: ${JSON.stringify({ done: true, provider: result.provider, model: result.model, fallbackUsed: !!result.fallbackUsed })}\n\n`);
      res.end();
    } catch (error: any) {
      console.error('Error in /api/ai/test/stream:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: {
            message: error.message || 'AI streaming failed',
            code: 'AI_STREAM_FAILED',
          },
        });
      } else {
        res.write(`data: ${JSON.stringify({ error: error.message || 'Stream failed' })}\n\n`);
        res.end();
      }
    }
  }
);
