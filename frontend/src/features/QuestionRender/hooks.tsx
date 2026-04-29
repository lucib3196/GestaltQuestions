import { useEffect, useState } from "react";
import type { ServerSettings } from "../QuestionBuilder/components/ServerToggle";
import { QuestionRunnerApi } from "./api";
import type { QuestionRunTimeResponse } from "./types";

export function useQuestionRuntimeContent(
    questionId: string | null,
    serverMode: ServerSettings,
    refreshKey: number = 0
) {
    const [runtimeContent, setRuntimeContent] = useState<QuestionRunTimeResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isCancelled = false;

        if (!questionId) {
            setRuntimeContent(null);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        const fetchRuntimeContent = async () => {
            try {
                const data = await QuestionRunnerApi.runQuestion(questionId, serverMode);
                if (!isCancelled) {
                    setRuntimeContent(data);
                }
            } catch (err) {
                if (!isCancelled) {
                    const message = err instanceof Error ? err.message : String(err);
                    setError(message);
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        fetchRuntimeContent();

        return () => {
            isCancelled = true;
        };
    }, [questionId, serverMode, refreshKey]);

    return { runtimeContent, loading, error };
}

// Backward-compatible alias
export const useRunQuestion = useQuestionRuntimeContent;
