import type { TableColumn } from "../../../components/Table";
import type {
  QuestionTableRow,
  QuestionTableSearchParams,
} from "../../../services";

export type QuestionTableVirtualKey = "select";

export type QuestionTableColumn = TableColumn<
  QuestionTableRow,
  QuestionTableVirtualKey,
  QuestionTableSearchParams
>;

export type QuestionColumnKey =
  | keyof QuestionTableRow
  | QuestionTableVirtualKey;
