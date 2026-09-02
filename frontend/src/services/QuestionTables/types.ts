import type { ValidInstitutions } from "../../features/Auth/types";
import type { QuestionStatus, QuestionType } from "../../types/questionTypes";
import type { QuestionRuntimeLanguage } from "../QuestionRuntime";

export type { QuestionType };

export type QuestionTableSearchParams = {
  search?: string | null;
  status?: QuestionStatus | null;
  qtype?: QuestionType | QuestionType[] | null;
  topic?: string | null;
  language?: QuestionRuntimeLanguage | QuestionRuntimeLanguage[] | null;
  institution?: ValidInstitutions | null;
  collection_id?: string | null;
  collection_title?: string | null;
  isAdaptive?: boolean | null;
  limit?: number;
  offset?: number;
};

export type QuestionTableRow = {
  question_id: string;
  user_id: string;
  developer_profile_id: string;
  title: string;
  institution_id: string;
  institution: string | ValidInstitutions;
  created_by: string;
  status: QuestionStatus | string;
  topics: string[];
  question_type: QuestionType[];
  available_runtimes: QuestionRuntimeLanguage[];
  collection_id?: string | null;
  collection_title?: string | null;
  created_at: string;
  updated_at: string | null;
  isAdaptive: boolean | null;
};

export type SharedQuestionTableRow = QuestionTableRow & {
  access_level: string;
  granted_by_id: string | null;
  granted_by_email?: string | null;
  shared_at: string;
};
