import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "../../../Auth";
import QuestionAccessApi from "../api";
import type { QuestionAccessDetailRead } from "../types";

export function useListSharedByMe(qid: string) {
  const { user } = useAuth();
  const [access, setAccess] = useState<QuestionAccessDetailRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!user) {
      if (mountedRef.current) {
        setAccess([]);
        setError("Must be signed in to retrieve access");
        setLoading(false);
      }
      return [];
    }

    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const data = await QuestionAccessApi.listAccessDetails(
        await user.getIdToken(),
        qid,
      );

      if (mountedRef.current) {
        setAccess(data);
      }
      return data;
    } catch (err) {
      if (mountedRef.current) {
        setError(
          err instanceof Error ? err.message : "Failed to retrieve access",
        );
      }
      return [];
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [qid, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { access, loading, error, refresh };
}
