// import { type FormEvent, useState } from "react";
// import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

// import { Button } from "../../components/Button";
// import { Error } from "../../components/Error";


// import QuestionHTMLToReact from "./render/QuestionHtmlToReact";
// import { DisplayAnswers, QuestionHeader } from "./ui";
// import { useRunQuestion } from "./instance";
import { QuestionInstanceProvider, useQuestionInstance } from "./instance";
import { useRunQuestion } from "./runtime/useQuestionRunTime";
import QuestionBody from "./question/QuestionBody";
import type { QuestionRuntimeLanguage } from "../../services";
import QuestionHTMLToReact from "./render/QuestionHtmlToReact";
import DisplayAnswers from "./question/QuestionFeedback";
type QuestionRenderProps = {
  qid: string;
  serverSettings: QuestionRuntimeLanguage;
};

function QuestionRenderBody({ qid, serverSettings }: QuestionRenderProps) {
  const refreshKey = useQuestionInstance((s) => s.refreshKey);
  const { qPayload, error, loading } = useRunQuestion(
    qid,
    serverSettings,
    refreshKey
  );

  if (loading || !qPayload) return <div>Loading</div>;

  return <QuestionBody qpayload={qPayload} />;
}

// function QuestionRenderBody({ qid, serverSettings }: QuestionRenderProps) {

//   const [showSolution, setShowSolution] = useState<boolean>(false);



//   const { qPayload, error, loading } = useRunQuestion(qid, serverSettings,);

//   console.log("The question payload", qPayload)


//   const qhtml = useQuestionInstance((s) => s.questionHtml);
//   const shtml = useQuestionInstance(
//     (s) => s.solutionHtml ?? "No Solution Available for Question",
//   );
//   const quizData = useQuestionInstance((s) => s.quizData);
//   const qmeta = useQuestionInstance((s) => s.questionMeta);
//   const answers = useQuestionInstance((s) => s.answers);
//   const resetAll = useQuestionInstance((s) => s.resetAll);
//   const isSubmitted = useQuestionInstance((s) => s.hasSubmitted);
//   const submit = useQuestionInstance((s) => s.submitAnswers);

//   if (error) {
//     return <Error error={error} variant="codeExecution" />;
//   }

//   const handleSubmit = (e: FormEvent) => {
//     e.preventDefault();
//     submit();
//   };
//   // const handleGenerateVariant = () => {
//   //   setRefreshKey((prev) => prev + 1);
//   //   resetAll();
//   // };

//   if (loading) {
//     return <div>Loading</div>;
//   }

//   return (
//     <div className="space-y-4">
//       <QuestionHeader qdata={qmeta} />

//       <PanelGroup direction="horizontal" className="w-full gap-3">
//         <Panel
//           order={1}
//           defaultSize={200}
//           minSize={25}
//           className="rounded-lg border border-border bg-surface p-4"
//         >
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="text-text">
//               <QuestionHTMLToReact html={qhtml} />
//             </div>

//             <div className="flex flex-wrap gap-2">
//               <Button type="submit" name="Submit" color="submitQuestion" />
//               {/* <Button
//                 type="button"
//                 onClick={handleGenerateVariant}
//                 name="Generate Variant"
//                 color="generateVariant"
//               /> */}
//               <Button
//                 type="button"
//                 onClick={() => setShowSolution((prev) => !prev)}
//                 name={showSolution ? "Hide Solution" : "Show Solution"}
//                 color="showSolution"
//               />
//             </div>
//           </form>
//           {isSubmitted && (
//             <DisplayAnswers quizData={quizData} submittedAnswer={answers} />
//           )}
//         </Panel>

//         {showSolution && (
//           <>
//             <PanelResizeHandle className="w-2 rounded-sm bg-border hover:bg-border-strong transition-colors duration-200 cursor-col-resize" />
//             <Panel
//               order={2}
//               defaultSize={200}
//               minSize={25}
//               className="rounded-lg border border-border bg-surface p-4"
//             >
//               <div className="text-text">
//                 <QuestionHTMLToReact html={shtml} />
//               </div>
//             </Panel>
//           </>
//         )}
//       </PanelGroup>
//     </div>
//   );
// }

export default function QuestionRender(props: QuestionRenderProps) {
  return (
    <QuestionInstanceProvider>
      <QuestionRenderBody {...props} />
    </QuestionInstanceProvider>
  );
}
