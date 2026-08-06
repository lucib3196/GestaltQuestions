export type ResourceTreeNode<TKind extends string = string, TData = unknown> = {
  id: string; // globally unique UI id, e.g. "collection:abc"
  kind: TKind; // "collection" | "question" | "asset"
  label: string; // Default display name
  data?: TData; // original object
  children: ResourceTreeNode[];
  depth?: number;
};
