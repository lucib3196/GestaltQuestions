import type { DeveloperWorkspaceSection } from "./types";

export const DEVELOPER_WORKSPACE_SIDEBAR_OPTIONS = [
  {
    id: "questions",
    label: "My Questions",
    to: "/question_builder/questions",
    end: true,
  },
  {
    id: "collections",
    label: "Collections",
    to: "/question_builder/collections",
    end: true,
  },
] as const satisfies readonly {
  id: DeveloperWorkspaceSection;
  label: string;
  to: string;
  end?: boolean;
}[];
