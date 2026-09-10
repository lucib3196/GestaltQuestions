import { FiTarget } from "react-icons/fi";

import { AccessBadge } from "../../../components/Access";
import { ManageAccessAction } from "../manage-access/ManageAccessModal";
import { useQuestionWorkspaceContext } from "../store/context";

type WorkspaceHeaderProps = {
  title?: string;
};

function WorkspaceTitle({ title = "Question Workspace" }: { title?: string }) {
  return <h1 className="text-lg font-semibold text-text">{title}</h1>;
}

function LevelHeaderAccess() {
  const level = useQuestionWorkspaceContext((s) => s.access?.access_level);
  const capabilities = useQuestionWorkspaceContext((s) => s.capabilities);
  const question = useQuestionWorkspaceContext((s) => s.questionId);
  if (!question) {
    return null;
  }
  const canManageAccess = capabilities.canManageAccess;

  return (
    <div className="flex shrink-0 items-center gap-2">
      <AccessBadge level={level} />
      {canManageAccess && <ManageAccessAction questionId={question} />}
    </div>
  );
}

export function WorkspaceHeader({
  title = "Question Workspace",
}: WorkspaceHeaderProps) {
  return (
    <header className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 text-accent">
          <FiTarget className="h-5 w-5" />
        </span>

        <div className="flex min-w-0 items-center gap-3">
          <WorkspaceTitle title={title} />
          <span className="h-6 w-px bg-border" />
        </div>
      </div>

      <LevelHeaderAccess />
    </header>
  );
}
