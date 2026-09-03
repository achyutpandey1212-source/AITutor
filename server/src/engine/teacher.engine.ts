import crypto from 'crypto';
import type {
  KnowledgeContext,
  LearnerProfile,
  LessonPlan,
  TeacherResponse,
  TeachingSession,
  TeachingState,
  VisualBeat,
} from '@ai-tutor/shared';
import {
  LessonPlanSchema,
  TeacherResponseSchema,
  TeachingStateSchema,
  normalizeTextForSpeech,
  normalizeTextForDisplay,
  cleanCaptionText,
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
      if (rawData.stateUpdate && typeof rawData.stateUpdate === 'object') {
        const validActions = ['explain', 'give_example', 'ask_question', 'clarify', 'advance', 'review'];
        if (['assess', 'test', 'quiz', 'question'].includes(rawData.stateUpdate.recommendedNextAction)) {
          rawData.stateUpdate.recommendedNextAction = 'ask_question';
        } else if (!validActions.includes(rawData.stateUpdate.recommendedNextAction)) {
          rawData.stateUpdate.recommendedNextAction = 'explain';
        }

        const validStudentActions = ['question', 'answer', 'request_example', 'request_explanation', 'unknown'];
        if (rawData.stateUpdate.lastStudentAction && !validStudentActions.includes(rawData.stateUpdate.lastStudentAction)) {
          if (['request_assessment', 'request_test', 'request_quiz'].includes(rawData.stateUpdate.lastStudentAction)) {
            rawData.stateUpdate.lastStudentAction = 'question';
          } else {
            rawData.stateUpdate.lastStudentAction = 'unknown';
          }
        }
      }
      if (!rawData.updatedState) {
        rawData.updatedState = currentState;
      }
      if (!rawData.action) {
        if (
          rawData.intent === 'question' ||
          (typeof rawData.responseText === 'string' && /\?\s*$/i.test(rawData.responseText.trim()))
        ) {
          rawData.action = { type: 'ASK_CONVERSATIONAL', reason: 'conversational_question' };
        } else {
          rawData.action = { type: 'CONTINUE_TEACHING' };
        }
      }

      // Phase 2.5 Multi-Channel Normalization
      const rawSpeech = typeof rawData.speechText === 'string' && rawData.speechText.trim()
        ? rawData.speechText
        : rawData.responseText || '';
      const cleanSpeech = normalizeTextForSpeech(rawSpeech);
      rawData.speechText = cleanSpeech;

      const rawCaption = typeof rawData.captionText === 'string' && rawData.captionText.trim()
        ? rawData.captionText
        : cleanSpeech;
      rawData.captionText = cleanCaptionText(rawCaption);

      // Phase 2.6: displayText — clean human-readable transcript (NOT phonetics, NOT raw LaTeX)
      rawData.displayText = normalizeTextForDisplay(rawData.responseText || '');

      if (rawData.visual && typeof rawData.visual === 'object') {
        const validTypes = [
          'NONE', 'TITLE', 'TEXT', 'DIAGRAM', 'FORMULA', 'EXAMPLE',
          'COMPARISON', 'PROCESS', 'HIGHLIGHT', 'RECAP', 'QUESTION_PROMPT', 'ILLUSTRATION'
        ];
        if (!validTypes.includes(rawData.visual.type)) {
          rawData.visual.type = 'TITLE';
        }
        if (!rawData.visual.data || typeof rawData.visual.data !== 'object') {
          rawData.visual.data = {};
        }
        // Phase 2.6: NEVER put teacher script into visual.data.text
        // If the AI accidentally set text to the full responseText or speechText, clear it
        const scriptLike = rawData.visual.data.text;
        if (typeof scriptLike === 'string' && scriptLike.length > 200) {
          // Long prose = teacher script leaked into board — strip it
          rawData.visual.data.text = undefined;
        }
      } else {
        const conceptTitle = rawData.stateUpdate?.currentConcept || currentState.currentConcept || 'Core Concepts';
        const isFormula = /\b(\d+\/[a-zA-Z]|\b[a-zA-Z]\s*=\s*|\\frac|sin\b|cos\b|snell|mirror|lens)\b/i.test(rawData.responseText || '');
        rawData.visual = {
          type: isFormula ? 'FORMULA' : 'TEXT',
          data: {
            title: conceptTitle,
            heading: conceptTitle,
            // Phase 2.6: use caption (concise key idea), NOT teacher script
            text: rawData.captionText,
            formula: isFormula ? '1/f = 1/v + 1/u' : undefined,
          },
        };
      }

      // Phase 2.6: Process visualBeats from AI response
      // If AI provided multi-beat sequence, validate each beat and store them.
      // Otherwise, build a default single-beat from the primary visual.
      const rawBeats = Array.isArray(rawData.visualBeats) ? rawData.visualBeats : null;
      const validVisualTypes = [
        'NONE', 'TITLE', 'TEXT', 'DIAGRAM', 'FORMULA', 'EXAMPLE',
        'COMPARISON', 'PROCESS', 'HIGHLIGHT', 'RECAP', 'QUESTION_PROMPT', 'ILLUSTRATION'
      ];
      if (rawBeats && rawBeats.length > 0) {
        rawData.visualBeats = rawBeats
          .filter((b: any) => b && typeof b === 'object' && validVisualTypes.includes(b.type))
          .map((b: any, idx: number): VisualBeat => ({
            beatIndex: idx,
            type: b.type,
            data: (b.data && typeof b.data === 'object') ? b.data : {},
            durationHint: typeof b.durationHint === 'number' ? Math.max(0, b.durationHint) : 4000,
            transitionIn: ['fade', 'slide', 'pop'].includes(b.transitionIn) ? b.transitionIn : 'fade',
            emphasis: typeof b.emphasis === 'string' ? b.emphasis : undefined,
          }));
        // Guarantee at least one beat
        if (rawData.visualBeats.length === 0) {
          rawData.visualBeats = [{
            beatIndex: 0,
            type: rawData.visual?.type || 'TEXT',
            data: rawData.visual?.data || {},
            durationHint: 0,
            transitionIn: 'fade',
          }];
        }
      } else {
        // Single-beat fallback — primary visual becomes beat 0
        rawData.visualBeats = [{
          beatIndex: 0,
          type: rawData.visual?.type || 'TEXT',
          data: rawData.visual?.data || {},
          durationHint: 0,
          transitionIn: 'fade',
        }];
      }

      rawData.teachingContent = {
        speechText: rawData.speechText,
        captionText: rawData.captionText,
        displayText: rawData.displayText,
        concept: rawData.stateUpdate?.currentConcept || currentState.currentConcept,
        visual: rawData.visual,
        visualBeats: rawData.visualBeats,
      };
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
