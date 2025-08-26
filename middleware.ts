import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/sign-in", "/sign-up"]; 
const PRIVATE_PREFIXES = ["/profile", "/notes"]; 

function isPublic(pathname: string) {
  return PUBLIC_ROUTES.includes(pathname);
}

function isPrivate(pathname: string) {
  return PRIVATE_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  let authed = false;
  try {
    const res = await fetch(new URL("/api/auth/session", req.url), {
      headers: { cookie: req.headers.get("cookie") || "" },
    });
        const text = await res.text();
    authed = !!text && text !== "undefined" && text !== "null";
  } catch {
    authed = false;
  }

  if (isPrivate(pathname) && !authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (!isPrivate(pathname) && !isPublic(pathname) && !authed) {
       return NextResponse.next();
  }

  if (isPublic(pathname) && authed && (pathname === "/sign-in" || pathname === "/sign-up")) {
    const url = req.nextUrl.clone();
    url.pathname = "/profile";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets|images).*)"],
};
