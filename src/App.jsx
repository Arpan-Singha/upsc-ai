import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import Auth from './pages/Auth';
import Home from './pages/Home';
import AskKalam from './pages/AskKalam';
import CurrentAffairs from './pages/CurrentAffairs';
import CurrentAffairsQuiz from './pages/CurrentAffairsQuiz';
import Practice from './pages/Practice';
import MyLibrary from './pages/MyLibrary';
import Mains from './pages/Mains';
import TestTaker from './pages/TestTaker';
import BookReader from './pages/BookReader';
import MCQPractice from './pages/MCQPractice';
import Progress from './pages/Progress';
import StudyTimer from './components/StudyTimer';
import MotivationalPopup from './components/MotivationalPopup';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <StudyTimer />
        <MotivationalPopup />

        <Routes>
          {/* Admin Routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* User Routes */}
          <Route path="/pyq-test/:id" element={<TestTaker />} />
          <Route path="/read/:id" element={<BookReader />} />
          <Route path="/mcq-practice" element={<MCQPractice />} />
          <Route path="/practice/test/:testId" element={<MCQPractice />} />
          <Route path="/current-affairs/quiz/:id" element={<CurrentAffairsQuiz />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="ask-kalam" element={<AskKalam />} />
            <Route path="current-affairs" element={<CurrentAffairs />} />
            <Route path="progress" element={<Progress />} />
            <Route path="library" element={<MyLibrary />} />
            <Route path="practice/*" element={<Practice />} />
            <Route path="practice/mains" element={<Mains />} />
            <Route path="practice/mcq" element={<MCQPractice />} />

            <Route path="tests" element={<Navigate to="/practice/tests" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;

