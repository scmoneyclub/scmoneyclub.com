/**
 * Next.js 16 Proxy — src/proxy.ts
 *
 * Runs on the Node.js runtime. Intercepts requests to protected routes and
 * redirects unauthenticated visitors to /login before the page renders.
 *
 * Security note (CVE-2025-29927): Proxy is a first-line gate, NOT the sole
 * auth layer. Each protected Server Component and API route must re-validate
 * the session independently. Never treat proxy as the only authorization check.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Routes that require an active session.
 * The matcher config limits proxy execution to only these prefixes so public
 * pages, static assets, and API routes are never intercepted.
 */
const PROTECTED_PREFIXES = [
  "/account",
  "/wallet",
  "/trading",
  "/investments",
  "/dao",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get("scmc_token")?.value;

  if (!token) {
    // Preserve the originally requested path so the login page can redirect
    // back after a successful sign-in: /login?next=%2Fwallet
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Run proxy only on the protected page prefixes.
   * /api/*, /_next/*, and static files are intentionally excluded.
   */
  matcher: [
    "/account/:path*",
    "/wallet/:path*",
    "/trading/:path*",
    "/investments/:path*",
    "/dao/:path*",
  ],
};
