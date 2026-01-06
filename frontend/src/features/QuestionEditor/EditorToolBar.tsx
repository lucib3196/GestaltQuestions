import { ActionButton } from "../../components/Button";
import { EditorToolBarItems } from "./config";
import type { FileActions, FileOptions } from "./types";
import { useSaveQuestionFile, useDeleteQuestionFile } from "./hooks";
import { useCodeEditorContext } from "./context";
import { useQuestionCollectionContext } from "./../../context/QuestionCollectionContext";
import { MyModal } from "../../components/Modal/Modal";

export default function EditorToolBar() {
    const { selectedFile, fileContent } = useCodeEditorContext();
    const { selectedQuestionID } = useQuestionCollectionContext();
    const { saveFile } = useSaveQuestionFile();
    const { deleteFile } = useDeleteQuestionFile();
    const handleOption = async (action: FileActions, options: FileOptions) => {
        switch (action) {
            case "save":
                if (!options.questionID || !options.filename) {
                    return;
                }
                await saveFile(
                    options.questionID,
                    options.filename,
                    options.fileContent ?? ""
                );
                break;

            case "upload":
                console.log("Upload");
                break;

            case "delete":
                if (!options.questionID || !options.filename) {
                    return;
                }
                deleteFile(options.questionID, options.filename);
                break;

            case "download":
                console.log("Download");
                break;

            default: {
                // This should be unreachable because EditorOptions is exhaustive
                const _exhaustiveCheck: never = action;
                console.warn("Unhandled editor option:", _exhaustiveCheck);
            }
        }
    };

    return (
        <div className="flex flex-row gap-2">
            {EditorToolBarItems.map((v) => (
                <ActionButton
                    icon={v.icon}
                    label={v.label}
                    key={v.key}
                    onClick={() =>
                        handleOption(v.key, {
                            questionID: selectedQuestionID,
                            filename: selectedFile,
                            fileContent: fileContent,
                        })
                    }
                />
            ))}
        </div>
    );
}
