import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { reviewActionSchema } from "@/lib/validators";
import type { ReviewItemStatus } from "@/generated/prisma/client";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  }

  const items = await prisma.reviewQueue.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      submission: true,
      report: {
        include: { video: { select: { youtubeVideoId: true, title: true } } },
      },
    },
  });

  return NextResponse.json({ success: true, data: items });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = reviewActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const updated = await prisma.reviewQueue.update({
    where: { id: parsed.data.itemId },
    data: {
      status: parsed.data.action as ReviewItemStatus,
      reviewerNote: parsed.data.reviewerNote,
    },
  });

  return NextResponse.json({ success: true, data: updated });
}
