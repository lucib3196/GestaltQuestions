/* eslint-disable react-refresh/only-export-components */
import type { QuestionCreate } from "../../../types/questionTypes";

export type QuestionTemplateFile = {
  filename: string;
  description: string;
  mimeType: string;
  content: string;
  assetUrl?: string;
};

export type QuestionTemplateId =
  | "numerical"
  | "static-question"
  | "incline-plane-static"
  | "incline-plane-numeric";

export type QuestionTemplateName =
  | "Addition Adaptive Question"
  | "Static Addition"
  | "Incline plane concept"
  | "Incline plane components";

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

const inclinePlaneStaticQuestionHtml = {
  filename: "question.html",
  mimeType: "text/html",
  description:
    "Asks students to interpret the weight decomposition shown on an incline plane diagram.",
  content: `
<pl-question-panel>
  <p>
    The diagram shows a block on an incline. The weight force $mg$ is drawn
    vertically downward, while two components are labeled $mg\\sin(\\theta)$
    and $mg\\cos(\\theta)$.
  </p>

  <p>
    Why is the weight split into these two components?
  </p>

  <p>
    <pl-figure src="image.png" alt="Block on an incline with weight components labeled" />
  </p>
</pl-question-panel>

<pl-multiple-choice answers-name="reason">
  <pl-answer correct="false">
    The force of gravity changes direction when the block is placed on the incline.
  </pl-answer>
  <pl-answer correct="true">
    The weight is decomposed into components parallel and perpendicular to the incline.
  </pl-answer>
  <pl-answer correct="false">
    The normal force is always equal to $mg$, so the extra components cancel it.
  </pl-answer>
  <pl-answer correct="false">
    The angle of the ramp creates two different gravitational forces.
  </pl-answer>
</pl-multiple-choice>
  `.trim(),
} satisfies QuestionTemplateFile;

const inclinePlaneNumericQuestionHtml = {
  filename: "question.html",
  mimeType: "text/html",
  description:
    "Asks students to calculate the parallel and perpendicular components of weight.",
  content: `
<pl-question-panel>
  <p>
    A block with mass $\{{params.mass}}$, $\\text{kg}$ rests on an incline at
    $\{{params.theta}}^\\circ$. Use $g = {{params.g}}$, $\\text{m/s}^2$.
  </p>

  <p>
    <pl-figure src="image.png" alt="Block on an incline with weight components labeled" />
  </p>

  <p>
    Calculate the component of the block's weight parallel to the incline,
    $mg\\sin(\\theta)$, and perpendicular to the incline,
    $mg\\cos(\\theta)$.
  </p>
</pl-question-panel>
<div>
  <pl-number-input
    answers-name="parallel"
    label="Parallel component, $mg \\sin(\\theta)$"
    suffix="N"
  />
</div>

<pl-number-input
  answers-name="perpendicular"
  label="Perpendicular component, $mg \\cos(\\theta)$"
  suffix="N"
/>
  `.trim(),
} satisfies QuestionTemplateFile;

const inclinePlaneServerJs = {
  filename: "server.js",
  mimeType: "text/javascript",
  description:
    "Generates randomized mass and angle values for incline-plane weight components.",
  content: `
const generate = () => {
  const mass = 2 + Math.floor(Math.random() * 9);
  const theta = 20 + Math.floor(Math.random() * 31);
  const g = 9.8;
  const radians = theta * Math.PI / 180;

  return {
    params: { mass, theta, g },
    correct_answers: {
      parallel: mass * g * Math.sin(radians),
      perpendicular: mass * g * Math.cos(radians),
    },
  };
};

module.exports = { generate };
  `.trim(),
} satisfies QuestionTemplateFile;

const inclinePlaneServerPy = {
  filename: "server.py",
  mimeType: "text/x-python",
  description:
    "Python version of the randomized incline-plane weight component generator.",
  content: `
import math
import random

def generate():
    mass = random.randint(2, 10)
    theta = random.randint(20, 50)
    g = 9.8
    radians = math.radians(theta)

    return {
        "params": {
            "mass": mass,
            "theta": theta,
            "g": g,
        },
        "correct_answers": {
            "parallel": mass * g * math.sin(radians),
            "perpendicular": mass * g * math.cos(radians),
        },
    }
  `.trim(),
} satisfies QuestionTemplateFile;

const imageFile = {
  filename: "image.png",
  mimeType: "image/png",
  description: "Incline plane diagram referenced by the question prompt.",
  content: "",
  assetUrl: "/incline_plane_asset.png",
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
    files: [
      adaptiveAdditionQuestionHtml,
      adaptiveSolutionHtml,
      serverJs,
      serverPy,
    ],
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
  "incline-plane-static": {
    id: "incline-plane-static",
    name: "Incline plane concept",
    title: "Incline plane concept",
    description:
      "A conceptual multiple-choice question about decomposing weight on an incline.",
    questionData: {
      isAdaptive: false,
      topics: ["incline-plane", "forces", "components"],
      qType: ["mcq"],
      ai_generated: false,
      title: "Incline Plane Weight Components",
    },
    defaultFiles: ["question.html", "image.png"],
    files: [inclinePlaneStaticQuestionHtml, imageFile],
  },
  "incline-plane-numeric": {
    id: "incline-plane-numeric",
    name: "Incline plane components",
    title: "Incline plane components",
    description:
      "A numeric incline-plane question with JavaScript and Python generators.",
    questionData: {
      isAdaptive: true,
      topics: ["incline-plane", "forces", "trigonometry"],
      qType: ["num"],
      ai_generated: false,
      title: "Calculate Incline Plane Weight Components",
    },
    defaultFiles: ["question.html", "image.png", "server.js", "server.py"],
    files: [
      inclinePlaneNumericQuestionHtml,
      imageFile,
      inclinePlaneServerJs,
      inclinePlaneServerPy,
    ],
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
