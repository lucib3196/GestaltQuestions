import clsx from "clsx";
import { buildAnswerComparisonRows } from "../utils";
import type { QuizData, QuestionValues } from "../types";

type AnswerTableVariant = "default" | "compact" | "emphasis";

const variantClasses: Record<AnswerTableVariant, string> = {
    default: "",
    compact: "qr-answer-card--compact",
    emphasis: "qr-answer-card--emphasis",
};

type DisplayAnswerProps = {
    quizData: QuizData | null;
    submittedResponses?: QuestionValues | null;
    submittedAnswer?: QuestionValues | null; // Backward-compatible prop
    variant?: AnswerTableVariant;
};

export default function DisplayAnswers({
    quizData,
    submittedResponses,
    submittedAnswer,
    variant = "default",
}: DisplayAnswerProps) {
    if (!quizData) return null;

    const effectiveResponses = submittedResponses ?? submittedAnswer ?? null;
    const rows = buildAnswerComparisonRows(quizData.correct_answers, effectiveResponses);

    return (
        <div className={clsx("qr-answer-card", variantClasses[variant])}>
            <table className="qr-answer-table">
                <thead>
                    <tr>
                        <th>Key</th>
                        <th>Submitted</th>
                        <th>Correct</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(({ key, correct, submitted }) => {
                        const isMatch = String(submitted ?? "") === String(correct ?? "");
                        return (
                            <tr
                                key={key}
                                className={clsx("qr-answer-row", !isMatch && "qr-answer-row--mismatch")}
                            >
                                <td>{key}</td>
                                <td>{submitted ?? "—"}</td>
                                <td>
                                    <span className="qr-answer-pill">{String(correct)}</span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
