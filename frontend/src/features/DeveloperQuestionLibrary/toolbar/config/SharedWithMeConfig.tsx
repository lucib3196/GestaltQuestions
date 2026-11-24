import { buildQuestionLibraryToolbarActions } from "../constants";

export const sharedWithMeToolbarActions = buildQuestionLibraryToolbarActions(
  ["bookmark", "tableFilters", "clearFilters"] as const,

  {
    bookmark: { placement: "primary" },
    tableFilters: { placement: "primary" },
    clearFilters: { placement: "primary" },
  },
);

export type SharedWithMeActionId =
  (typeof sharedWithMeToolbarActions)[number]["id"];
