import { QUESTION_LIBRARY_TABLE_OPTIONS } from "../constants";
import type { QuestionLibraryTableView } from "../types";

function tableOptionClassName(isActive: boolean) {
  return isActive
    ? "rounded-md border border-border-strong bg-surface-strong px-3 py-1.5 text-sm font-medium text-text"
    : "rounded-md border border-border bg-surface-secondary px-3 py-1.5 text-sm font-medium text-text-muted transition hover:border-border-strong hover:text-text";
}

type QuestionLibraryTabsProps = {
  activeView: QuestionLibraryTableView;
  onChange: (view: QuestionLibraryTableView) => void;
};

export function QuestionLibraryTabs({
  activeView,
  onChange,
}: QuestionLibraryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {QUESTION_LIBRARY_TABLE_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={tableOptionClassName(activeView === option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
