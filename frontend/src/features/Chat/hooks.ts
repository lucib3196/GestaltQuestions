import { useEffect } from "react";

import { ChatApi } from "../../services/Chat";
import { useAuth } from "../Auth";
import { useThreadStore } from "./instance/store";

export function useLoadUserThreads() {
  const { user } = useAuth();
  const setThreads = useThreadStore((s) => s.setThreads);
  const threadId = useThreadStore((s) => s.threadId);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user) return;

      try {
        const authToken = await user.getIdToken();
        const threads = await ChatApi.getUserThreads(authToken);

        if (!cancelled) {
          setThreads(threads);
        }
      } catch (error) {
        if (!cancelled) {
          console.log("Error", error);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [user, setThreads, threadId]); // Refresh when setthreads, or thread id is updated
}
