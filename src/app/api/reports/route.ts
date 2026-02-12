import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reportSchema } from "@/lib/validators";

export async function GET() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { video: { select: { youtubeVideoId: true, title: true } } },
  });
  return NextResponse.json({ success: true, data: reports });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  // Find video by youtubeVideoId
  const video = await prisma.video.findUnique({
    where: { youtubeVideoId: parsed.data.videoId },
  });

  if (!video) {
    return NextResponse.json(
      { success: false, error: "الفيديو غير موجود" },
      { status: 404 }
    );
  }

  const report = await prisma.report.create({
    data: {
      videoId: video.id,
      ratingId: parsed.data.ratingId,
      category: parsed.data.category,
      message: parsed.data.message,
    },
  });

  // Auto-create review queue item
  await prisma.reviewQueue.create({
    data: {
      itemType: "REPORT",
      reportId: report.id,
    },
  });

  return NextResponse.json({ success: true, data: report });
}
