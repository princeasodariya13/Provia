import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Define Public vs Private Routes
  const isPublicRoute = 
    pathname === "/" || 
    pathname.startsWith("/login") || 
    pathname.startsWith("/register") || 
    pathname.startsWith("/forgot-password") || 
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/api/v1/auth/login") ||
    pathname.startsWith("/api/v1/auth/register") ||
    pathname.startsWith("/api/v1/auth/google/callback") ||
    pathname.startsWith("/api/v1/auth/linkedin/callback");

  // Allow static assets and Next.js internals
  if (
    pathname.startsWith("/_next") || 
    pathname.startsWith("/favicon.ico") || 
    pathname.startsWith("/icon.png") ||
    pathname.startsWith("/images")
  ) {
    return NextResponse.next();
  }

  // 2. Check Session Cookie
  const token = request.cookies.get("provia_session")?.value;
  let sessionValid = false;
  let userRole = "USER";

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
      const { payload } = await jwtVerify(token, secret);
      if (payload.expiresAt && typeof payload.expiresAt === 'number' && payload.expiresAt * 1000 > Date.now()) {
        sessionValid = true;
        userRole = (payload.role as string) || "USER";
      }
    } catch (err) {
      // Invalid token
      sessionValid = false;
    }
  }

  // 3. Handle Admin Routes (/operations)
  if (pathname.startsWith("/operations")) {
    if (!sessionValid) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 4. Protect Private Frontend Routes
  const privateFrontendRoutes = ["/dashboard", "/profile", "/portfolio", "/analytics", "/integrations", "/settings"];
  const isPrivateFrontendRoute = privateFrontendRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));

  if (isPrivateFrontendRoute) {
    if (!sessionValid) {
      // Redirect to login with redirect URL
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 5. Prevent logged-in users from seeing login/register pages
  if ((pathname === "/login" || pathname === "/register") && sessionValid) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
