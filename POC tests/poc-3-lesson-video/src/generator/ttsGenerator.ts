import fs from "node:fs";
import path from "node:path";
import { Scene } from "../schema/lessonPlanSchema";

export function generateWavBuffer(durationSeconds: number, frequency = 440): Buffer {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = numSamples * 2;
  const fileSize = 44 + dataSize;
  const buffer = Buffer.alloc(fileSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(fileSize - 8, 4);
  buffer.write("WAVE", 8);

  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);

  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.min(t / 0.5, (durationSeconds - t) / 0.5, 1.0);
    const sample = Math.sin(2 * Math.PI * frequency * t) * 0.04 * Math.max(0, envelope);
    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  return buffer;
}

export async function generateAudioFixturesForPlan(
  scenes: Scene[],
  outputDir: string
): Promise<Record<string, string>> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const audioMap: Record<string, string> = {};
  console.log(`🎙️ [Audio Engine] Generating synchronized audio clips for ${scenes.length} scenes...`);

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const filename = `${scene.id}_audio.wav`;
    const filepath = path.join(outputDir, filename);
    
    const freq = 320 + i * 40;
    const wavBuffer = generateWavBuffer(scene.duration, freq);
    fs.writeFileSync(filepath, wavBuffer);
    
    const base64Wav = wavBuffer.toString("base64");
    audioMap[scene.id] = `data:audio/wav;base64,${base64Wav}`;
  }

  console.log(`✅ [Audio Engine] Successfully generated ${Object.keys(audioMap).length} audio tracks.`);
  return audioMap;
}