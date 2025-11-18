import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

// Protect all routes except auth pages and API auth routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /auth/signin (sign in page)
     * - /api/auth/* (NextAuth API routes)
     * - /api/health (Docker health check)
     * - /api/videos/* (video storage/serving - internal use)
     * - /_next/* (Next.js internals)
     * - /favicon.ico, /robots.txt (static files)
     */
    "/((?!auth/signin|api/auth|api/health|api/videos|_next|favicon.ico|robots.txt).*)",
  ],
};
