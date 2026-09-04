import type React from "react";
import { useNavigate } from "react-router-dom";
import {
  SharedByMeTableProvider,
  SharedByMeQuestionTable,
} from "../QuestionTables";
import { CollectionProvider } from "../QuestionCollections/instance/context";
import { useCollectionStore } from "../QuestionCollections/instance/context";
import PersonalQuestionTable from "../QuestionTables";
import { PersonalQuestionTableProvider } from "../QuestionTables";

import QuestionSharing from "../Sharing/QuestionSharing";
import { UserLookupProvider } from "../UserLookUp/instance/context";
import QuestionBuilderSideBar from "./sidebar/QuestionBuilderSideBar";
import { ToolBar } from "./toolbar/ToolBar";

export function QuestionBuilderShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PersonalQuestionTableProvider>
      <SharedByMeTableProvider>
        <UserLookupProvider>
          <CollectionProvider>
            <div className="min-h-screen bg-bg px-4 py-5 text-text sm:px-6">
              <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full  flex-col gap-5">
                {children}
              </div>
            </div>
          </CollectionProvider>
        </UserLookupProvider>
      </SharedByMeTableProvider>
    </PersonalQuestionTableProvider>
  );
}

function TableView() {
  const navigate = useNavigate();

  const selectedCollection = useCollectionStore((s) => s.selectedCollectionId);

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <ToolBar />

      <PersonalQuestionTable
        baseQuery={{ collection_id: selectedCollection }}
        onRowSelect={(rowId) =>
          navigate(`/question_builder/questions/${rowId}/edit`)
        }
      />
    </section>
  );
}

function SharedByMe() {
  const navigate = useNavigate();
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <ToolBar />
      <SharedByMeQuestionTable
        baseQuery={{}}
        onRowSelect={(rowId) =>
          navigate(`/question_builder/questions/${rowId}/edit`)
        }
      />
    </section>
  );
}
export default function QuestionBuilderWorkspace() {
  return (
    <QuestionBuilderShell>
      {/* Main Section */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <QuestionBuilderSideBar />
        <TableView />
        <QuestionSharing />
        <SharedByMe />
      </div>
    </QuestionBuilderShell>
  );
}
