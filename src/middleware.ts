import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

/**
 * Protects the admin area.
 *
 * - /admin/login is always public.
 * - Every other /admin/* page requires a valid session cookie, otherwise the
 *   visitor is redirected to the login page.
 * - /api/admin/* routes are additionally guarded inside each handler, but we
 *   short-circuit unauthenticated requests here too.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  const isLoginPage = pathname === "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin/");
  const isAuthApi =
    pathname === "/api/admin/login" || pathname === "/api/admin/logout";

  // Allow the auth API endpoints through untouched.
  if (isAuthApi) {
    return NextResponse.next();
  }

  // Guard admin API routes (defence in depth alongside the handler checks).
  if (isAdminApi) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Already logged in and visiting the login page -> go to the dashboard.
  if (isLoginPage && session) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // Any admin page other than login requires a session.
  if (!isLoginPage && !session) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
