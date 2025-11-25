import { useState, useMemo } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import clsx from "clsx";
import { downloadZip } from "../../utils/downloadUtils";
import { BiSelectMultiple } from "react-icons/bi";
import type { IconType } from "react-icons";
import { IoMdDownload } from "react-icons/io";
import { MdDelete, MdFileUpload } from "react-icons/md";
import { toast } from "react-toastify";
import SearchBar from "../Base/SearchBar";
import { QuestionAPI, useRetrievedQuestions } from "../../api";
import { useQuestionTableContext } from "../../context/QuestionTableContext";
import { useQuestionContext } from "../../context/QuestionContext";
import { MyModal } from "../Base/MyModal";


interface ActionButtonProps {
    icon: IconType;
    label: string;
    onClick?: () => void;
    className?: string;
}
export function ActionButton({
    icon: Icon,
    label,
    onClick,
    className,
}: ActionButtonProps) {
    return (
        <div
            onClick={onClick}
            className={clsx(
                "w-full flex justify-center border p-2 rounded-md shadow hover:scale-105 uration-300 ease-in-out",
                className
            )}
        >
            <button onClick={onClick} className="flex items-center gap-2">
                <Icon size={18} />
                {label}
            </button>
        </div>
    );
}

export default function QuestionViewToolBar() {
    const { multiSelect, setMultiSelect } = useQuestionTableContext();
    const { selectedQuestions } = useQuestionContext();
    const [searchTitle, setSearchTitle] = useState<string>("");
    const [showModal, setShowModal] = useState(false)
    const debouncedSearchTerm = useDebounce(searchTitle, 300);

    const questionFilter = useMemo(
        () => ({ title: debouncedSearchTerm }),
        [debouncedSearchTerm]
    );

    useRetrievedQuestions({
        questionFilter: questionFilter,
        showAllQuestions: false,
    });

    const handleQuestionDownloads = async () => {
        if (!selectedQuestions.length) return;
        const requests = selectedQuestions.map((qId) =>
            QuestionAPI.downloadQuestion(qId)
        );
        const responses = await Promise.all(requests);
        responses.map((r) => downloadZip(r.blob, r.header))
        toast.success("Downloaded all question success");
    };
    const handleDeleteQuestions = async () => {
        if (!selectedQuestions.length) return;
        const requests = selectedQuestions.map((qId) =>
            QuestionAPI.deleteQuestion(qId)
        );
        await Promise.all(requests);
        toast.success("Deleted question success");
        window.location.reload();
    }

    return (
        <div
            className={clsx(
                "w-full grow",
                "grid grid-rows-2 gap-5 p-4",
                "rounded-lg bg-white dark:bg-gray-900 shadow-sm",
                "border border-gray-200 dark:border-gray-700"
            )}
        >
            {/* Top Row — Search + Mode Toggle */}
            <div className="grid grid-cols-3 gap-4 items-center justify-evenly">
                <div className="col-span-2">
                    <SearchBar
                        value={searchTitle}
                        setValue={setSearchTitle}
                        disabled={false}
                    />
                </div>

                <ActionButton
                    icon={BiSelectMultiple}
                    label="Multi-Select"
                    className="justify-self-end max-w-[200px]"
                    onClick={() => setMultiSelect((prev) => !prev)}
                />
            </div>

            <ActionButton
                icon={MdFileUpload}
                label="Upload Question"
                onClick={() => setShowModal(prev => !prev)}
            />

            {/* Bottom Row — Action Buttons */}
            {multiSelect && (
                <div className="grid grid-cols-2 gap-4">
                    <ActionButton icon={MdDelete} label="Delete Question" onClick={handleDeleteQuestions} />
                    <ActionButton
                        icon={IoMdDownload}
                        label="Download Question"
                        onClick={handleQuestionDownloads}
                    />
                </div>
            )}

            {showModal && <MyModal setShowModal={setShowModal}>Upload File</MyModal>}
        </div>
    );
}
