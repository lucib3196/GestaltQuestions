export type QuestionValues = Record<string, string | number | string[]>;

export type QuestionParams = {
  params: QuestionValues;
  correct_answers: QuestionValues;
};

export type QuizData = QuestionParams & {
  nDigits: number;
  sigfigs: number;
  logs?: string[];
};
