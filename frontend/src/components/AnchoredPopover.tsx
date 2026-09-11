import type React from "react";

type AnchoredPopoverSize = "sm" | "md" | "lg";
type AnchoredPopoverPosition =
  | "bottom-left"
  | "bottom-right"
  | "top-left"
  | "top-right";

const sizeClassNames: Record<AnchoredPopoverSize, string> = {
  sm: "w-48",
  md: "w-64",
  lg: "w-80",
};

const positionClassNames: Record<AnchoredPopoverPosition, string> = {
  "bottom-left": "left-0 top-full mt-2",
  "bottom-right": "right-0 top-full mt-2",
  "top-left": "bottom-full left-0 mb-2",
  "top-right": "bottom-full right-0 mb-2",
};

type AnchoredPopoverProps = {
  children: React.ReactNode;
  size?: AnchoredPopoverSize;
  position?: AnchoredPopoverPosition;
};

export function AnchoredPopover({
  children,
  size = "md",
  position = "bottom-left",
}: AnchoredPopoverProps) {
  return (
    <div
      className={`absolute z-20 ${sizeClassNames[size]} ${positionClassNames[position]}`}
    >
      {children}
    </div>
  );
}
