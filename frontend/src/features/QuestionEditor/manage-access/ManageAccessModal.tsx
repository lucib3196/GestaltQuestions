import { useState } from "react";
import { FiUsers } from "react-icons/fi";

import { Modal } from "../../../components/Modal";
import { UserLookupProvider } from "../../UserLookUp/instance/context";
import { ManageAccessPanel } from "../manage-access";

type ManageAccessActionProps = {
  questionId: string;
};

export function ManageAccessAction({ questionId }: ManageAccessActionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-button-secondary px-3 text-sm font-semibold text-text transition-colors hover:border-border-strong hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
      >
        <FiUsers className="h-4 w-4" aria-hidden="true" />
        Manage access
      </button>
      {isOpen && (
        <Modal
          variant="default"
          presentation="minimal"
          setShowModal={setIsOpen}
          className=""
          contentClassName="bg-bg p-0"
        >
          <UserLookupProvider>
            <ManageAccessPanel questionId={questionId} />
          </UserLookupProvider>
        </Modal>
      )}
    </div>
  );
}
