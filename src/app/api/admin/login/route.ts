import { NextResponse } from "next/server";
import { validateCredentials, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json(
      { success: false, error: "اسم المستخدم وكلمة المرور مطلوبان" },
      { status: 400 }
    );
  }

  if (!validateCredentials(username, password)) {
    return NextResponse.json(
      { success: false, error: "بيانات الدخول غير صحيحة" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });
  return setSessionCookie(response);
}
