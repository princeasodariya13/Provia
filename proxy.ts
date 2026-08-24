import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Always allow static assets and Next.js internals first
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/icon.png") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/api/v1/auth/") // Let auth routes pass through to their own handlers
  ) {
    return NextResponse.next();
  }

  // 2. Always allow public marketing & auth pages (unauthenticated)
  const publicPages = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/about", "/blog", "/contact", "/how-it-works", "/ai", "/analytics", "/verify-email", "/integrations/callback"];
  const isPublicPage = publicPages.some(p => pathname === p || pathname.startsWith(p + "?"));

  // 3. Public portfolio URL patterns - always accessible
  const isPublicPortfolio = /^\/[a-zA-Z0-9_-]+\/[a-f0-9]{32}/.test(pathname) || pathname.startsWith("/p/");

  if (isPublicPage || isPublicPortfolio) {
    // If logged-in user tries to visit login/register, redirect to dashboard
    if (pathname === "/login" || pathname === "/register") {
      const token = request.cookies.get("provia_session")?.value;
      if (token) {
        try {
          const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "");
          const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
          const expiresAt = payload.expiresAt as number | undefined;
          if (expiresAt && expiresAt > Math.floor(Date.now() / 1000)) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
          }
        } catch {
          // invalid token, let through
        }
      }
    }
    return NextResponse.next();
  }

  // 4. Protect private routes
  const privatePrefixes = ["/dashboard", "/profile", "/portfolio", "/settings", "/operations"];
  const isPrivateRoute = privatePrefixes.some(p => pathname === p || pathname.startsWith(p + "/"));
  // Also protect private API routes
  const isPrivateApi = pathname.startsWith("/api/v1/") && !pathname.startsWith("/api/v1/auth/");

  if (isPrivateRoute || isPrivateApi) {
    const token = request.cookies.get("provia_session")?.value;

    if (!token) {
      if (isPrivateApi) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    try {
      const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "");
      const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
      const expiresAt = payload.expiresAt as number | undefined;

      if (!expiresAt || expiresAt <= Math.floor(Date.now() / 1000)) {
        // Expired
        if (isPrivateApi) {
          return NextResponse.json({ success: false, error: "Session expired" }, { status: 401 });
        }
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // Admin-only routes
      if (pathname.startsWith("/operations")) {
        const role = payload.role as string | undefined;
        if (role !== "ADMIN") {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      }

      return NextResponse.next();
    } catch {
      // Invalid/tampered token
      if (isPrivateApi) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
