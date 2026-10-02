import type { QuestionCollectionStore } from "../../../stores/collections";
import type {
  AnyResourceSchema,
  ResourceAccessStore,
} from "../../../stores/resourceAccess";
import type { DeveloperCollectionAccessSchema } from "../access/types";

export type SingleCollectionStore<
  Schema extends AnyResourceSchema = DeveloperCollectionAccessSchema,
> = ResourceAccessStore<Schema> & QuestionCollectionStore;

export type SingleCollectionStoreOptions = {
  persistKey?: string;
};
