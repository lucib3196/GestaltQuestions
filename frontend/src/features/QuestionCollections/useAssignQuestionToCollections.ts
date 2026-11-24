import axios from "axios";

import { useAuth } from "../../services/Auth";
import CollectionsApi from "../../services/Collections/api";

export function useAssignQuestionToCollections() {
  const { user } = useAuth();

  async function assignQuestionToCollections(
    questionId: string,
    collectionIds: string[],
  ): Promise<string[]> {
    if (collectionIds.length === 0) return [];
    if (!user) return collectionIds;

    let token: string;
    try {
      token = await user.getIdToken();
    } catch {
      return collectionIds;
    }

    const results = await Promise.allSettled(
      collectionIds.map(async (collectionId) => {
        try {
          await CollectionsApi.addQuestionToCollection(
            token,
            collectionId,
            questionId,
          );
        } catch (error) {
          // This endpoint returns 409 only when the membership already exists.
          if (!axios.isAxiosError(error) || error.response?.status !== 409) {
            throw error;
          }
        }
      }),
    );

    return collectionIds.filter(
      (_, index) => results[index].status === "rejected",
    );
  }

  return assignQuestionToCollections;
}
