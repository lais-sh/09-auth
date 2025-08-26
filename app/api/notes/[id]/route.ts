import { NextRequest } from "next/server";
import { proxyJson } from "../../api";

type Params = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Params) {
  return proxyJson(req, `/notes/${params.id}`);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  return proxyJson(req, `/notes/${params.id}`, { method: "DELETE" });
}
