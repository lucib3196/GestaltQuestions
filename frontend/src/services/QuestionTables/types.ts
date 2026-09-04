import type { ValidInstitutions } from "../../features/Auth/types";
import type { QuestionStatus, QuestionType } from "../../types/questionTypes";
import type { QuestionRuntimeLanguage } from "../QuestionRuntime";

export type { QuestionType };

export type QuestionTableSearchParamsBase = {
  search?: string | null;
  status?: QuestionStatus | null;
  qtype?: QuestionType | QuestionType[] | null;
  topic?: string | null;
  language?: QuestionRuntimeLanguage | QuestionRuntimeLanguage[] | null;
  isAdaptive?: boolean | null;
  limit?: number;
  offset?: number;
};

export type QuestionTableSearchParams = QuestionTableSearchParamsBase & {
  institution?: ValidInstitutions | null;
  published?: boolean | null;
  collection_id?: string | null;
  collection_title?: string | null;
};

export type QuestionTableRowBase = {
  question_id: string;
  title: string | null;
  isAdaptive: boolean;
  status: QuestionStatus | string;
  topics: (string | null)[] | null;
  question_type: (QuestionType | null)[] | null;
  available_runtimes: (QuestionRuntimeLanguage | null)[] | null;
  created_at: string | null;
  updated_at: string | null;
};

export type SharedQuestionTableRow = QuestionTableRowBase & {
  access_level: string;
  granted_by_email: string | null;
  granted_to_email?: string | null;
  shared_at: string;
};

export type QuestionTableRow = QuestionTableRowBase & {
  user_id: string;
  developer_profile_id: string;
  title: string;
  institution_id: string;
  institution: string | ValidInstitutions;
  created_by: string;
  question_type: (QuestionType | string | null)[];
  available_runtimes: (QuestionRuntimeLanguage | string)[];
  collection_id: string | null;
  collection_title: string | null;
};
