// General filenames
// These are the base files needed for most question instances.
export const QuestionFilenames = [
  "question.html",
  "solution.html",
  "server.js",
  "server.py",
] as const;

export type Filename = (typeof QuestionFilenames)[number];
export type QuestionFileLanguage = "html" | "javascript" | "python";
export type QuestionFileKind = "defined" | "uploaded";

export type QuestionFileSpec = {
  filename: Filename;
  content: string;
  required: boolean;
  description: string;
  isAdaptive: boolean;
  language: QuestionFileLanguage;
  mimeType: string;
  kind: QuestionFileKind;
};

export const DefaultQuestionFiles: QuestionFileSpec[] = [
  {
    filename: "question.html",
    content: "",
    description:
      "Defines the visible question prompt and PrairieLearn elements students interact with.",
    required: true,
    isAdaptive: false,
    language: "html",
    mimeType: "text/html",
    kind: "defined",
  },
  {
    filename: "solution.html",
    description:
      "Provides optional hints, worked steps, or explanation shown as the question solution.",
    required: false,
    isAdaptive: false,
    content: "",
    language: "html",
    mimeType: "text/html",
    kind: "defined",
  },
  {
    filename: "server.py",
    description:
      "Generates randomized parameters, correct answers, and grading data using Python.",
    required: false,
    isAdaptive: true,
    content: "",
    language: "python",
    mimeType: "text/x-python",
    kind: "defined",
  },
  {
    filename: "server.js",
    description:
      "Generates randomized parameters, correct answers, and grading data using JavaScript.",
    required: false,
    isAdaptive: true,
    content: "",
    language: "javascript",
    mimeType: "text/javascript",
    kind: "defined",
  },
];
