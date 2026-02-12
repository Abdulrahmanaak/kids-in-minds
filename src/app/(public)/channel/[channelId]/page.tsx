import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { VideoGrid } from "@/components/video/video-grid";
import { Pagination } from "@/components/shared/pagination";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import type { Thumbnails, VideoCardData } from "@/types/video";

type Props = {
  params: Promise<{ channelId: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { channelId } = await params;
  const channel = await prisma.channel.findUnique({
    where: { youtubeChannelId: channelId },
  });
  return {
    title: channel
      ? `${channel.nameAr ?? channel.name} | أطفالنا أمانة`
      : "قناة غير موجودة",
  };
}

export default async function ChannelPage({ params, searchParams }: Props) {
  const { channelId } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));

  const channel = await prisma.channel.findUnique({
    where: { youtubeChannelId: channelId },
  });

  if (!channel) notFound();

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
      where: { channelId: channel.id },
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
      orderBy: { publishedAt: "desc" },
      include: { ratingAggregate: true, channel: true },
    }),
    prisma.video.count({ where: { channelId: channel.id } }),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const videoCards: VideoCardData[] = videos.map((v: typeof videos[number]) => {
    const thumbs = v.thumbnails as Thumbnails | null;
    return {
      id: v.id,
      youtubeVideoId: v.youtubeVideoId,
      title: v.title,
      channelName: channel.nameAr ?? channel.name,
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
    <div className="container mx-auto px-4 py-6">
      {/* Channel header */}
      <div className="flex items-center gap-4 mb-8">
        {channel.thumbnailUrl && (
          <Image
            src={channel.thumbnailUrl}
            alt={channel.name}
            width={80}
            height={80}
            className="rounded-full"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold">{channel.nameAr ?? channel.name}</h1>
          {channel.nameAr && (
            <p className="text-muted-foreground">{channel.name}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {total} فيديو
            {channel.subscriberCount && (
              <> · {channel.subscriberCount.toLocaleString("ar-SA")} مشترك</>
            )}
          </p>
        </div>
      </div>

      <VideoGrid videos={videoCards} />
      <Pagination page={page} totalPages={totalPages} />
    </div>
  );
}
