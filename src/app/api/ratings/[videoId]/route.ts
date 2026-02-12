import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { ratingEntrySchema } from "@/lib/validators";
import { computeAgeRating, computeConfidence, validateScores } from "@/lib/rating/engine";
import type { AxisScores } from "@/lib/rating/engine";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params;

  const rating = await prisma.ratingAggregate.findFirst({
    where: { video: { youtubeVideoId: videoId } },
    include: {
      video: {
        include: {
          scanRuns: {
            include: { evidence: true },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      },
    },
  });

  if (!rating) {
    return NextResponse.json({ success: false, error: "لم يتم تقييم هذا الفيديو بعد" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: rating });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params;

  // Auth check
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  }

  // Validate input
  const body = await request.json();
  const parsed = ratingEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { scores, evidence } = parsed.data;

  if (!validateScores(scores)) {
    return NextResponse.json(
      { success: false, error: "درجات غير صالحة" },
      { status: 400 }
    );
  }

  // Find video
  const video = await prisma.video.findUnique({
    where: { youtubeVideoId: videoId },
  });

  if (!video) {
    return NextResponse.json({ success: false, error: "الفيديو غير موجود" }, { status: 404 });
  }

  const ageRating = computeAgeRating(scores as AxisScores);
  const confidence = computeConfidence(1, "ADMIN_MANUAL");

  // Create scan run + evidence + upsert rating aggregate in a transaction
  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const scanRun = await tx.scanRun.create({
      data: {
        videoId: video.id,
        clientType: "ADMIN_MANUAL",
        evidence: {
          create: evidence.map((e) => ({
            axisKey: e.axisKey,
            startMs: e.startMs,
            endMs: e.endMs,
            note: e.note,
          })),
        },
      },
      include: { evidence: true },
    });

    const ratingAgg = await tx.ratingAggregate.upsert({
      where: { videoId: video.id },
      create: {
        videoId: video.id,
        ageRating,
        confidence,
        scores,
        evidencePreview: evidence,
        status: "SCANNED",
        scansCount: 1,
      },
      update: {
        ageRating,
        confidence,
        scores,
        evidencePreview: evidence,
        status: "SCANNED",
        scansCount: { increment: 1 },
        lastUpdatedAt: new Date(),
      },
    });

    return { scanRun, ratingAggregate: ratingAgg };
  });

  return NextResponse.json({ success: true, data: result });
}
