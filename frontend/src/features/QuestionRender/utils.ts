import type { QuestionValues } from "./types";

export type AnswerComparisonRow = {
    key: string;
    correct: QuestionValues[string];
    submitted: QuestionValues[string];
};

export function buildAnswerComparisonRows(
    correctAnswers: QuestionValues,
    submittedResponses: QuestionValues | null
): AnswerComparisonRow[] {
    return Object.entries(correctAnswers).map(([key, correctValue]) => {
        const submittedValue =
            submittedResponses && key in submittedResponses
                ? submittedResponses[key]
                : null;

        return {
            key,
            correct: correctValue,
            submitted: submittedValue,
        };
    });
}

// Backward-compatible alias
export const mapAnswers = buildAnswerComparisonRows;
