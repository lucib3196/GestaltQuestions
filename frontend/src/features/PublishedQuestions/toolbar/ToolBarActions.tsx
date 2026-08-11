import { useCopyQuestion } from "../../QuestionBuilder/hooks";
import { useDownloadQuestions } from "../../QuestionBuilder/hooks";
import { ClearTableFilters } from "../../QuestionTables/components/tableFilters/ClearTableFilters";
import { ToolBarActions } from "../../QuestionTables";
import {
  type BaseQuestionTableToolbarActionId,
  BASE_QUESTION_TABLE_TOOLBAR_ACTIONS,
} from "../../QuestionTables/components/toolbar/constants";
import { useQuestionTableContext } from "../../QuestionTables";
import { QuestionTableFilterPanel } from "../../QuestionTables";
type PopUpId = Extract<BaseQuestionTableToolbarActionId, "tableFilters">;
type Props = {
  popUp: PopUpId | null;
  onOpenPopUp: (id: PopUpId | null) => void;
};

export default function PublishedToolBarActions({ popUp, onOpenPopUp }: Props) {
  const selectedQuestionIds = useQuestionTableContext((s) => s.selectedIDs);
  const hasSelection = selectedQuestionIds.length > 0;
  const cols = useQuestionTableContext((s) => s.columns);

  const { copyQuestion } = useCopyQuestion();
  const { downLoadQuestions } = useDownloadQuestions();

  const actionHandlers: Record<BaseQuestionTableToolbarActionId, () => void> = {
    copy: async () => copyQuestion(selectedQuestionIds),
    download: async () => downLoadQuestions(selectedQuestionIds),

    tableFilters: () => onOpenPopUp("tableFilters"),
  };

  return (
    <div className="flex w-full flex-col gap-3 pt-3 md:flex-row  md:justify-between items-baseline">
      <ToolBarActions
        actionHandlers={actionHandlers}
        actions={BASE_QUESTION_TABLE_TOOLBAR_ACTIONS}
        isActionDisabled={(action) =>
          Boolean(action.requiresSelection && !hasSelection)
        }
        variant="inline"
        renderActionPopup={(action) => {
          if (popUp === "tableFilters" && action.id === "tableFilters") {
            return (
              <div className="absolute left-0 top-full z-20 mt-2 w-64">
                <QuestionTableFilterPanel columns={cols} />
              </div>
            );
          }

          return null;
        }}
      />
      <ClearTableFilters />
    </div>
  );
}
