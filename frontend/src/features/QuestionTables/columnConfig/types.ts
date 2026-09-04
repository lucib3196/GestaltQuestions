import type {
  QuestionTableRowBase,
  QuestionTableRow,
  QuestionTableSearchParams,
  SharedByMeQuestionTableRow,
  SharedQuestionTableRow,
} from "../../../services";
import type { TableColumn, TableColumnKey, TableSchema } from "../../TableBase";

export type QuestionTableVirtualKey = "select";

export type QuestionTableBaseSchema = TableSchema<
  QuestionTableRowBase,
  QuestionTableVirtualKey,
  QuestionTableSearchParams
>;

export type QuestionTableSchema = TableSchema<
  QuestionTableRow,
  QuestionTableVirtualKey,
  QuestionTableSearchParams
>;

export type SharedQuestionTableSchema = TableSchema<
  SharedQuestionTableRow,
  QuestionTableVirtualKey,
  QuestionTableSearchParams
>;

export type SharedByMeQuestionTableSchema = TableSchema<
  SharedByMeQuestionTableRow,
  QuestionTableVirtualKey,
  QuestionTableSearchParams
>;

export type QuestionTableColumn<
  Schema extends TableSchema = QuestionTableBaseSchema,
> = TableColumn<Schema>;

export type QuestionColumnKey = TableColumnKey<QuestionTableSchema>;
