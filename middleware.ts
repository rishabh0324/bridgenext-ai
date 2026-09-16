import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("sih_token")?.value;

  const protectedPrefixes = [
    "/student",
    "/industry",
    "/faculty",
    "/institution",
    "/tpo",
    "/admin",
  ];

  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtected) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/student/:path*",
    "/industry/:path*",
    "/faculty/:path*",
    "/institution/:path*",
    "/tpo/:path*",
    "/admin/:path*",
  ],
};
