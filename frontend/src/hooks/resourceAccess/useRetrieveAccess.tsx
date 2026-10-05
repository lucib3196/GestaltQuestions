import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../services/Auth";

/* eslint-disable no-unused-vars */
type RetrieveAccessHookArgs<TAccess> = {
  resourceName?: string;
  retrieveRequest: (token: string, resourceId: string) => Promise<TAccess>;
};
/* eslint-enable no-unused-vars */

export function useRetrieveAccess<TAccess>(
  resourceId: string,
  {
    resourceName = "resource",
    retrieveRequest,
  }: RetrieveAccessHookArgs<TAccess>,
) {
  const { user, loading: authLoading } = useAuth();
  const [access, setAccess] = useState<TAccess | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (authLoading) return null;

    if (!resourceId) {
      setAccess(null);
      setError(`Missing ${resourceName} id`);
      return null;
    }

    if (!user) {
      setAccess(null);
      setError(`Sign in to retrieve ${resourceName} access`);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const data = await retrieveRequest(token, resourceId);
      setAccess(data);
      return data;
    } catch (err) {
      setAccess(null);
      setError(
        err instanceof Error
          ? err.message
          : `Failed to retrieve ${resourceName} access`,
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, [authLoading, resourceId, resourceName, retrieveRequest, user]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (authLoading) return;

      if (!resourceId) {
        if (!cancelled) {
          setAccess(null);
          setError(`Missing ${resourceName} id`);
          setLoading(false);
        }
        return;
      }

      if (!user) {
        if (!cancelled) {
          setAccess(null);
          setError(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = await user.getIdToken();
        const data = await retrieveRequest(token, resourceId);
        if (!cancelled) setAccess(data);
      } catch (err) {
        if (!cancelled) {
          setAccess(null);
          setError(
            err instanceof Error
              ? err.message
              : `Failed to retrieve ${resourceName} access`,
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [authLoading, resourceId, resourceName, retrieveRequest, user]);

  return { access, loading: authLoading || loading, error, refresh };
}
