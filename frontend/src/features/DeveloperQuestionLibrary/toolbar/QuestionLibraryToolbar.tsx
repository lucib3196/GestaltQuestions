import { type ReactNode, useEffect, useRef } from "react";

import { TableBaseSearch } from "../../TableBase";
import ToolBarActions from "../../Toolbar/ToolBar";
import type {
  ToolBarActionConfig,
  ToolBarActionHandlers,
} from "../../Toolbar/types";

type QuestionLibraryToolbarProps<TId extends string> = {
  actions: readonly ToolBarActionConfig<TId>[];
  actionHandlers: ToolBarActionHandlers<TId>;
  openPopover: TId | null;
  onClosePopover: () => void;
  isActionDisabled?: (action: ToolBarActionConfig<TId>) => boolean;
  renderActionPopover?: (action: ToolBarActionConfig<TId>) => ReactNode;
};

export function QuestionLibraryToolbar<TId extends string>({
  actions,
  actionHandlers,
  openPopover,
  onClosePopover,
  isActionDisabled,
  renderActionPopover,
}: QuestionLibraryToolbarProps<TId>) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        onClosePopover();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClosePopover, openPopover]);

  return (
    <div ref={containerRef} className="flex flex-col gap-2">
      <TableBaseSearch />
      <ToolBarActions
        actionHandlers={actionHandlers}
        actions={actions}
        isActionDisabled={isActionDisabled}
        renderActionPopover={renderActionPopover}
      />
    </div>
  );
}
