import { useState } from "react";
import { FaCopy, FaDownload } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { TbColumns3Filled } from "react-icons/tb";

import { SearchBar } from "../../../../components/SearchBar";
import type { QuestionTableColumn } from "../../config/columns";
import { useQuestionTableContext } from "../../instance/context";
import { QuestionTableColumnVisibility } from "./QuestionTableColumnVisibility";

type QuestionTableToolBarProps = {
    columns: QuestionTableColumn[];
};

function toolbarButtonClass(variant: "default" | "danger" = "default") {
    const base =
        "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-45";

    if (variant === "danger") {
        return `${base} border-red-500/25 bg-red-500/15 text-red-300 hover:bg-red-500/25`;
    }

    return `${base} border-slate-700/80 bg-slate-900/70 text-slate-100 hover:bg-slate-800`;
}

export default function QuestionTableToolBar({
    columns,
}: QuestionTableToolBarProps) {
    const [showColumns, setShowColumns] = useState(false);
    const searchTitle = useQuestionTableContext((s) => s.search);
    const setSearchTitle = useQuestionTableContext((s) => s.setSearch);
    const selectedIds = useQuestionTableContext((s) => s.selectedIDs);

    const hasSelectedRows = selectedIds.length > 0;

    return (
        <div className="relative  rounded-xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg">


            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="w-full md:max-w-xs">
                    <SearchBar
                        value={searchTitle}
                        setValue={setSearchTitle}
                        disabled={false}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 md:ml-auto">
                    <button
                        type="button"
                        disabled={!hasSelectedRows}
                        onClick={() => console.log("Copy")}
                        className={toolbarButtonClass()}
                    >
                        <FaCopy className="h-3.5 w-3.5" />
                        Copy
                    </button>

                    <button
                        type="button"
                        disabled={!hasSelectedRows}
                        onClick={() => console.log("download")}
                        className={toolbarButtonClass()}
                    >
                        <FaDownload className="h-3.5 w-3.5" />
                        Download
                    </button>

                    <button
                        type="button"
                        disabled={!hasSelectedRows}
                        onClick={() => console.log("Delete")}
                        className={toolbarButtonClass("danger")}
                    >
                        <MdDelete className="h-4 w-4" />
                        Delete
                    </button>

                    <button
                        type="button"
                        aria-expanded={showColumns}
                        onClick={() => setShowColumns((current) => !current)}
                        className={toolbarButtonClass()}
                    >
                        <TbColumns3Filled className="h-4 w-4" />
                        Columns
                    </button>
                </div>
            </div>

            {showColumns && (
                <div className="absolute right-4 top-full z-20 mt-2 w-64">
                    <QuestionTableColumnVisibility columns={columns} />
                </div>
            )}
        </div>
    );
}
