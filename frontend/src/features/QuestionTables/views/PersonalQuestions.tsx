import { personalQuestionsTableConfig } from "../config/questionTableConfigs";
import { TableBaseView } from "../../TableBase/base/TableBaseView";

export function PersonalQuestionTable() {
  return <TableBaseView config={personalQuestionsTableConfig} baseQuery={{}} />;
}
