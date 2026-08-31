import { useMemo } from "react";

import {
  type RowId,
  Table,
  TableBody,
  type TableColumn,
  TableContainer,
} from "../../../../components/Table";
import { useQuestionTableContext } from "../../instance/context";
import { getVisibleColumns } from "../../utils/getVisibleColumns";
import TableHeader from "./TableHeader";
import TableFooter from "../footer/TableFooter";
type QuestionTableProps<T, V extends string = never> = {
  data: T[];
  columns: TableColumn<T, V>[];
  getRowId: (row: T) => RowId;
  onQuestionSelect?: (questionId: RowId) => void;
};

export default function QuestionTable<T, V extends string = never>({
  data,
  columns,
  getRowId,
  onQuestionSelect,
}: QuestionTableProps<T, V>) {
  const page = useQuestionTableContext((s) => s.page);

  // Get the global state of the columns
  const visibleColumns = useQuestionTableContext(
    (state) => state.visibleColumns,
  );
  // Resolves the columsn based on the column config. Global state comes first->default visibility-> false
  const resolvedColumns = useMemo(() => {
    return getVisibleColumns(columns, visibleColumns);
  }, [columns, visibleColumns]);

  // Get all selected ids
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
          <TableHeader columns={resolvedColumns} />
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

      <TableFooter total={total} />
    </>
  );
}
