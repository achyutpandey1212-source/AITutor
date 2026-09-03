import {
  LessonBlueprint,
  LessonBlueprintSchema,
  LessonConcept,
  LessonSegment,
  VisualSegment,
} from '@ai-tutor/shared';

export class LessonPlannerValidation {
  /**
   * Topologically orders concepts so that all prerequisiteConceptIds appear
   * before dependent concepts. Breaks cycles if circular dependencies are encountered.
   */
  static topologicalSortConcepts(concepts: LessonConcept[]): LessonConcept[] {
    const conceptMap = new Map<string, LessonConcept>();
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();

    concepts.forEach((c) => {
      conceptMap.set(c.id, c);
      inDegree.set(c.id, 0);
      adjList.set(c.id, []);
    });

    // Build directed graph: prereq -> dependent
    concepts.forEach((c) => {
      const validPrereqs = (c.prerequisiteConceptIds || []).filter((pid) =>
        conceptMap.has(pid) && pid !== c.id
      );
      validPrereqs.forEach((pid) => {
        adjList.get(pid)?.push(c.id);
        inDegree.set(c.id, (inDegree.get(c.id) || 0) + 1);
      });
    });

    const queue: string[] = [];
    inDegree.forEach((deg, id) => {
      if (deg === 0) queue.push(id);
    });

    const sorted: LessonConcept[] = [];
    while (queue.length > 0) {
      const currId = queue.shift()!;
      const concept = conceptMap.get(currId);
      if (concept) sorted.push(concept);

      const neighbors = adjList.get(currId) || [];
      neighbors.forEach((nbrId) => {
        inDegree.set(nbrId, (inDegree.get(nbrId) || 0) - 1);
        if (inDegree.get(nbrId) === 0) {
          queue.push(nbrId);
        }
      });
    }

    // If there was a cycle or remaining unplaced nodes, append them to preserve all concepts
    if (sorted.length < concepts.length) {
      concepts.forEach((c) => {
        if (!sorted.some((sc) => sc.id === c.id)) {
          // Remove circular prereqs that prevented placement
          c.prerequisiteConceptIds = c.prerequisiteConceptIds.filter((pid) =>
            sorted.some((sc) => sc.id === pid)
          );
          sorted.push(c);
        }
      });
    }

    return sorted;
  }

  /**
   * Normalizes concept time allocations to fit within the requested session time,
   * keeping individual concept times reasonable (min 1 min) and synchronizing segment times.
   */
  static normalizeTimeBudget(
    concepts: LessonConcept[],
    requestedMinutes: number
  ): LessonConcept[] {
    if (concepts.length === 0) return concepts;

    const currentTotal = concepts.reduce((sum, c) => sum + (c.estimatedMinutes || 2), 0);
    // Target total is ~90% of requested minutes to leave an interaction buffer
    const targetTotal = Math.max(5, Math.round(requestedMinutes * 0.9));

    const scale = currentTotal > 0 ? targetTotal / currentTotal : 1;

    return concepts.map((c) => {
      const scaledMinutes = Math.max(1, Math.round((c.estimatedMinutes || 2) * scale));
      c.estimatedMinutes = scaledMinutes;

      // Also ensure segments are populated and scaled
      if (!c.segments || c.segments.length === 0) {
        c.segments = this.createDefaultSegments(c);
      } else {
        const segTotal = c.segments.reduce((sum, s) => sum + (s.estimatedMinutes || 1), 0);
        const segScale = segTotal > 0 ? scaledMinutes / segTotal : 1;
        c.segments.forEach((s) => {
          s.estimatedMinutes = Math.max(0.5, Math.round((s.estimatedMinutes || 1) * segScale * 10) / 10);
        });
      }

      return c;
    });
  }

  /**
   * Creates default visual segments for a concept if omitted.
   * Ensures every concept has multiple visual scenes with continuity.
   */
  static createDefaultVisualSegments(concept: LessonConcept): VisualSegment[] {
    const cid = concept.id;
    const isFormulaHeavy = /formula|numerical|law|snell|equation|math/i.test(concept.title + ' ' + concept.summary);
    
    return [
      {
        id: `${cid}_vis_1`,
        conceptId: cid,
        purpose: `Introduce intuition and context for ${concept.title}`,
        visualType: isFormulaHeavy ? 'TEXT' : 'ILLUSTRATION',
        retentionTechnique: 'REAL_WORLD_HOOK',
        keyElements: [concept.title, 'Intuitive observation', 'Contextual setup'],
        continuityNote: `Establishes visual anchor for ${concept.title} before technical details are revealed.`,
      },
      {
        id: `${cid}_vis_2`,
        conceptId: cid,
        purpose: `Step-by-step progressive reveal of ${concept.title}`,
        visualType: isFormulaHeavy ? 'FORMULA' : 'DIAGRAM',
        retentionTechnique: isFormulaHeavy ? 'HIGHLIGHT' : 'STEP_BY_STEP_REVEAL',
        keyElements: ['Core mechanism', 'Key parameters', 'Visual labels'],
        continuityNote: `Builds directly upon ${cid}_vis_1 by adding formal annotations and directional dynamics.`,
        buildsUponSegmentId: `${cid}_vis_1`,
      },
      {
        id: `${cid}_vis_3`,
        conceptId: cid,
        purpose: `Contrast and synthesize key principles of ${concept.title}`,
        visualType: isFormulaHeavy ? 'EXAMPLE' : 'COMPARISON',
        retentionTechnique: isFormulaHeavy ? 'EXAMPLE' : 'CONTRAST',
        keyElements: ['Comparative case study', 'Common misconceptions', 'Rule summary'],
        continuityNote: `Synthesizes previous visual elements into a clear comparative summary on blackboard.`,
        buildsUponSegmentId: `${cid}_vis_2`,
      },
    ];
  }

  /**
   * Creates default pedagogical micro-segments for a concept if the LLM omitted them.
   */
  static createDefaultSegments(concept: LessonConcept): LessonSegment[] {
    const totalMin = concept.estimatedMinutes || 3;
    const defaultVisuals = this.createDefaultVisualSegments(concept);
    return [
      {
        id: `${concept.id}_seg_hook`,
        conceptId: concept.id,
        title: `Introduction & Hook: ${concept.title}`,
        type: 'HOOK',
        purpose: `Engage student intuition and establish relevance for ${concept.title}`,
        teachingObjective: `Connect ${concept.title} to familiar real-world observations.`,
        teachingIntent: `Spark curiosity through a tangible real-world phenomenon.`,
        estimatedMinutes: Math.max(0.5, Math.round(totalMin * 0.2 * 10) / 10),
        estimatedDuration: Math.max(0.5, Math.round(totalMin * 0.2 * 10) / 10),
        teacherFocus: 'Conversational hook, relatable question or context',
        keyTeachingPoints: [`Intuitive phenomenon of ${concept.title}`],
        visualRequirementIds: concept.visualRequirements || [],
        visualSequence: [defaultVisuals[0]],
        assessmentOpportunityIds: [],
        conversationalCheck: {
          possible: false,
        },
        formalAssessmentOpportunity: {
          possible: false,
        },
        completionCriteria: 'Student expresses readiness or curiosity.',
      },
      {
        id: `${concept.id}_seg_explain`,
        conceptId: concept.id,
        title: `Core Explanation: ${concept.title}`,
        type: 'EXPLANATION',
        purpose: `Explain foundational principles of ${concept.title}`,
        teachingObjective: `Student understands the formal definition and key mechanism.`,
        teachingIntent: `Deliver structured pedagogical explanation with blackboard visual support.`,
        estimatedMinutes: Math.max(1, Math.round(totalMin * 0.5 * 10) / 10),
        estimatedDuration: Math.max(1, Math.round(totalMin * 0.5 * 10) / 10),
        teacherFocus: 'Clear, structured explanation with visual blackboard support',
        keyTeachingPoints: [`Definition and governing laws of ${concept.title}`],
        visualRequirementIds: concept.visualRequirements || [],
        visualSequence: [defaultVisuals[1]],
        assessmentOpportunityIds: [],
        conversationalCheck: {
          possible: false,
        },
        formalAssessmentOpportunity: {
          possible: false,
        },
        completionCriteria: 'Core concept articulated clearly.',
      },
      {
        id: `${concept.id}_seg_check`,
        conceptId: concept.id,
        title: `Understanding Check: ${concept.title}`,
        type: 'CONVERSATIONAL_CHECK',
        purpose: `Dialogue check to confirm understanding before advancing`,
        teachingObjective: `Confirm student grasps ${concept.title} without misconceptions.`,
        teachingIntent: `Conduct verbal check-in to verify student intuition before formal testing.`,
        estimatedMinutes: Math.max(0.5, Math.round(totalMin * 0.3 * 10) / 10),
        estimatedDuration: Math.max(0.5, Math.round(totalMin * 0.3 * 10) / 10),
        teacherFocus: 'Ask an open-ended conversational checking question',
        keyTeachingPoints: [`Intuitive verification of ${concept.title}`],
        visualRequirementIds: [],
        visualSequence: [defaultVisuals[2]],
        assessmentOpportunityIds: concept.assessmentOpportunity ? [`opp_${concept.id}`] : [],
        conversationalCheck: {
          possible: true,
          promptHint: `Ask student to explain ${concept.title} in their own words.`,
          promptQuestion: `In your own words, how would you describe the main idea of ${concept.title}?`,
        },
        formalAssessmentOpportunity: {
          possible: Boolean(concept.assessmentOpportunity),
          reason: 'CONCEPT_CHECK',
          recommendedType: 'MCQ',
        },
        completionCriteria: 'Student responds with intuitive explanation or asks for clarification.',
      },
    ];
  }

  /**
   * Cleans cross-references across visual requirements, assessment opportunities,
   * and exam priorities so that all IDs reference valid concepts.
   */
  static sanitizeBlueprint(rawBlueprint: any, requestedMinutes: number): LessonBlueprint {
    const validConceptIds = new Set<string>();
    const mode: 'RAPID' | 'STANDARD' | 'DEEP' =
      requestedMinutes <= 15 ? 'RAPID' : requestedMinutes <= 40 ? 'STANDARD' : 'DEEP';

    const rawConcepts: LessonConcept[] = Array.isArray(rawBlueprint.conceptSequence)
      ? rawBlueprint.conceptSequence.map((c: any, idx: number) => {
          const id = c.id || c.conceptId || `c_${idx + 1}`;
          validConceptIds.add(id);
          const totalMin = typeof c.estimatedMinutes === 'number' && c.estimatedMinutes > 0 ? c.estimatedMinutes : 3;

          const visualSegments = Array.isArray(c.visualSegments) && c.visualSegments.length > 0
            ? c.visualSegments
            : this.createDefaultVisualSegments({ id, title: c.title || `Concept ${idx + 1}`, summary: c.summary || '' } as any);

          return {
            id,
            conceptId: id,
            title: c.title || `Concept ${idx + 1}`,
            summary: c.summary || c.purpose || c.title || '',
            purpose: c.purpose || c.summary || c.title || '',
            importance: ['CORE', 'IMPORTANT', 'SUPPORTING', 'OPTIONAL'].includes(c.importance)
              ? c.importance
              : 'IMPORTANT',
            prerequisiteConceptIds: Array.isArray(c.prerequisiteConceptIds)
              ? c.prerequisiteConceptIds
              : Array.isArray(c.prerequisites)
              ? c.prerequisites
              : [],
            prerequisites: Array.isArray(c.prerequisites)
              ? c.prerequisites
              : Array.isArray(c.prerequisiteConceptIds)
              ? c.prerequisiteConceptIds
              : [],
            estimatedMinutes: totalMin,
            depth: ['INTRODUCTORY', 'STANDARD', 'DEEP'].includes(c.depth)
              ? c.depth
              : mode === 'RAPID'
              ? 'INTRODUCTORY'
              : mode === 'DEEP'
              ? 'DEEP'
              : 'STANDARD',
            teachingApproach: [
              'CONCEPT_FIRST',
              'EXAM_FIRST',
              'EXAMPLE_FIRST',
              'PROBLEM_FIRST',
              'MIXED',
            ].includes(c.teachingApproach)
              ? c.teachingApproach
              : 'CONCEPT_FIRST',
            examRelevance: ['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'].includes(c.examRelevance)
              ? c.examRelevance
              : 'UNKNOWN',
            keyPoints: Array.isArray(c.keyPoints) ? c.keyPoints : [],
            commonMisconceptions: Array.isArray(c.commonMisconceptions) ? c.commonMisconceptions : [],
            conversationalCheckOpportunity: Boolean(c.conversationalCheckOpportunity ?? true),
            formalAssessmentOpportunity: Boolean(c.formalAssessmentOpportunity ?? c.assessmentOpportunity),
            sourceReferences: Array.isArray(c.sourceReferences) && c.sourceReferences.length > 0
              ? Array.from(new Set([...c.sourceReferences, ...(Array.isArray(rawBlueprint.sourceDocumentIds) ? rawBlueprint.sourceDocumentIds : [])]))
              : Array.isArray(rawBlueprint.sourceDocumentIds) && rawBlueprint.sourceDocumentIds.length > 0
              ? rawBlueprint.sourceDocumentIds
              : [],
            visualRequirements: Array.isArray(c.visualRequirements) ? c.visualRequirements : [],
            visualSegmentIds: Array.isArray(c.visualSegmentIds) && c.visualSegmentIds.length > 0
              ? c.visualSegmentIds
              : visualSegments.map((v: any) => v.id),
            visualSegments,
            assessmentOpportunity: Boolean(c.assessmentOpportunity ?? c.formalAssessmentOpportunity),
            segments: Array.isArray(c.segments) && c.segments.length > 0
              ? c.segments.map((s: any, sIdx: number) => ({
                  id: s.id || `${id}_seg_${sIdx + 1}`,
                  conceptId: id,
                  title: s.title || `Segment ${sIdx + 1}`,
                  type: [
                    'HOOK',
                    'EXPLANATION',
                    'EXAMPLE',
                    'VISUAL_DEMONSTRATION',
                    'CONVERSATIONAL_CHECK',
                    'FORMAL_ASSESSMENT',
                    'RECAP',
                    'APPLICATION',
                  ].includes(s.type)
                    ? s.type
                    : 'EXPLANATION',
                  purpose: s.purpose || `Teaching segment for ${id}`,
                  teachingObjective: s.teachingObjective || s.purpose || '',
                  teachingIntent: s.teachingIntent || s.teachingObjective || s.purpose || '',
                  estimatedMinutes: typeof s.estimatedMinutes === 'number' && s.estimatedMinutes > 0 ? s.estimatedMinutes : 1,
                  estimatedDuration: typeof s.estimatedDuration === 'number' && s.estimatedDuration > 0 ? s.estimatedDuration : 1,
                  teacherFocus: s.teacherFocus || 'Pedagogical focus',
                  keyTeachingPoints: Array.isArray(s.keyTeachingPoints) ? s.keyTeachingPoints : [],
                  visualRequirementIds: Array.isArray(s.visualRequirementIds) ? s.visualRequirementIds : [],
                  visualSequence: Array.isArray(s.visualSequence) ? s.visualSequence : [],
                  assessmentOpportunityIds: Array.isArray(s.assessmentOpportunityIds) ? s.assessmentOpportunityIds : [],
                  conversationalCheck: s.conversationalCheck || { possible: s.type === 'CONVERSATIONAL_CHECK' },
                  formalAssessmentOpportunity: s.formalAssessmentOpportunity || { possible: s.type === 'FORMAL_ASSESSMENT' },
                  completionCriteria: s.completionCriteria || 'Segment completed',
                }))
              : [],
          };
        })
      : [];

    // 1. Dependency Topological Sorting
    const sortedConcepts = this.topologicalSortConcepts(rawConcepts);

    // 2. Normalize Time Budget & Ensure Segments
    const normalizedConcepts = this.normalizeTimeBudget(sortedConcepts, requestedMinutes);

    // 3. Filter Assessment Opportunities to valid concepts
    const assessmentOpportunities = (Array.isArray(rawBlueprint.assessmentOpportunities)
      ? rawBlueprint.assessmentOpportunities
      : []
    )
      .filter((opp: any) => validConceptIds.has(opp.conceptId))
      .map((opp: any, idx: number) => ({
        id: opp.id || `opp_${opp.conceptId}_${idx + 1}`,
        conceptId: opp.conceptId,
        reason: [
          'CONCEPT_CHECK',
          'MISCONCEPTION_CHECK',
          'APPLICATION_CHECK',
          'EXAM_PRACTICE',
          'STUDENT_REQUEST',
          'HIGH_YIELD',
        ].includes(opp.reason)
          ? opp.reason
          : 'CONCEPT_CHECK',
        recommendedQuestionTypes: Array.isArray(opp.recommendedQuestionTypes) &&
          opp.recommendedQuestionTypes.length > 0
          ? opp.recommendedQuestionTypes
          : ['MCQ', 'SHORT_ANSWER'],
        priority: ['HIGH', 'MEDIUM', 'LOW'].includes(opp.priority) ? opp.priority : 'MEDIUM',
      }));

    // If AI omitted assessment opportunities, create default checkpoints for concepts
    if (assessmentOpportunities.length === 0 && normalizedConcepts.length > 0) {
      normalizedConcepts.forEach((concept: any, idx: number) => {
        assessmentOpportunities.push({
          id: `opp_${concept.id}_${idx + 1}`,
          conceptId: concept.id,
          reason: idx === 0 ? 'CONCEPT_CHECK' : 'APPLICATION_CHECK',
          recommendedQuestionTypes: ['MCQ', 'SHORT_ANSWER'],
          priority: 'MEDIUM',
        });
      });
    }

    // 4. Filter Visual Requirements to valid concepts
    const visualRequirements = (Array.isArray(rawBlueprint.visualRequirements)
      ? rawBlueprint.visualRequirements
      : []
    )
      .filter((vis: any) => validConceptIds.has(vis.conceptId))
      .map((vis: any, idx: number) => ({
        id: vis.id || `vis_${vis.conceptId}_${idx + 1}`,
        conceptId: vis.conceptId,
        required: vis.required !== undefined ? Boolean(vis.required) : true,
        priority: ['ESSENTIAL', 'HELPFUL', 'OPTIONAL'].includes(vis.priority)
          ? vis.priority
          : 'HELPFUL',
        visualType: [
          'TITLE',
          'TEXT',
          'DIAGRAM',
          'FORMULA',
          'EXAMPLE',
          'COMPARISON',
          'PROCESS',
          'TIMELINE',
          'GRAPH',
          'NONE',
        ].includes(vis.visualType)
          ? vis.visualType
          : 'DIAGRAM',
        purpose: vis.purpose || 'Visual reinforcement for blackboard',
        keyElements: Array.isArray(vis.keyElements) ? vis.keyElements : [],
      }));

    // 5. Filter & synthesize Exam / High-Yield Priorities
    const rawPriorities = (
      Array.isArray(rawBlueprint.highYieldPriorities) && rawBlueprint.highYieldPriorities.length > 0
        ? rawBlueprint.highYieldPriorities
        : Array.isArray(rawBlueprint.examPriorities) && rawBlueprint.examPriorities.length > 0
        ? rawBlueprint.examPriorities
        : []
    )
      .filter((ep: any) => validConceptIds.has(ep.conceptId))
      .map((ep: any) => ({
        conceptId: ep.conceptId,
        conceptualImportance:
          typeof ep.conceptualImportance === 'number'
            ? Math.max(0, Math.min(1, ep.conceptualImportance))
            : 0.7,
        examImportance:
          typeof ep.examImportance === 'number'
            ? Math.max(0, Math.min(1, ep.examImportance))
            : 0.5,
        marksPotential: ['VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'].includes(ep.marksPotential)
          ? ep.marksPotential
          : 'UNKNOWN',
        priorityReason: ep.priorityReason || 'Curriculum importance',
      }));

    const examPriorities = rawPriorities.length > 0
      ? rawPriorities
      : normalizedConcepts
          .filter((c) => c.importance === 'CORE' || c.importance === 'IMPORTANT')
          .map((c) => ({
            conceptId: c.id,
            conceptualImportance: c.importance === 'CORE' ? 0.9 : 0.7,
            examImportance: c.examRelevance === 'HIGH' ? 0.8 : 0.5,
            marksPotential: (c.examRelevance === 'HIGH' ? 'HIGH' : 'MEDIUM') as any,
            priorityReason: `Key curriculum concept: ${c.title}`,
          }));

    const totalEstimated = normalizedConcepts.reduce((s, c) => s + c.estimatedMinutes, 0);

    const cleanBlueprint: LessonBlueprint = {
      id: rawBlueprint.id || `bp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sessionId: rawBlueprint.sessionId,
      topic: rawBlueprint.topic || 'Lesson Topic',
      subject: rawBlueprint.subject || 'General',
      language: ['english', 'hindi', 'hinglish'].includes(rawBlueprint.language)
        ? rawBlueprint.language
        : 'english',
      learnerLevel: rawBlueprint.learnerLevel || 'General',
      learningObjective: {
        primary: rawBlueprint.learningObjective?.primary || `Master fundamentals of ${rawBlueprint.topic}`,
        secondary: Array.isArray(rawBlueprint.learningObjective?.secondary)
          ? rawBlueprint.learningObjective.secondary
          : [],
        measurableOutcomes: Array.isArray(rawBlueprint.learningObjective?.measurableOutcomes)
          ? rawBlueprint.learningObjective.measurableOutcomes
          : [`Explain core ideas of ${rawBlueprint.topic}`, `Apply knowledge to solve problems`],
      },
      availableTime: {
        requestedMinutes,
        estimatedMinutes: totalEstimated,
        mode,
      },
      timePlan: {
        requestedMinutes,
        estimatedMinutes: totalEstimated,
        mode,
      },
      teachingStrategy: {
        approach: [
          'CONCEPT_FIRST',
          'EXAM_FIRST',
          'EXAMPLE_FIRST',
          'PROBLEM_FIRST',
          'MIXED',
        ].includes(rawBlueprint.teachingStrategy?.approach)
          ? rawBlueprint.teachingStrategy.approach
          : mode === 'RAPID' && rawBlueprint.teachingStrategy?.examFocus > 0.6
          ? 'EXAM_FIRST'
          : 'CONCEPT_FIRST',
        explanationDepth: [
          'MINIMAL',
          'STANDARD',
          'DETAILED',
        ].includes(rawBlueprint.teachingStrategy?.explanationDepth)
          ? rawBlueprint.teachingStrategy.explanationDepth
          : mode === 'RAPID'
          ? 'MINIMAL'
          : mode === 'DEEP'
          ? 'DETAILED'
          : 'STANDARD',
        interactionLevel: [
          'LOW',
          'MEDIUM',
          'HIGH',
        ].includes(rawBlueprint.teachingStrategy?.interactionLevel)
          ? rawBlueprint.teachingStrategy.interactionLevel
          : 'MEDIUM',
        examFocus:
          typeof rawBlueprint.teachingStrategy?.examFocus === 'number'
            ? Math.max(0, Math.min(1, rawBlueprint.teachingStrategy.examFocus))
            : 0.5,
        conceptualFocus:
          typeof rawBlueprint.teachingStrategy?.conceptualFocus === 'number'
            ? Math.max(0, Math.min(1, rawBlueprint.teachingStrategy.conceptualFocus))
            : 0.8,
      },
      conceptSequence: normalizedConcepts,
      importantConcepts: Array.isArray(rawBlueprint.importantConcepts) && rawBlueprint.importantConcepts.length > 0
        ? rawBlueprint.importantConcepts
        : normalizedConcepts.filter((c) => c.importance === 'CORE' || c.importance === 'IMPORTANT').map((c) => c.title),
      highYieldPriorities: examPriorities,
      examPriorities,
      assessmentStrategy: {
        conversationalCheckFrequency: rawBlueprint.assessmentStrategy?.conversationalCheckFrequency || 'PERIODIC',
        formalAssessmentThreshold: rawBlueprint.assessmentStrategy?.formalAssessmentThreshold || 'AT_KEY_CHECKPOINTS',
        restrictedConditions: Array.isArray(rawBlueprint.assessmentStrategy?.restrictedConditions)
          ? rawBlueprint.assessmentStrategy.restrictedConditions
          : [
              'IMMEDIATELY_AFTER_EVERY_CONCEPT',
              'DURING_EXPLANATION',
              'WHEN_STUDENT_IS_STRUGGLING',
              'WHILE_ASSESSMENT_ACTIVE',
            ],
        highYieldCheckpoints: Array.isArray(rawBlueprint.assessmentStrategy?.highYieldCheckpoints)
          ? rawBlueprint.assessmentStrategy.highYieldCheckpoints
          : normalizedConcepts.filter((c) => c.importance === 'CORE').map((c) => c.id),
      },
      visualLessonPlan: {
        conceptVisualPlans: Array.isArray(rawBlueprint.visualLessonPlan?.conceptVisualPlans) && rawBlueprint.visualLessonPlan.conceptVisualPlans.length > 0
          ? rawBlueprint.visualLessonPlan.conceptVisualPlans
          : normalizedConcepts.map((c) => ({
              conceptId: c.id,
              segments: c.visualSegments && c.visualSegments.length > 0 ? c.visualSegments : this.createDefaultVisualSegments(c),
            })),
        continuityGuidelines: rawBlueprint.visualLessonPlan?.continuityGuidelines || 'Maintain visual continuity across scenes and progressive reveals.',
        overallPacingStrategy: rawBlueprint.visualLessonPlan?.overallPacingStrategy || 'Change visual scenes on pedagogical events rather than arbitrary timers.',
      },
      assessmentOpportunities,
      visualRequirements,
      openingStrategy: [
        'CONTEXT_HOOK',
        'DIRECT_EXPLANATION',
        'EXAM_HOOK',
        'QUESTION_HOOK',
        'REAL_WORLD_EXAMPLE',
      ].includes(rawBlueprint.openingStrategy)
        ? rawBlueprint.openingStrategy
        : 'CONTEXT_HOOK',
      closingStrategy: [
        'RECAP',
        'FORMAL_ASSESSMENT',
        'EXAM_PRACTICE',
        'NEXT_TOPIC',
        'REVISION_RECOMMENDATION',
      ].includes(rawBlueprint.closingStrategy)
        ? rawBlueprint.closingStrategy
        : 'RECAP',
      sourceDocumentIds: Array.isArray(rawBlueprint.sourceDocumentIds)
        ? rawBlueprint.sourceDocumentIds
        : [],
      version: typeof rawBlueprint.version === 'number' ? rawBlueprint.version : 1,
      createdAt: rawBlueprint.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return LessonBlueprintSchema.parse(cleanBlueprint);
  }
}

