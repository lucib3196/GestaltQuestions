import { FiCheck, FiMoreVertical, FiSettings, FiTarget } from "react-icons/fi";
import AccessBadge from "../../QuestionAccess/components/accessBadge";
import { ManageAccess } from "../../QuestionAccess/ManageAccess";
import { UserLookupProvider } from "../../UserLookUp/instance/context";
import { useQuestionWorkspaceContext } from "../store/context";
import type { WorkspaceLayoutMode } from "../store/types";

type WorkspaceHeaderProps = {
  title?: string;
  subtitle?: string;
  status?: string;
  layoutMode: WorkspaceLayoutMode;
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
    <div className="flex flex-row items-baseline gap-2">
      <AccessBadge level={level} />
      {canManageAccess && (
        <UserLookupProvider>
          <ManageAccess qid={question} />
        </UserLookupProvider>
      )}
    </div>
  );
}

export function WorkspaceHeader({
  title = "Question Workspace",
  status = "Draft",
  layoutMode,
}: WorkspaceHeaderProps) {
  const enabled = false;

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[rgba(57,91,255,0.18)] text-accent">
          <FiTarget className="h-5 w-5" />
        </span>

        <div className="flex min-w-0 items-center gap-3">
          <WorkspaceTitle title={title} />
          <span className="h-6 w-px bg-border" />
          <span className="rounded-md bg-[rgba(57,91,255,0.18)] px-2 py-1 text-xs font-semibold text-accent">
            {status}
          </span>
          <span className="rounded-md border border-border px-2 py-1 text-xs font-semibold uppercase text-text-muted">
            {layoutMode}
          </span>
        </div>
      </div>

      <LevelHeaderAccess />

      {enabled && (
        <div className="flex items-center gap-3 text-sm text-text-muted">
          <span className="inline-flex items-center gap-2">
            <FiCheck className="h-4 w-4" />
            Autosaved just now
          </span>

          <button
            type="button"
            aria-label="Workspace settings"
            className="rounded-md border border-border bg-surface-muted p-2 text-text-muted hover:border-border-strong hover:text-text"
          >
            <FiSettings className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="More workspace actions"
            className="rounded-md border border-border bg-surface-muted p-2 text-text-muted hover:border-border-strong hover:text-text"
          >
            <FiMoreVertical className="h-5 w-5" />
          </button>
        </div>
      )}
    </header>
  );
}
