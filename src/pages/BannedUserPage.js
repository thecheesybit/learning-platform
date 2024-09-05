import React, { useState } from 'react';
import { getAuth, signOut, deleteUser } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './BannedUserPage.css'; // Ensure you have a specific CSS file for styling
import bannedImage from '../assets/images/bannedUser.gif'; // Replace with the correct image path

const BannedUserPage = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
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

  const handleDeRegister = () => {
    if (window.confirm('Are you sure you want to de-register? This action cannot be undone.')) {
      const user = auth.currentUser;
      if (user) {
        deleteUser(user)
          .then(() => {
            console.log('User de-registered successfully.');
            navigate('/login'); // Redirect to login page after de-registration
          })
          .catch((error) => {
            console.error('De-registration error', error);
          });
      }
    }
  };

  return (
    <div className="banned-container">
      <h2>You are banned. Contact the admin.</h2>
      <img src={bannedImage} alt="Banned user" className="banned-image" />
      <button className="small-logout-button" onClick={handleLogout}>Logout</button>
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
  );
};

export default BannedUserPage;
