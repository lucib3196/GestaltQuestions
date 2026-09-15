import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Modal } from "../../../components/Modal";
import type { QuestionCollection, Status } from "../../../services";
import { normalizeStatus } from "../../../services/Status";
import AddQuestionsToCollection from "../../AddQuestionsToCollection";
import { useFetchCollection } from "../../../hooks/collections";
import {
  CollectionProvider,
  useCollectionStore,
} from "../../../stores/collections";
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

function getQuestionCount(collection: QuestionCollection) {
  if ("question_ids" in collection && Array.isArray(collection.question_ids)) {
    return collection.question_ids.length;
  }

  return 0;
}

function CollectionViewData() {
  const [showQuestion, setShowQuestion] = useState<boolean>(false);
  const [isEditingCollection, setIsEditingCollection] = useState(false);
  const { collectionId } = useParams<{ collectionId: string }>();
  const { collection, loading, error, fetchCollection } =
    useFetchCollection(collectionId);
  const setSelectedCollection = useCollectionStore(
    (s) => s.setSelectedCollectionId,
  );

  useEffect(() => {
    setSelectedCollection(collectionId ?? null);
  }, [collectionId, setSelectedCollection]);

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
      <section className="min-h-[720px] rounded-lg border border-slate-800 bg-slate-950 p-6 text-slate-100 shadow-soft">
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
    <section className="min-h-[720px] rounded-lg border border-slate-800 bg-slate-950 p-6 text-slate-100 shadow-soft">
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
        <div className="min-h-[360px] py-10 text-sm text-slate-400">
          Questions for this collection will appear here.
        </div>
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
  return (
    <CollectionProvider>
      <CollectionViewData />
    </CollectionProvider>
  );
}
