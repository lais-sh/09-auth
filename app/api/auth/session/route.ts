import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "../../api";
import { parse as parseCookie } from "cookie";
import { isAxiosError } from "axios";

export async function GET() {
  try {
    const reqCookies = await cookies();

    const accessToken = reqCookies.get("accessToken")?.value;
    const refreshToken = reqCookies.get("refreshToken")?.value;

    if (accessToken) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (refreshToken) {
      const apiRes = await api.get("/auth/session", {
        headers: { Cookie: reqCookies.toString() },
        validateStatus: () => true,
      });

      const res = NextResponse.json(
        { success: apiRes.status < 400 },
        { status: 200 }
      );

      const setCookieHeader = apiRes.headers["set-cookie"];
      if (setCookieHeader) {
        const list = Array.isArray(setCookieHeader)
          ? setCookieHeader
          : [setCookieHeader];

        for (const raw of list) {
          const c = parseCookie(raw);
          const opts: Parameters<typeof res.cookies.set>[2] = {
            path: c.path,
          };
          if (c.expires) opts.expires = new Date(c.expires);
          if (c["max-age"]) opts.maxAge = Number(c["max-age"]);

          if (c.accessToken) res.cookies.set("accessToken", c.accessToken, opts);
          if (c.refreshToken) res.cookies.set("refreshToken", c.refreshToken, opts);
        }
      }

      return res;
    }

    return NextResponse.json({ success: false }, { status: 200 });
  } catch (error) {
    if (isAxiosError(error)) {
      return NextResponse.json({ success: false }, { status: 200 });
    }
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
