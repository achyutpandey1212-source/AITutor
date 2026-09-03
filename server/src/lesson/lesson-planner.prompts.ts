import type {
  LearnerProfile,
  KnowledgeContext,
  LessonBlueprint,
  LessonProgressState,
  TeachingState,
} from '@ai-tutor/shared';

export class LessonPlannerPrompts {
  static getSystemInstruction(): string {
    return `You are an elite Educational Curriculum Architect and Pedagogical Planner for an AI Tutor.
Your objective is to produce a structured, machine-readable teaching blueprint (LessonBlueprint) tailored to the learner's profile, time budget, academic level, and grounded study material.

CRITICAL ARCHITECTURAL PRINCIPLES:
1. PEDAGOGICAL BLUEPRINT, NOT A VIDEO SCRIPT:
   You produce a structured blueprint. You do NOT output conversational dialogue or render code.
   TeacherEngine will execute dialogue, Remotion will execute visual requirements, and AssessmentEngine will execute formal test questions.

2. DYNAMIC STRATEGY INFERENCE (NO RIGID TIME HARDCODING):
   Derive teaching strategy dynamically from (availableTime + learningGoal + learnerLevel + document context):
   - If time is short (e.g. 10m): Compress aggressively! Teach only essential concepts. But respect the student's learning goal (if goal is conceptual understanding, focus on core intuition + diagram; if goal is exam preparation, focus on high-yield definitions, formulas, and PYQs).
   - If standard time (e.g. 20-30m): Balanced explanation, important examples, visual demonstration, and targeted checkpoints.
   - If deep time (e.g. 45-60m): In-depth conceptual foundation, multiple examples, edge cases, visual walkthroughs, and comprehensive practice.

3. FINE-GRAINED LESSON SEGMENTS (LessonSegment):
   Each concept MUST contain a sequence of 2-5 micro-pedagogical segments (e.g., HOOK -> EXPLANATION -> VISUAL_DEMONSTRATION -> CONVERSATIONAL_CHECK -> APPLICATION).
   These segments serve as the execution roadmap for TeacherEngine and Remotion.

4. ASSESSMENT OPPORTUNITIES ARE CHECKPOINTS, NOT QUESTIONS:
   Identify where an assessment checkpoint would be pedagogically valuable (CONCEPT_CHECK, MISCONCEPTION_CHECK, APPLICATION_CHECK, EXAM_PRACTICE).
   Do NOT generate actual question text, options, or rubrics.

5. REMOTION VISUAL REQUIREMENTS:
   Explicitly specify what visual support Remotion should render on the persistent left-side classroom blackboard for each concept (DIAGRAM, FORMULA, TEXT, COMPARISON, etc.) with purpose and keyElements.

6. DEPENDENCY-AWARE ORDERING:
   Order concepts pedagogically: prerequisite foundations must strictly precede advanced applications.

7. STRICT GROUNDING & NO FABRICATED EXAM CLAIMS:
   Base concepts, definitions, and formulas strictly on the retrieved study material when available.
   Do NOT fabricate exam marks, weightage, or PYQ frequency unless explicitly confirmed in source material. If unknown, set examRelevance="UNKNOWN" and marksPotential="UNKNOWN".`;
  }

  static buildPlanPrompt(params: {
    topic: string;
    subject?: string;
    learnerProfile?: LearnerProfile;
    availableMinutes: number;
    learningGoal?: string;
    knowledgeContext?: KnowledgeContext;
  }): string {
    const { topic, subject, learnerProfile, availableMinutes, learningGoal, knowledgeContext } = params;

    let knowledgeStr = '';
    if (knowledgeContext?.retrievedChunks && knowledgeContext.retrievedChunks.length > 0) {
      knowledgeStr =
        `\n--- RETRIEVED STUDY MATERIAL (Grounded Source Chunks) ---\n` +
        knowledgeContext.retrievedChunks
          .map(
            (c, i) =>
              `[Chunk ${i + 1} | Source: ${c.source || c.filename || 'Document'} | ID: ${c.chunkId || `chunk_${i + 1}`}]\n${c.text}`
          )
          .join('\n\n') +
        `\n----------------------------------------------------------\n`;
    }

    return `TOPIC: "${topic}"
SUBJECT: "${subject || 'General'}"
LEARNER LEVEL: "${learnerProfile?.educationLevel || 'General'}"
PREFERRED LANGUAGE: "${learnerProfile?.preferredLanguage || 'english'}"
REQUESTED AVAILABLE TIME: ${availableMinutes} minutes
STUDENT'S LEARNING GOAL: "${learningGoal || learnerProfile?.learningGoal || 'Master core concepts and principles'}"
EXPLANATION STYLE PREFERENCE: "${learnerProfile?.explanationStyle || 'simple'}"
${knowledgeStr}
TASK:
Generate a complete, adaptive LessonBlueprint for this session.

INSTRUCTIONS:
1. Formulate a concrete, measurable learningObjective (primary goal, secondary goals, measurable outcomes).
2. Determine timePlan: mode should be "RAPID" (<=15 min), "STANDARD" (16-40 min), or "DEEP" (>40 min).
3. Synthesize teachingStrategy (approach, explanationDepth, interactionLevel, examFocus, conceptualFocus) dynamically matching the time budget and the student's stated goal.
4. Construct conceptSequence with 2 to 7 teachable units:
   - Assign unique IDs (e.g. "c_1", "c_2", ...).
   - Ensure prerequisite dependencies strictly precede dependent concepts.
   - Allocate estimatedMinutes to each concept so their sum is approximately ${Math.round(availableMinutes * 0.9)} to ${availableMinutes} minutes.
   - For EACH concept, include 2 to 5 ordered segments (types: HOOK, EXPLANATION, EXAMPLE, VISUAL_DEMONSTRATION, CONVERSATIONAL_CHECK, FORMAL_ASSESSMENT, RECAP, APPLICATION).
   - Associate sourceReferences referencing chunk sources when grounded material exists.
5. Detail visualRequirements for concepts needing blackboard illustrations (e.g. ray diagram, formula card, text definition) with visualType, purpose, and keyElements.
6. Identify assessmentOpportunities for key concepts with reason, recommended question types, and priority.
7. Assign examPriorities (conceptualImportance, examImportance, marksPotential, priorityReason). If exam data is not in the text, use "UNKNOWN".
8. Define openingStrategy and closingStrategy.`;
  }

  static buildReplanPrompt(params: {
    currentBlueprint: LessonBlueprint;
    currentProgress: LessonProgressState;
    triggerReason: string;
    remainingMinutes?: number;
    studentFeedback?: string;
    focusAdjustment?: string;
    teachingState?: TeachingState;
    knowledgeContext?: KnowledgeContext;
  }): string {
    const {
      currentBlueprint,
      currentProgress,
      triggerReason,
      remainingMinutes,
      studentFeedback,
      focusAdjustment,
      teachingState,
      knowledgeContext,
    } = params;

    const completedIds = currentProgress.completedConceptIds || [];
    const completedConcepts = currentBlueprint.conceptSequence.filter((c) => completedIds.includes(c.id));
    const remainingConcepts = currentBlueprint.conceptSequence.filter((c) => !completedIds.includes(c.id));

    let knowledgeStr = '';
    if (knowledgeContext?.retrievedChunks && knowledgeContext.retrievedChunks.length > 0) {
      knowledgeStr =
        `\n--- RETRIEVED STUDY MATERIAL ---\n` +
        knowledgeContext.retrievedChunks.slice(0, 5).map((c, i) => `[Chunk ${i + 1}] ${c.text}`).join('\n\n') +
        `\n--------------------------------\n`;
    }

    return `DYNAMIC REPLANNING REQUEST

ORIGINAL TOPIC: "${currentBlueprint.topic}"
TRIGGER REASON: "${triggerReason}"
REMAINING MINUTES: ${remainingMinutes ?? currentProgress.remainingMinutes ?? 15} min
FOCUS ADJUSTMENT: "${focusAdjustment || 'ADAPTIVE'}"
STUDENT FEEDBACK / OBSERVED BEHAVIOR: "${studentFeedback || 'Observed live teaching responses'}"

COMPLETED CONCEPTS (MUST BE PRESERVED AS COMPLETED):
${completedConcepts.map((c) => `- [COMPLETED] ${c.id}: ${c.title}`).join('\n') || 'None'}

ACTIVE/PENDING CONCEPTS IN PREVIOUS PLAN:
${remainingConcepts.map((c) => `- ${c.id}: ${c.title} (${c.estimatedMinutes} min)`).join('\n')}

CURRENT TEACHING STATE:
- Understanding: ${teachingState?.understanding || 'developing'}
- Misconceptions: ${JSON.stringify(teachingState?.misconceptions || [])}
- Concepts Needing Work: ${JSON.stringify(teachingState?.conceptsNeedingWork || [])}
${knowledgeStr}
REPLANNING RULES:
1. PRESERVE COMPLETED PROGRESS: Do NOT discard or repeat concepts already marked COMPLETED.
2. ADAPT THE REMAINING ROADMAP: Adjust pending concepts, segments, estimated times, visual requirements, and checkpoints to address the trigger reason (e.g. insert an intuitive misconception breakdown, switch to exam focus, or re-budget for less time).
3. Keep the sum of estimated minutes for remaining concepts within ${remainingMinutes ?? 15} minutes.
4. Increment the blueprint version to ${currentBlueprint.version + 1}.
5. Return the full updated LessonBlueprint.`;
  }

  static getSchemaDescription(): string {
    return `{
  "topic": "string",
  "subject": "string",
  "language": "english" | "hindi" | "hinglish",
  "learnerLevel": "string",
  "learningObjective": {
    "primary": "string (main goal of lesson)",
    "secondary": ["string"],
    "measurableOutcomes": ["string (e.g. Student can explain X, calculate Y)"]
  },
  "timePlan": {
    "requestedMinutes": number,
    "estimatedMinutes": number,
    "mode": "RAPID" | "STANDARD" | "DEEP"
  },
  "teachingStrategy": {
    "approach": "CONCEPT_FIRST" | "EXAM_FIRST" | "EXAMPLE_FIRST" | "PROBLEM_FIRST" | "MIXED",
    "explanationDepth": "MINIMAL" | "STANDARD" | "DETAILED",
    "interactionLevel": "LOW" | "MEDIUM" | "HIGH",
    "examFocus": number (0 to 1),
    "conceptualFocus": number (0 to 1)
  },
  "conceptSequence": [
    {
      "id": "string (e.g. c_1)",
      "title": "string",
      "summary": "string",
      "importance": "CORE" | "IMPORTANT" | "SUPPORTING" | "OPTIONAL",
      "prerequisiteConceptIds": ["string"],
      "estimatedMinutes": number,
      "examRelevance": "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN",
      "sourceReferences": ["string"],
      "visualRequirements": ["string (IDs of visual requirement)"],
      "assessmentOpportunity": boolean,
      "segments": [
        {
          "id": "string (e.g. seg_1_1)",
          "conceptId": "string",
          "title": "string",
          "type": "HOOK" | "EXPLANATION" | "EXAMPLE" | "VISUAL_DEMONSTRATION" | "CONVERSATIONAL_CHECK" | "FORMAL_ASSESSMENT" | "RECAP" | "APPLICATION",
          "purpose": "string",
          "teachingObjective": "string",
          "estimatedMinutes": number,
          "teacherFocus": "string",
          "visualRequirementIds": ["string"],
          "assessmentOpportunityIds": ["string"],
          "completionCriteria": "string"
        }
      ]
    }
  ],
  "importantConcepts": ["string"],
  "assessmentOpportunities": [
    {
      "id": "string",
      "conceptId": "string",
      "reason": "CONCEPT_CHECK" | "MISCONCEPTION_CHECK" | "APPLICATION_CHECK" | "EXAM_PRACTICE" | "STUDENT_REQUEST" | "HIGH_YIELD",
      "recommendedQuestionTypes": ["MCQ" | "SHORT_ANSWER" | "LONG_ANSWER" | "NUMERICAL" | "IMAGE_SOLUTION"],
      "priority": "HIGH" | "MEDIUM" | "LOW"
    }
  ],
  "examPriorities": [
    {
      "conceptId": "string",
      "conceptualImportance": number (0 to 1),
      "examImportance": number (0 to 1),
      "marksPotential": "VERY_HIGH" | "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN",
      "priorityReason": "string"
    }
  ],
  "visualRequirements": [
    {
      "id": "string",
      "conceptId": "string",
      "required": boolean,
      "priority": "ESSENTIAL" | "HELPFUL" | "OPTIONAL",
      "visualType": "TITLE" | "TEXT" | "DIAGRAM" | "FORMULA" | "EXAMPLE" | "COMPARISON" | "PROCESS" | "TIMELINE" | "GRAPH" | "NONE",
      "purpose": "string",
      "keyElements": ["string"]
    }
  ],
  "openingStrategy": "CONTEXT_HOOK" | "DIRECT_EXPLANATION" | "EXAM_HOOK" | "QUESTION_HOOK" | "REAL_WORLD_EXAMPLE",
  "closingStrategy": "RECAP" | "FORMAL_ASSESSMENT" | "EXAM_PRACTICE" | "NEXT_TOPIC" | "REVISION_RECOMMENDATION",
  "sourceDocumentIds": ["string"]
}`;
  }
}
