import axios from "axios";

const NOTEHUB_BASE =
  process.env.NEXT_PUBLIC_NOTEHUB_API_URL || "https://notehub-api.goit.study";

export const api = axios.create({
  baseURL: NOTEHUB_BASE,
  withCredentials: true,
  timeout: 15000,
});