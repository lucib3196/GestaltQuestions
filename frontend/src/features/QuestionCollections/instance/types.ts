import type {
  CollectionId,
  CollectionQuestion,
  QuestionCollection,
} from "../../../services";
import type { ResourceTreeNode } from "../../../components/ResourceTree/type";

export type QuestionCollectionTreeNode =
  | ResourceTreeNode<"collection", QuestionCollection>
  | ResourceTreeNode<"question", CollectionQuestion>;

export type NormalizedCollections = {
  byId: Record<CollectionId, QuestionCollection>;
  rootIds: CollectionId[];

  childIdsByParentId: Record<CollectionId, CollectionId[]>;
};

export type CollectionTreeNode = QuestionCollection & {
  children: CollectionTreeNode[];
};

export type QuestionsByCollectionId = Record<
  CollectionId,
  CollectionQuestion[]
>;
export type CollectionQuestionCacheState = {
  questionByCollectionId: QuestionsByCollectionId;
  loadedCollectionIds: Set<CollectionId>;
  loadingCollectionIds: Set<CollectionId>;
  errorsByCollectionIds: Record<CollectionId, string>;
};
