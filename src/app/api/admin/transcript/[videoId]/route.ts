import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchTranscript } from "@/lib/ai-review/transcript";

type RouteContext = {
  params: Promise<{ videoId: string }>;
};

export async function POST(_request: Request, { params }: RouteContext) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  }

  const { videoId } = await params;

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: {
      scanRuns: {
        where: { clientType: "AI_GEMINI" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!video) {
    return NextResponse.json({ success: false, error: "الفيديو غير موجود" }, { status: 404 });
  }

  const latestScan = video.scanRuns[0];
  if (!latestScan) {
    return NextResponse.json(
      { success: false, error: "لا توجد مراجعة ذكاء اصطناعي لهذا الفيديو" },
      { status: 400 }
    );
  }

  const transcript = await fetchTranscript(video.youtubeVideoId);

  if (transcript.segments.length === 0) {
    return NextResponse.json(
      { success: false, error: "لا يتوفر نص تفريغي لهذا الفيديو" },
      { status: 404 }
    );
  }

  const existingQm = (latestScan.qualityMetrics as Record<string, unknown>) ?? {};
  await prisma.scanRun.update({
    where: { id: latestScan.id },
    data: {
      qualityMetrics: {
        ...existingQm,
        transcript: transcript.segments,
        transcriptLanguage: transcript.language,
      },
    },
  });

  return NextResponse.json({
    success: true,
    segmentCount: transcript.segments.length,
    language: transcript.language,
  });
}
