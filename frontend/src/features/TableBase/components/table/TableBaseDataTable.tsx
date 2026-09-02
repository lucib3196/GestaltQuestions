import { useMemo } from "react";

import { Table, TableBody, TableContainer } from "../../primitives";
import type {
  AnyTableSchema,
  RowId,
  TableColumn,
  TableRow,
} from "../../types";
import { useTableBaseContext } from "../../state/context";
import { getVisibleColumns } from "../../utils/getVisibleColumns";
import { TableBaseFooter } from "../footer";
import TableBaseHeader from "../headers/TableBaseHeader";

type TableBaseDataTableProps<
  Schema extends AnyTableSchema = AnyTableSchema,
> = {
  data: TableRow<Schema>[];
  columns: TableColumn<Schema>[];
  getRowId: (_row: TableRow<Schema>) => RowId;
  onQuestionSelect?: (_questionId: RowId) => void;
};

export default function TableBaseDataTable<
  Schema extends AnyTableSchema = AnyTableSchema,
>({
  data,
  columns,
  getRowId,
  onQuestionSelect,
}: TableBaseDataTableProps<Schema>) {
  const page = useTableBaseContext((s) => s.page);
  const columnVisibility = useTableBaseContext(
    (state) => state.columnVisibility,
  );
  const resolvedColumns = useMemo(() => {
    return getVisibleColumns(columns, columnVisibility);
  }, [columns, columnVisibility]);
  const selectedIds = useTableBaseContext((state) => state.selectedIds);
  const setSelectedIds = useTableBaseContext(
    (state) => state.setSelectedIds,
  );

  const rowsPerPage = useTableBaseContext((state) => state.rowsPerPage);

  const total = data.length;

  const currentPageRows = useMemo(
    () => data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [data, page, rowsPerPage],
  );

  return (
    <>
      <TableContainer>
        <Table aria-label="question-table">
          <TableBaseHeader
            columns={resolvedColumns}
            rows={currentPageRows}
            getRowId={getRowId}
          />
          <TableBody
            rows={currentPageRows}
            columns={resolvedColumns}
            getRowId={getRowId}
            selectedIDs={selectedIds}
            setSelectedIDs={setSelectedIds}
            onQuestionSelect={onQuestionSelect}
          />
        </Table>
      </TableContainer>

      <TableBaseFooter total={total} />
    </>
  );
}
