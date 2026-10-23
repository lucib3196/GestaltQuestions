import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../services/Auth";

/* eslint-disable no-unused-vars */
type AccessDetailsHookArgs<TAccessDetail> = {
  resourceName?: string;
  listAccessDetailsRequest: (
    token: string,
    resourceId: string,
  ) => Promise<TAccessDetail[]>;
};
/* eslint-enable no-unused-vars */

export function useAccessDetails<TAccessDetail>(
  resourceId: string,
  {
    resourceName = "resource",
    listAccessDetailsRequest,
  }: AccessDetailsHookArgs<TAccessDetail>,
) {
  const { user, loading: authLoading } = useAuth();
  const [access, setAccess] = useState<TAccessDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (authLoading) return [];

    if (!resourceId) {
      setAccess([]);
      setError(`Missing ${resourceName} id`);
      return [];
    }

    if (!user) {
      setAccess([]);
      setError(`Sign in to retrieve ${resourceName} access`);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const data = await listAccessDetailsRequest(token, resourceId);
      setAccess(data);
      return data;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to retrieve ${resourceName} access`,
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, [authLoading, listAccessDetailsRequest, resourceId, resourceName, user]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (authLoading) return;

      if (!resourceId) {
        if (!cancelled) {
          setAccess([]);
          setError(`Missing ${resourceName} id`);
          setLoading(false);
        }
        return;
      }

      if (!user) {
        if (!cancelled) {
          setAccess([]);
          setError(`Sign in to retrieve ${resourceName} access`);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = await user.getIdToken();
        const data = await listAccessDetailsRequest(token, resourceId);
        if (!cancelled) setAccess(data);
      } catch (err) {
        if (!cancelled) {
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
  }, [authLoading, listAccessDetailsRequest, resourceId, resourceName, user]);

  return { access, loading: authLoading || loading, error, refresh };
}
