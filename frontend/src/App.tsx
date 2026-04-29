import { BrowserRouter, Routes, Navigate, Route, } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import { Home, QuestionBuilder, Questions, LoginPage, AccountPage, EditQuestionPage } from "./pages";
import { RequireRole } from "./features/Auth";
import { QuestionsListPage, NewQuestion, QuestionBuilderPlaygroundPage } from "./pages/QuestionBuilder";


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/account" element={<AccountPage />} />

            <Route path="/questions" element={<Questions />} />
            <Route path="*" element={<Navigate to="/" replace />} />

            {/* Developer Only Routes */}
            <Route element={<RequireRole allow={["admin", "developer"]} />}>
              <Route path="/question_builder" element={<QuestionBuilder />}>
                <Route index element={<QuestionsListPage />} />
                <Route path="questions" element={<QuestionsListPage />} />
                <Route path="questions/new" element={<NewQuestion />} />
                <Route path="questions/:qid/edit" element={<EditQuestionPage />} />
                <Route path="playground" element={<QuestionBuilderPlaygroundPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
export default App;
