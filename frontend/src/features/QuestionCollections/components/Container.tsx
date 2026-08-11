import type React from "react";

type ContainerProps = {
  children?: React.ReactNode;
};

export default function Container({ children }: ContainerProps) {
  return (
    <aside className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft">
      {children}
    </aside>
  );
}
