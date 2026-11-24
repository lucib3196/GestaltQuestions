import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import { useAuth } from "../../services/Auth";
import QuestionTablesApi from "../../services/QuestionTables/api";
import { QuestionBookmarksContext } from "./questionBookmarksContext";

export function QuestionBookmarksProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const [bookmarkedQuestionIds, setBookmarkedQuestionIds] = useState<
    Set<string>
  >(() => new Set());
  const [pendingQuestionIds, setPendingQuestionIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchBookmarks() {
      if (!user) {
        setBookmarkedQuestionIds(new Set());
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const token = await user.getIdToken();
        const questionIds =
          await QuestionTablesApi.getBookmarkedQuestionIds(token);
        if (!cancelled) {
          setBookmarkedQuestionIds(new Set(questionIds));
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to load bookmarked questions.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchBookmarks();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggleBookmark = useCallback(
    async (questionId: string) => {
      if (!user || pendingQuestionIds.has(questionId)) return;

      setPendingQuestionIds((currentIds) =>
        new Set(currentIds).add(questionId),
      );
      try {
        const token = await user.getIdToken();
        const isBookmarked = bookmarkedQuestionIds.has(questionId);
        if (isBookmarked) {
          await QuestionTablesApi.removeQuestionBookmark(token, questionId);
          setBookmarkedQuestionIds((currentIds) => {
            const nextIds = new Set(currentIds);
            nextIds.delete(questionId);
            return nextIds;
          });
        } else {
          await QuestionTablesApi.addQuestionBookmark(token, questionId);
          setBookmarkedQuestionIds((currentIds) =>
            new Set(currentIds).add(questionId),
          );
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to update this question bookmark.",
        );
      } finally {
        setPendingQuestionIds((currentIds) => {
          const nextIds = new Set(currentIds);
          nextIds.delete(questionId);
          return nextIds;
        });
      }
    },
    [bookmarkedQuestionIds, pendingQuestionIds, user],
  );

  return (
    <QuestionBookmarksContext.Provider
      value={{
        bookmarkedQuestionIds,
        loading,
        pendingQuestionIds,
        toggleBookmark,
      }}
    >
      {children}
    </QuestionBookmarksContext.Provider>
  );
}
