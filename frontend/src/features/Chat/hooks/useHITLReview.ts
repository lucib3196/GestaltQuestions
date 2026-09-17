import type { HITLRequest, HITLResponse } from "langchain";
import { useCallback, useMemo, useState } from "react";

// eslint-disable-next-line no-unused-vars
type SubmitHITLResume = (_resume: HITLResponse) => Promise<unknown> | unknown;

export function useHITLReview({
  interruptValue,
  submitResume,
}: {
  interruptValue: unknown;
  submitResume: SubmitHITLResume;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const hitlRequest = interruptValue as HITLRequest | undefined;

  const actionRequests = useMemo(
    () => hitlRequest?.actionRequests ?? [],
    [hitlRequest],
  );

  const reviewConfigs = useMemo(
    () => hitlRequest?.reviewConfigs ?? [],
    [hitlRequest],
  );

  const handleApprove = useCallback(
    async (index: number) => {
      if (!hitlRequest) return;
      setIsProcessing(true);
      try {
        // Appends all the action request and approves the selected one
        await submitResume({
          decisions: actionRequests.map((_, i) =>
            i === index
              ? {
                  type: "approve",
                }
              : {
                  type: "reject",
                  message: "Rejected along with other actions",
                },
          ),
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [actionRequests, hitlRequest, submitResume],
  );

  const handleReject = useCallback(
    async (index: number, reason: string) => {
      if (!hitlRequest) return;
      setIsProcessing(true);
      try {
        await submitResume({
          decisions: actionRequests.map((_, i) =>
            i === index
              ? {
                  type: "reject",
                  message: reason || "User rejected",
                }
              : {
                  type: "reject",
                  message: "Rejected along with other actions",
                },
          ),
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [hitlRequest, actionRequests, submitResume],
  );

  const handleEdit = useCallback(
    async (index: number, editedArgs: Record<string, unknown>) => {
      if (!hitlRequest) return;

      const originalAction = actionRequests[index];
      if (!originalAction) return;

      setIsProcessing(true);

      try {
        await submitResume({
          decisions: actionRequests.map((_, i) =>
            i === index
              ? {
                  type: "edit",
                  editedAction: {
                    name: originalAction.name,
                    args: editedArgs,
                  },
                }
              : {
                  type: "approve",
                },
          ),
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [actionRequests, hitlRequest, submitResume],
  );

  return {
    hitlRequest,
    actionRequests,
    reviewConfigs,
    isProcessing,
    handleApprove,
    handleReject,
    handleEdit,
  };
}
