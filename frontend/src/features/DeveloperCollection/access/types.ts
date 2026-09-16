import type { CollectionAccess } from "../../../services/Access";
import type { ResourceAccessSchema } from "../../../stores/resourceAccess";

export type DeveloperCollectionAccessAction =
  | "canView"
  | "canAddQuestions"
  | "canRemoveQuestions"
  | "canUpdate"
  | "canCreateChild"
  | "canDelete"
  | "canManageAccess";

export type DeveloperCollectionCapabilities = Record<
  DeveloperCollectionAccessAction,
  boolean
>;

export type DeveloperCollectionAccessSchema = ResourceAccessSchema<
  CollectionAccess,
  DeveloperCollectionAccessAction
>;
