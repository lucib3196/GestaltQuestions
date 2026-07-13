import type { QuestionRuntimeLanguage } from "../../services";
import { QuestionInstanceProvider, useQuestionInstance } from "./instance";
import QuestionRenderShell from "./layout/QuestionRenderShell";
import { useRunQuestion } from "./runtime/useQuestionRunTime";

type QuestionRenderProps = {
  qid: string;
  serverSettings: QuestionRuntimeLanguage;
};

function QuestionRenderBody({ qid, serverSettings }: QuestionRenderProps) {
  const refreshKey = useQuestionInstance((s) => s.refreshKey);
  const { qPayload, error, loading } = useRunQuestion(
    qid,
    serverSettings,
    refreshKey,
  );

  if (loading || !qPayload) return <div>Loading</div>;
  if (error) return <div>{String(error)}</div>;

  return <QuestionRenderShell qpayload={qPayload} />;
}

export default function QuestionRender(props: QuestionRenderProps) {
  return (
    <QuestionInstanceProvider>
      <QuestionRenderBody {...props} />
    </QuestionInstanceProvider>
  );
}
