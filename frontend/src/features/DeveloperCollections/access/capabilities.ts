import type { AccessLevel } from "../../../services/Access";
import type { DeveloperCollectionCapabilities } from "./types";

const ACCESS_RANK: Record<AccessLevel, number> = {
  view: 1,
  edit: 2,
  full: 3,
  owner: 4,
};

function hasAtLeast(level: AccessLevel, required: AccessLevel) {
  return ACCESS_RANK[level] >= ACCESS_RANK[required];
}

export function buildCollectionCapabilities(
  level: AccessLevel,
): DeveloperCollectionCapabilities {
  return {
    canView: hasAtLeast(level, "view"),
    canAddQuestions: hasAtLeast(level, "edit"),
    canRemoveQuestions: hasAtLeast(level, "edit"),
    canUpdate: hasAtLeast(level, "full"),
    canCreateChild: hasAtLeast(level, "full"),
    canDelete: level === "owner",
    canManageAccess: level === "owner",
  };
}
