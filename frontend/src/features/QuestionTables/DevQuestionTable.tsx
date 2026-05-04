import { type QuestionRead } from "../QuestionBuilder";
import { QuestionTableBase } from "./components";
import { Container } from "../../components/Container";
import { SearchBar } from "../../components/SearchBar";
import { useFilterMyQuestions } from "../QuestionBuilder";
import { useState, useMemo } from "react";
type TableColumn = {
    key: string;
    render?: (
        row: { id?: string | null | undefined },
        className?: string,
    ) => React.ReactNode;
};

type DevQTableProps = {
    onQuestionSelect: (qid: string) => void;
    selectedQuestionId?: string | null;
};

export default function DevQuestionTable({
    onQuestionSelect,
    selectedQuestionId,
}: DevQTableProps) {
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
    const [debouncedSearchTitle, setDebouncedSearchTitle] = useState("");

    const filter = useMemo(
        () => ({ title: debouncedSearchTitle }),
        [debouncedSearchTitle],
    );

    const { questions } = useFilterMyQuestions(filter);
    const QuestionSummaryColumns: TableColumn[] = [
        {
            key: "select",
        },
        {
            key: "title",
            render: (q) => {
                const question = q as QuestionRead;
                const isSelected = question.id === selectedQuestionId;
                return (
                    <button
                        type="button"
                        onClick={() => onQuestionSelect(question.id)}
                        className={
                            isSelected
                                ? "font-semibold text-accent underline"
                                : "text-text hover:text-accent"
                        }
                    >
                        {question.title ?? "Untitled"}
                    </button>
                );
            },
        },
        {
            key: "isAdaptive",
            render: (q) => ((q as QuestionRead).isAdaptive ? "Yes" : "No"),
        },
        {
            key: "topics",
            render: (q) =>
                (q as QuestionRead).topics.length
                    ? (q as QuestionRead).topics.join(", ")
                    : "—",
        },
        {
            key: "qTypes",
            render: (q) =>
                (q as QuestionRead).qTypes.length
                    ? (q as QuestionRead).qTypes.join(", ")
                    : "—",
        },
    ];

    return (
        <Container header="My Questions">
            <SearchBar
                value={debouncedSearchTitle}
                setValue={setDebouncedSearchTitle}
                disabled={false}
            />
            <QuestionTableBase
                multiSelect={true}
                questions={questions}
                columns={QuestionSummaryColumns}
                onTitleClick={(v) => onQuestionSelect(v.id)}
                onSelectedIdsChange={setSelectedQuestions}
                selectedIds={selectedQuestions}
            ></QuestionTableBase>
        </Container>
    );
}
