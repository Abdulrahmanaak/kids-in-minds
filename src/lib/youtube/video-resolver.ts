import { prisma } from "@/lib/prisma";
import { getVideoDetails, parseDuration } from "./client";
import { trackQuota, hasQuotaBudget } from "./quota-tracker";
import { YOUTUBE_USER_QUOTA_BUDGET } from "@/lib/constants";

const YOUTUBE_URL_PATTERNS = [
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  /(?:https?:\/\/)?m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
];

export function extractVideoId(url: string): string | null {
  for (const pattern of YOUTUBE_URL_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  // If it looks like a raw video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  return null;
}

export async function resolveVideo(urlOrId: string) {
  const youtubeVideoId = extractVideoId(urlOrId);
  if (!youtubeVideoId) throw new Error("رابط يوتيوب غير صالح");

  // Check DB cache first
  const existing = await prisma.video.findUnique({
    where: { youtubeVideoId },
    include: { ratingAggregate: true, channel: true },
  });

  if (existing) return existing;

  // Fetch from YouTube API
  if (!(await hasQuotaBudget(1, YOUTUBE_USER_QUOTA_BUDGET))) {
    throw new Error("تجاوز حصة البحث اليومية");
  }

  const data = await getVideoDetails([youtubeVideoId]);
  await trackQuota("videos.list");

  const video = data.items[0];
  if (!video) throw new Error("الفيديو غير موجود");

  const videoId = typeof video.id === "string" ? video.id : video.id.videoId;

  // Try to find existing channel
  const channelRecord = await prisma.channel.findUnique({
    where: { youtubeChannelId: video.snippet.channelId },
  });

  const created = await prisma.video.create({
    data: {
      youtubeVideoId: videoId,
      channelId: channelRecord?.id,
      title: video.snippet.title,
      description: video.snippet.description?.slice(0, 2000),
      publishedAt: new Date(video.snippet.publishedAt),
      durationSec: video.contentDetails
        ? parseDuration(video.contentDetails.duration)
        : null,
      thumbnails: video.snippet.thumbnails,
      viewCount: video.statistics?.viewCount
        ? parseInt(video.statistics.viewCount, 10)
        : null,
    },
    include: { ratingAggregate: true, channel: true },
  });

  return created;
}
