import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import { Settings, X } from "lucide-react";
import { type Dispatch, useState } from "react";

import { AccessBadge } from "../../../components/Access";
import type { QuestionRead } from "../../../services/Questions";
import { QuestionMetadataEditorPanel } from "../../QuestionMetadata";
import { getStatusLabel } from "../../QuestionMetadata/utils";
import { UserLookupProvider } from "../../UserLookUp/instance/context";
import { ManageAccessPanel } from "../manage-access/ManageAccessPanel";
import { useQuestionEditorContext } from "../store/context";

type QuestionSettingsActionProps = {
  qid: string;
  metadata: QuestionRead | null;
  metadataLoading: boolean;
  onMetadataSaved: Dispatch<QuestionRead>;
};

const tabClassName =
  "rounded-md px-3 py-1.5 text-sm font-semibold text-text-muted focus-visible:outline focus-visible:outline-accent data-[selected]:bg-surface data-[selected]:text-text data-[selected]:shadow-sm";

export function QuestionSettingsAction({
  qid,
  metadata,
  metadataLoading,
  onMetadataSaved,
}: QuestionSettingsActionProps) {
  const [open, setOpen] = useState(false);
  const level = useQuestionEditorContext((state) => state.access?.access_level);
  const canEditMetadata = useQuestionEditorContext(
    (state) => state.capabilities.canEditMetadata,
  );
  const canManageAccess = useQuestionEditorContext(
    (state) => state.capabilities.canManageAccess,
  );

  function close() {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface-secondary px-2.5 py-2 text-xs font-semibold text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
      >
        <Settings className="size-3.5" aria-hidden="true" />
        Question settings
      </button>
      <Dialog open={open} onClose={close} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-bg/70" />
        <div className="fixed inset-0 overflow-y-auto p-4">
          <div className="flex min-h-full items-center justify-center">
            <DialogPanel className="w-full max-w-2xl rounded-lg border border-border bg-bg text-text shadow-soft">
              <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                <DialogTitle className="text-lg font-semibold">
                  Question settings
                </DialogTitle>
                <button
                  type="button"
                  aria-label="Close question settings"
                  onClick={close}
                  className="rounded-md p-2 text-text-muted hover:bg-surface-muted hover:text-text"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </header>

              <TabGroup>
                <div className="border-b border-border px-4 py-2">
                  <TabList
                    aria-label="Settings sections"
                    className="inline-flex gap-1 rounded-lg bg-surface-secondary p-1"
                  >
                    <Tab className={tabClassName}>General</Tab>
                    <Tab className={tabClassName}>Access</Tab>
                  </TabList>
                </div>
                <TabPanels>
                  <TabPanel className="p-4" unmount={false}>
                    {canEditMetadata ? (
                      <QuestionMetadataEditorPanel
                        qid={qid}
                        questionMetadata={metadata}
                        loading={metadataLoading}
                        onSaved={onMetadataSaved}
                      />
                    ) : (
                      <dl>
                        <dt className="text-sm font-semibold text-text-muted">
                          Status
                        </dt>
                        <dd className="mt-1 text-sm text-text">
                          {metadata
                            ? getStatusLabel(metadata.status)
                            : "Unavailable"}
                        </dd>
                      </dl>
                    )}
                  </TabPanel>
                  <TabPanel>
                    <div className="flex items-center gap-2 px-4 pt-4">
                      <h2 className="text-sm font-semibold text-text">
                        Your access
                      </h2>
                      <AccessBadge level={level} />
                    </div>
                    {canManageAccess ? (
                      <UserLookupProvider>
                        <ManageAccessPanel questionId={qid} />
                      </UserLookupProvider>
                    ) : (
                      <p className="px-4 pb-4 pt-2 text-sm text-text-muted">
                        The question owner manages sharing.
                      </p>
                    )}
                  </TabPanel>
                </TabPanels>
              </TabGroup>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
