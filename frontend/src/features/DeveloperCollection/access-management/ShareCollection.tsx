import { useState } from "react";
import { toast } from "react-toastify";

import {
  useListSharedByMe,
  useShareCollectionBatch,
} from "../../../hooks/collectionAccess";
import type {
  QuestionCollection,
  QuestionCollectionRead,
} from "../../../services";
import type { ShareCollectionBatchResult } from "../../../services/Sharing";
import { prepareBatch } from "../../../services/Sharing/utils";
import ResourceSharing from "../../Sharing/ResourceSharing";
import CollectionAccessDetailList from "./CollectionAccessDetailList";

const SHARE_TABS = [
  { id: "share", label: "Share collection" },
  { id: "access", label: "Who has access" },
] as const;

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

export default function ShareCollection({
  collection,
}: {
  collection: QuestionCollectionRead | QuestionCollection;
}) {
  const [activeTab, setActiveTab] = useState<"share" | "access">("share");
  const { shareCollectionsWithUsers, loading } = useShareCollectionBatch();
  const { access, loading: loadingAccess, error, refresh } =
    useListSharedByMe(collection.id ?? "");

  return (
    <div className="w-full max-w-3xl">
      <div
        className="mb-5 flex gap-6 border-b border-border"
        role="tablist"
        aria-label="Collection sharing"
      >
        {SHARE_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`collection-sharing-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`collection-sharing-panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={[
                "relative h-12 whitespace-nowrap px-1 text-sm font-semibold transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                isActive
                  ? "text-accent after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:rounded-full after:bg-accent"
                  : "text-text-muted hover:text-text",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "share" ? (
        <div
          id="collection-sharing-panel-share"
          role="tabpanel"
          aria-labelledby="collection-sharing-tab-share"
        >
          <ResourceSharing
            title="Share Collection"
            variant="borderless"
            preview={<CollectionShareHeader collection={collection} />}
            buildPayload={(selectedUsers, accessLevel) =>
              prepareBatch(
                "collection_ids",
                collection.id ? [collection.id] : [],
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
              disableShare: loading || !collection.id,
              onShared: (result) => {
                notifyShareResult(result);
                void refresh();
              },
            }}
          />
        </div>
      ) : (
        <div
          id="collection-sharing-panel-access"
          role="tabpanel"
          aria-labelledby="collection-sharing-tab-access"
        >
          <CollectionAccessDetailList
            collectionId={collection.id ?? ""}
            access={access}
            loading={loadingAccess}
            error={error}
            onAccessChanged={refresh}
          />
        </div>
      )}
    </div>
  );
}
