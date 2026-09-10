import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { CollectionProvider } from "../QuestionCollections/instance/context";
import { useCollectionStore } from "../QuestionCollections/instance/context";
import PersonalQuestionTable from "../QuestionTables";
import {
  PersonalQuestionTableProvider,
  SharedByMeQuestionTable,
  SharedByMeTableProvider,
  SharedWithMeQuestionTable,
  SharedWithMeTableProvider,
} from "../QuestionTables";
import QuestionSharing from "../Sharing/QuestionSharing";
import { TableBaseSearch } from "../TableBase/components/search";
import { useTableBaseContext } from "../TableBase/state";
import { UserLookupProvider } from "../UserLookUp/instance/context";
import QuestionLibrarySidebar from "./sidebar/QuestionLibrarySidebar";
import { QuestionLibraryToolbar } from "./toolbar/QuestionLibraryToolbar";

type QuestionLibraryTableView = "myQuestions" | "sharedByMe" | "sharedWithMe";

const QUESTION_LIBRARY_TABLE_OPTIONS = [
  { id: "myQuestions", label: "My Questions" },
  { id: "sharedByMe", label: "Shared by me" },
  { id: "sharedWithMe", label: "Shared with me" },
] as const satisfies readonly {
  id: QuestionLibraryTableView;
  label: string;
}[];

function tableOptionClassName(isActive: boolean) {
  return isActive
    ? "rounded-md border border-border-strong bg-surface-strong px-3 py-1.5 text-sm font-medium text-text"
    : "rounded-md border border-border bg-surface-secondary px-3 py-1.5 text-sm font-medium text-text-muted transition hover:border-border-strong hover:text-text";
}

export function DeveloperQuestionLibraryShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserLookupProvider>
      <CollectionProvider>
        <div className="min-h-screen bg-bg px-4 py-5 text-text sm:px-6">
          <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full flex-col gap-5">
            {children}
          </div>
        </div>
      </CollectionProvider>
    </UserLookupProvider>
  );
}

function QuestionLibraryTableTabs({
  activeView,
  onChange,
}: {
  activeView: QuestionLibraryTableView;
  onChange: (view: QuestionLibraryTableView) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {QUESTION_LIBRARY_TABLE_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={tableOptionClassName(activeView === option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ShareSelectedButton({ onOpenShare }: { onOpenShare: () => void }) {
  const selectedIds = useTableBaseContext((s) => s.selectedIds);

  return (
    <button
      type="button"
      onClick={onOpenShare}
      disabled={!selectedIds.length}
      className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
    >
      Share selected
    </button>
  );
}

function MyQuestionsView() {
  const navigate = useNavigate();
  const [sharingOpen, setSharingOpen] = useState(false);
  const selectedCollection = useCollectionStore((s) => s.selectedCollectionId);

  return (
    <PersonalQuestionTableProvider>
      <section className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text">My Questions</h2>
            <p className="mt-1 text-sm text-text-muted">
              Browse, edit, and share your questions.
            </p>
          </div>

          <ShareSelectedButton onOpenShare={() => setSharingOpen(true)} />
        </div>

        {sharingOpen && <QuestionSharing />}

        <QuestionLibraryToolbar />

        <PersonalQuestionTable
          baseQuery={{ collection_id: selectedCollection }}
          onRowSelect={(rowId) =>
            navigate(`/question_builder/questions/${rowId}/edit`)
          }
        />
      </section>
    </PersonalQuestionTableProvider>
  );
}

function SharedByMeView() {
  const navigate = useNavigate();

  return (
    <SharedByMeTableProvider>
      <section className="flex min-w-0 flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text">Shared by me</h2>
          <p className="mt-1 text-sm text-text-muted">
            Review question access granted to other members.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-4 shadow-soft">
          <TableBaseSearch />
        </div>

        <SharedByMeQuestionTable
          baseQuery={{}}
          onRowSelect={(rowId) =>
            navigate(`/question_builder/questions/${rowId}/edit`)
          }
        />
      </section>
    </SharedByMeTableProvider>
  );
}

function SharedWithMeView() {
  const navigate = useNavigate();

  return (
    <SharedWithMeTableProvider>
      <section className="flex min-w-0 flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text">Shared with me</h2>
          <p className="mt-1 text-sm text-text-muted">
            Questions other members have shared with you.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-4 shadow-soft">
          <TableBaseSearch />
        </div>

        <SharedWithMeQuestionTable
          baseQuery={{}}
          onRowSelect={(rowId) =>
            navigate(`/question_builder/questions/${rowId}/edit`)
          }
        />
      </section>
    </SharedWithMeTableProvider>
  );
}

function QuestionLibraryTableContent({
  activeView,
}: {
  activeView: QuestionLibraryTableView;
}) {
  if (activeView === "sharedByMe") {
    return <SharedByMeView />;
  }

  if (activeView === "sharedWithMe") {
    return <SharedWithMeView />;
  }

  return <MyQuestionsView />;
}

export default function DeveloperQuestionLibrary() {
  const [activeView, setActiveView] =
    useState<QuestionLibraryTableView>("myQuestions");

  return (
    <DeveloperQuestionLibraryShell>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <QuestionLibrarySidebar />

        <main className="flex min-w-0 flex-col gap-4 rounded-lg border border-border bg-surface p-4 shadow-soft">
          <QuestionLibraryTableTabs
            activeView={activeView}
            onChange={setActiveView}
          />

          <QuestionLibraryTableContent activeView={activeView} />
        </main>
      </div>
    </DeveloperQuestionLibraryShell>
  );
}
