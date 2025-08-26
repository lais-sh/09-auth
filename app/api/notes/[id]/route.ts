import { NextRequest } from "next/server";
import { proxyJson } from "../../api";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyJson(req, `/notes/${id}`);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyJson(req, `/notes/${id}`, { method: "DELETE" });
}
