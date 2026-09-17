import { useCallback, useState } from "react";

import type { ShareAccessPayload } from "../../services/Access";
import { useAuth } from "../../services/Auth";

/* eslint-disable no-unused-vars */
type ShareAccessHookArgs<TAccess> = {
  resourceName?: string;
  shareRequest: (
    token: string,
    resourceId: string,
    payload: ShareAccessPayload,
  ) => Promise<TAccess>;
};
/* eslint-enable no-unused-vars */

export function useShareAccess<TAccess>({
  resourceName = "resource",
  shareRequest,
}: ShareAccessHookArgs<TAccess>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const shareAccess = useCallback(
    async (
      resourceId: string,
      payload: ShareAccessPayload,
    ): Promise<TAccess | null> => {
      if (!user) {
        setError(`You must be signed in to share ${resourceName}`);
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const token = await user.getIdToken();
        return await shareRequest(token, resourceId, payload);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : `Failed to share ${resourceName}`,
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [resourceName, shareRequest, user],
  );

  return { shareAccess, loading, error };
}
