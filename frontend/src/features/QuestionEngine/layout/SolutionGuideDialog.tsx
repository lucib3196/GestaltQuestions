import "./SolutionGuideDialog.css";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

import QuestionHTMLToReact from "../render/QuestionHtmlToReact";

type SolutionGuideDialogProps = {
  open: boolean;
  onClose: () => void;
  html: string;
};

export function SolutionGuideDialog({
  open,
  onClose,
  html,
}: SolutionGuideDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/60" />
      <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-6">
        <DialogPanel className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border-strong bg-bg text-text shadow-soft sm:max-h-[calc(100dvh-3rem)]">
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-6">
            <DialogTitle className="text-lg font-semibold text-text">
              Solution Guide
            </DialogTitle>
            <button
              type="button"
              data-autofocus
              onClick={onClose}
              className="rounded-md border border-border bg-surface-secondary px-3 py-1.5 text-sm font-semibold text-text hover:bg-surface-muted focus-visible:outline focus-visible:outline-accent"
            >
              Close
            </button>
          </header>
          <div className="question-solution-guide min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain px-4 py-5 sm:px-6">
            <QuestionHTMLToReact html={html} />
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
