import type { CollectionView } from "./types";

export const COLLECTION_VIEW_OPTIONS = [
  { id: "myCollections", label: "My collections" },
  { id: "sharedWithMe", label: "Shared with me" },
  { id: "publicCollections", label: "Public collections" },
] as const satisfies readonly { id: CollectionView; label: string }[];
