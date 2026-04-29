import { QuestionTable, TableToolBar } from ".";
import { Header } from "../../components/Header";
import { Divider } from "../../components/Divider";

export default function AllQuestions() {
  


  return (
    <>
      <Header title="All Questions" variant={"QuestionBuilder"} />
      <Divider />
      <TableToolBar />
      <Divider />
      <QuestionTable />
      <Divider />
    </>
  );
}
