import { FaFilter } from "react-icons/fa";

import type { UserRole } from "../../Auth";
import { useQuestionTableContext } from "../../QuestionTables";
import { QUESTION_TABLE_TOOLBAR_ACTIONS } from "./constants";
import { type ToolbarActionId } from "./types";
import { toolbarButtonClass } from "./utils";
type ToolBarActionsProps = {
  roles?: UserRole[];

  onOpenPopup: (id: "columns" | "collections") => void;
};
export function ToolBarActions({
  roles = ["developer"],
  onOpenPopup,
}: ToolBarActionsProps) {
  const selectedQuestionsIds = useQuestionTableContext((s) => s.selectedIDs);
  const visibleActions = QUESTION_TABLE_TOOLBAR_ACTIONS.filter((action) =>
    action.allowedRoles.some((role) => roles.includes(role)),
  );

  const actionHandlers: Record<ToolbarActionId, () => void> = {
    copy: () => console.log("Copy", selectedQuestionsIds),
    download: () => console.log("Download", selectedQuestionsIds),
    delete: () => console.log("Delete", selectedQuestionsIds),
    columns: () => onOpenPopup("columns"),
    collections: () => onOpenPopup("collections"),
  };

  return (
    <div className="flex flex-wrap items-center gap-2 md:ml-auto">
      {visibleActions.map((action) => {
        const Icon = action.icon;
        const disabled =
          action.requiresSelection && selectedQuestionsIds.length === 0;

        return (
          <button
            key={action.id}
            type="button"
            disabled={disabled}
            onClick={actionHandlers[action.id]}
            className={toolbarButtonClass(action.variant)}
          >
            {Icon ? <Icon className="h-4 w-4" /> : null}
            {action.label}
          </button>
        );
      })}
    </div>
  );
}

export function ClearFilters({
  disabled,
  clearFilters,
}: {
  disabled: boolean;
  clearFilters: () => void;
}) {
  return (
    <div className="mt-4 flex items-center gap-3 border-t border-border pt-3">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-secondary text-text-muted">
        <FaFilter className="h-3.5 w-3.5" />
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={clearFilters}
        className="text-sm font-semibold text-accent transition hover:text-accent-strong disabled:cursor-not-allowed disabled:text-text-tertiary"
      >
        Clear all filters
      </button>
    </div>
  );
}
