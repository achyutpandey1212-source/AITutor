import fs from "node:fs";
import path from "node:path";
import { generateLessonPlanWithGemini } from "../src/generator/geminiDirector.js";

async function main() {
  const prompt = process.argv[2] || "Teach Newton's Second Law to a Class 9 student who is a beginner. Create a short engaging lesson with an explanation, visual analogy, formula, worked example, and a quick question at the end.";
  console.log("==================================================");
  console.log("🚀 POC #3: Generating Lesson Plan via Gemini Director");
  console.log("==================================================");
  console.log(`Prompt: "${prompt}"\n`);

  try {
    const plan = await generateLessonPlanWithGemini(prompt);
    const outPath = path.resolve("./src/fixtures/generatedLessonPlan.json");
    fs.writeFileSync(outPath, JSON.stringify(plan, null, 2), "utf8");
    console.log(`\n🎉 Success! Validated LessonPlan saved to: ${outPath}`);
    console.log(`Title: ${plan.title}`);
    console.log(`Grade/Subject: ${plan.grade} • ${plan.subject}`);
    console.log(`Total Scenes: ${plan.scenes.length}`);
    console.log(`Estimated Duration: ${plan.estimatedDuration}s`);
  } catch (error: any) {
    console.error("❌ Generation Failed:", error.message);
    process.exit(1);
  }
}

main();
