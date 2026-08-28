import clsx from "clsx";
import { useRef } from "react";
import { useEffect } from "react";

import { useQuestionInstance } from "../instance";
import QuestionHTMLToReact from "../render/QuestionHtmlToReact";
import DisplayAnswers from "../ui/QuestionFeedback";
import QuestionHeader from "../ui/QuestionHeader";
import QuestionActions from "./QuestionActions";
type QuestionBodyVariant = "default" | "compact" | "flush" | "centered";

type QuestionBodyProps = {
  variant?: QuestionBodyVariant;
  className?: string;
};

const questionBodyVariants: Record<QuestionBodyVariant, string> = {
  default: "p-5",
  compact: "p-4",
  flush: "border-transparent bg-transparent p-0 shadow-none",
  centered: "mx-auto max-w-5xl p-5",
};

export default function QuestionBody({
  className = "",
  variant = "compact",
}: QuestionBodyProps) {
  const runtime = useQuestionInstance((s) => s.runtime);
  const hasSubmitted = useQuestionInstance((s) => s.hasSubmitted);
  const userAnswers = useQuestionInstance((s) => s.userAnswers);
  const correctAnswers = useQuestionInstance((s) => s.correctAnswers);

  // UI stuff
  const feedbackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasSubmitted) return;
    feedbackRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [hasSubmitted]);

  if (!runtime) return null;

  return (
    <section
      className={clsx(
        "h-full overflow-auto rounded-md border border-border-strong bg-surface text-text shadow-soft transition-colors duration-(--duration-base) ease-base",
        questionBodyVariants[variant],
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <QuestionHeader qdata={runtime.qmeta} variant={variant} />

        <div className="min-w-0">
          <QuestionHTMLToReact html={runtime.question_html} />
        </div>

        <QuestionActions />

        {hasSubmitted && (
          <div ref={feedbackRef}>
            <DisplayAnswers
              correctAnswers={correctAnswers}
              submittedAnswer={userAnswers}
              variant={variant === "compact" ? "compact" : "default"}
            />
          </div>
        )}
      </div>
    </section>
  );
}

export type { QuestionBodyVariant };
