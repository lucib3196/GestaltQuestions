import React, { createContext, useState, useContext } from "react";

export type CreateMode = "blank" | "upload";

type CreateQuestionContextType = {
    mode: CreateMode;
    setMode: React.Dispatch<React.SetStateAction<CreateMode>>;
};

export const CreateQuestionContext = createContext<CreateQuestionContextType | null>(null)


const CreateQuestionProvider = ({ children }: { children: React.ReactNode }) => {
    const [mode, setMode] = useState<CreateMode>("blank")

    return <CreateQuestionContext.Provider value={{ mode, setMode }}>{children} </CreateQuestionContext.Provider>
}



export const useCreateMode = () => {
    const ctx = useContext(CreateQuestionContext);
    if (!ctx) {
        throw new Error("useCreateMode must be used within a QuestionRuntimeProvider");
    }
    return ctx;
}

export default CreateQuestionProvider
