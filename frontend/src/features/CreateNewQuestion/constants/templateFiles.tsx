import type { QuestionCreate } from "../../../types/questionTypes";
import type { Filenames, QuestionFileSpec } from "./questionFiles";

export type QuestionTemplateFile = QuestionFileSpec & {
  title: string;
};

export type QuestionTemplate = {
  id: string;
  title: string;
  description: string;
  questionData: Partial<QuestionCreate>;
  defaultFiles: Filenames[];
  files: QuestionTemplateFile[];
};

const staticAdditionQuestionHtml = {
  filename: "question.html",
  title: "Question markup",
  type: "html",
  required: true,
  isAdaptive: false,
  description:
    "Defines a fixed addition prompt with multiple-choice answers.",
  template: [
    {
      adaptive: false,
      template: `
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
    },
  ],
} satisfies QuestionTemplateFile;

const adaptiveAdditionQuestionHtml = {
  filename: "question.html",
  title: "Adaptive question markup",
  type: "html",
  required: true,
  isAdaptive: true,
  description:
    "Defines an adaptive addition prompt that reads generated parameters.",
  template: [
    {
      adaptive: true,
      template: `
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
    },
  ],
} satisfies QuestionTemplateFile;

const solutionHtml = {
  filename: "solution.html",
  title: "Solution explanation",
  type: "html",
  required: false,
  isAdaptive: false,
  description:
    "Provides optional hints, worked steps, or final explanation for the question.",
  template: [
    {
      adaptive: true,
      template: `
<pl-solution-panel>
  <pl-hint level="1">
    Add the two given numbers.
  </pl-hint>

  <pl-hint level="2">
    {{params.a}} + {{params.b}} = {{correct_answers.sum}}
  </pl-hint>
</pl-solution-panel>
      `.trim(),
    },
    {
      adaptive: false,
      template: `
<pl-solution-panel>
  <pl-hint level="1">
    The problem asks for the sum of 2 and 3.
  </pl-hint>

  <pl-hint level="2">
    2 + 3 = 5
  </pl-hint>
</pl-solution-panel>
      `.trim(),
    },
  ],
} satisfies QuestionTemplateFile;

const serverJs = {
  filename: "server.js",
  title: "JavaScript generator",
  type: "javascript",
  required: false,
  isAdaptive: true,
  description:
    "Generates randomized parameters and correct answers for adaptive questions.",
  template: [
    {
      adaptive: true,
      template: `
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
    },
  ],
} satisfies QuestionTemplateFile;

const serverPy = {
  filename: "server.py",
  title: "Python generator",
  type: "python",
  required: false,
  isAdaptive: true,
  description:
    "Alternative Python generator for adaptive parameters and correct answers.",
  template: [
    {
      adaptive: true,
      template: `
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
    },
  ],
} satisfies QuestionTemplateFile;

const imageQuestionHtml = {
  filename: "question.html",
  title: "Image question markup",
  type: "html",
  required: true,
  isAdaptive: false,
  description:
    "Displays an image beside the prompt and captures the student's answer.",
  template: [
    {
      adaptive: false,
      template: `
<pl-question-panel>
  <p>Use the image below to answer the question.</p>
  <img src="image.png" alt="Question reference" />
</pl-question-panel>

<pl-string-input
  answers-name="answer"
  label="Answer"
/>
      `.trim(),
    },
  ],
} satisfies QuestionTemplateFile;

const imageFile = {
  filename: "image.png",
  title: "Reference image",
  type: "image",
  required: false,
  isAdaptive: false,
  description:
    "Placeholder image asset referenced by question.html; replace with the final image file later.",
  template: [
    {
      adaptive: false,
      template: "",
    },
  ],
} satisfies QuestionTemplateFile;

const QuestionTemplates = [
  {
    id: "static-addition",
    title: "Static addition question",
    description:
      "A fixed multiple-choice arithmetic question with no generated parameters.",
    questionData: {
      isAdaptive: false,
      topics: ["static"],
      qType: ["mcq"],
      ai_generated: false,
      title: "Add Numbers MC",
    },
    defaultFiles: ["question.html", "solution.html"],
    files: [staticAdditionQuestionHtml, solutionHtml],
  },
  {
    id: "adaptive-addition",
    title: "Adaptive addition question",
    description:
      "A generated arithmetic question bundled with JavaScript and Python server templates.",
    questionData: {
      isAdaptive: true,
      topics: ["adaptive", "generated-params"],
      qType: ["num"],
      ai_generated: false,
      title: "Add Numbers Adaptive",
    },
    defaultFiles: ["question.html", "solution.html", "server.js"],
    files: [adaptiveAdditionQuestionHtml, solutionHtml, serverJs, serverPy],
  },
  {
    id: "image-question",
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
    files: [imageQuestionHtml, imageFile, solutionHtml],
  },
] satisfies QuestionTemplate[];

type QuestionTemplateId = (typeof QuestionTemplates)[number]["id"];

const TemplateFiles: QuestionFileSpec[] = QuestionTemplates[0].files;

export { QuestionTemplates, TemplateFiles };
export type { QuestionTemplateId };
