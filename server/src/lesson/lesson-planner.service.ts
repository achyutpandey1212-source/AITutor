import crypto from 'crypto';
import {
  LessonBlueprint,
  LessonProgressState,
  KnowledgeContext,
  LearnerProfile,
} from '@ai-tutor/shared';
import { aiService, AIService } from '../ai/ai.service.js';
import { retrievalService, RetrievalService } from '../knowledge/retrieval.service.js';
import { documentService, DocumentService } from '../knowledge/document.service.js';
import { LessonPlannerPrompts } from './lesson-planner.prompts.js';
import { LessonPlannerValidation } from './lesson-planner.validation.js';
import type {
  PlanLessonParams,
  ReplanLessonParams,
  ReplannedBlueprintResult,
} from './lesson-planner.types.js';

export class LessonPlannerService {
  constructor(
    private ai: AIService = aiService,
    private retrieval: RetrievalService = retrievalService,
    private documents: DocumentService = documentService
  ) {}

  /**
   * Generates a complete, adaptive LessonBlueprint grounded in learner profile,
   * available time, academic goals, and RAG knowledge context.
   */
  async planLesson(params: PlanLessonParams): Promise<LessonBlueprint> {
    const {
      topic,
      subject = 'General',
      learnerProfile,
      availableMinutes = 30,
      learningGoal,
      documentId,
      sessionId,
      userId,
    } = params;

    // 1. Resolve RAG knowledge context if documentId is provided or user has uploaded docs
    let effectiveKnowledge = params.knowledgeContext;
    const sourceDocumentIds: string[] = [];
    if (documentId) sourceDocumentIds.push(documentId);

    if (effectiveKnowledge?.retrievedChunks) {
      effectiveKnowledge.retrievedChunks.forEach((c) => {
        if (c.source && !sourceDocumentIds.includes(c.source)) {
          sourceDocumentIds.push(c.source);
        }
      });
    }

    if (!effectiveKnowledge && (documentId || userId)) {
      try {
        if (userId) {
          const hasDocs = await this.documents.hasReadyDocuments(userId);
          if (hasDocs) {
            effectiveKnowledge = await this.retrieval.retrieveKnowledgeContext(userId, topic);
            if (effectiveKnowledge?.retrievedChunks) {
              effectiveKnowledge.retrievedChunks.forEach((c) => {
                if (c.source && !sourceDocumentIds.includes(c.source)) {
                  sourceDocumentIds.push(c.source);
                }
              });
            }
          }
        }
      } catch (err) {
        console.warn('[LessonPlanner] Knowledge retrieval warning:', err);
      }
    }

    // 2. Build system and user prompt
    const systemInstruction = LessonPlannerPrompts.getSystemInstruction();
    const prompt = LessonPlannerPrompts.buildPlanPrompt({
      topic,
      subject,
      learnerProfile,
      availableMinutes,
      learningGoal,
      knowledgeContext: effectiveKnowledge,
    });
    const schemaDesc = LessonPlannerPrompts.getSchemaDescription();

    // 3. AI Structured Generation
    let rawData: any = {};
    try {
      const result = await this.ai.generateStructured<any>(prompt, schemaDesc, {
        systemInstruction,
        taskType: 'reasoning',
        temperature: 0.2,
      });
      rawData = result.data || {};
    } catch (error: any) {
      console.warn('[LessonPlanner] AI generation failed, using deterministic fallback blueprint:', error?.message);
      rawData = this.buildDeterministicFallback({
        topic,
        subject,
        learnerProfile,
        availableMinutes,
        learningGoal,
        knowledgeContext: effectiveKnowledge,
      });
    }

    // 4. Attach metadata & sanitize/validate
    rawData.topic = rawData.topic || topic;
    rawData.subject = rawData.subject || subject;
    rawData.sessionId = sessionId;
    if (sourceDocumentIds.length > 0) {
      rawData.sourceDocumentIds = Array.from(new Set([...(rawData.sourceDocumentIds || []), ...sourceDocumentIds]));
    }
    if (learnerProfile?.preferredLanguage) {
      rawData.language = learnerProfile.preferredLanguage;
    }
    if (learnerProfile?.educationLevel) {
      rawData.learnerLevel = learnerProfile.educationLevel;
    }

    const cleanBlueprint = LessonPlannerValidation.sanitizeBlueprint(rawData, availableMinutes);
    return cleanBlueprint;
  }

  /**
   * Adapts the lesson blueprint locally without discarding completed concepts,
   * in response to student struggle, accelerated pace, or time adjustment.
   */
  async replanLesson(params: ReplanLessonParams): Promise<ReplannedBlueprintResult> {
    const {
      currentBlueprint,
      currentProgress,
      triggerReason,
      remainingMinutes = currentProgress.remainingMinutes || 15,
      studentFeedback,
      focusAdjustment,
      teachingState,
      knowledgeContext,
    } = params;

    const completedIds = currentProgress.completedConceptIds || [];
    const completedConcepts = currentBlueprint.conceptSequence.filter((c) => completedIds.includes(c.id));

    const systemInstruction = LessonPlannerPrompts.getSystemInstruction();
    const prompt = LessonPlannerPrompts.buildReplanPrompt({
      currentBlueprint,
      currentProgress,
      triggerReason,
      remainingMinutes,
      studentFeedback,
      focusAdjustment,
      teachingState,
      knowledgeContext,
    });
    const schemaDesc = LessonPlannerPrompts.getSchemaDescription();

    let rawData: any = {};
    try {
      const result = await this.ai.generateStructured<any>(prompt, schemaDesc, {
        systemInstruction,
        taskType: 'reasoning',
        temperature: 0.2,
      });
      rawData = result.data || {};
    } catch (error: any) {
      console.warn('[LessonPlanner] Replan AI generation fallback:', error?.message);
      rawData = this.buildReplanFallback(currentBlueprint, currentProgress, triggerReason, remainingMinutes);
    }

    // Merge completed concepts back in front if LLM omitted them
    const newConcepts: any[] = Array.isArray(rawData.conceptSequence) ? rawData.conceptSequence : [];
    const mergedConcepts = [
      ...completedConcepts,
      ...newConcepts.filter((nc) => !completedIds.includes(nc.id)),
    ];
    rawData.conceptSequence = mergedConcepts;
    rawData.version = (currentBlueprint.version || 1) + 1;
    rawData.sessionId = currentBlueprint.sessionId;
    rawData.topic = currentBlueprint.topic;
    rawData.subject = currentBlueprint.subject;

    const updatedBlueprint = LessonPlannerValidation.sanitizeBlueprint(rawData, remainingMinutes);

    // Update progress state
    const remainingConcepts = updatedBlueprint.conceptSequence.filter((c) => !completedIds.includes(c.id));
    const nextConcept = remainingConcepts[0];

    const updatedProgress: LessonProgressState = {
      ...currentProgress,
      currentConceptId: nextConcept ? nextConcept.id : undefined,
      currentSegmentId: nextConcept?.segments?.[0]?.id,
      remainingMinutes,
      replanningHistory: [
        ...(currentProgress.replanningHistory || []),
        {
          reason: triggerReason,
          timestamp: new Date().toISOString(),
          previousConceptId: currentProgress.currentConceptId,
          adjustedConceptIds: remainingConcepts.map((c) => c.id),
        },
      ],
    };

    return {
      blueprint: updatedBlueprint,
      updatedProgress,
      changeSummary: `Replanned lesson for "${currentBlueprint.topic}" (${triggerReason}): ${remainingConcepts.length} concepts remaining.`,
    };
  }

  /**
   * Initializes runtime progress tracking for a new LessonBlueprint.
   */
  initializeProgress(blueprint: LessonBlueprint): LessonProgressState {
    const firstConcept = blueprint.conceptSequence[0];
    return {
      currentConceptId: firstConcept?.id,
      currentSegmentId: firstConcept?.segments?.[0]?.id,
      completedConceptIds: [],
      completedSegmentIds: [],
      skippedConceptIds: [],
      conceptsNeedingWork: [],
      remainingMinutes: blueprint.timePlan.estimatedMinutes,
      usedAssessmentOpportunityConceptIds: [],
      shownVisualRequirementConceptIds: [],
      replanningHistory: [],
    };
  }

  /**
   * Advances progress safely through concepts and segments.
   */
  advanceProgress(
    blueprint: LessonBlueprint,
    currentProgress: LessonProgressState,
    update: {
      conceptCompleted?: string;
      segmentCompleted?: string;
      minutesSpent?: number;
      assessmentUsed?: string;
      visualShown?: string;
    }
  ): LessonProgressState {
    const completedConceptIds = new Set(currentProgress.completedConceptIds || []);
    const completedSegmentIds = new Set(currentProgress.completedSegmentIds || []);
    const usedAssessment = new Set(currentProgress.usedAssessmentOpportunityConceptIds || []);
    const shownVisuals = new Set(currentProgress.shownVisualRequirementConceptIds || []);

    if (update.conceptCompleted) completedConceptIds.add(update.conceptCompleted);
    if (update.segmentCompleted) completedSegmentIds.add(update.segmentCompleted);
    if (update.assessmentUsed) usedAssessment.add(update.assessmentUsed);
    if (update.visualShown) shownVisuals.add(update.visualShown);

    const remainingConcepts = blueprint.conceptSequence.filter((c) => !completedConceptIds.has(c.id));
    const nextConcept = remainingConcepts[0];

    let nextSegmentId: string | undefined = undefined;
    if (nextConcept) {
      const remainingSegments = (nextConcept.segments || []).filter((s) => !completedSegmentIds.has(s.id));
      nextSegmentId = remainingSegments[0]?.id || nextConcept.segments?.[0]?.id;
    }

    const minutesSpent = update.minutesSpent || 0;
    const remainingMinutes = Math.max(0, (currentProgress.remainingMinutes || 15) - minutesSpent);

    return {
      ...currentProgress,
      currentConceptId: nextConcept?.id,
      currentSegmentId: nextSegmentId,
      completedConceptIds: Array.from(completedConceptIds),
      completedSegmentIds: Array.from(completedSegmentIds),
      usedAssessmentOpportunityConceptIds: Array.from(usedAssessment),
      shownVisualRequirementConceptIds: Array.from(shownVisuals),
      remainingMinutes,
    };
  }

  /**
   * Fallback deterministic lesson blueprint in case of provider exhaustion.
   */
  private buildDeterministicFallback(params: {
    topic: string;
    subject?: string;
    learnerProfile?: LearnerProfile;
    availableMinutes: number;
    learningGoal?: string;
    knowledgeContext?: KnowledgeContext;
  }): any {
    const { topic, subject, availableMinutes } = params;
    const mode = availableMinutes <= 15 ? 'RAPID' : availableMinutes <= 40 ? 'STANDARD' : 'DEEP';

    const c1Id = 'c_intro';
    const c2Id = 'c_core';
    const c3Id = 'c_apply';

    return {
      topic,
      subject: subject || 'General',
      learningObjective: {
        primary: `Understand key principles and definitions of ${topic}`,
        secondary: [`Recognize applications of ${topic}`, `Solve fundamental problems in ${topic}`],
        measurableOutcomes: [`Explain ${topic} in own words`, `Identify correct formulas and applications`],
      },
      timePlan: {
        requestedMinutes: availableMinutes,
        estimatedMinutes: availableMinutes,
        mode,
      },
      teachingStrategy: {
        approach: mode === 'RAPID' ? 'EXAM_FIRST' : 'CONCEPT_FIRST',
        explanationDepth: mode === 'RAPID' ? 'MINIMAL' : mode === 'DEEP' ? 'DETAILED' : 'STANDARD',
        interactionLevel: 'MEDIUM',
        examFocus: mode === 'RAPID' ? 0.8 : 0.4,
        conceptualFocus: 0.8,
      },
      conceptSequence: [
        {
          id: c1Id,
          title: `Foundations of ${topic}`,
          summary: `Intuitive introduction and core definition of ${topic}`,
          importance: 'CORE',
          prerequisiteConceptIds: [],
          estimatedMinutes: Math.max(2, Math.round(availableMinutes * 0.25)),
          examRelevance: 'HIGH',
          sourceReferences: params.knowledgeContext?.retrievedChunks?.[0]?.source ? [params.knowledgeContext.retrievedChunks[0].source] : [],
          visualRequirements: ['vis_intro'],
          assessmentOpportunity: false,
          segments: [],
        },
        {
          id: c2Id,
          title: `Core Principles & Mechanism of ${topic}`,
          summary: `Detailed breakdown of underlying laws and formulas of ${topic}`,
          importance: 'CORE',
          prerequisiteConceptIds: [c1Id],
          estimatedMinutes: Math.max(3, Math.round(availableMinutes * 0.45)),
          examRelevance: 'HIGH',
          sourceReferences: [],
          visualRequirements: ['vis_core'],
          assessmentOpportunity: true,
          segments: [],
        },
        {
          id: c3Id,
          title: `Applications & Problem Practice for ${topic}`,
          summary: `Real-world examples and exam-style problems on ${topic}`,
          importance: 'IMPORTANT',
          prerequisiteConceptIds: [c2Id],
          estimatedMinutes: Math.max(2, Math.round(availableMinutes * 0.3)),
          examRelevance: 'HIGH',
          sourceReferences: [],
          visualRequirements: ['vis_apply'],
          assessmentOpportunity: true,
          segments: [],
        },
      ],
      importantConcepts: [`Foundations of ${topic}`, `Core Principles & Mechanism of ${topic}`],
      assessmentOpportunities: [
        {
          id: 'opp_check_core',
          conceptId: c2Id,
          reason: 'CONCEPT_CHECK',
          recommendedQuestionTypes: ['MCQ', 'SHORT_ANSWER'],
          priority: 'HIGH',
        },
        {
          id: 'opp_check_apply',
          conceptId: c3Id,
          reason: 'APPLICATION_CHECK',
          recommendedQuestionTypes: ['SHORT_ANSWER', 'NUMERICAL'],
          priority: 'HIGH',
        },
      ],
      examPriorities: [
        {
          conceptId: c2Id,
          conceptualImportance: 0.9,
          examImportance: 0.8,
          marksPotential: 'HIGH',
          priorityReason: 'Core question topic in syllabus',
        },
      ],
      visualRequirements: [
        {
          id: 'vis_intro',
          conceptId: c1Id,
          required: true,
          priority: 'ESSENTIAL',
          visualType: 'TEXT',
          purpose: `Display formal definition of ${topic}`,
          keyElements: [topic, 'Definition', 'Key terms'],
        },
        {
          id: 'vis_core',
          conceptId: c2Id,
          required: true,
          priority: 'ESSENTIAL',
          visualType: 'DIAGRAM',
          purpose: `Illustrate mechanisms and laws of ${topic}`,
          keyElements: ['Diagram labels', 'Formulas', 'Arrows'],
        },
      ],
      assessmentStrategy: {
        conversationalCheckFrequency: 'PERIODIC',
        formalAssessmentThreshold: 'AT_KEY_CHECKPOINTS',
        restrictedConditions: [
          'IMMEDIATELY_AFTER_EVERY_CONCEPT',
          'DURING_EXPLANATION',
          'WHEN_STUDENT_IS_STRUGGLING',
          'WHILE_ASSESSMENT_ACTIVE',
        ],
        highYieldCheckpoints: [c2Id],
      },
      visualLessonPlan: {
        conceptVisualPlans: [
          {
            conceptId: c1Id,
            segments: [
              {
                id: `${c1Id}_vis_1`,
                conceptId: c1Id,
                purpose: `Intuitive real-world hook for ${topic}`,
                visualType: 'ILLUSTRATION',
                retentionTechnique: 'REAL_WORLD_HOOK',
                keyElements: ['Everyday phenomenon', 'Visual hook'],
                continuityNote: 'Sets the visual stage before formal formulas or ray diagrams appear.',
              },
              {
                id: `${c1Id}_vis_2`,
                conceptId: c1Id,
                purpose: `Formal terminology and definition of ${topic}`,
                visualType: 'TEXT',
                retentionTechnique: 'STEP_BY_STEP_REVEAL',
                keyElements: [topic, 'Definition', 'Key parameters'],
                continuityNote: 'Text definition builds directly on the real-world observation.',
                buildsUponSegmentId: `${c1Id}_vis_1`,
              },
            ],
          },
          {
            conceptId: c2Id,
            segments: [
              {
                id: `${c2Id}_vis_1`,
                conceptId: c2Id,
                purpose: `Progressive ray diagram for ${topic}`,
                visualType: 'DIAGRAM',
                retentionTechnique: 'STEP_BY_STEP_REVEAL',
                keyElements: ['Incident ray', 'Normal', 'Interface', 'Refracted ray'],
                continuityNote: 'Boundary appears first, then incident ray, then normal and refracted ray.',
              },
              {
                id: `${c2Id}_vis_2`,
                conceptId: c2Id,
                purpose: `Comparison of medium transitions`,
                visualType: 'COMPARISON',
                retentionTechnique: 'CONTRAST',
                keyElements: ['Rarer to denser', 'Denser to rarer'],
                continuityNote: 'Contrasts both directional behaviors side-by-side.',
                buildsUponSegmentId: `${c2Id}_vis_1`,
              },
            ],
          },
          {
            conceptId: c3Id,
            segments: [
              {
                id: `${c3Id}_vis_1`,
                conceptId: c3Id,
                purpose: `Formula card and mathematical representation`,
                visualType: 'FORMULA',
                retentionTechnique: 'HIGHLIGHT',
                keyElements: ['Snell formula', 'Variable definitions'],
                continuityNote: 'Highlights the governing formula derived from ray geometry.',
              },
              {
                id: `${c3Id}_vis_2`,
                conceptId: c3Id,
                purpose: `Summary recap card on blackboard`,
                visualType: 'RECAP',
                retentionTechnique: 'RECAP',
                keyElements: ['Key takeaway 1', 'Key takeaway 2', 'Exam tip'],
                continuityNote: 'Summarizes all concepts onto a clean final board view.',
                buildsUponSegmentId: `${c3Id}_vis_1`,
              },
            ],
          },
        ],
        continuityGuidelines: 'Maintain visual continuity across scenes and progressive reveals.',
        overallPacingStrategy: 'Change visual scenes on pedagogical events rather than arbitrary timers.',
      },
      openingStrategy: 'CONTEXT_HOOK',
      closingStrategy: 'RECAP',
    };
  }

  private buildReplanFallback(
    currentBlueprint: LessonBlueprint,
    currentProgress: LessonProgressState,
    triggerReason: string,
    remainingMinutes: number
  ): any {
    const completedIds = new Set(currentProgress.completedConceptIds || []);
    const remaining = currentBlueprint.conceptSequence.filter((c) => !completedIds.has(c.id));

    // Simplify remaining concepts
    const adaptedRemaining = remaining.map((c, idx) => ({
      ...c,
      id: c.id,
      title: idx === 0 ? `Simplified Revisit: ${c.title}` : c.title,
      summary: idx === 0 ? `Refocused breakdown to resolve misconceptions (${triggerReason})` : c.summary,
      estimatedMinutes: Math.max(2, Math.round(remainingMinutes / (remaining.length || 1))),
    }));

    return {
      ...currentBlueprint,
      conceptSequence: adaptedRemaining,
    };
  }
}

export const lessonPlannerService = new LessonPlannerService();
