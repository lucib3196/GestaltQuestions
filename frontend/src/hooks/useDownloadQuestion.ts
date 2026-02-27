import { useQuestionCollectionContext } from "./../context/QuestionCollectionContext";
import { QuestionAPI } from "../services";
import { downloadZip } from "../utils/downloadUtils";
import { toast } from "react-toastify";

export function useDownloadQuestion() {
  const { selectedQuestions } = useQuestionCollectionContext();

  const handleQuestionDownloads = async () => {
    try {
      const requests = selectedQuestions.map((qId) =>
        QuestionAPI.downloadQuestion(qId),
      );
      const responses = await Promise.all(requests);
      responses.forEach((r) => downloadZip(r.blob, r.header));
      toast.success(
        selectedQuestions.length === 1
          ? "Question downloaded successfully."
          : `${selectedQuestions.length} questions downloaded successfully.`,
      );
    } catch (error) {
      console.error("Failed to download question(s):", error);
      toast.error(
        selectedQuestions.length === 1
          ? "Failed to download question."
          : "Failed to download one or more questions.",
      );
    }
  };

  return { handleQuestionDownloads };
}
