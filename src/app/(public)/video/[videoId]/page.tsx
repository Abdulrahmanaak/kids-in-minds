import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { VideoPlayer } from "@/components/video/video-player";
import { VideoMetadata } from "@/components/video/video-metadata";
import { UnscannedNotice } from "@/components/rating/unscanned-notice";
import { AgeRatingBadge } from "@/components/rating/age-rating-badge";
import { ConfidenceBadge } from "@/components/rating/confidence-badge";
import { AxisScoresPanel } from "@/components/rating/axis-scores-panel";
import { EvidenceList } from "@/components/rating/evidence-list";
import { VideoActions } from "./video-actions";
import type { AxisKey } from "@/lib/rating/constants";
import type { EvidenceItem } from "@/types/rating";

type Props = {
  params: Promise<{ videoId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { videoId } = await params;
  const video = await prisma.video.findUnique({
    where: { youtubeVideoId: videoId },
  });
  return {
    title: video ? `${video.title} | أطفالنا أمانة` : "فيديو غير موجود",
  };
}

export default async function VideoPage({ params }: Props) {
  const { videoId } = await params;

  const video = await prisma.video.findUnique({
    where: { youtubeVideoId: videoId },
    include: {
      ratingAggregate: true,
      channel: true,
      scanRuns: {
        include: { evidence: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!video) notFound();

  const rating = video.ratingAggregate;
  const scores = rating?.scores as Record<AxisKey, number> | null;
  const evidence = (rating?.evidencePreview as EvidenceItem[] | null) ?? [];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <VideoPlayer youtubeVideoId={video.youtubeVideoId} title={video.title} />
          <VideoMetadata
            title={video.title}
            channelName={video.channel?.nameAr ?? video.channel?.name ?? null}
            channelId={video.channelId}
            youtubeChannelId={video.channel?.youtubeChannelId}
            publishedAt={video.publishedAt}
            durationSec={video.durationSec}
            viewCount={video.viewCount}
            description={video.description}
          />
          <VideoActions
            youtubeVideoId={video.youtubeVideoId}
            title={video.title}
            thumbnailUrl={
              (video.thumbnails as Record<string, { url: string }> | null)?.medium?.url ?? null
            }
            channelName={video.channel?.nameAr ?? video.channel?.name ?? null}
          />
        </div>

        {/* Sidebar: Rating */}
        <div className="space-y-4">
          {rating && scores ? (
            <>
              <div className="flex items-center gap-3">
                <AgeRatingBadge rating={rating.ageRating} size="lg" />
                <ConfidenceBadge confidence={rating.confidence} />
              </div>
              <AxisScoresPanel scores={scores} />
              {evidence.length > 0 && <EvidenceList evidence={evidence} />}
            </>
          ) : (
            <UnscannedNotice />
          )}
        </div>
      </div>
    </div>
  );
}
