import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "rf_admin_session";

// This is a cheap, edge-safe pre-check only (no HMAC verification —
// Node's crypto module isn't available in the Edge middleware
// runtime). The authoritative check is getSessionAdminId() in
// src/app/admin/layout.tsx, which verifies the cookie's signature
// server-side on every admin page render. A visitor without a
// well-formed cookie is bounced here before the page even renders;
// a visitor with a forged/expired cookie gets past this check but is
// still redirected by the layout.
export function middleware(req: NextRequest) {
  const isLoginPage = req.nextUrl.pathname === "/admin/login";
  const hasCookie = req.cookies.has(SESSION_COOKIE);

  if (!isLoginPage && !hasCookie) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
