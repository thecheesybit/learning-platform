import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import CoursePage from './pages/CoursePage';
import LiveClassPage from './pages/LiveClassPage';
import RecordedClassesPage from './pages/RecordedClassesPage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Navbar from './components/Shared/Navbar';
import NotFound from './pages/NotFound';
import './styles/global.css';  // Import global styles

const App = () => {
  return (
    <Router>
      <Home />
    </Router>
  );
};

// Home component to handle Navbar visibility and routing
const Home = () => {
  const location = useLocation();
  const [hideNavbar, setHideNavbar] = React.useState(false);

  React.useEffect(() => {
    if (location.pathname === '/404') {
      setHideNavbar(true);
      const timer = setTimeout(() => {
        setHideNavbar(false);
        window.location.href = '/'; // Redirect to home after 5 seconds
      }, 5000);
      return () => clearTimeout(timer); // Clean up timeout on unmount
    } else {
      setHideNavbar(false);
    }
  }, [location.pathname]);

  return (
    <div className={hideNavbar ? 'hide-navbar' : ''}>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/course" element={<CoursePage />} />
        <Route path="/live-class" element={<LiveClassPage />} />
        <Route path="/recorded-classes" element={<RecordedClassesPage />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

// Dummy HomePage component for demonstration
const HomePage = () => <div>Home Page</div>;

export default App;
