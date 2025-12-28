import QuestionLibraryHeader from "./Header";
import { QuestionTable } from "../QuestionTable";
export default function AllQuestions() {
  return (
    <>
      <QuestionLibraryHeader title={"All Questions"} />
      <QuestionTable />
    </>
  );
}
