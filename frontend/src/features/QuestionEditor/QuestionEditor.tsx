import CodeEditorGeneric from "../../components/CodeEditor/CodeEditorGeneric";
import EditorToolBar from "./EditorToolBar";
import { useCodeEditorContext } from "./context";
import { useQuestionFiles } from "./hooks";
import { DropDown } from "../../components/DropDown";
import { resolveLanguage } from "./utils";

export default function QuestionEditor() {
    const {
        fileNames,
        selectedFile,
        setSelectedFile,
        fileContent,
        setFileContent,
    } = useCodeEditorContext();
    const { } = useQuestionFiles();
    return (
        <div>
            Code Content
            <EditorToolBar />
            <DropDown
                selected={selectedFile}
                setSelected={setSelectedFile}
                options={fileNames}
                label="File Select"
            />
            <CodeEditorGeneric
                value={fileContent}
                setValue={setFileContent}
                language={resolveLanguage(selectedFile)}
            />
        </div>
    );
}
