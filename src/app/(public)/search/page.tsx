import { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/search/search-bar";
import { SearchFilters } from "@/components/search/search-filters";
import { VideoGrid } from "@/components/video/video-grid";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchX } from "lucide-react";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import type { AgeRating } from "@/generated/prisma/client";
import type { Thumbnails, VideoCardData } from "@/types/video";

export const metadata: Metadata = {
  title: "بحث | أطفالنا أمانة",
};

type Props = {
  searchParams: Promise<{
    q?: string;
    ageRating?: string;
    status?: string;
    page?: string;
  }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q, ageRating, status, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));

  const where: Record<string, unknown> = {};

  if (q) {
    where.title = { contains: q, mode: "insensitive" };
  }

  if (ageRating) {
    where.ratingAggregate = { ageRating: ageRating as AgeRating };
  } else if (status === "SCANNED") {
    where.ratingAggregate = { isNot: null };
  } else if (status === "UNSCANNED") {
    where.ratingAggregate = null;
  }

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
      status: v.ratingAggregate ? "SCANNED" : "UNSCANNED",
    };
  });

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">بحث</h1>
      <SearchBar defaultValue={q} />
      <Suspense>
        <SearchFilters />
      </Suspense>

      {q && (
        <p className="text-sm text-muted-foreground">
          نتائج البحث عن &quot;{q}&quot; ({total} نتيجة)
        </p>
      )}

      {videoCards.length > 0 ? (
        <>
          <VideoGrid videos={videoCards} />
          <Pagination page={page} totalPages={totalPages} />
        </>
      ) : (
        <EmptyState
          icon={SearchX}
          title="لا توجد نتائج"
          description={q ? `لم نجد نتائج لـ "${q}"` : "لم نجد مقاطع تطابق الفلاتر المحددة"}
        />
      )}
    </div>
  );
}
