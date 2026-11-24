import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { SearchBar } from "../../components/SearchBar";
import { QUESTION_TYPE_OPTIONS } from "../../services/Questions";
import { formatDate } from "../../utils/formattingUtils";
import {
  QuestionAiGeneratedCell,
  QuestionStatusCell,
} from "../QuestionTables/components/cells";
import { usePersonalQuestionsTableRows } from "../QuestionTables/hooks/usePersonalQuestionsTableRows";
import { Table, TableContainer } from "../TableBase/primitives";

const columnHeadings = [
  "Title",
  "Topics",
  "Type",
  "Status",
  "Source",
  "Created",
];

type PublishedCollectionQuestionsProps = {
  collectionId: string;
  questionCount: number;
};

export function PublishedCollectionQuestions({
  collectionId,
  questionCount,
}: PublishedCollectionQuestionsProps) {
  const [query, setQuery] = useState("");
  const params = useMemo(
    () => ({
      collection_id: collectionId,
      limit: Math.max(questionCount, 1000),
    }),
    [collectionId, questionCount],
  );
  const { rows, loading, error } = usePersonalQuestionsTableRows(params);
  const search = query.trim().toLowerCase();

  const matches = rows
    .map((row) => ({
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
    }))
    .filter(({ title, topics, types }) =>
      [title, ...topics, ...types].some((value) =>
        value.toLowerCase().includes(search),
      ),
    );

  return (
    <section aria-label="Collection questions" className="min-w-0 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-text">
          Questions ({questionCount})
        </h2>
        <label className="block w-full max-w-md">
          <span className="sr-only">Search collection questions</span>
          <SearchBar
            value={query}
            setValue={setQuery}
            placeholder="Search by title, topic, or type"
          />
        </label>
      </div>

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
          No questions match your search.
        </p>
      ) : (
        <TableContainer>
          <Table label="Questions in this collection">
            <thead className="border-b border-border-strong bg-surface-strong text-xs font-semibold uppercase tracking-wide text-text-muted">
              <tr>
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
