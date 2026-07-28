import type { QuestionCreate } from "../../../types/questionTypes";

export type QuestionTemplateFile = {
  filename: string;
  description: string;
  mimeType: string;
  content: string;
};

export type QuestionTemplateId =
  | "numerical"
  | "static-question"
  | "image-question";

export type QuestionTemplateName =
  | "Numerical question"
  | "Static question"
  | "Image question";

export type QuestionTemplate = {
  id: QuestionTemplateId;
  name: QuestionTemplateName;
  title: string;
  description: string;
  questionData: Partial<QuestionCreate>;
  defaultFiles: string[];
  files: QuestionTemplateFile[];
};

const staticAdditionQuestionHtml = {
  filename: "question.html",
  mimeType: "text/html",
  description: "Defines a fixed addition prompt with multiple-choice answers.",
  content: `
<pl-question-panel>
  <p>
    What is 2 + 3?
  </p>
</pl-question-panel>

<pl-multiple-choice answers-name="sum">
  <pl-answer correct="false">4</pl-answer>
  <pl-answer correct="true">5</pl-answer>
  <pl-answer correct="false">6</pl-answer>
</pl-multiple-choice>
  `.trim(),
} satisfies QuestionTemplateFile;

const adaptiveAdditionQuestionHtml = {
  filename: "question.html",
  mimeType: "text/html",
  description:
    "Defines an adaptive addition prompt that reads generated parameters.",
  content: `
<pl-question-panel>
  <p>
    What is the sum of {{params.a}} and {{params.b}}?
  </p>
</pl-question-panel>

<pl-number-input
  answers-name="sum"
  label="Sum"
/>
  `.trim(),
} satisfies QuestionTemplateFile;

const staticSolutionHtml = {
  filename: "solution.html",
  mimeType: "text/html",
  description:
    "Provides optional hints, worked steps, or final explanation for the question.",
  content: `
<pl-solution-panel>
  <pl-hint level="1">
    The problem asks for the sum of 2 and 3.
  </pl-hint>

  <pl-hint level="2">
    2 + 3 = 5
  </pl-hint>
</pl-solution-panel>
  `.trim(),
} satisfies QuestionTemplateFile;

const adaptiveSolutionHtml = {
  filename: "solution.html",
  mimeType: "text/html",
  description:
    "Provides optional hints, worked steps, or final explanation for the question.",
  content: `
<pl-solution-panel>
  <pl-hint level="1">
    Add the two given numbers.
  </pl-hint>

  <pl-hint level="2">
    {{params.a}} + {{params.b}} = {{correct_answers.sum}}
  </pl-hint>
</pl-solution-panel>
  `.trim(),
} satisfies QuestionTemplateFile;

const serverJs = {
  filename: "server.js",
  mimeType: "text/javascript",
  description:
    "Generates randomized parameters and correct answers for adaptive questions.",
  content: `
const math = require("mathjs");

const generate = () => {
  const a = math.randomInt(1, 21);
  const b = math.randomInt(1, 21);

  return {
    params: { a, b },
    correct_answers: {
      sum: a + b,
    },
  };
};

module.exports = { generate };
  `.trim(),
} satisfies QuestionTemplateFile;

const serverPy = {
  filename: "server.py",
  mimeType: "text/x-python",
  description:
    "Alternative Python generator for adaptive parameters and correct answers.",
  content: `
import random

def generate():
    a = random.randint(1, 20)
    b = random.randint(1, 20)

    return {
        "params": {
            "a": a,
            "b": b,
        },
        "correct_answers": {
            "sum": a + b,
        },
    }
  `.trim(),
} satisfies QuestionTemplateFile;

const imageQuestionHtml = {
  filename: "question.html",
  mimeType: "text/html",
  description:
    "Displays an image beside the prompt and captures the student's answer.",
  content: `
<pl-question-panel>
  <p>Use the image below to answer the question.</p>
  <img src="image.png" alt="Question reference" />
</pl-question-panel>

<pl-string-input
  answers-name="answer"
  label="Answer"
/>
  `.trim(),
} satisfies QuestionTemplateFile;

const imageFile = {
  filename: "image.png",
  mimeType: "image/png",
  description:
    "Placeholder image asset referenced by question.html; replace with the final image file later.",
  content: "",
} satisfies QuestionTemplateFile;

export const QuestionTemplatesById = {
  numerical: {
    id: "numerical",
    name: "Numerical question",
    title: "Numerical question",
    description:
      "A generated arithmetic question bundled with JavaScript and Python server templates.",
    questionData: {
      isAdaptive: true,
      topics: ["adaptive", "generated-params"],
      qType: ["num"],
      ai_generated: false,
      title: "Add Numbers Adaptive",
    },
    defaultFiles: ["question.html", "solution.html", "server.js", "server.py"],
    files: [adaptiveAdditionQuestionHtml, adaptiveSolutionHtml, serverJs, serverPy],
  },
  "static-question": {
    id: "static-question",
    name: "Static question",
    title: "Static question",
    description:
      "A fixed multiple-choice question with no JavaScript or Python server files.",
    questionData: {
      isAdaptive: false,
      topics: ["static"],
      qType: ["mcq"],
      ai_generated: false,
      title: "Static Question",
    },
    defaultFiles: ["question.html", "solution.html"],
    files: [staticAdditionQuestionHtml, staticSolutionHtml],
  },
  "image-question": {
    id: "image-question",
    name: "Image question",
    title: "Image question",
    description:
      "A starter question that includes an image asset referenced from the question markup.",
    questionData: {
      isAdaptive: false,
      topics: ["image"],
      qType: ["fb"],
      ai_generated: false,
      title: "Image Question",
    },
    defaultFiles: ["question.html", "image.png"],
    files: [imageQuestionHtml, imageFile],
  },
} satisfies Record<QuestionTemplateId, QuestionTemplate>;

export const QuestionTemplates = Object.values(QuestionTemplatesById);

export const QuestionTemplatesByName = QuestionTemplates.reduce(
  (templates, template) => ({
    ...templates,
    [template.name]: template,
  }),
  {} as Record<QuestionTemplateName, QuestionTemplate>,
);

export const getQuestionTemplate = (id: QuestionTemplateId) =>
  QuestionTemplatesById[id];

export const getQuestionTemplateFiles = (id: QuestionTemplateId) =>
  QuestionTemplatesById[id].files;

export const TemplateFiles: QuestionTemplateFile[] =
  QuestionTemplatesById.numerical.files;
