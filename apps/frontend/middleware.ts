import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;
  

  const publicRoutes = ["/", "/auth/login", "/auth/register"];
  const isPublicRoute = publicRoutes.includes(pathname);
  

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
  

  if (token && (pathname === "/auth/login" || pathname === "/auth/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};