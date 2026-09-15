import {
  isStatus,
  normalizeStatus,
  STATUS_OPTIONS,
  STATUS_VALUES,
  type Status,
} from "../Status";

export const QUESTION_STATUS_VALUES = STATUS_VALUES;
export const QUESTION_STATUS_OPTIONS = STATUS_OPTIONS;
export type QuestionStatus = Status;
export const isQuestionStatus = isStatus;
export const normalizeQuestionStatus = normalizeStatus;
export const QUESTION_TYPE_VALUES = [
  "mc",
  "mcq",
  "ma",
  "tf",
  "fb",
  "num",
  "parsons",
  "multi",
] as const;

export type QuestionType = (typeof QUESTION_TYPE_VALUES)[number];

export const QUESTION_TYPE_OPTIONS: {
  label: string;
  value: QuestionType;
}[] = [
  { label: "Multiple Choice", value: "mc" },
  { label: "Multiple Choice Question", value: "mcq" },
  { label: "Multiple Answer", value: "ma" },
  { label: "True / False", value: "tf" },
  { label: "Fill in the Blank", value: "fb" },
  { label: "Numerical", value: "num" },
  { label: "Parsons", value: "parsons" },
  { label: "Multi", value: "multi" },
];

export function isQuestionType(value: string): value is QuestionType {
  return QUESTION_TYPE_VALUES.includes(value.toLowerCase() as QuestionType);
}

export function normalizeQuestionTypes(
  values: readonly string[],
): QuestionType[] {
  return values.map((value) => value.toLowerCase()).filter(isQuestionType);
}

export type QuestionRead = {
  id: string;
  title: string | null;
  ai_generated: boolean;
  isAdaptive: boolean;
  storage_path: string | null;
  storage_type: string;
  status: QuestionStatus;
  created_by_id: string | null;
  topics: string[];
  qType: QuestionType[];
};

export type QuestionFilter = {
  title?: string;
  status?: QuestionStatus | null;
};
