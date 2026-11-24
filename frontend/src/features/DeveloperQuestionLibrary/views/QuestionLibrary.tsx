import { Bookmark } from "lucide-react";
import { useState } from "react";

import { QuestionLibraryTableLayout } from "../layout/QuestionLibraryTableLayout";
import { QuestionLibraryTabs } from "../layout/QuestionLibraryTabs";
import type { QuestionLibraryTableView } from "../types";
import { MyQuestionsView } from "./MyQuestionView";
import { SharedByMeView } from "./SharedByMeView";
import { SharedWithMeView } from "./SharedWithMeView";
import { BookmarkedQuestionsView } from "./BookmarkedQuestionsView";
function QuestionLibraryTableContent({
  activeView,
  showBookmarks,
}: {
  activeView: QuestionLibraryTableView;
  showBookmarks: boolean;
}) {
  if (showBookmarks) {
    return <BookmarkedQuestionsView />;
  }

  if (activeView === "sharedByMe") {
    return <SharedByMeView />;
  }

  if (activeView === "sharedWithMe") {
    return <SharedWithMeView />;
  }

  return <MyQuestionsView />;
}

export default function QuestionLibrary() {
  const [activeView, setActiveView] =
    useState<QuestionLibraryTableView>("myQuestions");
  const [showBookmarks, setShowBookmarks] = useState(false);

  return (
    <QuestionLibraryTableLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <QuestionLibraryTabs
          activeView={activeView}
          onChange={(view) => {
            setActiveView(view);
            setShowBookmarks(false);
          }}
        />
        <button
          type="button"
          aria-pressed={showBookmarks}
          onClick={() => setShowBookmarks((current) => !current)}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-md border border-border bg-surface-secondary px-4 text-sm font-semibold text-text transition hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:self-auto"
        >
          <Bookmark
            className="size-4"
            fill={showBookmarks ? "currentColor" : "none"}
            aria-hidden="true"
          />
          {showBookmarks ? "Browse questions" : "View bookmarks"}
        </button>
      </div>
      <QuestionLibraryTableContent
        activeView={activeView}
        showBookmarks={showBookmarks}
      />
    </QuestionLibraryTableLayout>
  );
}
