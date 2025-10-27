import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

  export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET!,
    secureCookie: process.env.NODE_ENV === "production",
  });

  const isAuth = !!token;
  const { pathname } = req.nextUrl;

  const publicPaths: string[] = ["/sign-up", "/log-in", "/favicon.ico"];

  if (!isAuth && !publicPaths.includes(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-up";
    return NextResponse.redirect(url);
  }

  if (isAuth && publicPaths.includes(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|.*\\..*|api|public).*)",
  ],
};
