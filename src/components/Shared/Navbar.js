import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/signup">Sign Up</Link></li>
        <li><Link to="/live-class">Live Class</Link></li>
        <li><Link to="/recorded-classes">Recorded Classes</Link></li>
        <li><Link to="/teacher-dashboard">Teacher Dashboard</Link></li>
        <li><Link to="/student-dashboard">Student Dashboard</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
