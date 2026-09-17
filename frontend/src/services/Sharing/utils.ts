import type { SelectedUsersById } from "../../stores/userLookUp";
import type { ShareableAccessLevel } from "../Access";
import type { BatchPayload } from "./types";

export function prepareBatch<TKey extends string>(
  resourceKey: TKey,
  resourceIds: string[],
  users: SelectedUsersById,
  level: ShareableAccessLevel,
): BatchPayload<TKey> | null {
  if (!resourceIds.length) return null;
  if (!users) return null;

  const userIds = Object.values(users).map((v) => v.id);

  return {
    [resourceKey]: resourceIds,
    target_user_ids: userIds,
    level,
  } as BatchPayload<TKey>;
}
