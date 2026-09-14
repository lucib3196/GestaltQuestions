import { DeveloperQuestionLibraryShell } from "./layout/DeveloperQuestionLibraryShell";
import QuestionLibrary from "./views/QuestionLibrary";
import LibrarySideBar from "./layout/LibrarySidebar";
import DeveloperCollections from "../DeveloperCollections/DeveloperCollections";
import { useState } from "react";

import type { LibraryView } from "./types";

export default function DeveloperQuestionLibrary() {
  const [view, setView] = useState<LibraryView>("Questions");
  return (
    <DeveloperQuestionLibraryShell>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <LibrarySideBar activeView={view} onChange={(val) => setView(val)} />
        {view === "Questions" && <QuestionLibrary />}
        {view === "Collections" && <DeveloperCollections />}
      </div>
    </DeveloperQuestionLibraryShell>
  );
}
