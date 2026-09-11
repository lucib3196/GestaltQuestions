import type { ShareableAccessLevel } from "../../services/Access";
import type { ShareQuestionsWithUsersPayload } from "../../services/Access/QuestionAccess";
import type { SelectedUsersById } from "../../stores/userLookUp";
export function prepareBatch(
  questionIds: string[],
  users: SelectedUsersById,
  level: ShareableAccessLevel,
): ShareQuestionsWithUsersPayload | null {
  if (!questionIds.length) return null;
  if (!users) return null;
  const userIds = Object.values(users).map((v) => v.id);
  return { question_ids: questionIds, target_user_ids: userIds, level };
}
