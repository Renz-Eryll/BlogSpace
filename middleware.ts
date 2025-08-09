import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    console.log("🔍 Middleware - Path:", req.nextUrl.pathname);
    console.log("🔍 Middleware - Token exists:", !!req.nextauth.token);
    console.log("🔍 Middleware - User role:", req.nextauth.token?.role);

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        console.log("🔐 Authorized callback");
        console.log("🔐 Path:", req.nextUrl.pathname);
        console.log("🔐 Token exists:", !!token);

        // For admin routes, require authentication
        if (req.nextUrl.pathname.startsWith("/admin")) {
          const hasToken = !!token;
          console.log(
            "🔐 Admin route access:",
            hasToken ? "GRANTED" : "DENIED"
          );
          return hasToken;
        }

        // All other routes are public
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
