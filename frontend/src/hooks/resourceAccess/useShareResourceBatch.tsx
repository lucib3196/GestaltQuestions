import { useCallback, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import type { BatchPayload } from "../../services/Sharing/types";

/* eslint-disable no-unused-vars */
type ShareBatchHookResult<TKey extends string, TResult> = {
  share: (payload: BatchPayload<TKey>) => Promise<TResult | null>;
  loading: boolean;
  error: string | null;
  result: TResult | null;
};

export function useShareBatch<TKey extends string, TResult>({
  resourceKey,
  emptyResourceMessage = "Select atleast one Resource to share with",
  shareRequest,
}: {
  resourceKey: TKey;
  emptyResourceMessage?: string;
  shareRequest: (
    token: string,
    payload: BatchPayload<TKey>,
  ) => Promise<TResult>;
}): ShareBatchHookResult<TKey, TResult> {
  /* eslint-enable no-unused-vars */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TResult | null>(null);
  const { user } = useAuth();

  const share = useCallback(
    async (payload: BatchPayload<TKey>) => {
      if (!user) {
        setError("You must be signed in to share");
        return null;
      }

      if (payload[resourceKey].length === 0) {
        setError(emptyResourceMessage);
        return null;
      }
      if (payload.target_user_ids.length === 0) {
        setError("Select at least one person to share with");
        return null;
      }
      setLoading(true);
      setError(null);
      setResult(null);
      try {
        const token = await user.getIdToken();
        const response = await shareRequest(token, payload);
        setResult(response);
        return response;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to share");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [emptyResourceMessage, resourceKey, shareRequest, user],
  );

  return { share, loading, error, result };
}
