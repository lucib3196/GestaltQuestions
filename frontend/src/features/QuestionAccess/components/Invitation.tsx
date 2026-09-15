import clsx from "clsx";
import { useState } from "react";

import { ShareLevelPicker } from "../../../components/Access";
import { useShareQuestionBatch } from "../../../hooks/questionAccess";
import {
  type ShareableAccessLevel,
} from "../../../services/Access/QuestionAccess";
import { useUserLookupStore } from "../../UserLookUp/instance/context";
import {
  UserLookUp,
  type UserLookupVariant,
} from "../../UserLookUp/UserLookUp";

const invitationStyles = {
  panel: {
    section: "mt-4 rounded-md border border-border bg-surface-secondary p-4",
    controls: "mb-4 grid gap-3",
    pickerClassName: "w-full",
    button: "w-full",
    lookup: "embedded",
  },
  inline: {
    section: "mt-4 rounded-md border border-border bg-surface-secondary p-3",
    controls: "mb-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_auto]",
    pickerClassName: "w-full",
    button: "h-10 px-5",
    lookup: "compact",
  },
  compact: {
    section: "flex flex-col ",
    controls: "flex flex-row mb-3 gap-2",
    pickerClassName: "",
    button: "w-full",
    lookup: "compact",
  },
} as const satisfies Record<
  string,
  {
    section: string;
    controls: string;
    pickerClassName: string;
    button: string;
    lookup: UserLookupVariant;
  }
>;

export type QuestionInvitationVariant = keyof typeof invitationStyles;

type QuestionInvitationProps = {
  qid: string;
  excludedDeveloperIds?: string[];
  variant?: QuestionInvitationVariant;
  lookupVariant?: UserLookupVariant;
  onShared?: () => unknown;
};

export function QuestionInvitation({
  qid,
  excludedDeveloperIds = [],
  variant = "panel",
  lookupVariant,
  onShared,
}: QuestionInvitationProps) {
  const styles = invitationStyles[variant];
  const [shareLevel, setShareLevel] = useState<ShareableAccessLevel>("view");
  const { shareQuestionsWithUsers, loading: sharingBatch } =
    useShareQuestionBatch();
  const selectedUsersById = useUserLookupStore((s) => s.selectedUsersById);
  const clearSelectedUsers = useUserLookupStore((s) => s.clearSelectedUsers);

  const selectedUsers = Object.values(selectedUsersById);
  const selectedUserIds = selectedUsers.map((user) => user.id);

  async function handleShareSelected() {
    if (selectedUserIds.length === 0) return;

    const result = await shareQuestionsWithUsers({
      question_ids: [qid],
      target_user_ids: selectedUserIds,
      level: shareLevel,
    });

    if (result) {
      clearSelectedUsers();
      void onShared?.();
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.controls}>
        {variant === "inline" ? (
          <UserLookUp
            excluded={excludedDeveloperIds}
            variant={lookupVariant ?? styles.lookup}
          />
        ) : null}
        <ShareLevelPicker
          value={shareLevel}
          onChange={setShareLevel}
          disabled={sharingBatch}
          className={styles.pickerClassName}
        />

        <button
          type="button"
          disabled={sharingBatch || selectedUserIds.length === 0}
          onClick={handleShareSelected}
          className={clsx(
            "flex-1 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
            styles.button,
          )}
        >
          Share {selectedUserIds.length || ""}
        </button>
      </div>

      {variant !== "inline" ? (
        <UserLookUp
          excluded={excludedDeveloperIds}
          variant={lookupVariant ?? styles.lookup}
        />
      ) : null}
    </div>
  );
}
