import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../../Auth";
import QuestionAccessApi from "../api";
import type { QuestionAccessDetailRead } from "../types";

export function useListSharedByMe(qid: string) {
  const { user, loading: authLoading } = useAuth();
  const [access, setAccess] = useState<QuestionAccessDetailRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (authLoading) {
      return [];
    }

    if (!qid) {
      setAccess([]);
      setError("Missing question id");
      setLoading(false);
      return [];
    }

    if (!user) {
      setAccess([]);
      setError("Must be signed in to retrieve access");
      setLoading(false);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const data = await QuestionAccessApi.listAccessDetails(
        await user.getIdToken(),
        qid,
      );

      setAccess(data);
      return data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to retrieve access",
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, [authLoading, qid, user]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (authLoading) {
        return;
      }

      if (!qid) {
        if (!cancelled) {
          setAccess([]);
          setError("Missing question id");
          setLoading(false);
        }
        return;
      }

      if (!user) {
        if (!cancelled) {
          setAccess([]);
          setError("Must be signed in to retrieve access");
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await QuestionAccessApi.listAccessDetails(
          await user.getIdToken(),
          qid,
        );

        if (!cancelled) {
          setAccess(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to retrieve access",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [authLoading, qid, user]);

  return { access, loading: authLoading || loading, error, refresh };
}
