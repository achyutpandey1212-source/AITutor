import { z } from "zod";

export const SceneTypeSchema = z.enum([
  "INTRO",
  "AVATAR_EXPLANATION",
  "CONCEPT",
  "FORMULA",
  "DIAGRAM",
  "EXAMPLE",
  "QUESTION",
  "SUMMARY",
]);

export type SceneType = z.infer<typeof SceneTypeSchema>;

export const AvatarConfigSchema = z.object({
  visible: z.boolean().default(true),
  expression: z.enum(["friendly", "explaining", "enthusiastic", "questioning"]).default("friendly"),
  position: z.enum(["left", "right", "center"]).default("right"),
});

export const FormulaVariableSchema = z.object({
  symbol: z.string(),
  meaning: z.string(),
  unit: z.string().optional(),
});

export const DiagramDataSchema = z.object({
  type: z.string().default("FORCE_MASS_ACCEL"),
  primaryLabel: z.string(),
  secondaryLabel: z.string().optional(),
  details: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        color: z.string().optional(),
      })
    )
    .optional(),
});

export const ExampleDataSchema = z.object({
  problem: z.string(),
  given: z.array(z.string()).default([]),
  steps: z.array(z.string()).default([]),
  answer: z.string(),
});

export const QuestionDataSchema = z.object({
  prompt: z.string(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  explanation: z.string(),
});

export const SceneSchema = z.object({
  id: z.string(),
  type: SceneTypeSchema,
  duration: z.number().min(3).max(25), // Duration in seconds per scene
  narration: z.string(),
  heading: z.string(),
  subheading: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  formula: z.string().optional(),
  formulaBreakdown: z.array(FormulaVariableSchema).optional(),
  diagramData: DiagramDataSchema.optional(),
  exampleData: ExampleDataSchema.optional(),
  questionData: QuestionDataSchema.optional(),
  summaryPoints: z.array(z.string()).optional(),
  avatar: AvatarConfigSchema.optional(),
});

export type Scene = z.infer<typeof SceneSchema>;

export const LessonPlanSchema = z.object({
  title: z.string(),
  subject: z.string(),
  grade: z.string(),
  objective: z.string(),
  estimatedDuration: z.number(),
  scenes: z.array(SceneSchema).min(3),
});

export type LessonPlan = z.infer<typeof LessonPlanSchema>;
