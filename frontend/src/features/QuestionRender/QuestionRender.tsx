import { useMemo, useState, type FormEvent } from "react";
import type { ServerSettings } from "../QuestionBuilder/components/ServerToggle";
import { useQuestionMetadata } from "../QuestionBuilder/hooks";
import { Button } from "../../components/Button";
import QuestionHTMLToReact from "./QuestionHtmlToReact";
import { useQuestionRuntimeContent } from "./hooks";
import { useQuestionResponses } from "./answerContext";
import type { QuizData } from "./types";
import DisplayAnswers from "./components/DisplayAnswers";

type QuestionRenderProps = {
    qid: string | null;
    type: "question.html" | "solution.html";
    serverSettings: ServerSettings;
};

const STATIC_QUIZ_DATA: QuizData = {
    params: {
        a: 5,
        b: 10,
    },
    correct_answers: {
        c: 10,
    },
};

export default function QuestionRender({ qid, type, serverSettings }: QuestionRenderProps) {
    const [refreshKey, setRefreshKey] = useState(0);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const { runtimeContent, loading, error } = useQuestionRuntimeContent(
        qid,
        serverSettings,
        refreshKey
    );
    const { questionMetadata } = useQuestionMetadata(qid);
    const { responses } = useQuestionResponses();

    const isQuestionView = type === "question.html";

    const html = useMemo(() => {
        if (!runtimeContent) return "";
        if (isQuestionView) return runtimeContent.question_html ?? "";
        return runtimeContent.solution_html ?? "No Solution Available";
    }, [runtimeContent, isQuestionView]);
    const hasRenderableContent = html.trim().length > 0;
    const showLoadingOverlay = loading && hasRenderableContent;
    const showInitialLoadingState = loading && !hasRenderableContent;
    const showBlockingError = Boolean(error) && !hasRenderableContent;

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        setHasSubmitted(true);
    };

    const handleGenerateQuestionVariant = () => {
        setRefreshKey((current) => current + 1);
        setHasSubmitted(false);
    };

    if (showBlockingError) {
        return (
            <div role="alert" className="qr-status qr-status--error">
                Failed to load question content. {error}
            </div>
        );
    }

    return (
        <div className="qr-shell">
            <header className="qr-header">
                <h2 className="qr-title">{questionMetadata?.title ?? "Question Preview"}</h2>
                <p className="qr-subtitle">
                    {isQuestionView ? "Question view for learners" : "Solution preview"}
                </p>
            </header>

            <form className="qr-form" onSubmit={handleSubmit}>
                <div className={`qr-content ${showLoadingOverlay ? "qr-content--loading" : ""}`}>
                    {showInitialLoadingState ? (
                        <div className="qr-loading-placeholder">Loading question content...</div>
                    ) : (
                        <QuestionHTMLToReact html={html} />
                    )}
                    {showLoadingOverlay && (
                        <div className="qr-loading-overlay" aria-live="polite">
                            Loading updated variant...
                        </div>
                    )}
                </div>
                {error && hasRenderableContent && (
                    <div role="alert" className="qr-status qr-status--error">
                        Failed to refresh content. Showing previous version.
                    </div>
                )}

                {isQuestionView && (
                    <div className="qr-actions">
                        <Button
                            type="button"
                            name="Generate Question Variant"
                            color="generateVariant"
                            onClick={handleGenerateQuestionVariant}
                        />
                        <Button
                            type="submit"
                            name="Submit Question Answers"
                            color="submitQuestion"
                        />
                    </div>
                )}
            </form>

            {isQuestionView && hasSubmitted && (
                <div className="qr-results">
                    <DisplayAnswers
                        quizData={STATIC_QUIZ_DATA}
                        submittedResponses={responses}
                        variant="emphasis"
                    />
                </div>
            )}
        </div>
    );
}
