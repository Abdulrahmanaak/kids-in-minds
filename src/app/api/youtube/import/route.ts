import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { importChannelVideos } from "@/lib/youtube/channel-importer";

export async function POST(request: Request) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();
  const { channelId } = body;

  if (!channelId || typeof channelId !== "string") {
    return NextResponse.json({ success: false, error: "معرف القناة مطلوب" }, { status: 400 });
  }

  try {
    const result = await importChannelVideos(channelId);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "خطأ في الاستيراد" },
      { status: 500 }
    );
  }
}
