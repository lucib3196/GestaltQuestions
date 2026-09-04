import type { QuestionRuntimeLanguage } from "../../../services";
import { AllowedInstitutions, type ValidInstitutions } from "../../Auth/types";

type FilterOption<T extends string> = { label: string; value: T };

export const RUNTIME_OPTIONS = [
  { label: "JavaScript", value: "javascript" },
  { label: "Python", value: "python" },
] satisfies FilterOption<QuestionRuntimeLanguage>[];

export const RUNTIME_VALUES = RUNTIME_OPTIONS.map(
  (option) => option.value,
) as QuestionRuntimeLanguage[];

export const INSTITUTION_OPTIONS = AllowedInstitutions.map((institution) => ({
  label: institution,
  value: institution,
})) satisfies FilterOption<ValidInstitutions>[];
