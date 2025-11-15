const rawUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const API_URL = rawUrl.startsWith("http")
  ? rawUrl.replace(/\/$/, "")
  : `https://${rawUrl.replace(/\/$/, "")}`;
