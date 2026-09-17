import type { QuestionCollection } from "../../services";


export function getQuestionCount(collection: QuestionCollection) {
  if ("question_ids" in collection && Array.isArray(collection.question_ids)) {
    return collection.question_ids.length;
  }

  return 0;
}