import type {
  KnowledgeContext,
  LearnerProfile,
  TeachingSession,
  TeachingState,
} from '@ai-tutor/shared';

export class TeacherPrompts {
  /**
   * System instruction establishing the persona, pedagogical guidelines, and constraints.
   */
  static getTeacherSystemInstruction(
    profile: LearnerProfile,
    language: 'english' | 'hindi' | 'hinglish' = 'english'
  ): string {
    const styleDescription = {
      simple: 'Use simple, everyday analogies, plain vocabulary, and brief intuitive explanations.',
      balanced: 'Provide clear, balanced explanations with accurate terminology and structured examples.',
      detailed: 'Offer in-depth, comprehensive conceptual analysis with formal definitions, edge cases, and rigor.',
    }[profile.explanationStyle || 'simple'];

    return `You are an expert, empathetic, and highly effective interactive AI Tutor.
Your pedagogical principles:
1. ADAPTABILITY: Adapt explanations to learner level (${profile.educationLevel || 'General'}) and style (${styleDescription}).
2. LANGUAGE: Teach strictly in ${language.toUpperCase()}. If hinglish, blend conversational Hindi in Latin script with English terminology naturally.
3. CONVERSATIONAL TEACHING: Explain concepts step-by-step. Do not overwhelm the learner with massive walls of text.
4. MISCONCEPTION DETECTION: Actively detect misconceptions or wrong assumptions. Never pretend the learner understands something they have not demonstrated.
5. PEDAGOGICAL ACTIONS: Use examples when helpful, ask checking questions when assessment is useful, clarify doubts gently, and encourage curiosity.
6. OUTPUT FORMAT: Respond strictly with the requested JSON schema.`;
  }

  /**
   * Constructs the structured prompt for generating a teacher response + state update.
   */
  static buildResponsePrompt(
    session: TeachingSession,
    currentState: TeachingState,
    studentMessage: string,
    knowledgeContext?: KnowledgeContext
  ): string {
    let knowledgeStr = '';
    let ragGuidance = '';
    if (knowledgeContext && knowledgeContext.retrievedChunks && knowledgeContext.retrievedChunks.length > 0) {
      knowledgeStr =
        `\n--- RETRIEVED STUDENT STUDY MATERIAL (Grounded Context) ---\n` +
        knowledgeContext.retrievedChunks
          .map((c, i) => `[Source ${i + 1}: ${c.source || c.filename || 'Uploaded Document'} (relevance: ${c.relevance?.toFixed(2) || 'N/A'})]\n${c.text}`)
          .join('\n\n') +
        `\n----------------------------------------------------------\n`;

      ragGuidance = `
Knowledge Grounding Rules:
- PREFER uploaded study material above when relevant to the student's question or concept.
- Do NOT fabricate information or cite claims as from the document if they are not present.
- If the retrieved passages do not contain enough information to answer fully, acknowledge what the document covers and supplement naturally from general knowledge.
- Explain concepts naturally at the student's level without quoting raw passages verbatim.`;
    }

    return `Topic: "${session.topic}"
Current Concept: "${currentState.currentConcept || session.currentConcept || session.topic}"
Learner Level: ${session.learnerProfile.educationLevel || 'General'}
Explanation Style: ${session.learnerProfile.explanationStyle}
Preferred Language: ${session.language}

Current Teaching State:
- Understanding: ${currentState.understanding} (Confidence: ${currentState.confidence})
- Known Misconceptions: ${JSON.stringify(currentState.misconceptions)}
- Mastered Concepts: ${JSON.stringify(currentState.conceptsMastered)}
- Concepts Needing Work: ${JSON.stringify(currentState.conceptsNeedingWork)}
- Last Student Action: ${currentState.lastStudentAction}
- Recommended Next Action: ${currentState.recommendedNextAction}
${knowledgeStr}
Student's Latest Message:
"${studentMessage}"

Instructions:
1. Analyze the student's message in context of the topic, current state, and any retrieved study material.${ragGuidance}
2. Determine if the student asked a question, requested an example, gave an answer to evaluate, or has a misconception.
3. Formulate an engaging, pedagogically sound response adhering to your persona.
4. Provide an updated understanding of the student's mastery in stateUpdate (adjust understanding, misconceptions, conceptsMastered, conceptsNeedingWork, and recommendedNextAction).
5. If the student answered a question, include the "assessment" field with correctness and feedback.`;
  }

  /**
   * JSON Schema description for TeacherResponse.
   */
  static getTeacherResponseSchemaDescription(): string {
    return `{
  "responseText": "string (the natural dialogue text to speak/show to student)",
  "language": "english" | "hindi" | "hinglish",
  "intent": "explanation" | "example" | "question" | "clarification" | "feedback" | "encouragement",
  "teachingAction": "explain" | "demonstrate" | "assess" | "clarify" | "advance" | "review",
  "assessment": {
    "evaluated": boolean,
    "correctness": "correct" | "partially_correct" | "incorrect" | "unclear",
    "score": number (0 to 1, optional),
    "misconception": "string (optional description of identified flaw)",
    "feedback": "string (optional assessment feedback)"
  } (optional),
  "stateUpdate": {
    "currentConcept": "string (optional)",
    "understanding": "unknown" | "weak" | "developing" | "strong" (optional),
    "confidence": number (0 to 1, optional),
    "misconceptions": ["string"] (optional),
    "conceptsMastered": ["string"] (optional),
    "conceptsNeedingWork": ["string"] (optional),
    "lastStudentAction": "question" | "answer" | "request_example" | "request_explanation" | "unknown" (optional),
    "recommendedNextAction": "explain" | "give_example" | "ask_question" | "clarify" | "advance" | "review" (optional)
  } (optional)
}`;
  }

  /**
   * Constructs the structured prompt for generating a lesson plan.
   */
  static buildLessonPlanPrompt(
    topic: string,
    profile: LearnerProfile,
    knowledgeContext?: KnowledgeContext
  ): string {
    let knowledgeStr = '';
    if (knowledgeContext && knowledgeContext.retrievedChunks && knowledgeContext.retrievedChunks.length > 0) {
      knowledgeStr = `\nReference Material Chunks:\n` +
        knowledgeContext.retrievedChunks.map((c, i) => `[${i + 1}] ${c.text}`).join('\n');
    }

    return `Create a structured micro-lesson plan for the topic: "${topic}".
Target Level: ${profile.educationLevel || 'Beginner'}
Language: ${profile.preferredLanguage || 'english'}
Learning Goal: ${profile.learningGoal || 'Master the fundamental concepts'}
Explanation Style: ${profile.explanationStyle || 'simple'}
${knowledgeStr}

Instructions:
1. Define 2-4 clear, measurable learning objectives.
2. Structure the lesson into 3 to 6 logical sequential scenes (intro -> explanation/diagram -> example -> question/summary).
3. For each scene, specify:
   - type ("intro", "explanation", "diagram", "example", "question", "summary")
   - durationSeconds (15 to 90 seconds per scene)
   - narration (clear spoken script for the teacher)
   - visual (type: "avatar" | "diagram" | "text" | "equation" | "illustration" and a concise visual description)
4. Estimated total duration should realistically match sum of scene durations.`;
  }

  /**
   * JSON Schema description for LessonPlan.
   */
  static getLessonPlanSchemaDescription(): string {
    return `{
  "title": "string (engaging lesson title)",
  "topic": "string",
  "targetLevel": "string",
  "language": "english" | "hindi" | "hinglish",
  "learningObjectives": ["string"],
  "estimatedDurationSeconds": number,
  "scenes": [
    {
      "order": number (integer starting from 1),
      "type": "intro" | "explanation" | "diagram" | "example" | "question" | "summary",
      "durationSeconds": number (10 to 120),
      "narration": "string (script to be spoken)",
      "visual": {
        "type": "avatar" | "diagram" | "text" | "equation" | "illustration",
        "description": "string (visual scene specification)"
      },
      "transition": "string (optional, e.g. 'fade', 'slide')"
    }
  ]
}`;
  }
}
