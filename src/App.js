import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Add Navigate import
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import CoursePage from './pages/CoursePage';
import LiveClassPage from './pages/LiveClassPage';
import RecordedClassesPage from './pages/RecordedClassesPage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BannedUserPage from './pages/BannedUserPage';
import WaitingForApproval from './pages/WaitingForApproval'; // Add this page
import ProtectedRoute from './components/Shared/ProtectedRoute';
import HomePage from './pages/HomePage'; // Import protected route
import './styles/global.css'; // Import global styles

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/course" element={
          <ProtectedRoute>
            <CoursePage />
          </ProtectedRoute>
        } />
        <Route path="/live-class" element={
          <ProtectedRoute>
            <LiveClassPage />
          </ProtectedRoute>
        } />
        <Route path="/recorded-classes" element={
          <ProtectedRoute>
            <RecordedClassesPage />
          </ProtectedRoute>
        } />
        <Route path="/teacher-dashboard" element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        <Route path="/student-dashboard" element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin-dashboard" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/banned" element={<BannedUserPage />} />
        <Route path="/waiting-for-approval" element={<WaitingForApproval />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};



export default App;
