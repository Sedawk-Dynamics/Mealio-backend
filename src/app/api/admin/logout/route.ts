import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

/** POST /api/admin/logout — clear the session cookie. */
export async function POST() {
  const res = NextResponse.json({ message: "Logged out." });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
