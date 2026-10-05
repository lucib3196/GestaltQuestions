import type { QuestionAccess } from "../../../services/Access";
import type { ResourceAccessSchema } from "../../../stores/resourceAccess";

export type QuestionEditorAccessAction =
  | "canView"
  | "canEdit"
  | "canEditFiles"
  | "canEditMetadata"
  | "canDelete"
  | "canManageAccess";

export type QuestionEditorCapabilities = {
  canView: boolean;
  canEdit: boolean;
  canEditFiles: boolean;
  canEditMetadata: boolean;
  canDelete: boolean;
  canManageAccess: boolean;
};

export type QuestionEditorAccessSchema = ResourceAccessSchema<
  QuestionAccess,
  QuestionEditorAccessAction
>;
