// import { MathJaxContext } from "better-react-mathjax";
// import { ToastContainer } from "react-toastify";

// import NavBar from "./features/NavBar/NavBar";

// /* =========================
//    Context / Providers
// ========================= */

// import { AuthModeProvider } from "./context/AuthMode";
// import QuestionSettingsProvider from "./context/GeneralSettingsContext";
// import CodeEditorProvider from "./features/QuestionEditor/context";
// import { QuestionCollectionProvider } from "./context/QuestionCollectionContext";
// import { QuestionRuntimeProvider } from "./context/QuestionAnswerContext";

// import QuestionEngineProvider from "./features/QuestionEngine/context";
// import CreateQuestionProvider from "./features/CreateQuestion/context";
// import {
//   QuestionCollectionViewProvider,
// } from "./features/QuestionBuilder";
// import { QuestionWorkspaceProvider } from "./features/QuestionWorkspace";
// import { QuestionTableProvider } from "./features/QuestionTable/context";

// /* =========================
//    MathJax Config
// ========================= */
// const config = {
//   loader: {
//     load: ["[tex]/ams"],
//   },
//   tex: {
//     inlineMath: [["$", "$"]],
//     displayMath: [
//       ["$$", "$$"],
//       ["\\[", "\\]"],
//     ],
//     processEscapes: true,
//   },
//   options: {
//     ignoreHtmlClass: "no-mathjax",
//     processHtmlClass: "mathjax-process",
//   },
// };

// function App() {
//   return (
//     <AuthProvider>
//       <QuestionEngineProvider>
//         <CreateQuestionProvider>
//           <QuestionCollectionViewProvider>
//             <QuestionCollectionProvider>
//               <QuestionWorkspaceProvider>
//                 <QuestionTableProvider>
//                   <MathJaxContext version={3} config={config}>
//                     <AuthModeProvider>
//                       <QuestionRuntimeProvider>
//                         <QuestionSettingsProvider>
//                           <QuestionCollectionProvider>
//                             <CodeEditorProvider>
//                               {/* =========================
//                                   Main Content
//                               ========================= */}
//                               <NavBar />
//                               <ToastContainer />

//                               {/* <LecturePage /> */}
//                               {/* <LegacyQuestion /> */}
//                               {/* ========================= */}
//                             </CodeEditorProvider>
//                           </QuestionCollectionProvider>
//                         </QuestionSettingsProvider>
//                       </QuestionRuntimeProvider>
//                     </AuthModeProvider>
//                   </MathJaxContext>
//                 </QuestionTableProvider>
//               </QuestionWorkspaceProvider>
//             </QuestionCollectionProvider>
//           </QuestionCollectionViewProvider>
//         </CreateQuestionProvider>
//       </QuestionEngineProvider>
//     </AuthProvider>
//   );
// }

import { BrowserRouter, Routes, Navigate, Route } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import { Home, QuestionBuilder } from "./pages";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/question_builder" element={<QuestionBuilder />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
export default App;
