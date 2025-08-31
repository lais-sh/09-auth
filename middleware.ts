import { NextRequest, NextResponse } from "next/server";

const PUBLIC_EXACT = ["/sign-in", "/sign-up"] as const;
const PRIVATE_PREFIXES = ["/profile", "/notes"] as const;

const isPrivate = (p: string) => PRIVATE_PREFIXES.some((s) => p.startsWith(s));
const isPublicExact = (p: string) => PUBLIC_EXACT.includes(p as any);

// универсальный способ достать все set-cookie
function getSetCookieArray(headers: Headers): string[] {
  // @ts-ignore - у Node 18/Edge может быть getSetCookie
  if (typeof headers.getSetCookie === "function") return headers.getSetCookie() as string[];
  const single = headers.get("set-cookie");
  return single ? [single] : [];
}

async function validateSession(origin: string, cookieHeader: string | null): Promise<boolean> {
  try {
    const r = await fetch(`${origin}/api/auth/session`, {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      cache: "no-store",
    });
    if (!r.ok) return false;
    // этот роут возвращает { success: boolean } по ТЗ
    const data = await r.json().catch(() => null);
    return Boolean(data && data.success);
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  const cookieHeader = req.headers.get("cookie") ?? "";
  const hasAccess = Boolean(req.cookies.get("accessToken")?.value);
  const hasRefresh = Boolean(req.cookies.get("refreshToken")?.value);

  let authed = false;
  let setCookieFromRefresh: string[] = [];

  // 1) Пытаемся обновить токены, НО считаем авторизованным только если пришли новые cookies
  if (hasRefresh) {
    try {
      const refreshRes = await fetch(`${origin}/api/auth/refresh`, {
        method: "POST",
        headers: { cookie: cookieHeader },
        cache: "no-store",
      });
      if (refreshRes.ok) {
        setCookieFromRefresh = getSetCookieArray(refreshRes.headers);
        if (setCookieFromRefresh.length > 0) {
          authed = true;
        }
      }
    } catch {
      // ignore
    }
  }

  // 2) Если после refresh всё ещё не автhed, но есть access — валидируем
  if (!authed && hasAccess) {
    authed = await validateSession(origin, cookieHeader);
  }

  // 3) Приватный путь без авторизации → на /sign-in
  if (isPrivate(pathname) && !authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // 4) Публичные auth-страницы, когда уже авторизован → на /profile
  if (isPublicExact(pathname) && authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/profile";
    const res = NextResponse.redirect(url);
    for (const c of setCookieFromRefresh) res.headers.append("Set-Cookie", c);
    return res;
  }

  // 5) Пропускаем дальше, но прокидываем новые куки, если были
  const res = NextResponse.next();
  for (const c of setCookieFromRefresh) res.headers.append("Set-Cookie", c);
  return res;
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
