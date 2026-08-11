import type React from "react";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { CollectionProvider } from "../QuestionCollections/instance/context";
import { useCollectionStore } from "../QuestionCollections/instance/context";
import DeveloperQuestionsTable from "../QuestionTables/tables/DeveloperQuestionsTable";
import { QuestionTableStoreProvider } from "../QuestionTables/tables/QuestionTableStoreProvider";
import QuestionBuilderSideBar from "./QuestionBuilderSideBar";
import { createMyQuestionTableColumns, useQuestionTableContext } from "../QuestionTables";
import { ToolBar } from "./toolbar/ToolBar";
import { WorkspaceLinks } from "./links/WorkspaceLinks";
export function QuestionBuilderShell({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <QuestionTableStoreProvider>
            <CollectionProvider>
                <div className="min-h-screen bg-bg px-4 py-5 text-text sm:px-6">
                    <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-375 flex-col gap-5">
                        {children}
                    </div>
                </div>
            </CollectionProvider>
        </QuestionTableStoreProvider>
    );
}



function TableView() {
    const navigate = useNavigate();
    const columns = useMemo(() => createMyQuestionTableColumns(), []);

    const selectedCollection = useCollectionStore((s) => s.selectedCollectionId);
    const l = useQuestionTableContext((s) => s.setQuestionTableColumns)
    l(columns)

    return (
        <section className="flex min-w-0 flex-col gap-4">
            <ToolBar />

            <DeveloperQuestionsTable
                baseQuery={{ collection_id: selectedCollection }}
                onQuestionSelect={(qid) =>
                    navigate(`/question_builder/questions/${qid}/edit`)
                }
            />
        </section>
    );
}
export default function QuestionBuilderWorkspace() {

    return (
        <QuestionBuilderShell>
            <div>
                <WorkspaceLinks />
            </div>

            {/* Main Section */}
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
                <QuestionBuilderSideBar />
                <TableView />
            </div>
        </QuestionBuilderShell>
    );
}
