import { buildQuestionLibraryToolbarActions } from "../constants";

export const MyQuestionToolBarActions = buildQuestionLibraryToolbarActions(
  [
    "copy",
    "download",
    "shareQuestion",
    "collections",
    "delete",
    "removeFromCollection",
    "tableFilters",
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
    delete: {
      label: "Delete Questions",
      placement: "overflow",
    },
    removeFromCollection: {
      placement: "overflow",
      requiresSelection: true
    },
  },
);

export type MyQuestionActionsId =
  (typeof MyQuestionToolBarActions)[number]["id"];
