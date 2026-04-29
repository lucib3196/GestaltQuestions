import { type QuestionRead } from "../types";
import { QuestionTable } from "../../../components/Tables";
import { Container } from "../components";

type TableColumn = {
    key: string;
    render: (
        row: { id?: string | null | undefined },
        className?: string,
    ) => React.ReactNode;
};

type DevQTableProps = {
    questions: QuestionRead[];
    onQuestionSelect: (qid: string) => void;
    selectedQuestionId?: string | null;
};

export default function DevQuestionTable({
    questions,
    onQuestionSelect,
    selectedQuestionId
}: DevQTableProps) {
    const QuestionSummaryColumns: TableColumn[] = [
        {
            key: "title",
            render: (q) => {
                const question = q as QuestionRead; const isSelected = question.id === selectedQuestionId; return (
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
            <QuestionTable
                questions={questions}
                columns={QuestionSummaryColumns}
                onTitleClick={(v) => onQuestionSelect(v.id)}
            ></QuestionTable>
        </Container>
    );
}
