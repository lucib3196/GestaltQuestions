import type { ReactNode } from "react";
import LibrarySideBar from "./LibrarySidebar";
import { CollectionProvider } from "../../QuestionCollections/instance/context";

type DeveloperQuestionLibraryShellProps = {
  children: ReactNode;
};

export function DeveloperQuestionLibraryShell({
  children,
}: DeveloperQuestionLibraryShellProps) {
  return (
    <CollectionProvider>
      <div className="min-h-screen bg-bg px-4 py-5 text-text sm:px-6">
        <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full flex-col gap-5">
          {children}
        </div>
      </div>
    </CollectionProvider>
  );
}
