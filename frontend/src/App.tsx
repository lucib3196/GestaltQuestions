import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ComponentPlayGround } from "./features/ComponentPlayGround";
import { CreateNewQuestion } from "./features/CreateNewQuestion";
import DeveloperQuestionLibrary from "./features/DeveloperQuestionLibrary/DeveloperQuestionLibrary";
import { DeveloperWorkspaceLayout } from "./features/DeveloperWorkspace/DeveloperWorkspaceLayout";
import Published from "./features/Published/Published";
import { GeneralQuestionRender } from "./features/Published/Published";
import QuestionEditor from "./features/QuestionEditor/QuestionEditor";
import AppLayout from "./layouts/AppLayout";
import { AccountPage, Home, LoginPage } from "./pages";
import ChatPage from "./pages/ChatPage";
import { RequireRole } from "./services/Auth";
import DeveloperCollections from "./features/DeveloperCollections/DeveloperCollections";
import CollectionView from "./features/DeveloperCollections/CollectionView";
function Test() {
  return <div></div>;
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

            <Route path="/questions" element={<Published />} />
            <Route path="/questions/:qid" element={<GeneralQuestionRender />} />

            <Route path="/test" element={<Test />}></Route>

            {/* Non User Specific */}

            {/* Developer Only Routes */}
            <Route element={<RequireRole allow={["admin", "developer"]} />}>
              <Route
                path="/question_builder"
                element={<DeveloperWorkspaceLayout />}
              >
                <Route
                  path="questions"
                  element={<DeveloperQuestionLibrary />}
                />
                <Route index element={<DeveloperQuestionLibrary />} />
                <Route path="collections" element={<DeveloperCollections />} />
                <Route
                  path="collections/:collectionId"
                  element={<CollectionView />}
                />
                <Route path="questions/new" element={<CreateNewQuestion />} />
                <Route
                  path="questions/:qid/edit"
                  element={<QuestionEditor />}
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
