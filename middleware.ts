// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req: import("next/server").NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // 🔹 If logged in and tries to access signin/signup, redirect to dashboard
  if (token && (pathname === "/auth/signin" || pathname === "/auth/signup")) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // 🔹 Protect /admin routes from unauthenticated access
  if (pathname.startsWith("/admin") && !token) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  return NextResponse.next();
}

// 🔹 Apply to admin routes and auth pages
export const config = {
  matcher: ["/admin/:path*", "/auth/signin", "/auth/signup"],
};
