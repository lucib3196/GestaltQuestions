import type { ResourceTreeNode } from "../../../components/ResourceTree/type";
import type {
  CollectionId,
  CollectionQuestion,
  QuestionCollectionRead,
} from "../../../services/Collections/types";

export type QuestionCollectionTreeNode =
  | ResourceTreeNode<"collection", QuestionCollectionRead>
  | ResourceTreeNode<"question", CollectionQuestion>;

export function toCollectionTreeNode(
  collection: QuestionCollectionRead,
  depth?: number,
): QuestionCollectionTreeNode {
  return {
    id: `collection:${collection.id}`,
    kind: "collection",
    label: collection.title,
    data: collection,
    children: [],
    depth: depth ?? 0,
  };
}

export function toQuestionTreeNode(
  collectionId: CollectionId,
  question: CollectionQuestion,
  depth?: number,
): QuestionCollectionTreeNode {
  return {
    id: `${collectionId}-question:${question.id}`,
    kind: "question",
    label: question.title ?? "Untitled-Questions",
    data: question,
    children: [],
    depth: depth ?? 0,
  };
}
