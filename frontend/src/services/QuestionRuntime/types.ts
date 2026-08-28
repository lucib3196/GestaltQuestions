import type { QuestionRead } from "../../types/questionTypes";

export type QuestionRuntimeLanguage = "javascript" | "python" | "static";

export type RuntimeConfigSource = "manual" | "config_file" | "inferred";

export type QuestionValue = string | number | string[] | boolean | null;

export type QuestionAnswerMap = Record<string, QuestionValue>;

export type QuizData = {
  params: QuestionAnswerMap;
  correct_answers: QuestionAnswerMap;
  sigfigs?: number;
  nDigits?: number;
  logs?: string[];
};

export type QuestionRuntimeCreateRequest = {
  language: QuestionRuntimeLanguage;
  entry: string;
  func_name?: string;
  is_default?: boolean;
  enabled?: boolean;
  source?: RuntimeConfigSource;
};

export type QuestionRuntimeResponse = {
  id: string;
  question_id: string;
  language: QuestionRuntimeLanguage;
  entry: string;
  func_name: string;
  is_default: boolean;
  enabled: boolean;
  source: RuntimeConfigSource;
};

export type QuestionRunResponse = {
  instance: string;
  qmeta: QuestionRead;
  question_html: string;
  solution_html?: string | null;
  logs: string[];
  quiz_data?: QuizData | null;
};
