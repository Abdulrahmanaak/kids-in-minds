import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { VideoPlayer } from "@/components/video/video-player";
import { RatingEntryForm } from "@/components/forms/rating-entry-form";
import type { AxisKey } from "@/lib/rating/constants";
import type { EvidenceItem } from "@/types/rating";

type Props = {
  params: Promise<{ videoId: string }>;
};

export default async function AdminRatingPage({ params }: Props) {
  const { videoId } = await params;

  const video = await prisma.video.findUnique({
    where: { youtubeVideoId: videoId },
    include: { ratingAggregate: true },
  });

  if (!video) notFound();

  const existingScores = video.ratingAggregate?.scores as Record<AxisKey, number> | undefined;
  const existingEvidence = (video.ratingAggregate?.evidencePreview as EvidenceItem[] | undefined) ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <VideoPlayer youtubeVideoId={video.youtubeVideoId} title={video.title} />
      <RatingEntryForm
        videoId={video.youtubeVideoId}
        videoTitle={video.title}
        initialScores={existingScores}
        initialEvidence={existingEvidence}
      />
    </div>
  );
}
