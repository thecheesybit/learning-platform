import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import '../../styles/global.css';  // Import global styles

const Navbar = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const user = auth.currentUser;

  React.useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDocRef = doc(getFirestore(), 'user-data', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data());
          }
        } catch (err) {
          console.error('Error fetching user data', err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate('/login');
      })
      .catch((error) => {
        console.error('Logout error', error);
      });
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!userData) {
    return null; // Return null if no user data is loaded
  }

  return (
    <nav className="navbar">
      <ul className="navbar-menu">
        {userData.role === 'admin' && (
          <>
            <li><Link to="/live-class">Live Class</Link></li>
            <li><Link to="/recorded-classes">Recorded Classes</Link></li>
            <li><Link to="/student-dashboard">Student Dashboard</Link></li>
            <li><Link to="/admin-dashboard">Admin Dashboard</Link></li>
          </>
        )}
        {userData.role === 'teacher' && (
          <>
            <li><Link to="/live-class">Live Class</Link></li>
            <li><Link to="/recorded-classes">Recorded Classes</Link></li>
            <li><Link to="/teacher-dashboard">Teacher Dashboard</Link></li>
          </>
        )}
        {userData.role === 'student' && (
          <>
            <li><Link to="/live-class">Live Class</Link></li>
            <li><Link to="/recorded-classes">Recorded Classes</Link></li>
            <li><Link to="/student-dashboard">Student Dashboard</Link></li>
          </>
        )}
        {user && <li><button onClick={handleLogout}>Logout</button></li>}
      </ul>
    </nav>
  );
};

export default Navbar;
