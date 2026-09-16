import { useEffect, useMemo, useState } from "react";

import type {
  CollectionCustomization,
  QuestionCollection,
  Status,
} from "../../../services";
import { normalizeStatus } from "../../../services/Status";
import { DEFAULT_COLLECTION_CUSTOMIZATION } from "../../CollectionShared/collectionCustomization";

export type CollectionMetadataFormValue = {
  title: string;
  description: string;
  status: Status;
  customization: CollectionCustomization;
};

export const emptyCollectionMetadata: CollectionMetadataFormValue = {
  title: "",
  description: "",
  status: "draft",
  customization: DEFAULT_COLLECTION_CUSTOMIZATION,
};

export function toCollectionMetadataFormValue(
  collection: QuestionCollection | null | undefined,
): CollectionMetadataFormValue {
  if (!collection) return emptyCollectionMetadata;

  return {
    title: collection.title,
    description: collection.description ?? "",
    status: normalizeStatus(collection.status),
    customization: {
      ...DEFAULT_COLLECTION_CUSTOMIZATION,
      ...collection.customization,
      schema_version: 1,
    },
  };
}

export function serializeCollectionMetadata(
  value: CollectionMetadataFormValue,
) {
  return {
    title: value.title.trim(),
    description: value.description.trim() || null,
    status: value.status,
    customization: value.customization,
  };
}

export function collectionMetadataValuesEqual(
  left: CollectionMetadataFormValue,
  right: CollectionMetadataFormValue,
) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function useCollectionInfoStore(collection: QuestionCollection) {
  const initialValue = useMemo(
    () => toCollectionMetadataFormValue(collection),
    [collection],
  );
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const patch = (partial: Partial<CollectionMetadataFormValue>) => {
    setValue((current) => ({ ...current, ...partial }));
  };

  const reset = () => setValue(initialValue);
  const hasChanges = !collectionMetadataValuesEqual(value, initialValue);

  return {
    value,
    patch,
    reset,
    hasChanges,
    payload: serializeCollectionMetadata(value),
  };
}
