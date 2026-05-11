import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const role = request.cookies.get("role")?.value;
  const isLoggedIn = !!role;

  // ===== ROUTE TYPES =====

  const isProtectedRoute =
    pathname.startsWith("/candidate") ||
    pathname.startsWith("/hr_manager") ||
    pathname.startsWith("/admin");

  const isAuthRoute =
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/register");

  const publicRoutes = ["/", "/public"];

  // ===== CHƯA LOGIN =====

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/auth/login", request.url);

    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  // ===== ĐÃ LOGIN =====

  if (isLoggedIn) {
    // Không cho vào auth
    if (isAuthRoute) {
        if(role === "candidate"){
            return NextResponse.redirect(
                new URL(`/candidate/search_job`, request.url)
            );
        }
        
      return NextResponse.redirect(
        new URL(`/${role}/dashboard`, request.url)
      );
    }

    // Không cho vào public pages
    if (publicRoutes.includes(pathname)) {
      return NextResponse.redirect(
        new URL(`/${role}/dashboard`, request.url)
      );
    }

    // Sai role
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(
        new URL(`/${role}/dashboard`, request.url)
      );
    }

    if (
      pathname.startsWith("/hr_manager") &&
      role !== "hr_manager"
    ) {
      return NextResponse.redirect(
        new URL(`/${role}/dashboard`, request.url)
      );
    }

    if (
      pathname.startsWith("/candidate") &&
      role !== "candidate"
    ) {
      return NextResponse.redirect(
        new URL(`/${role}/dashboard`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/public",
    "/candidate/:path*",
    "/hr_manager/:path*",
    "/admin/:path*",
    "/auth/login",
    "/auth/register",
  ],
};