import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Helper to add security headers to any response
  const applySecurityHeaders = (response: NextResponse) => {
    // Prevent Clickjacking
    response.headers.set("X-Frame-Options", "DENY");
    // Enforce HTTPS
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    // Prevent MIME type sniffing
    response.headers.set("X-Content-Type-Options", "nosniff");
    // Referrer policy
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    // Basic Permissions Policy
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    // Simple baseline CSP (adjustable if external scripts break)
    response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.cloudinary.com https://api.github.com https://api.linkedin.com; frame-ancestors 'none';");
    return response;
  };

  // 1. Always allow static assets and Next.js internals first
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/icon.png") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/api/v1/auth/") // Let auth routes pass through to their own handlers
  ) {
    return applySecurityHeaders(NextResponse.next());
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
            return applySecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
          }
        } catch {
          // invalid token, let through
        }
      }
    }
    return applySecurityHeaders(NextResponse.next());
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
        return applySecurityHeaders(NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }));
      }
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return applySecurityHeaders(NextResponse.redirect(redirectUrl));
    }

    try {
      const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "");
      const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
      const expiresAt = payload.expiresAt as number | undefined;

      if (!expiresAt || expiresAt <= Math.floor(Date.now() / 1000)) {
        // Expired
        if (isPrivateApi) {
          return applySecurityHeaders(NextResponse.json({ success: false, error: "Session expired" }, { status: 401 }));
        }
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("redirect", pathname);
        return applySecurityHeaders(NextResponse.redirect(redirectUrl));
      }

      // Admin-only routes
      if (pathname.startsWith("/operations")) {
        const role = payload.role as string | undefined;
        if (role !== "ADMIN") {
          return applySecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
        }
      }

      return applySecurityHeaders(NextResponse.next());
    } catch {
      // Invalid/tampered token
      if (isPrivateApi) {
        return applySecurityHeaders(NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }));
      }
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return applySecurityHeaders(NextResponse.redirect(redirectUrl));
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
