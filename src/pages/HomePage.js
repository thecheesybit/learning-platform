// src/pages/HomePage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import Navbar from '../components/Shared/Navbar';
import WaitingForApproval from './WaitingForApproval';
import BannedUserPage from './BannedUserPage';

const HomePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDoc = doc(db, 'user-data', auth.currentUser.uid);
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);

          if (data.banned) {
            navigate('/banned');
          } else if (!data.approved) {
            navigate('/waiting-for-approval');
          }
        } else {
          navigate('/login');
        }
      } else {
        navigate('/login');
      }

      setLoading(false);
    };

    fetchUserData();
  }, [auth.currentUser, db, navigate]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <Navbar />
      <h1>Welcome to the Home Page</h1>
    </div>
  );
};

export default HomePage;
