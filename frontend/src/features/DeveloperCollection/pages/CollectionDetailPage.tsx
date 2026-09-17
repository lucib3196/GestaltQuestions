import { useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ShareCollection from "../access-management/ShareCollection";
import { Modal } from "../../../components/Modal";
import { useFetchCollection } from "../../../hooks/collections";
import type { Status } from "../../../services";
import { normalizeStatus } from "../../../services/Status";
import AddQuestionsToCollection from "../../AddQuestionsToCollection";
import PersonalQuestionTable from "../../QuestionTables";
import { PersonalQuestionTableProvider } from "../../QuestionTables";
import { CollectionAccessGate } from "../access/AccessGate";
import { CollectionDetailHeader } from "../components/CollectionDetailHeader";
import {
  CollectionDetailEmpty,
  CollectionDetailError,
  CollectionDetailLoading,
} from "../components/CollectionDetailStates";
import { CollectionHeroIcon } from "../components/customization/CollectionHeroIcon";
import CollectionInfo from "../components/CollectionInfo";
import { CollectionQuestionsEmptyState } from "../components/CollectionQuestionsEmptyState";
import { CollectionQuestionsTabs } from "../components/CollectionQuestionsTabs";
import { CollectionVisibilityFooter } from "../components/CollectionVisibilityFooter";
import {
  SingleCollectionProvider,
  useSingleCollectionStore,
} from "../singleCollectionStore";
import { getQuestionCount } from "../utils";
import { AccessBadge } from "../../../components/Access";

function CollectionViewData() {
  const [showQuestion, setShowQuestion] = useState<boolean>(false);
  const [isEditingCollection, setIsEditingCollection] = useState(false);
  const [showShare, setShowShare] = useState<boolean>(false);
  const selectedCollection = useSingleCollectionStore(
    (s) => s.selectedCollectionId,
  );
  const { collection, loading, error, fetchCollection } =
    useFetchCollection(selectedCollection);

  const access = useSingleCollectionStore((s) => s.access);

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
      <AccessBadge level={access?.access_level} />
      <CollectionDetailHeader
        title={collection.title}
        onAddQuestions={() => setShowQuestion((prev) => !prev)}
        onShareCollection={() => setShowShare((prev)=>!prev)}
        onEditDetails={() => setIsEditingCollection(true)}
      />
      {showShare && <Modal setShowModal={setShowShare}><ShareCollection /></Modal>}

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
          {/* <ManageableQuestionsToolbar /> */}
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
    <SingleCollectionProvider>
      <CollectionAccessGate collectionId={collectionId}>
        <CollectionViewData />
      </CollectionAccessGate>
    </SingleCollectionProvider>
  );
}
