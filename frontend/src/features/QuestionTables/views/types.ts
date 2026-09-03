import type { QuestionTableSearchParams } from "../../../services";

export type QuestionTableViewProps = {
  onRowSelect?: (_rowId: string) => void;
  baseQuery?: QuestionTableSearchParams;
};
