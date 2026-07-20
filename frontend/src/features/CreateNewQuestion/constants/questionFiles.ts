export const QuestionFilenames = [
  "question.html",
  "solution.html",
  "server.js",
  "server.py",
  "image.png",
] as const;

export type Filenames = (typeof QuestionFilenames)[number];

export type FileType = "html" | "javascript" | "python" | "image";

export type FileTemplate = {
  adaptive: boolean;
  template: string;
};

export type QuestionFileSpec = {
  filename: Filenames;
  type: FileType;
  required: boolean;
  description: string;
  isAdaptive: boolean;
  template: FileTemplate[];
};

type MainQFile = Required<
  Pick<QuestionFileSpec, "filename" | "required" | "description" | "isAdaptive">
>;
export const MainQuestionFiles: MainQFile[] = [
  {
    filename: "question.html",
    description:
      "Defines the visible question prompt and PrairieLearn elements students interact with.",
    required: true,
    isAdaptive: false,
  },
  {
    filename: "solution.html",
    description:
      "Provides optional hints, worked steps, or explanation shown as the question solution.",
    required: false,
    isAdaptive: false,
  },
  {
    filename: "server.py",
    description:
      "Generates randomized parameters, correct answers, and grading data using Python.",
    required: false,
    isAdaptive: true,
  },
  {
    filename: "server.js",
    description:
      "Generates randomized parameters, correct answers, and grading data using JavaScript.",
    required: false,
    isAdaptive: true,
  },
];
