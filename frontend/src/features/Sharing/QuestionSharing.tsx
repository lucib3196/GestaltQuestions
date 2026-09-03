import { useState } from "react";

import type {
  ShareableAccessLevel,
  ShareQuestionsWithUsersPayload,
} from "../../services";
import { ShareQuestionCard } from "./components";
import { useShareQuestionBatch } from "./hooks/useShareQuestionBatch";
import { useUserLookupStore } from "../UserLookUp/instance/context";
import { useTableBaseContext } from "../TableBase/state";
import type { SelectedUsersById } from "../UserLookUp/instance/store";

function prepareBatch(
  questionIds: string[],
  users: SelectedUsersById,
  level: ShareableAccessLevel,
): ShareQuestionsWithUsersPayload | null {
  if (!questionIds.length) return null;
  if (!users) return null;
  const userIds = Object.values(users).map((v) => v.id);
  return { question_ids: questionIds, target_user_ids: userIds, level };
}
export default function QuestionSharing() {
  const [accessLevel, setAccessLevel] = useState<ShareableAccessLevel>("view");
  const questionIds = useTableBaseContext((s) => s.selectedIds);
  const selectedUsers = useUserLookupStore((s) => s.selectedUsersById);
  const { shareQuestionsWithUsers } = useShareQuestionBatch();

  const handleShare = () => {
    if (!questionIds.length) return;
    const payload = prepareBatch(questionIds, selectedUsers, accessLevel);
    if (!payload) return;
    shareQuestionsWithUsers(payload);
  };

  return (
    <ShareQuestionCard
      accessLevel={accessLevel}
      onAccessLevelChange={setAccessLevel}
      onShare={handleShare}
    />
  );
}
