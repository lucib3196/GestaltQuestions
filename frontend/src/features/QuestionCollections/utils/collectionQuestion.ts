import type {
  CollectionId,
  CollectionQuestion,
  QuestionCollection,
} from "../../../services";
import type { QuestionCollectionTreeNode } from "../instance/types";

export function toCollectionTreeNode(
  collection: QuestionCollection,
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
