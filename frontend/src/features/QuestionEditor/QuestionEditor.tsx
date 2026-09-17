import { useParams } from "react-router-dom";

import { QuestionAccessGate } from "./access/QuestionAccessGate";
import type { QuestionEditorAccessSchema } from "./access/types";
import { QuestionEditorShell } from "./layout/QuestionEditorShell";
import { QuestionEditorProvider } from "./store/context";

export default function QuestionEditor() {
  const { qid } = useParams<{ qid: string }>();

  if (!qid) return <div className="text-text-muted">Missing question id.</div>;

  return (
    <QuestionEditorProvider<QuestionEditorAccessSchema>>
      <QuestionAccessGate qid={qid}>
        <QuestionEditorShell qid={qid} />
      </QuestionAccessGate>
    </QuestionEditorProvider>
  );
}
