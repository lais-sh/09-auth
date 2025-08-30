import { NextRequest, NextResponse } from "next/server";

const PUBLIC_EXACT = ["/sign-in", "/sign-up"] as const;
const PRIVATE_PREFIXES = ["/profile", "/notes"] as const;

const isPrivate = (pathname: string) =>
  PRIVATE_PREFIXES.some((p) => pathname.startsWith(p));
const isPublicExact = (pathname: string) => PUBLIC_EXACT.includes(pathname as any);

function getSetCookieArray(headers: Headers): string[] {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie() as string[];
  }
  const single = headers.get("set-cookie");
  if (!single) return [];
  return [single];
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  let authed = Boolean(accessToken);
  const res = NextResponse.next();

  if (!authed && refreshToken) {
    try {
      const refreshRes = await fetch(new URL("/api/auth/refresh", req.url), {
        method: "POST",
        headers: { cookie: req.headers.get("cookie") ?? "" },
        cache: "no-store",
      });

      if (refreshRes.ok) {
        authed = true;
        const cookies = getSetCookieArray(refreshRes.headers);
        for (const c of cookies) {
          res.headers.append("Set-Cookie", c);
        }
      }
    } catch {
      authed = false;
    }
  }

  if (isPrivate(pathname) && !authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isPublicExact(pathname) && authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/profile";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
