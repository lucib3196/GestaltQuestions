import type { AccessLevel } from "../../../services/Access";
import type { WorkspaceCapabilities } from "./types";

const ACCESS_RANK: Record<AccessLevel, number> = {
  view: 1,
  edit: 2,
  full: 3,
  owner: 4,
};

function hasAtLeast(level: AccessLevel, required: AccessLevel) {
  return ACCESS_RANK[level] >= ACCESS_RANK[required];
}

export function buildQuestionCapabilities(
  level: AccessLevel,
): WorkspaceCapabilities {
  return {
    canView: hasAtLeast(level, "view"),
    canEdit: hasAtLeast(level, "edit"),
    canEditFiles: hasAtLeast(level, "edit"),
    canEditMetadata: hasAtLeast(level, "edit"),
    canDelete: hasAtLeast(level, "full"),
    canManageAccess: level === "owner",
  };
}
