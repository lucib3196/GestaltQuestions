import SectionContainer from "../Base/SectionContainer";
import { PiFileHtmlBold } from "react-icons/pi";
import { RiJavascriptFill } from "react-icons/ri";
import { FaPython } from "react-icons/fa";
import type { IconType } from "react-icons";
import Checkbox from "@mui/material/Checkbox";
import { useState } from "react";
import type { ChangeEvent } from "react";

function CreateQuestionHeader() {
    return (
        <header className="mb-8">
            <h1 className="text-3xl font-bold">
                Create Your Own Custom Gestalt Module
            </h1>
            <h2 className="text-gray-700 text-lg mt-1">
                Start from scratch — define your parameters, write logic, and build a
                complete question experience.
            </h2>
        </header>
    );
}
type FileSelectionBoxProps = {
    filename: string;
    icon: IconType;
    color: string;
    handleChange?: () => void;
};
function FileSelectionBox({
    filename,
    icon: Icon,
    color,
    handleChange,
}: FileSelectionBoxProps) {
    return (
        <div className="flex flex-row items-center gap-4 w-1/2 p-3 border rounded-2xl">
            <Checkbox value={filename} onChange={handleChange} />
            <h1 className="text-xl font-medium flex-1">{filename}</h1>
            <Icon className="w-8 h-8 text-gray-600 " color={color} />
        </div>
    );
}
const FileMapping: FileSelectionBoxProps[] = [
    { filename: "question.html", icon: PiFileHtmlBold, color: "red" },
    { filename: "solution.html", icon: PiFileHtmlBold, color: "red" },
    { filename: "server.js", icon: RiJavascriptFill, color: "orange" },
    { filename: "server.py", icon: FaPython, color: "blue" },
];

function FileSelectionContainer() {
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

    //   Handle the change 
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { checked, value } = event.target;
        setSelectedFiles((prev) => {
            if (checked) {
                return prev.includes(value) ? prev : [...prev, value];
            } else {
                return prev.filter((v) => v !== value);
            }
        });
    };

    return (
        <div>
            {FileMapping.map((v) => (
                <FileSelectionBox
                    filename={v.filename}
                    icon={v.icon}
                    color={v.color}
                    handleChange={handleChange}
                />
            ))}
        </div>
    );
}

export default function CreateQuestionPage() {
    return (
        <SectionContainer id="create_question">
            <CreateQuestionHeader />
            <FileSelectionContainer />
        </SectionContainer>
    );
}
