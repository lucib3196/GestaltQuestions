import clsx from "clsx";
import { useMemo } from "react";
import { FiMonitor, FiRefreshCw, FiSend, FiSquare } from "react-icons/fi";

import { Button } from "../../../components/Button";
import { QuestionHTMLToReact } from "../../QuestionEngine";
import {
  QuestionInstanceProvider,
  useQuestionInstance,
} from "../../QuestionEngine/instance";
import QuestionRenderShell from "../../QuestionEngine/layout/QuestionRenderShell";
import type { PlaygroundComponentDoc } from "../componentPlaygroundRegistry";
import {
  useComponentPlaygroundStore,
  type PlaygroundPreviewMode,
} from "../componentPlaygroundStore";
import { buildPlaygroundRuntime } from "../playgroundRuntime";

type PlaygroundPreviewProps = {
  component: PlaygroundComponentDoc;
  markup: string;
};

const previewModes: {
  key: PlaygroundPreviewMode;
  label: string;
  icon: typeof FiMonitor;
}[] = [
  { key: "component", label: "Component", icon: FiSquare },
  { key: "question", label: "Question", icon: FiMonitor },
];

function PreviewModeButton({
  mode,
  active,
  onClick,
}: {
  mode: (typeof previewModes)[number];
  active: boolean;
  onClick: () => void;
}) {
  const Icon = mode.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "border-accent bg-accent/15 text-text"
          : "border-border bg-surface-strong text-text-muted hover:border-border-strong hover:text-text",
      )}
    >
      <Icon className="size-3.5" />
      {mode.label}
    </button>
  );
}

function RuntimeStateSummary() {
  const userAnswers = useQuestionInstance((state) => state.userAnswers);
  const correctAnswers = useQuestionInstance((state) => state.correctAnswers);
  const hasSubmitted = useQuestionInstance((state) => state.hasSubmitted);
  const answerEntries = Object.entries(userAnswers);
  const correctEntries = Object.entries(correctAnswers);

  return (
    <div className="border-b border-border bg-surface-secondary px-4 py-3">
      <div className="grid gap-2 text-xs text-text-muted xl:grid-cols-3">
        <div>
          <span className="font-semibold text-text-soft">submitted: </span>
          {hasSubmitted ? "true" : "false"}
        </div>
        <div className="min-w-0 truncate">
          <span className="font-semibold text-text-soft">answers: </span>
          {answerEntries.length
            ? answerEntries
                .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
                .join(", ")
            : "-"}
        </div>
        <div className="min-w-0 truncate">
          <span className="font-semibold text-text-soft">correct: </span>
          {correctEntries.length
            ? correctEntries
                .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
                .join(", ")
            : "-"}
        </div>
      </div>
    </div>
  );
}

function ComponentPreviewActions() {
  const submitAnswers = useQuestionInstance((state) => state.submitAnswers);
  const resetAnswers = useQuestionInstance((state) => state.resetAnswers);
  const resetSubmissions = useQuestionInstance(
    (state) => state.resetSubmissions,
  );
  const hasSubmitted = useQuestionInstance((state) => state.hasSubmitted);

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-surface px-4 py-3">
      <Button
        type="button"
        name="Submit"
        color="paneActive"
        size="sm"
        icon={FiSend}
        disabled={hasSubmitted}
        onClick={submitAnswers}
      />
      <Button
        type="button"
        name="Reset"
        color="paneMuted"
        size="sm"
        icon={FiRefreshCw}
        onClick={() => {
          resetSubmissions();
          resetAnswers();
        }}
      />
    </div>
  );
}

function PreviewBody({
  markup,
  previewMode,
}: {
  markup: string;
  previewMode: PlaygroundPreviewMode;
}) {
  if (previewMode === "question") {
    return (
      <div className="h-full overflow-auto p-4">
        <QuestionRenderShell />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="min-h-60 rounded-md border border-border bg-surface-strong p-4">
          <QuestionHTMLToReact html={markup} />
        </div>
      </div>
      <ComponentPreviewActions />
    </div>
  );
}

export default function PlaygroundPreview({
  component,
  markup,
}: PlaygroundPreviewProps) {
  const previewMode = useComponentPlaygroundStore(
    (state) => state.previewMode,
  );
  const setPreviewMode = useComponentPlaygroundStore(
    (state) => state.setPreviewMode,
  );
  const runtime = useMemo(
    () => buildPlaygroundRuntime(component, markup),
    [component, markup],
  );

  return (
    <QuestionInstanceProvider
      key={runtime.instance}
      initialState={{
        runtime,
        correctAnswers: runtime.quiz_data?.correct_answers ?? {},
      }}
    >
      <section className="flex h-full min-h-0 flex-col bg-bg">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-text">Preview</h3>
            <p className="mt-1 font-mono text-xs text-text-soft">
              {component.tag}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {previewModes.map((mode) => (
              <PreviewModeButton
                key={mode.key}
                mode={mode}
                active={previewMode === mode.key}
                onClick={() => setPreviewMode(mode.key)}
              />
            ))}
          </div>
        </div>

        <RuntimeStateSummary />

        <div className="min-h-0 flex-1 overflow-hidden">
          <PreviewBody markup={markup} previewMode={previewMode} />
        </div>
      </section>
    </QuestionInstanceProvider>
  );
}
