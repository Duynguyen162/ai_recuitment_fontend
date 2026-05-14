import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("access_token"); // Token bảo mật (HTTP-only)
  const role = request.cookies.get("role")?.value;   // Role để phân luồng (Cookie thường)

  const isAuthRoute = pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register");
  const isProtectedRoute = pathname.startsWith("/candidate") || pathname.startsWith("/hr_manager") || pathname.startsWith("/admin");


  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token) {
    if (isAuthRoute && role) {
      const dashboard = role === "candidate" ? "/candidate/search_job" : `/${role}/dashboard`;
      return NextResponse.redirect(new URL(dashboard, request.url));
    }
    if(pathname === "/" || pathname.startsWith("/public")){
      const dashboard = role === "candidate" ? "/candidate/search_job" : `/${role}/dashboard`;
      return NextResponse.redirect(new URL(dashboard, request.url));
    }
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/candidate/dashboard", request.url));
    }

  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/candidate/:path*", "/hr_manager/:path*", "/admin/:path*", "/auth/login", "/auth/register","/public/:path*"],
};
