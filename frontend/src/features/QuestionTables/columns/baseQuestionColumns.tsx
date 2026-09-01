import {
  QUESTION_STATUS_OPTIONS,
  QUESTION_TYPE_OPTIONS,
  QUESTION_TYPE_VALUES,
  type QuestionStatus,
} from "../../../types/questionTypes";
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
import { QuestionSelectHeaderCell } from "../components/headers";
import { RUNTIME_OPTIONS, RUNTIME_VALUES } from "./filterOptions";
import { selectedOptions } from "./filterUtils";
import type { QuestionTableColumn } from "./types";

export function createBaseQuestionTableColumns(): QuestionTableColumn[] {
  return [
    {
      key: "select",
      label: "Select",
      defaultVisible: true,
      render: (row, onSelect, isSelected) => (
        <QuestionSelectCell
          row={row}
          checked={isSelected}
          onSelect={onSelect}
        />
      ),
      headerRender: (context) => <QuestionSelectHeaderCell {...context} />,
    },
    {
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
    {
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
    {
      key: "status",
      label: "Status",
      defaultVisible: true,
      render: (row) => <QuestionStatusCell row={row} />,
      filter: {
        kind: "select",
        label: "filter-select",
        options: QUESTION_STATUS_OPTIONS,
        toQuery: (value) => ({
          status: QUESTION_STATUS_OPTIONS.some(
            (option) => option.value === value,
          )
            ? (value as QuestionStatus)
            : null,
        }),
      },
    },
    {
      key: "topics",
      label: "Topics",
      defaultVisible: true,
      render: (row) => <QuestionTopicsCell row={row} />,
      filter: {
        kind: "text",
        label: "Filter topics",
        toQuery: (value) => ({
          topic:
            typeof value === "string" && value.trim() ? value.trim() : null,
        }),
      },
    },
    {
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
    {
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
    {
      key: "created_at",
      label: "Created",
      render: (row) => <QuestionCreatedAtCell row={row} />,
    },
  ];
}
