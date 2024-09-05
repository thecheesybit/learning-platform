import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const ProtectedRoute = ({ children, role }) => {
  const auth = getAuth();
  const [userData, setUserData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkUser = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = doc(getFirestore(), 'user-data', auth.currentUser.uid);
          const docSnap = await getDoc(userDoc);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserData(userData);
          } else {
            setUserData({ banned: true });
          }
        } catch (err) {
          console.error('Error fetching user data', err);
          setUserData({ banned: true });
        }
      } else {
        setUserData({ unauthenticated: true });
      }
      setLoading(false);
    };

    checkUser();
  }, [auth.currentUser]);

  if (loading) return <p>Loading...</p>;

  if (userData?.banned) {
    return <Navigate to="/banned" />;
  }

  if (userData?.approved === false) {
    return <Navigate to="/waiting-for-approval" />;
  }

  if (role && userData?.role !== role && userData?.role !== 'admin') {
    return <Navigate to="/" />;
  }
  

  if (userData?.unauthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
