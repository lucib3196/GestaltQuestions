import clsx from "clsx";
import { useMemo, useState } from "react";

import { AccessHeader, ShareLevelPicker } from "../../../components/Access";
import {
  type ShareableAccessLevel,
  useListSharedByMe,
  useRetrieveAccess,
  useShareQuestionBatch,
} from "../../../services/Access/QuestionAccess";
import { AccessDetailList } from "../../QuestionAccess/components/AccessDetailList";
import { UserLookupCombobox } from "../../UserLookUp/components";
import { useUserLookupStore } from "../../UserLookUp/instance/context";

type ManageAccessPanelProps = {
  questionId: string;
  onShared?: () => unknown;
};

type ShareButtonProps = {
  selectedCount: number;
  loading?: boolean;
  onClick: () => void;
  className?: string;
};

function ShareButton({
  selectedCount,
  loading = false,
  onClick,
  className,
}: ShareButtonProps) {
  return (
    <button
      type="button"
      disabled={loading || selectedCount === 0}
      onClick={onClick}
      className={clsx(
        "inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-accent px-5 text-sm font-semibold text-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      Share{selectedCount > 0 ? ` ${selectedCount}` : ""}
    </button>
  );
}

export function ManageAccessPanel({
  questionId,
  onShared,
}: ManageAccessPanelProps) {
  const [shareLevel, setShareLevel] = useState<ShareableAccessLevel>("view");
  const { access } = useRetrieveAccess(questionId);
  const {
    access: sharedAccess,
    loading: sharedAccessLoading,
    error: sharedAccessError,
    refresh: refreshSharedAccess,
  } = useListSharedByMe(questionId);
  const selectedUsersById = useUserLookupStore((s) => s.selectedUsersById);
  const clearSelectedUsers = useUserLookupStore((s) => s.clearSelectedUsers);
  const { shareQuestionsWithUsers, loading: sharingBatch } =
    useShareQuestionBatch();

  const excludedDeveloperIds = useMemo(
    () => sharedAccess.map((accessDetail) => accessDetail.developer_id),
    [sharedAccess],
  );

  const selectedUserIds = useMemo(
    () => Object.values(selectedUsersById).map((user) => user.id),
    [selectedUsersById],
  );

  async function handleShareSelected() {
    if (selectedUserIds.length === 0) return;

    const result = await shareQuestionsWithUsers({
      question_ids: [questionId],
      target_user_ids: selectedUserIds,
      level: shareLevel,
    });

    if (result) {
      void refreshSharedAccess();
      void onShared?.();
      clearSelectedUsers();
    }
  }

  if (!access) {
    return (
      <section className="w-full max-w-4xl rounded-md border border-border bg-surface p-5 text-text">
        <p className="text-sm text-text-muted">Loading access...</p>
      </section>
    );
  }

  return (
    <section className="w-full max-w-4xl p-5 text-text shadow-soft">
      <AccessHeader variant="default" />

      <div className="mb-5 overflow-visible rounded-md border border-border bg-surface-secondary p-3">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-text">Invite people</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Search for developers, choose a permission level, then share access.
          </p>
        </div>

        <div className="grid overflow-visible gap-3 lg:grid-cols-[minmax(0,1fr)_12rem_auto]">
          <UserLookupCombobox
            excluded={excludedDeveloperIds}
            id="question-access-user-select"
            placeholder="Search developers"
            ariaLabel="Search developers to invite"
            maxResults={5}
          />

          <ShareLevelPicker
            value={shareLevel}
            onChange={setShareLevel}
            className="w-full"
            dropdownClassName="left-auto right-0"
          />

          <ShareButton
            selectedCount={selectedUserIds.length}
            loading={sharingBatch}
            onClick={handleShareSelected}
          />
        </div>
      </div>

      <AccessDetailList
        qid={questionId}
        access={sharedAccess}
        loading={sharedAccessLoading}
        error={sharedAccessError}
        variant="compact"
        onAccessChanged={refreshSharedAccess}
      />
    </section>
  );
}
