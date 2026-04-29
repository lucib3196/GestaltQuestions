import { useEffect, useState } from "react";
import { useAuth } from "../Auth"
import { QuestionBuilderAPI } from "./questionBuilderApi";
import { type QuestionRead } from "./types";

export function useMyQuestions() {
    const { user } = useAuth();
    const [questions, setQuestions] = useState<QuestionRead[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function run() {
            if (!user) {
                setQuestions([]);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const token = await user.getIdToken();
                const data = await QuestionBuilderAPI.listMyQuestions(token);
                if (!cancelled) setQuestions(data);
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load questions");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        run();

        return () => {
            cancelled = true;
        };
    }, [user]);

    return { questions, loading, error };
}