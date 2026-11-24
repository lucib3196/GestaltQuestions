import clsx from "clsx";
import { type ComponentProps, useState } from "react";
import { FiEye, FiEyeOff, FiRefreshCw, FiSend } from "react-icons/fi";

import { Button } from "../../../components/Button";
import { useQuestionInstance } from "../instance";
import { SolutionGuideDialog } from "../layout/SolutionGuideDialog";

function QuestionActionButton({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      color="transparent"
      className={clsx(
        "inline-flex items-center gap-2 rounded-md border border-border-strong px-5 py-3 text-sm font-semibold text-text shadow-sm hover:border-accent hover:bg-surface-secondary disabled:hover:scale-100",
        className,
      )}
    />
  );
}

export default function QuestionActions({
  solutionInDialog = false,
}: { solutionInDialog?: boolean } = {}) {
  const [guideOpen, setGuideOpen] = useState(false);
  const solutionHtml = useQuestionInstance((s) => s.runtime?.solution_html);
  const resetAnswers = useQuestionInstance((s) => s.resetAnswers);
  const setRefreshKey = useQuestionInstance((s) => s.setRefreshKey);
  const setShowSolution = useQuestionInstance((s) => s.setShowSolution);
  const showSolution = useQuestionInstance((s) => s.showSolution);
  const submitAnswers = useQuestionInstance((s) => s.submitAnswers);
  const resetSubmission = useQuestionInstance((s) => s.resetSubmissions);
  const hasSubmitted = useQuestionInstance((s) => s.hasSubmitted);

  const handleGenerateVariant = () => {
    resetSubmission();
    resetAnswers();
    setRefreshKey();
  };
  const handleSubmit = () => {
    submitAnswers();
  };
  const showingSideSolution = !solutionInDialog && showSolution;
  return (
    <div className="flex flex-wrap gap-3">
      <QuestionActionButton
        type="button"
        name="Submit"
        icon={FiSend}
        onClick={handleSubmit}
        disabled={hasSubmitted}
        className="border-transparent bg-blue-500 text-white hover:bg-blue-600"
      />
      <QuestionActionButton
        type="button"
        onClick={handleGenerateVariant}
        name="New Variant"
        icon={FiRefreshCw}
      />
      {solutionHtml && (
        <QuestionActionButton
          type="button"
          onClick={
            solutionInDialog ? () => setGuideOpen(true) : setShowSolution
          }
          aria-haspopup={solutionInDialog ? "dialog" : undefined}
          name={
            solutionInDialog
              ? "Open Solution Guide"
              : showingSideSolution
                ? "Hide Solution"
                : "Show Solution"
          }
          icon={showingSideSolution ? FiEyeOff : FiEye}
        />
      )}
      {solutionInDialog && solutionHtml && (
        <SolutionGuideDialog
          open={guideOpen}
          onClose={() => setGuideOpen(false)}
          html={solutionHtml}
        />
      )}
    </div>
  );
}
