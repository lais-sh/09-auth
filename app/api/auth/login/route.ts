import { NextRequest } from "next/server";
import { proxyJson } from "../../api";

export async function POST(req: NextRequest) {
  const body = await req.text();
  return proxyJson(req, "/auth/login", {
    method: "POST",
    body,
    headers: { "content-type": "application/json" },
  });
}
