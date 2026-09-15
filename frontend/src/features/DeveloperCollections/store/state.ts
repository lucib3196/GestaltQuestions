import type { QuestionCollectionStore } from "../../../stores/collections";
import type {
  AnyResourceSchema,
  ResourceAccessStore,
} from "../../../stores/resourceAccess";
import type { DeveloperCollectionAccessSchema } from "../access/types";

export type CollectionStore<
  Schema extends AnyResourceSchema = DeveloperCollectionAccessSchema,
> = ResourceAccessStore<Schema> & QuestionCollectionStore;

export type CollectionStoreOptions = {
  persistKey?: string;
};
