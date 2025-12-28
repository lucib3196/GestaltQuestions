import QuestionLibraryHeader from "./Header";
import { QuestionTable } from "../QuestionTable";
import { useRetrievedQuestions } from "../../hooks";
import { useMemo } from "react";

export default function AllQuestions() {
  const questionFilter = useMemo(
    () => ({}),
    []
  );

  useRetrievedQuestions({
    questionFilter: questionFilter,
    showAllQuestions: false,
  });
  return (
    <>
      <QuestionLibraryHeader title={"All Questions"} />
      <QuestionTable />
    </>
  );
}
