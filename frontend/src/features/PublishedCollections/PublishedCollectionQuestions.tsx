import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  useCopyQuestion,
  useDownloadQuestions,
} from "../../hooks/developerQuestions";
import { useAuth } from "../../services/Auth";
import { QUESTION_TYPE_OPTIONS } from "../../services/Questions";
import { formatDate } from "../../utils/formattingUtils";
import {
  QuestionAiGeneratedCell,
  QuestionStatusCell,
} from "../QuestionTables/components/cells";
import { usePersonalQuestionsTableRows } from "../QuestionTables/hooks/usePersonalQuestionsTableRows";
import { Table, TableContainer } from "../TableBase/primitives";
import {
  type PublishedCollectionFilters,
  PublishedCollectionQuestionsToolbar,
} from "./PublishedCollectionQuestionsToolbar";

const columnHeadings = [
  "Title",
  "Topics",
  "Type",
  "Status",
  "Source",
  "Created",
];

const emptyFilters: PublishedCollectionFilters = {
  topic: "",
  type: "",
  status: "",
  source: "",
};

type PublishedCollectionQuestionsProps = {
  collectionId: string;
  questionCount: number;
};

export function PublishedCollectionQuestions({
  collectionId,
  questionCount,
}: PublishedCollectionQuestionsProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(emptyFilters);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const actionPending = useRef(false);
  const { userData } = useAuth();
  const roles = userData?.roles ?? [];
  const canSelect = roles.includes("developer");
  const { copyQuestion, loading: copying } = useCopyQuestion();
  const { downLoadQuestions, loading: downloading } = useDownloadQuestions();
  const busy = copying || downloading;
  const params = useMemo(
    () => ({
      collection_id: collectionId,
      limit: Math.max(questionCount, 1000),
    }),
    [collectionId, questionCount],
  );
  const { rows, loading, error } = usePersonalQuestionsTableRows(params);
  const search = query.trim().toLowerCase();
  const { topic, type, status, source } = filters;
  const hasFilters = Boolean(topic || type || status || source);

  const questions = rows.map((row) => ({
    row,
    title: row.title?.trim() || "Untitled question",
    topics: (row.topics ?? []).flatMap((topic) => topic?.trim() || []),
    types: (row.question_type ?? []).flatMap((type) => {
      if (!type) return [];
      const option = QUESTION_TYPE_OPTIONS.find(
        (option) => option.value === type,
      );
      return option?.label ?? type;
    }),
  }));
  const topicOptions = Array.from(
    new Set(questions.flatMap(({ topics }) => topics)),
  ).sort((first, second) => first.localeCompare(second));
  const matches = questions.filter(
    ({ row, title, topics, types }) =>
      [title, ...topics, ...types].some((value) =>
        value.toLowerCase().includes(search),
      ) &&
      (!topic || topics.includes(topic)) &&
      (!type || row.question_type?.includes(type)) &&
      (!status || row.status.toLowerCase() === status) &&
      (!source || row.ai_generated === (source === "ai")),
  );
  const selectedVisibleIds = canSelect
    ? matches
        .map(({ row }) => row.question_id)
        .filter((id) => selectedIds.has(id))
    : [];
  const selectedCount = selectedVisibleIds.length;
  const allSelected = matches.length > 0 && selectedCount === matches.length;

  function changeQuery(value: string) {
    setQuery(value);
    setSelectedIds(new Set());
  }

  function changeFilters(nextFilters: PublishedCollectionFilters) {
    setFilters(nextFilters);
    setSelectedIds(new Set());
  }

  function clearFilters() {
    setFilters(emptyFilters);
    setSelectedIds(new Set());
  }

  function toggleQuestion(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function runAction(
    action: typeof copyQuestion | typeof downLoadQuestions,
  ) {
    if (!selectedCount || actionPending.current) return;

    actionPending.current = true;
    try {
      const results = await action(selectedVisibleIds);
      if (!results) return;

      setSelectedIds((current) => {
        const next = new Set(current);
        results.forEach((result, index) => {
          if (result.status === "fulfilled")
            next.delete(selectedVisibleIds[index]);
        });
        return next;
      });
    } finally {
      actionPending.current = false;
    }
  }

  return (
    <section aria-label="Collection questions" className="min-w-0 space-y-4">
      <h2 className="text-xl font-semibold text-text">
        Questions ({questionCount})
      </h2>
      <PublishedCollectionQuestionsToolbar
        query={query}
        onQueryChange={changeQuery}
        filters={filters}
        onFiltersChange={changeFilters}
        onClearFilters={clearFilters}
        topics={topicOptions}
        roles={roles}
        selectedCount={selectedCount}
        busy={busy || loading || Boolean(error)}
        onCopy={() => runAction(copyQuestion)}
        onDownload={() => runAction(downLoadQuestions)}
      />

      {loading ? (
        <p role="status" className="text-sm text-text-muted">
          Loading questions…
        </p>
      ) : error ? (
        <p role="alert" className="text-sm text-warning">
          {error}
        </p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-text-muted">
          This collection does not contain any questions.
        </p>
      ) : matches.length === 0 ? (
        <p role="status" className="text-sm text-text-muted">
          {hasFilters
            ? "No questions match the selected filters."
            : "No questions match your search."}
        </p>
      ) : (
        <TableContainer>
          <Table label="Questions in this collection">
            <thead className="border-b border-border-strong bg-surface-strong text-xs font-semibold uppercase tracking-wide text-text-muted">
              <tr>
                {canSelect && (
                  <th scope="col" className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label="Select all matching questions"
                      checked={allSelected}
                      disabled={busy}
                      ref={(input) => {
                        if (input)
                          input.indeterminate =
                            selectedCount > 0 && !allSelected;
                      }}
                      onChange={(event) =>
                        setSelectedIds(
                          new Set(
                            event.target.checked
                              ? matches.map(({ row }) => row.question_id)
                              : [],
                          ),
                        )
                      }
                      className="size-4 accent-accent disabled:opacity-50"
                    />
                  </th>
                )}
                {columnHeadings.map((heading) => (
                  <th key={heading} scope="col" className="px-4 py-3 text-left">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm text-text-muted">
              {matches.map(({ row, title, topics, types }) => (
                <tr key={row.question_id} className="hover:bg-surface-muted">
                  {canSelect && (
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        aria-label={`Select ${title}`}
                        checked={selectedIds.has(row.question_id)}
                        disabled={busy}
                        onChange={() => toggleQuestion(row.question_id)}
                        className="size-4 accent-accent disabled:opacity-50"
                      />
                    </td>
                  )}
                  <th scope="row" className="min-w-52 px-4 py-3 text-left">
                    <Link
                      to={`/questions/${encodeURIComponent(row.question_id)}`}
                      className="rounded-sm wrap-break-word font-semibold text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      {title}
                    </Link>
                  </th>
                  <td className="min-w-36 wrap-break-word px-4 py-3">
                    {topics.join(", ") || "—"}
                  </td>
                  <td className="min-w-32 wrap-break-word px-4 py-3">
                    {types.join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <QuestionStatusCell row={row} />
                  </td>
                  <td className="px-4 py-3">
                    {row.ai_generated == null ? (
                      "—"
                    ) : (
                      <QuestionAiGeneratedCell row={row} />
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(row.created_at) ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </section>
  );
}
