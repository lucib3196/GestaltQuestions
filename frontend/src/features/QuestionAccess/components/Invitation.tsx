import { useMemo, useState } from "react";

import {
  type ShareableAccessLevel,
  useListSharedByMe,
  useShareQuestionBatch,
} from "../../../services/Access/QuestionAccess";
import { UserLookUp } from "../../UserLookUp/UserLookUp";
import { useUserLookupStore } from "../../UserLookUp/instance/context";
import { ShareLevelPicker } from "./ShareLevelPicker";

type QuestionInvitationProps = {
  qid: string;
};

export function QuestionInvitation({ qid }: QuestionInvitationProps) {
  const [shareLevel, setShareLevel] = useState<ShareableAccessLevel>("view");
  const { access: detailRead, refresh } = useListSharedByMe(qid);
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

  async function handleShareSelected() {
    if (selectedUserIds.length === 0) return;

    const result = await shareQuestionsWithUsers({
      question_ids: [qid],
      target_user_ids: selectedUserIds,
      level: shareLevel,
    });

    if (result) {
      clearSelectedUsers();
      void refresh();
    }
  }

  return (
    <div className="mt-4 rounded-md border border-border bg-surface-secondary p-4">
      <div className="mb-4 grid gap-3">
        <ShareLevelPicker
          value={shareLevel}
          onChange={setShareLevel}
          disabled={sharingBatch}
          className="w-full"
        />

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
  );
}
