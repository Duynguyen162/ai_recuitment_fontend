import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const VALID_ROLES = ["candidate", "hr_manager", "admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const role = request.cookies.get("role")?.value;
  const isValidRole = VALID_ROLES.includes(role || "");

  const getDefaultRoute = (userRole: string) =>
    userRole === "candidate"
      ? "/candidate/search_job"
      : `/${userRole}/dashboard`;

  const isAuthRoute =
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/register");

  const isProtectedRoute =
    pathname.startsWith("/candidate") ||
    pathname.startsWith("/hr_manager") ||
    pathname.startsWith("/admin");
    
  if (isProtectedRoute && !isValidRole) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isValidRole) {
    if (isAuthRoute) {
      return NextResponse.redirect(
        new URL(getDefaultRoute(role!), request.url)
      );
    }

    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(
        new URL(getDefaultRoute(role!), request.url)
      );
    }

    if (pathname.startsWith("/hr_manager") && role !== "hr_manager") {
      return NextResponse.redirect(
        new URL(getDefaultRoute(role!), request.url)
      );
    }

    if (pathname.startsWith("/candidate") && role !== "candidate") {
      return NextResponse.redirect(
        new URL(getDefaultRoute(role!), request.url)
      );
    }

    if (pathname === "/") {
      return NextResponse.redirect(
        new URL(getDefaultRoute(role!), request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/candidate/:path*",
    "/hr_manager/:path*",
    "/admin/:path*",
    "/auth/login",
    "/auth/register",
  ],
};