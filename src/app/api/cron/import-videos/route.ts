import { NextResponse } from "next/server";
import { importAllChannels } from "@/lib/youtube/channel-importer";
import { reviewUnscannedVideos } from "@/lib/ai-review/reviewer";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const importResults = await importAllChannels();

    // AI review unscanned videos after import
    let aiReviewResults: Awaited<ReturnType<typeof reviewUnscannedVideos>> = [];
    try {
      aiReviewResults = await reviewUnscannedVideos(30);
    } catch (err) {
      console.error("Post-import AI review failed:", err);
    }

    return NextResponse.json({
      success: true,
      data: {
        import: importResults,
        aiReview: {
          reviewed: aiReviewResults.length,
          results: aiReviewResults,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Import failed" },
      { status: 500 }
    );
  }
}
