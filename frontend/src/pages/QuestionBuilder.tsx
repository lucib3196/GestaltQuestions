import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useQuestionCollectionStore } from "../features/QuestionCollections/instance/store";
import { ComponentPlayGround } from "../features/ComponentPlayGround";
import { CreateNewQuestion as CreateQuestion } from "../features/CreateNewQuestion";
import { MyQuestionsTable } from "../features/QuestionTables";
import QuestionCollections from "../features/QuestionCollections/QuestionCollections";
import { useEffect, useState } from "react";
import type { QuestionTableSearchParams } from "../services";

export default function QuestionBuilderPage() {
  return (
    <div className="min-h-screen bg-bg p-6 text-text">
      <header className="mb-4 rounded-xl border border-border bg-surface p-5 shadow-soft">
        <h1 className="text-2xl font-semibold">Question Workspace</h1>
        <p className="text-sm text-text-muted">
          Build from scratch, browse your questions, edit existing ones, or
          explore component markup.
        </p>

        <nav className="mt-3 flex gap-2">
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

export function QuestionsListPage() {
  const navigate = useNavigate();
  const [, setShowAllQuestions] = useState<boolean>(true);
  const [baseQuery, setBaseQuery] = useState<QuestionTableSearchParams>({});
  const selectedCollection = useQuestionCollectionStore(
    (s) => s.selectedCollectionId,
  );
  const setSelectedCollection = useQuestionCollectionStore(
    (s) => s.setSelectedCollectionId,
  );

  useEffect(() => {
    if (!selectedCollection) return;
    setShowAllQuestions(false);
    setBaseQuery({ collection_id: selectedCollection });
  }, [selectedCollection]);

  return (
    <div className="grid min-h-[calc(100vh-13rem)] grid-cols-[minmax(16rem,19rem)_minmax(0,1fr)] gap-4">
      <div className="min-h-0">
        <button
          type="button"
          onClick={() => {
            setShowAllQuestions(true);
            setBaseQuery({});
            setSelectedCollection("");
          }}
          className="mb-3 flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm font-semibold text-text transition hover:border-border-strong hover:bg-surface-strong"
        >
          All Questions
          <span className="text-xs font-medium text-text-muted">View all</span>
        </button>
        <QuestionCollections />
      </div>
      <section className="min-w-0 rounded-xl border border-border bg-surface p-4 shadow-soft">
        <MyQuestionsTable
          baseQuery={baseQuery}
          onQuestionSelect={(qid) =>
            navigate(`/question_builder/questions/${qid}/edit`)
          }
        />
      </section>
    </div>
  );
}

export function CreateNewQuestion() {
  return (
    <>
      <CreateQuestion />
    </>
  );
}

export function QuestionBuilderPlaygroundPage() {
  return <ComponentPlayGround />;
}
