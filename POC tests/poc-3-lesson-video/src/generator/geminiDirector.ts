import "dotenv/config";
import { LessonPlan, LessonPlanSchema } from "../schema/lessonPlanSchema.js";

const SYSTEM_PROMPT = `
You are an expert AI Lesson Director creating structured educational video lesson plans for Remotion.
Your task is to take a user's educational topic and create a comprehensive, engaging 60-90 second lesson plan broken into discrete visual scenes.

You MUST respond ONLY with valid JSON conforming to the following structure:
{
  "title": "Short catchy title",
  "subject": "e.g. Physics / Biology / Chemistry",
  "grade": "e.g. Class 9",
  "objective": "One clear sentence learning goal",
  "estimatedDuration": 75,
  "scenes": [
    {
      "id": "scene_1",
      "type": "INTRO",
      "duration": 8,
      "heading": "Title / Hook",
      "subheading": "Learning objective",
      "narration": "What the teacher avatar speaks in this scene (natural, friendly, educational).",
      "avatar": { "visible": true, "expression": "friendly", "position": "right" }
    },
    {
      "id": "scene_2",
      "type": "AVATAR_EXPLANATION",
      "duration": 10,
      "heading": "Intuition & Concept",
      "subheading": "Real-world analogy",
      "bullets": ["Point 1", "Point 2"],
      "narration": "Detailed engaging explanation.",
      "avatar": { "visible": true, "expression": "explaining", "position": "left" }
    },
    {
      "id": "scene_3",
      "type": "CONCEPT",
      "duration": 10,
      "heading": "Key Principles",
      "subheading": "Breakdown",
      "bullets": ["Principle A", "Principle B", "Principle C"],
      "narration": "Clear walkthrough of key points."
    },
    {
      "id": "scene_4",
      "type": "FORMULA",
      "duration": 10,
      "heading": "The Mathematical Law",
      "formula": "F = m · a",
      "formulaBreakdown": [
        { "symbol": "F", "meaning": "Net Force", "unit": "Newtons (N)" },
        { "symbol": "m", "meaning": "Mass", "unit": "Kilograms (kg)" },
        { "symbol": "a", "meaning": "Acceleration", "unit": "m/s²" }
      ],
      "narration": "Explanation of formula and units."
    },
    {
      "id": "scene_5",
      "type": "DIAGRAM",
      "duration": 10,
      "heading": "Visual Model",
      "subheading": "Applied Force & Acceleration",
      "diagramData": {
        "type": "FORCE_MASS_ACCEL",
        "primaryLabel": "Applied Force",
        "secondaryLabel": "Mass & Acceleration Vector"
      },
      "narration": "Walking through the diagram visual."
    },
    {
      "id": "scene_6",
      "type": "EXAMPLE",
      "duration": 12,
      "heading": "Real-World Problem",
      "exampleData": {
        "problem": "Calculate the force needed to accelerate a 5 kg block at 3 m/s².",
        "given": ["Mass (m) = 5 kg", "Acceleration (a) = 3 m/s²"],
        "steps": ["Formula: F = m × a", "Calculation: F = 5 × 3"],
        "answer": "F = 15 N"
      },
      "narration": "Step by step numerical walkthrough."
    },
    {
      "id": "scene_7",
      "type": "QUESTION",
      "duration": 10,
      "heading": "Quick Concept Check",
      "questionData": {
        "prompt": "If force is doubled on the same mass, what happens to acceleration?",
        "options": ["A) Halved", "B) Doubled", "C) Unchanged", "D) Zero"],
        "correctAnswer": "B) Doubled",
        "explanation": "Since a = F/m, acceleration is directly proportional to force."
      },
      "narration": "Ask the question, pause, then explain the answer."
    },
    {
      "id": "scene_8",
      "type": "SUMMARY",
      "duration": 8,
      "heading": "Great Job!",
      "summaryPoints": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
      "narration": "Recap summary and encouragement.",
      "avatar": { "visible": true, "expression": "enthusiastic", "position": "right" }
    }
  ]
}

ALLOWED SCENE TYPES ONLY: INTRO, AVATAR_EXPLANATION, CONCEPT, FORMULA, DIAGRAM, EXAMPLE, QUESTION, SUMMARY.
Do not output markdown explanation before or after the JSON.
`;

export async function generateLessonPlanWithGemini(userPrompt: string): Promise<LessonPlan> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "replace_me") {
    throw new Error("GEMINI_API_KEY is not configured in .env");
  }

  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  console.log(`🎬 [Gemini Director] Querying ${model} for topic: "${userPrompt}"...`);

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.3,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${err}`);
  }

  const data = (await response.json()) as any;
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error("Gemini returned empty response text.");
  }

  // Parse and validate with Zod
  let parsedJson: any;
  try {
    // Strip possible markdown fences if present
    const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    parsedJson = JSON.parse(cleaned);
  } catch (e: any) {
    throw new Error(`Failed to parse Gemini output as JSON: ${e.message}\nRaw output: ${rawText}`);
  }

  const validation = LessonPlanSchema.safeParse(parsedJson);
  if (!validation.success) {
    console.error("❌ Schema Validation Error:", validation.error.format());
    throw new Error(`LessonPlan validation failed: ${JSON.stringify(validation.error.issues, null, 2)}`);
  }

  console.log(`✅ [Gemini Director] Successfully generated & validated LessonPlan with ${validation.data.scenes.length} scenes.`);
  return validation.data;
}
