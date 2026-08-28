import { useEffect, useState } from "react";

import { type UserDetailRead, UserLookupApi } from "../../../services";
import { useAuth } from "../../Auth";

export function useUserLookup(queryStr: string) {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserDetailRead[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const userLookUp = async () => {
      if (!user) {
        setUsers([]);
        setLoading(false);
        setError("Must be signed in to use Search");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fetched = await UserLookupApi.lookupDevelopers(
          await user.getIdToken(),
          { query: queryStr },
        );
        if (!cancelled) {
          setUsers(fetched);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to search collections.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    userLookUp();
    return () => {
      cancelled = true;
    };
  }, [queryStr, user]);

  return { users, loading, error };
}
