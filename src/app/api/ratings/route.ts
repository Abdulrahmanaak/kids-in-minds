import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ratings = await prisma.ratingAggregate.findMany({
    orderBy: { lastUpdatedAt: "desc" },
    take: 50,
    include: { video: { select: { youtubeVideoId: true, title: true } } },
  });

  return NextResponse.json({ success: true, data: ratings });
}
