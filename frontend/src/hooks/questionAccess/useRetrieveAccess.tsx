import { useEffect, useState } from "react";

import { useAuth } from "../../services/Auth";
import QuestionAccessApi from "../../services/Access/QuestionAccess/api";
import type { QuestionAccess } from "../../services/Access/QuestionAccess/types";

export function useRetrieveAccess(qid: string) {
  const { user, loading: authLoading } = useAuth();

  const [access, setAccess] = useState<QuestionAccess | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (authLoading) {
        return;
      }

      if (!user) {
        setAccess(null);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const data = await QuestionAccessApi.retrieveAccess(
          await user.getIdToken(),
          qid,
        );
        if (!cancelled) setAccess(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to retrieve access",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [authLoading, qid, user]);

  return { access, loading: authLoading || loading, error };
}
