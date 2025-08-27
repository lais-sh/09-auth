import { NextResponse } from "next/server";

const BACKEND_BASE = process.env.NOTEHUB_API_URL?.replace(/\/+$/, "") || "https://notehub-api.goit.study";

function applySetCookies(from: Response, to: NextResponse) {
  const anyHeaders = from.headers as any;

  const setCookies: string[] =
    typeof anyHeaders.getSetCookie === "function"
      ? anyHeaders.getSetCookie()
      : (from.headers.get("set-cookie") ? [from.headers.get("set-cookie") as string] : []);

  for (const sc of setCookies) {
    to.headers.append("set-cookie", sc);
  }
}

export async function POST(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "";

  try {
    const refreshRes = await fetch(`${BACKEND_BASE}/auth/refresh`, {
      method: "POST",
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });

    const text = await refreshRes.text();
    const body = text ? JSON.parse(text) : null;

    const nextRes = NextResponse.json(body, { status: refreshRes.status });
    applySetCookies(refreshRes, nextRes);
    return nextRes;
  } catch {
    try {
      const sessionRes = await fetch(`${BACKEND_BASE}/auth/session`, {
        method: "GET",
        headers: { cookie: cookieHeader },
        cache: "no-store",
      });

      const text = await sessionRes.text();
      const body = text ? JSON.parse(text) : null;

      const nextRes = NextResponse.json(body, { status: sessionRes.status });
      applySetCookies(sessionRes, nextRes);
      return nextRes;
    } catch {
      return NextResponse.json({ message: "Refresh failed" }, { status: 401 });
    }
  }
}
