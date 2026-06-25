import clsx from "clsx";
import type { ComponentType } from "react";

import { useSideBar } from "./SideBarContext";

export type SidebarMenuItemProps<T = string> = {
  item: T;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  className?: string;
  onSelect?: (item: T) => void;
};

export default function SidebarMenuItem<T = string>({
  item,
  label,
  icon: Icon,
  className,
  onSelect,
}: SidebarMenuItemProps<T>) {
  const { isOpen, selectedItem, setSelectedItem } = useSideBar<T>();
  const selected = Object.is(selectedItem, item);

  function handleSelect() {
    setSelectedItem(item);
    onSelect?.(item);
  }

  return (
    <button
      type="button"
      title={!isOpen ? label : undefined}
      onClick={handleSelect}
      className={clsx(
        "group relative mx-3 flex h-10 items-center rounded-md border text-left transition-colors",
        isOpen ? "gap-3 px-3" : "justify-center px-0",
        "focus:outline-none focus:ring-2 focus:ring-accent/60",
        selected
          ? "border-border-strong bg-surface-strong text-text shadow-soft"
          : "border-transparent bg-transparent text-text-muted hover:border-border hover:bg-surface-muted hover:text-text",
        className,
      )}
    >
      {selected && (
        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-accent" />
      )}

      {Icon && (
        <Icon
          className={clsx(
            "h-5 w-5 shrink-0 transition-colors",
            selected
              ? "text-accent"
              : "text-text-soft group-hover:text-text-muted",
          )}
        />
      )}

      {isOpen && <span className="truncate text-sm font-medium">{label}</span>}
    </button>
  );
}
