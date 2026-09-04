import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse, AITestResponse, AIMessage } from '@ai-tutor/shared';
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

// Helper to determine contextual learning suggestions
function generateContextualSuggestions(message: string, context?: { subject?: string; topic?: string }): string[] {
  const lower = message.toLowerCase();
  const suggestions: string[] = [];

  if (lower.includes('code') || lower.includes('function') || lower.includes('programming') || lower.includes('python')) {
    suggestions.push('Add line-by-line comments', 'What are the edge cases?', 'Quiz me on this logic');
  } else if (lower.includes('formula') || lower.includes('law') || lower.includes('equation') || lower.includes('calculate')) {
    suggestions.push('Derive this step-by-step', 'Explain the units and dimensions', 'Give a real-world numerical problem');
  } else if (lower.includes('difference') || lower.includes('compare') || lower.includes('vs')) {
    suggestions.push('Summarize in a comparison table', 'Give a memorable analogy', 'Test my understanding');
  } else {
    suggestions.push('Explain simpler', 'Give a real-world example', 'Quiz my understanding', 'What is a common misconception?');
  }

  return suggestions.slice(0, 3);
}

// Helper to build prompt messages with context & retrieval
async function buildChatPrompt(
  userId: string,
  message: string,
  history?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  context?: {
    subject?: string;
    topic?: string;
    concept?: string;
    documentId?: string;
    documentTitle?: string;
  }
): Promise<{ messages: AIMessage[]; documentExcerpts: string[] }> {
  let documentExcerpts: string[] = [];

  if (context?.documentId && userId) {
    try {
      const { retrievalService } = await import('../knowledge/index.js');
      const searchResult = await retrievalService.retrieve(userId, {
        query: message,
        documentIds: [context.documentId],
        topK: 5,
        topN: 3,
      });
      if (searchResult && Array.isArray(searchResult.retrievedChunks)) {
        documentExcerpts = searchResult.retrievedChunks
          .map((c) => c.text)
          .filter(Boolean);
      }
    } catch (err: any) {
      console.warn('[ai.routes] Document retrieval non-fatal warning:', err.message);
    }
  }

  let systemInstruction = `You are Lumo, an intelligent, empathetic, and encouraging personal AI tutor.
Your mission is to help the student understand deeply, build clear intuition, and work through their doubts calmly.

Pedagogical Principles:
1. Explain with clarity and pedagogical pacing. Do not merely dump raw answers unless the student explicitly asks for a quick direct answer.
2. Build intuition: use simple everyday analogies or real-world examples to make abstract concepts tangible.
3. For mathematics or scientific equations, always format them clearly using LaTeX syntax: $ for inline math (e.g. $F = ma$) and $$ for display math.
4. Structure complex explanations with clear headings, clean bullet points, or numbered steps for readability.
5. Provide code blocks with appropriate language tags when discussing programming concepts.
6. Conclude with a gentle check-for-understanding question or a friendly next inquiry.`;

  if (context?.subject || context?.topic || context?.concept) {
    systemInstruction += `\n\nActive Study Context:`;
    if (context.subject) systemInstruction += `\n- Subject: ${context.subject}`;
    if (context.topic) systemInstruction += `\n- Topic: ${context.topic}`;
    if (context.concept) systemInstruction += `\n- Current Concept: ${context.concept}`;
  }

  if (documentExcerpts.length > 0) {
    systemInstruction += `\n\nRelevant Document Reference Excerpts (${context?.documentTitle || 'Attached Material'}):\n"""\n${documentExcerpts.join('\n---\n')}\n"""\nGround your explanation in these verified reference excerpts where relevant.`;
  }

  const promptMessages: AIMessage[] = [
    { role: 'system', content: systemInstruction },
  ];

  // Include up to last 6 turns from recent conversation
  if (Array.isArray(history)) {
    const recent = history.slice(-6);
    for (const h of recent) {
      if (h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string') {
        promptMessages.push({ role: h.role, content: h.content });
      }
    }
  }

  promptMessages.push({ role: 'user', content: message });

  return { messages: promptMessages, documentExcerpts };
}

// ---------------------------------------------------------------
// Lumo AI Workspace: POST /api/ai/chat (Standard endpoint)
// ---------------------------------------------------------------
aiRouter.post(
  '/chat',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      const { message, history, modelTier = 'light', context } = req.body;

      if (!message || typeof message !== 'string' || !message.trim()) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Invalid request: non-empty "message" string is required',
            code: 'INVALID_MESSAGE',
          },
        });
        return;
      }

      const { messages, documentExcerpts } = await buildChatPrompt(
        userId,
        message.trim(),
        history,
        context
      );

      // Model Tier resolution
      let taskType: 'lightweight' | 'general_secondary' | 'reasoning' = 'general_secondary';
      let temperature = 0.3;
      let maxTokens = 2500;

      if (modelTier === 'fast') {
        taskType = 'lightweight';
        temperature = 0.3;
        maxTokens = 1500;
      } else if (modelTier === 'pro') {
        taskType = 'reasoning';
        temperature = 0.2;
        maxTokens = 3500;
      }

      const aiResult = await aiService.generateText(messages, {
        taskType,
        temperature,
        maxTokens,
      });

      const suggestions = generateContextualSuggestions(message, context);

      res.status(200).json({
        success: true,
        data: {
          text: aiResult.text,
          modelTier,
          provider: aiResult.provider,
          model: aiResult.model,
          fallbackUsed: !!aiResult.fallbackUsed,
          suggestions,
          hasDocumentContext: documentExcerpts.length > 0,
        },
      });
    } catch (error: any) {
      console.error('[ai.routes] Error in /api/ai/chat:', error);
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Lumo AI response generation failed',
          code: 'AI_CHAT_FAILED',
        },
      });
    }
  }
);

// ---------------------------------------------------------------
// Lumo AI Workspace: POST /api/ai/chat/stream (SSE Streaming)
// ---------------------------------------------------------------
aiRouter.post(
  '/chat/stream',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized', code: 'AUTH_REQUIRED' },
        });
        return;
      }

      const { message, history, modelTier = 'light', context } = req.body;

      if (!message || typeof message !== 'string' || !message.trim()) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Invalid request: non-empty "message" string is required',
            code: 'INVALID_MESSAGE',
          },
        });
        return;
      }

      const { messages, documentExcerpts } = await buildChatPrompt(
        userId,
        message.trim(),
        history,
        context
      );

      let taskType: 'lightweight' | 'general_secondary' | 'reasoning' = 'general_secondary';
      let temperature = 0.3;
      let maxTokens = 2500;

      if (modelTier === 'fast') {
        taskType = 'lightweight';
        temperature = 0.3;
        maxTokens = 1500;
      } else if (modelTier === 'pro') {
        taskType = 'reasoning';
        temperature = 0.2;
        maxTokens = 3500;
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Send initial metadata
      const suggestions = generateContextualSuggestions(message, context);
      res.write(
        `data: ${JSON.stringify({
          type: 'start',
          modelTier,
          suggestions,
          hasDocumentContext: documentExcerpts.length > 0,
        })}\n\n`
      );

      const result = await aiService.streamText(
        messages,
        (chunk: string) => {
          res.write(`data: ${JSON.stringify({ type: 'chunk', chunk })}\n\n`);
        },
        { taskType, temperature, maxTokens }
      );

      res.write(
        `data: ${JSON.stringify({
          type: 'done',
          done: true,
          fullText: result.text,
          provider: result.provider,
          model: result.model,
          fallbackUsed: !!result.fallbackUsed,
          suggestions,
        })}\n\n`
      );
      res.end();
    } catch (error: any) {
      console.error('[ai.routes] Error in /api/ai/chat/stream:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: {
            message: error.message || 'Lumo AI streaming failed',
            code: 'AI_STREAM_FAILED',
          },
        });
      } else {
        res.write(`data: ${JSON.stringify({ type: 'error', error: error.message || 'Stream interrupted' })}\n\n`);
        res.end();
      }
    }
  }
);

