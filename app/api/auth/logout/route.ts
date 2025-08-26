import { NextRequest } from "next/server";
import { proxyJson } from "../../api";

export async function POST(req: NextRequest) {
  return proxyJson(req, "/auth/logout", { method: "POST" });
}
