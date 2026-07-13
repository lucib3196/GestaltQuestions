import { useCallback, useState } from "react";
import type { QuestionUpdate } from "../../QuestionBuilder";
import { useAuth } from "../../Auth";
import QuestionBuilderAPI from "../../QuestionBuilder/questionBuilderApi";
import { toast } from "react-toastify"


export function useUpdateQuestion() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const updateQuestion = useCallback(
        async (questionId: string, payload: QuestionUpdate) => {
            setLoading(true);
            setError(null);

            if (!user) {
                setError("You must be signed in to update questions.");
                setLoading(false);
                return;
            }

            try {
                const token = await user.getIdToken();
                const updated = await QuestionBuilderAPI.updateQuestion(
                    token,
                    questionId,
                    payload,
                );

                return updated;
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to update question",
                );
                toast.error(error)
            } finally {
                setLoading(false);
            }
        },
        [user],
    );

    return { updateQuestion, loading, error };
}