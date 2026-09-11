import { buildQuestionLibraryToolbarActions } from "../constants";

export const sharedWithMeToolbarActions = buildQuestionLibraryToolbarActions(
  ["tableFilters", "clearFilters"] as const,

  {
    tableFilters: { placement: "primary" },
    clearFilters: { placement: "primary" },
  },
);

export type SharedWithMeActionId =
  (typeof sharedWithMeToolbarActions)[number]["id"];
