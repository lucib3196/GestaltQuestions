import { createContext, useContext } from "react";

export type QuestionBookmarksContextValue = {
  bookmarkedQuestionIds: Set<string>;
  loading: boolean;
  pendingQuestionIds: Set<string>;
  // eslint-disable-next-line no-unused-vars
  toggleBookmark: (questionId: string) => Promise<void>;
};

export function getQuestionBookmarkActionLabel(
  questionIds: string[],
  bookmarkedQuestionIds: Set<string>,
) {
  return questionIds.length > 0 &&
    questionIds.every((id) => bookmarkedQuestionIds.has(id))
    ? "Remove bookmark"
    : "Bookmark";
}

export async function toggleSelectedQuestionBookmarks(
  questionIds: string[],
  bookmarkedQuestionIds: Set<string>,
  toggleBookmark: QuestionBookmarksContextValue["toggleBookmark"],
) {
  const shouldRemoveBookmark =
    questionIds.length > 0 &&
    questionIds.every((id) => bookmarkedQuestionIds.has(id));
  await Promise.all(
    questionIds
      .filter((id) => bookmarkedQuestionIds.has(id) === shouldRemoveBookmark)
      .map((questionId) => toggleBookmark(questionId)),
  );
}

export const QuestionBookmarksContext =
  createContext<QuestionBookmarksContextValue | null>(null);

export function useQuestionBookmarks() {
  const context = useContext(QuestionBookmarksContext);
  if (!context) {
    throw new Error(
      "useQuestionBookmarks must be used inside QuestionBookmarksProvider",
    );
  }
  return context;
}
