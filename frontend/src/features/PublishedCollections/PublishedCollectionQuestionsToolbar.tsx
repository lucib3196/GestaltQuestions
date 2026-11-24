import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import type { Dispatch } from "react";
import { FaFilter } from "react-icons/fa";

import { SearchBar } from "../../components/SearchBar";
import type { UserRole } from "../../services/Auth";
import {
  QUESTION_STATUS_OPTIONS,
  QUESTION_TYPE_OPTIONS,
} from "../../services/Questions";
import { publishedQuestionsToolbarActions } from "../Published/toolbar/config/publishedQuestionsToolbarConfig";
import ToolBarActions, { toolbarButtonClass } from "../Toolbar/ToolBar";
import type { ToolBarActionHandler } from "../Toolbar/types";

const bulkActions = publishedQuestionsToolbarActions.filter(
  (action) => action.id === "copy" || action.id === "download",
);

const sourceOptions = [
  { value: "ai", label: "AI" },
  { value: "manual", label: "Manual" },
];

export type PublishedCollectionFilters = Record<
  "topic" | "type" | "status" | "source",
  string
>;

type PublishedCollectionQuestionsToolbarProps = {
  query: string;
  onQueryChange: Dispatch<string>;
  filters: PublishedCollectionFilters;
  onFiltersChange: Dispatch<PublishedCollectionFilters>;
  onClearFilters: () => void;
  topics: string[];
  roles: UserRole[];
  selectedCount: number;
  busy: boolean;
  onCopy: ToolBarActionHandler;
  onDownload: ToolBarActionHandler;
};

export function PublishedCollectionQuestionsToolbar({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  onClearFilters,
  topics,
  roles,
  selectedCount,
  busy,
  onCopy,
  onDownload,
}: PublishedCollectionQuestionsToolbarProps) {
  const filterCount = Object.values(filters).filter(Boolean).length;
  const filterControls = [
    {
      field: "topic",
      label: "Topic",
      options: topics.map((topic) => ({ value: topic, label: topic })),
    },
    { field: "type", label: "Type", options: QUESTION_TYPE_OPTIONS },
    { field: "status", label: "Status", options: QUESTION_STATUS_OPTIONS },
    { field: "source", label: "Source", options: sourceOptions },
  ] as const;

  return (
    <Disclosure
      as="div"
      className="rounded-lg border border-border bg-surface p-3 sm:p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="block min-w-0 flex-1">
          <span className="sr-only">Search collection questions</span>
          <SearchBar
            value={query}
            setValue={onQueryChange}
            placeholder="Search by title, topic, or type"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <ToolBarActions
            actions={bulkActions}
            roles={roles}
            className="empty:hidden"
            actionHandlers={{ copy: onCopy, download: onDownload }}
            isActionDisabled={() => selectedCount === 0 || busy}
          />
          <DisclosureButton className={toolbarButtonClass()}>
            <FaFilter className="size-4 shrink-0" aria-hidden="true" />
            Filters{filterCount > 0 ? ` (${filterCount})` : ""}
          </DisclosureButton>
        </div>
      </div>

      <DisclosurePanel className="mt-3 border-t border-border pt-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {filterControls.map(({ field, label, options }) => (
            <label
              key={field}
              className="grid min-w-0 gap-1 text-xs font-semibold text-text-muted"
            >
              {label}
              <select
                value={filters[field]}
                onChange={(event) =>
                  onFiltersChange({ ...filters, [field]: event.target.value })
                }
                className="min-h-9 w-full rounded-md border border-border bg-surface-strong px-2.5 text-sm text-text focus-visible:outline-2 focus-visible:outline-accent"
              >
                <option value="">Any</option>
                {options.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <button
          type="button"
          className={`${toolbarButtonClass()} mt-3`}
          disabled={filterCount === 0}
          onClick={onClearFilters}
        >
          Clear filters
        </button>
      </DisclosurePanel>

      {selectedCount > 0 && (
        <p role="status" className="mt-2 text-sm text-text-muted">
          {selectedCount} selected
        </p>
      )}
    </Disclosure>
  );
}
