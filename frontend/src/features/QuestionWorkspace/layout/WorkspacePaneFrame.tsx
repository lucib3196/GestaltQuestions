import type { ReactNode } from "react";

type WorkspacePaneFrameProps = {
  children: ReactNode;
};

export function WorkspacePaneFrame({ children }: WorkspacePaneFrameProps) {
  return (
    <div className="h-full min-h-0 overflow-auto rounded-md bg-surface p-3 text-text">
      {children}
    </div>
  );
}
