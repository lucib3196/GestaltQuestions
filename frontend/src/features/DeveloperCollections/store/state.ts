import type { QuestionCollectionStore } from "../../../stores/collections";
import type {
  AnyResourceSchema,
  ResourceAccessStore,
} from "../../../stores/resourceAccess";

export type CollectionStore<
  Schema extends AnyResourceSchema = AnyResourceSchema,
> = ResourceAccessStore<Schema> & QuestionCollectionStore;

export type CollectionStoreOptions = {
  persistKey?: string;
};
