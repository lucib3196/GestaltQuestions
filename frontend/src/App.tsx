import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { RequireRole } from "./features/Auth";
import { ComponentPlayGround } from "./features/ComponentPlayGround";
import { CreateNewQuestion } from "./features/CreateNewQuestion";
import PublishedQuestions from "./features/PublishedQuestions/PublishedQuestions";
import { GeneralQuestionRender } from "./features/PublishedQuestions/PublishedQuestions";
import { WorkspaceLinks } from "./features/QuestionBuilderWorkspace/links/WorkspaceLinks";
import QuestionBuilderWorkspace from "./features/QuestionBuilderWorkspace/QuestionBuilderWorkspace";
import QuestionWorkspace from "./features/QuestionWorkspace/QuestionWorkspace";
import AppLayout from "./layouts/AppLayout";
import { AccountPage, Home, LoginPage } from "./pages";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/account" element={<AccountPage />} />

            <Route path="/questions" element={<PublishedQuestions />} />
            <Route path="/questions/:qid" element={<GeneralQuestionRender />} />

            {/* <Route path="/test" element={<Test />}></Route> */}

            {/* Non User Specific */}

            {/* Developer Only Routes */}
            <Route element={<RequireRole allow={["admin", "developer"]} />}>
              <Route path="/question_builder" element={<WorkspaceLinks />}>
                <Route
                  path="questions"
                  element={<QuestionBuilderWorkspace />}
                />
                <Route index element={<QuestionBuilderWorkspace />} />
                <Route path="questions/new" element={<CreateNewQuestion />} />
                <Route
                  path="questions/:qid/edit"
                  element={<QuestionWorkspace />}
                />
                <Route path="playground" element={<ComponentPlayGround />} />
                <Route path="chat" element={<ChatPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
export default App;
