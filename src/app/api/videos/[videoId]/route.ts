import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
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

  if (!video) {
    return NextResponse.json({ success: false, error: "الفيديو غير موجود" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: video });
}
