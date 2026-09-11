import { buildQuestionLibraryToolbarActions } from "../constants";

export const manageableQuestionsToolbarActions =
  buildQuestionLibraryToolbarActions(
    [
      "copy",
      "download",
      "shareQuestion",
      "collections",
      "delete",
      "removeFromCollection",
      "tableFilters",
      "clearFilters",
    ] as const,
    {
      copy: {
        placement: "primary",
      },
      download: {
        placement: "overflow",
      },

      shareQuestion: { placement: "primary" },
      collections: { placement: "primary" },
      tableFilters: {
        placement: "primary",
      },
      clearFilters: {
        placement: "primary",
      },
      delete: {
        label: "Delete Questions",
        placement: "overflow",
      },
      removeFromCollection: {
        placement: "overflow",
        requiresSelection: true,
      },
    },
  );

export type ManageableQuestionsActionId =
  (typeof manageableQuestionsToolbarActions)[number]["id"];
