import type { ReactNode } from "react";

type PublishedShellProps = {
  children: ReactNode;
};

export function PublishedShell({ children }: PublishedShellProps) {
  return (
    <div className="flex min-h-screen flex-col gap-5 bg-bg px-4 py-5 text-text sm:px-6">
      {children}
    </div>
  );
}
