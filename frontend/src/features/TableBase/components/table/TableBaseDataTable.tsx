import { useMemo } from "react";

import { Table, TableBody, TableContainer } from "../../primitives";
import { useTableBaseContext } from "../../state/context";
import type { AnyTableSchema, RowId, TableColumn, TableRow } from "../../types";
import { getVisibleColumns } from "../../utils/getVisibleColumns";
import { TableBaseFooter } from "../footer";
import TableBaseHeader from "../headers/TableBaseHeader";

type TableBaseDataTableProps<Schema extends AnyTableSchema = AnyTableSchema> = {
  data: TableRow<Schema>[];
  columnDefs: TableColumn<Schema>[];
  getRowId: (_row: TableRow<Schema>) => RowId;
  onRowSelect?: (_rowId: RowId) => void;
};

export default function TableBaseDataTable<
  Schema extends AnyTableSchema = AnyTableSchema,
>({
  data,
  columnDefs,
  getRowId,
  onRowSelect,
}: TableBaseDataTableProps<Schema>) {
  const page = useTableBaseContext((s) => s.page);
  const columnVisibility = useTableBaseContext(
    (state) => state.columnVisibility,
  );
  const resolvedColumns = useMemo(() => {
    return getVisibleColumns(columnDefs, columnVisibility);
  }, [columnDefs, columnVisibility]);
  const selectedIds = useTableBaseContext((state) => state.selectedIds);
  const setSelectedIds = useTableBaseContext((state) => state.setSelectedIds);

  const rowsPerPage = useTableBaseContext((state) => state.rowsPerPage);

  const total = data.length;

  const currentPageRows = useMemo(
    () => data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [data, page, rowsPerPage],
  );

  return (
    <div className="flex flex-col w-full h-full">
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
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            onRowSelect={onRowSelect}
          />
        </Table>
      </TableContainer>
      <TableBaseFooter total={total} />
    </div>
  );
}
