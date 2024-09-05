import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut, deleteUser } from 'firebase/auth';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';
import './WaitingForApproval.css';
import Image from '../assets/images/login.gif'; // Ensure you have the correct image path

const WaitingForApproval = () => {
  const [isChecked, setIsChecked] = useState(false); // For checkbox
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore(); // Initialize Firestore

  // Function to handle logout
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate('/login'); // Redirect to login page after logout
      })
      .catch((error) => {
        console.error('Logout error', error);
      });
  };

  // Function to handle de-registration (deleting user from Firebase and Firestore)
  const handleDeRegister = async () => {
    if (window.confirm('Are you sure you want to de-register? This action cannot be undone.')) {
      const user = auth.currentUser;
      if (user) {
        try {
          // Delete user record from Firestore
          const userDocRef = doc(db, 'user-data', user.uid); // Assumes Firestore collection name is 'user-data'
          await deleteDoc(userDocRef);

          // Delete user from Firebase Authentication
          await deleteUser(user);
          console.log('User de-registered successfully.');

          // Redirect to login page after de-registration
          navigate('/login');
        } catch (error) {
          console.error('De-registration error', error);
        }
      }
    }
  };

  return (
    <div className="waiting-for-approval">
      <div className="waiting-for-approval-content">
        <h1>Waiting for Approval</h1>
        <p>Your account is pending approval. Please wait until you are approved to access the content.</p>
        <img src={Image} alt="Waiting for Approval" className="approval-image" />
        <button onClick={handleLogout} className="logout-button">Logout</button>

        <div className="de-register-section">
          <p className="de-register-note">
            To de-register from this website, please check the box
            <input
              type="checkbox"
              className="de-register-checkbox"
              checked={isChecked}
              onChange={() => setIsChecked(!isChecked)}
            />
          </p>
          <button
            className={`de-register-button ${isChecked ? 'active' : ''}`}
            onClick={isChecked ? handleDeRegister : null}
            disabled={!isChecked}
          >
            De-Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitingForApproval;
