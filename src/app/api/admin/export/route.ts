import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AXIS_KEYS } from "@/lib/rating/constants";

export async function GET(request: Request) {
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

  const ratings = await prisma.ratingAggregate.findMany({
    include: {
      video: {
        include: {
          channel: true,
          scanRuns: {
            where: { clientType: "AI_GEMINI" },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { lastUpdatedAt: "desc" },
  });

  const headers = [
    "youtubeVideoId",
    "title",
    "channel",
    "ageRating",
    "confidence",
    ...AXIS_KEYS,
    "hadAudio",
    "reviewDate",
  ];

  const rows = ratings.map((r) => {
    const scores = r.scores as Record<string, number>;
    const latestScan = r.video.scanRuns[0];
    const qm = latestScan?.qualityMetrics as Record<string, unknown> | null;

    return [
      r.video.youtubeVideoId,
      csvEscape(r.video.title),
      csvEscape(r.video.channel?.nameAr ?? r.video.channel?.name ?? ""),
      r.ageRating,
      r.confidence,
      ...AXIS_KEYS.map((k) => String(scores[k] ?? 0)),
      qm?.hadAudio ? "yes" : "no",
      r.lastUpdatedAt.toISOString().split("T")[0],
    ].join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ratings-export-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
