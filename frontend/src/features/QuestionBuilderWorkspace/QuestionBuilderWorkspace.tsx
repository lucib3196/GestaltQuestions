import type React from "react";
import { useNavigate } from "react-router-dom";
import { NavLink, Outlet } from "react-router-dom";

import { CollectionProvider } from "../QuestionCollections/instance/context";
import { useCollectionStore } from "../QuestionCollections/instance/context";
import DeveloperQuestionsTable from "../QuestionTables/tables/DeveloperQuestionsTable";
import { QuestionTableStoreProvider } from "../QuestionTables/tables/QuestionTableStoreProvider";
import QuestionBuilderSideBar from "./QuestionBuilderSideBar";
import { ToolBar } from "./toolbar/ToolBar";
export function QuestionBuilderShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QuestionTableStoreProvider>
      <CollectionProvider>
        <div className="min-h-screen bg-bg px-4 py-5 text-text sm:px-6">
          <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-[1500px] flex-col gap-5">
            {children}
          </div>
        </div>
      </CollectionProvider>
    </QuestionTableStoreProvider>
  );
}

function WorkspaceLinks() {
  return (
    <div className="text-text">
      <header className="rounded-lg border border-border bg-surface px-5 py-4 shadow-soft">
        <h1 className="text-xl font-semibold">Question Workspace</h1>
        <p className="mt-1 max-w-3xl text-sm text-text-muted">
          Build from scratch, browse your questions, edit existing ones, or
          explore component markup.
        </p>

        <nav className="mt-4 flex flex-wrap gap-2">
          <NavLink
            to="/question_builder/questions"
            end
            className={({ isActive }) =>
              isActive
                ? "rounded-md border border-border-strong bg-surface-strong px-3 py-1.5 text-sm"
                : "rounded-md border border-border px-3 py-1.5 text-sm text-text-muted hover:text-text"
            }
          >
            My Questions
          </NavLink>

          <NavLink
            to="/question_builder/questions/new"
            className={({ isActive }) =>
              isActive
                ? "rounded-md border border-border-strong bg-surface-strong px-3 py-1.5 text-sm"
                : "rounded-md border border-border px-3 py-1.5 text-sm text-text-muted hover:text-text"
            }
          >
            New Question
          </NavLink>

          <NavLink
            to="/question_builder/playground"
            className={({ isActive }) =>
              isActive
                ? "rounded-md border border-border-strong bg-surface-strong px-3 py-1.5 text-sm"
                : "rounded-md border border-border px-3 py-1.5 text-sm text-text-muted hover:text-text"
            }
          >
            Component Playground
          </NavLink>
          <NavLink
            to="/question_builder/chat"
            end
            className={({ isActive }) =>
              isActive
                ? "rounded-md border border-border-strong bg-surface-strong px-3 py-1.5 text-sm"
                : "rounded-md border border-border px-3 py-1.5 text-sm text-text-muted hover:text-text"
            }
          >
            Chat
          </NavLink>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

function TableView() {
  const navigate = useNavigate();

  const selectedCollection = useCollectionStore((s) => s.selectedCollectionId);

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <ToolBar />

      <DeveloperQuestionsTable
        baseQuery={{ collection_id: selectedCollection }}
        onQuestionSelect={(qid) =>
          navigate(`/question_builder/questions/${qid}/edit`)
        }
      />
    </section>
  );
}
export default function QuestionBuilderWorkspace() {
  return (
    <QuestionBuilderShell>
      <div>
        <WorkspaceLinks />
      </div>

      {/* Main Section */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <QuestionBuilderSideBar />
        <TableView />
      </div>
    </QuestionBuilderShell>
  );
}
