import { useQuestionTableContext } from "../../instance/context";
import { TableFooter as TableFooterBase } from "../../../../components/Table";

type TableFooterProps = {
  total: number;
};
export default function TableFooter({ total }: TableFooterProps) {
  const page = useQuestionTableContext((s) => s.page);
  const setPage = useQuestionTableContext((s) => s.setPage);
  const rowsPerPage = useQuestionTableContext((s) => s.rowsPerPage);

  const setPagination = useQuestionTableContext((state) => state.setPagination);
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  const from = total === 0 ? 0 : page * rowsPerPage + 1;
  const to = Math.min(total, (page + 1) * rowsPerPage);

  const handleRowsPerPageChange = (nextRowsPerPage: number) => {
    setPagination({ rowsPerPage: nextRowsPerPage, offset: 0 });
    setPage(0);
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
