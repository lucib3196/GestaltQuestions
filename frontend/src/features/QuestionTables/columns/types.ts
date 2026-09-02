import type {
  TableColumn,
  TableColumnKey,
  TableSchema,
} from "../../TableBase";
import type {
  QuestionTableRow,
  QuestionTableSearchParams,
} from "../../../services";

export type QuestionTableVirtualKey = "select";

export type QuestionTableSchema = TableSchema<
  QuestionTableRow,
  QuestionTableVirtualKey,
  QuestionTableSearchParams
>;

export type QuestionTableColumn = TableColumn<QuestionTableSchema>;

export type QuestionColumnKey = TableColumnKey<QuestionTableSchema>;
