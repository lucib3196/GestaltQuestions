import type { QuestionRead } from "../../QuestionBuilder";
import type { QuestionRunResponse } from "../../../services";
import QuestionHTMLToReact from "../render/QuestionHtmlToReact";
import QuestionActions from "./QuestionActions";
import DisplayAnswers from "./QuestionFeedback";
import { useQuestionInstance } from "../instance";

function QuestionHeader({ qdata }: { qdata: QuestionRead | null | undefined }) {
    return (
        <header className="mb-4 border-b border-border pb-3">
            <h1 className="mt-1 text-2xl font-semibold text-text">
                {qdata?.title ?? "Untitled question"}
            </h1>
            <span className="flex flex-row gap-2 items-center justify-baseline">
                Topics:{" "}
                {qdata?.topics?.length ? (
                    <p className="mt-1 text-sm text-text-muted">
                        {qdata.topics.join(", ")}
                    </p>
                ) : null}
            </span>
            <span className="flex flex-row gap-2 items-center justify-baseline">
                Question Type:{" "}
                {qdata?.qTypes?.length ? (
                    <p className="mt-1 text-sm text-text-muted">
                        {qdata.qTypes.join(", ")}
                    </p>
                ) : null}
            </span>
        </header>
    );
}

export default function QuestionBody({
    qpayload,
}: {
    qpayload: QuestionRunResponse;
}) {
    const hasSubmitted = useQuestionInstance((s) => s.hasSubmitted);
    const answers = useQuestionInstance((s) => s.answers);
    const showSolution = useQuestionInstance((s) => s.showSolution);

    return (
        <div>
            <QuestionHeader qdata={qpayload.qmeta} />
            <QuestionHTMLToReact html={qpayload.question_html} />
            <QuestionActions />

            {showSolution && (
                <QuestionHTMLToReact
                    html={qpayload.solution_html ?? "No Solution Available for Question"}
                />
            )}

            {hasSubmitted && qpayload.quiz_data && (
                <DisplayAnswers
                    quizData={qpayload.quiz_data}
                    submittedAnswer={answers}
                />
            )}
        </div>
    );
}