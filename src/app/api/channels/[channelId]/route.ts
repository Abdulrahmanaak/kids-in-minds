import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const { channelId } = await params;

  const channel = await prisma.channel.findUnique({
    where: { youtubeChannelId: channelId },
    include: {
      _count: { select: { videos: true } },
    },
  });

  if (!channel) {
    return NextResponse.json({ success: false, error: "القناة غير موجودة" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: channel });
}
