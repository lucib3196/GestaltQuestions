import type { QuestionLibraryTableView, LibraryView } from "./types";

export const QUESTION_LIBRARY_TABLE_OPTIONS = [
  { id: "myQuestions", label: "My Questions" },
  { id: "sharedByMe", label: "Shared by me" },
  { id: "sharedWithMe", label: "Shared with me" },
] as const satisfies readonly {
  id: QuestionLibraryTableView;
  label: string;
}[];

export const LIBRARY_SIDEBAR_OPTIONS = [
  { id: "Questions", label: "My Questions" },
  { id: "Collections", label: "Collections" },
] as const satisfies readonly {
  id: LibraryView;
  label: string;
}[];
