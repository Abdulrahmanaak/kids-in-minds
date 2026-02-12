import {
  GoogleGenerativeAI,
  type GenerativeModel,
  type Part,
} from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { AXIS_KEYS, type AxisKey } from "@/lib/rating/constants";
import { writeFile, unlink, mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

const MODEL_NAME = "gemini-2.0-flash";
const INLINE_SIZE_LIMIT = 15 * 1024 * 1024; // 15MB inline limit

let model: GenerativeModel | null = null;
let fileManager: GoogleAIFileManager | null = null;

function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return apiKey;
}

function getModel(): GenerativeModel {
  if (!model) {
    const genAI = new GoogleGenerativeAI(getApiKey());
    model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
        maxOutputTokens: 4096,
      },
    });
  }
  return model;
}

function getFileManager(): GoogleAIFileManager {
  if (!fileManager) {
    fileManager = new GoogleAIFileManager(getApiKey());
  }
  return fileManager;
}

export type GeminiReviewResult = {
  scores: Record<string, number>;
  evidence: Array<{
    axisKey: string;
    note: string;
    approximateOffsetMs: number | null;
  }>;
  summary: string;
};

async function createAudioPart(
  audioBuffer: Buffer,
  mimeType: string
): Promise<Part> {
  if (audioBuffer.length <= INLINE_SIZE_LIMIT) {
    // Send inline
    return {
      inlineData: {
        mimeType,
        data: audioBuffer.toString("base64"),
      },
    };
  }

  // Upload via File API for large files
  const tempDir = await mkdtemp(join(tmpdir(), "gemini-upload-"));
  const ext = mimeType === "audio/webm" ? "webm" : "mp4";
  const tempPath = join(tempDir, `audio.${ext}`);

  await writeFile(tempPath, audioBuffer);

  const fm = getFileManager();
  const uploadResult = await fm.uploadFile(tempPath, {
    mimeType,
    displayName: "youtube-audio",
  });

  await unlink(tempPath).catch(() => {});

  return {
    fileData: {
      mimeType,
      fileUri: uploadResult.file.uri,
    },
  };
}

const MAX_RETRIES = 6;
const INITIAL_BACKOFF_MS = 15_000; // 15s initial backoff

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const is429 =
        error instanceof Error && error.message.includes("429");
      if (!is429 || attempt === MAX_RETRIES) throw error;

      const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
      console.log(
        `[Gemini] 429 rate limited, retry ${attempt + 1}/${MAX_RETRIES} in ${Math.round(backoff / 1000)}s...`
      );
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw new Error("Unreachable");
}

export async function callGeminiWithAudio(
  prompt: string,
  audioBuffer: Buffer,
  mimeType: string
): Promise<GeminiReviewResult> {
  const geminiModel = getModel();
  const audioPart = await createAudioPart(audioBuffer, mimeType);

  return withRetry(async () => {
    const result = await geminiModel.generateContent([
      audioPart,
      { text: prompt },
    ]);
    const text = result.response.text();
    return parseGeminiResponse(text);
  });
}

export async function callGeminiTextOnly(
  prompt: string
): Promise<GeminiReviewResult> {
  const geminiModel = getModel();

  return withRetry(async () => {
    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();
    return parseGeminiResponse(text);
  });
}

function parseGeminiResponse(text: string): GeminiReviewResult {
  let parsed: GeminiReviewResult;
  try {
    const cleaned = text
      .replace(/^```json?\s*\n?/, "")
      .replace(/\n?```\s*$/, "");
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      `Failed to parse Gemini response as JSON: ${text.substring(0, 200)}`
    );
  }

  // Validate and clamp scores
  for (const key of AXIS_KEYS) {
    if (typeof parsed.scores[key] !== "number") {
      parsed.scores[key] = 0;
    }
    parsed.scores[key] = Math.max(0, Math.min(10, Math.round(parsed.scores[key])));
  }

  // Validate evidence
  if (!Array.isArray(parsed.evidence)) {
    parsed.evidence = [];
  }
  parsed.evidence = parsed.evidence.filter(
    (e) =>
      AXIS_KEYS.includes(e.axisKey as AxisKey) &&
      typeof e.note === "string" &&
      e.note.length > 0
  );

  if (!parsed.summary || typeof parsed.summary !== "string") {
    parsed.summary = "";
  }

  return parsed;
}
