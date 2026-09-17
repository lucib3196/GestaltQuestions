import type { QuestionStatus, QuestionType } from "../Questions";

export type DeveloperQuestionCreate = {
  id?: string | null;
  title: string;
  status?: QuestionStatus;
  ai_generated?: boolean;
  isAdaptive?: boolean;
  topics?: string[];
  qType?: QuestionType[];
};

export type DeveloperQuestionUpdate = {
  title?: string;
  ai_generated?: boolean;
  isAdaptive?: boolean;
  topics?: string[];
  qType?: string[];
  status?: QuestionStatus | null;
};

export type LegacyQuestionAllRow = {
  title: string;
  question_id: string;
  isAdaptive: boolean;
  ai_generated: boolean;
  status: QuestionStatus;
  user_id: string;
  created_by: string | null;
  institution: string;
};

export type QuestionFileList = string[];
export type QuestionDeleteResponse = boolean;
