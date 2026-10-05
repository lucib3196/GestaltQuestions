import { toast } from "react-toastify";

import { useShareCollectionBatch } from "../../../hooks/collectionAccess";
import type {
  QuestionCollection,
  QuestionCollectionRead,
} from "../../../services";
import type { ShareCollectionBatchResult } from "../../../services/Sharing";
import { prepareBatch } from "../../../services/Sharing/utils";
import ResourceSharing from "../../Sharing/ResourceSharing";
import { useSingleCollectionStore } from "../singleCollectionStore";

function CollectionShareHeader({
  collection,
}: {
  collection: QuestionCollectionRead | QuestionCollection;
}) {
  return (
    <div className="mb-5 border-b border-border pb-4">
      <p className="text-xs font-medium uppercase text-text-muted">
        Collection
      </p>
      <h3 className="mt-1 text-base font-semibold text-text">
        {collection.title}
      </h3>
    </div>
  );
}

function notifyShareResult(result: ShareCollectionBatchResult) {
  const sharedCount = result.shared.length;
  const failedCount = result.failed.length;

  if (sharedCount > 0 && failedCount === 0) {
    toast.success("Collection shared successfully.");
    return;
  }

  if (sharedCount > 0 && failedCount > 0) {
    toast.warn(
      `Collection shared with ${sharedCount} user${
        sharedCount === 1 ? "" : "s"
      }; ${failedCount} failed.`,
    );
    return;
  }

  const firstReason = result.failed[0]?.reason;
  toast.error(firstReason ?? "Could not share collection.");
}

export default function ShareCollection() {
  const selectedCollection = useSingleCollectionStore(
    (s) => s.selectedCollection,
  );
  const { shareCollectionsWithUsers, loading } = useShareCollectionBatch();

  if (!selectedCollection) return null;

  return (
    <ResourceSharing
      title="Share Collection"
      variant="borderless"
      preview={<CollectionShareHeader collection={selectedCollection} />}
      buildPayload={(selectedUsers, accessLevel) =>
        prepareBatch(
          "collection_ids",
          selectedCollection.id ? [selectedCollection.id] : [],
          selectedUsers,
          accessLevel,
        )
      }
      shareResource={async (payload) => {
        const result = await shareCollectionsWithUsers(payload);

        if (!result) {
          toast.error("Could not share collection.");
        }

        return result;
      }}
      actions={{
        disableShare: loading,
        onShared: notifyShareResult,
      }}
    />
  );
}
