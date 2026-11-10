import { createContext, useContext } from "react";

export type QuestionBookmarksContextValue = {
  bookmarkedQuestionIds: Set<string>;
  loading: boolean;
  pendingQuestionIds: Set<string>;
  // eslint-disable-next-line no-unused-vars
  toggleBookmark: (questionId: string) => Promise<void>;
};

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
