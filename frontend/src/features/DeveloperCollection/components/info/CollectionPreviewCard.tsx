import { Lock } from "lucide-react";

import type { QuestionCollection } from "../../../../services";
import { getStatusLabel } from "../../../QuestionMetadata";
import type { CollectionMetadataFormValue } from "../../hooks/useCollectionInfoStore";
import { getQuestionCount } from "../../utils";
import {
  getCollectionColor,
  getCollectionIcon,
} from "../customization/customization";

type CollectionPreviewCardProps = {
  collection: QuestionCollection;
  value: CollectionMetadataFormValue;
};

export function CollectionPreviewCard({
  collection,
  value,
}: CollectionPreviewCardProps) {
  const color = getCollectionColor(value.customization.color);
  const Icon = getCollectionIcon(value.customization.icon);
  const questionCount = getQuestionCount(collection);

  return (
    <aside className="lg:border-l lg:border-border lg:pl-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
        Live preview
      </p>

      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-bg shadow-soft">
        <div
          className="h-32 border-b border-border px-6 pt-12"
          style={{
            background: `linear-gradient(135deg, ${color}33, transparent 72%), color-mix(in srgb, ${color} 18%, var(--color-bg))`,
          }}
        >
          <div
            className="flex size-20 items-center justify-center rounded-md shadow-lg"
            style={{ backgroundColor: color, color: "#fff" }}
          >
            <Icon className="size-10" aria-hidden="true" />
          </div>
        </div>

        <div className="px-6 py-7">
          <h3 className="text-2xl font-semibold text-text">
            {value.title || "Untitled collection"}
          </h3>
          <span className="mt-4 inline-flex rounded-full bg-surface-muted px-3 py-1 text-sm font-semibold text-text-muted">
            {getStatusLabel(value.status)}
          </span>
          <p className="mt-5 text-sm leading-6 text-text-muted">
            {value.description ||
              "No description has been added for this collection yet."}
          </p>

          <div className="mt-10 flex items-center justify-between text-sm font-medium text-text-muted">
            <span>
              {questionCount} {questionCount === 1 ? "question" : "questions"}
            </span>
            <span className="inline-flex items-center gap-2">
              <Lock className="size-4" aria-hidden="true" />
              {value.status === "published" ? "Public" : "Only you"}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-text-muted">
        Shown on collection cards and your collection page.
      </p>
    </aside>
  );
}
