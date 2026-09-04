import {
  QUESTION_STATUS_OPTIONS,
  QUESTION_TYPE_OPTIONS,
  QUESTION_TYPE_VALUES,
  type QuestionStatus,
} from "../../../types/questionTypes";
import { TableSelectHeaderCell } from "../../TableBase/components/headers";
import {
  QuestionAdaptiveCell,
  QuestionCreatedAtCell,
  QuestionRuntimesCell,
  QuestionSelectCell,
  QuestionStatusCell,
  QuestionTitleCell,
  QuestionTopicsCell,
  QuestionTypesCell,
} from "../components/cells";
import { RUNTIME_OPTIONS, RUNTIME_VALUES } from "./filterOptions";
import { selectedOptions } from "./filterUtils";
import type { QuestionTableBaseSchema, QuestionTableColumn } from "./types";

const BASE_QUESTION_COLUMN_IDS = [
  "select",
  "title",
  "isAdaptive",
  "status",
  "topics",
  "question_type",
  "available_runtimes",
  "created_at",
  "updated_at",
] as const;

export const questionTableColumnRegistry = {
  select: {
    key: "select",
    label: "Select",
    defaultVisible: true,
    render: (row, onSelect, isSelected) => (
      <QuestionSelectCell row={row} checked={isSelected} onSelect={onSelect} />
    ),
    headerRender: (context) => <TableSelectHeaderCell {...context} />,
  },
  title: {
    key: "title",
    label: "Title",
    defaultVisible: true,
    render: (row, onSelect, isSelected) => (
      <QuestionTitleCell
        row={row}
        isSelected={isSelected ?? false}
        onSelect={onSelect ? onSelect : () => {}}
      />
    ),
  },
  isAdaptive: {
    key: "isAdaptive",
    label: "Adaptive",
    render: (row) => <QuestionAdaptiveCell row={row} />,
    filter: {
      kind: "booleanToggle",
      label: "Filter adaptive questions",
      toQuery: (value) => ({
        isAdaptive: typeof value === "boolean" ? value : null,
      }),
    },
  },
  status: {
    key: "status",
    label: "Status",
    defaultVisible: true,
    render: (row) => <QuestionStatusCell row={row} />,
    filter: {
      kind: "select",
      label: "filter-select",
      options: QUESTION_STATUS_OPTIONS,
      toQuery: (value) => ({
        status: QUESTION_STATUS_OPTIONS.some((option) => option.value === value)
          ? (value as QuestionStatus)
          : null,
      }),
    },
  },
  topics: {
    key: "topics",
    label: "Topics",
    defaultVisible: true,
    render: (row) => <QuestionTopicsCell row={row} />,
    filter: {
      kind: "text",
      label: "Filter topics",
      toQuery: (value) => ({
        topic: typeof value === "string" && value.trim() ? value.trim() : null,
      }),
    },
  },
  question_type: {
    key: "question_type",
    label: "Type",
    defaultVisible: true,
    render: (row) => <QuestionTypesCell row={row} />,
    filter: {
      kind: "multiSelect",
      label: "Filter question type",
      options: QUESTION_TYPE_OPTIONS,
      toQuery: (value) => ({
        qtype: selectedOptions(value, QUESTION_TYPE_VALUES),
      }),
    },
  },
  available_runtimes: {
    key: "available_runtimes",
    label: "Runtimes",
    defaultVisible: false,
    render: (row) => <QuestionRuntimesCell row={row} />,
    filter: {
      kind: "multiSelect",
      label: "Filter runtimes",
      options: RUNTIME_OPTIONS,
      toQuery: (value) => ({
        language: selectedOptions(value, RUNTIME_VALUES),
      }),
    },
  },
  created_at: {
    key: "created_at",
    label: "Created",
    render: (row) => <QuestionCreatedAtCell row={row} />,
  },
  updated_at: {
    key: "updated_at",
    label: "Updated",
    render: (row) => <QuestionCreatedAtCell row={row} />,
  },
} satisfies Record<string, QuestionTableColumn>;

export type QuestionTableColumnId = keyof typeof questionTableColumnRegistry;

type QuestionTableColumnOverrides = Partial<
  Record<QuestionTableColumnId, Partial<QuestionTableColumn>>
>;

export function createQuestionTableColumns<
  Schema extends QuestionTableBaseSchema = QuestionTableBaseSchema,
>(
  columnIds: readonly QuestionTableColumnId[],
  overrides: QuestionTableColumnOverrides = {},
): QuestionTableColumn<Schema>[] {
  return columnIds.map((columnId) => ({
    ...questionTableColumnRegistry[columnId],
    ...overrides[columnId],
  })) as QuestionTableColumn<Schema>[];
}

export function createBaseQuestionTableColumns(): QuestionTableColumn[] {
  return createQuestionTableColumns(BASE_QUESTION_COLUMN_IDS);
}

