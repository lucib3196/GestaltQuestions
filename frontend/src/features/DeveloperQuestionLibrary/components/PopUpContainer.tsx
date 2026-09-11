import type React from "react";

type PopUpSize = "sm" | "md" | "lg";
type PopUpPosition = "bottom-left" | "bottom-right" | "top-left" | "top-right";

const sizeClassNames: Record<PopUpSize, string> = {
    sm: "w-48",
    md: "w-64",
    lg: "w-80",
};

const positionClassNames: Record<PopUpPosition, string> = {
    "bottom-left": "left-0 top-full mt-2",
    "bottom-right": "right-0 top-full mt-2",
    "top-left": "bottom-full left-0 mb-2",
    "top-right": "bottom-full right-0 mb-2",
};

type PopUpContainerProps = {
    children: React.ReactNode;
    size?: PopUpSize;
    position?: PopUpPosition;
};

export function PopUpContainer({
    children,
    size = "md",
    position = "bottom-left",
}: PopUpContainerProps) {
    return (
        <div className={`absolute z-20 ${sizeClassNames[size]} ${positionClassNames[position]}`}>
            {children}
        </div>
    );
}
