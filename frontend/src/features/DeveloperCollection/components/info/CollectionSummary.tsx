import type { QuestionCollection } from "../../../../services";
import { getStatusLabel } from "../../../../services/Status";
import { type CollectionMetadataFormValue } from "../../hooks/useCollectionInfoStore";
import { formatDate } from "../../../../utils/formattingUtils";

type CollectionSummaryProps = {
  collection: QuestionCollection;
  value: CollectionMetadataFormValue;
};

export function CollectionSummary({
  collection,
  value,
}: CollectionSummaryProps) {
  const createdDate = formatDate(collection.created_at);
  const updatedDate = formatDate(collection.updated_at);

  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="min-w-0 text-3xl font-semibold leading-tight tracking-normal text-slate-50">
          {value.title || "Untitled collection"}
        </h1>
        <span className="rounded-full border border-slate-700 bg-slate-800/90 px-3 py-1 text-sm font-semibold text-slate-200">
          {getStatusLabel(value.status)}
        </span>
      </div>

      <p className="mt-3 max-w-4xl text-base leading-7 text-slate-400">
        {value.description ||
          "No description has been added for this collection yet."}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
        {createdDate ? <span>Created {createdDate}</span> : null}
        {createdDate && updatedDate ? <span>·</span> : null}
        {updatedDate ? <span>Updated {updatedDate}</span> : null}
      </div>
    </div>
  );
}
