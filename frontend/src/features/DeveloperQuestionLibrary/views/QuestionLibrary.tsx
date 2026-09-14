import { useState } from "react";
import { QuestionLibraryTableLayout } from "../layout/QuestionLibraryTableLayout";
import { QuestionLibraryTabs } from "../layout/QuestionLibraryTabs";
import type { QuestionLibraryTableView } from "../types";
import { MyQuestionsView } from "./MyQuestionView";
import { SharedWithMeView } from "./SharedWithMeView";
import { SharedByMeView } from "./SharedByMeView";
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

export default function QuestionLibrary() {
  const [activeView, setActiveView] =
    useState<QuestionLibraryTableView>("myQuestions");
  return (
    <QuestionLibraryTableLayout>
      <QuestionLibraryTabs activeView={activeView} onChange={setActiveView} />

      <QuestionLibraryTableContent activeView={activeView} />
    </QuestionLibraryTableLayout>
  );
}
