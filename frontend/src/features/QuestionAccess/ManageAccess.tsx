import { useMemo, useState } from "react";

import {
  type ShareableAccessLevel,
  useListSharedByMe,
  useRetrieveAccess,
  useRevokeQuestionAccess,
  useShareQuestion,
  useShareQuestionBatch,
} from "../../services/Access/QuestionAccess";
import { useUserLookupStore } from "../UserLookUp/instance/context";
import { UserLookUp } from "../UserLookUp/UserLookUp";
import AccessBadge from "./components/accessBadge";
import { AccessDetail } from "./components/AccessDetail";

const qid = "be94cfef-2b76-4f6a-8b44-f3b958d2be45";
const shareLevels: ShareableAccessLevel[] = ["view", "edit", "full"];

export function ManageAccess() {
  const [isInviting, setIsInviting] = useState(false);
  const [shareLevel, setShareLevel] = useState<ShareableAccessLevel>("view");

  const { shareQuestion, loading: updatingAccess } = useShareQuestion();
  const { access } = useRetrieveAccess(qid);
  const {
    access: detailRead,
    loading: detailsLoading,
    error: detailsError,
    refresh,
  } = useListSharedByMe(qid);
  const { revokeQuestionAccess, loading: revokingAccess } =
    useRevokeQuestionAccess();
  const { shareQuestionsWithUsers, loading: sharingBatch } =
    useShareQuestionBatch();
  const selectedUsersById = useUserLookupStore((s) => s.selectedUsersById);
  const clearSelectedUsers = useUserLookupStore((s) => s.clearSelectedUsers);

  const selectedUsers = Object.values(selectedUsersById);
  const selectedUserIds = selectedUsers.map((user) => user.id);
  const excludedDeveloperIds = useMemo(
    () => detailRead.map((accessDetail) => accessDetail.developer_id),
    [detailRead],
  );
  const isBusy = updatingAccess || revokingAccess || sharingBatch;

  async function handleLevelChange(
    userId: string,
    level: ShareableAccessLevel,
  ) {
    const result = await shareQuestion(qid, {
      target_user_id: userId,
      level,
    });

    if (result) {
      void refresh();
    }
  }

  async function handleRevokeAccess(userId: string) {
    const result = await revokeQuestionAccess(qid, userId);

    if (result) {
      void refresh();
    }
  }

  async function handleShareSelected() {
    if (selectedUserIds.length === 0) return;

    const result = await shareQuestionsWithUsers({
      question_ids: [qid],
      target_user_ids: selectedUserIds,
      level: shareLevel,
    });

    if (result) {
      clearSelectedUsers();
      setIsInviting(false);
      void refresh();
    }
  }

  if (!access) {
    return (
      <section className="w-full max-w-3xl rounded-md border border-border bg-surface p-5 text-sm text-text-muted">
        Loading access...
      </section>
    );
  }

  return (
    <section className="w-full max-w-3xl rounded-md border border-border bg-surface p-5 text-text">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold">Manage Access</h1>
          <p className="mt-1 text-sm text-text-muted">
            Review who can access this question and adjust sharing permissions.
          </p>
        </div>
        <AccessBadge level={access.access_level} />
      </header>

      <div className="rounded-md border border-border bg-surface-secondary px-4">
        {detailsLoading ? (
          <p className="py-4 text-sm text-text-muted">
            Loading shared access...
          </p>
        ) : null}

        {detailsError ? (
          <p className="py-4 text-sm text-warning">{detailsError}</p>
        ) : null}

        {!detailsLoading && !detailsError && detailRead.length === 0 ? (
          <p className="py-4 text-sm text-text-muted">
            No one else has access yet.
          </p>
        ) : null}

        {detailRead.map((details) => (
          <AccessDetail
            key={details.id ?? details.developer_id}
            details={details}
            disabled={isBusy}
            onLevelChange={(level) => handleLevelChange(details.user_id, level)}
            onRevokeAccess={() => handleRevokeAccess(details.user_id)}
          />
        ))}
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={() => setIsInviting((current) => !current)}
          className="rounded-md border border-border bg-surface-secondary px-4 py-2 text-sm font-semibold text-text transition hover:border-border-strong hover:bg-surface-muted"
        >
          Invite people
        </button>

        {isInviting ? (
          <div className="mt-4 rounded-md border border-border bg-surface-secondary p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <label className="text-sm font-medium text-text">
                Access level
                <select
                  value={shareLevel}
                  onChange={(event) =>
                    setShareLevel(event.target.value as ShareableAccessLevel)
                  }
                  className="ml-3 h-9 rounded-md border border-border bg-surface px-3 text-sm text-text outline-none transition hover:border-border-strong focus:border-accent"
                >
                  {shareLevels.map((level) => (
                    <option key={level} value={level}>
                      {level[0].toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                disabled={sharingBatch || selectedUserIds.length === 0}
                onClick={handleShareSelected}
                className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Share {selectedUserIds.length || ""}
              </button>
            </div>

            <UserLookUp excluded={excludedDeveloperIds} variant="embedded" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
