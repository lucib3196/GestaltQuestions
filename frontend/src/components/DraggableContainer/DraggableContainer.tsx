import clsx from "clsx";
import { GripVertical } from "lucide-react";
import React, {
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

type DraggableContainerProps = Omit<
  ComponentPropsWithoutRef<"div">,
  "onDragStart" | "onDragOver" | "onDragEnd"
> & {
  draggableId: string;
  dragHandleLabel?: string;
  children: ReactNode;
  contentClassName?: string;
  handleOffset?: number | string;
  handleClassName?: string;
  isDragging?: boolean;
  isDropTarget?: boolean;
  onDragStart: (id: string) => void;
  onDragOver: (id: string | null) => void;
  onDragEnd: () => void;
};

export function DraggableContainer({
  draggableId,
  dragHandleLabel,
  className,
  children,
  contentClassName,
  handleOffset,
  handleClassName,
  style,
  isDragging = false,
  isDropTarget = false,
  onDragStart,
  onDragOver,
  onDragEnd,
  ...divProps
}: DraggableContainerProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStartRef = React.useRef({
    mouseX: 0,
    mouseY: 0,
    originalX: 0,
    originalY: 0,
  });
  const handleOffsetValue =
    typeof handleOffset === "number" ? `${handleOffset}px` : handleOffset;

  function handlePointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    onDragStart(draggableId);
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      originalX: position.x,
      originalY: position.y,
    };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (e.buttons !== 1) return;

    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;

    setPosition({
      x: dragStartRef.current.originalX + dx,
      y: dragStartRef.current.originalY + dy,
    });

    const target = document
      .elementsFromPoint(e.clientX, e.clientY)
      .find((element) => {
        const draggable = element.closest<HTMLElement>(
          "[data-draggable-container-id]",
        );

        return (
          draggable && draggable.dataset.draggableContainerId !== draggableId
        );
      })
      ?.closest<HTMLElement>("[data-draggable-container-id]");

    onDragOver(target?.dataset.draggableContainerId ?? null);
  }

  function handlePointerUp() {
    onDragEnd();
    onDragOver(null);
    setPosition({
      x: dragStartRef.current.originalX,
      y: dragStartRef.current.originalY,
    });
  }

  return (
    <div
      {...divProps}
      data-draggable-container-id={draggableId}
      className={clsx(
        "relative",
        className,
        isDragging && "z-20 opacity-90 shadow-lg ring-1 ring-accent/30",
        isDropTarget &&
          "border-accent bg-accent/10 text-text shadow-sm ring-2 ring-accent/25",
      )}
      style={{
        ...style,
        "--draggable-handle-offset": handleOffsetValue,
        transform: `translate(${position.x}px, ${position.y}px)`,
      } as React.CSSProperties}
    >
      <button
        type="button"
        aria-label={dragHandleLabel ?? "Drag item"}
        className={clsx(
          "absolute left-[var(--draggable-handle-offset,0.5rem)] top-1/2 z-10 flex size-6 -translate-y-1/2 cursor-grab items-center justify-center rounded-md text-text-soft transition hover:bg-surface-strong hover:text-text active:cursor-grabbing",
          handleClassName,
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <GripVertical className="size-4" aria-hidden="true" />
      </button>

      <div className={clsx("min-w-0 pl-8", contentClassName)}>{children}</div>
    </div>
  );
}
