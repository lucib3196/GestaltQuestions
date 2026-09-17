import type { ReactNode } from "react";

import { useShareQuestionBatch } from "../../hooks/questionAccess";
import {
  type ShareQuestionBatchResult,
  type ShareQuestionsWithUsersPayload,
} from "../../services/Sharing";
import { prepareBatch } from "../../services/Sharing/utils";
import { UserLookupProvider } from "../UserLookUp/instance/context";
import { ResourceSharingForm } from "./ResourceSharing";

/* eslint-disable no-unused-vars */
type QuestionSharingProps = {
  questionIds: string[];
  title?: string;
  shareButtonLabel?: string;
  closeButtonLabel?: string;
  questionPreview?: ReactNode;
  className?: string;
  showCloseButton?: boolean;
  closeOnShare?: boolean;
  onClose?: () => void;
  onShare?: (
    result: ShareQuestionBatchResult,
    payload: ShareQuestionsWithUsersPayload,
  ) => void;
};
/* eslint-enable no-unused-vars */

function QuestionSharingForm({
  questionIds,
  title = "Share Question",
  shareButtonLabel = "Share",
  closeButtonLabel = "Close",
  questionPreview,
  className = "",
  showCloseButton,
  closeOnShare = false,
  onClose,
  onShare,
}: QuestionSharingProps) {
  const { shareQuestionsWithUsers } = useShareQuestionBatch();
  const shouldShowCloseButton = showCloseButton ?? Boolean(onClose);

  return (
    <ResourceSharingForm<
      ShareQuestionBatchResult,
      ShareQuestionsWithUsersPayload
    >
      title={title}
      preview={questionPreview}
      className={className}
      buildPayload={(selectedUsers, accessLevel) =>
        prepareBatch("question_ids", questionIds, selectedUsers, accessLevel)
      }
      shareResource={shareQuestionsWithUsers}
      actions={{
        primaryLabel: shareButtonLabel,
        secondaryLabel: closeButtonLabel,
        disableShare: !questionIds.length,
        onClose: shouldShowCloseButton ? onClose : undefined,
        onShared: onShare,
        afterSuccess: {
          clearUsers: true,
          close: closeOnShare,
        },
      }}
    />
  );
}

export default function QuestionSharing(props: QuestionSharingProps) {
  return (
    <UserLookupProvider>
      <QuestionSharingForm {...props} />
    </UserLookupProvider>
  );
}
