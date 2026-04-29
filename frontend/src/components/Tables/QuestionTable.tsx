import { useMemo, useState } from "react";

type RowId = string;

export type TableColumn<T> = {
    key: string;
    default?: boolean;
    render?: (row: T, className?: string) => React.ReactNode;
};

type QuestionTableProps<T extends { id?: string | null }> = {
    questions: T[];
    columns: TableColumn<T>[];
    multiSelect?: boolean;
    selectedIds?: RowId[];
    onSelectedIdsChange?: (next: RowId[]) => void;
    onTitleClick?: (row: T) => void;
};

const styles = {
    shell: "mt-8 w-full",
    tableWrap:
        "overflow-hidden rounded-xl border border-border bg-surface shadow-soft backdrop-blur-md",
    scroll: "w-full overflow-x-auto",
    table: "min-w-full border-collapse",
    headRow: "bg-surface-strong",
    headCell:
        "border-b border-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted",
    bodyRow:
        "border-b border-border/70 last:border-b-0 hover:bg-surface-muted/60",
    bodyCell: "px-4 py-3 text-sm text-text",
    titleCell: "cursor-pointer font-medium text-text hover:text-accent",
    checkbox: "h-4 w-4 accent-[var(--color-accent)]",
    emptyCell: "px-4 py-8 text-center text-sm text-text-muted",
    footer:
        "mt-3 flex items-center justify-between gap-3 text-sm text-text-muted",
    pagerControls: "flex items-center gap-2",
    select:
        "rounded-md border border-border bg-surface px-2 py-1 text-sm text-text outline-none focus:border-accent",
    button:
        "rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50",
};

export default function QuestionTable<T extends { id?: string | null }>({
    questions,
    columns,
    multiSelect = false,
    selectedIds = [],
    onSelectedIdsChange,
    onTitleClick,
}: QuestionTableProps<T>) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const total = questions.length;
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

    const paged = useMemo(
        () => questions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [questions, page, rowsPerPage],
    );

    const from = total === 0 ? 0 : page * rowsPerPage + 1;
    const to = Math.min(total, (page + 1) * rowsPerPage);

    const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRowsPerPage(Number.parseInt(e.target.value, 10));
        setPage(0);
    };

    const handleSelect = (id: RowId, checked: boolean) => {
        if (!onSelectedIdsChange) return;

        if (checked) {
            onSelectedIdsChange(
                selectedIds.includes(id) ? selectedIds : [...selectedIds, id],
            );
            return;
        }

        onSelectedIdsChange(selectedIds.filter((v) => v !== id));
    };

    const visibleColumns = columns.filter(
        (col) => multiSelect || col.key !== "select",
    );

    return (
        <div className={styles.shell}>
            <div className={styles.tableWrap}>
                <div className={styles.scroll}>
                    <table className={styles.table} aria-label="question table">
                        <thead>
                            <tr className={styles.headRow}>
                                {visibleColumns.map((col) => (
                                    <th key={col.key} className={styles.headCell}>
                                        {col.key}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {paged.length === 0 && (
                                <tr>
                                    <td
                                        className={styles.emptyCell}
                                        colSpan={visibleColumns.length}
                                    >
                                        No questions found.
                                    </td>
                                </tr>
                            )}

                            {paged.map((question, rowIndex) => {
                                const rowKey = question.id ?? `row-${page}-${rowIndex}`;

                                return (
                                    <tr key={rowKey} className={styles.bodyRow}>
                                        {visibleColumns.map((col) => {
                                            if (col.key === "select") {
                                                const id = question.id ?? "";

                                                return (
                                                    <td
                                                        key={`${rowKey}-select`}
                                                        className={styles.bodyCell}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className={styles.checkbox}
                                                            checked={selectedIds.includes(id)}
                                                            onChange={(e) =>
                                                                handleSelect(id, e.target.checked)
                                                            }
                                                        />
                                                    </td>
                                                );
                                            }

                                            if (col.key === "title") {
                                                return (
                                                    <td
                                                        key={`${rowKey}-title`}
                                                        onClick={() => onTitleClick?.(question)}
                                                        className={`${styles.bodyCell} ${onTitleClick ? styles.titleCell : ""}`}
                                                    >
                                                        {col.render ? col.render(question) : null}
                                                    </td>
                                                );
                                            }

                                            return (
                                                <td
                                                    key={`${rowKey}-${col.key}`}
                                                    className={styles.bodyCell}
                                                >
                                                    {col.render ? col.render(question) : null}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className={styles.footer}>
                <div>
                    {from}-{to} of {total}
                </div>

                <div className={styles.pagerControls}>
                    <label htmlFor="rowsPerPage">Rows:</label>
                    <select
                        id="rowsPerPage"
                        className={styles.select}
                        value={rowsPerPage}
                        onChange={handleRowsPerPageChange}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                    </select>

                    <button
                        type="button"
                        className={styles.button}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                    >
                        Previous
                    </button>

                    <span>
                        {page + 1} / {totalPages}
                    </span>

                    <button
                        type="button"
                        className={styles.button}
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
