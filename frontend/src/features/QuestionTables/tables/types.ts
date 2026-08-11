import type { QuestionTableSearchParams } from "../../../services";

export type QuestionTableViewProps = {
  onQuestionSelect?: (questionId: string) => void;
  baseQuery?: QuestionTableSearchParams;
};
