import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import '../../styles/global.css';  // Import global styles

const Navbar = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate('/login'); // Redirect to login page after logout
      })
      .catch((error) => {
        console.error('Logout error', error);
      });
  };

  return (
    <nav className="navbar">
      <ul className="navbar-menu">
        {!user && <li><Link to="/">Home</Link></li>}
        {!user ? (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
          </>
        ) : (
          <>
            <li><Link to="/live-class">Live Class</Link></li>
            <li><Link to="/recorded-classes">Recorded Classes</Link></li>
            <li><Link to="/teacher-dashboard">Teacher Dashboard</Link></li>
            <li><Link to="/student-dashboard">Student Dashboard</Link></li>
            <li><button onClick={handleLogout}>Logout</button></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
