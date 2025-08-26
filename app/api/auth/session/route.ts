import { NextRequest } from "next/server";
import { proxyJson } from "../../api";

export async function GET(req: NextRequest) {
  return proxyJson(req, "/auth/session");
}
