export type QuestionRunTimeResponse = {
  question_html: string;
  solution_html?: string;
  logs?: string[];
};

export type QuestionValues = Record<
  string,
  string | number | string[] | boolean | null
>;

export type QuestionParams = {
  params: QuestionValues;
  correct_answers: QuestionValues;
  sigfigs?: number;
};

export type QuizData = QuestionParams & {
  nDigits?: number;
  sigfigs?: number;
  logs?: string[];
};
