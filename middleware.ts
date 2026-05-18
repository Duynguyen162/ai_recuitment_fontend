import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("access_token"); // Token bảo mật (HTTP-only)
  const role = request.cookies.get("role")?.value;   // Role để phân luồng (Cookie thường)

  const isAuthRoute = pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register") || pathname.startsWith("/admin/login");
  const isAdminRoute = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  const isProtectedRoute = pathname.startsWith("/candidate") || pathname.startsWith("/hr_manager") || isAdminRoute;

  // 1. Redirect if not authenticated
  if (isProtectedRoute && !token) {
    const loginUrl = pathname.startsWith("/admin") 
      ? new URL("/admin/login", request.url) 
      : new URL("/auth/login", request.url);
    
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect if already authenticated
  if (token) {
    // Nếu đã login mà vào trang auth/login hoặc admin/login
    if (isAuthRoute && role) {
      const dashboard = role === "candidate" ? "/candidate/search_job" : `/${role}/dashboard`;
      const targetUrl = new URL(dashboard, request.url);
      targetUrl.search = request.nextUrl.search;
      return NextResponse.redirect(targetUrl);
    }

    // Chặn người dùng không phải admin vào route admin
    if (pathname.startsWith("/admin") && role !== "admin") {
      const dashboard = role === "candidate" ? "/candidate/search_job" : `/${role}/dashboard`;
      const targetUrl = new URL(dashboard, request.url);
      targetUrl.search = request.nextUrl.search;
      return NextResponse.redirect(targetUrl);
    }
    
    if(pathname === "/" || pathname.startsWith("/public")){
      const dashboard = role === "candidate" ? "/candidate/search_job" : `/${role}/dashboard`;
      const targetUrl = new URL(dashboard, request.url);
      targetUrl.search = request.nextUrl.search;
      return NextResponse.redirect(targetUrl);
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
    "/public/:path*"
  ],
};
