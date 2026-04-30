import React, { createContext, useContext, useState, useCallback } from "react";

export type QuestionResponseValue = string | number | string[] | boolean | null;
export type QuestionResponseMap = Record<string, QuestionResponseValue>;

interface QuestionResponseContextValue {
    responses: QuestionResponseMap;
    setResponse: (name: string, value: QuestionResponseValue) => void;
    resetResponses: () => void;

    // Backward-compatible keys
    answers: QuestionResponseMap;
    setAnswer: (name: string, value: QuestionResponseValue) => void;
}

const QuestionResponseContext = createContext<QuestionResponseContextValue | null>(null);

export const QuestionResponseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [responses, setResponses] = useState<QuestionResponseMap>({});

    const setResponse = useCallback((name: string, value: QuestionResponseValue) => {
        setResponses((prev) => ({ ...prev, [name]: value }));
    }, []);

    const resetResponses = useCallback(() => {
        setResponses({});
    }, []);

    const setAnswer = setResponse;
    const answers = responses;

    return (
        <QuestionResponseContext.Provider
            value={{ responses, setResponse, resetResponses, answers, setAnswer }}
        >
            {children}
        </QuestionResponseContext.Provider>
    );
};

export const useQuestionResponses = (): QuestionResponseContextValue => {
    const ctx = useContext(QuestionResponseContext);
    if (!ctx) {
        throw new Error("useQuestionResponses must be used within a QuestionResponseProvider");
    }
    return ctx;
};

// Backward-compatible aliases
export const QuestionRuntimeProvider = QuestionResponseProvider;
export const useQuestionRuntime = useQuestionResponses;
