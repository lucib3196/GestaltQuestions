import { useParams } from "react-router-dom";

import { QuestionBookmarksProvider } from "../Published/QuestionBookmarks";
import { QuestionAccessGate } from "./access/QuestionAccessGate";
import type { QuestionEditorAccessSchema } from "./access/types";
import { QuestionEditorShell } from "./layout/QuestionEditorShell";
import { QuestionEditorProvider } from "./store/context";

export default function QuestionEditorPage() {
  const { qid } = useParams<{ qid: string }>();

  if (!qid) return <div className="text-text-muted">Missing question id.</div>;

  return (
    <QuestionBookmarksProvider>
      <QuestionEditorProvider<QuestionEditorAccessSchema> key={qid}>
        <QuestionAccessGate qid={qid}>
          <QuestionEditorShell qid={qid} />
        </QuestionAccessGate>
      </QuestionEditorProvider>
    </QuestionBookmarksProvider>
  );
}
