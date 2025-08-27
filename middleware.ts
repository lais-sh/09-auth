import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/sign-in", "/sign-up"];
const PRIVATE_PREFIXES = ["/profile", "/notes"];

const isPublic = (p: string) => PUBLIC_ROUTES.includes(p);
const isPrivate = (p: string) => PRIVATE_PREFIXES.some((x) => p.startsWith(x));

export async function middleware(req: NextRequest) {
  const { pathname, origin, search } = req.nextUrl;

  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  const redirectToLogin = () =>
    NextResponse.redirect(new URL(`/sign-in?from=${encodeURIComponent(pathname + search)}`, origin));
  const redirectToProfile = () => NextResponse.redirect(new URL("/profile", origin));

  if (isPrivate(pathname) && !accessToken) {
    if (refreshToken) {
      const res = await fetch(`${origin}/api/auth/refresh`, {
        method: "GET",
        headers: { cookie: req.headers.get("cookie") ?? "" },
        cache: "no-store",
      });
      if (res.ok) {
        const next = NextResponse.next();
        const setCookie = res.headers.get("set-cookie");
        if (setCookie) next.headers.append("set-cookie", setCookie);
        return next;
      }
    }
    return redirectToLogin();
  }

  if (isPublic(pathname) && accessToken) return redirectToProfile();

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
