import type { ReactNode } from "react";

type QuestionEditorPaneFrameProps = {
  children: ReactNode;
  controls?: ReactNode;
};

export function QuestionEditorPaneFrame({
  children,
  controls,
}: QuestionEditorPaneFrameProps) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-md bg-surface text-text">
      {controls && (
        <div className="flex shrink-0 justify-end px-3 pt-3">{controls}</div>
      )}
      <div className="min-h-0 flex-1 overflow-auto p-3">{children}</div>
    </div>
  );
}
