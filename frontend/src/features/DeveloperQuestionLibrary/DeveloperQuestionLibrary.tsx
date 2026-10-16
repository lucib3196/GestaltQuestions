import { DeveloperQuestionLibraryShell } from "./layout/DeveloperQuestionLibraryShell";
import QuestionLibrary from "./views/QuestionLibrary";

export default function DeveloperQuestionLibrary() {
  return (
    <DeveloperQuestionLibraryShell>
      <QuestionLibrary />
    </DeveloperQuestionLibraryShell>
  );
}
