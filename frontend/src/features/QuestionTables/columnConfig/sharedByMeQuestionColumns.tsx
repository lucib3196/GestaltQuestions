import {
  QuestionAccessLevelCell,
  QuestionGrantedByCell,
  QuestionGrantedToCell,
  QuestionSharedAtCell,
} from "../components/cells";
import {
  createQuestionTableColumns,
  type QuestionTableColumnId,
} from "./baseQuestionColumns";
import type { QuestionTableColumn, SharedQuestionTableSchema } from "./types";

const SHARED_BY_ME_BASE_COLUMN_IDS = [
  "select",
  "title",
  "isAdaptive",
  "status",
  "topics",
  "question_type",
  "available_runtimes",
  "created_at",
  "updated_at",
] as const satisfies readonly QuestionTableColumnId[];

const sharedByMeQuestionColumnRegistry = {
  access_level: {
    key: "access_level",
    label: "Access",
    render: (row) => <QuestionAccessLevelCell row={row} />,
  },
  granted_to_email: {
    key: "granted_to_email",
    label: "Shared With",
    render: (row) => <QuestionGrantedToCell row={row} />,
  },
  granted_by_email: {
    key: "granted_by_email",
    label: "Shared By",
    render: (row) => <QuestionGrantedByCell row={row} />,
  },
  shared_at: {
    key: "shared_at",
    label: "Shared",
    render: (row) => <QuestionSharedAtCell row={row} />,
  },
} satisfies Record<string, QuestionTableColumn<SharedQuestionTableSchema>>;

export type SharedByMeQuestionColumnId =
  | QuestionTableColumnId
  | keyof typeof sharedByMeQuestionColumnRegistry;

export function createSharedByMeQuestionTableColumns(): QuestionTableColumn<SharedQuestionTableSchema>[] {
  return [
    ...createQuestionTableColumns<SharedQuestionTableSchema>(
      SHARED_BY_ME_BASE_COLUMN_IDS,
    ),
    sharedByMeQuestionColumnRegistry.access_level,
    sharedByMeQuestionColumnRegistry.granted_to_email,
    sharedByMeQuestionColumnRegistry.granted_by_email,
    sharedByMeQuestionColumnRegistry.shared_at,
  ];
}
