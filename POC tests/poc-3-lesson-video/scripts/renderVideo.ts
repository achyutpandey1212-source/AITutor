import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { LessonPlan, LessonPlanSchema } from "../src/schema/lessonPlanSchema.js";
import { generateAudioFixturesForPlan } from "../src/generator/ttsGenerator.js";

export async function renderLessonVideo(
  planInput: LessonPlan | string,
  outputFilename = "lesson_video.mp4"
): Promise<{ outputPath: string; durationInSeconds: number; fileSizeMb: number }> {
  let plan: LessonPlan;

  if (typeof planInput === "string") {
    const raw = fs.readFileSync(path.resolve(planInput), "utf8");
    plan = LessonPlanSchema.parse(JSON.parse(raw));
  } else {
    plan = LessonPlanSchema.parse(planInput);
  }

  const outDir = path.resolve("./out");
  const audioDir = path.resolve("./out/audio");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outputPath = path.join(outDir, outputFilename);

  console.log("==================================================");
  console.log(`🎬 [Remotion Engine] Rendering Video: "${plan.title}"`);
  console.log(`🎯 Output target: ${outputPath}`);
  console.log("==================================================");

  // 1. Generate audio fixtures for narration synchronization
  const audioMap = await generateAudioFixturesForPlan(plan.scenes, audioDir);

  // 2. Bundle Remotion Root
  console.log("📦 Bundling Remotion composition...");
  const bundleLocation = await bundle({
    entryPoint: path.resolve("./src/index.ts"),
    webpackOverride: (config) => config,
  });

  // 3. Select composition with dynamic props
  console.log("🔍 Selecting Composition 'LessonVideo'...");
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "LessonVideo",
    inputProps: {
      plan,
      audioClips: audioMap,
    },
  });

  const totalFrames = composition.durationInFrames;
  console.log(`⏱️ Composition selected: ${composition.width}x${composition.height} @ ${composition.fps}fps, ${totalFrames} frames (~${Math.round(totalFrames / composition.fps)}s)`);

  // 4. Render Media to MP4
  console.log("🚀 Starting media rendering (H.264 MP4)...");
  const startTime = performance.now();

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputPath,
    inputProps: {
      plan,
      audioClips: audioMap,
    },
    onProgress: ({ renderedFrames, progress }) => {
      const pct = Math.round(progress * 100);
      process.stdout.write(`\r rendering frames: ${renderedFrames}/${totalFrames} [${pct}%]`);
    },
  });

  const renderTimeSec = Math.round((performance.now() - startTime) / 1000);
  const stats = fs.statSync(outputPath);
  const fileSizeMb = Number((stats.size / (1024 * 1024)).toFixed(2));
  const durationInSeconds = Math.round(composition.durationInFrames / composition.fps);

  console.log(`\n\n🎉 [Render Complete] MP4 created in ${renderTimeSec}s!`);
  console.log(`📁 File: ${outputPath}`);
  console.log(`📊 Size: ${fileSizeMb} MB`);
  console.log(`⏱️ Duration: ${durationInSeconds} seconds`);

  return { outputPath, durationInSeconds, fileSizeMb };
}

async function main() {
  const planArg = process.argv[2] || "./src/fixtures/newtonLessonPlan.json";
  const outArg = process.argv[3] || "newton_lesson.mp4";
  await renderLessonVideo(planArg, outArg);
}

if (process.argv[1] && path.basename(process.argv[1]).includes("renderVideo")) {
  main().catch((err) => {
    console.error("❌ Render failed:", err);
    process.exit(1);
  });
}
