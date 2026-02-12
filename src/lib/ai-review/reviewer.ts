import { prisma } from "@/lib/prisma";
import { computeAgeRating, computeConfidence, validateScores } from "@/lib/rating/engine";
import type { AxisScores } from "@/lib/rating/engine";
import type { Prisma } from "@/generated/prisma/client";
import { extractAudio } from "./audio-extractor";
import { buildReviewPrompt } from "./prompt";
import { callGeminiWithAudio, callGeminiTextOnly } from "./gemini-client";
import { waitForRateLimit, recordRequest } from "./rate-limiter";

export type ReviewResult = {
  videoId: string;
  youtubeVideoId: string;
  ageRating: string;
  confidence: string;
  scores: Record<string, number>;
  evidenceCount: number;
  summary: string;
  hadAudio: boolean;
};

export async function reviewVideo(videoDbId: string): Promise<ReviewResult> {
  const video = await prisma.video.findUnique({
    where: { id: videoDbId },
  });
  if (!video) throw new Error(`Video not found: ${videoDbId}`);

  // Try to extract audio
  let audioBuffer: Buffer | null = null;
  let audioMimeType = "audio/webm";
  let audioDurationSec: number | null = null;
  let audioSizeBytes = 0;

  try {
    console.log(`[AI Review] Extracting audio for ${video.youtubeVideoId}...`);
    const audio = await extractAudio(video.youtubeVideoId);
    audioBuffer = audio.buffer;
    audioMimeType = audio.mimeType;
    audioDurationSec = audio.durationSec;
    audioSizeBytes = audio.fileSizeBytes;
    console.log(
      `[AI Review] Audio extracted: ${(audioSizeBytes / 1024 / 1024).toFixed(1)}MB, ` +
      `duration: ${audioDurationSec ?? "unknown"}s, mime: ${audioMimeType}`
    );
  } catch (error) {
    console.warn(
      `[AI Review] Audio extraction failed for ${video.youtubeVideoId}, falling back to text-only:`,
      error instanceof Error ? error.message : error
    );
  }

  const hasAudio = audioBuffer !== null;

  // Build prompt
  const prompt = buildReviewPrompt({
    title: video.title,
    description: video.description ?? "",
    hasAudio,
  });

  // Rate limit then call Gemini
  await waitForRateLimit();
  recordRequest();

  let geminiResult;
  if (audioBuffer) {
    console.log(`[AI Review] Calling Gemini with audio for ${video.youtubeVideoId}...`);
    geminiResult = await callGeminiWithAudio(prompt, audioBuffer, audioMimeType);
  } else {
    console.log(`[AI Review] Calling Gemini text-only for ${video.youtubeVideoId}...`);
    geminiResult = await callGeminiTextOnly(prompt);
  }

  // Validate scores
  if (!validateScores(geminiResult.scores)) {
    throw new Error("Gemini returned invalid scores");
  }
  const scores = geminiResult.scores as AxisScores;

  // Compute rating and confidence
  const ageRating = computeAgeRating(scores);
  const confidence = computeConfidence(1, "AI_GEMINI");

  // Map evidence items
  const evidenceItems = geminiResult.evidence.map((e) => ({
    axisKey: e.axisKey,
    startMs: e.approximateOffsetMs,
    endMs: null as number | null,
    note: e.note.slice(0, 500),
  }));

  // Save to DB
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.scanRun.create({
      data: {
        videoId: video.id,
        clientType: "AI_GEMINI",
        qualityMetrics: {
          model: "gemini-2.0-flash",
          hadAudio: hasAudio,
          audioSizeBytes: audioSizeBytes,
          audioDurationSec: audioDurationSec,
          audioMimeType: hasAudio ? audioMimeType : null,
        },
        evidence: {
          create: evidenceItems,
        },
      },
    });

    await tx.ratingAggregate.upsert({
      where: { videoId: video.id },
      create: {
        videoId: video.id,
        ageRating,
        confidence,
        scores,
        evidencePreview: evidenceItems,
        status: "SCANNED",
        scansCount: 1,
      },
      update: {
        ageRating,
        confidence,
        scores,
        evidencePreview: evidenceItems,
        status: "SCANNED",
        scansCount: { increment: 1 },
        lastUpdatedAt: new Date(),
      },
    });
  });

  return {
    videoId: video.id,
    youtubeVideoId: video.youtubeVideoId,
    ageRating,
    confidence,
    scores: geminiResult.scores,
    evidenceCount: evidenceItems.length,
    summary: geminiResult.summary,
    hadAudio: hasAudio,
  };
}

export async function reviewUnscannedVideos(limit = 500): Promise<ReviewResult[]> {
  const unscanned = await prisma.video.findMany({
    where: { ratingAggregate: null },
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  console.log(`[AI Review] Starting bulk review of ${unscanned.length} videos...`);

  const results: ReviewResult[] = [];
  for (let i = 0; i < unscanned.length; i++) {
    const video = unscanned[i];
    try {
      console.log(`[AI Review] Processing ${i + 1}/${unscanned.length}: ${video.youtubeVideoId}`);
      const result = await reviewVideo(video.id);
      results.push(result);
      console.log(`[AI Review] ✓ ${video.youtubeVideoId} → ${result.ageRating} (${results.length} done)`);
    } catch (error) {
      console.error(
        `[AI Review] ✗ ${video.youtubeVideoId} failed:`,
        error instanceof Error ? error.message : error
      );
    }

    // Delay between videos to respect Gemini rate limits
    if (i < unscanned.length - 1) {
      await new Promise((r) => setTimeout(r, 4000));
    }
  }

  console.log(`[AI Review] Bulk review complete: ${results.length}/${unscanned.length} succeeded`);
  return results;
}
