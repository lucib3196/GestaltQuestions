import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AccessBadge } from "../../../components/Access";
import { Modal } from "../../../components/Modal";
import { useFetchCollection } from "../../../hooks/collections";
import type { Status } from "../../../services";
import { normalizeStatus } from "../../../services/Status";
import AddQuestionsToCollection from "../../AddQuestionsToCollection";
import PersonalQuestionTable from "../../QuestionTables";
import { PersonalQuestionTableProvider } from "../../QuestionTables";
import { CollectionAccessGate } from "../access/AccessGate";
import ShareCollection from "../access-management/ShareCollection";
import { CollectionDetailHeader } from "../components/CollectionDetailHeader";
import {
  CollectionDetailEmpty,
  CollectionDetailError,
  CollectionDetailLoading,
} from "../components/CollectionDetailStates";
import CollectionInfo from "../components/CollectionInfo";
import { CollectionQuestionsEmptyState } from "../components/CollectionQuestionsEmptyState";
import { CollectionQuestionsTabs } from "../components/CollectionQuestionsTabs";
import { CollectionVisibilityFooter } from "../components/CollectionVisibilityFooter";
import { CollectionHeroIcon } from "../components/customization/CollectionHeroIcon";
import { useUpdateSingleCollection } from "../hooks/useUpdateSingleCollection";
import {
  SingleCollectionProvider,
  useSingleCollectionStore,
} from "../singleCollectionStore";
import { getQuestionCount } from "../utils";

function CollectionViewData() {
  const [showQuestion, setShowQuestion] = useState<boolean>(false);
  const [isEditingCollection, setIsEditingCollection] = useState(false);
  const [showShare, setShowShare] = useState<boolean>(false);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(
    null,
  );
  const selectedCollection = useSingleCollectionStore(
    (s) => s.selectedCollectionId,
  );
  const { collection, loading, error, fetchCollection } =
    useFetchCollection(selectedCollection);
  const { updateCollection, loading: isUpdatingStatus } =
    useUpdateSingleCollection();

  const access = useSingleCollectionStore((s) => s.access);
  const capabilities = useSingleCollectionStore((s) => s.capabilities);

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

  const handleStatusToggle = async () => {
    if (!collection.id || isUpdatingStatus) return;
    setStatusUpdateError(null);
    const updated = await updateCollection(collection.id, {
      status: status === "published" ? "draft" : "published",
    });
    if (!updated) {
      setStatusUpdateError("Unable to update collection status.");
      return;
    }
    await fetchCollection();
  };

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
      <AccessBadge
        level={
          access?.access_level ?? (status === "published" ? "view" : undefined)
        }
      />
      <CollectionDetailHeader
        title={collection.title}
        canAddQuestions={capabilities.canAddQuestions}
        canManageAccess={capabilities.canManageAccess}
        canUpdate={capabilities.canUpdate}
        status={status}
        isUpdatingStatus={isUpdatingStatus}
        onAddQuestions={() => setShowQuestion((prev) => !prev)}
        onShareCollection={() => setShowShare(true)}
        onEditDetails={() => setIsEditingCollection(true)}
        onToggleStatus={handleStatusToggle}
      />
      {statusUpdateError && (
        <p role="alert" className="mt-3 text-sm font-medium text-warning">
          {statusUpdateError}
        </p>
      )}
      {showShare && (
        <Modal setShowModal={setShowShare}>
          <ShareCollection collection={collection} />
        </Modal>
      )}

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
          canAddQuestions={capabilities.canAddQuestions}
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
            onRowSelect={(rowId) => {
              if (status === "published" && !access) {
                navigate(`/questions/${rowId}`);
                return;
              }
              navigate(`/question_builder/questions/${rowId}/edit`);
            }}
          />
        </PersonalQuestionTableProvider>
      )}

      <CollectionVisibilityFooter
        status={status}
        canManageAccess={capabilities.canManageAccess}
        onManageSharing={() => setShowShare(true)}
      />

      {showQuestion && (
        <Modal setShowModal={(val) => setShowQuestion(val)} variant="default">
          <AddQuestionsToCollection
            collection={collection}
            onQuestionsAdded={() => {
              setShowQuestion(false);
              void fetchCollection();
            }}
          />
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
