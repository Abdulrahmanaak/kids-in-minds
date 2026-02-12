import { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { VideoGrid } from "@/components/video/video-grid";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { SafeListFilters } from "./safe-list-filters";
import { ShieldCheck } from "lucide-react";
import { ITEMS_PER_PAGE, AGE_RATING_ORDER } from "@/lib/constants";
import type { AgeRating } from "@/generated/prisma/client";
import type { Thumbnails, VideoCardData } from "@/types/video";

export const metadata: Metadata = {
  title: "القائمة الآمنة | أطفالنا أمانة",
};

type Props = {
  searchParams: Promise<{
    ageRating?: string;
    page?: string;
  }>;
};

export default async function SafeListPage({ searchParams }: Props) {
  const { ageRating, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));

  const maxRating = (ageRating as AgeRating) || "PG";
  const allowedRatings = AGE_RATING_ORDER.slice(
    0,
    AGE_RATING_ORDER.indexOf(maxRating as typeof AGE_RATING_ORDER[number]) + 1
  );

  const where = {
    ratingAggregate: {
      ageRating: { in: allowedRatings as AgeRating[] },
    },
  };

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
      where,
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
      orderBy: { publishedAt: "desc" },
      include: { ratingAggregate: true, channel: true },
    }),
    prisma.video.count({ where }),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const videoCards: VideoCardData[] = videos.map((v: typeof videos[number]) => {
    const thumbs = v.thumbnails as Thumbnails | null;
    return {
      id: v.id,
      youtubeVideoId: v.youtubeVideoId,
      title: v.title,
      channelName: v.channel?.nameAr ?? v.channel?.name ?? null,
      channelId: v.channelId,
      thumbnailUrl: thumbs?.medium?.url ?? thumbs?.high?.url ?? null,
      publishedAt: v.publishedAt?.toISOString() ?? null,
      durationSec: v.durationSec,
      ageRating: v.ratingAggregate?.ageRating ?? null,
      confidence: v.ratingAggregate?.confidence ?? null,
      status: "SCANNED",
    };
  });

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-safe" />
          القائمة الآمنة
        </h1>
        <p className="text-muted-foreground mt-1">
          مقاطع تم تقييمها ومناسبة لأطفالك
        </p>
      </div>

      <Suspense>
        <SafeListFilters />
      </Suspense>

      <p className="text-sm text-muted-foreground">{total} فيديو</p>

      {videoCards.length > 0 ? (
        <>
          <VideoGrid videos={videoCards} />
          <Pagination page={page} totalPages={totalPages} />
        </>
      ) : (
        <EmptyState
          icon={ShieldCheck}
          title="لا توجد مقاطع"
          description="لم يتم تقييم مقاطع بعد بهذا التصنيف."
        />
      )}
    </div>
  );
}
