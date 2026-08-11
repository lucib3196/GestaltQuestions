import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import type { QuestionRuntimeLanguage } from "../../services";
import { QuestionRender } from "../QuestionEngine";
import { PublishedQuestionsTable } from "../QuestionTables";
import { QuestionTableStoreProvider } from "../QuestionTables/tables/QuestionTableStoreProvider";
import { RuntimeToggle } from "../QuestionWorkspace";
import { useGetQuestionRunTimes } from "../QuestionWorkspace/hooks/hooks";
import { ToolBar } from "./toolbar/ToolBar";

export default function PublishedQuestions() {
  const navigate = useNavigate();
  return (
    <QuestionTableStoreProvider>
      <div className="flex min-h-screen flex-col bg-bg px-4 py-5 text-text sm:px-6 gap-5">
        <section className="rounded-lg border border-border bg-surface-strong px-5 py-4 shadow-soft">
          <h1 className="text-2xl font-semibold text-text">
            Published Questions
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-text-muted">
            Browse the published question bank. Select questions in the table,
            then use the toolbar to copy them into your workspace or download
            them.
          </p>
        </section>

        <ToolBar />
        <PublishedQuestionsTable
          onQuestionSelect={(qid) => navigate(`/questions/${qid}`)}
        />
      </div>
    </QuestionTableStoreProvider>
  );
}

export function GeneralQuestionRender() {
  const { qid } = useParams<{ qid: string }>();
  const { runtimeLanguages, loading, error } = useGetQuestionRunTimes(
    qid ?? "",
  );
  const [serverMode, setServerMode] =
    useState<QuestionRuntimeLanguage>("javascript");

  useEffect(() => {
    if (!runtimeLanguages.length) return;

    setServerMode((current) =>
      runtimeLanguages.includes(current) ? current : runtimeLanguages[0],
    );
  }, [runtimeLanguages]);

  if (!qid) return <div className="text-text-muted">Missing question id.</div>;

  return (
    <div className="flex w-full flex-col gap-3">
      <RuntimeToggle
        value={serverMode}
        options={runtimeLanguages}
        onChange={setServerMode}
      />

      {loading && (
        <div className="rounded-md border border-border bg-surface px-4 py-2 text-sm text-text-muted">
          Loading runtimes...
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <QuestionRender qid={qid} serverSettings={serverMode} />
    </div>
  );
}
