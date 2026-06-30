export type Assistant = {
  assistant_id: string;
  label: string;
  description: string;
};
export const ASSISTANTS = [
  {
    assistant_id: "agent",
    label: "Default Assistant",
    description:
      "A general-purpose LLM with no specialized tools, instructions, or domain-specific behavior.",
  },
  {
    assistant_id: "core",
    label: "Core Assistant",
    description: "The core agent",
  },
] as const satisfies readonly Assistant[];

export type AssistantId = (typeof ASSISTANTS)[number]["assistant_id"];
