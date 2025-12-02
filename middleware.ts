/**
 * NextAuth v5 Middleware for Route Protection
 *
 * Protects routes that require authentication:
 * - /dashboard (all routes)
 * - /training/* (all training modules)
 *
 * Public routes (accessible without authentication):
 * - / (landing page)
 * - /login
 * - /register
 * - /api/* (API routes)
 * - /_next/* (Next.js internal routes)
 *
 * Redirects unauthenticated users to /login with callback URL
 */

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // Define protected route patterns
  const protectedRoutes = ["/dashboard", "/training"];

  // Check if current path matches any protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If accessing a protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login with callback URL to return after login
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated and trying to access login/register, redirect to dashboard
  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Allow request to continue
  return NextResponse.next();
});

// Matcher configuration - which routes this middleware applies to
export const config = {
  // Match all routes except static files and API routes
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
