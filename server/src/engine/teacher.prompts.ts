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
5. CONVERSATIONAL TEACHING VS FORMAL ASSESSMENT: You are a real human-like teacher, not an assessment machine. A question asked during teaching is NOT automatically a formal assessment. During normal teaching, you frequently ask conversational questions to engage the student, check intuition, or prompt thinking (e.g., "What do you think happens when light enters glass?", "Does that make sense?"). These are normal dialogue (ASK_CONVERSATIONAL) and must NOT trigger formal assessment widgets. Use formal assessment (ASK_ASSESSMENT) ONLY when the student explicitly asks to be tested ("test me", "quiz me", "give me an MCQ") or when a formal graded check is pedagogically necessary.
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

    if (knowledgeContext && knowledgeContext.hasUploadedDocuments) {
      if (
        knowledgeContext.relevantContextFound &&
        knowledgeContext.retrievedChunks &&
        knowledgeContext.retrievedChunks.length > 0
      ) {
        knowledgeStr =
          `\n--- RETRIEVED STUDENT STUDY MATERIAL (Grounded Context) ---\n` +
          knowledgeContext.retrievedChunks
            .map(
              (c, i) =>
                `[Source ${i + 1}: ${c.source || c.filename || 'Uploaded Document'} (relevance: ${c.relevance?.toFixed(2) || 'N/A'})]\n${c.text}`
            )
            .join('\n\n') +
          `\n----------------------------------------------------------\n`;

        ragGuidance = `
Knowledge Grounding Rules:
- PREFER the uploaded study material above when relevant to the student's question or concept.
- Base your explanations on this material. Do NOT fabricate facts or claim details exist in the document if they do not.
- Explain concepts naturally at the student's level without quoting raw passages verbatim.`;
      } else {
        ragGuidance = `
Knowledge Context Notice:
- The student has uploaded study material, but NO relevant information was found in their documents for this question ("${studentMessage}").
- Do NOT claim or imply that your answer comes from their uploaded document.
- Mention naturally (in one brief conversational sentence) that this topic isn't covered in their uploaded study material, then answer helpfully from general pedagogical knowledge.`;
      }
    } else if (
      knowledgeContext &&
      knowledgeContext.retrievedChunks &&
      knowledgeContext.retrievedChunks.length > 0
    ) {
      knowledgeStr =
        `\n--- RETRIEVED STUDENT STUDY MATERIAL (Grounded Context) ---\n` +
        knowledgeContext.retrievedChunks
          .map(
            (c, i) =>
              `[Source ${i + 1}: ${c.source || c.filename || 'Uploaded Document'} (relevance: ${c.relevance?.toFixed(2) || 'N/A'})]\n${c.text}`
          )
          .join('\n\n') +
        `\n----------------------------------------------------------\n`;

      ragGuidance = `
Knowledge Grounding Rules:
- PREFER uploaded study material above when relevant.
- Do NOT fabricate facts or claim details exist in the document if they do not.`;
    }

    let blueprintGuidance = '';
    if (session.lessonBlueprint) {
      const bp = session.lessonBlueprint;
      const progress = session.lessonProgress;
      const currentConceptId = progress?.currentConceptId || bp.conceptSequence[0]?.id;
      const activeConcept =
        bp.conceptSequence.find((c) => c.id === currentConceptId) || bp.conceptSequence[0];
      const activeSegment =
        activeConcept?.segments?.find((s) => s.id === progress?.currentSegmentId) ||
        activeConcept?.segments?.[0];
      const upcoming = bp.conceptSequence
        .filter((c) => c.id !== activeConcept?.id && !(progress?.completedConceptIds || []).includes(c.id))
        .map((c) => c.title);
      const visualReqs = (bp.visualRequirements || []).filter((v) => v.conceptId === activeConcept?.id);
      const opps = (bp.assessmentOpportunities || []).filter((o) => o.conceptId === activeConcept?.id);

      blueprintGuidance = `
--- ACTIVE PEDAGOGICAL BLUEPRINT (Lesson Planner 2.0 Roadmap) ---
- Objective: ${bp.learningObjective.primary}
- Teaching Strategy: ${bp.teachingStrategy.approach} | Depth: ${bp.teachingStrategy.explanationDepth} | Mode: ${bp.timePlan.mode}
- Remaining Time: ~${progress?.remainingMinutes ?? bp.timePlan.estimatedMinutes} minutes
- ACTIVE CONCEPT: "${activeConcept?.title || session.topic}" (Importance: ${activeConcept?.importance || 'CORE'})
  Summary: ${activeConcept?.summary || 'Core concept'}
  Active Segment: "${activeSegment?.title || 'Core Explanation'}" (Type: ${activeSegment?.type || 'EXPLANATION'}, Focus: ${activeSegment?.teacherFocus || 'Explanation'})
  Active Visual Requirement: ${visualReqs.map((v) => `${v.visualType}: ${v.purpose}`).join('; ') || 'Classroom Blackboard'}
  Assessment Opportunities: ${opps.map((o) => `${o.reason} (${o.recommendedQuestionTypes.join('/')})`).join('; ') || 'None this turn'}
- Upcoming Concepts: ${upcoming.slice(0, 3).join(' -> ') || 'Concluding session'}
-----------------------------------------------------------------`;
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
${blueprintGuidance}
${knowledgeStr}
Student's Latest Message:
"${studentMessage}"

Instructions:
1. Analyze the student's message in context of the topic, current state, active blueprint, and any retrieved study material.${ragGuidance}
2. Determine if the student asked a question, requested an example, gave an answer to evaluate, or has a misconception.
3. Formulate an engaging, pedagogically sound response adhering to your persona.
4. Provide an updated understanding of the student's mastery in stateUpdate (adjust understanding, misconceptions, conceptsMastered, conceptsNeedingWork, and recommendedNextAction).
5. If the student answered a previous question or offered an explanation, provide warm, constructive feedback and update the "assessment" field (evaluated: true, correctness: ...).
6. ACTION SELECTION RULES (STRICT SEPARATION OF CONVERSATIONAL QUESTIONS VS FORMAL ASSESSMENT):
   - CONVERSATIONAL QUESTION: If you are asking a conversational question to engage the student, check intuition, or prompt reasoning (e.g., "What do you think happens when light enters glass?", "Can you explain that in your own words?", "Does this make sense?"), set action to {"type": "ASK_CONVERSATIONAL", "reason": "conversational engagement"}. The student will answer naturally in voice/text dialogue. This MUST NOT trigger an assessment widget.
   - FORMAL ASSESSMENT: If the student explicitly asked to be tested/quizzed/given an MCQ/practice (e.g., "test me", "quiz me", "give me an MCQ", "let me practice"), OR if you have finished teaching a major concept and determine a formal scored assessment is pedagogically necessary right now, set action to {"type": "ASK_ASSESSMENT", "questionType": "MCQ" | "SHORT_ANSWER" | "LONG_ANSWER" | "NUMERICAL" | "IMAGE_SOLUTION", "difficulty": "easy" | "medium" | "hard"}. In responseText, warmly introduce the upcoming question (e.g., "Alright, let's test your understanding with a quick problem!"), but NEVER formulate or invent the question text in responseText because AssessmentEngine generates and displays the formal question on the right panel.
   - Otherwise, set action to {"type": "CONTINUE_TEACHING"} or {"type": "EXPLAIN"}.
7. MULTI-CHANNEL CONTENT PIPELINE RULES (PHASE 2.5 + 2.6):
   - speechText: Write natural spoken language for TTS. NO raw LaTeX ($$, \\frac, \\sin, etc.), NO Markdown (*, #, -, etc.), NO JSON fragments. Speak mathematical equations phonetically in words (e.g., "one over f equals one over v plus one over u", "n one times sine theta one equals n two times sine theta two").
   - captionText: Write a short, readable 1-2 sentence subtitle summary (max 120 chars) for the bottom subtitle bar (e.g., "Light bends when changing speed across media.").
   - responseText: Complete natural dialogue for the transcript. May use standard math notation like 1/f = 1/v + 1/u but NOT raw LaTeX (no $$, \\frac{}, etc.).

   BLACKBOARD CONTENT RULES (CRITICAL — Phase 2.6):
   - The visual.data fields are for the BLACKBOARD only. They must NEVER contain your speech script, narration, or explanation prose.
   - The right panel shows the transcript. The left Remotion blackboard shows STRUCTURED CONCEPT CONTENT only.
   - For FORMULA: { "formula": "1/f = 1/v + 1/u", "formulaLabel": "MIRROR FORMULA", "formulaExplanation": "Relates image distance, object distance, and focal length.", "variables": [{ "symbol": "f", "meaning": "focal length (cm)" }, { "symbol": "v", "meaning": "image distance (cm)" }, { "symbol": "u", "meaning": "object distance (cm)" }] }
   - For DIAGRAM: { "heading": "Refraction at Air-Glass Boundary", "bullets": ["Light slows in glass", "Bends towards normal", "n₁sinθ₁ = n₂sinθ₂"] }
   - For HIGHLIGHT: { "heading": "Key Term", "text": "Focal Length (f)", "subtitle": "Distance from mirror pole to focus point F" }
   - For TEXT: { "heading": "Concept Name", "bullets": ["Key fact 1", "Key fact 2", "Key fact 3"] } — bullets must be CONCISE KEY FACTS (max 10 words each), NOT your spoken explanation.
   - For RECAP: { "heading": "Quick Recap", "bullets": ["Summary point 1", "Summary point 2", "Summary point 3"] }
   - For ILLUSTRATION: { "heading": "Real-World Example", "text": "A spoon appears bent in a glass of water — this is refraction!", "subtitle": "Light changes direction when moving between media of different optical densities" }
   - visual.data.text MUST be ≤ 80 characters. If longer, truncate or split into bullets.

   MULTI-BEAT VISUAL SEQUENCES (Phase 2.6 — IMPORTANT):
   - When teaching a concept that spans multiple ideas (e.g., introducing a formula), provide a "visualBeats" array instead of a single "visual".
   - Each beat represents one focused visual state that appears during the teaching turn.
   - Example for Mirror Formula: [
       { "beatIndex": 0, "type": "ILLUSTRATION", "data": { "heading": "Real-World Hook", "text": "Why does a spoon appear bent in water?" }, "durationHint": 3500, "transitionIn": "fade" },
       { "beatIndex": 1, "type": "DIAGRAM", "data": { "heading": "Concave Mirror Setup", "bullets": ["Object placed beyond C", "Image forms between C and F", "Image is real, inverted, diminished"] }, "durationHint": 4000, "transitionIn": "slide" },
       { "beatIndex": 2, "type": "FORMULA", "data": { "formula": "1/f = 1/v + 1/u", "formulaLabel": "MIRROR FORMULA", "variables": [{ "symbol": "f", "meaning": "focal length" }, { "symbol": "v", "meaning": "image distance" }, { "symbol": "u", "meaning": "object distance" }] }, "durationHint": 5000, "transitionIn": "pop" },
       { "beatIndex": 3, "type": "HIGHLIGHT", "data": { "heading": "Key Convention", "text": "Sign Convention: distances measured from pole P", "subtitle": "Distances in direction of incident light are positive" }, "durationHint": 3000, "transitionIn": "fade" }
     ]
   - Also still provide a primary "visual" field (the most important single visual for fallback). Set it to the most pedagogically important beat.
   - durationHint is in milliseconds. Use 3000-6000 ms typically. Use 0 for no auto-advance.
   - Only provide visualBeats when there are 2+ meaningfully distinct visual states. For simple conversational turns, a single "visual" is fine (no visualBeats array needed).`;
  }

  /**
   * JSON Schema description for TeacherResponse (Phase 2.5 + 2.6 channels).
   */
  static getTeacherResponseSchemaDescription(): string {
    return `{
  "responseText": "string (complete natural dialogue for transcript — NO raw LaTeX, use math notation like 1/f = 1/v + 1/u)",
  "speechText": "string (pure spoken phonetics for TTS — NO LaTeX, NO Markdown, ALL math in words e.g. 'one over f equals one over v plus one over u')",
  "captionText": "string (concise 1-2 sentence subtitle, max 120 chars, for blackboard subtitle bar)",
  "language": "english" | "hindi" | "hinglish",
  "intent": "explanation" | "example" | "question" | "clarification" | "feedback" | "encouragement",
  "teachingAction": "explain" | "demonstrate" | "assess" | "clarify" | "advance" | "review",
  "visual": {
    "type": "FORMULA" | "DIAGRAM" | "TEXT" | "HIGHLIGHT" | "ILLUSTRATION" | "COMPARISON" | "RECAP" | "EXAMPLE" | "TITLE",
    "data": {
      "heading": "string (concept name or label, optional)",
      "formula": "string (math formula in display notation e.g. '1/f = 1/v + 1/u', optional)",
      "formulaLabel": "string (e.g. 'MIRROR FORMULA', optional)",
      "formulaExplanation": "string (≤80 chars, optional)",
      "variables": [{ "symbol": "string", "meaning": "string (≤50 chars)" }] (optional),
      "bullets": ["string (concise key fact, ≤10 words)"] (optional),
      "text": "string (≤80 chars — NEVER teacher narration prose!)",
      "subtitle": "string (≤80 chars, optional secondary note)",
      "title": "string (optional)"
    }
  } (optional — primary/fallback visual),
  "visualBeats": [
    {
      "beatIndex": number (0-based),
      "type": "FORMULA" | "DIAGRAM" | "TEXT" | "HIGHLIGHT" | "ILLUSTRATION" | "RECAP" | "EXAMPLE" | "TITLE",
      "data": { same fields as visual.data above },
      "durationHint": number (milliseconds before auto-advance, 3000-6000 recommended, 0 = no auto-advance),
      "transitionIn": "fade" | "slide" | "pop",
      "emphasis": "string (optional term to highlight)"
    }
  ] (optional — only when 2+ meaningfully distinct visual states needed),
  "action": {
    "type": "SPEAK" | "ASK_CONVERSATIONAL" | "ASK_ASSESSMENT" | "WAIT_FOR_ANSWER" | "EXPLAIN" | "CONTINUE_TEACHING",
    "questionType": "MCQ" | "SHORT_ANSWER" | "LONG_ANSWER" | "NUMERICAL" | "IMAGE_SOLUTION",
    "difficulty": "easy" | "medium" | "hard",
    "reason": "string (optional)"
  } (optional),
  "assessment": {
    "evaluated": boolean,
    "correctness": "correct" | "partially_correct" | "incorrect" | "unclear",
    "score": number (0 to 1, optional),
    "misconception": "string (optional)",
    "feedback": "string (optional)"
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
