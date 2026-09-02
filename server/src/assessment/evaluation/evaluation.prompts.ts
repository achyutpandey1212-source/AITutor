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
   - recommendedAction: "CONTINUE" | "INCREASE_DIFFICULTY" | "TARGETED_PRACTICE" | "REMEDIAL_PRACTICE" | "RETRY" | "NEEDS_REVIEW"
   - failureReason: "IMAGE_UNREADABLE" | "IMAGE_INCOMPLETE" | "PROVIDER_UNAVAILABLE" | "MODEL_FAILURE" | "TIMEOUT" | "MALFORMED_OUTPUT" | "LOW_CONFIDENCE" | "NONE"`;
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
  "failureReason": "IMAGE_UNREADABLE" | "IMAGE_INCOMPLETE" | "PROVIDER_UNAVAILABLE" | "MODEL_FAILURE" | "TIMEOUT" | "MALFORMED_OUTPUT" | "LOW_CONFIDENCE" | "NONE",
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

HANDWRITING & REAL NOTEBOOK WORK EVALUATION RULES:
1. MESSY ≠ UNREADABLE:
   - Real student notebook work contains uneven handwriting, crossed-out expressions, margin scratch work, arrows, corrections, cramped lines, overwritten numbers, minor shadows, or slightly tilted photographs.
   - Do NOT reject or mark "NEEDS_REVIEW" simply because the work is informal or messy.
   - Actively follow the student's mathematical logic trail and reconstruct their step-by-step reasoning.
2. KEY REASONING ELEMENTS TO RECONSTRUCT:
   - Identify: (a) Formula / method selected, (b) Equation setup, (c) Values substituted, (d) Intermediate calculations / transformations, (e) Units, (f) Final boxed / underlined answer.
3. ISOLATING METHOD ERRORS VS ARITHMETIC SLIPS:
   - If the student selects the correct algebraic method/formula and sets up equations accurately, but makes a minor arithmetic slip during simplification:
     * Award partial credit for setup & substitution.
     * Set methodSelection: "strong" and calculation: "weak".
     * Explain the exact arithmetic slip constructively.
   - If the conceptual method itself is wrong, set methodSelection: "weak".
4. NO HALLUCINATION RULE:
   - NEVER invent or fabricate unseen symbols or calculations.
   - If a specific intermediate step is genuinely smudged or ambiguous, mark that specific step status as "unclear".
   - Only return evaluationStatus: "NEEDS_REVIEW", confidence < 0.5, and failureReason: "IMAGE_UNREADABLE" (or "IMAGE_INCOMPLETE") if the image is so severely blurred, dark, or cropped that essential parts of the solution cannot be interpreted with reasonable confidence.`;
  }
}
