import { YOUTUBE_API_BASE } from "@/lib/constants";

const API_KEY = process.env.YOUTUBE_API_KEY!;

type YouTubeApiParams = Record<string, string | number | undefined>;

async function ytFetch<T>(endpoint: string, params: YouTubeApiParams): Promise<T> {
  const url = new URL(`${YOUTUBE_API_BASE}/${endpoint}`);
  url.searchParams.set("key", API_KEY);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`YouTube API error (${res.status}): ${error}`);
  }
  return res.json() as Promise<T>;
}

// ─── Types ───────────────────────────────────

export type YouTubeVideoItem = {
  id: string | { videoId: string };
  snippet: {
    title: string;
    description: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: Record<string, { url: string; width: number; height: number }>;
  };
  contentDetails?: {
    duration: string; // ISO 8601 e.g. "PT4M13S"
  };
  statistics?: {
    viewCount: string;
  };
};

export type YouTubeChannelItem = {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: Record<string, { url: string; width: number; height: number }>;
  };
  statistics?: {
    subscriberCount: string;
    videoCount: string;
  };
  contentDetails?: {
    relatedPlaylists: {
      uploads: string;
    };
  };
};

type YouTubeListResponse<T> = {
  items: T[];
  pageInfo: { totalResults: number; resultsPerPage: number };
  nextPageToken?: string;
};

// ─── API Methods ─────────────────────────────

export async function searchVideos(query: string, maxResults = 10) {
  return ytFetch<YouTubeListResponse<YouTubeVideoItem>>("search", {
    part: "snippet",
    type: "video",
    q: query,
    maxResults,
    order: "relevance",
    regionCode: "SA",
    relevanceLanguage: "ar",
  });
}

export async function getVideoDetails(videoIds: string[]) {
  return ytFetch<YouTubeListResponse<YouTubeVideoItem>>("videos", {
    part: "snippet,contentDetails,statistics",
    id: videoIds.join(","),
  });
}

export async function getChannelDetails(channelIds: string[]) {
  return ytFetch<YouTubeListResponse<YouTubeChannelItem>>("channels", {
    part: "snippet,statistics,contentDetails",
    id: channelIds.join(","),
  });
}

export async function getPlaylistItems(playlistId: string, maxResults = 50, pageToken?: string) {
  return ytFetch<YouTubeListResponse<{ snippet: { resourceId: { videoId: string } } }>>(
    "playlistItems",
    {
      part: "snippet",
      playlistId,
      maxResults,
      pageToken,
    }
  );
}

// ─── Helpers ─────────────────────────────────

export function parseDuration(iso8601: string): number {
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
