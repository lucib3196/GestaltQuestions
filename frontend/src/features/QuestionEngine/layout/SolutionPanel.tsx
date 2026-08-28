import type React from "react";

type SolutionPanelProps = {
  children: React.ReactNode;
};

export default function SolutionPanel({ children }: SolutionPanelProps) {
  return (
    <section className="h-full overflow-auto rounded-md border border-border-strong bg-surface p-6 text-text shadow-(--shadow-soft) transition-colors duration-(--duration-base) ease-base">
      {children}
    </section>
  );
}
