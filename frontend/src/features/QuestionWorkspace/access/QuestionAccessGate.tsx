import { useEffect } from "react";
import type { ReactNode } from "react";

import { useRetrieveAccess } from "../../../services/Access/QuestionAccess";
import { useWorkspaceContext } from "../instance/context";
import type { WorkspaceStore } from "../instance/types";
import { buildQuestionCapabilities } from "./capabilities";
import type { QuestionWorkspaceAccessSchema } from "./types";

type QuestionAccessGateProps = {
  qid: string;
  children: ReactNode;
};

export function QuestionAccessGate({ qid, children }: QuestionAccessGateProps) {
  const { access, loading, error } = useRetrieveAccess(qid);
  const setAccess = useWorkspaceContext<
    QuestionWorkspaceAccessSchema,
    WorkspaceStore<QuestionWorkspaceAccessSchema>["setAccess"]
  >((s) => s.setAccess);
  const setCapabilities = useWorkspaceContext<
    QuestionWorkspaceAccessSchema,
    WorkspaceStore<QuestionWorkspaceAccessSchema>["setCapabilities"]
  >((s) => s.setCapabilities);
  const clearAccess = useWorkspaceContext<
    QuestionWorkspaceAccessSchema,
    WorkspaceStore<QuestionWorkspaceAccessSchema>["clearAccess"]
  >((s) => s.clearAccess);

  useEffect(() => {
    if (!access) {
      clearAccess();
      return;
    }

    setAccess(access);
    setCapabilities(buildQuestionCapabilities(access.access_level));

    return () => {
      clearAccess();
    };
  }, [access, clearAccess, setAccess, setCapabilities]);

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
