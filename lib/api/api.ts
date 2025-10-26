import axios, { AxiosError } from "axios";

const isServer = typeof window === "undefined";

const envOrigin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

const DEFAULT_SERVER_ORIGIN = "http://127.0.0.1:3000";

// lib/api/api.ts
const isServer = typeof window === "undefined";
const envOrigin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

const DEFAULT_SERVER_ORIGIN = "http://127.0.0.1:3000";

// 👇 NEW: prefer Vercel URL when not given an explicit origin
const vercelOrigin = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined;

const serverOrigin = envOrigin || vercelOrigin || DEFAULT_SERVER_ORIGIN;

const baseURL = isServer ? `${serverOrigin}/api` : "/api";


if (isServer && process.env.NODE_ENV === "production" && !envOrigin) {
  console.warn(
    "WARN: NEXT_PUBLIC_API_URL is not set in production. " +
      "Set it to your deployed origin, e.g. https://<your-app>.vercel.app"
  );
}

const baseURL = isServer
  ? `${envOrigin || DEFAULT_SERVER_ORIGIN}/api`
  : "/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { Accept: "application/json" },
  timeout: 15000,
  validateStatus: (status) => status >= 200 && status < 300,
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (process.env.NODE_ENV !== "production") {
      const cfg = error.config;
      const b =
        (cfg?.baseURL ? String(cfg.baseURL).replace(/\/$/, "") : "") +
        (cfg?.url || "");
      console.error("API error", {
        method: cfg?.method,
        url: b,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }
    return Promise.reject(error);
  }
);

export default api;

