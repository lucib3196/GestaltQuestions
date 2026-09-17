import { useState } from "react";

import { DeveloperQuestionLibraryShell } from "./layout/DeveloperQuestionLibraryShell";
import QuestionLibrarySidebar from "./layout/QuestionLibrarySidebar";
import { QuestionLibraryTableLayout } from "./layout/QuestionLibraryTableLayout";
import { QuestionLibraryTabs } from "./layout/QuestionLibraryTabs";
import type { QuestionLibraryTableView } from "./types";
import { MyQuestionsView } from "./views/MyQuestionView";
import { SharedByMeView } from "./views/SharedByMeView";
import { SharedWithMeView } from "./views/SharedWithMeView";

function QuestionLibraryTableContent({
  activeView,
}: {
  activeView: QuestionLibraryTableView;
}) {
  if (activeView === "sharedByMe") {
    return <SharedByMeView />;
  }

  if (activeView === "sharedWithMe") {
    return <SharedWithMeView />;
  }

  return <MyQuestionsView />;
}

export default function DeveloperQuestionLibrary() {
  const [activeView, setActiveView] =
    useState<QuestionLibraryTableView>("myQuestions");

  return (
    <DeveloperQuestionLibraryShell>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <QuestionLibrarySidebar />

        <QuestionLibraryTableLayout>
          <QuestionLibraryTabs
            activeView={activeView}
            onChange={setActiveView}
          />

          <QuestionLibraryTableContent activeView={activeView} />
        </QuestionLibraryTableLayout>
      </div>
    </DeveloperQuestionLibraryShell>
  );
}
