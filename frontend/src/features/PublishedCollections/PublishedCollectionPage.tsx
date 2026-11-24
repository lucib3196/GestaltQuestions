import { ArrowLeft, ListChecks } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useFetchCollection } from "../../hooks/collections";
import { useAuth } from "../../services/Auth";
import CollectionsApi from "../../services/Collections/api";
import type { CollectionQuestion } from "../../services/Collections/types";
import { CollectionHeroIcon } from "../DeveloperCollection/components/customization/CollectionHeroIcon";

export default function PublishedCollectionPage() {
  const { collectionId } = useParams<{ collectionId: string }>();
  const { user } = useAuth();
  const { collection, loading, error } = useFetchCollection(collectionId);
  const [questions, setQuestions] = useState<CollectionQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadQuestions() {
      if (!user || !collectionId || collection?.status !== "published") {
        setQuestions([]);
        setQuestionsError(null);
        setQuestionsLoading(false);
        return;
      }

      setQuestionsLoading(true);
      setQuestionsError(null);

      try {
        const token = await user.getIdToken();
        const results = await CollectionsApi.getCollectionQuestions(
          token,
          collectionId,
        );
        if (active) {
          setQuestions(results);
        }
      } catch (err) {
        if (active) {
          setQuestions([]);
          setQuestionsError(
            err instanceof Error
              ? err.message
              : "Unable to load collection questions.",
          );
        }
      } finally {
        if (active) {
          setQuestionsLoading(false);
        }
      }
    }

    void loadQuestions();
    return () => {
      active = false;
    };
  }, [collection?.status, collectionId, user]);

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-5 text-sm text-text-muted">
        Loading collection...
      </div>
    );
  }

  if (error || !collection || collection.status !== "published") {
    return (
      <section className="rounded-lg border border-border bg-surface p-5">
        <p className="text-sm text-text-muted">
          {error ?? "This published collection could not be found."}
        </p>
        <Link
          to="/collections"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to collections
        </Link>
      </section>
    );
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-5">
      <Link
        to="/collections"
        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-text-muted hover:text-text"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Published collections
      </Link>

      <article className="rounded-lg border border-border bg-surface p-5 text-text shadow-soft sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <CollectionHeroIcon customization={collection.customization} />
          <div>
            <h1 className="text-3xl font-semibold">{collection.title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-text-muted">
              {collection.description?.trim() || "No description added yet."}
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <ListChecks className="size-5" aria-hidden="true" />
            Questions ({collection.question_ids.length})
          </h2>

          {questionsLoading ? (
            <p className="mt-4 text-sm text-text-muted">Loading questions...</p>
          ) : questionsError ? (
            <p role="alert" className="mt-4 text-sm text-warning">
              {questionsError}
            </p>
          ) : questions.length === 0 ? (
            <p className="mt-4 text-sm text-text-muted">
              This collection does not contain any questions.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border rounded-md border border-border">
              {questions.map((question) => (
                <li key={question.id}>
                  <Link
                    to={`/questions/${encodeURIComponent(question.id)}`}
                    className="block px-4 py-3 text-sm font-medium text-text transition hover:bg-surface-muted"
                  >
                    {question.title?.trim() || "Untitled question"}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    </section>
  );
}
