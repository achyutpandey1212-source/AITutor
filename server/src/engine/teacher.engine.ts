import crypto from 'crypto';
import type {
  KnowledgeContext,
  LearnerProfile,
  LessonPlan,
  TeacherResponse,
  TeachingSession,
  TeachingState,
} from '@ai-tutor/shared';
import {
  LessonPlanSchema,
  TeacherResponseSchema,
  TeachingStateSchema,
} from '@ai-tutor/shared';
import { aiService, AIService } from '../ai/ai.service.js';
import { TeacherPrompts } from './teacher.prompts.js';

export class TeacherEngine {
  private ai: AIService;

  constructor(customAiService?: AIService) {
    this.ai = customAiService || aiService;
  }

  /**
   * Generates a pedagogical teacher response based on student message and current state.
   */
  async generateTeacherResponse(
    profile: LearnerProfile,
    session: TeachingSession,
    currentState: TeachingState,
    studentMessage: string,
    knowledgeContext?: KnowledgeContext
  ): Promise<TeacherResponse> {
    const systemInstruction = TeacherPrompts.getTeacherSystemInstruction(
      profile,
      session.language
    );

    const prompt = TeacherPrompts.buildResponsePrompt(
      session,
      currentState,
      studentMessage,
      knowledgeContext
    );

    const schemaDesc = TeacherPrompts.getTeacherResponseSchemaDescription();

    const structuredResult = await this.ai.generateStructured<unknown>(
      prompt,
      schemaDesc,
      {
        taskType: 'reasoning',
        systemInstruction,
        temperature: 0.3,
        maxTokens: 3000,
      }
    );

    // Deterministic normalization of AI output
    const rawData = (structuredResult.data || {}) as any;
    if (rawData && typeof rawData === 'object') {
      if (rawData.assessment && typeof rawData.assessment === 'object' && !rawData.assessment.correctness) {
        rawData.assessment.correctness = 'unclear';
      }
      if (!rawData.updatedState) {
        rawData.updatedState = currentState;
      }
      if (!rawData.action) {
        rawData.action = { type: 'CONTINUE_TEACHING' };
      }
    }

    // Validate structured AI output with Zod contract
    const parseResult = TeacherResponseSchema.safeParse(rawData);
    if (!parseResult.success) {
      console.error('[TeacherEngine] Zod validation failed for teacher response:', parseResult.error.format());
      throw new Error(`AI generated invalid TeacherResponse contract: ${parseResult.error.message}`);
    }

    return parseResult.data;
  }

  /**
   * Deterministically merges an AI-derived state update into existing TeachingState.
   * Ensures deterministic defaults and validates merged output.
   */
  mergeTeachingState(
    currentState: TeachingState,
    update?: Partial<TeachingState>
  ): TeachingState {
    if (!update) {
      return currentState;
    }

    // Merge array fields uniquely without duplicates
    const mergeUnique = (base: string[], additions?: string[]): string[] => {
      if (!additions || additions.length === 0) return base;
      return Array.from(new Set([...base, ...additions]));
    };

    const mergedCandidate = {
      currentConcept: update.currentConcept || currentState.currentConcept,
      understanding: update.understanding || currentState.understanding,
      confidence: typeof update.confidence === 'number'
        ? Math.max(0, Math.min(1, update.confidence))
        : currentState.confidence,
      misconceptions: update.misconceptions
        ? mergeUnique(currentState.misconceptions, update.misconceptions)
        : currentState.misconceptions,
      conceptsMastered: update.conceptsMastered
        ? mergeUnique(currentState.conceptsMastered, update.conceptsMastered)
        : currentState.conceptsMastered,
      conceptsNeedingWork: update.conceptsNeedingWork
        ? mergeUnique(currentState.conceptsNeedingWork, update.conceptsNeedingWork)
        : currentState.conceptsNeedingWork,
      lastStudentAction: update.lastStudentAction || currentState.lastStudentAction,
      recommendedNextAction: update.recommendedNextAction || currentState.recommendedNextAction,
    };

    // Validate through Zod to guarantee strict type compliance
    return TeachingStateSchema.parse(mergedCandidate);
  }

  /**
   * Generates a structured LessonPlan contract with deterministic ID & scene assignments.
   */
  async generateLessonPlan(
    topic: string,
    profile: LearnerProfile,
    options?: { sessionId?: string; knowledgeContext?: KnowledgeContext }
  ): Promise<LessonPlan> {
    const systemInstruction = TeacherPrompts.getTeacherSystemInstruction(
      profile,
      profile.preferredLanguage || 'english'
    );

    const prompt = TeacherPrompts.buildLessonPlanPrompt(
      topic,
      profile,
      options?.knowledgeContext
    );

    const schemaDesc = TeacherPrompts.getLessonPlanSchemaDescription();

    const structuredResult = await this.ai.generateStructured<any>(
      prompt,
      schemaDesc,
      {
        systemInstruction,
        temperature: 0.2,
        maxTokens: 4000,
      }
    );

    const rawData = structuredResult.data || {};

    // Deterministically assign IDs and scene ordering if missing or malformed
    const planId = `plan_${crypto.randomUUID()}`;
    const scenes = Array.isArray(rawData.scenes)
      ? rawData.scenes.map((scene: any, idx: number) => ({
          id: scene.id || `scene_${idx + 1}_${crypto.randomBytes(4).toString('hex')}`,
          order: typeof scene.order === 'number' ? scene.order : idx + 1,
          type: scene.type || 'explanation',
          durationSeconds: typeof scene.durationSeconds === 'number' ? scene.durationSeconds : 30,
          narration: scene.narration || '',
          visual: scene.visual || { type: 'avatar', description: 'Teacher explaining concept' },
          transition: scene.transition || 'fade',
        }))
      : [];

    const planCandidate = {
      id: planId,
      sessionId: options?.sessionId,
      title: rawData.title || `Lesson: ${topic}`,
      topic,
      targetLevel: rawData.targetLevel || profile.educationLevel || 'beginner',
      language: rawData.language || profile.preferredLanguage || 'english',
      learningObjectives: Array.isArray(rawData.learningObjectives) && rawData.learningObjectives.length > 0
        ? rawData.learningObjectives
        : [`Understand the fundamental principles of ${topic}`],
      estimatedDurationSeconds: typeof rawData.estimatedDurationSeconds === 'number'
        ? rawData.estimatedDurationSeconds
        : scenes.reduce((acc: number, s: any) => acc + s.durationSeconds, 0),
      scenes,
    };

    const parseResult = LessonPlanSchema.safeParse(planCandidate);
    if (!parseResult.success) {
      console.error('[TeacherEngine] Zod validation failed for LessonPlan:', parseResult.error.format());
      throw new Error(`AI generated invalid LessonPlan contract: ${parseResult.error.message}`);
    }

    return parseResult.data;
  }
}

export const teacherEngine = new TeacherEngine();
