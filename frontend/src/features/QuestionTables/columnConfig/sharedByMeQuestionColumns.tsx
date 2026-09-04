import {
  QuestionAccessLevelsCell,
  QuestionGrantedByCell,
  QuestionGrantedToEmailsCell,
  QuestionSharedAtCell,
} from "../components/cells";
import {
  createQuestionTableColumns,
  type QuestionTableColumnId,
} from "./baseQuestionColumns";
import type {
  QuestionTableColumn,
  SharedByMeQuestionTableSchema,
} from "./types";

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
  access_levels: {
    key: "access_levels",
    label: "Access",
    render: (row) => <QuestionAccessLevelsCell row={row} />,
    defaultVisible: true,
  },
  granted_to_emails: {
    key: "granted_to_emails",
    label: "Members",
    render: (row) => <QuestionGrantedToEmailsCell row={row} />,
    defaultVisible: true,
  },
  granted_by_email: {
    key: "granted_by_email",
    label: "Shared By",
    render: (row) => <QuestionGrantedByCell row={row} />,
    defaultVisible: false,
  },
  shared_at: {
    key: "shared_at",
    label: "Shared",
    render: (row) => <QuestionSharedAtCell row={row} />,
  },
} satisfies Record<string, QuestionTableColumn<SharedByMeQuestionTableSchema>>;

export type SharedByMeQuestionColumnId =
  | QuestionTableColumnId
  | keyof typeof sharedByMeQuestionColumnRegistry;

export function createSharedByMeQuestionTableColumns(): QuestionTableColumn<SharedByMeQuestionTableSchema>[] {
  return [
    ...createQuestionTableColumns<SharedByMeQuestionTableSchema>(
      SHARED_BY_ME_BASE_COLUMN_IDS,
    ),
    sharedByMeQuestionColumnRegistry.access_levels,
    sharedByMeQuestionColumnRegistry.granted_to_emails,
    sharedByMeQuestionColumnRegistry.granted_by_email,
    sharedByMeQuestionColumnRegistry.shared_at,
  ];
}
