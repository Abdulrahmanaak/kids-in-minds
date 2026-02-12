import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { reviewUnscannedVideos } from "@/lib/ai-review/reviewer";

export const maxDuration = 3600; // 1 hour max for bulk processing

export async function POST(request: Request) {
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

  const body = await request.json().catch(() => ({}));
  const limit = body.limit ?? 500;

  try {
    const results = await reviewUnscannedVideos(limit);
    return NextResponse.json({
      success: true,
      data: { reviewed: results.length, results },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "فشل التقييم الجماعي",
      },
      { status: 500 }
    );
  }
}
