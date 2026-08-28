import clsx from "clsx";
import { useMemo } from "react";
import {
  FiCheckSquare,
  FiFileText,
  FiGrid,
  FiImage,
  FiSearch,
} from "react-icons/fi";

import type { ValidComponents } from "../../QuestionEngine";
import { PLAYGROUND_COMPONENTS } from "../componentPlaygroundRegistry";
import { useComponentPlaygroundStore } from "../componentPlaygroundStore";

const categoryIcons: Record<string, typeof FiGrid> = {
  Panels: FiGrid,
  "Numeric Inputs": FiFileText,
  "Choice Inputs": FiCheckSquare,
  Solution: FiFileText,
  Media: FiImage,
};

function getComponentIcon(category: string) {
  return categoryIcons[category] ?? FiGrid;
}

export default function ComponentList() {
  const selectedTag = useComponentPlaygroundStore((state) => state.selectedTag);
  const searchQuery = useComponentPlaygroundStore((state) => state.searchQuery);
  const setSearchQuery = useComponentPlaygroundStore(
    (state) => state.setSearchQuery,
  );
  const selectComponent = useComponentPlaygroundStore(
    (state) => state.selectComponent,
  );

  const groupedComponents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filtered = PLAYGROUND_COMPONENTS.filter((component) => {
      if (!normalizedQuery) return true;

      return [
        component.componentName,
        component.tag,
        component.category,
        component.summary,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });

    return filtered.reduce<Record<string, typeof PLAYGROUND_COMPONENTS>>(
      (groups, component) => {
        groups[component.category] = groups[component.category] ?? [];
        groups[component.category].push(component);
        return groups;
      },
      {},
    );
  }, [searchQuery]);

  return (
    <aside className="flex h-full flex-col border-r border-border bg-surface">
      <div className="border-b border-border p-3">
        <label className="relative block">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-soft" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search components"
            className="w-full rounded-md border border-border bg-surface-strong py-2 pl-9 pr-3 text-sm text-text placeholder:text-text-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-auto py-3">
        {Object.entries(groupedComponents).map(([category, components]) => {
          const Icon = getComponentIcon(category);

          return (
            <div key={category} className="mb-4">
              <div className="mb-2 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase text-text-soft">
                <Icon className="size-3.5 text-accent" />
                {category}
              </div>
              <div className="space-y-1 px-2">
                {components.map((component) => {
                  const isSelected = component.tag === selectedTag;

                  return (
                    <button
                      key={component.tag}
                      type="button"
                      onClick={() =>
                        selectComponent(component.tag as ValidComponents)
                      }
                      className={clsx(
                        "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                        isSelected
                          ? "border border-accent/40 bg-accent/15 text-text"
                          : "border border-transparent text-text-muted hover:border-border hover:bg-surface-muted hover:text-text",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">
                          {component.componentName}
                        </span>
                        <span className="block truncate font-mono text-[11px] text-text-soft">
                          {component.tag}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {!Object.keys(groupedComponents).length && (
          <div className="px-4 py-6 text-sm text-text-muted">
            No components match that search.
          </div>
        )}
      </div>
    </aside>
  );
}
