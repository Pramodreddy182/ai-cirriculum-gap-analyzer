import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import GapAnalysis from './pages/GapAnalysis';
import StudentReport from './pages/StudentReport';
import CourseSuggestions from './pages/CourseSuggestions';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="gap-analysis" element={<GapAnalysis />} />
          <Route path="student-report" element={<StudentReport />} />
          <Route path="course-suggestions" element={<CourseSuggestions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
