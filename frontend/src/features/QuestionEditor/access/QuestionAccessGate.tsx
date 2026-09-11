import type { ReactNode } from "react";
import { useEffect } from "react";

import { useRetrieveAccess } from "../../../services/Access/QuestionAccess";
import {
  useQuestionEditorContext,
  useQuestionEditorStoreContext,
} from "../store/context";
import type { QuestionEditorStore } from "../store/types";
import { buildQuestionCapabilities } from "./capabilities";
import type { QuestionEditorAccessSchema } from "./types";
type QuestionAccessGateProps = {
  qid: string;
  children: ReactNode;
};

export function QuestionAccessGate({ qid, children }: QuestionAccessGateProps) {
  const { access, loading, error } = useRetrieveAccess(qid);
  const setAccess = useQuestionEditorStoreContext<
    QuestionEditorAccessSchema,
    QuestionEditorStore<QuestionEditorAccessSchema>["setAccess"]
  >((s) => s.setAccess);
  const setCapabilities = useQuestionEditorStoreContext<
    QuestionEditorAccessSchema,
    QuestionEditorStore<QuestionEditorAccessSchema>["setCapabilities"]
  >((s) => s.setCapabilities);
  const clearAccess = useQuestionEditorStoreContext<
    QuestionEditorAccessSchema,
    QuestionEditorStore<QuestionEditorAccessSchema>["clearAccess"]
  >((s) => s.clearAccess);
  const setQId = useQuestionEditorContext((s) => s.setQuestionId);

  useEffect(() => {
    if (!access) {
      clearAccess();
      return;
    }

    setAccess(access);
    setCapabilities(buildQuestionCapabilities(access.access_level));
    setQId(qid);

    return () => {
      clearAccess();
    };
  }, [access, clearAccess, setAccess, setCapabilities, qid]);

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4 text-sm text-text-muted">
        Loading question access...
      </div>
    );
  }

  if (error || !access) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4 text-sm text-text-muted">
        You do not have access to this question.
      </div>
    );
  }

  return children;
}
