import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useRef, useState } from "react";
import { toast } from "react-toastify";

import { CollectionPicker } from "./CollectionPicker";
import { useAssignQuestionToCollections } from "./useAssignQuestionToCollections";

type AddQuestionToCollectionsActionProps = {
  qid: string;
  onAssignmentSettled?: () => void;
};

export function AddQuestionToCollectionsAction({
  qid,
  onAssignmentSettled,
}: AddQuestionToCollectionsActionProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState(
    () => new Set<string>(),
  );
  const [hasFailures, setHasFailures] = useState(false);
  const requestInFlight = useRef(false);
  const assignQuestionToCollections = useAssignQuestionToCollections();

  function close() {
    if (requestInFlight.current) return;
    setOpen(false);
    setSelectedCollectionIds(new Set());
    setHasFailures(false);
  }

  function toggleCollection(collectionId: string) {
    setHasFailures(false);
    setSelectedCollectionIds((current) => {
      const next = new Set(current);
      if (next.has(collectionId)) next.delete(collectionId);
      else next.add(collectionId);
      return next;
    });
  }

  async function addToCollections() {
    if (requestInFlight.current || selectedCollectionIds.size === 0) return;
    requestInFlight.current = true;
    setBusy(true);
    let failedCollectionIds: string[];
    try {
      failedCollectionIds = await assignQuestionToCollections(qid, [
        ...selectedCollectionIds,
      ]);
    } finally {
      requestInFlight.current = false;
      setBusy(false);
      onAssignmentSettled?.();
    }

    if (failedCollectionIds.length) {
      setSelectedCollectionIds(new Set(failedCollectionIds));
      setHasFailures(true);
      return;
    }

    toast.success("Question added to collections.");
    close();
  }

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-semibold text-text hover:bg-surface-muted"
      >
        Add to collections
      </button>
      <Dialog open={open} onClose={close} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-bg/70" />
        <div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4">
          <DialogPanel className="max-h-[82vh] w-full max-w-md space-y-4 overflow-y-auto rounded-lg border border-border bg-surface-strong p-4 text-text shadow-soft">
            <DialogTitle className="text-lg font-semibold text-text">
              Add to collections
            </DialogTitle>
            <CollectionPicker
              selectedCollectionIds={selectedCollectionIds}
              onToggleCollection={toggleCollection}
              disabled={busy}
            />
            {hasFailures && (
              <p role="alert" className="text-sm text-warning">
                Some collections couldn’t be updated. Retry the selected
                collections.
              </p>
            )}
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="mr-auto text-sm text-text-muted">
                {selectedCollectionIds.size} selected
              </span>
              <button
                type="button"
                onClick={close}
                disabled={busy}
                className="rounded-md border border-border bg-button-secondary px-4 py-2 text-sm font-semibold text-text-muted hover:text-text disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy || selectedCollectionIds.size === 0}
                onClick={addToCollections}
                className="rounded-md bg-approval px-4 py-2 text-sm font-semibold text-approval-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? "Adding..." : hasFailures ? "Retry" : "Add"}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
