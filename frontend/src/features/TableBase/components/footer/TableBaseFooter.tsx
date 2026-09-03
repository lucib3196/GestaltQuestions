import { TableFooter as TableFooterBase } from "./TableFooter";
import { useTableBaseContext } from "../../state/context";

type TableFooterProps = {
  total: number;
};
export function TableBaseFooter({ total }: TableFooterProps) {
  const page = useTableBaseContext((s) => s.page);
  const setPage = useTableBaseContext((s) => s.setPage);
  const rowsPerPage = useTableBaseContext((s) => s.rowsPerPage);
  const setRowsPerPage = useTableBaseContext((s) => s.setRowsPerPage);
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  const from = total === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min(total, (page + 1) * rowsPerPage);

  const handleRowsPerPageChange = (nextRowsPerPage: number) => {
    setRowsPerPage(nextRowsPerPage);
  };

  return (
    <TableFooterBase
      from={from}
      to={to}
      total={total}
      page={page}
      totalPages={totalPages}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={handleRowsPerPageChange}
      onPreviousPage={() => setPage(Math.max(0, page - 1))}
      onNextPage={() => setPage(Math.min(totalPages - 1, page + 1))}
    />
  );
}
