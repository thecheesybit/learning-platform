import React from 'react';
import './LoadingScreen.css'; // Add styles here
import loadingImage from '../../assets/images/loading.gif'; // Import image

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <img src={loadingImage} alt="Loading" />
      </div>
    </div>
  );
};

export default LoadingScreen;
