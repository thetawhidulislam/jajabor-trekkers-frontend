import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";
import { safeRedirect } from "@/lib/auth/safe-redirect";

const protectedPaths = ["/trips", "/invitations", "/profile", "/admin"];
const authPaths = ["/login", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSessionCookie = Boolean(getSessionCookie(request));
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const isAuthPage = authPaths.includes(pathname);

  if (isProtected && !hasSessionCookie) {
    const destination = new URL("/login", request.url);
    destination.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(destination);
  }

  if (isAuthPage && hasSessionCookie) {
    const destination = new URL(safeRedirect(request.nextUrl.searchParams.get("next")), request.url);
    return NextResponse.redirect(destination);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/trips/:path*",
    "/invitations",
    "/profile",
    "/admin/:path*",
    "/login",
    "/signup",
  ],
};
