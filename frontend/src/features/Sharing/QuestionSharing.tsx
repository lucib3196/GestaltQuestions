import { type ReactNode, useState } from "react";

import { ShareLevelPicker } from "../../components/Access";
import { useShareQuestionBatch } from "../../hooks/questionAccess";
import {
  type ShareableAccessLevel,
  type ShareQuestionBatchResult,
  type ShareQuestionsWithUsersPayload,
} from "../../services/Access/QuestionAccess";
import { UserLookupCombobox } from "../UserLookUp/components";
import {
  UserLookupProvider,
  useUserLookupStore,
} from "../UserLookUp/instance/context";
import { prepareBatch } from "./utils";

type QuestionSharingProps = {
  questionIds: string[];
  title?: string;
  shareButtonLabel?: string;
  closeButtonLabel?: string;
  questionPreview?: ReactNode;
  className?: string;
  showCloseButton?: boolean;
  closeOnShare?: boolean;
  onClose?: () => void;
  onShare?: (
    result: ShareQuestionBatchResult | null,
    payload: ShareQuestionsWithUsersPayload,
  ) => void;
};

function QuestionSharingForm({
  questionIds,
  title = "Share Question",
  shareButtonLabel = "Share",
  closeButtonLabel = "Close",
  questionPreview,
  className = "",
  showCloseButton,
  closeOnShare = false,
  onClose,
  onShare,
}: QuestionSharingProps) {
  const [accessLevel, setAccessLevel] = useState<ShareableAccessLevel>("view");
  const selectedUsers = useUserLookupStore((s) => s.selectedUsersById);
  const clearSelectedUsers = useUserLookupStore((s) => s.clearSelectedUsers);
  const { shareQuestionsWithUsers, loading } = useShareQuestionBatch();
  const shouldShowCloseButton = showCloseButton ?? Boolean(onClose);

  const handleShare = async () => {
    const payload = prepareBatch(questionIds, selectedUsers, accessLevel);
    if (!payload) return;

    const result = await shareQuestionsWithUsers(payload);
    onShare?.(result, payload);

    if (result) {
      clearSelectedUsers();

      if (closeOnShare) {
        onClose?.();
      }
    }
  };

  return (
    <section
      className={`w-full max-w-xl rounded-lg border border-border bg-surface p-5 text-text shadow-soft ${className}`}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{title}</h2>

        {shouldShowCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-button-secondary px-3 py-1.5 text-sm text-text-muted transition hover:border-border-strong hover:text-text"
          >
            {closeButtonLabel}
          </button>
        )}
      </div>

      {questionPreview}

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-muted">
            Add people
          </label>
          <UserLookupCombobox maxResults={3} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="question-share-access-level"
            className="text-sm font-medium text-text-muted"
          >
            Permissions
          </label>

          <ShareLevelPicker
            value={accessLevel}
            onChange={setAccessLevel}
            disabled={loading}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleShare}
          disabled={loading || !questionIds.length}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Sharing..." : shareButtonLabel}
        </button>
      </div>
    </section>
  );
}

export default function QuestionSharing(props: QuestionSharingProps) {
  return (
    <UserLookupProvider>
      <QuestionSharingForm {...props} />
    </UserLookupProvider>
  );
}
