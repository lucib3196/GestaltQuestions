import type { QuestionTableSearchParams } from "../../../services";

export type QuestionTableViewProps = {
  onQuestionSelect?: (_questionId: string) => void;
  baseQuery?: QuestionTableSearchParams;
};
