import { MathJax } from "better-react-mathjax";
import clsx from "clsx";
import React from "react";

export type PLHintVariant = "default" | "highlighted";

export interface PLHintProps {
  level: number | string;
  children?: React.ReactNode;
  variant?: PLHintVariant | string;
  className?: string;
}

const variantStyles: Record<PLHintVariant, string> = {
  default: "border-border bg-surface-secondary",
  highlighted: "border-accent bg-[var(--color-approval-muted)]",
};

export default function PLHint({
  level,
  children,
  variant = "default",
  className = "",
}: PLHintProps) {
  return (
    <MathJax>
      <div
        className={clsx(
          "flex w-full items-start gap-3 rounded-md border p-4 text-[15px] leading-7 shadow-sm transition-colors duration-[var(--duration-base)] ease-[var(--ease-base)]",
          variantStyles[variant as PLHintVariant],
          className,
        )}
      >
        <div className="flex h-7 min-w-7 flex-none items-center justify-center rounded-full border border-border-strong bg-surface-strong px-2 text-xs font-semibold text-accent shadow-sm">
          {level}
        </div>

        <div className="min-w-0 max-w-none text-left text-text">{children}</div>
      </div>
    </MathJax>
  );
}
