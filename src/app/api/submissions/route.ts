import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { submissionSchema } from "@/lib/validators";

export async function GET() {
  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ success: true, data: submissions });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const submission = await prisma.submission.create({
    data: {
      videoUrl: parsed.data.videoUrl,
      note: parsed.data.note,
    },
  });

  // Auto-create review queue item
  await prisma.reviewQueue.create({
    data: {
      itemType: "SUBMISSION",
      submissionId: submission.id,
    },
  });

  return NextResponse.json({ success: true, data: submission });
}
