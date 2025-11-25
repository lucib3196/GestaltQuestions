import { MdDelete } from "react-icons/md";
import { IoMdDownload } from "react-icons/io";
import { MdFileUpload } from "react-icons/md";
import { BiSelectMultiple } from "react-icons/bi";
import type { IconType } from "react-icons";
import SearchBar from "../Base/SearchBar";
import { useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { useMemo } from "react";
import { useRetrievedQuestions } from "../../api";
import clsx from "clsx";
import { useQuestionTableContext } from './../../context/QuestionTableContext';

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
    const { multiSelect, setMultiSelect } = useQuestionTableContext()
    const [searchTitle, setSearchTitle] = useState<string>("");
    const debouncedSearchTerm = useDebounce(searchTitle, 300);

    const questionFilter = useMemo(
        () => ({ title: debouncedSearchTerm }),
        [debouncedSearchTerm]
    );

    useRetrievedQuestions({
        questionFilter: questionFilter,
        showAllQuestions: false,
    });

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
                    onClick={() => setMultiSelect(prev => !prev)}
                />
            </div>

            <ActionButton
                icon={MdFileUpload}
                label="Upload Question"
                onClick={() => console.log("Clicked")}
            />

            {/* Bottom Row — Action Buttons */}
            {multiSelect && <div className="grid grid-cols-2 gap-4">
                <ActionButton
                    icon={MdDelete}
                    label="Delete Question"
                    onClick={() => console.log("Clicked")}
                />
                <ActionButton
                    icon={IoMdDownload}
                    label="Download Question"
                    onClick={() => console.log("Clicked")}
                />

            </div>}
        </div>
    );
}
