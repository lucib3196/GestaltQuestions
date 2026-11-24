import type { TableProps } from "../../QuestionTables/views/type";
import { TableBaseView } from "../../TableBase/base/TableBaseView";
import {
  type CollectionQuestionSchema,
  collectionQuestionTableConfig,
} from "./collectionQuestionTableConfig";

export function CollectionQuestionTable({
  onRowSelect,
  baseQuery = {},
}: TableProps<CollectionQuestionSchema>) {
  return (
    <TableBaseView<CollectionQuestionSchema>
      config={collectionQuestionTableConfig}
      baseQuery={baseQuery}
      onRowSelect={onRowSelect}
    />
  );
}
