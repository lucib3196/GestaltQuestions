import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useCallback,
} from "react";
import { QuestionAPI } from "../services";
import type { QuestionData } from "../types/questionTypes";

type RetrieveQuestionsArgs = {
  questionFilter?: Record<string, unknown>;
  showAllQuestions?: boolean;
};

type QuestionCollectionContext = {
  questions: QuestionData[];
  selectedQuestionID: string | null;
  selectedQuestions: string[];
  questionMeta: QuestionData | null;

  setSelectedQuestionID: React.Dispatch<React.SetStateAction<string>>;
  setSelectedQuestions: React.Dispatch<React.SetStateAction<string[]>>;
  setQuestionMeta: React.Dispatch<
    React.SetStateAction<QuestionData | null>
  >;

  retrieveQuestions: (
    args?: RetrieveQuestionsArgs
  ) => Promise<void>;
};

export const QuestionContext =
  createContext<QuestionCollectionContext | null>(null);

export function QuestionCollectionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [questionMeta, setQuestionMeta] =
    useState<QuestionData | null>(null);

  const [selectedQuestionID, setSelectedQuestionID] =
    useState<string>("");

  const [selectedQuestions, setSelectedQuestions] =
    useState<string[]>([]);

  // Centralized fetch logic
  const retrieveQuestions = useCallback(
    async ({
      questionFilter = {},
      showAllQuestions = true,
    }: RetrieveQuestionsArgs = {}) => {
      try {
        const filter = showAllQuestions
          ? {}
          : questionFilter;

        const retrieved =
          await QuestionAPI.filterQuestions(filter);

        setQuestions(retrieved);
      } catch (error) {
        console.error(
          "Failed to retrieve questions:",
          error
        );
      }
    },
    []
  );

  

  return (
    <QuestionContext.Provider
      value={{
        questions,
        selectedQuestionID,
        selectedQuestions,
        questionMeta,
        setSelectedQuestionID,
        setSelectedQuestions,
        setQuestionMeta,
        retrieveQuestions,
      }}
    >
      {children}
    </QuestionContext.Provider>
  );
}

export function useQuestionCollectionContext() {
  const context = useContext(QuestionContext);

  if (!context) {
    throw new Error(
      "useQuestionCollectionContext must be used within a <QuestionCollectionProvider>"
    );
  }

  return context;
}