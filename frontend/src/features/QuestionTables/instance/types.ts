export type RowId = string;
import type { QuestionRead } from "../../QuestionBuilder";

export type TableColumn = {
  key: string;
  render?: (
    row: { id?: string | null | undefined },
    className?: string,
  ) => React.ReactNode;
};

export type DevQuestionTState = {
  questions: QuestionRead[];
  selectedIDs: string[];
  multiselect: boolean;
};

export type DevQuestionTActions = {
  setSelectedIDs: (ids: string[]) => void;
  setMultiSelect: (val: boolean) => void;
  setQuestions: (qs: QuestionRead[]) =>void;
};

export type DevQuestionTStore = DevQuestionTState & DevQuestionTActions;
