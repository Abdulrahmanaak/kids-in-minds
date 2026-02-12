import { NextResponse } from "next/server";
import { resolveVideo } from "@/lib/youtube/video-resolver";
import { youtubeUrlSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = youtubeUrlSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "رابط غير صالح" }, { status: 400 });
  }

  try {
    const video = await resolveVideo(parsed.data.url);
    return NextResponse.json({ success: true, data: video });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "خطأ غير متوقع" },
      { status: 400 }
    );
  }
}
