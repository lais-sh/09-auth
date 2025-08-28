import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/sign-in", "/sign-up"];
const PRIVATE_PREFIXES = ["/profile", "/notes"];

const isPublic = (p: string) => PUBLIC_ROUTES.includes(p);
const isPrivate = (p: string) => PRIVATE_PREFIXES.some((x) => p.startsWith(x));
const isAuthPage = (p: string) => p === "/sign-in" || p === "/sign-up";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname, search } = req.nextUrl;

  const res = await fetch(new URL("/api/auth/session", req.url), {
    headers: { cookie: req.headers.get("cookie") ?? "" },
    cache: "no-store",
  });

  const text = await res.text();
  const authed = !!text && text !== "null" && text !== "undefined";

  if (isPrivate(pathname) && !authed) {
    url.pathname = "/sign-in";
    url.search = "";
    url.searchParams.set("from", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (isAuthPage(pathname) && authed) {
    url.pathname = "/profile";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}


 export const config = {
   matcher: ["/((?!_next/static|_next/image|favicon.ico|assets|images).*)"],
  };
