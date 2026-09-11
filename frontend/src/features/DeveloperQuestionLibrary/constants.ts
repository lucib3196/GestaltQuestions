import type { QuestionLibraryTableView } from "./types";

export const QUESTION_LIBRARY_TABLE_OPTIONS = [
  { id: "myQuestions", label: "My Questions" },
  { id: "sharedByMe", label: "Shared by me" },
  { id: "sharedWithMe", label: "Shared with me" },
] as const satisfies readonly {
  id: QuestionLibraryTableView;
  label: string;
}[];
