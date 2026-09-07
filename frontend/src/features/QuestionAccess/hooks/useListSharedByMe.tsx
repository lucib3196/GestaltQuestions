import { useState, useEffect } from "react";
import { useAuth } from "../../Auth";
import { QuestionAccessApi } from "../../../services";
import { type QuestionAccessDetailRead } from "../../../services/Access/types";

export function useListSharedByMe(qid: string) {
  const { user } = useAuth();
  const [access, setAccess] = useState<QuestionAccessDetailRead[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!user) {
        setAccess([]);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const data = await QuestionAccessApi.listAccessDetails(
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
  }, [qid, user]);

  return { access, loading, error };
}
