import React from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './BannedUserPage.css'; // Assuming you have a specific CSS file for styling
import bannedImage from '../assets/images/bannedUser.gif'; // Replace with the correct image path

const BannedUserPage = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate('/login'); // Redirect to login page after logout
      })
      .catch((error) => {
        console.error('Error logging out: ', error);
      });
  };

  return (
    <div className="banned-container">
      <h2>You are banned. Contact the admin.</h2>
      <img src={bannedImage} alt="Banned user" className="banned-image" />
      <button className="small-logout-button" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default BannedUserPage;
