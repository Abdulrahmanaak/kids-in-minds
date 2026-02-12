import { z } from "zod";
import { AXIS_KEYS } from "./rating/constants";

// ─── Axis Scores ──────────────────────────────

const axisScoreSchema = z.number().int().min(0).max(10);

export const axisScoresSchema = z.object(
  Object.fromEntries(AXIS_KEYS.map((k) => [k, axisScoreSchema])) as Record<
    (typeof AXIS_KEYS)[number],
    z.ZodNumber
  >
);

// ─── Evidence ─────────────────────────────────

export const evidenceItemSchema = z.object({
  axisKey: z.enum(AXIS_KEYS),
  startMs: z.number().int().min(0).nullable(),
  endMs: z.number().int().min(0).nullable(),
  note: z.string().min(1).max(500),
});

export const evidenceArraySchema = z.array(evidenceItemSchema);

// ─── Rating Entry (Admin) ─────────────────────

export const ratingEntrySchema = z.object({
  scores: axisScoresSchema,
  evidence: evidenceArraySchema.optional().default([]),
});

// ─── Search ───────────────────────────────────

export const searchParamsSchema = z.object({
  q: z.string().min(1).max(200).optional(),
  ageRating: z.enum(["G", "PG", "PG12", "PG15", "R15", "R18"]).optional(),
  channelId: z.string().optional(),
  status: z.enum(["SCANNED", "UNSCANNED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// ─── Submission ───────────────────────────────

export const submissionSchema = z.object({
  videoUrl: z
    .string()
    .url()
    .refine(
      (url) => {
        try {
          const u = new URL(url);
          return (
            u.hostname === "www.youtube.com" ||
            u.hostname === "youtube.com" ||
            u.hostname === "youtu.be" ||
            u.hostname === "m.youtube.com"
          );
        } catch {
          return false;
        }
      },
      { message: "يجب أن يكون رابط يوتيوب صالح" }
    ),
  note: z.string().max(500).optional(),
});

// ─── Report ───────────────────────────────────

export const reportSchema = z.object({
  videoId: z.string().min(1),
  ratingId: z.string().optional(),
  category: z.enum(["INACCURATE", "MISSING_EVIDENCE", "WRONG_AGE_RATING", "OTHER"]),
  message: z.string().min(10).max(1000),
});

// ─── Review ───────────────────────────────────

export const reviewActionSchema = z.object({
  itemId: z.string().min(1),
  action: z.enum(["APPROVED", "REJECTED", "DISMISSED"]),
  reviewerNote: z.string().max(500).optional(),
});

// ─── YouTube URL ──────────────────────────────

export const youtubeUrlSchema = z.object({
  url: z.string().url(),
});

// ─── Channel Import ───────────────────────────

export const channelImportSchema = z.object({
  youtubeChannelId: z.string().min(1),
  name: z.string().min(1),
  nameAr: z.string().optional(),
  teamTag: z.string().optional(),
});
