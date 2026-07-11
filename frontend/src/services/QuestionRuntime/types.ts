export type QuestionRuntimeLanguage = "javascript" | "python";

export type RuntimeConfigSource = "manual" | "config_file" | "inferred";

export type QuestionRunValue = string | number | string[] | boolean | null;

export type QuestionRunAnswerMap = Record<string, QuestionRunValue>;

export type QuestionRunQuizData = {
  params: QuestionRunAnswerMap;
  correct_answers: QuestionRunAnswerMap;
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
  question_html: string;
  solution_html?: string | null;
  logs: string[];
  quiz_data?: QuestionRunQuizData | null;
};
