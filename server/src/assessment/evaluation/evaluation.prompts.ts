import type {
  AssessmentQuestion,
  AssessmentSubmission,
  KnowledgeContext,
} from '@ai-tutor/shared';

export class EvaluationPrompts {
  /**
   * Universal System Instruction for Assessment Evaluators
   */
  static getEvaluatorSystemInstruction(): string {
    return `You are an expert pedagogical assessment grader, tutor, and misconception diagnostic specialist.
Your responsibility:
1. OUTPUT FORMAT: Respond strictly with the requested JSON schema. Do not output markdown code blocks (\`\`\`json), conversational commentary, or explanations outside the JSON object.
2. OBJECTIVE GRADING: Base scoring strictly on the question's rubric criteria and expected answer. Award appropriate partial credit for correct steps/methods.
3. SEMANTIC UNDERSTANDING: Do not judge purely on surface-level keyword match. A student who expresses the core concept accurately in their own words deserves full credit.
4. DIAGNOSTIC PRECISION: Identify exact misconceptions, arithmetic slips, missing essential points, and specific strengths.
5. CONSTRUCTIVE STUDENT FEEDBACK:
   - Provide a clear, supportive student-facing feedback message.
   - Highlight what the student did well.
   - Clearly explain where the error occurred and what the correct approach is.
   - Suggest a concrete next learning step.
6. ENUM RESTRICTIONS:
   - status: "correct" | "partially_correct" | "incorrect" | "unclear"
   - understanding / methodSelection / calculation / completeness / reasoning: "strong" | "moderate" | "weak" | "unclear"
   - recommendedAction: "CONTINUE" | "INCREASE_DIFFICULTY" | "TARGETED_PRACTICE" | "REMEDIAL_PRACTICE" | "RETRY" | "NEEDS_REVIEW"`;
  }

  /**
   * JSON Schema description for structured evaluator responses.
   */
  static getEvaluationSchemaDescription(): string {
    return `{
  "correct": boolean, // true if full or nearly full marks awarded
  "score": number, // awarded score between 0 and maxScore
  "maxScore": number, // total available marks for the question
  "stepEvaluation": [ // step-by-step or criterion breakdown
    {
      "step": 1, // step number or criterion name
      "criterion": "Formula Selection",
      "status": "correct" | "partially_correct" | "incorrect" | "unclear",
      "score": 1,
      "maxScore": 1,
      "feedback": "Correct formula identified."
    }
  ],
  "conceptAssessment": {
    "understanding": "strong" | "moderate" | "weak" | "unclear",
    "methodSelection": "strong" | "moderate" | "weak" | "unclear",
    "calculation": "strong" | "moderate" | "weak" | "unclear",
    "completeness": "strong" | "moderate" | "weak" | "unclear",
    "reasoning": "strong" | "moderate" | "weak" | "unclear"
  },
  "misconceptions": ["string describing specific detected misconception"],
  "strengths": ["string describing specific strength shown"],
  "weaknesses": ["string describing specific error or weakness"],
  "recommendedAction": "CONTINUE" | "INCREASE_DIFFICULTY" | "TARGETED_PRACTICE" | "REMEDIAL_PRACTICE" | "RETRY" | "NEEDS_REVIEW",
  "confidence": number, // 0.0 to 1.0 (confidence in reading/evaluating the answer)
  "feedback": "Clear, friendly student feedback with what was done well, what went wrong, and next step."
}`;
  }

  /**
   * Builds prompt for Short Answer and Long Answer text submissions.
   */
  static buildTextEvaluationPrompt(
    question: AssessmentQuestion,
    submission: AssessmentSubmission,
    knowledgeContext?: KnowledgeContext
  ): string {
    let rubricStr = 'Standard conceptual correctness and completeness.';
    if (question.rubric) {
      const parts: string[] = [];
      if (question.rubric.method) parts.push(`Expected Method: ${question.rubric.method}`);
      if (question.rubric.steps && question.rubric.steps.length > 0) {
        parts.push(`Steps:\n${question.rubric.steps.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}`);
      }
      if (question.rubric.criteria && question.rubric.criteria.length > 0) {
        parts.push(`Criteria:\n${question.rubric.criteria.map((c: any) => typeof c === 'string' ? `  - ${c}` : `  - ${c.criterion || ''} (${c.marks || 1} marks): ${c.description || ''}`).join('\n')}`);
      }
      if (question.rubric.finalAnswer) parts.push(`Final Answer: ${question.rubric.finalAnswer}`);
      if (parts.length > 0) {
        rubricStr = parts.join('\n');
      }
    }

    let ragStr = '';
    if (
      knowledgeContext &&
      knowledgeContext.retrievedChunks &&
      knowledgeContext.retrievedChunks.length > 0 &&
      knowledgeContext.relevantContextFound
    ) {
      ragStr = `\n--- GROUNDED STUDY MATERIAL REFERENCE ---\n${knowledgeContext.retrievedChunks
        .map((c) => c.text)
        .join('\n\n')}\n----------------------------------------\n`;
    }

    return `Evaluate this student text submission for a ${question.questionType} question.

SUBJECT: ${question.subject}
CONCEPT: ${question.concept}
DIFFICULTY: ${question.difficulty}
TOTAL MARKS: ${question.marks}

QUESTION:
"${question.question}"

EXPECTED ANSWER:
"${question.expectedAnswer || 'See rubric criteria below.'}"

EVALUATION RUBRIC:
${rubricStr}
${ragStr}
STUDENT SUBMITTED ANSWER:
"""
${submission.answer || ''}
"""

Evaluate the answer against the rubric. Award appropriate partial credit. Avoid penalizing harmless differences in phrasing.`;
  }

  /**
   * Builds prompt for Numerical submissions.
   */
  static buildNumericalEvaluationPrompt(
    question: AssessmentQuestion,
    submission: AssessmentSubmission
  ): string {
    let rubricStr = 'Final numerical answer matches expected answer with correct units.';
    if (question.rubric) {
      const parts: string[] = [];
      if (question.rubric.method) parts.push(`Expected Method: ${question.rubric.method}`);
      if (question.rubric.steps && question.rubric.steps.length > 0) {
        parts.push(`Steps:\n${question.rubric.steps.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}`);
      }
      if (question.rubric.criteria && question.rubric.criteria.length > 0) {
        parts.push(`Criteria:\n${question.rubric.criteria.map((c: any) => typeof c === 'string' ? `  - ${c}` : `  - ${c.criterion || ''} (${c.marks || 1} marks): ${c.description || ''}`).join('\n')}`);
      }
      if (question.rubric.finalAnswer) parts.push(`Final Answer: ${question.rubric.finalAnswer}`);
      if (parts.length > 0) {
        rubricStr = parts.join('\n');
      }
    }

    return `Evaluate this student numerical submission.

SUBJECT: ${question.subject}
CONCEPT: ${question.concept}
TOTAL MARKS: ${question.marks}

QUESTION:
"${question.question}"

EXPECTED FINAL ANSWER:
"${question.expectedAnswer || ''}"

RUBRIC:
${rubricStr}

STUDENT SUBMITTED VALUE / ANSWER:
"""
${submission.answer || ''}
"""

Instructions:
1. Check the final numerical value and units.
2. If the student provided working or intermediate values, evaluate method selection vs arithmetic calculation.
3. If the method is correct but arithmetic has a minor error, award partial credit and classify methodSelection as "strong" and calculation as "weak".
4. Determine the appropriate score out of ${question.marks}.`;
  }

  /**
   * Builds prompt for Multimodal Handwritten Image Solution evaluation.
   */
  static buildImageSolutionEvaluationPrompt(
    question: AssessmentQuestion
  ): string {
    let rubricStr = '';
    if (question.rubric) {
      const parts: string[] = [];
      if (question.rubric.method) parts.push(`Expected Method: ${question.rubric.method}`);
      if (question.rubric.steps && question.rubric.steps.length > 0) {
        parts.push(`Steps:\n${question.rubric.steps.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}`);
      }
      if (question.rubric.criteria && question.rubric.criteria.length > 0) {
        parts.push(`Criteria:\n${question.rubric.criteria.map((c: any) => typeof c === 'string' ? `  - ${c}` : `  - ${c.criterion || ''} (${c.marks || 1} marks): ${c.description || ''}`).join('\n')}`);
      }
      if (question.rubric.finalAnswer) parts.push(`Final Answer: ${question.rubric.finalAnswer}`);
      if (parts.length > 0) {
        rubricStr = parts.join('\n');
      }
    }

    return `Carefully inspect and evaluate this student's handwritten notebook solution from the attached image.

SUBJECT: ${question.subject}
CONCEPT: ${question.concept}
TOTAL MARKS: ${question.marks}

QUESTION:
"${question.question}"

EXPECTED FINAL ANSWER:
"${question.expectedAnswer || ''}"

STEP-BY-STEP RUBRIC:
${rubricStr || 'Show full mathematical steps, substitutions, calculations, and final answer.'}

HANDWRITING & IMAGE INSPECTION RULES:
1. LEGIBILITY & CONFIDENCE:
   - If the handwriting is too blurry, cropped, dark, or illegible to grade with confidence, set "confidence" < 0.5, "evaluationStatus": "NEEDS_REVIEW", "recommendedAction": "NEEDS_REVIEW", and ask for a clearer photo in feedback.
   - Do NOT invent or hallucinate unreadable steps.
2. DISTINGUISH ROUGH WORK:
   - Handwritten work often contains crossed-out calculations, margin rough work, or side notes. Look for the main logical sequence of working leading to the final answer.
3. STEP-BY-STEP EVALUATION:
   - Identify Step 1 (Formula / Setup), Step 2 (Substitution), Step 3 (Calculation), and Final Answer.
   - Award partial credit for each correct step shown on paper.
4. CALCULATION ERRORS VS CONCEPT:
   - If formula and setup are correct on the paper but a calculation error occurred in intermediate steps, distinguish this in conceptAssessment (methodSelection: "strong", calculation: "weak").`;
  }
}
