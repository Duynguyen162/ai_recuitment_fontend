// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Đọc cookie "role" mà JS đã set lúc login
  const role = request.cookies.get("role")?.value;
  const isLoggedIn = !!role;

  const isProtectedRoute =
    pathname.startsWith("/candidate") ||
    pathname.startsWith("/hr_manager") ||
    pathname.startsWith("/admin");

  // Chưa đăng nhập → về login
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn) {
    // Đã đăng nhập mà vào trang auth → về dashboard
    if (pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }

    // Vào sai trang của role khác → về đúng dashboard
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }
    if (pathname.startsWith("/hr_manager") && role !== "hr_manager") {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }
    if (pathname.startsWith("/candidate") && role !== "candidate") {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/candidate/:path*",
    "/hr_manager/:path*",
    "/admin/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
