import type { QuestionRunResponse } from "../../services/QuestionRuntime";
import type { QuestionType } from "../../types/questionTypes";
import type { PlaygroundComponentDoc } from "./componentPlaygroundRegistry";

const DEFAULT_SOLUTION_HTML = `<pl-solution-panel title="Preview Solution" show-all="true">
  <pl-hint level="1">The preview is backed by the same question instance state used by live questions.</pl-hint>
  <pl-hint level="2" variant="highlighted">Submit the preview to inspect answer feedback.</pl-hint>
</pl-solution-panel>`;

function hashMarkup(markup: string): string {
  let hash = 0;

  for (let index = 0; index < markup.length; index += 1) {
    hash = (hash << 5) - hash + markup.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
}

function getQuestionTypes(component: PlaygroundComponentDoc): QuestionType[] {
  if (component.category === "Choice Inputs") return ["mc"];
  if (component.category === "Numeric Inputs") return ["num"];

  return ["fb"];
}

export function buildPlaygroundRuntime(
  component: PlaygroundComponentDoc,
  markup: string,
): QuestionRunResponse {
  const solutionHtml =
    component.tag === "pl-solution-panel" ? markup : DEFAULT_SOLUTION_HTML;
  const questionHtml =
    component.tag === "pl-solution-panel"
      ? `<pl-question-panel size="md" variant="default">
  <p>Use the Show Solution action to preview this solution panel in context.</p>
</pl-question-panel>`
      : markup;

  return {
    instance: `component-playground-${component.tag}-${hashMarkup(markup)}`,
    qmeta: {
      id: `component-playground-${component.tag}`,
      title: `${component.componentName} Preview`,
      ai_generated: false,
      isAdaptive: false,
      storage_path: null,
      storage_type: "playground",
      status: "draft",
      created_by_id: null,
      topics: [component.category],
      qType: getQuestionTypes(component),
    },
    question_html: questionHtml,
    solution_html: solutionHtml,
    logs: [],
    quiz_data: {
      params: {},
      correct_answers: {},
    },
  };
}
