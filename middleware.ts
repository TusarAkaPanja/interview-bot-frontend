import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken, canAccessRoute, isTokenExpired } from "@/lib/jwt";

const publicRoutes = ["/login", "/register"];
const protectedRoutes = ["/home"];
const candidateAuthRoutes = ["/panel/start"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("vecna_token")?.value;

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isCandidateAuthRoute = candidateAuthRoutes.some((route) => pathname.startsWith(route));

  // Allow candidate auth routes (they handle their own authentication)
  if (isCandidateAuthRoute) {
    return NextResponse.next();
  }

  // If accessing root, redirect based on auth state
  if (pathname === "/") {
    if (token && !isTokenExpired(token)) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If accessing public route while authenticated, redirect to home
  if (isPublicRoute && token && !isTokenExpired(token)) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // If accessing protected route without valid token, redirect to login
  if (isProtectedRoute) {
    if (!token || isTokenExpired(token) || !canAccessRoute(token)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

