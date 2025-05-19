import { Route, Routes } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import TestEdit from "./pages/TestEdit";
import TeacherClassDetails from "./pages/TeacherClassDetails";
import ScrollToTop from "./utils/ScrollToTop";
import Room from "./pages/Room";
import MainExam from "./pages/MainExam";
import Library from "./components/Library";
import MyClasses from "./pages/MyClasses";
import TestHistory from "./pages/TestHistory";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ProtectedLayout from "./utils/ProtectedLayout";
import ResetPassword from "./components/ResetPassword";
import SideBar from "./components/SideBar";
import StudentClassDetails from "./pages/StudentClassDetails";
import { ToastContainer } from "react-toastify";
import MySubmission from "./pages/MySubmission";
import SignUp from "./pages/Auth/SignUp";
import Login from "./pages/Auth/Login";
import SubmissionDetails from "./pages/SubmissionDetails";
import TestWaitingRoom from "./components/TestWaitingRoom";
import CreateQuestion from "./pages/CreateQuestion";
import QuestionTypeChoosing from "./components/QuestionTypeChoosing";
import GenerateQuestionsAI from "./components/GenerateQuestionsAI";
import TestHistoryDetails from "./pages/TestHistoryDetails";

const App = () => {
  return (
    <div>
      <ToastContainer />
      <ScrollToTop />
      <Routes>
        {/* Routes không cần đăng nhập */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password/:id/:token" element={<ResetPassword />} />
        <Route path="/test" element={<SideBar />} />
        {/* Routes cần đăng nhập, bọc trong ProtectedLayout */}
        <Route element={<ProtectedLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/home/library" element={<Library />} />
          <Route path="/home/my_classes" element={<MyClasses />} />
          <Route path="/home/test_history" element={<TestHistory />} />
          <Route
            path="/home/test_history/:testHistoryId"
            element={<TestHistoryDetails />}
          />

          <Route path="/home/my_submission" element={<MySubmission />} />
          <Route path="/tests/:testId" element={<TestEdit />} />
          <Route
            path="/teacher_class/:classId"
            element={<TeacherClassDetails />}
          />
          <Route
            path="/student_class/:classId"
            element={<StudentClassDetails />}
          />
          <Route path="/room/:roomID" element={<Room />} />
          <Route path="/my_profile" element={<Profile />} />
          <Route path="/setting" element={<Settings />} />
          {/* Join room */}
          <Route path="/waiting_room" element={<TestWaitingRoom />} />
          <Route path="/main_exam" element={<MainExam />} />
          <Route
            path="/question_type_choosing"
            element={<QuestionTypeChoosing />}
          />
          <Route path="/generate-question" element={<GenerateQuestionsAI />} />
          <Route path="/create-question" element={<CreateQuestion />} />
          <Route path="/create-question/:testId" element={<CreateQuestion />} />
          <Route
            path="/update-question/:questionId/:testId"
            element={<CreateQuestion />}
          />
          {/* Submissions */}
          <Route
            path="/submission-details/:submissionId"
            element={<SubmissionDetails />}
          />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
