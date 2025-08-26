import { NextRequest } from "next/server";
import { proxyJson } from "../api";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search || "";
  return proxyJson(req, `/notes${search}`);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  return proxyJson(req, "/notes", {
    method: "POST",
    body,
    headers: { "content-type": "application/json" },
  });
}
