import { useAuth } from "../../Auth";
import { useQuestionCollectionStore } from "../instance/store";
import { CollectionsApi } from "../../../services";


export function useCollectionQuestions() {
  const { user } = useAuth();

  const questionCollectionById = useQuestionCollectionStore(
    (s) => s.questionByCollectionId,
  );
  const loadedIds = useQuestionCollectionStore(
    (s) => s.loadedQuestionCollectionIds,
  );

  const errorsByCollectionId = useQuestionCollectionStore(
    (s) => s.questionErrorsByCollectionId,
  );
  const loadingIds = useQuestionCollectionStore(
    (s) => s.loadingQuestionCollectionIds,
  );
  const setLoading = useQuestionCollectionStore(
    (s) => s.setCollectionQuestionsLoading,
  );
  const setLoaded = useQuestionCollectionStore(
    (s) => s.setCollectionQuestionsLoaded,
  );

  // Error
  const setError = useQuestionCollectionStore(
    (s) => s.setCollectionQuestionsError,
  );

  async function ensureQuestionsLoaded(collectionId: string) {
    if (!user) return;


    if (loadedIds.has(collectionId) || loadingIds.has(collectionId)) {
      console.log("Already loaded questions", "returning")
      return;
    }
    setLoading(collectionId);

    try {
      const token = await user.getIdToken();
      const questions = await CollectionsApi.getCollectionQuestions(
        token,
        collectionId,
      );
      setLoaded(collectionId, questions);
    } catch (err) {
      setError(
        collectionId,
        err instanceof Error ? err.message : "Failed to load questions",
      );
    }
  }

  async function refetchQuestions(collectionId: string) {
    if (!user) return;

    setLoading(collectionId);

    try {
      const token = await user.getIdToken();
      const questions = await CollectionsApi.getCollectionQuestions(
        token,
        collectionId,
      );

      setLoaded(collectionId, questions);
    } catch (err) {
      setError(
        collectionId,
        err instanceof Error ? err.message : "Failed to load questions",
      );
    }
  }

  return {
    questionCollectionById,
    loadedIds,
    loadingIds,
    errorsByCollectionId,
    ensureQuestionsLoaded,
    refetchQuestions,
  };
}
