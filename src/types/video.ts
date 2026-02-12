import type { Video, RatingAggregate, Channel } from "@/generated/prisma/client";

export type VideoWithRating = Video & {
  ratingAggregate: RatingAggregate | null;
  channel: Channel | null;
};

export type VideoCardData = {
  id: string;
  youtubeVideoId: string;
  title: string;
  channelName: string | null;
  channelId: string | null;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  durationSec: number | null;
  ageRating: string | null;
  confidence: string | null;
  status: "SCANNED" | "UNSCANNED";
};

export type Thumbnails = {
  default?: { url: string; width: number; height: number };
  medium?: { url: string; width: number; height: number };
  high?: { url: string; width: number; height: number };
  standard?: { url: string; width: number; height: number };
  maxres?: { url: string; width: number; height: number };
};
