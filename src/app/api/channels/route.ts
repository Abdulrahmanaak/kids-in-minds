import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { channelImportSchema } from "@/lib/validators";

export async function GET() {
  const channels = await prisma.channel.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { videos: true } } },
  });

  return NextResponse.json({ success: true, data: channels });
}

export async function POST(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = channelImportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
  }

  const channel = await prisma.channel.upsert({
    where: { youtubeChannelId: parsed.data.youtubeChannelId },
    create: parsed.data,
    update: {
      name: parsed.data.name,
      nameAr: parsed.data.nameAr,
      teamTag: parsed.data.teamTag,
    },
  });

  return NextResponse.json({ success: true, data: channel });
}
