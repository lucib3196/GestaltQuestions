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
import { useRetrieveAccess } from "./features/QuestionAccess/hooks/useRetrieveAccess";
import AccessBadge from "./features/QuestionAccess/components/accessBadge";
import { AccessDetail } from "./features/QuestionAccess/components/AccessDetail";
import { useListSharedByMe } from "./features/QuestionAccess/hooks/useListSharedByMe";
function Test() {
  const qid = "be94cfef-2b76-4f6a-8b44-f3b958d2be45";
  const { access } = useRetrieveAccess(qid);
  const { access: detailRead } = useListSharedByMe(qid);
  if (!access) return;

  console.log("Detail", detailRead);
  return (
    <>
      <AccessBadge level={access.access_level}></AccessBadge>
      {detailRead.map((v) => (
        <AccessDetail details={v} />
      ))}
    </>
  );
}

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

            <Route path="/test" element={<Test />}></Route>

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
