import { useState } from "react";
import { CollectionsApi } from "../../../services";
import type { CollectionId } from "../../../services";
import { useAuth } from "../../Auth";
import { useQuestionCollectionStore } from "../instance/store";

export function useCollectionQuestions() {
  const { user } = useAuth();
  const [fetchQuestionsError, setFetchQuestionsError] = useState<string | null>(
    null,
  );

  const loadedQuestionCollectionIds = useQuestionCollectionStore(
    (s) => s.loadedQCollectionIds,
  );
  const loadingQuestionCollectionIds = useQuestionCollectionStore(
    (s) => s.loadingQCollectionIds,
  );
  const setLoadingQuestionCollectionId = useQuestionCollectionStore(
    (s) => s.setLoadingQCollectionIds,
  );
  const setLoadedQuestionCollectionId = useQuestionCollectionStore(
    (s) => s.setLoadedQCollectionIds,
  );
  const clearLoadingQuestionCollectionId = useQuestionCollectionStore(
    (s) => s.clearLoadingQCollectionIds,
  );
  const questionsByCollectionId = useQuestionCollectionStore(
    (s) => s.qByCollectionIds,
  );

  const isFetchingQuestions = loadingQuestionCollectionIds.size > 0;

  function isLoadingQuestionsForCollection(collectionId: CollectionId) {
    return loadingQuestionCollectionIds.has(collectionId);
  }

  async function ensureQuestionsLoaded(collectionId: CollectionId) {
    if (!user) return;

    if (
      loadedQuestionCollectionIds.has(collectionId) ||
      loadingQuestionCollectionIds.has(collectionId)
    ) {
      return;
    }

    setFetchQuestionsError(null);
    setLoadingQuestionCollectionId(collectionId);

    try {
      const token = await user.getIdToken();
      const questions = await CollectionsApi.getCollectionQuestions(
        token,
        collectionId,
      );
      setLoadedQuestionCollectionId(collectionId, questions);
    } catch (err) {
      clearLoadingQuestionCollectionId(collectionId);
      setFetchQuestionsError(
        err instanceof Error ? err.message : "Failed to load questions",
      );
    }
  }

  async function refetchQuestions(collectionId: CollectionId) {
    if (!user) return;

    setFetchQuestionsError(null);
    setLoadingQuestionCollectionId(collectionId);

    try {
      const token = await user.getIdToken();
      const questions = await CollectionsApi.getCollectionQuestions(
        token,
        collectionId,
      );

      setLoadedQuestionCollectionId(collectionId, questions);
    } catch (err) {
      clearLoadingQuestionCollectionId(collectionId);
      setFetchQuestionsError(
        err instanceof Error ? err.message : "Failed to load questions",
      );
    }
  }

  return {
    questionsByCollectionId,
    isFetchingQuestions,
    fetchQuestionsError,
    isLoadingQuestionsForCollection,
    ensureQuestionsLoaded,
    refetchQuestions,
  };
}
