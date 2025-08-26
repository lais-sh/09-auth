import axios, { AxiosError } from "axios";

const isServer = typeof window === "undefined";
const envOrigin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

if (isServer && process.env.NODE_ENV === "production" && !envOrigin) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not set on the server in production. " +
      "Set it to your deployed origin, e.g. https://<your-app>.vercel.app"
  );
}

export const APP_ORIGIN =
  envOrigin ||
  (!isServer ? window.location.origin : "http://localhost:3000");

export const api = axios.create({
  baseURL: `${APP_ORIGIN}/api`,
  withCredentials: true, 
  headers: {
    Accept: "application/json",
  },
  timeout: 15000,
  validateStatus: (status) => status >= 200 && status < 300,
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (process.env.NODE_ENV !== "production") {
      const cfg = error.config;
      console.error("API error", {
        method: cfg?.method,
        url:
          (cfg?.baseURL ? cfg.baseURL.replace(/\/$/, "") : "") +
          (cfg?.url || ""),
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }
    return Promise.reject(error);
  }
);

export default api;
