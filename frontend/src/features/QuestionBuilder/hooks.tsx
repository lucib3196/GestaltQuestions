import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../Auth";
import { QuestionBuilderAPI } from "./questionBuilderApi";
import { type QuestionRead } from "./types";
import { type FileData } from "../../types/fileTypes";

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
                if (!cancelled) {
                    setError(
                        err instanceof Error ? err.message : "Failed to load questions",
                    );
                }
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

export function useQuestionFileData(qid: string) {
    const { user } = useAuth();
    const [fileData, setFileData] = useState<FileData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function run() {
            if (!user) {
                setFileData([]);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const token = await user.getIdToken();
                const data = await QuestionBuilderAPI.getQuestionFileData(token, qid);
                if (!cancelled) setFileData(data);
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load question files",
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        run();

        return () => {
            cancelled = true;
        };
    }, [user, qid]);

    return { fileData, loading, error };
}

export function useSaveFile(onRefresh?: () => void) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const saveFile = useCallback(
        async (questionId: string, filename: string, content: unknown) => {
            setLoading(true);
            setError(null);

            if (!user) {
                setError("You must be signed in to save files.");
                setLoading(false);
                return;
            }

            try {
                const token = await user.getIdToken();
                await QuestionBuilderAPI.writeFile(
                    token,
                    questionId,
                    filename,
                    content,
                );
                onRefresh?.();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to save file");
            } finally {
                setLoading(false);
            }
        },
        [user, onRefresh],
    );

    return { saveFile, loading, error };
}

export function useCreateFile(onRefresh?: () => void) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const createFile = useCallback(
        async (questionId: string, filename: string, initialContent = "") => {
            setLoading(true);
            setError(null);

            if (!user) {
                setError("You must be signed in to create files.");
                setLoading(false);
                return;
            }

            try {
                const token = await user.getIdToken();
                await QuestionBuilderAPI.writeFile(
                    token,
                    questionId,
                    filename,
                    initialContent,
                );
                onRefresh?.();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to create file");
            } finally {
                setLoading(false);
            }
        },
        [user, onRefresh],
    );

    return { createFile, loading, error };
}

export function useDeleteFile(onRefresh?: () => void) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const deleteFile = useCallback(
        async (questionId: string, filename: string) => {
            setLoading(true);
            setError(null);

            if (!user) {
                setError("You must be signed in to upload files.");
                setLoading(false);
                return;
            }

            try {
                const token = await user.getIdToken();
                await QuestionBuilderAPI.deleteFile(token, questionId, filename);
                onRefresh?.();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to delete file");
            } finally {
                setLoading(false);
            }
        },
        [user, onRefresh],
    );

    return { deleteFile, loading, error };
}

export function useUploadFile(onRefresh?: () => void) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const uploadFile = useCallback(
        async (questionId: string, files: File[]) => {
            setLoading(true);
            setError(null);

            if (!user) {
                setError("You must be signed in to delete files.");
                setLoading(false);
                return;
            }

            try {
                const token = await user.getIdToken();
                await QuestionBuilderAPI.uploadFiles(token, questionId, files);
                console.log("Uploaded files")
                onRefresh?.();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to upload file");
            } finally {
                setLoading(false);
            }
        },
        [user, onRefresh],
    );
    return { uploadFile, loading, error };
}



export function useQuestionMetadata(qid: string | null | undefined) {
    const [loading, setLoading] = useState(false);
    const [questionMetadata, setQuestionMetadata] = useState<QuestionRead | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        let cancelled = false;

        async function fetch() {
            if (!user || !qid) {
                if (!cancelled) {
                    setQuestionMetadata(null);
                    setError(null);
                    setLoading(false);
                }
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const token = await user.getIdToken();
                const data = await QuestionBuilderAPI.getQuestion(token, qid);

                if (!cancelled) setQuestionMetadata(data);
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load question metadata",
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetch();

        return () => {
            cancelled = true;
        };
    }, [qid, user]);

    return { questionMetadata, loading, error };
}
