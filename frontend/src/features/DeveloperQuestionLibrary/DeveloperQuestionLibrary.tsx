import { QuestionBookmarksProvider } from "../Published/QuestionBookmarks";
import { DeveloperQuestionLibraryShell } from "./layout/DeveloperQuestionLibraryShell";
import QuestionLibrary from "./views/QuestionLibrary";

export default function DeveloperQuestionLibrary() {
  return (
    <QuestionBookmarksProvider>
      <DeveloperQuestionLibraryShell>
        <QuestionLibrary />
      </DeveloperQuestionLibraryShell>
    </QuestionBookmarksProvider>
  );
}
