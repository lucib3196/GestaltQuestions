import type React from "react";

type QuestionPanelProps = {
  children: React.ReactNode;
};

export default function QuestionPanel({ children }: QuestionPanelProps) {
  return (
    <section className="h-full overflow-auto rounded-md border border-border-strong bg-surface p-6 text-text shadow-(--shadow-soft) transition-colors duration-(--duration-base) ease-base">
      {children}
    </section>
  );
}
