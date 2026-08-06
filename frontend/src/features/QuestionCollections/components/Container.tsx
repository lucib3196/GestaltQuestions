import type React from "react";

type ContainerProps = {
  children?: React.ReactNode;
};

export default function Container({ children }: ContainerProps) {
  return (
    <aside className="flex h-full min-h-128 w-full max-w-sm flex-col overflow-hidden rounded-md border border-border bg-surface shadow-soft">
      {children}
    </aside>
  );
}
