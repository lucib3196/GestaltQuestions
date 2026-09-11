import { buildQuestionLibraryToolbarActions } from "../constants";

export const sharedWithMeToolbarActions = buildQuestionLibraryToolbarActions(
  ["tableFilters"] as const,

  { tableFilters: { placement: "primary" } },
);

export type SharedWithMeActionId =
  (typeof sharedWithMeToolbarActions)[number]["id"];
