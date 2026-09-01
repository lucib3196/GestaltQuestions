import { useMemo } from "react";

import {
  type RowId,
  Table,
  TableBody,
  type TableColumn,
  TableContainer,
} from "../../../../components/Table";
import { useQuestionTableContext } from "../../state/context";
import { getVisibleColumns } from "../../utils/getVisibleColumns";
import { QuestionTableFooter } from "../footer/QuestionTableFooter";
import { QuestionTableHeader } from "../headers";

type QuestionDataTableProps<T, V extends string = never> = {
  data: T[];
  columns: TableColumn<T, V>[];
  getRowId: (_row: T) => RowId;
  onQuestionSelect?: (_questionId: RowId) => void;
};

export default function QuestionDataTable<T, V extends string = never>({
  data,
  columns,
  getRowId,
  onQuestionSelect,
}: QuestionDataTableProps<T, V>) {
  const page = useQuestionTableContext((s) => s.page);
  const visibleColumns = useQuestionTableContext(
    (state) => state.visibleColumns,
  );
  const resolvedColumns = useMemo(() => {
    return getVisibleColumns(columns, visibleColumns);
  }, [columns, visibleColumns]);
  const selectedIDs = useQuestionTableContext((state) => state.selectedIDs);
  const setSelectedIDs = useQuestionTableContext(
    (state) => state.setSelectedIDs,
  );

  const rowsPerPage = useQuestionTableContext((state) => state.rowsPerPage);

  const total = data.length;

  const currentPageRows = useMemo(
    () => data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [data, page, rowsPerPage],
  );

  return (
    <>
      <TableContainer>
        <Table aria-label="question-table">
          <QuestionTableHeader
            columns={resolvedColumns}
            rows={currentPageRows}
            getRowId={getRowId}
          />
          <TableBody
            rows={currentPageRows}
            columns={resolvedColumns}
            getRowId={getRowId}
            selectedIDs={selectedIDs}
            setSelectedIDs={setSelectedIDs}
            onQuestionSelect={onQuestionSelect}
          />
        </Table>
      </TableContainer>

      <QuestionTableFooter total={total} />
    </>
  );
}
