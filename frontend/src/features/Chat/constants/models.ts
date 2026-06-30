export type CHAT_INFO = {
  provider: string;
  value: string;
  label: string;
};
export const CHAT_MODELS = [
  {
    provider: "google_genai",
    value: "gemini-3.5-flash",
    label: "Gemini 3.5 Flash",
  },
  {
    provider: "google_genai",
    value: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
  },
  {
    provider: "google_genai",
    value: "gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash Lite",
  },
  {
    provider: "google_genai",
    value: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
  },
] as const;

export type ChatModel = (typeof CHAT_MODELS)[number]["value"];
export type ChatModelProvider = (typeof CHAT_MODELS)[number]["provider"];

export const DEFAULT_CHAT_MODEL: ChatModel = "gemini-2.5-flash";
