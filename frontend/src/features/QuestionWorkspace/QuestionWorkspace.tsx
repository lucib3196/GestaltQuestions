import { useParams } from "react-router-dom";

import { QuestionAccessGate } from "./access/QuestionAccessGate";
import type { QuestionWorkspaceAccessSchema } from "./access/types";
import { WorkspaceShell } from "./layout/WorkspaceShell";
import { WorkspaceBaseProvider } from "./store/context";

export default function QuestionWorkspace() {
  const { qid } = useParams<{ qid: string }>();

  if (!qid) return <div className="text-text-muted">Missing question id.</div>;

  return (
    <WorkspaceBaseProvider<QuestionWorkspaceAccessSchema>>
      <QuestionAccessGate qid={qid}>
        <WorkspaceShell qid={qid} />
      </QuestionAccessGate>
    </WorkspaceBaseProvider>
  );
}
