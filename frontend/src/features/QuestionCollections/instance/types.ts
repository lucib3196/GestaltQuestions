import type { ResourceTreeNode } from "../../../components/ResourceTree/type";
import type {
  CollectionId,
  CollectionQuestion,
  QuestionCollection,
  QuestionCollectionRead,
} from "../../../services";

export type QuestionCollectionTreeNode =
  | ResourceTreeNode<"collection", QuestionCollectionRead>
  | ResourceTreeNode<"question", CollectionQuestion>;

export type NormalizedCollections = {
  byId: Record<CollectionId, QuestionCollectionRead>;
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
