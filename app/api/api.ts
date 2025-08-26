import { NextRequest, NextResponse } from "next/server";

export const API_ORIGIN =
  process.env.NOTEHUB_API_ORIGIN ?? "https://notehub-api.goit.study";

export const dynamic = "force-dynamic";

export async function proxyJson(
  req: NextRequest,
  path: string,
  init?: RequestInit
) {
  const url = `${API_ORIGIN}${path}`;
  const headers: HeadersInit = {
    ...(init?.headers || {}),
    cookie: req.headers.get("cookie") || "",
  };

  const res = await fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  });

  const text = await res.text(); 
  const contentType = res.headers.get("content-type") || "application/json";

  const out = new NextResponse(text, {
    status: res.status,
    headers: { "content-type": contentType },
  });

  const setCookie = res.headers.get("set-cookie");
  if (setCookie) out.headers.append("set-cookie", setCookie);

  return out;
}
