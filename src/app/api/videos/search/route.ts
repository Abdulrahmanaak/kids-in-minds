import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import type { AgeRating } from "@/generated/prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const ageRating = searchParams.get("ageRating") as AgeRating | null;
  const status = searchParams.get("status");
  const channelId = searchParams.get("channelId");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? String(ITEMS_PER_PAGE), 10));

  const where: Record<string, unknown> = {};

  if (q) {
    where.title = { contains: q, mode: "insensitive" };
  }

  if (channelId) where.channelId = channelId;

  if (ageRating) {
    where.ratingAggregate = { ageRating };
  } else if (status === "SCANNED") {
    where.ratingAggregate = { isNot: null };
  } else if (status === "UNSCANNED") {
    where.ratingAggregate = null;
  }

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
