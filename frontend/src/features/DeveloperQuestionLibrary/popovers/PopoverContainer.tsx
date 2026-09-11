import type React from "react";

type PopoverSize = "sm" | "md" | "lg";
type PopoverPosition = "bottom-left" | "bottom-right" | "top-left" | "top-right";

const sizeClassNames: Record<PopoverSize, string> = {
  sm: "w-48",
  md: "w-64",
  lg: "w-80",
};

const positionClassNames: Record<PopoverPosition, string> = {
  "bottom-left": "left-0 top-full mt-2",
  "bottom-right": "right-0 top-full mt-2",
  "top-left": "bottom-full left-0 mb-2",
  "top-right": "bottom-full right-0 mb-2",
};

type PopoverContainerProps = {
  children: React.ReactNode;
  size?: PopoverSize;
  position?: PopoverPosition;
};

export function PopoverContainer({
  children,
  size = "md",
  position = "bottom-left",
}: PopoverContainerProps) {
  return (
    <div
      className={`absolute z-20 ${sizeClassNames[size]} ${positionClassNames[position]}`}
    >
      {children}
    </div>
  );
}
