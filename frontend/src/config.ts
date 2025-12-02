const questionURLRaw = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const aiWorkspaceRaw = import.meta.env.VITE_AI_URL ?? "http://localhost:8001";

function PrepareURL(raw: string) {
  return raw.startsWith("http")
    ? raw.replace(/\/$/, "")
    : `https://${raw.replace(/\/$/, "")}`;
}

export const questionAPIURL = PrepareURL(questionURLRaw);
export const aiWorkspaceURL = PrepareURL(aiWorkspaceRaw);
