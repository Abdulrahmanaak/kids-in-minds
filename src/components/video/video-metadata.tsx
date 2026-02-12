import Link from "next/link";
import { Calendar, Clock, Eye } from "lucide-react";
import { formatDuration } from "@/lib/youtube/client";

type Props = {
  title: string;
  channelName: string | null;
  channelId: string | null;
  youtubeChannelId?: string | null;
  publishedAt: Date | null;
  durationSec: number | null;
  viewCount: number | null;
  description: string | null;
};

export function VideoMetadata({
  title,
  channelName,
  channelId,
  youtubeChannelId,
  publishedAt,
  durationSec,
  viewCount,
  description,
}: Props) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl md:text-2xl font-bold leading-relaxed">{title}</h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {channelName && (
          <span className="font-medium text-foreground">
            {youtubeChannelId ? (
              <Link
                href={`/channel/${youtubeChannelId}`}
                className="hover:text-primary transition-colors"
              >
                {channelName}
              </Link>
            ) : (
              channelName
            )}
          </span>
        )}
        {publishedAt && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {publishedAt.toLocaleDateString("ar-SA")}
          </span>
        )}
        {durationSec && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(durationSec)}
          </span>
        )}
        {viewCount && (
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {viewCount.toLocaleString("ar-SA")} مشاهدة
          </span>
        )}
      </div>

      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-4">
          {description}
        </p>
      )}
    </div>
  );
}
