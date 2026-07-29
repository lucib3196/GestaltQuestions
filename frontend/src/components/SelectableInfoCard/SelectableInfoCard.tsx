import clsx from "clsx";
import type { IconType } from "react-icons";

type SelectableInfoCardProps = {
  title: string;
  description: string;
  icon?: IconType;
  iconClassName?: string;
  className?: string;
  isSelected?: boolean;
  onClick?: () => void;
};

export function SelectableInfoCard({
  title,
  description,
  icon: Icon,
  iconClassName,
  className: customClassName,
  isSelected = false,
  onClick,
}: SelectableInfoCardProps) {
  const className = clsx(
    "group flex h-24 flex-1 items-center gap-3 rounded-xl border p-4 text-left shadow-sm transition-all duration-base ease-base",
    onClick &&
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    isSelected
      ? "border-border-strong bg-surface-strong text-text shadow-soft"
      : "border-border bg-surface text-text hover:border-border-strong hover:bg-surface-muted",
    customClassName,
  );

  const content = (
    <>
      {Icon && (
        <span
          className={clsx(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border transition-colors",
            iconClassName,
          )}
        >
          <Icon className="text-2xl" />
        </span>
      )}
      <span className="flex min-w-0 flex-col gap-1">
        <span className="font-semibold leading-none text-text">{title}</span>
        <span className="text-sm leading-snug text-text-muted">
          {description}
        </span>
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={isSelected}
        className={className}
      >
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
