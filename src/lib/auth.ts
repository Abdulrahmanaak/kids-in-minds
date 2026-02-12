import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

const COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  return process.env.SESSION_SECRET || process.env.CRON_SECRET || "fallback-secret-change-me";
}

function sign(value: string): string {
  const sig = createHmac("sha256", getSecret()).update(value).digest("hex");
  return `${value}.${sig}`;
}

function unsign(signed: string): string | null {
  const idx = signed.lastIndexOf(".");
  if (idx === -1) return null;
  const value = signed.slice(0, idx);
  const expected = sign(value);
  return expected === signed ? value : null;
}

/** Validate admin credentials and return true if valid */
export function validateCredentials(username: string, password: string): boolean {
  const adminUser = process.env.ADMIN_USERNAME || "admin";
  const adminPass = process.env.ADMIN_PASSWORD || "Admin@123";
  return username === adminUser && password === adminPass;
}

/** Check if the current request is authenticated (for Server Components / Route Handlers) */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie) return false;
  const value = unsign(sessionCookie.value);
  return value === "authenticated";
}

/** Check if a NextRequest is authenticated (for Middleware) */
export function isAuthenticatedRequest(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get(COOKIE_NAME);
  if (!sessionCookie) return false;
  const value = unsign(sessionCookie.value);
  return value === "authenticated";
}

/** Set the session cookie on a response */
export function setSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME, sign("authenticated"), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return response;
}

/** Clear the session cookie */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
