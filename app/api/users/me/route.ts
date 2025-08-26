import { NextRequest } from "next/server";
import { proxyJson } from "../../api";

export async function GET(req: NextRequest) {
  return proxyJson(req, "/users/me");
}

export async function PATCH(req: NextRequest) {
  const body = await req.text();
  return proxyJson(req, "/users/me", {
    method: "PATCH",
    body,
    headers: { "content-type": "application/json" },
  });
}
