import { useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { Modal } from "../../../components/Modal";
import { useFetchCollection } from "../../../hooks/collections";
import type { QuestionCollection, Status } from "../../../services";
import { normalizeStatus } from "../../../services/Status";
import AddQuestionsToCollection from "../../AddQuestionsToCollection";
import { ManageableQuestionsToolbar } from "../../DeveloperQuestionLibrary/toolbar/ManageableQuestionsToolbar";
import PersonalQuestionTable from "../../QuestionTables";
import { PersonalQuestionTableProvider } from "../../QuestionTables";
import { CollectionAccessGate } from "../access/AccessGate";
import { CollectionDetailHeader } from "../detail/CollectionDetailHeader";
import {
  CollectionDetailEmpty,
  CollectionDetailError,
  CollectionDetailLoading,
} from "../detail/CollectionDetailStates";
import { CollectionHeroIcon } from "../detail/CollectionHeroIcon";
import CollectionInfo from "../detail/CollectionInfo";
import { CollectionQuestionsEmptyState } from "../detail/CollectionQuestionsEmptyState";
import { CollectionQuestionsTabs } from "../detail/CollectionQuestionsTabs";
import { CollectionVisibilityFooter } from "../detail/CollectionVisibilityFooter";
import { CollectionProvider, useCollectionStore } from "../store";
function getQuestionCount(collection: QuestionCollection) {
  if ("question_ids" in collection && Array.isArray(collection.question_ids)) {
    return collection.question_ids.length;
  }

  return 0;
}

function CollectionViewData() {
  const [showQuestion, setShowQuestion] = useState<boolean>(false);
  const [isEditingCollection, setIsEditingCollection] = useState(false);
  const selectedCollection = useCollectionStore((s) => s.selectedCollectionId);
  const { collection, loading, error, fetchCollection } =
    useFetchCollection(selectedCollection);

  const navigate = useNavigate();

  if (loading) {
    return <CollectionDetailLoading />;
  }

  if (error) {
    return <CollectionDetailError message={error} />;
  }

  if (!collection) {
    return <CollectionDetailEmpty />;
  }

  const questionCount = getQuestionCount(collection);
  const status = normalizeStatus(collection.status) as Status;

  if (isEditingCollection) {
    return (
      <section className="min-h-180 rounded-lg border border-slate-800 bg-slate-950 p-6 text-slate-100 shadow-soft">
        <CollectionInfo
          collection={collection}
          mode="edit"
          onCancelEdit={() => setIsEditingCollection(false)}
          onSaved={() => {
            setIsEditingCollection(false);
            fetchCollection();
          }}
        />
      </section>
    );
  }

  return (
    <section className="min-h-180 rounded-lg border border-slate-800 bg-slate-950 p-6 text-slate-100 shadow-soft">
      <CollectionDetailHeader
        title={collection.title}
        onAddQuestions={() => setShowQuestion((prev) => !prev)}
        onShareCollection={() => console.log("Share collection", collection.id)}
        onEditDetails={() => setIsEditingCollection(true)}
      />

      <div className="mt-8 flex flex-col gap-6 xl:flex-row xl:items-center">
        <CollectionHeroIcon customization={collection.customization} />

        <CollectionInfo
          collection={collection}
          mode="view"
          onCancelEdit={() => setIsEditingCollection(false)}
          onSaved={() => {
            setIsEditingCollection(false);
            fetchCollection();
          }}
        />
      </div>

      <CollectionQuestionsTabs questionCount={questionCount} />

      {questionCount === 0 ? (
        <CollectionQuestionsEmptyState
          collectionTitle={collection.title}
          onAddQuestions={() => setShowQuestion(true)}
          onCreateQuestion={() =>
            console.log("Create question for collection", collection.id)
          }
        />
      ) : (
        <PersonalQuestionTableProvider>
          <ManageableQuestionsToolbar />
          <PersonalQuestionTable
            baseQuery={{ collection_id: selectedCollection }}
            onRowSelect={(rowId) =>
              navigate(`/question_builder/questions/${rowId}/edit`)
            }
          />
        </PersonalQuestionTableProvider>
      )}

      <CollectionVisibilityFooter
        status={status}
        onManageSharing={() =>
          console.log("Manage sharing for collection", collection.id)
        }
      />

      {showQuestion && (
        <Modal setShowModal={(val) => setShowQuestion(val)} variant="default">
          <AddQuestionsToCollection collection={collection} />
        </Modal>
      )}
    </section>
  );
}

export default function CollectionView() {
  const { collectionId } = useParams<{ collectionId: string }>();
  if (!collectionId) return;
  return (
    <CollectionProvider>
      <CollectionAccessGate collectionId={collectionId}>
        <CollectionViewData />
      </CollectionAccessGate>
    </CollectionProvider>
  );
}
