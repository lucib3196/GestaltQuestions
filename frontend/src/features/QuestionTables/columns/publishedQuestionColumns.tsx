import { AllowedInstitutions, type ValidInstitutions } from "../../Auth/types";
import {
  QuestionCreatedByCell,
  QuestionInstitutionCell,
} from "../components/cells";
import { createBaseQuestionTableColumns } from "./baseQuestionColumns";
import { INSTITUTION_OPTIONS } from "./filterOptions";
import type { QuestionColumnKey, QuestionTableColumn } from "./types";

type ExcludedColumns = QuestionColumnKey[];

export function createAllQuestionTableColumns(): QuestionTableColumn[] {
  const baseColumns = createBaseQuestionTableColumns();
  const excludedColumns: ExcludedColumns = ["status"];
  const columns = baseColumns.map((column) =>
    excludedColumns.includes(column.key)
      ? {
          ...column,
          defaultVisible: true,
          filter: column.filter ? { ...column.filter, show: false } : undefined,
        }
      : column,
  );

  return [
    ...columns,
    {
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
    {
      key: "created_by",
      label: "Created By",
      render: (row) => <QuestionCreatedByCell row={row} />,
    },
  ];
}
