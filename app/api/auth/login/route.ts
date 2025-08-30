import { NextRequest, NextResponse } from "next/server";
import { api } from "../../api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toCookieArray(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  if (typeof v === "string") return [v];
  return [];
}

export async function POST(req: NextRequest) {
  const payload = await req.json();

  const res = await api.post("/auth/login", payload, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
    validateStatus: () => true,
  });

  const out = NextResponse.json(res.data, { status: res.status });

  const raw = (res.headers as unknown as Record<string, unknown>)["set-cookie"];
  const setCookies = toCookieArray(raw);

  for (const c of setCookies) {
    const cookie =
      process.env.NODE_ENV === "development" ? c.replace(/;\s*Secure/gi, "") : c;
    out.headers.append("Set-Cookie", cookie);
  }

  return out;
}
