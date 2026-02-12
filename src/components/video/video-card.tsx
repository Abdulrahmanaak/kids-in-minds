import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { AgeRatingBadge } from "@/components/rating/age-rating-badge";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/youtube/client";
import type { VideoCardData } from "@/types/video";

type Props = {
  video: VideoCardData;
};

export function VideoCard({ video }: Props) {
  const thumbnailUrl =
    video.thumbnailUrl || `https://i.ytimg.com/vi/${video.youtubeVideoId}/mqdefault.jpg`;

  return (
    <Link href={`/video/${video.youtubeVideoId}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {video.durationSec && (
            <span className="absolute bottom-2 left-2 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
              {formatDuration(video.durationSec)}
            </span>
          )}
          {video.ageRating && (
            <div className="absolute top-2 start-2">
              <AgeRatingBadge rating={video.ageRating} size="sm" />
            </div>
          )}
          {video.status === "UNSCANNED" && (
            <div className="absolute top-2 end-2">
              <Badge variant="outline" className="bg-background/80 text-xs">
                غير مقيّم
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="font-medium text-sm line-clamp-2 leading-relaxed">
            {video.title}
          </h3>
          {video.channelName && (
            <p className="mt-1 text-xs text-muted-foreground">{video.channelName}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
