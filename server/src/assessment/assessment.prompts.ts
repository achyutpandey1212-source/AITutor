import type {
  AssessmentStrategyDecision,
  KnowledgeContext,
  LearnerAssessmentState,
  TeachingState,
} from '@ai-tutor/shared';

export class AssessmentPrompts {
  /**
   * System instruction for question generation.
   * Enforces strict JSON output, curriculum alignment, and subject-specific conventions.
   */
  static getAssessmentSystemInstruction(): string {
    return `You are an expert pedagogical assessment designer and curriculum question author.
Your responsibility:
1. OUTPUT FORMAT: Respond strictly with the requested JSON schema. Do not include markdown code block backticks (\`\`\`json), conversational introductory phrases (such as "Here is your question:"), or closing remarks.
2. CURRICULUM ACCURACY: Ensure academic rigor, age-appropriate language, and unambiguous questions.
3. ALIGNMENT: Follow the provided concept, difficulty, question type, evaluation mode, and marks distribution strictly.
4. COGNITIVE DEPTH:
   - Low-mark questions (1-2 marks): Test direct recall, simple calculation, or concise concept verification.
   - Medium-mark questions (3-5 marks): Test procedural understanding, explanation of causes/mechanisms, or structured multi-step calculations.
   - High-mark questions (5-10 marks): Test comprehensive reasoning, multi-step problem solving, derivations, or structured analysis.
5. RUBRIC GENERATION: Always provide an accurate, step-by-step evaluation rubric with expected criteria, calculations, and the precise final answer.
6. MCQ RULES: Provide exactly 4 distinct, plausible options (A, B, C, D) with exactly one unambiguous correct option. Avoid options like "All of the above" or "None of the above" unless pedagogically necessary.
7. MATHEMATICS & SCIENCE: For numerical problems, specify units clearly in the question text. For multi-step questions (evaluationMode = IMAGE_SOLUTION), create a problem that requires showing complete handwritten working steps.
8. SURFACE FORM VARIATION: When creating targeted or remedial practice questions, test the targeted skill using a fresh, distinct surface form (e.g. real-world context, word problem, or new scenario) rather than simply changing single numbers on the exact previous question.`;
  }

  /**
   * Constructs the structured prompt for generating an assessment question.
   */
  static buildQuestionPrompt(
    strategy: AssessmentStrategyDecision,
    teachingState?: Partial<TeachingState>,
    knowledgeContext?: KnowledgeContext,
    customInstructions?: string,
    learnerState?: LearnerAssessmentState
  ): string {
    let ragContextStr = '';
    let ragGuidance = '';

    if (
      knowledgeContext &&
      knowledgeContext.retrievedChunks &&
      knowledgeContext.retrievedChunks.length > 0 &&
      knowledgeContext.relevantContextFound !== false
    ) {
      ragContextStr =
        `\n--- RETRIEVED STUDENT STUDY MATERIAL (Grounded Source Context) ---\n` +
        knowledgeContext.retrievedChunks
          .map(
            (c, i) =>
              `[Source ${i + 1}: ${c.filename || c.source || 'Uploaded Document'}]\n${c.text}`
          )
          .join('\n\n') +
        `\n------------------------------------------------------------------\n`;

      ragGuidance = `
Grounding Requirements:
- Ground the question strictly in the provided study material above.
- Test concepts, facts, or problem formulas present in the document.
- Do NOT fabricate facts, numbers, or topics that contradict this material.`;
    }

    const conceptMastery = learnerState?.concepts?.[strategy.concept];
    const skillSignals = conceptMastery?.skills
      ? `\nStudent Skill Breakdown:\n- Method Selection: ${(conceptMastery.skills.method_selection * 100).toFixed(0)}%\n- Calculation Accuracy: ${((conceptMastery.skills.calculation ?? 0.5) * 100).toFixed(0)}%\n- Conceptual Understanding: ${(conceptMastery.skills.understanding * 100).toFixed(0)}%`
      : '';

    const misconceptionStr =
      strategy.targetMisconceptions && strategy.targetMisconceptions.length > 0
        ? `\nTarget Misconceptions to Address/Diagnose:\n${strategy.targetMisconceptions.map((m: string) => `- ${m}`).join('\n')}`
        : conceptMastery?.misconceptions && conceptMastery.misconceptions.length > 0
        ? `\nActive Concept Misconceptions:\n${conceptMastery.misconceptions.map((m: string) => `- ${m}`).join('\n')}`
        : teachingState?.misconceptions && teachingState.misconceptions.length > 0
        ? `\nStudent's Known Misconceptions:\n${teachingState.misconceptions.map((m: string) => `- ${m}`).join('\n')}`
        : '';

    const masteredStr =
      teachingState?.conceptsMastered && teachingState.conceptsMastered.length > 0
        ? `Concepts Mastered: ${teachingState.conceptsMastered.join(', ')}`
        : '';

    const customStr = customInstructions ? `\nSpecial Instructions: ${customInstructions}` : '';

    return `Generate a high-quality pedagogical assessment question matching these parameters:

Subject: "${strategy.subject}"
Grade/Level: "${strategy.grade || 'Standard School Curriculum'}"
Concept: "${strategy.concept}"
Assessment Goal: "${strategy.assessmentGoal}"
Difficulty Level: "${strategy.difficulty}"
Target Question Type: "${strategy.questionType}"
Evaluation Mode: "${strategy.evaluationMode}"
Assigned Marks: ${strategy.marks}
${masteredStr}
${misconceptionStr}
${ragContextStr}
${ragGuidance}
${customStr}

Question Construction Guidelines:
1. Construct the question strictly as a "${strategy.questionType}" designed for "${strategy.evaluationMode}" evaluation.
2. Ensure the question carries a depth appropriate for ${strategy.marks} mark(s).
3. If Question Type is "MCQ":
   - Provide an "options" array with exactly 4 options with ids "A", "B", "C", "D".
   - Set "correctOptionId" to the correct letter (e.g. "A", "B", "C", or "D").
   - Set "expectedAnswer" to the text of the correct option.
4. If Question Type is "NUMERICAL":
   - Provide the complete question text with necessary numbers and units.
   - Provide "expectedAnswer" with the final numerical value + unit.
   - In "rubric", provide "method", sequential "steps", and "finalAnswer".
5. If Evaluation Mode is "IMAGE_SOLUTION":
   - The question must require multi-step handwritten working on paper (e.g. solving equations, geometry proofs, physics derivations).
   - In "rubric", break down the mark allocation across method, calculation, intermediate steps, and final answer.
6. If Question Type is "SHORT_ANSWER" or "LONG_ANSWER":
   - Provide the question prompt, expected key points in "expectedAnswer", and structured marking criteria in "rubric".`;
  }

  /**
   * JSON Schema description for AIService structured output generation.
   */
  static getAssessmentQuestionSchemaDescription(): string {
    return `{
  "question": "string (the actual question prompt presented to the student)",
  "context": "string (optional background scenario, reading passage, or data given for the question)",
  "options": [
    {
      "id": "A" | "B" | "C" | "D",
      "text": "string (option text)"
    }
  ] (required if questionType is MCQ, exactly 4 items),
  "correctOptionId": "A" | "B" | "C" | "D" (required if questionType is MCQ),
  "expectedAnswer": "string (the complete reference solution or target answer for evaluation)",
  "rubric": {
    "method": "string (optional description of correct approach/formula)",
    "steps": ["string (step 1)", "string (step 2)"] (optional breakdown of working steps),
    "calculation": "string (optional key calculation breakdown)",
    "criteria": ["string (grading criterion)"] (optional scoring points for descriptive answers),
    "finalAnswer": "string (optional exact final answer)"
  } (required for NUMERICAL, LONG_ANSWER, or IMAGE_SOLUTION),
  "submissionGuidance": "string (optional student-facing advice for writing/submitting the solution)"
}`;
  }
}
