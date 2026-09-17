import { useCallback, useState } from "react";

import type {
  ResourceAccess,
  ShareableAccessLevel,
} from "../../services/Access";
import { useAuth } from "../../services/Auth";

type UpdateAccessInput = {
  resourceId: string;
  targetUserId: string;
  level: ShareableAccessLevel;
};

/* eslint-disable no-unused-vars */
type UpdateAccessHookResult<TAccess> = {
  updateAccess: (update: UpdateAccessInput) => Promise<TAccess | null>;
  loading: boolean;
  error: string | null;
};

type UpdateAccessHookArgs<TAccess> = {
  resourceName?: string;
  updateRequest: (
    token: string,
    resourceId: string,
    targetUserId: string,
    level: ShareableAccessLevel,
  ) => Promise<TAccess>;
};
/* eslint-enable no-unused-vars */

export function useUpdateAccess<TAccess = ResourceAccess<string>>({
  resourceName = "resource",
  updateRequest,
}: UpdateAccessHookArgs<TAccess>): UpdateAccessHookResult<TAccess> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const updateAccess = useCallback(
    async ({
      resourceId,
      targetUserId,
      level,
    }: UpdateAccessInput): Promise<TAccess | null> => {
      if (!user) {
        setError("You must be signed in to update access");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const token = await user.getIdToken();
        return await updateRequest(token, resourceId, targetUserId, level);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : `Failed to update ${resourceName} access`,
        );

        return null;
      } finally {
        setLoading(false);
      }
    },
    [resourceName, updateRequest, user],
  );

  return { updateAccess, loading, error };
}
