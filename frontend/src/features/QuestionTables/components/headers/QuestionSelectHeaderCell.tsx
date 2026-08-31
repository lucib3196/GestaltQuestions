import type { ElementRef } from "react";
import { useEffect, useRef } from "react";

import type { TableHeaderRenderContext } from "../../../../components/Table";

type QuestionSelectHeaderCellProps = Pick<
  TableHeaderRenderContext,
  | "allVisibleSelected"
  | "someVisibleSelected"
  | "toggleVisibleRows"
  | "visibleRowIds"
>;

export function QuestionSelectHeaderCell({
  allVisibleSelected,
  someVisibleSelected,
  toggleVisibleRows,
  visibleRowIds,
}: QuestionSelectHeaderCellProps) {
  const checkboxRef = useRef<ElementRef<"input">>(null);
  const disabled = visibleRowIds.length === 0;

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate =
        someVisibleSelected && !allVisibleSelected;
    }
  }, [allVisibleSelected, someVisibleSelected]);

  return (
    <button
      type="button"
      aria-pressed={allVisibleSelected}
      aria-label={
        allVisibleSelected ? "Deselect visible rows" : "Select visible rows"
      }
      disabled={disabled}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-secondary text-text-muted transition hover:border-accent hover:bg-surface-muted hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
      onClick={toggleVisibleRows}
    >
      <input
        ref={checkboxRef}
        type="checkbox"
        readOnly
        tabIndex={-1}
        checked={allVisibleSelected}
        className="h-4 w-4 accent-accent"
      />
    </button>
  );
}
