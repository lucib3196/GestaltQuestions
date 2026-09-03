import { publishedQuestionsTableConfig } from "../config/questionTableConfigs";
import { TableBaseView } from "../../TableBase/base/TableBaseView";
import type { TableProps } from "./type";
export default function PublishedQuestionsTable({
  onRowSelect,
  baseQuery = {},
}: TableProps) {
  return (
    <TableBaseView
      config={publishedQuestionsTableConfig}
      baseQuery={baseQuery}
      onRowSelect={onRowSelect}
    />
  );
}
