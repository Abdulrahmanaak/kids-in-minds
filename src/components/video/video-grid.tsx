import { VideoCard } from "./video-card";
import type { VideoCardData } from "@/types/video";

type Props = {
  videos: VideoCardData[];
};

export function VideoGrid({ videos }: Props) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">لا توجد مقاطع فيديو</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
