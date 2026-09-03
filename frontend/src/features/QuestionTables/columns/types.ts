import type {
  QuestionTableRow,
  QuestionTableSearchParams,
} from "../../../services";
import type { TableColumn, TableColumnKey, TableSchema } from "../../TableBase";

export type QuestionTableVirtualKey = "select";

export type QuestionTableSchema = TableSchema<
  QuestionTableRow,
  QuestionTableVirtualKey,
  QuestionTableSearchParams
>;

export type QuestionTableColumn = TableColumn<QuestionTableSchema>;

export type QuestionColumnKey = TableColumnKey<QuestionTableSchema>;
