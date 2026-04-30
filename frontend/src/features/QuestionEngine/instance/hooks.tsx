import { useEffect } from "react";
import type { ServerSettings } from "../../QuestionBuilder/components/ServerToggle";
import { QuestionRunnerApi } from "../runtime/questionRuntimeApi";
import { useQuestionInstance } from "./context";

export function useLoadQuestionRuntime(
    questionId: string | null,
    serverMode: ServerSettings,
    refreshKey: number = 0,
) {
    const startLoading = useQuestionInstance((s) => s.startLoading);
    const setRuntimeContent = useQuestionInstance((s) => s.setRunTimeContent); // Initially all values are null
    const setError = useQuestionInstance((s) => s.setError);

    useEffect(() => {
        let cancelled = false;
        if (!questionId) {
            setError(null);
            return;
        }
        startLoading();
        const run = async () => {
            try {
                const data = await QuestionRunnerApi.runQuestion(
                    questionId,
                    serverMode,
                );
                if (!cancelled) {
                    setRuntimeContent(data); // stores instance, html, quiz_data, logs, etc.
                }
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : String(err);
                    setError(message);
                }
            }
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [
        questionId,
        serverMode,
        refreshKey,
        startLoading,
        setRuntimeContent,
        setError,
    ]);
}

// Backward-compatible alias
export const useRunQuestion = useLoadQuestionRuntime;
