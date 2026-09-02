import { useMemo } from "react";

import type { RowId } from "../../../components/Table";
import { useQuestionTableContext } from "./context";

export function useVisibleRowSelection<T>(
  rows: T[],
  getRowId: (_row: T) => RowId,
) {
  const selectedIds = useQuestionTableContext((state) => state.selectedIds);
  const setSelectedIds = useQuestionTableContext(
    (state) => state.setSelectedIds,
  );

  const visibleRowIds = useMemo(() => rows.map(getRowId), [rows, getRowId]);
  const visibleRowIdSet = useMemo(
    () => new Set(visibleRowIds),
    [visibleRowIds],
  );

  const allVisibleSelected =
    visibleRowIds.length > 0 &&
    visibleRowIds.every((id) => selectedIds.includes(id));
  const someVisibleSelected = visibleRowIds.some((id) =>
    selectedIds.includes(id),
  );

  const selectVisibleRows = () => {
    setSelectedIds(Array.from(new Set([...selectedIds, ...visibleRowIds])));
  };

  const deselectVisibleRows = () => {
    setSelectedIds(selectedIds.filter((id) => !visibleRowIdSet.has(id)));
  };

  const toggleVisibleRows = () => {
    if (allVisibleSelected) deselectVisibleRows();
    else selectVisibleRows();
  };

  return {
    selectedIds,
    visibleRowIds,
    allVisibleSelected,
    someVisibleSelected,
    selectVisibleRows,
    deselectVisibleRows,
    toggleVisibleRows,
  };
}
