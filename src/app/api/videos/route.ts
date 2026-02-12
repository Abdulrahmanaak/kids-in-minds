import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ITEMS_PER_PAGE } from "@/lib/constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? String(ITEMS_PER_PAGE), 10)));
  const channelId = searchParams.get("channelId");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (channelId) where.channelId = channelId;
  if (status === "SCANNED") where.ratingAggregate = { isNot: null };
  if (status === "UNSCANNED") where.ratingAggregate = null;

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { publishedAt: "desc" },
      include: { ratingAggregate: true, channel: true },
    }),
    prisma.video.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: videos,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
