import type React from "react";

type SolutionPanelProps = {
  children: React.ReactNode;
};

export default function SolutionPanel({ children }: SolutionPanelProps) {
  return (
    <section className="h-full overflow-auto rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-6 text-[var(--color-text)] shadow-[var(--shadow-soft)] transition-colors duration-[var(--duration-base)] ease-[var(--ease-base)]">
      <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
        Solution
      </h2>
      {children}
    </section>
  );
}
