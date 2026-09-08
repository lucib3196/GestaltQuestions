import type { QuestionAccess } from "../../../services/Access/QuestionAccess";
import type { ResourceAccessSchema } from "../../../stores/resourceAccess";

export type QuestionWorkspaceAccessAction =
  | "canView"
  | "canEdit"
  | "canEditFiles"
  | "canEditMetadata"
  | "canDelete"
  | "canManageAccess";

export type WorkspaceCapabilities = {
  canView: boolean;
  canEdit: boolean;
  canEditFiles: boolean;
  canEditMetadata: boolean;
  canDelete: boolean;
  canManageAccess: boolean;
};

export type QuestionWorkspaceAccessSchema = ResourceAccessSchema<
  QuestionAccess,
  QuestionWorkspaceAccessAction
>;
