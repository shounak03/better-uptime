import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;


  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
  if(req.nextUrl.pathname === "/auth/login" && token) {
    return NextResponse.redirect(new URL("/addWebsites", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/addWebsites",
};