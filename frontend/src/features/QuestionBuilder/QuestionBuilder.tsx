
import { useMyQuestions } from "./hooks";
import { QuestionTable } from "../../components/Tables";
import { type QuestionRead } from "./types";

type TableColumn<T> = {
    key: string;
    render: (row: T) => React.ReactNode;
};

export const QuestionSummaryColumns: TableColumn<QuestionRead>[] = [
    {
        key: "title",
        render: (q) => q.title ?? "Untitled",
    },
    {
        key: "isAdaptive",
        render: (q) => (q.isAdaptive ? "Yes" : "No"),
    },
    // {
    //     key: "topics",
    //     render: (q) => (q.topics.length ? q.topics.join(", ") : "—"),
    // },
    // {
    //     key: "qTypes",
    //     render: (q) => (q.qTypes.length ? q.qTypes.join(", ") : "—"),
    // },
];

export default function QuestionBuilder() {
    const { questions, } = useMyQuestions();

    console.log("My questions", questions)


    return <div>
        <QuestionTable questions={questions} columns={QuestionSummaryColumns} />
    </div>;
}
