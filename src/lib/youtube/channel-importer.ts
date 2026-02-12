import { prisma } from "@/lib/prisma";
import { getChannelDetails, getPlaylistItems, getVideoDetails, parseDuration } from "./client";
import { trackQuota, hasQuotaBudget } from "./quota-tracker";
import { YOUTUBE_IMPORT_QUOTA_BUDGET, MAX_IMPORT_VIDEOS_PER_CHANNEL } from "@/lib/constants";

export async function importChannelVideos(channelId: string) {
  // Check quota
  if (!(await hasQuotaBudget(5, YOUTUBE_IMPORT_QUOTA_BUDGET))) {
    throw new Error("Daily import quota budget exceeded");
  }

  // Get channel uploads playlist
  const channelData = await getChannelDetails([channelId]);
  await trackQuota("channels.list");

  const channel = channelData.items[0];
  if (!channel) throw new Error(`Channel ${channelId} not found`);

  const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists.uploads;
  if (!uploadsPlaylistId) throw new Error("No uploads playlist found");

  // Upsert channel record
  await prisma.channel.upsert({
    where: { youtubeChannelId: channelId },
    create: {
      youtubeChannelId: channelId,
      name: channel.snippet.title,
      thumbnailUrl: channel.snippet.thumbnails.default?.url,
      subscriberCount: channel.statistics?.subscriberCount
        ? parseInt(channel.statistics.subscriberCount, 10)
        : null,
      videoCount: channel.statistics?.videoCount
        ? parseInt(channel.statistics.videoCount, 10)
        : null,
    },
    update: {
      name: channel.snippet.title,
      thumbnailUrl: channel.snippet.thumbnails.default?.url,
      subscriberCount: channel.statistics?.subscriberCount
        ? parseInt(channel.statistics.subscriberCount, 10)
        : null,
      videoCount: channel.statistics?.videoCount
        ? parseInt(channel.statistics.videoCount, 10)
        : null,
      lastImportedAt: new Date(),
    },
  });

  // Get video IDs from playlist (paginate up to MAX_IMPORT_VIDEOS_PER_CHANNEL)
  const videoIds: string[] = [];
  let pageToken: string | undefined;

  while (videoIds.length < MAX_IMPORT_VIDEOS_PER_CHANNEL) {
    if (!(await hasQuotaBudget(1, YOUTUBE_IMPORT_QUOTA_BUDGET))) break;

    const playlistData = await getPlaylistItems(
      uploadsPlaylistId,
      50,
      pageToken
    );
    await trackQuota("playlistItems.list");

    for (const item of playlistData.items) {
      videoIds.push(item.snippet.resourceId.videoId);
    }

    pageToken = playlistData.nextPageToken;
    if (!pageToken) break;
  }

  // Fetch video details in batches of 50
  let importedCount = 0;
  const dbChannel = await prisma.channel.findUnique({
    where: { youtubeChannelId: channelId },
  });

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    if (!(await hasQuotaBudget(1, YOUTUBE_IMPORT_QUOTA_BUDGET))) break;

    const videoData = await getVideoDetails(batch);
    await trackQuota("videos.list");

    for (const video of videoData.items) {
      const videoId = typeof video.id === "string" ? video.id : video.id.videoId;
      await prisma.video.upsert({
        where: { youtubeVideoId: videoId },
        create: {
          youtubeVideoId: videoId,
          channelId: dbChannel?.id,
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
        update: {
          title: video.snippet.title,
          description: video.snippet.description?.slice(0, 2000),
          thumbnails: video.snippet.thumbnails,
          viewCount: video.statistics?.viewCount
            ? parseInt(video.statistics.viewCount, 10)
            : null,
          lastFetchedAt: new Date(),
        },
      });
      importedCount++;
    }
  }

  return { channelName: channel.snippet.title, importedCount };
}

export async function importAllChannels() {
  const channels = await prisma.channel.findMany();
  const results: { channelId: string; channelName: string; importedCount: number; error?: string }[] = [];

  for (const channel of channels) {
    try {
      const result = await importChannelVideos(channel.youtubeChannelId);
      results.push({
        channelId: channel.youtubeChannelId,
        channelName: result.channelName,
        importedCount: result.importedCount,
      });
    } catch (error) {
      results.push({
        channelId: channel.youtubeChannelId,
        channelName: channel.name,
        importedCount: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}
