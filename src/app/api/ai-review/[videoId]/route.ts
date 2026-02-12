import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewVideo } from "@/lib/ai-review/reviewer";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params;

  // Auth: admin session or cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    // Authorized via cron secret
  } else {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      );
    }
  }

  const video = await prisma.video.findUnique({
    where: { youtubeVideoId: videoId },
  });
  if (!video) {
    return NextResponse.json(
      { success: false, error: "الفيديو غير موجود" },
      { status: 404 }
    );
  }

  try {
    const result = await reviewVideo(video.id);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "فشل التقييم بالذكاء الاصطناعي",
      },
      { status: 500 }
    );
  }
}
