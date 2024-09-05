import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import './WaitingForApproval.css';
import Image from '../assets/images/login.gif'; // Ensure you have a corresponding CSS file for styling

const WaitingForApproval = () => {
  const navigate = useNavigate();
  const auth = getAuth();

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
    <div className="waiting-for-approval">
      <div className="waiting-for-approval-content">
        <h1>Waiting for Approval</h1>
        <p>Your account is pending approval. Please wait until you are approved to access the content.</p>
        <img src={Image} alt="Waiting for Approval" className="approval-image" />
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
    </div>
  );
};

export default WaitingForApproval;
