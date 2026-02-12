import { NextResponse } from "next/server";

// OAuth callback - no longer used (simple session auth)
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/admin/login`);
}
