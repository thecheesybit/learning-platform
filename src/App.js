// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, setAuthPersistence } from './firebase'; // Import Firebase auth and persistence
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import LiveClassPage from './pages/LiveClassPage';
import RecordedClassesPage from './pages/RecordedClassesPage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BannedUserPage from './pages/BannedUserPage';
import WaitingForApproval from './pages/WaitingForApproval';
import ProtectedRoute from './components/Shared/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoadingScreen from './components/Shared/LoadingScreen'; // Import the LoadingScreen component
import { useLoading } from './context/LoadingContext'; // Import useLoading hook
import './styles/global.css'; // Import global styles
import Shop from './pages/Shop';

const App = () => {
  const { loading } = useLoading(); // Access the loading state
  const [user, setUser] = useState(null); // State to hold the authenticated user
  const [authChecked, setAuthChecked] = useState(false); // State to track if auth check is done

  // Ensure persistence is set on app initialization
  useEffect(() => {
    setAuthPersistence(); // Set persistence to browser local

    // Listen for auth state changes (check if the user is logged in)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update the user state with the authenticated user
      setAuthChecked(true); // Mark auth check as completed
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  if (!authChecked) {
    // Show loading screen while auth is being checked
    return <LoadingScreen />;
  }

  return (
    <>
      {loading && <LoadingScreen />} {/* Conditionally render the LoadingScreen */}
      <Router>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/" /> : <SignUp />} />
          <Route path="/" element={
            <ProtectedRoute user={user}>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/shop" element={
            <ProtectedRoute user={user}>
              <Shop />
            </ProtectedRoute>
          } />
          <Route path="/live-class" element={
            <ProtectedRoute user={user}>
              <LiveClassPage />
            </ProtectedRoute>
          } />
          <Route path="/recorded-classes" element={
            <ProtectedRoute user={user}>
              <RecordedClassesPage />
            </ProtectedRoute>
          } />
          <Route path="/teacher-dashboard" element={
            <ProtectedRoute user={user} role="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student-dashboard" element={
            <ProtectedRoute user={user} role="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute user={user} role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/banned" element={<BannedUserPage />} />
          <Route path="/waiting-for-approval" element={<WaitingForApproval />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
