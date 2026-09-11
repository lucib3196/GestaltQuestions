import type { ReactNode } from "react";

type QuestionLibraryTableLayoutProps = {
  children: ReactNode;
};

export function QuestionLibraryTableLayout({
  children,
}: QuestionLibraryTableLayoutProps) {
  return (
    <main className="flex min-w-0 flex-col gap-4 rounded-lg border border-border bg-surface p-4 shadow-soft">
      {children}
    </main>
  );
}
