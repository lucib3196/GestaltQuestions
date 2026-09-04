import type { ReactNode } from "react";

import type { ShareableAccessLevel } from "../../../services";
import ShareRecipientSearch from "./ShareRecipientSearch";

type ShareAccessOption = {
  label: string;
  value: ShareableAccessLevel;
};

const ACCESS_OPTIONS: ShareAccessOption[] = [
  { label: "Can view", value: "view" },
  { label: "Can edit", value: "edit" },
  { label: "Full access", value: "full" },
];

type ShareQuestionCardProps = {
  accessLevel: ShareableAccessLevel;
  onAccessLevelChange: (level: ShareableAccessLevel) => void;
  onShare?: () => void;
  onCancel?: () => void;
  questionPreview?: ReactNode;
};

export function ShareQuestionCard({
  accessLevel,
  onAccessLevelChange,
  onShare,
  onCancel,
  questionPreview,
}: ShareQuestionCardProps) {
  return (
    <section className="w-full max-w-xl rounded-lg border border-border bg-surface p-5 text-text shadow-soft">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Share Question</h2>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border bg-button-secondary px-3 py-1.5 text-sm text-text-muted transition hover:border-border-strong hover:text-text"
        >
          Cancel
        </button>
      </div>

      {questionPreview && (
        <div className="mb-5 min-h-28 rounded-md border border-border bg-surface-strong p-4">
          {questionPreview}
        </div>
      )}

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-muted">
            Add people
          </label>
          <ShareRecipientSearch />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="question-share-access-level"
            className="text-sm font-medium text-text-muted"
          >
            Permissions
          </label>

          <select
            id="question-share-access-level"
            value={accessLevel}
            onChange={(event) =>
              onAccessLevelChange(event.target.value as ShareableAccessLevel)
            }
            className="h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-text outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
          >
            {ACCESS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onShare}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition hover:bg-accent-strong"
        >
          Share
        </button>
      </div>
    </section>
  );
}
