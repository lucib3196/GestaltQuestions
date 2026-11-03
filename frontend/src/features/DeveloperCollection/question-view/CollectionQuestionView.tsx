import { useNavigate } from "react-router-dom";

import { useFetchCollection } from "../../../hooks/collections";
import { CollectionDetailEmpty } from "../components/CollectionDetailStates";
import { CollectionQuestionsEmptyState } from "../components/CollectionQuestionsEmptyState";
import { useSingleCollectionStore } from "../singleCollectionStore";
import { getQuestionCount } from "../utils";
import { CollectionQuestionsToolbar } from "./CollectionQuestionsToolbar";
import { CollectionQuestionTable } from "./CollectionQuestionTable";
import { CollectionQuestionTableProvider } from "./CollectionQuestionTableProvider";

export function CollectionQuestionView() {
  const collectionID = useSingleCollectionStore((s) => s.selectedCollectionId);
  const { collection, fetchCollection } = useFetchCollection(collectionID);
  const access = useSingleCollectionStore((s) => s.access);
  const capabilities = useSingleCollectionStore((s) => s.capabilities);


  const navigate = useNavigate();
  if (!collection?.id) {
    return <CollectionDetailEmpty />;
  }

  const questionCount = getQuestionCount(collection);

  if (!questionCount)
    return (
      <CollectionQuestionsEmptyState
        collectionTitle={collection.title}
        canAddQuestions={capabilities.canAddQuestions}
        onAddQuestions={() => console.log("Adding Questions")}
        onCreateQuestion={() =>
          console.log("Create question for collection", collection.id)
        }
      />
    );

  return (
    <CollectionQuestionTableProvider key={collection.id}>
      <div className="flex flex-col gap-2">
        <CollectionQuestionsToolbar
          collectionId={collection.id}
          canRemove={capabilities.canRemoveQuestions}
          onCollectionChanged={fetchCollection}
        />
        <CollectionQuestionTable
          baseQuery={{ collection_id: collection.id }}
          onRowSelect={(rowId) => {
            access
              ? navigate(`/question_builder/questions/${rowId}/edit`)
              : navigate(`/questions/${rowId}`);
          }}
        />
      </div>
    </CollectionQuestionTableProvider>
  );
}
