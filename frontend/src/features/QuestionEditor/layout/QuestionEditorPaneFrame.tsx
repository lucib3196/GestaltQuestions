import type { ReactNode } from "react";

type QuestionEditorPaneFrameProps = {
  children: ReactNode;
};

export function QuestionEditorPaneFrame({
  children,
}: QuestionEditorPaneFrameProps) {
  return (
    <div className="h-full min-h-0 overflow-auto rounded-md bg-surface p-3 text-text">
      {children}
    </div>
  );
}
