import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { AnchoredPopover } from "../../../components/AnchoredPopover";
import { useRemoveQuestionsFromCollection } from "../../../hooks/collections";
import {
  useCopyQuestion,
  useDownloadQuestions,
} from "../../../hooks/developerQuestions";
import { buildQuestionLibraryToolbarActions } from "../../DeveloperQuestionLibrary/toolbar/constants";
import { QuestionTableToolbar } from "../../QuestionTables/toolbar/QuestionTableToolbar";
import { ColumnVisibilityPanel, useTableBaseContext } from "../../TableBase";
import type { TableStore } from "../../TableBase/state";
import type { CollectionQuestionSchema } from "./collectionQuestionTableConfig";

type CollectionQuestionActionId =
  | "copy"
  | "download"
  | "removeFromCollection"
  | "tableFilters"
  | "clearFilters";

export function CollectionQuestionsToolbar({
  collectionId,
  canRemove,
  onCollectionChanged,
}: {
  collectionId: string;
  canRemove: boolean;
  onCollectionChanged: () => Promise<unknown>;
}) {
  const [openPopup, setOpenPopup] = useState<CollectionQuestionActionId | null>(
    null,
  );
  const {
    selectedIds,
    columnDefs,
    columnFilters,
    clearSelectedIds,
    clearColumnFilters,
    refreshRows,
  } = useTableBaseContext(
    useShallow((state: TableStore<CollectionQuestionSchema>) => ({
      selectedIds: state.selectedIds,
      columnDefs: state.columnDefs,
      columnFilters: state.columnFilters,
      clearSelectedIds: state.clearSelectedIds,
      clearColumnFilters: state.clearColumnFilters,
      refreshRows: state.refreshRows,
    })),
  );
  const { removeQuestionsFromCollection, loading } =
    useRemoveQuestionsFromCollection();
  const { copyQuestion, loading: copying } = useCopyQuestion();
  const { downLoadQuestions, loading: downloading } = useDownloadQuestions();
  const actions =
    buildQuestionLibraryToolbarActions<CollectionQuestionActionId>(
      [
        "copy",
        "download",
        "removeFromCollection",
        "tableFilters",
        "clearFilters",
      ],
      {
        copy: { placement: "primary" },
        download: { placement: "primary" },
        removeFromCollection: { visible: canRemove, placement: "primary" },
        tableFilters: { label: "Columns", placement: "primary" },
        clearFilters: { placement: "primary" },
      },
    );

  async function copySelected() {
    if (copying || !selectedIds.length) return;

    const results = await copyQuestion(selectedIds);
    if (results?.every((result) => result.status === "fulfilled")) {
      clearSelectedIds();
    }
  }

  async function downloadSelected() {
    if (downloading || !selectedIds.length) return;

    const results = await downLoadQuestions(selectedIds);
    if (results?.every((result) => result.status === "fulfilled")) {
      clearSelectedIds();
    }
  }

  async function removeSelected() {
    if (!canRemove || loading || !selectedIds.length) return;
    let succeeded = false;
    await removeQuestionsFromCollection(collectionId, selectedIds, {
      onSuccess: () => {
        succeeded = true;
      },
    });
    if (!succeeded) return;
    clearSelectedIds();
    refreshRows();
    await onCollectionChanged();
  }

  return (
    <QuestionTableToolbar<CollectionQuestionActionId>
      actions={actions}
      actionHandlers={{
        copy: copySelected,
        download: downloadSelected,
        removeFromCollection: removeSelected,
        tableFilters: () =>
          setOpenPopup((current) =>
            current === "tableFilters" ? null : "tableFilters",
          ),
        clearFilters: clearColumnFilters,
      }}
      openPopover={openPopup}
      onClosePopover={() => setOpenPopup(null)}
      isActionDisabled={(action) => {
        if (action.id === "copy") return copying || !selectedIds.length;
        if (action.id === "download") return downloading || !selectedIds.length;
        if (action.id === "removeFromCollection")
          return !canRemove || loading || !selectedIds.length;
        if (action.id === "clearFilters")
          return Object.keys(columnFilters).length === 0;
        return false;
      }}
      renderActionPopover={(action) =>
        action.id === "tableFilters" && openPopup === "tableFilters" ? (
          <AnchoredPopover>
            <ColumnVisibilityPanel columns={columnDefs} />
          </AnchoredPopover>
        ) : null
      }
    />
  );
}
