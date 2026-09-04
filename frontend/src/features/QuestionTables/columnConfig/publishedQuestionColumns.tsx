import { AllowedInstitutions, type ValidInstitutions } from "../../Auth/types";
import {
  QuestionCreatedByCell,
  QuestionInstitutionCell,
} from "../components/cells";
import {
  createQuestionTableColumns,
  questionTableColumnRegistry,
  type QuestionTableColumnId,
} from "./baseQuestionColumns";
import { INSTITUTION_OPTIONS } from "./filterOptions";
import type { QuestionTableColumn, QuestionTableSchema } from "./types";

const PUBLISHED_QUESTION_COLUMN_IDS = [
  "select",
  "title",
  "isAdaptive",
  "status",
  "topics",
  "question_type",
  "available_runtimes",
  "created_at",
] as const satisfies readonly QuestionTableColumnId[];

const publishedQuestionColumnRegistry = {
  institution: {
    key: "institution",
    label: "Institution",
    render: (row) => <QuestionInstitutionCell row={row} />,
    filter: {
      kind: "select",
      label: "Filter institution",
      options: INSTITUTION_OPTIONS,
      toQuery: (value) => ({
        institution: AllowedInstitutions.includes(value as ValidInstitutions)
          ? (value as ValidInstitutions)
          : null,
      }),
    },
  },
  created_by: {
    key: "created_by",
    label: "Created By",
    render: (row) => <QuestionCreatedByCell row={row} />,
  },
} satisfies Record<string, QuestionTableColumn<QuestionTableSchema>>;

export function createAllQuestionTableColumns(): QuestionTableColumn<QuestionTableSchema>[] {
  return [
    ...createQuestionTableColumns<QuestionTableSchema>(
      PUBLISHED_QUESTION_COLUMN_IDS,
      {
        status: {
          filter: questionTableColumnRegistry.status.filter
            ? { ...questionTableColumnRegistry.status.filter, show: false }
            : undefined,
        },
      },
    ),
    publishedQuestionColumnRegistry.institution,
    publishedQuestionColumnRegistry.created_by,
  ];
}
