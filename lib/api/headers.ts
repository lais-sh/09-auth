import type {
  AxiosHeaders,
  AxiosResponseHeaders,
  RawAxiosResponseHeaders,
} from "axios";

export type PlainHeaders = Record<string, string | string[] | undefined>;

export function normalizeAxiosHeaders(
  headers?:
    | AxiosResponseHeaders
    | AxiosHeaders
    | RawAxiosResponseHeaders
    | Record<string, unknown>
): PlainHeaders {
  const out: PlainHeaders = {};
  if (!headers) return out;

  const h: any = headers;

  if (typeof h.toJSON === "function") {
    const json = h.toJSON() as Record<string, unknown>;
    for (const [k, v] of Object.entries(json)) {
      if (Array.isArray(v)) out[k.toLowerCase()] = v.map(String);
      else if (v == null) out[k.toLowerCase()] = undefined;
      else out[k.toLowerCase()] = String(v);
    }
    return out;
  }
  if (typeof h.forEach === "function") {
    h.forEach((value: unknown, key: string) => {
      if (Array.isArray(value)) out[key.toLowerCase()] = value.map(String);
      else if (value == null) out[key.toLowerCase()] = undefined;
      else out[key.toLowerCase()] = String(value as any);
    });
    return out;
  }
  for (const [k, v] of Object.entries(h as Record<string, unknown>)) {
    if (Array.isArray(v)) out[k.toLowerCase()] = v.map(String);
    else if (v == null) out[k.toLowerCase()] = undefined;
    else out[k.toLowerCase()] = String(v as any);
  }
  return out;
}
