import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/sign-in", "/sign-up"];
const PRIVATE_PREFIXES = ["/profile", "/notes"];

function isPrivate(pathname: string) {
  return PRIVATE_PREFIXES.some((p) => pathname.startsWith(p));
}
function isPublicExact(pathname: string) {
  return PUBLIC_ROUTES.includes(pathname);
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

        const anyHeaders = refreshRes.headers as any;

        if (typeof anyHeaders.getSetCookie === "function") {
          const setCookies: string[] = anyHeaders.getSetCookie();
          for (const c of setCookies) {
            res.headers.append("set-cookie", c);
          }
        } else {
          const sc = refreshRes.headers.get("set-cookie");
          if (sc) res.headers.append("set-cookie", sc);
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
