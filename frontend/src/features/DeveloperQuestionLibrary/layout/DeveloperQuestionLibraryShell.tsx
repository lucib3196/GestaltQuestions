import type { ReactNode } from "react";

import { CollectionProvider } from "../../../stores/collections";

type DeveloperQuestionLibraryShellProps = {
  children: ReactNode;
};

export function DeveloperQuestionLibraryShell({
  children,
}: DeveloperQuestionLibraryShellProps) {
  return (
    <CollectionProvider>
      <div className="flex min-h-0 flex-1 flex-col gap-5">{children}</div>
    </CollectionProvider>
  );
}
