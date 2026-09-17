import { useCallback, useState } from "react";

import type { ResourceAccessRevokeResult } from "../../services/Access";
import { useAuth } from "../../services/Auth";

/* eslint-disable no-unused-vars */
type RevokeAccessHookArgs = {
  resourceName?: string;
  revokeRequest: (
    token: string,
    resourceId: string,
    targetUserId: string,
  ) => Promise<ResourceAccessRevokeResult>;
};
/* eslint-enable no-unused-vars */

export function useRevokeAccess({
  resourceName = "resource",
  revokeRequest,
}: RevokeAccessHookArgs) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResourceAccessRevokeResult | null>(null);
  const { user } = useAuth();

  const revokeAccess = useCallback(
    async (
      resourceId: string,
      targetUserId: string,
    ): Promise<ResourceAccessRevokeResult | null> => {
      if (!user) {
        setError(`You must be signed in to revoke ${resourceName} access`);
        return null;
      }

      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const token = await user.getIdToken();
        const revokeResult = await revokeRequest(
          token,
          resourceId,
          targetUserId,
        );

        setResult(revokeResult);
        return revokeResult;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : `Failed to revoke ${resourceName} access`,
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [resourceName, revokeRequest, user],
  );

  return { revokeAccess, loading, error, result };
}
