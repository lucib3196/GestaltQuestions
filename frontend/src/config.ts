const rawUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
console.log("This is the raw url", rawUrl)
export const API_URL = rawUrl.startsWith("http")
  ? rawUrl.replace(/\/$/, "")
  : `https://${rawUrl.replace(/\/$/, "")}`;
