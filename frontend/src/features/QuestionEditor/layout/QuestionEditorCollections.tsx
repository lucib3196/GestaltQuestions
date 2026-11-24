import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../../services/Auth";
import type { QuestionCollectionMembership } from "../../../services/Collections/types";
import DeveloperQuestionsApi from "../../../services/DeveloperQuestions/api";
import { AddQuestionToCollectionsAction } from "../../QuestionCollections/AddQuestionToCollectionsAction";

const previewLimit = 3;

export function QuestionEditorCollections({ qid }: { qid: string }) {
  const { user } = useAuth();
  const [collections, setCollections] = useState<
    QuestionCollectionMembership[] | null
  >(null);
  const [error, setError] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function refresh() {
    setError(false);
    setRefreshKey((key) => key + 1);
  }

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const loadCollections = async () => {
      try {
        const token = await user.getIdToken();
        if (cancelled) return;
        const memberships = await DeveloperQuestionsApi.listOwnedCollections(
          token,
          qid,
        );
        if (!cancelled) setCollections(memberships);
      } catch {
        if (!cancelled) setError(true);
      }
    };

    void loadCollections();
    return () => {
      cancelled = true;
    };
  }, [qid, refreshKey, user]);

  const visibleCollections = showAll
    ? collections
    : collections?.slice(0, previewLimit);
  const extraCount = Math.max((collections?.length ?? 0) - previewLimit, 0);

  return (
    <section
      aria-label="My collections"
      className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-2"
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold text-text">My collections</h2>
        {error ? (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span role="status">Couldn’t load collections.</span>
            <button
              type="button"
              onClick={refresh}
              className="rounded px-1 font-semibold text-accent-strong underline"
            >
              Retry
            </button>
          </div>
        ) : !visibleCollections ? (
          <span role="status" className="text-xs text-text-muted">
            Loading collections…
          </span>
        ) : visibleCollections.length === 0 ? (
          <span className="text-xs text-text-muted">No collections yet</span>
        ) : (
          <>
            <ul className="flex min-w-0 flex-wrap items-center gap-2">
              {visibleCollections.map(({ id, title }) => (
                <li key={id} className="min-w-0">
                  <Link
                    to={`/question_builder/collections/${encodeURIComponent(id)}`}
                    rel="noopener"
                    className="inline-flex max-w-64 items-center gap-1 rounded-md border border-border bg-surface-secondary px-2 py-1 text-xs font-medium text-text hover:bg-surface-muted"
                  >
                    <span className="truncate">{title}</span>
                    <ExternalLink
                      className="size-3 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </Link>
                </li>
              ))}
            </ul>
            {extraCount > 0 && (
              <button
                type="button"
                aria-expanded={showAll}
                onClick={() => setShowAll((open) => !open)}
                className="rounded-md px-2 py-1 text-xs font-semibold text-accent-strong hover:bg-surface-muted"
              >
                {showAll ? "Show less" : `Show all (+${extraCount})`}
              </button>
            )}
          </>
        )}
      </div>
      <AddQuestionToCollectionsAction qid={qid} onAssignmentSettled={refresh} />
    </section>
  );
}
